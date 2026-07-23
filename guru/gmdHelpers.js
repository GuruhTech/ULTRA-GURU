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
        "https://res.cloudinary.com/dqxlb29uz/image/upload/v1780267810/bwm_uploads/media-1780267810008.jpg";
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
        "https://res.cloudinary.com/dqxlb29uz/image/upload/v1780267810/bwm_uploads/media-1780267810008.jpg";
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
                body: options.body || "Powered by Guru Tech",
                thumbnailUrl: botPic,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true,
            },
        },
    };
};

/**
 * createFakeContact — sends a vCard contact card showing the sender's
 * name, number and profile picture before each bot response.
 *
 * @param {object} Guru   - Baileys WA socket
 * @param {string} from     - remoteJid (chat/group to send to)
 * @param {string} sender   - sender's JID e.g. 2547xxxxxx@s.whatsapp.net
 * @param {string} pushName - sender's display name from WhatsApp
 * @param {object} mek      - quoted message object
 */
const createFakeContact = async (Guru, from, sender, pushName, mek) => {
    try {
        // Extract a clean phone number from the JID
        const phone = sender.replace(/@s\.whatsapp\.net|@c\.us/g, '').replace(/[^0-9]/g, '');
        const displayName = pushName || phone;

        // Build a standard vCard 3.0 string
        const vcard =
            `BEGIN:VCARD\n` +
            `VERSION:3.0\n` +
            `FN:${displayName}\n` +
            `ORG:Commanded by;\n` +
            `TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}\n` +
            `END:VCARD`;

        // Try to get the sender's profile picture
        let profilePicThumb = undefined;
        try {
            const picUrl = await Guru.profilePictureUrl(sender, 'image');
            if (picUrl) {
                const axios = require('axios');
                const resp = await axios.get(picUrl, { responseType: 'arraybuffer', timeout: 6000 });
                profilePicThumb = Buffer.from(resp.data);
            }
        } catch (_) {
            // Profile pic not available — send without thumbnail
        }

        const contactMsg = {
            contacts: {
                displayName,
                contacts: [{ vcard }],
            },
        };

        // If we got a profile picture, embed it as the contact thumbnail
        if (profilePicThumb) {
            contactMsg.contacts.contacts[0].profilePicThumb = profilePicThumb;
        }

        await Guru.sendMessage(from, contactMsg, { quoted: mek });
    } catch (err) {
        // Non-fatal — if contact card fails, the main reply still goes through
        console.error('[FakeContact] Error sending fake contact:', err.message);
    }
};

module.exports = {
    createContext,
    createContext2,
    createFakeContact,
};
