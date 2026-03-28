// File polyfill for Node.js
if (typeof File === 'undefined') {
    global.File = class File extends Blob {
        constructor(bits, name, options = {}) {
            super(bits, options);
            this.name = name;
            this.lastModified = options.lastModified || Date.now();
        }
    };
}

// Crypto fix for Node.js
if (!globalThis.crypto) {
    globalThis.crypto = require('crypto').webcrypto;
}

require("events").EventEmitter.defaultMaxListeners = 960;
require("./guru/gmdHelpers");

const {
    default: guruConnect,
    isJidGroup,
    jidNormalizedUser,
    isJidBroadcast,
    downloadMediaMessage,
    downloadContentFromMessage,
    getContentType,
    fetchLatestWaWebVersion,
} = require("gifted-baileys");

const {
    evt,
    logger,
    emojis,
    commands,
    setSudo,
    delSudo,
    GuruTechApi,
    GuruApiKey,
    GuruAutoReact,
    GuruAntiLink,
    GuruAntibad,
    GuruAntiGroupMention,
    GuruAutoBio,
    handleGameMessage,
    GuruChatBot,
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
    uploadToGuruCdn,
    uploadToCatbox,
    GuruAnticall,
    createContext,
    createContext2,
    verifyJidState,
    GuruPresence,
    GuruAntiDelete,
    GuruAntiEdit,
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

const config = require("./config");
const googleTTS = require("google-tts-api");
const fs = require("fs-extra");
const path = require("path");
const axios = require('axios');
const express = require("express");

// ============= ULTRA GURU CONFIGURATION =============
const BOT_CONFIG = {
    name: "ULTRA GURU",
    owner: "GuruTech",
    imageUrl: "https://files.catbox.moe/5evber.jpg",
    repo: "https://github.com/GuruhTech/ULTRA-GURU",
    newsletter: "120363406466294627@newsletter",
    version: "2.0.0"
};

// ============= MINIMAL LOGS =============
const log = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    ok: (msg) => console.log(`[✓] ${msg}`),
    err: (msg) => console.log(`[✗] ${msg}`)
};

// ============= MINIMAL CONNECTION MESSAGE =============
const getConnectionMsg = (botName, prefix, mode) => {
    return `
┌─────────────────┐
│ ${botName} ✓    │
│ Prefix : ${prefix} │
│ Mode   : ${mode} │
└─────────────────┘
`;
};

// ============= SERVER SETUP =============
const { SESSION_ID: sessionId } = config;
const PORT = process.env.PORT || 5000;
const app = express();
let Guru;
let store;

logger.level = "silent";
app.use(express.static("guru"));
app.get("/", (req, res) => res.sendFile(__dirname + "/guru/guruh.html"));
app.get("/health", (req, res) =>
    res.status(200).json({ status: "alive", uptime: process.uptime() }),
);
app.listen(PORT, () => log.ok(`Server on port ${PORT}`));

setInterval(() => {
    const used = process.memoryUsage();
    if (used.heapUsed > 400 * 1024 * 1024) {
        if (global.gc) global.gc();
    }
}, 60000);

setInterval(async () => {
    try {
        const http = require("http");
        http.get(`http://localhost:${PORT}/health`, () => {});
    } catch (e) {}
}, 240000);

const sessionDir = path.join(__dirname, "guru", "session");
const pluginsPath = path.join(__dirname, "guruh");

let botSettings = {};
async function loadBotSettings() {
    await syncDatabase();
    await initializeSettings();
    await initializeGroupSettings();
    botSettings = await getAllSettings();
    return botSettings;
}

startCleanup();

