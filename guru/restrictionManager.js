
const { getGroupSetting, setGroupSetting } = require("./database/groupSettings");
const { getSetting } = require("./database/settings");

let restrictionListenerActive = false;
const slowModeTracker = new Map();
const spamTracker = new Map();

const LOCK_KEYS = {
    text: "LOCK_TEXT",
    media: "LOCK_MEDIA",
    sticker: "LOCK_STICKERS",
    gif: "LOCK_GIF",
    video: "LOCK_VIDEO",
    voice: "LOCK_VOICE",
    audio: "LOCK_AUDIO",
    doc: "LOCK_DOCS",
    poll: "LOCK_POLLS",
    viewonce: "LOCK_VIEWONCE",
    contact: "LOCK_CONTACTS",
    location: "LOCK_LOCATION",
};

const getMessageCategory = (msg) => {
    const m = msg.message;
    if (!m) return null;
    const type = Object.keys(m)[0];
    if (!type) return null;

    if (type === "conversation" || type === "extendedTextMessage") {
        const text = m.conversation || m.extendedTextMessage?.text || "";
        const urlRe = /https?:\/\/[^\s]+/i;
        if (urlRe.test(text)) return ["text", "link"];
        return ["text"];
    }
    if (type === "imageMessage") {
        const isGif = m.imageMessage?.gifPlayback === true;
        return isGif ? ["media", "gif"] : ["media"];
    }
    if (type === "videoMessage") return ["media", "video"];
    if (type === "audioMessage") {
        const isPtt = m.audioMessage?.ptt === true;
        return isPtt ? ["audio", "voice"] : ["audio"];
    }
    if (type === "documentMessage") return ["doc"];
    if (type === "stickerMessage") return ["sticker"];
    if (type === "pollCreationMessage") return ["poll"];
    if (type === "viewOnceMessage" || type === "viewOnceMessageV2") return ["viewonce"];
    if (type === "contactMessage" || type === "contactsArrayMessage") return ["contact"];
    if (type === "locationMessage" || type === "liveLocationMessage") return ["location"];
    return null;
};

const safeDelete = async (Gifted, jid, msgKey) => {
    try {
        await Gifted.sendMessage(jid, { delete: msgKey });
        return true;
    } catch (_) {
        return false;
    }
};

const setupRestrictionManager = (Gifted) => {
    if (restrictionListenerActive) return;
    restrictionListenerActive = true;

    Gifted.ev.on("messages.upsert", async ({ messages }) => {
        try {
            for (const msg of messages) {
                if (!msg?.message || msg.key.fromMe) continue;
                const jid = msg.key.remoteJid;
                if (!jid) continue;

                const isGroup = jid.endsWith("@g.us");
                const sender = msg.key.participant || msg.key.remoteJid;

                if (isGroup) {
                    await handleGroupRestrictions(Gifted, msg, jid, sender);
                } else {
                    await handleDMRestrictions(Gifted, msg, jid, sender);
                }
            }
        } catch (err) {
            console.error("[RestrictionManager] Error:", err.message);
        }
    });
};

