var _0x962a24=(function(_0xb0e985,_0x8ee927){return !![]}());var _0x8e8193=function(){return ![]};
require("events").EventEmitter.defaultMaxListeners = 0x3C0;
if (!globalThis.crypto) {
    const { webcrypto } = require("crypto");
    globalThis.crypto = webcrypto;
}
if (typeof File === "\x75\x6e\x64\x65\x66\x69\x6e\x65\x64") {
    try {
        const { File } = require("buffer");
        if (File) globalThis.File = File;
    } catch (_) {}
}
require("./guru/gmdHelpers");
const {
    default: makeWASocket,
    isJidGroup,
    jidNormalizedUser,
    isJidBroadcast,
    downloadMediaMessage,
    downloadContentFromMessage,
    getContentType,
    fetchLatestWaWebVersion,
} = require("@whiskeysockets/baileys");
const {
    evt,
    logger,
    emojis,
    commands,
    setSudo,
    delSudo,
    GiftedTechApi,
    GiftedApiKey,
    GiftedAutoReact,
    GiftedAntiLink,
    GiftedAntibad,
    GiftedAntiGroupMention,
    GiftedAutoBio,
    handleGameMessage,
    GiftedChatBot,
    loadSession,
    useSQLiteAuthState,
    getMediaBuffer,
    getSudoNumbers,
    getFileContentType,
    bufferToStream,
    uploadToPixhost,
    uploadToImgBB,
    setCommitHash,
    getCommitHash,
    gmdBuffer,
    gmdJson,
    formatAudio,
    formatVideo,
    toAudio,
    uploadToGithubCdn,
    uploadToGiftedCdn,
    uploadToCatbox,
    GiftedAnticall,
    createContext,
    createContext2,
    verifyJidState,
    GiftedPresence,
    GiftedAntiDelete,
    GiftedAntiEdit,
    syncDatabase,
    initializeSettings,
    initializeGroupSettings,
    getAllSettings,
    DEFAULT_SETTINGS,
    standardizeJid,
    serializeMessage,
    loadPlugins,
    findCommand,
    findBodyCommand,
    createHelpers,
    getGroupInfo,
    buildSuperUsers,
    getGroupMetadata,
    createSocketConfig,
    safeNewsletterFollow,
    safeGroupAcceptInvite,
    setupConnectionHandler,
    setupGroupEventsListeners,
    initializeLidStore,
} = require("./guru");
const {
    saveAntiDelete,
    findAntiDelete,
    removeAntiDelete,
    startCleanup,
    SQLiteStore,
} = require('./guru/database/messageStore');
const _0x2ee181 = require("./config");
const _0xe863d7 = require("google-tts-api");
const fs = require("fs-extra");
const path = require("path");
const axios = require('axios');
const express = require("express");
async function resolveRealJid(Gifted, jid) {
    if (!jid) return null;
    if (!jid.endsWith('@lid')) return jid;
    try {
        const { getLidMapping } = require('./guru/connection/groupCache');
        const _0xdb48bc = getLidMapping(jid);
        if (_0xdb48bc) return _0xdb48bc;
    } catch (_) {}
    try {
        const _0xa3b95e = await Gifted.getJidFromLid(jid);
        if (_0xa3b95e && !_0xa3b95e.endsWith('@lid')) return _0xa3b95e;
    } catch (_) {}
    try {
        const { getLidMappingFromDb } = require('./guru/database/lidMapping');
        const _0x53d6d9 = await getLidMappingFromDb(jid);
        if (_0x53d6d9) return _0x53d6d9;
    } catch (_) {}
    return jid;
}
const { SESSION_ID: sessionId } = _0x2ee181;
const PORT = process.env.PORT || 0x1388;
const app = express();
let Gifted;
let store;
logger.level = "\x77\x61\x72\x6e"; 
app.use(express.static("\x67\x75\x72\x75"));
app.get("/", (req, res) => res.sendFile(__dirname + "/guru/gifted.html"));
app.get("/health", (req, res) =>
    res.status(0xC8).json({ status: "\x61\x6c\x69\x76\x65", uptime: process.uptime() }),
);
const server = app.listen(PORT, "\x30\x2e\x30\x2e\x30\x2e\x30", () => console.log(`✅ Server Running on Port: ${PORT}`));
server.on("\x65\x72\x72\x6f\x72", (err) => {
    if (err.code === "\x45\x41\x44\x44\x52\x49\x4e\x55\x53\x45") {
        console.warn(`⚠️ Port ${PORT} already in use — retrying in 3s...`);
        setTimeout(() => {
            server.close(() => {
                const _0xb5e7dd = app.listen(PORT, "\x30\x2e\x30\x2e\x30\x2e\x30", () => console.log(`✅ Server Running on Port: ${PORT}`));
                _0xb5e7dd.on("\x65\x72\x72\x6f\x72", (retryErr) => {
                    console.error("\x45\x78\x70\x72\x65\x73\x73\x20\x73\x65\x72\x76\x65\x72\x20\x72\x65\x74\x72\x79\x20\x65\x72\x72\x6f\x72\x3a", retryErr.message);
                });
            });
        }, 0xBB8);
    } else {
        console.error("\x45\x78\x70\x72\x65\x73\x73\x20\x73\x65\x72\x76\x65\x72\x20\x65\x72\x72\x6f\x72\x3a", err.message);
    }
});
setInterval(() => {
    const _0x2b0d6a = process.memoryUsage();
    if (_0x2b0d6a.heapUsed > 0x190 * 0x400 * 0x400) {
        if (global.gc) global.gc();
    }
}, 0xEA60);
setInterval(async () => {
    try {
        const http = require("http");
        http.get(`http:
    } catch (e) {}
}, 0x3A980);
const _0x5f0e2f = path.join(__dirname, "\x67\x75\x72\x75", "\x73\x65\x73\x73\x69\x6f\x6e");
const _0xdde428 = path.join(__dirname, "\x67\x75\x72\x75\x68");
let _0x127d3b = {};
async function loadBotSettings() {
    await syncDatabase();
    await initializeSettings();
    await initializeGroupSettings();
    _0x127d3b = await getAllSettings();
    return _0x127d3b;
}
startCleanup();
async function startGifted() {
    try {
        const { version } = await fetchLatestWaWebVersion();
        const _0xd6df33 = path.join(_0x5f0e2f, "\x73\x65\x73\x73\x69\x6f\x6e\x2e\x64\x62");
        const { state, saveCreds } = await useSQLiteAuthState(_0xd6df33);
        if (store) store.destroy();
        store = new SQLiteStore();
        const _0x59954b = createSocketConfig(version, state, logger);
        _0x59954b.getMessage = async (_0x3f521c) => {
            if (store) {
                const _0x48aee3 = await store.loadMessage(_0x3f521c.remoteJid, _0x3f521c.id);
                return _0x48aee3?.message || undefined;
            }
            return { conversation: "\x45\x72\x72\x6f\x72\x20\x6f\x63\x63\x75\x72\x72\x65\x64" };
        };
        Gifted = makeWASocket(_0x59954b);
        store.bind(Gifted.ev);
        Gifted.ev.process(async (events) => {
            if (events["\x63\x72\x65\x64\x73\x2e\x75\x70\x64\x61\x74\x65"]) await saveCreds();
        });
        setupAutoReact(Gifted);
        setupAntiDelete(Gifted);
        setupAutoBio(Gifted);
        setupAntiCall(Gifted);
        setupPresence(Gifted);
        setupChatBotAndAntiLink(Gifted);
        setupAntiEdit(Gifted);
        setupStatusHandlers(Gifted);
        setupGroupEventsListeners(Gifted);
        loadPlugins(_0xdde428);
        setupCommandHandler(Gifted);
        setupConnectionHandler(Gifted, _0x5f0e2f, startGifted, {
            onOpen: async (Gifted) => {
                const s = await getAllSettings();
                await safeNewsletterFollow(Gifted, s.NEWSLETTER_JID);
                await safeGroupAcceptInvite(Gifted, s.GC_JID);
                await initializeLidStore(Gifted);
                setTimeout(async () => {
                    try {
                        const _0xf53321 = commands.filter(
                            (c) => c.pattern && !c.dontAddCommandList,
                        ).length;
                        console.log("💜\x20\x43\x6f\x6e\x6e\x65\x63\x74\x65\x64\x20\x74\x6f\x20\x57\x68\x61\x74\x73\x61\x70\x70\x2c\x20\x41\x63\x74\x69\x76\x65\x21");
                        if (s.STARTING_MESSAGE === "\x74\x72\x75\x65") {
                            const d = DEFAULT_SETTINGS;
                            const md = s.MODE === "\x70\x75\x62\x6c\x69\x63" ? "\x50\x55\x42\x4c\x49\x43" : "\x50\x52\x49\x56\x41\x54\x45";
                            const _0x97d00a = (s.BOT_NAME || d.BOT_NAME).toUpperCase();
                            const _0xecf8ec =
`╰► *${_0x97d00a} ✅ CONNECTED*
╭───〔 *${_0x97d00a}* 〕──────┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
├──────────────────────
│✵│▸ 📊 *PLUGINS:* ${_0xf53321}
│✵│▸ ⚡ *PREFIX:* [ ${s.PREFIX || d.PREFIX} ]
│✵│▸ ⚙️ *MODE:* ${md}
│✵│▸ 👑 *OWNER:* ${s.OWNER_NUMBER || d.OWNER_NUMBER}
│✵│▸ 📲 *TELEGRAM:* https:
╰──────────────────────────────⊷
> _Note: Bot may take a few seconds/minutes to sync._
> ✨ _${s.CAPTION || d.CAPTION}_`;
                            const _0x6110a8 = jidNormalizedUser(Gifted.user.id);
                            let _0x0a75cc = {};
                            try {
                                _0x0a75cc = await createContext(
                                    s.BOT_NAME || d.BOT_NAME,
                                    { title: "\x42\x4f\x54\x20\x49\x4e\x54\x45\x47\x52\x41\x54\x45\x44", body: "\x53\x74\x61\x74\x75\x73\x3a\x20\x52\x65\x61\x64\x79\x20\x66\x6f\x72\x20\x55\x73\x65" },
                                );
                            } catch (_) {}
                            await Gifted.sendMessage(
                                _0x6110a8,
                                { text: _0xecf8ec, ...ctx },
                                { disappearingMessagesInChat: true, ephemeralExpiration: 0x12C },
                            );
                        }
                    } catch (err) {
                        console.error("\x50\x6f\x73\x74\x2d\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x73\x65\x74\x75\x70\x20\x65\x72\x72\x6f\x72\x3a", err);
                    }
                }, 0x1388);
            },
        });
        process.on("\x53\x49\x47\x49\x4e\x54", () => store?.destroy());
        process.on("\x53\x49\x47\x54\x45\x52\x4d", () => store?.destroy());
    } catch (error) {
        console.error("\x53\x6f\x63\x6b\x65\x74\x20\x69\x6e\x69\x74\x69\x61\x6c\x69\x7a\x61\x74\x69\x6f\x6e\x20\x65\x72\x72\x6f\x72\x3a", error);
        setTimeout(() => startGifted(), 0x1388);
    }
}
function setupAutoReact(Gifted) {
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async (mek) => {
        try {
            const ms = mek.messages[0];
            const s = await getAllSettings();
            const _0x4ede03 = s.AUTO_REACT || "\x6f\x66\x66";
            if (
                _0x4ede03 === "\x6f\x66\x66" ||
                _0x4ede03 === "\x66\x61\x6c\x73\x65" ||
                ms.key.fromMe ||
                !ms.message
            )
                return;
            const _0x1ed882 = ms.key.remoteJid;
            const _0x3e44a9 = _0x1ed882?.endsWith("@g.us");
            const _0x5c5c50 = _0x1ed882?.endsWith("@s.whatsapp.net");
            let _0x55c4f6 = false;
            if (_0x4ede03 === "\x61\x6c\x6c" || _0x4ede03 === "\x74\x72\x75\x65") {
                _0x55c4f6 = true;
            } else if (_0x4ede03 === "dm" && _0x5c5c50) {
                _0x55c4f6 = true;
            } else if (_0x4ede03 === "\x67\x72\x6f\x75\x70\x73" && _0x3e44a9) {
                _0x55c4f6 = true;
            }
            if (!_0x55c4f6) return;
            const _0xa6c2a6 =
                emojis[Math.floor(Math.random() * emojis.length)];
            await GiftedAutoReact(_0xa6c2a6, ms, Gifted);
        } catch (err) {
            console.error("\x45\x72\x72\x6f\x72\x20\x64\x75\x72\x69\x6e\x67\x20\x61\x75\x74\x6f\x20\x72\x65\x61\x63\x74\x69\x6f\x6e\x3a", err);
        }
    });
}
function setupAntiDelete(Gifted) {
    const _0x240697 = `${Gifted.user?.id.split(":")[0]}@s.whatsapp.net`;
    const _0xf73101 = _0x240697;
    const _0xb98013 = (ms) => {
        const _0x3f521c = ms.key;
        const _0x65c267 = (j) => j && !j.endsWith('@lid') ? j : null;
        return (
            _0x65c267(_0x3f521c.participantPn) ||
            _0x65c267(_0x3f521c.senderPn) ||
            _0x65c267(ms.senderPn) ||
            _0x65c267(_0x3f521c.participant) ||
            _0x65c267(ms.participant) ||
            _0x3f521c.participantPn ||
            _0x3f521c.participant ||
            ms.participant ||
            (_0x3f521c.remoteJid?.endsWith("@g.us") ? null : _0x65c267(_0x3f521c.remoteJid) || _0x3f521c.remoteJid)
        );
    };
    const _0x5ee6c4 = (ms) => {
        return (
            ms.pushName || ms.key?.pushName || ms.verifiedBizName || "\x55\x6e\x6b\x6e\x6f\x77\x6e"
        );
    };
    const _0x7387f8 = (ms) => {
        return (
            ms.message?.protocolMessage ||
            ms.message?.ephemeralMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessageV2?.message?.protocolMessage
        );
    };
    const _0x3d961e = (ms) => {
        return (
            ms.message?.protocolMessage ||
            ms.message?.ephemeralMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessageV2?.message?.protocolMessage
        );
    };
    const _0x8cfe20 = (ms) => {
        const _0x48aee3 = ms.message;
        if (!_0x48aee3) return null;
        return (
            _0x48aee3.ephemeralMessage?.message ||
            _0x48aee3.viewOnceMessage?.message ||
            _0x48aee3.viewOnceMessageV2?.message ||
            _0x48aee3.documentWithCaptionMessage?.message ||
            _0x48aee3
        );
    };
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async ({ messages }) => {
        for (const ms of messages) {
            try {
                if (!ms?.message) continue;
                const { _0x3f521c } = ms;
                if (
                    !_0x3f521c?.remoteJid ||
                    _0x3f521c.fromMe ||
                    _0x3f521c.remoteJid === "\x73\x74\x61\x74\x75\x73\x40\x62\x72\x6f\x61\x64\x63\x61\x73\x74"
                )
                    continue;
                const _0x70cf9e = _0x3d961e(ms);
                if (_0x70cf9e?.type === 0) {
                    const _0x5bb3ba = _0x70cf9e.key;
                    const _0x000dea = _0x5bb3ba?.id;
                    const _0x279c7d = _0x3f521c.remoteJid;
                    if (!_0x000dea) continue;
                    const _0x9cdbf6 = findAntiDelete(_0x279c7d, _0x000dea);
                    if (!_0x9cdbf6?.message) continue;
                    const _0x471ac2 = _0xb98013(ms) || _0x3f521c.remoteJid;
                    const _0xfacda8 = _0x5ee6c4(ms);
                    if (_0x471ac2 === _0x240697 || _0x471ac2 === _0xf73101) continue;
                    await GiftedAntiDelete(
                        Gifted,
                        _0x9cdbf6,
                        _0x3f521c,
                        _0x471ac2,
                        _0x9cdbf6.originalSender,
                        _0xf73101,
                        _0xfacda8,
                        _0x9cdbf6.originalPushName,
                    );
                    removeAntiDelete(_0x279c7d, _0x000dea);
                    continue;
                }
                if (_0x7387f8(ms)) continue;
                const _0x4834f7 = _0x8cfe20(ms);
                if (!_0x4834f7) continue;
                const _0x611dbb = _0xb98013(ms);
                const _0x7932f0 = _0x5ee6c4(ms);
                if (!_0x611dbb || _0x611dbb === _0x240697 || _0x611dbb === _0xf73101)
                    continue;
                const _0x8d58d9 = _0x3f521c.remoteJid;
                const _0xa5e97f = { ...ms, message: _0x4834f7, originalSender: _0x611dbb, originalPushName: _0x7932f0, timestamp: Date.now() };
                setImmediate(() => saveAntiDelete(_0x8d58d9, _0xa5e97f));
            } catch (error) {
                logger.error("\x41\x6e\x74\x69\x2d\x64\x65\x6c\x65\x74\x65\x20\x73\x79\x73\x74\x65\x6d\x20\x65\x72\x72\x6f\x72\x3a", error);
            }
        }
    });
}
function setupAutoBio(Gifted) {
    (async () => {
        const s = await getAllSettings();
        if (s.AUTO_BIO === "\x74\x72\x75\x65") {
            setTimeout(() => GiftedAutoBio(Gifted), 0x3E8);
            setInterval(() => GiftedAutoBio(Gifted), 0x3E8 * 0x3C);
        }
    })();
}
function setupAntiCall(Gifted) {
    Gifted.ev.on("\x63\x61\x6c\x6c", async (json) => {
        await GiftedAnticall(json, Gifted);
    });
}
function setupPresence(Gifted) {
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async ({ messages }) => {
        if (messages?.length > 0) {
            await GiftedPresence(Gifted, messages[0].key.remoteJid);
        }
    });
    Gifted.ev.on("\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x2e\x75\x70\x64\x61\x74\x65", ({ connection }) => {
        if (connection === "\x6f\x70\x65\x6e") {
            GiftedPresence(Gifted, "\x73\x74\x61\x74\x75\x73\x40\x62\x72\x6f\x61\x64\x63\x61\x73\x74");
        }
    });
}
function setupChatBotAndAntiLink(Gifted) {
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async ({ messages, type }) => {
        if (type === "\x61\x70\x70\x65\x6e\x64") return;
        const _0x7a2817 = messages[0];
        if (_0x7a2817?.message) {
            const s = await getAllSettings();
            if (s.CHATBOT === "\x74\x72\x75\x65" || s.CHATBOT === "\x61\x75\x64\x69\x6f") {
                GiftedChatBot(
                    Gifted,
                    s.CHATBOT,
                    s.CHATBOT_MODE || "\x69\x6e\x62\x6f\x78",
                    createContext,
                    createContext2,
                    _0xe863d7,
                );
            }
        }
        for (const message of messages) {
            if (!message?.message) continue;
            const _0x1ed882 = message.key?.remoteJid || "";
            if (message.key.fromMe && !_0x1ed882.endsWith("@g.us")) continue;
            if (_0x1ed882.endsWith("@g.us")) {
                await GiftedAntiLink(Gifted, message, getGroupMetadata);
                await GiftedAntibad(Gifted, message, getGroupMetadata);
            }
            await GiftedAntiGroupMention(Gifted, message, getGroupMetadata);
            await handleGameMessage(Gifted, message);
        }
    });
}
function setupAntiEdit(Gifted) {
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x64\x61\x74\x65", async (updates) => {
        for (const update of updates) {
            try {
                if (!update?.update?.message) continue;
                if (update.key?.fromMe) continue;
                if (update.key?.remoteJid === "\x73\x74\x61\x74\x75\x73\x40\x62\x72\x6f\x61\x64\x63\x61\x73\x74") continue;
                await GiftedAntiEdit(Gifted, update, findAntiDelete);
            } catch (err) {
                console.error("\x41\x6e\x74\x69\x2d\x65\x64\x69\x74\x20\x68\x61\x6e\x64\x6c\x65\x72\x20\x65\x72\x72\x6f\x72\x3a", err.message);
            }
        }
    });
}
function setupStatusHandlers(Gifted) {
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async (mek) => {
        try {
            mek = mek.messages[0];
            if (!mek || !mek.message) return;
            mek.message =
                getContentType(mek.message) === "\x65\x70\x68\x65\x6d\x65\x72\x61\x6c\x4d\x65\x73\x73\x61\x67\x65"
                    ? mek.message.ephemeralMessage.message
                    : mek.message;
            if (mek.key?.remoteJid !== "\x73\x74\x61\x74\x75\x73\x40\x62\x72\x6f\x61\x64\x63\x61\x73\x74") return;
            const s = await getAllSettings();
            const _0x4539d0 = mek.participant || mek.key.participantPn || mek.key.participant;
            const _0xac1455 = await resolveRealJid(Gifted, _0x4539d0);
            const _0xc7cf52 = s.AUTO_READ_STATUS === "\x74\x72\x75\x65";
            const _0x446fc7 = (_0xac1455 && _0xac1455 !== mek.key.participant)
                ? { ...mek.key, participant: _0xac1455 }
                : mek.key;
            if (_0xc7cf52) {
                await Gifted.readMessages([_0x446fc7]);
            }
            if (_0xc7cf52 && s.AUTO_LIKE_STATUS === "\x74\x72\x75\x65" && _0xac1455) {
                const _0xa5f69f = (s.STATUS_LIKE_EMOJIS || "🥼\x2c🏅\x2c🎖️\x2c🧧\x2c🎐\x2c🏅\x2c🏆\x2c🥇\x2c🥈\x2c🏆").split(",").map(e => e.trim()).filter(Boolean);
                const _0xa6c2a6 = _0xa5f69f[Math.floor(Math.random() * _0xa5f69f.length)];
                const _0x297c21 = { ...mek.key, participant: _0xac1455 };
                await Gifted.sendMessage(
                    "\x73\x74\x61\x74\x75\x73\x40\x62\x72\x6f\x61\x64\x63\x61\x73\x74",
                    { react: { text: _0xa6c2a6, _0x3f521c: _0x297c21 } },
                    { statusJidList: [_0xac1455] }
                );
            }
            if (_0xc7cf52 && s.AUTO_REPLY_STATUS === "\x74\x72\x75\x65" && !mek.key.fromMe && _0xac1455) {
                await Gifted.sendMessage(
                    _0xac1455,
                    { text: s.STATUS_REPLY_TEXT || DEFAULT_SETTINGS.STATUS_REPLY_TEXT },
                    { _0x170e23: mek }
                );
            }
        } catch (error) {
            const _0xeccaf8 = error?.output?.statusCode || error?.code || "";
            const _0x48aee3 = error?.message || "";
            const _0x075aab =
                _0xeccaf8 === 0x1AC ||
                _0x48aee3 === "\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x43\x6c\x6f\x73\x65\x64" ||
                _0x48aee3.includes("\x45\x43\x4f\x4e\x4e\x52\x45\x53\x45\x54") ||
                _0x48aee3.includes("\x45\x54\x49\x4d\x45\x44\x4f\x55\x54") ||
                _0x48aee3.includes("\x45\x43\x4f\x4e\x4e\x52\x45\x46\x55\x53\x45\x44") ||
                _0x48aee3.includes("\x45\x50\x49\x50\x45") ||
                _0x48aee3.includes("\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x54\x65\x72\x6d\x69\x6e\x61\x74\x65\x64") ||
                _0x48aee3.includes("\x53\x74\x72\x65\x61\x6d\x20\x45\x72\x72\x6f\x72\x65\x64") ||
                String(_0xeccaf8) === "\x45\x43\x4f\x4e\x4e\x52\x45\x53\x45\x54" ||
                String(_0xeccaf8) === "\x45\x50\x49\x50\x45";
            if (_0x075aab) return;
            console.error("\x45\x72\x72\x6f\x72\x20\x50\x72\x6f\x63\x65\x73\x73\x69\x6e\x67\x20\x53\x74\x61\x74\x75\x73\x20\x41\x63\x74\x69\x6f\x6e\x73\x3a", error);
        }
    });
}
const _0xf16135 = new Set();
const _0x31073e = Date.now();
function setupCommandHandler(Gifted) {
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async ({ messages, type }) => {
        if (type === "\x61\x70\x70\x65\x6e\x64") return;
        const ms = messages[0];
        if (!ms?.message || !ms?.key) return;
        const _0x505fee = ms.key.id;
        if (_0xf16135.has(_0x505fee)) return;
        _0xf16135.add(_0x505fee);
        setTimeout(() => _0xf16135.delete(_0x505fee), 0xEA60);
        const _0x785f8b =
            (ms.messageTimestamp?.low || ms.messageTimestamp) * 0x3E8;
        if (_0x785f8b && _0x785f8b < _0x31073e - 0x1388)
            return;
        const _0xcedf8f = await getAllSettings();
        const _0x0a8e43 = standardizeJid(Gifted.user?.id);
        const _0x032f18 = await serializeMessage(ms, Gifted, _0xcedf8f);
        if (!_0x032f18) return;
        const {
            _0x1ed882,
            _0x3e44a9,
            body,
            isCommand,
            command,
            args,
            _0x611dbb: rawSender,
            messageAuthor,
            user,
            pushName,
            _0x170e23,
            repliedMessage,
            mentionedJid,
            tagged,
            quotedMsg,
            quotedKey,
            quotedUser,
        } = _0x032f18;
        const _0xa5771d = await getGroupInfo(Gifted, _0x1ed882, _0x0a8e43, rawSender);
        const {
            groupInfo,
            groupName,
            participants,
            groupAdmins,
            groupSuperAdmins,
            isBotAdmin,
            isAdmin,
            isSuperAdmin,
            _0x611dbb,
        } = _0xa5771d;
        const _0x85809e = await buildSuperUsers(
            _0xcedf8f,
            getSudoNumbers,
            _0x0a8e43,
            _0xcedf8f.OWNER_NUMBER || "",
        );
        const _0xb16f9c = _0x85809e.includes(_0x611dbb);
        const _0xb44797 = new Date().toLocaleTimeString();
        const _0xa05771 = pushName || _0x611dbb?.split("@")[0] || "\x75\x6e\x6b\x6e\x6f\x77\x6e";
        const _0x0a05d1 = _0x3e44a9 ? `[${groupName || _0x1ed882.split("@")[0]}]` : `[DM]`;
        if (isCommand && command) {
            console.log(`[${_0xb44797}] ⚡ CMD  ${_0x0a05d1} ${_0xa05771}: ${body}`);
        } else if (body) {
            console.log(`[${_0xb44797}] 💬 MSG  ${_0x0a05d1} ${_0xa05771}: ${body.slice(0, 0x50)}${body.length > 0x50 ? "..." : ""}`);
        }
        if (_0xcedf8f.AUTO_BLOCK && _0x611dbb && !_0xb16f9c && !_0x3e44a9) {
            const _0x380fc4 = _0xcedf8f.AUTO_BLOCK.split(",").map((_0xeccaf8) =>
                _0xeccaf8.trim(),
            );
            if (_0x380fc4.some((_0xeccaf8) => _0x611dbb.startsWith(_0xeccaf8))) {
                try {
                    await Gifted.updateBlockStatus(_0x611dbb, "\x62\x6c\x6f\x63\x6b");
                } catch (blockErr) {
                    console.error("\x42\x6c\x6f\x63\x6b\x20\x65\x72\x72\x6f\x72\x3a", blockErr);
                }
            }
        }
        const _0xd1defc = _0xcedf8f.AUTO_READ_MESSAGES || "\x6f\x66\x66";
        let _0xe29773 = false;
        if (_0xd1defc === "\x61\x6c\x6c" || _0xd1defc === "\x74\x72\x75\x65") {
            _0xe29773 = true;
        } else if (_0xd1defc === "dm" && !_0x3e44a9) {
            _0xe29773 = true;
        } else if (_0xd1defc === "\x67\x72\x6f\x75\x70\x73" && _0x3e44a9) {
            _0xe29773 = true;
        } else if (_0xd1defc === "\x63\x6f\x6d\x6d\x61\x6e\x64\x73" && isCommand) {
            _0xe29773 = true;
        }
        if (_0xe29773) await Gifted.readMessages([ms.key]);
        const _0xdae9a0 = findBodyCommand(body);
        if (_0xdae9a0 && _0xdae9a0.function) {
            if (_0xcedf8f.MODE?.toLowerCase() === "\x70\x72\x69\x76\x61\x74\x65" && !_0xb16f9c)
                return;
            try {
                const _0xa34502 = createHelpers(Gifted, ms, _0x1ed882);
                const _0xc56350 = buildContext(ms, _0xcedf8f, _0xa34502, {
                    _0x1ed882,
                    _0x3e44a9,
                    groupInfo,
                    groupName,
                    participants,
                    groupAdmins,
                    groupSuperAdmins,
                    isBotAdmin,
                    isAdmin,
                    isSuperAdmin,
                    _0x611dbb,
                    _0x85809e,
                    _0xb16f9c,
                    messageAuthor,
                    user,
                    pushName,
                    args,
                    _0x170e23,
                    repliedMessage,
                    mentionedJid,
                    tagged,
                    quotedMsg,
                    quotedKey,
                    quotedUser,
                    Gifted,
                    _0x0a8e43,
                    body,
                    command,
                });
                await _0xdae9a0.function(_0x1ed882, Gifted, _0xc56350);
            } catch (error) {
                console.error(`Body command error:`, error);
            }
        }
        if (isCommand && command) {
            const _0x2d8a90 = findCommand(command);
            if (!_0x2d8a90) return;
            if (_0xcedf8f.MODE?.toLowerCase() === "\x70\x72\x69\x76\x61\x74\x65" && !_0xb16f9c)
                return;
            try {
                const _0xa34502 = createHelpers(Gifted, ms, _0x1ed882);
                if (_0xcedf8f.AUTO_REACT === "\x63\x6f\x6d\x6d\x61\x6e\x64\x73") {
                    const _0xa6c2a6 =
                        emojis[Math.floor(Math.random() * emojis.length)];
                    await Gifted.sendMessage(_0x1ed882, {
                        react: { _0x3f521c: ms.key, text: _0xa6c2a6 },
                    });
                } else if (_0x2d8a90.react) {
                    await Gifted.sendMessage(_0x1ed882, {
                        react: { _0x3f521c: ms.key, text: _0x2d8a90.react },
                    });
                }
                setupGiftedHelpers(Gifted, _0x1ed882);
                const _0xc56350 = buildContext(ms, _0xcedf8f, _0xa34502, {
                    _0x1ed882,
                    _0x3e44a9,
                    groupInfo,
                    groupName,
                    participants,
                    groupAdmins,
                    groupSuperAdmins,
                    isBotAdmin,
                    isAdmin,
                    isSuperAdmin,
                    _0x611dbb,
                    _0x85809e,
                    _0xb16f9c,
                    messageAuthor,
                    user,
                    pushName,
                    args,
                    _0x170e23,
                    repliedMessage,
                    mentionedJid,
                    tagged,
                    quotedMsg,
                    quotedKey,
                    quotedUser,
                    Gifted,
                    _0x0a8e43,
                    body,
                    command,
                });
                await _0x2d8a90.function(_0x1ed882, Gifted, _0xc56350);
                console.log(`[${new Date().toLocaleTimeString()}] ✔️ DONE  [${command}] executed for ${_0x611dbb?.split("@")[0]}`);
            } catch (error) {
                console.error(`Command error [${command}]:`, error);
                try {
                    await Gifted.sendMessage(
                        _0x1ed882,
                        {
                            text: `🚨 Command failed: ${error.message}`,
                            ...(await createContext(messageAuthor, {
                                title: "\x45\x72\x72\x6f\x72",
                                body: "\x43\x6f\x6d\x6d\x61\x6e\x64\x20\x65\x78\x65\x63\x75\x74\x69\x6f\x6e\x20\x66\x61\x69\x6c\x65\x64",
                            })),
                        },
                        { _0x170e23: ms },
                    );
                } catch (sendErr) {
                    console.error("\x45\x72\x72\x6f\x72\x20\x73\x65\x6e\x64\x69\x6e\x67\x20\x65\x72\x72\x6f\x72\x20\x6d\x65\x73\x73\x61\x67\x65\x3a", sendErr);
                }
            }
        }
    });
}
function setupGiftedHelpers(Gifted, _0x1ed882) {
    Gifted.getJidFromLid = async (lid) => {
        const _0x877ba1 = await getGroupMetadata(Gifted, _0x1ed882);
        if (!_0x877ba1) return null;
        const _0x7a611b = _0x877ba1.participants.find(
            (p) => p.lid === lid || p.id === lid,
        );
        return _0x7a611b?.pn || _0x7a611b?.phoneNumber || null;
    };
    Gifted.getLidFromJid = async (jid) => {
        const _0x877ba1 = await getGroupMetadata(Gifted, _0x1ed882);
        if (!_0x877ba1) return null;
        const _0x7a611b = _0x877ba1.participants.find(
            (p) =>
                p.jid === jid ||
                p.pn === jid ||
                p.phoneNumber === jid ||
                p.id === jid,
        );
        return _0x7a611b?.lid || null;
    };
    let fileType;
    (async () => {
        fileType = await import("\x66\x69\x6c\x65\x2d\x74\x79\x70\x65");
    })();
    Gifted.downloadAndSaveMediaMessage = async (
        message,
        filename,
        attachExtension = true,
    ) => {
        try {
            let _0x170e23 = message.msg ? message.msg : message;
            let _0xbd1f38 = (message.msg || message).mimetype || "";
            let _0x0dc392 = message.mtype
                ? message.mtype.replace(/Message/gi, "")
                : _0xbd1f38.split("/")[0];
            const stream = await downloadContentFromMessage(
                _0x170e23,
                _0x0dc392,
            );
            let _0x86e77f = Buffer.from([]);
            for await (const chunk of stream) {
                _0x86e77f = Buffer.concat([_0x86e77f, chunk]);
            }
            let fileTypeResult;
            try {
                fileTypeResult = await fileType.fileTypeFromBuffer(_0x86e77f);
            } catch (e) {}
            const _0xbbf708 =
                fileTypeResult?.ext ||
                _0xbd1f38.split("/")[1] ||
                (_0x0dc392 === "\x69\x6d\x61\x67\x65"
                    ? "\x6a\x70\x67"
                    : _0x0dc392 === "\x76\x69\x64\x65\x6f"
                      ? "\x6d\x70\x34"
                      : _0x0dc392 === "\x61\x75\x64\x69\x6f"
                        ? "\x6d\x70\x33"
                        : "\x62\x69\x6e");
            const _0xadd0c2 = attachExtension
                ? `${filename}.${_0xbbf708}`
                : filename;
            await fs.writeFile(_0xadd0c2, _0x86e77f);
            return _0xadd0c2;
        } catch (error) {
            console.error("\x45\x72\x72\x6f\x72\x20\x69\x6e\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x41\x6e\x64\x53\x61\x76\x65\x4d\x65\x64\x69\x61\x4d\x65\x73\x73\x61\x67\x65\x3a", error);
            throw error;
        }
    };
}
function buildContext(ms, _0xcedf8f, _0xa34502, data) {
    return {
        m: ms,
        mek: ms,
        body: data.body || "",
        edit: _0xa34502.edit,
        react: _0xa34502.react,
        del: _0xa34502.del,
        args: data.args,
        arg: data.args,
        _0x170e23: data.quoted,
        isCmd: data.isCommand !== undefined ? data.isCommand : true,
        command: data.command || "",
        isAdmin: data.isAdmin,
        isBotAdmin: data.isBotAdmin,
        _0x611dbb: data.sender,
        pushName: data.pushName,
        setSudo,
        delSudo,
        q: data.args.join(" "),
        reply: _0xa34502.reply,
        _0x2ee181,
        _0x85809e: data.superUser,
        tagged: data.tagged,
        mentionedJid: data.mentionedJid,
        _0x3e44a9: data.isGroup,
        groupInfo: data.groupInfo,
        groupName: data.groupName,
        getSudoNumbers,
        authorMessage: data.messageAuthor,
        user: data.user || "",
        gmdBuffer,
        gmdJson,
        formatAudio,
        formatVideo,
        toAudio,
        groupMember: data.isGroup ? data.messageAuthor : "",
        _0x1ed882: data.from,
        groupAdmins: data.groupAdmins,
        participants: data.participants,
        repliedMessage: data.repliedMessage,
        quotedMsg: data.quotedMsg,
        quotedKey: data.quotedKey,
        quotedUser: data.quotedUser,
        _0xb16f9c: data.isSuperUser,
        botMode: _0xcedf8f.MODE,
        botPic: _0xcedf8f.BOT_PIC,
        botFooter: _0xcedf8f.FOOTER,
        botCaption: _0xcedf8f.CAPTION,
        botVersion: _0xcedf8f.VERSION,
        ownerNumber: _0xcedf8f.OWNER_NUMBER,
        ownerName: _0xcedf8f.OWNER_NAME,
        _0x97d00a: _0xcedf8f.BOT_NAME,
        giftedRepo: _0xcedf8f.BOT_REPO,
        packName: _0xcedf8f.PACK_NAME,
        packAuthor: _0xcedf8f.PACK_AUTHOR,
        isSuperAdmin: data.isSuperAdmin,
        getMediaBuffer,
        getFileContentType,
        bufferToStream,
        uploadToPixhost,
        uploadToImgBB,
        setCommitHash,
        getCommitHash,
        uploadToGithubCdn,
        uploadToGiftedCdn,
        uploadToCatbox,
        newsletterUrl: _0xcedf8f.NEWSLETTER_URL,
        newsletterJid: _0xcedf8f.NEWSLETTER_JID,
        GiftedTechApi,
        GiftedApiKey,
        botPrefix: _0xcedf8f.PREFIX,
        timeZone: _0xcedf8f.TIME_ZONE,
    };
}
(async () => {
    await loadSession();
    await loadBotSettings();
    startGifted();
})();
