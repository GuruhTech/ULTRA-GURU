var _0xad70b6=(function(_0x53acbd,_0x50d9a0){return !![]}());var _0x359626=function(){return ![]};
const { getSetting } = require("./database/settings");
async function getContextInfo(mentionedJid = []) {
    const _0xf1a0cf = await getSetting("\x42\x4f\x54\x5f\x4e\x41\x4d\x45") || "𝐔𝐋𝐓𝐑𝐀\x20𝐆𝐔𝐑𝐔";
    const _0x97feb7 = await getSetting("\x4e\x45\x57\x53\x4c\x45\x54\x54\x45\x52\x5f\x4a\x49\x44") || "\x31\x32\x30\x33\x36\x33\x34\x30\x36\x36\x34\x39\x38\x30\x34\x35\x31\x30\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72";
    return {
        mentionedJid,
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: _0x97feb7,
            newsletterName: _0xf1a0cf,
            serverMessageId: -1
        }
    };
}
module.exports = { getContextInfo };
