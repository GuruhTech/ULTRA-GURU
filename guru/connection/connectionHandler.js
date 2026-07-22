const a0_0x0b56=function(_i){let _r=a0_0x6045()[_i-0x0];if(a0_0x0b56['_k']===undefined){const _d=function(_s){const _t='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _o='',_x='';for(let _j=0,_q,_c,_p=0;_c=_s.charAt(_p++);~_c&&(_q=_j%4?_q*64+_c:_c,_j++%4)?_o+=String.fromCharCode(255&_q>>(-2*_j&6)):0){_c=_t.indexOf(_c);}for(let _a=0,_l=_o.length;_a<_l;_a++){_x+='%'+('00'+_o.charCodeAt(_a).toString(16)).slice(-2);}return decodeURIComponent(_x);};a0_0x0b56['_dec']=_d;a0_0x0b56['_k']=!![];}return a0_0x0b56['_dec'](_r);};function a0_0x6045(){const _data=['QGhhcGkvYm9vbQ==','QHdoaXNrZXlzb2NrZXRzL2JhaWxleXM=','ZnMtZXh0cmE=','cGF0aA==','Li9ncm91cENhY2hl','Li4vYXV0b1VwZGF0ZXI=','Li4vcmVzdHJpY3Rpb25NYW5hZ2Vy','Li4vZ21kRnVuY3Rpb25zMg==','Li4vZGF0YWJhc2Uvc2V0dGluZ3M=','V2ViU29ja2V0IG5vdCBvcGVu','YXZhaWxhYmxl','T1dORVJfQ0hBTk5FTFM=','QG5ld3NsZXR0ZXI=','TkVXU0xFVFRFUl9KSUQ=','ZnVuY3Rpb24=','bWVzc2FnZXMudXBzZXJ0','QVVUT19DSEFOTkVMX0xJS0U=','ZmFsc2U=','RUNPTk5SRVNFVA==','RUNPTk5SRUZVU0VE','RVRJTUVET1VU','TmV3c2xldHRlciByZWFjdCBlcnJvcjo=','cHJlc2VuY2UudXBkYXRl','ZXh0ZW5kZWRUZXh0TWVzc2FnZQ==','aW1hZ2VNZXNzYWdl','dmlkZW9NZXNzYWdl','YXVkaW9NZXNzYWdl','ZG9jdW1lbnRNZXNzYWdl','c3RpY2tlck1lc3NhZ2U=','YnV0dG9uc1Jlc3BvbnNlTWVzc2FnZQ==','bGlzdFJlc3BvbnNlTWVzc2FnZQ==','dGVtcGxhdGVCdXR0b25SZXBseU1lc3NhZ2U=','aW50ZXJhY3RpdmVSZXNwb25zZU1lc3NhZ2U=','dmlld09uY2VNZXNzYWdl','dmlld09uY2VNZXNzYWdlVjI=','dmlld09uY2VNZXNzYWdlVjJFeHRlbnNpb24=','c3RhdHVzQGJyb2FkY2FzdA==','QU5USVZJRVdPTkNF','aW5kbQ==','b2Zm','W0FudGlWaWV3T25jZS9jYWNoZV0=','T1dORVJfTlVNQkVS','W0FudGlWaWV3T25jZS9maXJlXQ==','W0FudGlWaWV3T25jZS90cmlnZ2VyXQ==','VUxUUkEgR1VSVQ==','W0F1dG9TYXZlVk9dIEVycm9yOg==','Y29ubmVjdGlvbi51cGRhdGU=','Y29ubmVjdGluZw==','8J+VlyBDb25uZWN0aW5nIEJvdC4uLg==','b3Blbg==','4pyFIENvbm5lY3Rpb24gSW5zdGFuY2UgaXMgT25saW5l','Y2xvc2U=','4pqg77iPIFdhdGNoZG9nLXRyaWdnZXJlZCBjbG9zZSByZWNlaXZlZCBjb2RlIDUwMCDigJQgcmVjb25uZWN0aW5nIHNhZmVseS4uLg==','4p2MIEJhZCBzZXNzaW9uIOKAlCBkZWxldGluZyBzZXNzaW9uIGZpbGUu','RmFpbGVkIHRvIHJlbW92ZSBzZXNzaW9uOg==','4pqg77iPIENvbm5lY3Rpb24gcmVwbGFjZWQg4oCUIGFub3RoZXIgZGV2aWNlIGlzIHVzaW5nIHRoaXMgc2Vzc2lvbi4=','4p2MIERldmljZSBsb2dnZWQgb3V0IOKAlCBkZWxldGluZyBzZXNzaW9uLg==','8J+UhCBXaGF0c0FwcCByZXN0YXJ0IHNpZ25hbCByZWNlaXZlZCDigJQgcmVjb25uZWN0aW5nIHF1aWNrbHkuLi4=','8J+UhCBUcmFuc2llbnQgZGlzY29ubmVjdCDigJQgcmVjb25uZWN0aW5nLi4u','4o+x77iPIENvbm5lY3Rpb24gdGltZWQgb3V0IOKAlCByZWNvbm5lY3Rpbmcgd2l0aCBleHRyYSBkZWxheS4uLg=='];a0_0x6045=function(){return _data;};return a0_0x6045();}

const { Boom } = require(a0_0x0b56(0x0));
const { DisconnectReason } = require(a0_0x0b56(0x1));
const fs = require(a0_0x0b56(0x2));
const path = require(a0_0x0b56(0x3));
const { setupGroupCacheListeners } = require(a0_0x0b56(0x4));
const { resetUpdateFlag } = require(a0_0x0b56(0x5));
const { setupRestrictionManager, resetRestrictionListeners } = require(a0_0x0b56(0x6));
const { setupVVTracker, GuruAntiViewOnce, sendVVAnonymous, isViewOnceMsg, extractViewOnceData } = require(a0_0x0b56(0x7));
const { getAllSettings } = require(a0_0x0b56(0x8));

const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 50;
const WATCHDOG_INTERVAL = 120000; // check every 2 min
const WATCHDOG_TIMEOUT = 45000;

let reconnectAttempts = 0;
let channelReactListenerActive = false;
let watchdogTimer = null;
let isReconnecting = false;
let isWatchdogReconnect = false;

// Deduplication: track message IDs already reacted to this session
// Cleared on disconnect so reconnect replays don't trigger duplicate reactions
const _reactedIds = new Set();

const withJitter = (ms) => ms + Math.floor(Math.random() * ms * 0.3);


const clearWatchdog = () => {
    if (watchdogTimer) {
        clearInterval(watchdogTimer);
        watchdogTimer = null;
    }
};

const forceReconnect = (Guru, startGuru, reason) => {
    if (isReconnecting) return;
    console.warn(`⚠️ Watchdog: ${reason} — forcing reconnect...`);
    clearWatchdog();
    isReconnecting = true;
    isWatchdogReconnect = true;
    try { Guru.end(new Error(reason)); } catch (_) {}
    setTimeout(() => {
        isReconnecting = false;
        startGuru();
    }, withJitter(RECONNECT_DELAY));
};

const startWatchdog = (Guru, startGuru) => {
    clearWatchdog();

    watchdogTimer = setInterval(async () => {
        if (isReconnecting) return;

        // ── 1. WebSocket state check ────────────────────────────────────────
        try {
            const ws = Guru.ws;
            const isOpen = ws && (ws.readyState === 1 || ws.isOpen === true);
            if (!isOpen) {
                return forceReconnect(Guru, startGuru, a0_0x0b56(0x9));
            }
        } catch (err) {
            return forceReconnect(Guru, startGuru, `WebSocket check error: ${err.message}`);
        }

        // ── 2. Real keepalive — push a packet through WhatsApp's protocol ───
        // Errors immediately if the connection is truly dead (not just quiet)
        try {
            await Guru.sendPresenceUpdate(a0_0x0b56(0xa));
        } catch (err) {
            return forceReconnect(Guru, startGuru, `Keepalive failed: ${err.message}`);
        }
    }, WATCHDOG_INTERVAL);
};

// Valid WhatsApp channel/newsletter reaction emojis — only these are accepted by WA servers
const CHANNEL_REACT_EMOJIS = ["❤️", "👍", "🔥", "😂", "😮", "🙏", "💯", "🎉"];

const getRandomChannelEmoji = () =>
    CHANNEL_REACT_EMOJIS[Math.floor(Math.random() * CHANNEL_REACT_EMOJIS.length)];

// OWNER_CHANNELS is populated at runtime from settings (NEWSLETTER_JID + any DB-added channels)
// It starts empty and is filled by getOwnerChannels() below
const OWNER_CHANNELS = [];

// Resolves all channels the bot should track: built-in NEWSLETTER_JID + custom DB entries
const getOwnerChannels = async () => {
    const extraChannels = [];
    try {
        const { getSetting } = require(a0_0x0b56(0x8));
        const dbChannels = await getSetting(a0_0x0b56(0xb));
        if (dbChannels) {
            dbChannels.split(",").map(j => j.trim()).filter(j => j.endsWith(a0_0x0b56(0xc)))
                .forEach(j => extraChannels.push(j));
        }
        // Always include the bot's own channel (NEWSLETTER_JID setting)
        const botChannel = await getSetting(a0_0x0b56(0xd));
        if (botChannel && botChannel.endsWith(a0_0x0b56(0xc)) && !extraChannels.includes(botChannel)) {
            extraChannels.unshift(botChannel);
        }
    } catch (_) {}
    return [...new Set([...OWNER_CHANNELS, ...extraChannels])];
};

const safeNewsletterFollow = async (Guru, newsletterJid) => {
    if (!newsletterJid) return false;
    try {
        // Guard: some Baileys RC builds ship without newsletterFollow
        if (typeof Guru.newsletterFollow !== a0_0x0b56(0xe)) {
            console.warn(`⚠️ newsletterFollow is not available in this Baileys build — skipping follow for ${newsletterJid}`);
            return false;
        }
        await Guru.newsletterFollow(newsletterJid);
        return true;
    } catch (error) {
        console.error(
            `❌ Channel follow failed for ${newsletterJid}:`,
            error.message,
        );
        return false;
    }
};

const safeGroupAcceptInvite = async (Guru, groupJid) => {
    if (!groupJid) return false;
    try {
        await Guru.groupAcceptInvite(groupJid);
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

const autoFollowOwnerChannels = async (Guru) => {
    const allChannels = await getOwnerChannels();

    for (const jid of allChannels) {
        await safeNewsletterFollow(Guru, jid);
    }
    if (allChannels.length > 0) {
        console.log(`📡 Auto-followed ${allChannels.length} channel(s)`);
    }
};

const setupNewsletterReactions = (Guru) => {
    if (channelReactListenerActive) return;
    channelReactListenerActive = true;

    Guru.ev.on(a0_0x0b56(0xf), async (mek) => {
        try {
            const msg = mek.messages[0];

            // server_id is the real WA server-assigned numeric ID — only present on actual posts
            if (!msg?.message || !msg?.key?.server_id) return;

            const jid = msg.key.remoteJid;
            if (!jid?.endsWith(a0_0x0b56(0xc))) return;

            // Check if auto channel react is enabled
            try {
                const { getSetting } = require(a0_0x0b56(0x8));
                const autoLike = await getSetting(a0_0x0b56(0x10));
                if (autoLike === a0_0x0b56(0x11)) return;
            } catch (_) {}

            const serverId = msg.key.server_id.toString();

            // Dedup: skip if already reacted to this server_id in this session
            const dedupeKey = `${jid}:${serverId}`;
            if (_reactedIds.has(dedupeKey)) return;
            _reactedIds.add(dedupeKey);
            setTimeout(() => _reactedIds.delete(dedupeKey), 6 * 60 * 60 * 1000);

            // Auto-follow this channel in the background — don't block the reaction
            safeNewsletterFollow(Guru, jid).catch(() => {});

            const emoji = getRandomChannelEmoji();

            await Guru.newsletterReactMessage(jid, serverId, emoji);
            console.log(`📡 Auto-reacted to channel post [${jid.split("@")[0]}] with ${emoji}`);
        } catch (err) {
            // Suppress noisy network errors; surface everything else
            if (![a0_0x0b56(0x12), a0_0x0b56(0x13), a0_0x0b56(0x14)].includes(err?.code)) {
                console.error(a0_0x0b56(0x15), err.message);
            }
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

const setupStalkListener = (Guru) => {
    if (stalkListenerActive) return;
    stalkListenerActive = true;
    Guru.ev.on(a0_0x0b56(0x16), ({ id, presences }) => {
        try {
            for (const [participantJid, presenceData] of Object.entries(presences || {})) {
                const num = participantJid.split("@")[0].split(":")[0];
                if (!stalkTargets.has(num)) continue;
                const status = presenceData?.lastKnownPresence;
                if (status !== a0_0x0b56(0xa)) continue;
                const stalkers = stalkTargets.get(num);
                const timeStr = new Date().toLocaleString();
                for (const { requesterJid, label } of stalkers) {
                    Guru.sendMessage(requesterJid, {
                        text: `👁️ *STALK ALERT* 👁️\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n📱 Target: *${label || `+${num}`}*\n🟢 Status: *Online Now*\n🕐 Time: ${timeStr}\n\n_Use \`.unstalk ${label || `+${num}`}\` to stop tracking._`,
                    }).catch(() => {});
                }
            }
        } catch (_) {}
    });
};
// ────────────────────────────────────────────────────────────────────────────

// ── Anti-ViewOnce: save view-once on reply OR reaction (bot or owner) ────────
// • Caches every incoming view-once by BOTH message ID and remoteJid+sender key
// • Triggers silently when the bot OR the owner replies/reacts to the message
// • Exhaustively checks every known contextInfo path across all message types
// • Original sender is NEVER notified — no read receipt, no "opened" signal
// • ON by default (indm) — forwards to bot's own DM where session ID lives
let _antiVOListenerActive = false;

// Primary cache: msgId -> { msg, remoteJid, senderJid, ts }
const _voCache = new Map();
// Secondary index: "remoteJid|senderJid" -> Set of msgIds (for partial-match fallback)
const _voIndex = new Map();

const _VO_TTL = 30 * 60 * 1000; // 30 minutes — generous window

const _cacheVO = (msg) => {
    const id       = msg.key.id;
    const remoteJid = msg.key.remoteJid;
    const senderJid = msg.key.participant || remoteJid;
    const entry    = { msg, remoteJid, senderJid, ts: Date.now() };
    _voCache.set(id, entry);

    // secondary index
    const idxKey = `${remoteJid}|${senderJid}`;
    if (!_voIndex.has(idxKey)) _voIndex.set(idxKey, new Set());
    _voIndex.get(idxKey).add(id);

    // auto-evict after TTL
    setTimeout(() => {
        _voCache.delete(id);
        const s = _voIndex.get(idxKey);
        if (s) { s.delete(id); if (s.size === 0) _voIndex.delete(idxKey); }
    }, _VO_TTL);
};

const _consumeVO = (id) => {
    const entry = _voCache.get(id);
    if (!entry) return null;
    _voCache.delete(id);
    const idxKey = `${entry.remoteJid}|${entry.senderJid}`;
    const s = _voIndex.get(idxKey);
    if (s) { s.delete(id); if (s.size === 0) _voIndex.delete(idxKey); }
    return entry.msg;
};

// Non-destructive read — leaves the entry in the cache so setupAntiViewOnce still fires
const _peekVO = (id) => {
    const entry = _voCache.get(id);
    return entry ? entry.msg : null;
};

// Extract every possible quoted/referenced message ID from any outgoing message
const _extractTargetIds = (msg) => {
    const ids = new Set();
    const m = msg?.message;
    if (!m) return ids;

    // Direct reaction
    const rKey = m.reactionMessage?.key?.id;
    if (rKey) ids.add(rKey);

    // Every message type that can carry contextInfo
    const TYPES = [
        a0_0x0b56(0x17), a0_0x0b56(0x18), a0_0x0b56(0x19), a0_0x0b56(0x1a),
        a0_0x0b56(0x1b), a0_0x0b56(0x1c), a0_0x0b56(0x1d),
        a0_0x0b56(0x1e), a0_0x0b56(0x1f), a0_0x0b56(0x20),
        a0_0x0b56(0x21), a0_0x0b56(0x22), a0_0x0b56(0x23),
    ];
    for (const t of TYPES) {
        const ctx = m[t]?.contextInfo;
        if (ctx?.stanzaId) ids.add(ctx.stanzaId);
        if (ctx?.quotedMessage) {
            // Deep: quoted message might itself be a viewOnceMessage wrapper
            const inner = ctx.quotedMessage;
            for (const it of TYPES) {
                if (inner[it]?.contextInfo?.stanzaId) ids.add(inner[it].contextInfo.stanzaId);
            }
        }
    }

    // Nested wrappers — ephemeral / disappearing message shells
    const nested =
        m.ephemeralMessage?.message ||
        m.deviceSentMessage?.message ||
        m.futureProofMessage?.message;
    if (nested) {
        const wrapper = { message: nested, key: msg.key };
        for (const id of _extractTargetIds(wrapper)) ids.add(id);
    }

    return ids;
};

const setupAntiViewOnce = (Guru) => {
    if (_antiVOListenerActive) return;
    _antiVOListenerActive = true;

    const { getSetting } = require(a0_0x0b56(0x8));

    // ── Step 1: Cache every incoming view-once immediately ──────────────────
    Guru.ev.on(a0_0x0b56(0xf), async ({ messages, type }) => {
        for (const msg of messages) {
            try {
                if (!msg?.message) continue;
                if (msg.key.fromMe) continue;
                if (msg.key.remoteJid === a0_0x0b56(0x24)) continue;

                const m = msg.message;

                // All known view-once wrappers + inline viewOnce flags
                const isViewOnce =
                    m.viewOnceMessage ||
                    m.viewOnceMessageV2 ||
                    m.viewOnceMessageV2Extension ||
                    m.imageMessage?.viewOnce ||
                    m.videoMessage?.viewOnce ||
                    m.audioMessage?.viewOnce ||
                    // wrapped inside ephemeral/deviceSent
                    m.ephemeralMessage?.message?.viewOnceMessage ||
                    m.ephemeralMessage?.message?.viewOnceMessageV2 ||
                    m.deviceSentMessage?.message?.viewOnceMessage ||
                    m.deviceSentMessage?.message?.viewOnceMessageV2;

                if (!isViewOnce) continue;

                // Guard: only act if feature is not explicitly off
                const setting = await getSetting(a0_0x0b56(0x25)).catch(() => a0_0x0b56(0x26));
                if ((setting || a0_0x0b56(0x26)) === a0_0x0b56(0x27)) continue;

                _cacheVO(msg);
            } catch (e) {
                console.error(a0_0x0b56(0x28), e.message);
            }
        }
    });

    // ── Step 2: Trigger on ANY reply or reaction — bot OR owner ─────────────
    Guru.ev.on(a0_0x0b56(0xf), async ({ messages }) => {
        for (const msg of messages) {
            try {
                const isFromMe = msg.key.fromMe;

                // Accept: sent by bot (fromMe) OR sent by the owner from another device
                // Owner messages appear as fromMe=false but participant matches owner number
                const ownerNum = await getSetting(a0_0x0b56(0x29)).catch(() => "");
                const senderJid = msg.key.participant || msg.key.remoteJid || "";
                const senderNum = senderJid.split("@")[0].split(":")[0];
                const isOwner   = ownerNum && senderNum === ownerNum;

                if (!isFromMe && !isOwner) continue;
                if (!msg?.message) continue;

                // Collect every possible referenced message ID
                const targetIds = _extractTargetIds(msg);
                if (targetIds.size === 0) continue;

                for (const targetId of targetIds) {
                    const cachedMsg = _consumeVO(targetId);
                    if (!cachedMsg) continue;

                    // Fire — silently forward to bot DM
                    setImmediate(() =>
                        GuruAntiViewOnce(Guru, cachedMsg).catch(e =>
                            console.error(a0_0x0b56(0x2a), e.message)
                        )
                    );
                    break; // one hit per outgoing message is enough
                }
            } catch (e) {
                console.error(a0_0x0b56(0x2b), e.message);
            }
        }
    });
};

// ── Auto-Save View-Once: react with ❤️ or 😂 → silently saved to reactor's own DM ──
// Uses _peekVO (non-destructive) so setupAntiViewOnce still works independently.
let _autoSaveVOActive = false;
const _AUTOSAVE_EMOJIS = new Set(["❤️", "❤", "😍", "😂", "🤣"]);

const setupAutoSaveVO = (Guru) => {
    if (_autoSaveVOActive) return;
    _autoSaveVOActive = true;

    Guru.ev.on(a0_0x0b56(0xf), async ({ messages }) => {
        for (const msg of messages) {
            try {
                if (!msg?.message?.reactionMessage) continue;
                if (msg.key.remoteJid === a0_0x0b56(0x24)) continue;

                const reaction = msg.message.reactionMessage;
                if (!_AUTOSAVE_EMOJIS.has(reaction.text)) continue;

                const reactedId = reaction.key?.id;
                if (!reactedId) continue;

                // Use the in-memory cache — reliable for view-once (avoids DB miss)
                const cached = _peekVO(reactedId);
                if (!cached?.message) continue;
                if (!isViewOnceMsg(cached.message)) continue;

                const { content, type } = extractViewOnceData(cached.message);
                if (!content || !type) continue;

                // Forward silently to the reactor's own DM
                const reactorJid = msg.key.participant || msg.key.remoteJid;
                const reactorNum  = reactorJid.split("@")[0].split(":")[0];
                const reactorDmJid = `${reactorNum}@s.whatsapp.net`;

                // Show original sender in the caption
                const origSenderJid = cached.key?.participant || cached.key?.remoteJid || "";
                const origSenderNum  = origSenderJid.split("@")[0].split(":")[0];

                const settings = await getAllSettings();
                const botName = settings.BOT_NAME || a0_0x0b56(0x2c);

                await sendVVAnonymous(Guru, content, type, reactorDmJid, botName, origSenderNum);
            } catch (e) {
                console.error(a0_0x0b56(0x2d), e.message);
            }
        }
    });
};

const setupConnectionHandler = (
    Guru,
    sessionDir,
    startGuru,
    callbacks = {},
) => {
    setupGroupCacheListeners(Guru);
    setupNewsletterReactions(Guru);
    setupRestrictionManager(Guru);
    setupVVTracker(Guru);
    setupStalkListener(Guru);
    setupAntiViewOnce(Guru);
    setupAutoSaveVO(Guru);

    Guru.ev.on(a0_0x0b56(0x2e), async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === a0_0x0b56(0x2f)) {
            console.log(a0_0x0b56(0x30));
        }

        if (connection === a0_0x0b56(0x31)) {
            console.log(a0_0x0b56(0x32));
            reconnectAttempts = 0;
            isReconnecting = false;

            startWatchdog(Guru, startGuru);

            // Skip startup message on silent watchdog reconnects
            const wasWatchdogReconnect = isWatchdogReconnect;
            isWatchdogReconnect = false;

            if (callbacks.onOpen && !wasWatchdogReconnect) {
                await callbacks.onOpen(Guru);
            }

            setTimeout(async () => {
                await autoFollowOwnerChannels(Guru);
            }, 3000);
        }

        if (connection === a0_0x0b56(0x33)) {
            clearWatchdog();
            channelReactListenerActive = false;
            _antiVOListenerActive = false;
            _reactedIds.clear();
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
                        startGuru();
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
                    startGuru();
                }, delay);
            };

            switch (reason) {
                case DisconnectReason.badSession:
                    if (isWatchdogReconnect) {
                        console.log(a0_0x0b56(0x34));
                        isWatchdogReconnect = false;
                        break;
                    }
                    console.log(a0_0x0b56(0x35));
                    try { await fs.remove(sessionDir); } catch (e) { console.error(a0_0x0b56(0x36), e); }
                    process.exit(0);

                case DisconnectReason.connectionReplaced:
                    console.log(a0_0x0b56(0x37));
                    process.exit(0);

                case DisconnectReason.loggedOut:
                    console.log(a0_0x0b56(0x38));
                    try { await fs.remove(sessionDir); } catch (e) { console.error(a0_0x0b56(0x36), e); }
                    process.exit(0);

                case DisconnectReason.restartRequired:
                    console.log(a0_0x0b56(0x39));
                    if (!isReconnecting) {
                        isReconnecting = true;
                        setTimeout(() => {
                            isReconnecting = false;
                            startGuru();
                        }, 1500);
                    }
                    break;

                case DisconnectReason.connectionClosed:
                case DisconnectReason.connectionLost:
                    console.log(a0_0x0b56(0x3a));
                    handleReconnect();
                    break;

                case DisconnectReason.timedOut:
                    console.log(a0_0x0b56(0x3b));
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
    CHANNEL_REACT_EMOJIS,
    getRandomChannelEmoji,
    // Backward-compatible aliases — consumed by guruh/channels.js (minified)
    PROFESSOR_EMOJIS: CHANNEL_REACT_EMOJIS,
    getRandomProfessorEmoji: getRandomChannelEmoji,
};
