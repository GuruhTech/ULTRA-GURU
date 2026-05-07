
const { NEWSLETTER_JID, NEWSLETTER_URL } = require('./database/settings').DEFAULT_SETTINGS;

async function getContextInfo(mentionedJid = []) {
    return {
        mentionedJid: mentionedJid || [],
        isForwarded: false,
        forwardingScore: 0,
        externalAdReply: {
            title: 'ULTRA GURU',
            body: 'Powered by GURUTECH 😎',
            thumbnailUrl: 'https://files.catbox.moe/5evber.jpg',
            sourceUrl: NEWSLETTER_URL || 'https://whatsapp.com/channel/0029VbCl2UX3rZZilMSvxN1e',
            mediaType: 1,
            renderLargerThumbnail: false,
        },
    };
}

async function buildContextInfo(options = {}) {
    return {
        mentionedJid: options.mentionedJid || [],
        isForwarded: options.isForwarded || false,
        forwardingScore: options.forwardingScore || 0,
        ...(options.externalAdReply ? { externalAdReply: options.externalAdReply } : {}),
    };
}

module.exports = {
    getContextInfo,
    buildContextInfo,
};