async function startGuru() {
    try {
        const { version } = await fetchLatestWaWebVersion();
        const sessionDbPath = path.join(sessionDir, "session.db");
        const { state, saveCreds } = await useSQLiteAuthState(sessionDbPath);

        if (store) store.destroy();
        store = new SQLiteStore();

        const socketConfig = createSocketConfig(version, state, logger);
        socketConfig.getMessage = async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: "Error occurred" };
        };

        Guru = guruConnect(socketConfig);
        store.bind(Guru.ev);

        Guru.ev.process(async (events) => {
            if (events["creds.update"]) await saveCreds();
        });

        setupAutoReact(Guru);
        setupAntiDelete(Guru);
        setupAutoBio(Guru);
        setupAntiCall(Guru);
        setupNewsletterReact(Guru);
        setupPresence(Guru);
        setupChatBotAndAntiLink(Guru);
        setupAntiEdit(Guru);
        setupStatusHandlers(Guru);
        setupGroupEventsListeners(Guru);

        loadPlugins(pluginsPath);
        setupCommandHandler(Guru);

        setupConnectionHandler(Guru, sessionDir, startGuru, {
            onOpen: async (Guru) => {
                const s = await getAllSettings();
                await safeNewsletterFollow(Guru, BOT_CONFIG.newsletter);
                await safeGroupAcceptInvite(Guru, s.GC_JID);
                await initializeLidStore(Guru);

                setTimeout(async () => {
                    try {
                        const totalCommands = commands.filter(
                            (c) => c.pattern && !c.dontAddCommandList,
                        ).length;
                        log.ok(`Connected | ${totalCommands} plugins`);

                        if (s.STARTING_MESSAGE === "true") {
                            const d = DEFAULT_SETTINGS;
                            const md = s.MODE === "public" ? "public" : "private";
                            
                            const connectionMsg = getConnectionMsg(
                                BOT_CONFIG.name,
                                s.PREFIX || d.PREFIX,
                                md
                            );

                            await Guru.sendMessage(
                                Guru.user.id,
                                {
                                    text: connectionMsg,
                                    ...(await createContext(
                                        BOT_CONFIG.name,
                                        {
                                            title: "ULTRA GURU",
                                            body: "Ready",
                                        },
                                    )),
                                },
                                {
                                    disappearingMessagesInChat: true,
                                    ephemeralExpiration: 300,
                                },
                            );
                        }
                    } catch (err) {
                        log.err(`Post-connection error: ${err.message}`);
                    }
                }, 5000);
            },
        });

        process.on("SIGINT", () => store?.destroy());
        process.on("SIGTERM", () => store?.destroy());
    } catch (error) {
        log.err(`Socket error: ${error.message}`);
        setTimeout(() => startGuru(), 5000);
    }
}

// ============= ALL SETUP FUNCTIONS (unchanged) =============
function setupAutoReact(Guru) {
    Guru.ev.on("messages.upsert", async (mek) => {
        try {
            const ms = mek.messages[0];
            const s = await getAllSettings();
            const autoReactMode = s.AUTO_REACT || "off";

            if (
                autoReactMode === "off" ||
                autoReactMode === "false" ||
                ms.key.fromMe ||
                !ms.message
            )
                return;

            const from = ms.key.remoteJid;
            const isGroup = from?.endsWith("@g.us");
            const isDm = from?.endsWith("@s.whatsapp.net");

            let shouldReact = false;
            if (autoReactMode === "all" || autoReactMode === "true") {
                shouldReact = true;
            } else if (autoReactMode === "dm" && isDm) {
                shouldReact = true;
            } else if (autoReactMode === "groups" && isGroup) {
                shouldReact = true;
            }

            if (!shouldReact) return;

            const randomEmoji =
                emojis[Math.floor(Math.random() * emojis.length)];
            await GuruAutoReact(randomEmoji, ms, Guru);
        } catch (err) {
            // silent
        }
    });
}

