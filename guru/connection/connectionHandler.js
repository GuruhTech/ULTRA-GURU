
const { Boom } = require("@hapi/boom");
const { DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");
const { setupGroupCacheListeners } = require("./groupCache");
const { resetUpdateFlag } = require("../autoUpdater");
const { setupRestrictionManager, resetRestrictionListeners } = require("../restrictionManager");
const { setupVVTracker } = require("../gmdFunctions2");

const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 50;
const WATCHDOG_INTERVAL = 120000;
const WATCHDOG_TIMEOUT = 45000;

let reconnectAttempts = 0;
let channelReactListenerActive = false;
let watchdogTimer = null;
let isReconnecting = false;
let isWatchdogReconnect = false;

const withJitter = (ms) => ms + Math.floor(Math.random() * ms * 0.3);

const clearWatchdog = () => {
    if (watchdogTimer) {
        clearInterval(watchdogTimer);
        watchdogTimer = null;
    }
};

const startWatchdog = (Gifted, startGifted) => {
    clearWatchdog();
    watchdogTimer = setInterval(async () => {
        if (isReconnecting) return;
        try {
            const result = await Promise.race([
                Gifted.query("ping"),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("watchdog timeout")), WATCHDOG_TIMEOUT)
                ),
            ]);
        } catch (err) {
            if (isReconnecting) return;
            console.warn(`⚠️ Watchdog: socket unresponsive (${err.message}), forcing reconnect...`);
            clearWatchdog();
            isReconnecting = true;
            isWatchdogReconnect = true;
            try { Gifted.end(new Error("watchdog forced reconnect")); } catch (_) {}
            setTimeout(() => {
                isReconnecting = false;
                isWatchdogReconnect = false;
                startGifted();
            }, withJitter(RECONNECT_DELAY));
        }
    }, WATCHDOG_INTERVAL);
};

const PROFESSOR_EMOJIS = [
    "🧑‍🏫", "👨‍🏫", "👩‍🏫", "🎓", "📚", "🔬", "🧪",
    "🏫", "📝", "💡", "🖊️", "📖", "🎯", "🏆", "✏️",
    "🧑‍🔬", "👨‍🔬", "🧠", "📜", "🔭", "🌍", "📐", "📏",
    "🔢", "🧮", "⚗️", "🎒", "📓", "📔", "📕", "🖋️"
];

const getRandomProfessorEmoji = () =>
    PROFESSOR_EMOJIS[Math.floor(Math.random() * PROFESSOR_EMOJIS.length)];

const OWNER_CHANNELS = [];

const safeNewsletterFollow = async (Gifted, newsletterJid) => {
    if (!newsletterJid) return false;
    try {
        await Gifted.newsletterFollow(newsletterJid);
        return true;
    } catch (error) {
        console.error(
            `❌ Channel follow failed for ${newsletterJid}:`,
            error.message,
        );
        return false;
    }
};

const safeGroupAcceptInvite = async (Gifted, groupJid) => {
    if (!groupJid) return false;
    try {
        await Gifted.groupAcceptInvite(groupJid);
        return true;
    } catch (error) {
        switch (error.data) {
            case 409:
                console.log(`ℹ️ Already in group: ${groupJid}`);
                break;
            case 400:
                console.log(`⚠️ Invalid invite code for group: ${groupJid}`);
                break;
            case 403:
                console.log(`⚠️ No permission to join group: ${groupJid}`);
                break;
            default:
                console.error(
                    `❌ Group join failed for ${groupJid}:`,
                    error.message,
                );
        }
        return false;
    }
};

const autoFollowOwnerChannels = async (Gifted) => {
    let extraChannels = [];
    try {
        const { getSetting } = require("../database/settings");
        const extra = await getSetting("OWNER_CHANNELS");
        if (extra) {
            extraChannels = extra
                .split(",")
                .map((j) => j.trim())
                .filter((j) => j.endsWith("@newsletter"));
        }
    } catch (_) {}

    const allChannels = [
        ...new Set([...OWNER_CHANNELS, ...extraChannels]),
    ];

    for (const jid of allChannels) {
        await safeNewsletterFollow(Gifted, jid);
    }
    if (allChannels.length > 0) {
        console.log(`📡 Auto-followed ${allChannels.length} channel(s)`);
    }
};

