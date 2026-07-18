
const { gmd } = require("../guru");
const path = require("path");
const fs = require('fs').promises;
const { sendButtons } = require('gifted-btns');

// ─── .url — universal image/media → URL (catbox) ─────────────────────────────
gmd({
    pattern: "url",
    aliases: ["tourl", "mediaurl", "imgurl"],
    react: "🔗",
    category: "uploader",
    description: "Convert any media to a URL. Reply to an image/video/audio/document with .url",
}, async (from, Guru, conText) => {
    await handleUpload(from, Guru, conText, 'catbox');
});

gmd({
    pattern: "gurucdn",
    react: "⬆️",
    category: "uploader",
    description: "Upload any file to GuruCDN",
}, async (from, Guru, conText) => {
    await handleUpload(from, Guru, conText, 'gurucdn');
});

gmd({
    pattern: "githubcdn",
    react: "⬆️",
    category: "uploader",
    description: "Upload any file to Github Repo",
}, async (from, Guru, conText) => {
    await handleUpload(from, Guru, conText, 'githubcdn');
});

gmd({
    pattern: "catbox",
    react: "⬆️",
    category: "uploader",
    description: "Upload any file to Catbox",
}, async (from, Guru, conText) => {
    await handleUpload(from, Guru, conText, 'catbox');
});

gmd({
    pattern: "pixhost",
    react: "🖼️",
    category: "uploader",
    description: "Upload images to Pixhost",
}, async (from, Guru, conText) => {
    await handleUpload(from, Guru, conText, 'pixhost');
});

gmd({
    pattern: "imgbb",
    react: "📷",
    category: "uploader",
    description: "Upload images to ImgBB",
}, async (from, Guru, conText) => {
    await handleUpload(from, Guru, conText, 'imgbb');
});

async function handleUpload(from, Guru, conText, service) {
    const { mek, reply, react, botFooter, botPrefix, quoted, getMediaBuffer, uploadToGuruCdn, uploadToGithubCdn, uploadToPixhost, getFileContentType, uploadToImgBB, uploadToCatbox, pushName, newsletterUrl } = conText;

    if (!quoted) {
        return reply(`⚠️ Please reply to/quote a media message.`);
    }
    
    const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) {
        return reply(`⚠️ No quoted message found.`);
    }

    const quotedImg = quotedMsg?.imageMessage || quotedMsg?.message?.imageMessage;
    const quotedVideo = quotedMsg?.videoMessage || quotedMsg?.message?.videoMessage;
    const quotedAudio = quotedMsg?.audioMessage || quotedMsg?.message?.audioMessage;
    const quotedSticker = quotedMsg?.stickerMessage || quotedMsg?.message?.stickerMessage;
    const quotedDocument = quotedMsg?.documentMessage || quotedMsg?.message?.documentMessage;

    try {
        let buffer;
        let fileExt = '';
        let fileName = 'file';
        let isImage = false;
        let mimetype;
        let mediaType;

        if (quotedImg) {
            buffer = await getMediaBuffer(quotedImg, "image");
            fileExt = '.jpg';
            fileName = `image${fileExt}`;
            isImage = true;
            mimetype = "image/jpeg";
            mediaType = 'image';
        } 
        else if (quotedVideo) {
            if (service !== 'catbox' && service !== 'gurucdn' && service !== 'githubcdn') {
                return reply(`❌ ${service} only supports images. Use ${botPrefix}catbox or ${botPrefix}gurucdn or ${botPrefix}githubcdn  for videos and any other file type.`);
            }
            buffer = await getMediaBuffer(quotedVideo, "video");
            fileExt = '.mp4';
            fileName = `video${fileExt}`;
            mimetype = "video/mp4";
            mediaType = 'video';
        } 
        else if (quotedAudio) {
            if (service !== 'catbox' && service !== 'gurucdn' && service !== 'githubcdn') {
                return reply(`❌ ${service} only supports images. Use ${botPrefix}catbox or ${botPrefix}gurucdn or ${botPrefix}githubcdn  for audios and any other file type.`);
            }
            buffer = await getMediaBuffer(quotedAudio, "audio");
            fileExt = '.mp3';
            fileName = `audio${fileExt}`;
            mimetype = "audio/mpeg";
            mediaType = 'audio';
        } 
        else if (quotedSticker) {
            if (service === 'pixhost') {
                return reply(`❌ ${service} does not support sticker uploads. Use ${botPrefix}imgbb, ${botPrefix}catbox, ${botPrefix}gurucdn or ${botPrefix}githubcdn instead.`);
            }
            buffer = await getMediaBuffer(quotedSticker, "sticker");
            fileExt = '.webp';
            fileName = `sticker${fileExt}`;
            isImage = true;
            mimetype = "image/webp";
            mediaType = 'sticker';
        } 
        else if (quotedDocument) {
            if (service !== 'catbox' && service !== 'gurucdn' && service !== 'githubcdn') {
                return reply(`❌ ${service} only supports images. Use ${botPrefix}catbox or ${botPrefix}gurucdn or ${botPrefix}githubcdn  for documents and any other file type.`);
            }
            buffer = await getMediaBuffer(quotedDocument, "document");
            fileExt = quotedDocument.fileName ? path.extname(quotedDocument.fileName).toLowerCase() : '.bin';
            fileName = quotedDocument.fileName || `document${fileExt}`;
            mimetype = getFileContentType(fileExt);
            mediaType = 'document';
        } else {
            return reply(`❌ Unsupported message type.`);
        }

        if (!isImage && service !== 'catbox' && service !== 'gurucdn' && service !== 'githubcdn') {
            return reply(`❌ ${service} only supports image files. Use ${botPrefix}catbox or ${botPrefix}gurucdn or ${botPrefix}githubcdn for any other file types.`);
        }

        let uploadResult;
        switch (service) {
            case 'gurucdn':
                uploadResult = await uploadToGuruCdn(buffer, fileName);
                break;
            case 'catbox':
                uploadResult = await uploadToCatbox(buffer, fileName);
                break;
             case 'githubcdn':
                uploadResult = await uploadToGithubCdn(buffer, fileName);
                break;
            case 'pixhost':
                uploadResult = await uploadToPixhost(buffer, fileName);
                break;
            case 'imgbb':
                uploadResult = await uploadToImgBB(buffer, fileName);
                break;
            default:
                throw new Error('Invalid upload service');
        }

        const fileSizeMB = buffer.length / (1024 * 1024);
        const fileTypeName = fileExt ? fileExt.replace('.', '').toUpperCase() : 'UNKNOWN';
        
        const caption = `Hey *${pushName},*\nHere is Your *${service.toUpperCase()}* Upload Result:\n\n*File Type:* ${fileTypeName}\n*File Size:* ${fileSizeMB.toFixed(2)} MBs\n*File Url:* ${uploadResult.url}\n*File Expiration:* No Expiry\n`;

        // Send buttons
        await sendButtons(Guru, from, {
            title: '',
            text: caption,
            footer: `> *${botFooter}*`,
            buttons: [
                { 
                    name: 'cta_copy', 
                    buttonParamsJson: JSON.stringify({ 
                        display_text: 'Copy Url', 
                        copy_code: uploadResult.url 
                    }) 
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Open Link',
                        url: uploadResult.url
                    })
                }
            ]
        });

        await react("✅");
        
    } catch (error) {
        console.error("Upload Error:", error);
        await reply(`❌ Failed to upload to ${service}. Error: ${error.message}`);
        await react("❌");
    }
}