function setupAntiDelete(Guru) {
    const botJid = `${Guru.user?.id.split(":")[0]}@s.whatsapp.net`;
    const botOwnerJid = botJid;

    const getSender = (ms) => {
        const key = ms.key;
        const realJid = (j) => j && !j.endsWith('@lid') ? j : null;
        return (
            realJid(key.participantPn) ||
            realJid(key.senderPn) ||
            realJid(ms.senderPn) ||
            realJid(key.participant) ||
            realJid(ms.participant) ||
            key.participantPn ||
            key.participant ||
            ms.participant ||
            (key.remoteJid?.endsWith("@g.us") ? null : realJid(key.remoteJid) || key.remoteJid)
        );
    };

    const getPushName = (ms) => {
        return (
            ms.pushName || ms.key?.pushName || ms.verifiedBizName || "Unknown"
        );
    };

    const isProtocolMessage = (ms) => {
        return (
            ms.message?.protocolMessage ||
            ms.message?.ephemeralMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessageV2?.message?.protocolMessage
        );
    };

    const getProtocolMessage = (ms) => {
        return (
            ms.message?.protocolMessage ||
            ms.message?.ephemeralMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessage?.message?.protocolMessage ||
            ms.message?.viewOnceMessageV2?.message?.protocolMessage
        );
    };

    const getActualMessage = (ms) => {
        const msg = ms.message;
        if (!msg) return null;
        return (
            msg.ephemeralMessage?.message ||
            msg.viewOnceMessage?.message ||
            msg.viewOnceMessageV2?.message ||
            msg.documentWithCaptionMessage?.message ||
            msg
        );
    };

    Guru.ev.on("messages.upsert", async ({ messages }) => {
        for (const ms of messages) {
            try {
                if (!ms?.message) continue;

                const { key } = ms;
                if (
                    !key?.remoteJid ||
                    key.fromMe ||
                    key.remoteJid === "status@broadcast"
                )
                    continue;

                const protocolMsg = getProtocolMessage(ms);
                if (protocolMsg?.type === 0) {
                    const deleteKey = protocolMsg.key;
                    const deletedId = deleteKey?.id;
                    const chatJid = key.remoteJid;

                    if (!deletedId) continue;

                    const deletedMsg = findAntiDelete(chatJid, deletedId);
                    if (!deletedMsg?.message) continue;

                    const deleter = getSender(ms) || key.remoteJid;
                    const deleterPushName = getPushName(ms);

                    if (deleter === botJid || deleter === botOwnerJid) continue;

                    await GuruAntiDelete(
                        Guru,
                        deletedMsg,
                        key,
                        deleter,
                        deletedMsg.originalSender,
                        botOwnerJid,
                        deleterPushName,
                        deletedMsg.originalPushName,
                    );

                    removeAntiDelete(chatJid, deletedId);
                    continue;
                }

                if (isProtocolMessage(ms)) continue;

                const actualMessage = getActualMessage(ms);
                if (!actualMessage) continue;

                const sender = getSender(ms);
                const senderPushName = getPushName(ms);

                if (!sender || sender === botJid || sender === botOwnerJid)
                    continue;

                const _jid = key.remoteJid;
                const _entry = { ...ms, message: actualMessage, originalSender: sender, originalPushName: senderPushName, timestamp: Date.now() };
                setImmediate(() => saveAntiDelete(_jid, _entry));
            } catch (error) {
                // silent
            }
        }
    });
}

function setupAutoBio(Guru) {
    (async () => {
        const s = await getAllSettings();
        if (s.AUTO_BIO === "true") {
            setTimeout(() => GuruAutoBio(Guru), 1000);
            setInterval(() => GuruAutoBio(Guru), 1000 * 60);
        }
    })();
}

function setupAntiCall(Guru) {
    Guru.ev.on("call", async (json) => {
        await GuruAnticall(json, Guru);
    });
}

// Cache newsletter JIDs
let _newsletterCache = null;
let _newsletterCacheAt = 0;
const NEWSLETTER_TTL = 2 * 60 * 1000;

async function _getNewsletters() {
    if (_newsletterCache && Date.now() - _newsletterCacheAt < NEWSLETTER_TTL) {
        return _newsletterCache;
    }
    _newsletterCache = [BOT_CONFIG.newsletter];
    _newsletterCacheAt = Date.now();
    return _newsletterCache;
}

function setupNewsletterReact(Guru) {
    const emojiList = ["❤️", "💛", "👍", "💜", "😮", "🤍", "💙"];
    Guru.ev.on("messages.upsert", async (mek) => {
        try {
            const msg = mek.messages[0];
            if (!msg?.message || !msg?.key?.server_id) return;
            const newsletters = await _getNewsletters();
            if (!newsletters.includes(msg.key.remoteJid)) return;
            const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            await Guru.newsletterReactMessage(
                msg.key.remoteJid,
                msg.key.server_id.toString(),
                emoji,
            );
        } catch (err) {
            if (err?.code === 'ECONNRESET' || err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') {
                _newsletterCache = null;
            }
        }
    });
}

function setupPresence(Guru) {
    Guru.ev.on("messages.upsert", async ({ messages }) => {
        if (messages?.length > 0) {
            await GuruPresence(Guru, messages[0].key.remoteJid);
        }
    });

    Guru.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") {
            GuruPresence(Guru, "status@broadcast");
        }
    });
}

