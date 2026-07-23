const { gmd, getAllSettings, getMediaBuffer } = require("../guru");

gmd(
    {
        pattern: "save",
        aliases: ["inbox", "grab", "keep"],
        react: "📥",
        category: "tools",
        description: "Forward quoted media to owner inbox",
        usage: "Reply to any media with .save",
    },
    async (from, Guru, conText) => {
        const { mek, reply, react, ownerNumber } = conText;

        if (!ownerNumber) {
            return reply("❌ Owner number not set in bot settings.");
        }

        const ownerJid = ownerNumber.replace(/\D/g, "") + "@s.whatsapp.net";

        const quotedRaw =
            mek.message?.extendedTextMessage?.contextInfo ||
            mek.message?.imageMessage?.contextInfo ||
            mek.message?.videoMessage?.contextInfo ||
            mek.message?.audioMessage?.contextInfo ||
            mek.message?.documentMessage?.contextInfo ||
            mek.message?.stickerMessage?.contextInfo ||
            null;

        if (!quotedRaw?.quotedMessage) {
            await react("❌");
            return reply("❌ Reply to a media message (image, video, audio, document, sticker) with *.save*");
        }

        let msg = quotedRaw.quotedMessage;

        if (msg.viewOnceMessageV2?.message) msg = msg.viewOnceMessageV2.message;
        else if (msg.viewOnceMessage?.message) msg = msg.viewOnceMessage.message;
        else if (msg.ephemeralMessage?.message) msg = msg.ephemeralMessage.message;

        const hasMedia =
            msg.imageMessage ||
            msg.videoMessage ||
            msg.audioMessage ||
            msg.documentMessage ||
            msg.stickerMessage;

        if (!hasMedia) {
            await react("❌");
            return reply("❌ No media found in the quoted message.");
        }

        await react("⏳");

        try {
            if (msg.imageMessage) {
                const buffer = await getMediaBuffer(msg.imageMessage, "image");
                await Guru.sendMessage(ownerJid, {
                    image: buffer,
                    caption: msg.imageMessage.caption || "📥 *Saved to inbox*",
                });

            } else if (msg.videoMessage) {
                const buffer = await getMediaBuffer(msg.videoMessage, "video");
                await Guru.sendMessage(ownerJid, {
                    video: buffer,
                    caption: msg.videoMessage.caption || "📥 *Saved to inbox*",
                });

            } else if (msg.audioMessage) {
                const buffer = await getMediaBuffer(msg.audioMessage, "audio");
                await Guru.sendMessage(ownerJid, {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    ptt: msg.audioMessage.ptt || false,
                });

            } else if (msg.documentMessage) {
                const buffer = await getMediaBuffer(msg.documentMessage, "document");
                await Guru.sendMessage(ownerJid, {
                    document: buffer,
                    fileName: msg.documentMessage.fileName || "document",
                    mimetype: msg.documentMessage.mimetype || "application/octet-stream",
                    caption: msg.documentMessage.caption || "📥 *Saved to inbox*",
                });

            } else if (msg.stickerMessage) {
                const buffer = await getMediaBuffer(msg.stickerMessage, "sticker");
                await Guru.sendMessage(ownerJid, { sticker: buffer });
            }

            await react("✅");
            await reply("✅ Media forwarded to owner inbox!");

        } catch (err) {
            console.error("[SaveMedia] Error:", err.message);
            await react("❌");
            await reply("❌ Failed to save media. Try again.");
        }
    }
);