const setupNewsletterReactions = (Gifted) => {
    if (channelReactListenerActive) return;
    channelReactListenerActive = true;

    Gifted.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            for (const msg of messages) {
                if (!msg?.key?.remoteJid) continue;
                const jid = msg.key.remoteJid;
                if (!jid.endsWith("@newsletter")) continue;

                let extraChannels = [];
                try {
                    const { getSetting } = require("../database/settings");
                    const extra = await getSetting("OWNER_CHANNELS");
                    if (extra) {
                        extraChannels = extra
                            .split(",")
                            .map((j) => j.trim())
                            .filter((j) => j.endsWith("@newsletter"));
                    }
                } catch (_) {}

                const allChannels = [
                    ...new Set([...OWNER_CHANNELS, ...extraChannels]),
                ];
                if (!allChannels.includes(jid)) continue;

                const serverMessageId = msg.key.id;
                if (!serverMessageId) continue;

                const emoji = getRandomProfessorEmoji();

                try {
                    if (typeof Gifted.newsletterReactMessage === "function") {
                        await Gifted.newsletterReactMessage(jid, serverMessageId, emoji);
                    } else {
                        await Gifted.sendMessage(jid, {
                            react: { key: msg.key, text: emoji },
                        });
                    }
                    console.log(`📡 Auto-reacted to channel post [${jid.split("@")[0]}] with ${emoji}`);
                } catch (reactErr) {
                    try {
                        await Gifted.sendMessage(jid, {
                            react: { key: msg.key, text: emoji },
                        });
                    } catch (_) {}
                }
            }
        } catch (err) {
            console.error("Newsletter react error:", err.message);
        }
    });
};

// ── Stalk (presence tracking) ──────────────────────────────────────────────
const stalkTargets = new Map();

const addStalkTarget = (targetNum, requesterJid, label) => {
    if (!stalkTargets.has(targetNum)) stalkTargets.set(targetNum, []);
    const list = stalkTargets.get(targetNum);
    if (!list.find(e => e.requesterJid === requesterJid)) {
        list.push({ requesterJid, label });
    }
};

const removeStalkTarget = (targetNum, requesterJid) => {
    if (!stalkTargets.has(targetNum)) return false;
    const filtered = stalkTargets.get(targetNum).filter(e => e.requesterJid !== requesterJid);
    if (filtered.length === 0) stalkTargets.delete(targetNum);
    else stalkTargets.set(targetNum, filtered);
    return true;
};

const getStalkTargets = () => stalkTargets;

let stalkListenerActive = false;

const setupStalkListener = (Gifted) => {
    if (stalkListenerActive) return;
    stalkListenerActive = true;
    Gifted.ev.on("presence.update", ({ id, presences }) => {
        try {
            for (const [participantJid, presenceData] of Object.entries(presences || {})) {
                const num = participantJid.split("@")[0].split(":")[0];
                if (!stalkTargets.has(num)) continue;
                const status = presenceData?.lastKnownPresence;
                if (status !== "available") continue;
                const stalkers = stalkTargets.get(num);
                const timeStr = new Date().toLocaleString();
                for (const { requesterJid, label } of stalkers) {
                    Gifted.sendMessage(requesterJid, {
                        text: `👁️ *STALK ALERT* 👁️\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n📱 Target: *${label || `+${num}`}*\n🟢 Status: *Online Now*\n🕐 Time: ${timeStr}\n\n_Use \`.unstalk ${label || `+${num}`}\` to stop tracking._`,
                    }).catch(() => {});
                }
            }
        } catch (_) {}
    });
};
// ────────────────────────────────────────────────────────────────────────────