function setupChatBotAndAntiLink(Guru) {
    Guru.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "append") return;

        const firstMsg = messages[0];
        if (firstMsg?.message) {
            const s = await getAllSettings();
            if (s.CHATBOT === "true" || s.CHATBOT === "audio") {
                GuruChatBot(
                    Guru,
                    s.CHATBOT,
                    s.CHATBOT_MODE || "inbox",
                    createContext,
                    createContext2,
                    googleTTS,
                );
            }
        }

        for (const message of messages) {
            if (!message?.message) continue;
            const from = message.key?.remoteJid || "";
            if (message.key.fromMe && !from.endsWith("@g.us")) continue;

            if (from.endsWith("@g.us")) {
                await GuruAntiLink(Guru, message, getGroupMetadata);
                await GuruAntibad(Guru, message, getGroupMetadata);
            }
            await GuruAntiGroupMention(Guru, message, getGroupMetadata);
            await handleGameMessage(Guru, message);
        }
    });
}

function setupAntiEdit(Guru) {
    Guru.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            try {
                if (!update?.update?.message) continue;
                if (update.key?.fromMe) continue;
                if (update.key?.remoteJid === "status@broadcast") continue;
                await GuruAntiEdit(Guru, update, findAntiDelete);
            } catch (err) {
                // silent
            }
        }
    });
}

function setupStatusHandlers(Guru) {
    Guru.ev.on("messages.upsert", async (mek) => {
        try {
            mek = mek.messages[0];
            if (!mek || !mek.message) return;

            mek.message =
                getContentType(mek.message) === "ephemeralMessage"
                    ? mek.message.ephemeralMessage.message
                    : mek.message;

            if (mek.key?.remoteJid !== "status@broadcast") return;

            const s = await getAllSettings();
            const rawParticipant = mek.participant || mek.key.participantPn || mek.key.participant;
            const participantJid = await resolveRealJid(Guru, rawParticipant);
            const shouldView = s.AUTO_READ_STATUS === "true";

            const readKey = (participantJid && participantJid !== mek.key.participant)
                ? { ...mek.key, participant: participantJid }
                : mek.key;

            if (shouldView) {
                await Guru.readMessages([readKey]);
            }

            if (shouldView && s.AUTO_LIKE_STATUS === "true" && participantJid) {
                const emojis = (s.STATUS_LIKE_EMOJIS || "🦠,🦅,🪾,🍂,🥷").split(",").map(e => e.trim()).filter(Boolean);
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                const reactKey = { ...mek.key, participant: participantJid };
                await Guru.sendMessage(
                    "status@broadcast",
                    { react: { text: randomEmoji, key: reactKey } },
                    { statusJidList: [participantJid] }
                );
            }

            if (shouldView && s.AUTO_REPLY_STATUS === "true" && !mek.key.fromMe && participantJid) {
                await Guru.sendMessage(
                    participantJid,
                    { text: s.STATUS_REPLY_TEXT || DEFAULT_SETTINGS.STATUS_REPLY_TEXT },
                    { quoted: mek }
                );
            }
        } catch (error) {
            const code = error?.output?.statusCode || error?.code || "";
            const msg = error?.message || "";
            const transient =
                code === 428 ||
                msg === "Connection Closed" ||
                msg.includes("ECONNRESET") ||
                msg.includes("ETIMEDOUT") ||
                msg.includes("ECONNREFUSED") ||
                msg.includes("EPIPE");
            if (transient) return;
        }
    });
}

async function resolveRealJid(Guru, jid) {
    if (!jid) return null;
    if (!jid.endsWith('@lid')) return jid;
    try {
        const { getLidMapping } = require('./guru/connection/groupCache');
        const cached = getLidMapping(jid);
        if (cached) return cached;
    } catch (_) {}
    try {
        const resolved = await Guru.getJidFromLid(jid);
        if (resolved && !resolved.endsWith('@lid')) return resolved;
    } catch (_) {}
    try {
        const { getLidMappingFromDb } = require('./guru/database/lidMapping');
        const fromDb = await getLidMappingFromDb(jid);
        if (fromDb) return fromDb;
    } catch (_) {}
    return jid;
}

const processedMessages = new Set();
const BOT_START_TIME = Date.now();