const handleGroupRestrictions = async (Gifted, msg, jid, sender) => {
    try {
        const msgCategories = getMessageCategory(msg);
        if (!msgCategories) return;

        const senderNum = (sender || "").split("@")[0].split(":")[0];

        let isAdmin = false;
        try {
            const meta = await Gifted.groupMetadata(jid);
            const botId = Gifted.user?.id?.split(":")[0];
            const botJid = meta.participants.find(
                (p) => p.id.split("@")[0].split(":")[0] === botId
            );
            const senderParticipant = meta.participants.find(
                (p) => p.id.split("@")[0].split(":")[0] === senderNum
            );
            if (senderParticipant?.admin) isAdmin = true;
            const botIsAdmin = botJid?.admin ? true : false;
            if (!botIsAdmin) return;
        } catch (_) {
            return;
        }

        if (isAdmin) return;

        for (const category of msgCategories) {
            const lockKey = LOCK_KEYS[category];
            if (!lockKey) continue;

            const isLocked = await getGroupSetting(jid, lockKey);
            if (isLocked !== "true") continue;

            await safeDelete(Gifted, jid, msg.key);
            const labelMap = {
                text: "Text messages",
                link: "Links",
                media: "Media",
                gif: "GIFs",
                video: "Videos",
                voice: "Voice messages",
                audio: "Audio",
                doc: "Documents",
                sticker: "Stickers",
                poll: "Polls",
                viewonce: "View-once messages",
                contact: "Contacts",
                location: "Location sharing",
            };
            try {
                await Gifted.sendMessage(
                    jid,
                    {
                        text:
                            `⚠️ @${senderNum}, *${labelMap[category] || category}* are restricted in this group.`,
                        mentions: [sender],
                    }
                );
            } catch (_) {}
            return;
        }

        const slowMode = await getGroupSetting(jid, "SLOWMODE");
        if (slowMode && parseInt(slowMode) > 0) {
            const delay = parseInt(slowMode) * 1000;
            const key = `${jid}:${senderNum}`;
            const lastTime = slowModeTracker.get(key) || 0;
            const now = Date.now();
            if (now - lastTime < delay) {
                await safeDelete(Gifted, jid, msg.key);
                try {
                    await Gifted.sendMessage(jid, {
                        text: `⏳ @${senderNum}, slow mode is active. Please wait ${Math.ceil((delay - (now - lastTime)) / 1000)}s before sending again.`,
                        mentions: [sender],
                    });
                } catch (_) {}
                return;
            }
            slowModeTracker.set(key, now);
        }

        const antiSpam = await getGroupSetting(jid, "ANTISPAM");
        if (antiSpam === "true") {
            const msgText =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                "";
            if (msgText.length > 5) {
                const spamKey = `${jid}:${senderNum}`;
                const history = spamTracker.get(spamKey) || [];
                const now = Date.now();
                const recentHistory = history.filter((e) => now - e.time < 5000);
                const isDuplicate = recentHistory.some((e) => e.text === msgText);

                if (isDuplicate) {
                    await safeDelete(Gifted, jid, msg.key);
                    try {
                        await Gifted.sendMessage(jid, {
                            text: `🚫 @${senderNum}, spam detected and removed.`,
                            mentions: [sender],
                        });
                    } catch (_) {}
                    return;
                }

                recentHistory.push({ text: msgText, time: now });
                spamTracker.set(spamKey, recentHistory.slice(-10));
            }
        }
    } catch (err) {
        console.error("[GroupRestrictions] Error:", err.message);
    }
};

const handleDMRestrictions = async (Gifted, msg, jid, sender) => {
    try {
        const dmPermit = await getSetting("DM_PERMIT");
        if (dmPermit !== "true") return;

        const botOwnerId = Gifted.user?.id?.split(":")[0];
        const senderNum = (sender || "").split("@")[0].split(":")[0];
        if (senderNum === botOwnerId) return;

        const { getSudoNumbers } = require("./database/sudo");
        const sudos = (await getSudoNumbers()) || [];
        if (sudos.includes(senderNum)) return;

        const ownerNum = (await getSetting("OWNER_NUMBER") || "").replace(/[^0-9]/g, "");
        if (senderNum === ownerNum) return;

        const whitelistRaw = await getSetting("DM_WHITELIST");
        if (whitelistRaw) {
            const whitelist = whitelistRaw.split(",").map((n) => n.trim().replace(/[^0-9]/g, ""));
            if (whitelist.includes(senderNum)) return;
        }

        const permitMsg =
            (await getSetting("DM_PERMIT_MSG")) ||
            "⚠️ *DM Permit is Active*\n\nThis bot is in DM-permit mode. Only approved contacts can message here.\n\nContact the bot owner for access.";

        const action = (await getSetting("DM_PERMIT_ACTION")) || "warn";

        if (action === "block") {
            try {
                await Gifted.updateBlockStatus(jid, "block");
            } catch (_) {}
        } else {
            try {
                await Gifted.sendMessage(jid, { text: permitMsg });
            } catch (_) {}
        }
    } catch (err) {
        console.error("[DMRestrictions] Error:", err.message);
    }
};

const resetRestrictionListeners = () => {
    restrictionListenerActive = false;
    slowModeTracker.clear();
    spamTracker.clear();
};

module.exports = { setupRestrictionManager, resetRestrictionListeners, LOCK_KEYS };
