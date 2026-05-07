
const { downloadMediaMessage, getContentType, normalizeMessageContent, jidNormalizedUser } = require('gifted-baileys');

function convertLidToJid(lid) {
    if (!lid) return null;
    try {
        const { globalLidMapping } = require('gifted-baileys/lib/Utils/lid-mapping');
        if (lid.endsWith('@lid')) {
            return globalLidMapping.get(lid) || null;
        }
    } catch (e) {}
    return lid;
}

function standardizeJid(jid) {
    if (!jid) return jid;
    try {
        return jidNormalizedUser(jid);
    } catch (e) {
        return jid;
    }
}

function getMessageType(message) {
    if (!message) return null;
    const msg = message.message || message;
    return getContentType(msg);
}

function serializeMessage(message, Gifted) {
    if (!message) return message;
    const m = message;
    const body = m.message?.conversation
        || m.message?.extendedTextMessage?.text
        || m.message?.imageMessage?.caption
        || m.message?.videoMessage?.caption
        || m.message?.documentMessage?.caption
        || '';
    return { ...m, body };
}

module.exports = {
    downloadMediaMessage,
    convertLidToJid,
    standardizeJid,
    getMessageType,
    serializeMessage,
};