function setupCommandHandler(Guru) {
    Guru.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "append") return;

        const ms = messages[0];
        if (!ms?.message || !ms?.key) return;

        const messageId = ms.key.id;
        if (processedMessages.has(messageId)) return;
        processedMessages.add(messageId);

        setTimeout(() => processedMessages.delete(messageId), 60000);

        const messageTimestamp =
            (ms.messageTimestamp?.low || ms.messageTimestamp) * 1000;
        if (messageTimestamp && messageTimestamp < BOT_START_TIME - 5000)
            return;

        const settings = await getAllSettings();
        const botId = standardizeJid(Guru.user?.id);

        const serialized = await serializeMessage(ms, Guru, settings);
        if (!serialized) return;

        const {
            from,
            isGroup,
            body,
            isCommand,
            command,
            args,
            sender: rawSender,
            messageAuthor,
            user,
            pushName,
            quoted,
            repliedMessage,
            mentionedJid,
            tagged,
            quotedMsg,
            quotedKey,
            quotedUser,
        } = serialized;

        const groupData = await getGroupInfo(Guru, from, botId, rawSender);
        const {
            groupInfo,
            groupName,
            participants,
            groupAdmins,
            groupSuperAdmins,
            isBotAdmin,
            isAdmin,
            isSuperAdmin,
            sender,
        } = groupData;

        const superUser = await buildSuperUsers(
            settings,
            getSudoNumbers,
            botId,
            settings.OWNER_NUMBER || "",
        );
        const isSuperUser = superUser.includes(sender);

        if (settings.AUTO_BLOCK && sender && !isSuperUser && !isGroup) {
            const countryCodes = settings.AUTO_BLOCK.split(",").map((code) =>
                code.trim(),
            );
            if (countryCodes.some((code) => sender.startsWith(code))) {
                try {
                    await Guru.updateBlockStatus(sender, "block");
                } catch (blockErr) {
                    // silent
                }
            }
        }

        const autoReadMode = settings.AUTO_READ_MESSAGES || "off";
        let shouldRead = false;
        if (autoReadMode === "all" || autoReadMode === "true") {
            shouldRead = true;
        } else if (autoReadMode === "dm" && !isGroup) {
            shouldRead = true;
        } else if (autoReadMode === "groups" && isGroup) {
            shouldRead = true;
        } else if (autoReadMode === "commands" && isCommand) {
            shouldRead = true;
        }
        if (shouldRead) await Guru.readMessages([ms.key]);

        const bodyCmd = findBodyCommand(body);
        if (bodyCmd && bodyCmd.function) {
            if (settings.MODE?.toLowerCase() === "private" && !isSuperUser)
                return;
            try {
                const helpers = createHelpers(Guru, ms, from);
                const conText = buildContext(ms, settings, helpers, {
                    from,
                    isGroup,
                    groupInfo,
                    groupName,
                    participants,
                    groupAdmins,
                    groupSuperAdmins,
                    isBotAdmin,
                    isAdmin,
                    isSuperAdmin,
                    sender,
                    superUser,
                    isSuperUser,
                    messageAuthor,
                    user,
                    pushName,
                    args,
                    quoted,
                    repliedMessage,
                    mentionedJid,
                    tagged,
                    quotedMsg,
                    quotedKey,
                    quotedUser,
                    Guru,
                    botId,
                    body,
                    command,
                });
                await bodyCmd.function(from, Guru, conText);
            } catch (error) {
                // silent
            }
        }

        if (isCommand && command) {
            const gmd = findCommand(command);
            if (!gmd) return;

            if (settings.MODE?.toLowerCase() === "private" && !isSuperUser)
                return;

            try {
                const helpers = createHelpers(Guru, ms, from);

                if (settings.AUTO_REACT === "commands") {
                    const randomEmoji =
                        emojis[Math.floor(Math.random() * emojis.length)];
                    await Guru.sendMessage(from, {
                        react: { key: ms.key, text: randomEmoji },
                    });
                } else if (gmd.react) {
                    await Guru.sendMessage(from, {
                        react: { key: ms.key, text: gmd.react },
                    });
                }

                setupGuruHelpers(Guru, from);

                const conText = buildContext(ms, settings, helpers, {
                    from,
                    isGroup,
                    groupInfo,
                    groupName,
                    participants,
                    groupAdmins,
                    groupSuperAdmins,
                    isBotAdmin,
                    isAdmin,
                    isSuperAdmin,
                    sender,
                    superUser,
                    isSuperUser,
                    messageAuthor,
                    user,
                    pushName,
                    args,
                    quoted,
                    repliedMessage,
                    mentionedJid,
                    tagged,
                    quotedMsg,
                    quotedKey,
                    quotedUser,
                    Guru,
                    botId,
                    body,
                    command,
                });

                await gmd.function(from, Guru, conText);
            } catch (error) {
                try {
                    await Guru.sendMessage(
                        from,
                        {
                            text: `❌ ${error.message}`,
                            ...(await createContext(messageAuthor, {
                                title: "Error",
                                body: "Command failed",
                            })),
                        },
                        { quoted: ms },
                    );
                } catch (sendErr) {
                    // silent
                }
            }
        }
    });
}

