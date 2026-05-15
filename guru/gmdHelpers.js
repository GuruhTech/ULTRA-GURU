const { getSetting } = require("./database/settings");

const originalConsoleInfo = console.info;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const suppressedPatterns = [
    /Closing session/i,
    /Closing open session/i,
    /Removing old closed session/i,
    /Decrypted message with closed session/i,
    /in favor of incoming/i,
    /prekey bundle/i,
    /SessionEntry/i,
    /failed to decrypt/i,
    /Bad MAC/i,
    /Session error/i,
    /libsignal/i,
    /session_cipher/i,
    /_chains/i,
    /ephemeralKeyPair/i,
    /rootKey/i,
    /baseKey/i,
    /pendingPreKey/i,
    /indexInfo/i,
    /currentRatchet/i,
    /registrationId/i,
    /remoteIdentityKey/i,
    /lastRemoteEphemeralKey/i,
    /verifyMAC/i,
    /decryptWithSessions/i,
    /doDecryptWhisperMessage/i,
    /_asyncQueueExecutor/i,
    /Interactive send/i,
];

const argToString = (a) => {
    if (typeof a === "string") return a;
    if (a instanceof Error) return a.message + " " + (a.stack || "");
    if (a && typeof a === "object") {
        try { return JSON.stringify(a); } catch (_) {}
        try { return String(a); } catch (_) {}
    }
    return String(a ?? "");
};

const shouldSuppress = (args) => {
    const str = args.map(argToString).join(" ");
    if (suppressedPatterns.some((p) => p.test(str))) return true;
    if (args.some((a) => a && typeof a === "object" && (a._chains || a.indexInfo || a.currentRatchet))) return true;
    return false;
};

function setupConsoleFilters() {
    console.info = (...args) => {
        if (shouldSuppress(args)) return;
        originalConsoleInfo.apply(console, args);
    };

    console.log = (...args) => {
        if (shouldSuppress(args)) return;
        originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
        if (shouldSuppress(args)) return;
        originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
        if (shouldSuppress(args)) return;
        originalConsoleWarn.apply(console, args);
    };
}

setupConsoleFilters();

const createContext = async (userJid, options = {}) => {
    const botName = (await getSetting("BOT_NAME")) || "𝐔𝐋𝐓𝐑𝐀 𝐆𝐔𝐑𝐔";
    const botPic =
        (await getSetting("BOT_PIC")) ||
        "https://files.catbox.moe/5evber.jpg";
    const newsletterJid =
        (await getSetting("NEWSLETTER_JID")) || "120363406649804510@newsletter";
    const newsletterUrl =
        (await getSetting("NEWSLETTER_URL")) ||
        "https://whatsapp.com/channel/0029VbCl2UX3rZZilMSvxN1e";

    return {
        contextInfo: {
            mentionedJid: [userJid],
            forwardingScore: 1,
            isForwarded: true,
            businessMessageForwardInfo: {
                businessOwnerJid: newsletterJid,
            },
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: botName,
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
            externalAdReply: {
                title: options.title || botName,
                body: options.body || "Powered by GuruTech",
                thumbnailUrl: botPic,
                mediaType: 1,
                mediaUrl: options.mediaUrl || botPic,
                sourceUrl: options.sourceUrl || newsletterUrl,
                showAdAttribution: true,
                renderLargerThumbnail: false,
            },
        },
    };
};

const createContext2 = async (userJid, options = {}) => {
    const botName = (await getSetting("BOT_NAME")) || "ULTRA GURU";
    const botPic =
        (await getSetting("BOT_PIC")) ||
        "https://files.catbox.moe/5evber.jpg";
    const newsletterJid =
        (await getSetting("NEWSLETTER_JID")) || "120363406649804510@newsletter";

    return {
        contextInfo: {
            mentionedJid: [userJid],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: botName,
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
            externalAdReply: {
                title: options.title || botName,
                body: options.body || "Powered by Gifted Tech",
                thumbnailUrl: botPic,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true,
            },
        },
    };
};

module.exports = {
    createContext,
    createContext2,
};
