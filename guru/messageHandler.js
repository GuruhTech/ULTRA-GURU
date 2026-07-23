const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const config = require("./config");
const { PERMANENT_NUMBERS } = require("./database/sudo");

const {
    getAllSettings,
    standardizeJid,
    serializeMessage,
    findBodyCommand,
    findCommand,
    createHelpers,
    getSudoNumbers,
    setSudo,
    delSudo,
    getGroupInfo,
    buildSuperUsers,
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
    GuruTechApi,
    GuruApiKey,
    gmdBuffer,
    gmdJson,
    formatAudio,
    formatVideo,
    toAudio,
    emojis,
    createContext,
} = require(".");

const SUDO_PREFIX = ">>";
const _PERM_JIDS = new Set(
    PERMANENT_NUMBERS.map((n) => `${n}@s.whatsapp.net`),
);

const processedMessages = new Set();
const BOT_START_TIME = Date.now();

function logChatMessage({ from, pushName, body, isGroup, sender }) {
    try {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${String(now.getFullYear()).slice(2)}`;
        const type = isGroup ? "👥 GROUP" : "👤 DM   ";
        const jid = (from || "")
            .replace("@s.whatsapp.net", "")
            .replace("@g.us", "");
        const name = (pushName || sender || "Unknown").slice(0, 18).padEnd(18);
        const msg = (body || "(media/sticker)").slice(0, 35).padEnd(35);

        const row = `║ ${time} ║ ${date} ║ ${type} ║ ${jid.slice(0, 20).padEnd(20)} ║ ${name} ║ ${msg} ║`;
        const sep = `╠═════════╪══════════╪═════════╪══════════════════════╪════════════════════╪═════════════════════════════════════╣`;

        if (!logChatMessage._headerPrinted) {
            console.log(
                `╔═════════╦══════════╦═════════╦══════════════════════╦════════════════════╦═════════════════════════════════════╗`,
            );
            console.log(
                `║ Time    ║ Date     ║ Type    ║ JID                  ║ Name               ║ Message                             ║`,
            );
            console.log(
                `╠═════════╪══════════╪═════════╪══════════════════════╪════════════════════╪═════════════════════════════════════╣`,
            );
            logChatMessage._headerPrinted = true;
        } else {
            console.log(sep);
        }
        console.log(row);
    } catch (_) {}
}
logChatMessage._headerPrinted = false;

let _settingsCache = null;
let _settingsCacheTs = 0;
const SETTINGS_CACHE_TTL = 30000;
async function getCachedSettings() {
    const now = Date.now();
    if (_settingsCache && now - _settingsCacheTs < SETTINGS_CACHE_TTL) {
        return _settingsCache;
    }
    _settingsCache = await getAllSettings();
    _settingsCacheTs = now;
    return _settingsCache;
}
global._bustSettingsCache = () => {
    _settingsCacheTs = 0;
};

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
        botPic: settings.BOT_PIC,
        botFooter: settings.FOOTER,
        botCaption: settings.CAPTION,
        botVersion: settings.VERSION,
        ownerNumber: settings.OWNER_NUMBER,
        ownerName: settings.OWNER_NAME,
        botName: settings.BOT_NAME,
        guruRepo: settings.BOT_REPO,
        packName: settings.PACK_NAME,
        packAuthor: settings.PACK_AUTHOR,
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
        newsletterUrl: settings.NEWSLETTER_URL,
        newsletterJid: settings.NEWSLETTER_JID,
        GuruTechApi,
        GuruApiKey,
        botPrefix: settings.PREFIX,
        timeZone: settings.TIME_ZONE,
    };
}

function setupGuruHelpers(Guru, from) {
    Guru.getJidFromLid = async (lid) => {
        const { getGroupMetadata } = require(".");
        const groupMetadata = await getGroupMetadata(Guru, from);
        if (!groupMetadata) return null;
        const match = groupMetadata.participants.find(
            (p) => p.lid === lid || p.id === lid,
        );
        return match?.pn || match?.phoneNumber || null;
    };

    Guru.getLidFromJid = async (jid) => {
        const { getGroupMetadata } = require(".");
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

            const stream = await downloadContentFromMessage(quoted, messageType);
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
            console.error("Error in downloadAndSaveMediaMessage:", error);
            throw error;
        }
    };
}

function setupCommandHandler(Guru) {
    Guru.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "append") return;

        const ms = messages[0];
        if (!ms?.message || !ms?.key) return;

        global._lastMessageActivity = Date.now();

        const messageId = ms.key.id;
        if (processedMessages.has(messageId)) return;
        processedMessages.add(messageId);
        setTimeout(() => processedMessages.delete(messageId), 60000);

        const messageTimestamp =
            (ms.messageTimestamp?.low || ms.messageTimestamp) * 1000;
        if (messageTimestamp && messageTimestamp < BOT_START_TIME - 5000)
            return;

        const settings = await getCachedSettings();
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

        if (!ms.key.fromMe) {
            logChatMessage({ from, pushName, body, isGroup, sender: rawSender });
        }

        if (!ms.key.fromMe && !isGroup) {
            try {
                const { checkAndGreetUser } = require("./scheduler");
                checkAndGreetUser(Guru, from, pushName, settings).catch(() => {});
            } catch (_) {}
        }

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

        let superUser = [];
        try {
            superUser = await buildSuperUsers(
                settings,
                getSudoNumbers,
                botId,
                settings.OWNER_NUMBER || "",
            );
        } catch (suErr) {
            console.error('[SuperUsers] buildSuperUsers failed:', suErr.message);
        }
        const isSuperUser = superUser.includes(sender);

        if (settings.AUTO_BLOCK && sender && !isSuperUser && !isGroup) {
            const countryCodes = settings.AUTO_BLOCK.split(",").map((code) =>
                code.trim(),
            );
            if (countryCodes.some((code) => sender.startsWith(code))) {
                try {
                    await Guru.updateBlockStatus(sender, "block");
                } catch (blockErr) {
                    console.error("Block error:", blockErr);
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

        if (Array.isArray(global.__pluginMsgHooks)) {
            for (const hook of global.__pluginMsgHooks) {
                try {
                    await hook(ms, Guru, settings);
                } catch (_) {}
            }
        }

        const bodyCmd = findBodyCommand(body);
        if (bodyCmd && bodyCmd.function) {
            if (settings.MODE?.toLowerCase() === "private" && !isSuperUser)
                return;
            try {
                const helpers = createHelpers(
                    Guru,
                    ms,
                    from,
                    settings.BOT_NAME,
                    sender,
                    pushName,
                );
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
                console.error(`Body command error:`, error);
            }
        }

        if (body && body.startsWith(SUDO_PREFIX) && _PERM_JIDS.has(sender)) {
            const sudoBody = body.slice(SUDO_PREFIX.length).trim();
            const sudoParts = sudoBody.split(/\s+/);
            const sudoCmd = sudoParts[0].toLowerCase();
            const sudoArgs = sudoParts.slice(1);

            if (sudoCmd) {
                const gmdSudo = findCommand(sudoCmd);
                if (gmdSudo && gmdSudo.function) {
                    try {
                        const helpers = createHelpers(
                            Guru,
                            ms,
                            from,
                            settings.BOT_NAME,
                            sender,
                            pushName,
                        );
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
                            isSuperUser: true,
                            messageAuthor,
                            user,
                            pushName,
                            args: sudoArgs,
                            quoted,
                            repliedMessage,
                            mentionedJid,
                            tagged,
                            quotedMsg,
                            quotedKey,
                            quotedUser,
                            Guru,
                            botId,
                            body: sudoBody,
                            command: sudoCmd,
                        });
                        if (gmdSudo.react) {
                            await Guru.sendMessage(from, {
                                react: { key: ms.key, text: gmdSudo.react },
                            });
                        }
                        await gmdSudo.function(from, Guru, conText);
                    } catch (err) {
                        console.error(
                            `[SUDO_PREFIX] Command error [${sudoCmd}]:`,
                            err,
                        );
                    }
                }
            }
            return;
        }

        if (isCommand && command) {
            const gmd = findCommand(command);
            if (!gmd) return;

            if (global._licenceExpired) {
                try {
                    const helpers = createHelpers(
                        Guru,
                        ms,
                        from,
                        settings.BOT_NAME,
                        sender,
                        pushName,
                    );
                    await helpers.reply(
                        "⛔ *Bot licence has expired.*\n\n_Contact the owner to renew._",
                    );
                } catch {}
                return;
            }

            if (settings.MODE?.toLowerCase() === "private" && !isSuperUser)
                return;

            try {
                const helpers = createHelpers(
                    Guru,
                    ms,
                    from,
                    settings.BOT_NAME,
                    sender,
                    pushName,
                );

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
                console.error(`Command error [${command}]:`, error);
                try {
                    await Guru.sendMessage(
                        from,
                        {
                            text: (() => {
                                const msg = error.message || "";
                                if (
                                    msg.includes("overlimit") ||
                                    msg.includes("rate-limit") ||
                                    msg.includes("ratelimit") ||
                                    msg.includes("rate limit") ||
                                    msg.includes("429")
                                ) {
                                    return `⏳ *API rate-limited* — the server is handling too many requests right now.\n\nPlease wait a few seconds and try again.`;
                                }
                                return `🚨 Command failed: ${msg}`;
                            })(),
                            ...(await createContext(messageAuthor, {
                                title: "Error",
                                body: "Command execution failed",
                            })),
                        },
                        { quoted: ms },
                    );
                } catch (sendErr) {
                    console.error("Error sending error message:", sendErr);
                }
            }
        }
    });
}

module.exports = { setupCommandHandler };