function setupGuruHelpers(Guru, from) {
    Guru.getJidFromLid = async (lid) => {
        const groupMetadata = await getGroupMetadata(Guru, from);
        if (!groupMetadata) return null;
        const match = groupMetadata.participants.find(
            (p) => p.lid === lid || p.id === lid,
        );
        return match?.pn || match?.phoneNumber || null;
    };

    Guru.getLidFromJid = async (jid) => {
        const groupMetadata = await getGroupMetadata(Guru, from);
        if (!groupMetadata) return null;
        const match = groupMetadata.participants.find(
            (p) =>
                p.jid === jid ||
                p.pn === jid ||
                p.phoneNumber === jid ||
                p.id === jid,
        );
        return match?.lid || null;
    };

    let fileType;
    (async () => {
        fileType = await import("file-type");
    })();

    Guru.downloadAndSaveMediaMessage = async (
        message,
        filename,
        attachExtension = true,
    ) => {
        try {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || "";
            let messageType = message.mtype
                ? message.mtype.replace(/Message/gi, "")
                : mime.split("/")[0];

            const stream = await downloadContentFromMessage(
                quoted,
                messageType,
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let fileTypeResult;
            try {
                fileTypeResult = await fileType.fileTypeFromBuffer(buffer);
            } catch (e) {}

            const extension =
                fileTypeResult?.ext ||
                mime.split("/")[1] ||
                (messageType === "image"
                    ? "jpg"
                    : messageType === "video"
                      ? "mp4"
                      : messageType === "audio"
                        ? "mp3"
                        : "bin");
            const trueFileName = attachExtension
                ? `${filename}.${extension}`
                : filename;

            await fs.writeFile(trueFileName, buffer);
            return trueFileName;
        } catch (error) {
            throw error;
        }
    };
}

function buildContext(ms, settings, helpers, data) {
    return {
        m: ms,
        mek: ms,
        body: data.body || "",
        edit: helpers.edit,
        react: helpers.react,
        del: helpers.del,
        args: data.args,
        arg: data.args,
        quoted: data.quoted,
        isCmd: data.isCommand !== undefined ? data.isCommand : true,
        command: data.command || "",
        isAdmin: data.isAdmin,
        isBotAdmin: data.isBotAdmin,
        sender: data.sender,
        pushName: data.pushName,
        setSudo,
        delSudo,
        q: data.args.join(" "),
        reply: helpers.reply,
        config,
        superUser: data.superUser,
        tagged: data.tagged,
        mentionedJid: data.mentionedJid,
        isGroup: data.isGroup,
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
        from: data.from,
        groupAdmins: data.groupAdmins,
        participants: data.participants,
        repliedMessage: data.repliedMessage,
        quotedMsg: data.quotedMsg,
        quotedKey: data.quotedKey,
        quotedUser: data.quotedUser,
        isSuperUser: data.isSuperUser,
        botMode: settings.MODE,
        botPic: settings.BOT_PIC || BOT_CONFIG.imageUrl,
        botFooter: settings.FOOTER || "ULTRA GURU",
        botCaption: settings.CAPTION || "⚡ GuruTech",
        botVersion: BOT_CONFIG.version,
        ownerNumber: settings.OWNER_NUMBER,
        ownerName: BOT_CONFIG.owner,
        botName: BOT_CONFIG.name,
        guruhRepo: BOT_CONFIG.repo,
        packName: settings.PACK_NAME,
        packAuthor: settings.PACK_AUTHOR || BOT_CONFIG.owner,
        isSuperAdmin: data.isSuperAdmin,
        getMediaBuffer,
        getFileContentType,
        bufferToStream,
        uploadToPixhost,
        uploadToImgBB,
        setCommitHash,
        getCommitHash,
        uploadToGithubCdn,
        uploadToGuruCdn,
        uploadToCatbox,
        newsletterUrl: BOT_CONFIG.newsletter,
        newsletterJid: BOT_CONFIG.newsletter,
        GuruTechApi,
        GuruApiKey,
        botPrefix: settings.PREFIX,
        timeZone: settings.TIME_ZONE,
    };
}

(async () => {
    await loadSession();
    await loadBotSettings();
    startGuru();
})();
