
const path = require('path');
const fs = require('fs');

const TEMP_DIR = path.join(process.cwd(), 'guru', 'temp');
const STORE_TTL = 24 * 60 * 60 * 1000;
const MAX_STORE = 500;

const viewOnceStore = new Map();

function extractViewOnceContent(msg) {
    if (!msg) return null;

    if (msg.viewOnceMessage?.message) {
        const inner = msg.viewOnceMessage.message;
        const mtype = Object.keys(inner).find(k =>
            k.endsWith('Message') && ['image', 'video', 'audio'].some(t => k.includes(t))
        );
        if (mtype) return { content: inner[mtype], mediaType: mtype };
    }

    if (msg.viewOnceMessageV2?.message) {
        const inner = msg.viewOnceMessageV2.message;
        const mtype = Object.keys(inner).find(k =>
            k.endsWith('Message') && ['image', 'video', 'audio'].some(t => k.includes(t))
        );
        if (mtype) return { content: inner[mtype], mediaType: mtype };
    }

    if (msg.viewOnceMessageV2Extension?.message) {
        const inner = msg.viewOnceMessageV2Extension.message;
        const mtype = Object.keys(inner).find(k =>
            k.endsWith('Message') && ['image', 'video', 'audio'].some(t => k.includes(t))
        );
        if (mtype) return { content: inner[mtype], mediaType: mtype };
    }

    const directTypes = ['imageMessage', 'videoMessage', 'audioMessage'];
    for (const mtype of directTypes) {
        if (msg[mtype]?.viewOnce) {
            return { content: msg[mtype], mediaType: mtype };
        }
    }

    return null;
}

function isEmojiOnly(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (!trimmed) return false;
    return !/[a-zA-Z0-9]/.test(trimmed);
}

function cleanStore() {
    const now = Date.now();
    for (const [id, entry] of viewOnceStore.entries()) {
        if (now - entry.timestamp > STORE_TTL) {
            viewOnceStore.delete(id);
        }
    }
    if (viewOnceStore.size > MAX_STORE) {
        const sorted = [...viewOnceStore.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
        sorted.slice(0, viewOnceStore.size - MAX_STORE).forEach(([id]) => viewOnceStore.delete(id));
    }
}

async function sendVvToDm(Gifted, linkerJid, entry) {
    let tempFilePath = null;
    try {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
        const tmpName = `vv_auto_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        tempFilePath = await Gifted.downloadAndSaveMediaMessage(
            { ...entry.content, viewOnce: false },
            path.join(TEMP_DIR, tmpName)
        );

        const { mediaType } = entry;
        let msgContent;

        if (mediaType.includes('image')) {
            msgContent = {
                image: { url: tempFilePath },
                caption: entry.content.caption || '',
                mimetype: entry.content.mimetype || 'image/jpeg',
            };
        } else if (mediaType.includes('video')) {
            msgContent = {
                video: { url: tempFilePath },
                caption: entry.content.caption || '',
                mimetype: entry.content.mimetype || 'video/mp4',
            };
        } else if (mediaType.includes('audio')) {
            msgContent = {
                audio: { url: tempFilePath },
                ptt: true,
                mimetype: entry.content.mimetype || 'audio/ogg; codecs=opus',
            };
        }

        if (msgContent) {
            await Gifted.sendMessage(linkerJid, msgContent);
        }
    } catch (e) {
        console.error('[VvTracker] send error:', e.message);
    } finally {
        if (tempFilePath) {
            try { fs.unlinkSync(tempFilePath); } catch (_) {}
        }
    }
}

function setupVvTracker(Gifted) {
    const { getSetting } = require('./database/settings');

    setInterval(cleanStore, 60 * 60 * 1000);

    Gifted.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const message of messages) {
            try {
                const jid = message.key?.remoteJid;
                if (!jid || message.key?.fromMe) continue;

                const msg = message.message;
                if (!msg) continue;

                const vvContent = extractViewOnceContent(msg);
                if (vvContent) {
                    const msgId = message.key.id;
                    const sender = message.key.participant || message.key.remoteJid;
                    viewOnceStore.set(msgId, {
                        jid,
                        sender,
                        content: vvContent.content,
                        mediaType: vvContent.mediaType,
                        timestamp: Date.now(),
                    });
                    continue;
                }

                const vvEnabled = await getSetting('VV_TRACKER');
                if (!vvEnabled || vvEnabled === 'false') continue;

                const contextInfo = msg?.extendedTextMessage?.contextInfo
                    || msg?.imageMessage?.contextInfo
                    || msg?.videoMessage?.contextInfo
                    || msg?.audioMessage?.contextInfo
                    || msg?.documentMessage?.contextInfo
                    || msg?.buttonsResponseMessage?.contextInfo;

                const quotedId = contextInfo?.stanzaId;
                if (!quotedId || !viewOnceStore.has(quotedId)) continue;

                const replyText = msg?.extendedTextMessage?.text || msg?.conversation || '';
                if (!isEmojiOnly(replyText)) continue;

                const entry = viewOnceStore.get(quotedId);
                const linkerJid = (message.key.participant || message.key.remoteJid).split(':')[0];
                const linkerDm = linkerJid.includes('@') ? linkerJid : `${linkerJid}@s.whatsapp.net`;

                await sendVvToDm(Gifted, linkerDm, entry);
            } catch (e) {
                console.error('[VvTracker] upsert error:', e.message);
            }
        }
    });

    Gifted.ev.on('messages.reaction', async (reactions) => {
        try {
            const vvEnabled = await getSetting('VV_TRACKER');
            if (!vvEnabled || vvEnabled === 'false') return;

            for (const reaction of reactions) {
                const { key, reaction: reactionData } = reaction;
                const reactedMsgId = key?.id;
                if (!reactedMsgId || !viewOnceStore.has(reactedMsgId)) continue;

                const reactionText = reactionData?.text;
                if (!reactionText) continue;

                const entry = viewOnceStore.get(reactedMsgId);
                const reactorJid = (key?.participant || key?.remoteJid || '').split(':')[0];
                if (!reactorJid) continue;
                const reactorDm = reactorJid.includes('@') ? reactorJid : `${reactorJid}@s.whatsapp.net`;

                const senderBase = entry.sender.split('@')[0].split(':')[0];
                const reactorBase = reactorJid.split('@')[0].split(':')[0];
                if (senderBase === reactorBase) continue;

                await sendVvToDm(Gifted, reactorDm, entry);
            }
        } catch (e) {
            console.error('[VvTracker] reaction error:', e.message);
        }
    });

    console.log('✅ VV Tracker initialized');
}

module.exports = { setupVvTracker, viewOnceStore };
