var _0xf57031=(function(_0x3ae706,_0xa1fa8e){return !![]}());var _0x806c57=function(){return ![]};
const { gmd } = require("../guru");
const path = require("path");
const fs = require('fs').promises;
const { sendButtons } = require('gifted-btns');
gmd({
    pattern: "\x67\x69\x66\x74\x65\x64\x63\x64\x6e",
    react: "⬆️",
    category: "\x75\x70\x6c\x6f\x61\x64\x65\x72",
    description: "\x55\x70\x6c\x6f\x61\x64\x20\x61\x6e\x79\x20\x66\x69\x6c\x65\x20\x74\x6f\x20\x47\x69\x66\x74\x65\x64\x43\x44\x4e",
}, async (from, Gifted, conText) => {
    await handleUpload(from, Gifted, conText, '\x67\x69\x66\x74\x65\x64\x63\x64\x6e');
});
gmd({
    pattern: "\x67\x69\x74\x68\x75\x62\x63\x64\x6e",
    react: "⬆️",
    category: "\x75\x70\x6c\x6f\x61\x64\x65\x72",
    description: "\x55\x70\x6c\x6f\x61\x64\x20\x61\x6e\x79\x20\x66\x69\x6c\x65\x20\x74\x6f\x20\x47\x69\x74\x68\x75\x62\x20\x52\x65\x70\x6f",
}, async (from, Gifted, conText) => {
    await handleUpload(from, Gifted, conText, '\x67\x69\x74\x68\x75\x62\x63\x64\x6e');
});
gmd({
    pattern: "\x63\x61\x74\x62\x6f\x78",
    react: "⬆️",
    category: "\x75\x70\x6c\x6f\x61\x64\x65\x72",
    description: "\x55\x70\x6c\x6f\x61\x64\x20\x61\x6e\x79\x20\x66\x69\x6c\x65\x20\x74\x6f\x20\x43\x61\x74\x62\x6f\x78",
}, async (from, Gifted, conText) => {
    await handleUpload(from, Gifted, conText, '\x63\x61\x74\x62\x6f\x78');
});
gmd({
    pattern: "\x70\x69\x78\x68\x6f\x73\x74",
    react: "🖼️",
    category: "\x75\x70\x6c\x6f\x61\x64\x65\x72",
    description: "\x55\x70\x6c\x6f\x61\x64\x20\x69\x6d\x61\x67\x65\x73\x20\x74\x6f\x20\x50\x69\x78\x68\x6f\x73\x74",
}, async (from, Gifted, conText) => {
    await handleUpload(from, Gifted, conText, '\x70\x69\x78\x68\x6f\x73\x74');
});
gmd({
    pattern: "\x69\x6d\x67\x62\x62",
    react: "📷",
    category: "\x75\x70\x6c\x6f\x61\x64\x65\x72",
    description: "\x55\x70\x6c\x6f\x61\x64\x20\x69\x6d\x61\x67\x65\x73\x20\x74\x6f\x20\x49\x6d\x67\x42\x42",
}, async (from, Gifted, conText) => {
    await handleUpload(from, Gifted, conText, '\x69\x6d\x67\x62\x62');
});
async function handleUpload(from, Gifted, conText, service) {
    const { mek, reply, react, botFooter, botPrefix, quoted, getMediaBuffer, uploadToGiftedCdn, uploadToGithubCdn, uploadToPixhost, getFileContentType, uploadToImgBB, uploadToCatbox, pushName, newsletterUrl } = conText;
    if (!quoted) {
        return reply(`⚠️ Please reply to/quote a media message.`);
    }
    const _0x0523fe = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!_0x0523fe) {
        return reply(`⚠️ No quoted message found.`);
    }
    const _0x39602e = _0x0523fe?.imageMessage || _0x0523fe?.message?.imageMessage;
    const _0x33667e = _0x0523fe?.videoMessage || _0x0523fe?.message?.videoMessage;
    const _0xc17647 = _0x0523fe?.audioMessage || _0x0523fe?.message?.audioMessage;
    const _0x9be46d = _0x0523fe?.stickerMessage || _0x0523fe?.message?.stickerMessage;
    const _0x7527c0 = _0x0523fe?.documentMessage || _0x0523fe?.message?.documentMessage;
    try {
        let buffer;
        let _0x34e779 = '';
        let _0x6f292d = '\x66\x69\x6c\x65';
        let _0x096475 = false;
        let mimetype;
        let mediaType;
        if (_0x39602e) {
            buffer = await getMediaBuffer(_0x39602e, "\x69\x6d\x61\x67\x65");
            _0x34e779 = '.jpg';
            _0x6f292d = `image${_0x34e779}`;
            _0x096475 = true;
            mimetype = "\x69\x6d\x61\x67\x65\x2f\x6a\x70\x65\x67";
            mediaType = '\x69\x6d\x61\x67\x65';
        } 
        else if (_0x33667e) {
            if (service !== '\x63\x61\x74\x62\x6f\x78' && service !== '\x67\x69\x66\x74\x65\x64\x63\x64\x6e' && service !== '\x67\x69\x74\x68\x75\x62\x63\x64\x6e') {
                return reply(`❌ ${service} only supports images. Use ${botPrefix}catbox or ${botPrefix}giftedcdn or ${botPrefix}githubcdn  for videos and any other file type.`);
            }
            buffer = await getMediaBuffer(_0x33667e, "\x76\x69\x64\x65\x6f");
            _0x34e779 = '.mp4';
            _0x6f292d = `video${_0x34e779}`;
            mimetype = "\x76\x69\x64\x65\x6f\x2f\x6d\x70\x34";
            mediaType = '\x76\x69\x64\x65\x6f';
        } 
        else if (_0xc17647) {
            if (service !== '\x63\x61\x74\x62\x6f\x78' && service !== '\x67\x69\x66\x74\x65\x64\x63\x64\x6e' && service !== '\x67\x69\x74\x68\x75\x62\x63\x64\x6e') {
                return reply(`❌ ${service} only supports images. Use ${botPrefix}catbox or ${botPrefix}giftedcdn or ${botPrefix}githubcdn  for audios and any other file type.`);
            }
            buffer = await getMediaBuffer(_0xc17647, "\x61\x75\x64\x69\x6f");
            _0x34e779 = '.mp3';
            _0x6f292d = `audio${_0x34e779}`;
            mimetype = "\x61\x75\x64\x69\x6f\x2f\x6d\x70\x65\x67";
            mediaType = '\x61\x75\x64\x69\x6f';
        } 
        else if (_0x9be46d) {
            if (service === '\x70\x69\x78\x68\x6f\x73\x74') {
                return reply(`❌ ${service} does not support sticker uploads. Use ${botPrefix}imgbb, ${botPrefix}catbox, ${botPrefix}giftedcdn or ${botPrefix}githubcdn instead.`);
            }
            buffer = await getMediaBuffer(_0x9be46d, "\x73\x74\x69\x63\x6b\x65\x72");
            _0x34e779 = '.webp';
            _0x6f292d = `sticker${_0x34e779}`;
            _0x096475 = true;
            mimetype = "\x69\x6d\x61\x67\x65\x2f\x77\x65\x62\x70";
            mediaType = '\x73\x74\x69\x63\x6b\x65\x72';
        } 
        else if (_0x7527c0) {
            if (service !== '\x63\x61\x74\x62\x6f\x78' && service !== '\x67\x69\x66\x74\x65\x64\x63\x64\x6e' && service !== '\x67\x69\x74\x68\x75\x62\x63\x64\x6e') {
                return reply(`❌ ${service} only supports images. Use ${botPrefix}catbox or ${botPrefix}giftedcdn or ${botPrefix}githubcdn  for documents and any other file type.`);
            }
            buffer = await getMediaBuffer(_0x7527c0, "\x64\x6f\x63\x75\x6d\x65\x6e\x74");
            _0x34e779 = _0x7527c0.fileName ? path.extname(_0x7527c0.fileName).toLowerCase() : '.bin';
            _0x6f292d = _0x7527c0.fileName || `document${_0x34e779}`;
            mimetype = getFileContentType(_0x34e779);
            mediaType = '\x64\x6f\x63\x75\x6d\x65\x6e\x74';
        } else {
            return reply(`❌ Unsupported message type.`);
        }
        if (!_0x096475 && service !== '\x63\x61\x74\x62\x6f\x78' && service !== '\x67\x69\x66\x74\x65\x64\x63\x64\x6e' && service !== '\x67\x69\x74\x68\x75\x62\x63\x64\x6e') {
            return reply(`❌ ${service} only supports image files. Use ${botPrefix}catbox or ${botPrefix}giftedcdn or ${botPrefix}githubcdn for any other file types.`);
        }
        let uploadResult;
        switch (service) {
            case '\x67\x69\x66\x74\x65\x64\x63\x64\x6e':
                uploadResult = await uploadToGiftedCdn(buffer, _0x6f292d);
                break;
            case '\x63\x61\x74\x62\x6f\x78':
                uploadResult = await uploadToCatbox(buffer, _0x6f292d);
                break;
             case '\x67\x69\x74\x68\x75\x62\x63\x64\x6e':
                uploadResult = await uploadToGithubCdn(buffer, _0x6f292d);
                break;
            case '\x70\x69\x78\x68\x6f\x73\x74':
                uploadResult = await uploadToPixhost(buffer, _0x6f292d);
                break;
            case '\x69\x6d\x67\x62\x62':
                uploadResult = await uploadToImgBB(buffer, _0x6f292d);
                break;
            default:
                throw new Error('\x49\x6e\x76\x61\x6c\x69\x64\x20\x75\x70\x6c\x6f\x61\x64\x20\x73\x65\x72\x76\x69\x63\x65');
        }
        const _0xd8b773 = buffer.length / (0x400 * 0x400);
        const _0x4618c1 = _0x34e779 ? _0x34e779.replace('.', '').toUpperCase() : '\x55\x4e\x4b\x4e\x4f\x57\x4e';
        const _0x42b036 = `Hey *${pushName},*\nHere is Your *${service.toUpperCase()}* Upload Result:\n\n*File Type:* ${_0x4618c1}\n*File Size:* ${_0xd8b773.toFixed(2)} MBs\n*File Url:* ${uploadResult.url}\n*File Expiration:* No Expiry\n`;
        await sendButtons(Gifted, from, {
            title: '',
            text: _0x42b036,
            footer: `> *${botFooter}*`,
            buttons: [
                { 
                    name: '\x63\x74\x61\x5f\x63\x6f\x70\x79', 
                    buttonParamsJson: JSON.stringify({ 
                        display_text: '\x43\x6f\x70\x79\x20\x55\x72\x6c', 
                        copy_code: uploadResult.url 
                    }) 
                },
                {
                    name: '\x63\x74\x61\x5f\x75\x72\x6c',
                    buttonParamsJson: JSON.stringify({
                        display_text: '\x4f\x70\x65\x6e\x20\x4c\x69\x6e\x6b',
                        url: uploadResult.url
                    })
                }
            ]
        });
        await react("✅");
    } catch (error) {
        console.error("\x55\x70\x6c\x6f\x61\x64\x20\x45\x72\x72\x6f\x72\x3a", error);
        await reply(`❌ Failed to upload to ${service}. Error: ${error.message}`);
        await react("❌");
    }
}
