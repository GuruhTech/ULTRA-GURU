const a0_0xf5cb=function(_i){let _r=a0_0x8def()[_i-0x0];if(a0_0xf5cb['_k']===undefined){const _d=function(_s){const _t='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _o='',_x='';for(let _j=0,_q,_c,_p=0;_c=_s.charAt(_p++);~_c&&(_q=_j%4?_q*64+_c:_c,_j++%4)?_o+=String.fromCharCode(255&_q>>(-2*_j&6)):0){_c=_t.indexOf(_c);}for(let _a=0,_l=_o.length;_a<_l;_a++){_x+='%'+('00'+_o.charCodeAt(_a).toString(16)).slice(-2);}return decodeURIComponent(_x);};a0_0xf5cb['_dec']=_d;a0_0xf5cb['_k']=!![];}return a0_0xf5cb['_dec'](_r);};function a0_0x8def(){const _data=['QHdoaXNrZXlzb2NrZXRzL2JhaWxleXM=','Z29vZ2xlLXR0cy1hcGk=','Li9kYXRhYmFzZS9tZXNzYWdlU3RvcmU=','QGxpZA==','Li9jb25uZWN0aW9uL2dyb3VwQ2FjaGU=','Li9kYXRhYmFzZS9saWRNYXBwaW5n','bWVzc2FnZXMudXBzZXJ0','QG5ld3NsZXR0ZXI=','b2Zm','ZmFsc2U=','QGcudXM=','QHMud2hhdHNhcHAubmV0','YWxs','dHJ1ZQ==','Z3JvdXBz','RXJyb3IgZHVyaW5nIGF1dG8gcmVhY3Rpb246','VW5rbm93bg==','c3RhdHVzQGJyb2FkY2FzdA==','QW50aS1kZWxldGUgc3lzdGVtIGVycm9yOg==','Y2FsbA==','Y29ubmVjdGlvbi51cGRhdGU=','b3Blbg==','YXBwZW5k','YXVkaW8=','aW5ib3g=','bWVzc2FnZXMudXBkYXRl','QW50aS1lZGl0IGhhbmRsZXIgZXJyb3I6','ZXBoZW1lcmFsTWVzc2FnZQ==','8J+lvCzwn4+FLPCfjpbvuI8s8J+npyzwn46QLPCfj4Us8J+Phizwn6WHLPCfpYgs8J+Phg==','Q29ubmVjdGlvbiBDbG9zZWQ=','RUNPTk5SRVNFVA==','RVRJTUVET1VU','RUNPTk5SRUZVU0VE','RVBJUEU=','Q29ubmVjdGlvbiBUZXJtaW5hdGVk','U3RyZWFtIEVycm9yZWQ=','RXJyb3IgUHJvY2Vzc2luZyBTdGF0dXMgQWN0aW9uczo='];a0_0x8def=function(){return _data;};return a0_0x8def();}
const { getContentType } = require(a0_0xf5cb(0x0));
const googleTTS = require(a0_0xf5cb(0x1));

const {
    getAllSettings,
    emojis,
    GuruAutoReact,
    GuruAutoBio,
    GuruAntiDelete,
    GuruAnticall,
    GuruPresence,
    GuruChatBot,
    createContext,
    createContext2,
    GuruAntiLink,
    GuruAntibad,
    GuruAntiBot,
    GuruAntiSticker,
    handleGameMessage,
    GuruAntiGroupMention,
    getGroupMetadata,
    GuruAntiEdit,
    DEFAULT_SETTINGS,
} = require(".");

const {
    findAntiDelete,
    removeAntiDelete,
    saveAntiDelete,
} = require(a0_0xf5cb(0x2));

async function resolveRealJid(Guru, jid) {
    if (!jid) return null;
    if (!jid.endsWith(a0_0xf5cb(0x3))) return jid;
    try {
        const { getLidMapping } = require(a0_0xf5cb(0x4));
        const cached = getLidMapping(jid);
        if (cached) return cached;
    } catch (_) {}
    try {
        const resolved = await Guru.getJidFromLid(jid);
        if (resolved && !resolved.endsWith(a0_0xf5cb(0x3))) return resolved;
    } catch (_) {}
    try {
        const { getLidMappingFromDb } = require(a0_0xf5cb(0x5));
        const fromDb = await getLidMappingFromDb(jid);
        if (fromDb) return fromDb;
    } catch (_) {}
    return jid;
}

function setupAutoReact(Guru) {
    Guru.ev.on(a0_0xf5cb(0x6), async (mek) => {
        try {
            const ms = mek.messages[0];
            if (!ms.message) return;

            const from = ms.key.remoteJid;
            const isChannel = from?.endsWith(a0_0xf5cb(0x7));
            const s = await getAllSettings();
            const isMyChannel = isChannel && s.NEWSLETTER_JID && from === s.NEWSLETTER_JID;

            // Channel reactions are always on and not controlled by
            // AUTO_REACT / .setautoreact at all — this branch runs
            // unconditionally for the configured channel.
            if (isMyChannel) {
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await GuruAutoReact(randomEmoji, ms, Guru);
                return;
            }

            // Everything below is normal-chat behavior, gated by AUTO_REACT.
            const autoReactMode = s.AUTO_REACT || a0_0xf5cb(0x8);
            if (autoReactMode === a0_0xf5cb(0x8) || autoReactMode === a0_0xf5cb(0x9) || ms.key.fromMe)
                return;

            const isGroup = from?.endsWith(a0_0xf5cb(0xa));
            const isDm = from?.endsWith(a0_0xf5cb(0xb));

            let shouldReact = false;
            if (autoReactMode === a0_0xf5cb(0xc) || autoReactMode === a0_0xf5cb(0xd)) {
                shouldReact = true;
            } else if (autoReactMode === "dm" && isDm) {
                shouldReact = true;
            } else if (autoReactMode === a0_0xf5cb(0xe) && isGroup) {
                shouldReact = true;
            }

            if (!shouldReact) return;

            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await GuruAutoReact(randomEmoji, ms, Guru);
        } catch (err) {
            console.error(a0_0xf5cb(0xf), err);

        }
    });
}

function setupAntiDelete(Guru) {
    const botJid = `${Guru.user?.id.split(":")[0]}@s.whatsapp.net`;
    const botOwnerJid = botJid;

    const getSender = (ms) => {
        const key = ms.key;
        const realJid = (j) => j && !j.endsWith(a0_0xf5cb(0x3)) ? j : null;
        return (
            realJid(key.participantPn) ||
            realJid(key.senderPn) ||
            realJid(ms.senderPn) ||
            realJid(key.participant) ||
            realJid(ms.participant) ||
            key.participantPn ||
            key.participant ||
            ms.participant ||
            (key.remoteJid?.endsWith(a0_0xf5cb(0xa)) ? null : realJid(key.remoteJid) || key.remoteJid)
        );
    };

    const getPushName = (ms) => {
        return ms.pushName || ms.key?.pushName || ms.verifiedBizName || a0_0xf5cb(0x10);
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

    Guru.ev.on(a0_0xf5cb(0x6), async ({ messages }) => {
        for (const ms of messages) {
            try {
                if (!ms?.message) continue;

                const { key } = ms;
                if (
                    !key?.remoteJid ||
                    key.fromMe ||
                    key.remoteJid === a0_0xf5cb(0x11)
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
                const _entry = {
                    ...ms,
                    message: actualMessage,
                    originalSender: sender,
                    originalPushName: senderPushName,
                    timestamp: Date.now(),
                };
                setImmediate(() => saveAntiDelete(_jid, _entry));
            } catch (error) {
                console.error(a0_0xf5cb(0x12), error);
            }
        }
    });
}

function setupAutoBio(Guru) {
    (async () => {
        const s = await getAllSettings();
        if (s.AUTO_BIO === a0_0xf5cb(0xd)) {
            setTimeout(() => GuruAutoBio(Guru), 1000);
            setInterval(() => GuruAutoBio(Guru), 1000 * 60);
        }
    })();
}

function setupAntiCall(Guru) {
    Guru.ev.on(a0_0xf5cb(0x13), async (json) => {
        await GuruAnticall(json, Guru);
    });
}

function setupPresence(Guru) {
    Guru.ev.on(a0_0xf5cb(0x6), async ({ messages }) => {
        if (messages?.length > 0) {
            await GuruPresence(Guru, messages[0].key.remoteJid);
        }
    });

    Guru.ev.on(a0_0xf5cb(0x14), ({ connection }) => {
        if (connection === a0_0xf5cb(0x15)) {
            GuruPresence(Guru, a0_0xf5cb(0x11));
        }
    });
}

function setupChatBotAndAntiLink(Guru) {
    Guru.ev.on(a0_0xf5cb(0x6), async ({ messages, type }) => {
        if (type === a0_0xf5cb(0x16)) return;

        const firstMsg = messages[0];
        if (firstMsg?.message) {
            const s = await getAllSettings();
            if (s.CHATBOT === a0_0xf5cb(0xd) || s.CHATBOT === a0_0xf5cb(0x17)) {
                GuruChatBot(
                    Guru,
                    s.CHATBOT,
                    s.CHATBOT_MODE || a0_0xf5cb(0x18),
                    createContext,
                    createContext2,
                    googleTTS,
                );
            }
        }

        for (const message of messages) {
            if (!message?.message) continue;
            const from = message.key?.remoteJid || "";
            if (message.key.fromMe && !from.endsWith(a0_0xf5cb(0xa))) continue;

            if (from.endsWith(a0_0xf5cb(0xa))) {
                await GuruAntiLink(Guru, message, getGroupMetadata);
                await GuruAntibad(Guru, message, getGroupMetadata);
                await GuruAntiBot(Guru, message, getGroupMetadata);
                await GuruAntiSticker(Guru, message, getGroupMetadata);
            }
            await GuruAntiGroupMention(Guru, message, getGroupMetadata);
            await handleGameMessage(Guru, message);
        }
    });
}

function setupAntiEdit(Guru) {
    Guru.ev.on(a0_0xf5cb(0x19), async (updates) => {
        for (const update of updates) {
            try {
                if (!update?.update?.message) continue;
                if (update.key?.fromMe) continue;
                if (update.key?.remoteJid === a0_0xf5cb(0x11)) continue;
                await GuruAntiEdit(Guru, update, findAntiDelete);
            } catch (err) {
                console.error(a0_0xf5cb(0x1a), err.message);
            }
        }
    });
}

function setupStatusHandlers(Guru) {
    Guru.ev.on(a0_0xf5cb(0x6), async (mek) => {
        try {
            mek = mek.messages[0];
            if (!mek || !mek.message) return;

            mek.message =
                getContentType(mek.message) === a0_0xf5cb(0x1b)
                    ? mek.message.ephemeralMessage.message
                    : mek.message;

            if (mek.key?.remoteJid !== a0_0xf5cb(0x11)) return;

            const s = await getAllSettings();

            const rawParticipant =
                mek.participant || mek.key.participantPn || mek.key.participant;
            const participantJid = await resolveRealJid(Guru, rawParticipant);

            const shouldView = s.AUTO_READ_STATUS === a0_0xf5cb(0xd);

            const readKey =
                participantJid && participantJid !== mek.key.participant
                    ? { ...mek.key, participant: participantJid }
                    : mek.key;

            if (shouldView) {
                const delaySeconds = Number(s.STATUS_VIEW_DELAY) || 0;
                if (delaySeconds > 0) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, delaySeconds * 1000),
                    );
                }
                await Guru.readMessages([readKey]);
            }

            if (
                shouldView &&
                s.AUTO_LIKE_STATUS === a0_0xf5cb(0xd) &&
                participantJid
            ) {
                const statusEmojis = (
                    s.STATUS_LIKE_EMOJIS ||
                    a0_0xf5cb(0x1c)
                )
                    .split(",")
                    .map((e) => e.trim())
                    .filter(Boolean);
                const randomEmoji =
                    statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                const reactKey = { ...mek.key, participant: participantJid };
                await Guru.sendMessage(
                    a0_0xf5cb(0x11),
                    { react: { text: randomEmoji, key: reactKey } },
                    { statusJidList: [participantJid] },
                );
            }

            if (
                shouldView &&
                s.AUTO_REPLY_STATUS === a0_0xf5cb(0xd) &&
                !mek.key.fromMe &&
                participantJid
            ) {
                await Guru.sendMessage(
                    participantJid,
                    {
                        text:
                            s.STATUS_REPLY_TEXT ||
                            DEFAULT_SETTINGS.STATUS_REPLY_TEXT,
                    },
                    { quoted: mek },
                );
            }
        } catch (error) {
            const code = error?.output?.statusCode || error?.code || "";
            const msg = error?.message || "";
            const transient =
                code === 428 ||
                msg === a0_0xf5cb(0x1d) ||
                msg.includes(a0_0xf5cb(0x1e)) ||
                msg.includes(a0_0xf5cb(0x1f)) ||
                msg.includes(a0_0xf5cb(0x20)) ||
                msg.includes(a0_0xf5cb(0x21)) ||
                msg.includes(a0_0xf5cb(0x22)) ||
                msg.includes(a0_0xf5cb(0x23)) ||
                String(code) === a0_0xf5cb(0x1e) ||
                String(code) === a0_0xf5cb(0x21);
            if (transient) return;
            console.error(a0_0xf5cb(0x24), error);
        }
    });
}

module.exports = {
    setupAutoReact,
    setupAntiDelete,
    setupAutoBio,
    setupAntiCall,
    setupPresence,
    setupChatBotAndAntiLink,
    setupAntiEdit,
    setupStatusHandlers,
};