const setupConnectionHandler = (
    Gifted,
    sessionDir,
    startGifted,
    callbacks = {},
) => {
    setupGroupCacheListeners(Gifted);
    setupNewsletterReactions(Gifted);
    setupRestrictionManager(Gifted);
    setupVVTracker(Gifted);
    setupStalkListener(Gifted);

    Gifted.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "connecting") {
            console.log("🕗 Connecting Bot...");
        }

        if (connection === "open") {
            console.log("✅ Connection Instance is Online");
            reconnectAttempts = 0;
            isReconnecting = false;

            startWatchdog(Gifted, startGifted);

            if (callbacks.onOpen) {
                await callbacks.onOpen(Gifted);
            }

            setTimeout(async () => {
                await autoFollowOwnerChannels(Gifted);
            }, 3000);
        }

        if (connection === "close") {
            clearWatchdog();
            channelReactListenerActive = false;
            resetRestrictionListeners();

            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`⚠️ Connection closed. Reason code: ${reason}`);

            const handleReconnect = (extraDelay = 0) => {
                if (isReconnecting) return;
                isReconnecting = true;

                if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.warn(
                        `⚠️ ${MAX_RECONNECT_ATTEMPTS} reconnect attempts exhausted — cooling down for 2 minutes before retrying...`,
                    );
                    reconnectAttempts = 0;
                    setTimeout(() => {
                        isReconnecting = false;
                        startGifted();
                    }, withJitter(120000));
                    return;
                }

                reconnectAttempts++;
                const baseDelay = Math.min(
                    RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts - 1),
                    120000,
                );
                const delay = withJitter(baseDelay) + extraDelay;
                console.log(
                    `🔄 Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${Math.round(delay / 1000)}s...`,
                );
                setTimeout(() => {
                    isReconnecting = false;
                    startGifted();
                }, delay);
            };

            switch (reason) {
                case DisconnectReason.badSession:
                    if (isWatchdogReconnect) {
                        console.log("⚠️ Watchdog-triggered close received code 500 — reconnecting safely...");
                        isWatchdogReconnect = false;
                        break;
                    }
                    console.log("❌ Bad session — deleting session file. Please re-link the bot.");
                    try {
                        await fs.remove(sessionDir);
                    } catch (e) {
                        console.error("Failed to remove session:", e);
                    }
                    process.exit(1);
                    break;

                case DisconnectReason.connectionReplaced:
                    console.log("❌ Connection replaced by another session. Shutting down this instance.");
                    process.exit(1);
                    break;

                case DisconnectReason.loggedOut:
                    console.log("❌ Device logged out — deleting session. Please re-link the bot.");
                    try {
                        await fs.remove(sessionDir);
                    } catch (e) {
                        console.error("❌ Failed to remove session:", e);
                    }
                    process.exit(1);
                    break;

                case DisconnectReason.restartRequired:
                    console.log("🔄 WhatsApp restart signal received — reconnecting quickly...");
                    if (!isReconnecting) {
                        isReconnecting = true;
                        setTimeout(() => {
                            isReconnecting = false;
                            startGifted();
                        }, 1500);
                    }
                    break;

                case DisconnectReason.connectionClosed:
                case DisconnectReason.connectionLost:
                    console.log("🔄 Transient disconnect — reconnecting...");
                    handleReconnect();
                    break;

                case DisconnectReason.timedOut:
                    console.log("⏱️ Connection timed out — reconnecting with extra delay...");
                    handleReconnect(RECONNECT_DELAY);
                    break;

                default:
                    console.log(`⚠️ Unknown disconnect reason (${reason}) — attempting reconnect...`);
                    handleReconnect();
            }
        }
    });
};

module.exports = {
    safeNewsletterFollow,
    safeGroupAcceptInvite,
    setupConnectionHandler,
    RECONNECT_DELAY,
    MAX_RECONNECT_ATTEMPTS,
    OWNER_CHANNELS,
    addStalkTarget,
    removeStalkTarget,
    getStalkTargets,
    PROFESSOR_EMOJIS,
    getRandomProfessorEmoji,
};
