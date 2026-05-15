var _0xcfa816=(function(_0xaaf0f7,_0xee4e93){return !![]}());var _0x09aeb2=function(){return ![]};
const { gmd } = require("../guru");
const {
    getLidMapping,
    getGroupMetadata,
} = require("../guru/connection/groupCache");
function getUserName(_0xe65194) {
    return _0xe65194.split("@")[0];
}
function normalizeUserJid(_0xe65194) {
    if (!_0xe65194 || typeof _0xe65194 !== "\x73\x74\x72\x69\x6e\x67") return "";
    if (_0xe65194.endsWith("@lid")) {
        const _0x9b1b52 = getLidMapping(_0xe65194);
        if (_0x9b1b52) return _0x9b1b52;
    }
    let _0x6eb1fc = _0xe65194.split(":")[0].split("/")[0];
    if (!_0x6eb1fc.includes("@")) {
        _0x6eb1fc += "@s.whatsapp.net";
    }
    if (_0x6eb1fc.endsWith("@lid")) {
        const _0x9b1b52 = getLidMapping(_0x6eb1fc);
        if (_0x9b1b52) return _0x9b1b52;
    }
    return _0x6eb1fc;
}
gmd(
    {
        pattern: "\x6f\x6e\x77\x61",
        aliases: ["\x6f\x6e\x77\x68\x61\x74\x73\x61\x70\x70", "\x63\x68\x65\x63\x6b\x77\x61", "\x63\x68\x65\x63\x6b\x6e\x75\x6d\x62\x65\x72"],
        react: "🔍",
        category: "\x75\x74\x69\x6c\x69\x74\x79",
        description: "\x43\x68\x65\x63\x6b\x20\x69\x66\x20\x61\x20\x70\x68\x6f\x6e\x65\x20\x6e\x75\x6d\x62\x65\x72\x20\x69\x73\x20\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x6f\x6e\x20\x57\x68\x61\x74\x73\x41\x70\x70",
    },
    async (from, Gifted, conText) => {
        const { sender, mek, reply, react, q, botPrefix } = conText;
        if (!q || q.trim() === "") {
            await react("❌");
            return reply(`❌ Please provide a phone number.
*Usage:* ${botPrefix}onwa <number>
*Example:* ${botPrefix}onwa 254712345678
_Include country code without + or spaces_`);
        }
        const _0x341e44 = q.trim().replace(/[^0-9]/g, "");
        if (_0x341e44.length < 7 || _0x341e44.length > 0xF) {
            await react("❌");
            return reply(`❌ Invalid phone number format.
Please provide a valid number with country code.
*Example:* .onwa 254712345678`);
        }
        await react("⏳");
        try {
            const [result] = await Gifted.onWhatsApp(_0x341e44);
            if (result && result.exists) {
                await react("✅");
                return reply(`✅ *Number Found on WhatsApp*
📞 *Number:* ${_0x341e44}
🆔 *JID:* ${result.jid}
_This number is registered on WhatsApp._`);
            } else {
                await react("❌");
                return reply(`❌ *Not on WhatsApp*
📞 *Number:* ${_0x341e44}
_This number is not registered on WhatsApp._`);
            }
        } catch (err) {
            await react("⚠️");
            return reply(`⚠️ Could not verify if ${_0x341e44} is on WhatsApp.
Error: ${err.message}
_Please try again later._`);
        }
    },
);
gmd(
    {
        pattern: "\x76\x63\x66",
        aliases: ["\x63\x6f\x6e\x74\x61\x63\x74\x73", "\x73\x61\x76\x65\x63\x6f\x6e\x74\x61\x63\x74", "\x73\x63\x6f\x6e\x74\x61\x63\x74", "\x73\x61\x76\x65\x63\x6f\x6e\x74\x61\x63\x74\x73"],
        react: "📇",
        category: "\x67\x72\x6f\x75\x70",
        description: "\x45\x78\x70\x6f\x72\x74\x20\x61\x6c\x6c\x20\x67\x72\x6f\x75\x70\x20\x70\x61\x72\x74\x69\x63\x69\x70\x61\x6e\x74\x73\x20\x61\x73\x20\x56\x43\x46\x20\x63\x6f\x6e\x74\x61\x63\x74\x20\x66\x69\x6c\x65",
        isGroup: true,
    },
    async (from, Gifted, conText) => {
        const { sender, mek, reply, react } = conText;
        await react("⏳");
        try {
            const _0xa4fc85 = await getGroupMetadata(Gifted, from);
            const _0x2aaf60 = _0xa4fc85?.participants || [];
            const _0x9b0e1a = _0xa4fc85?.subject || "\x47\x72\x6f\x75\x70";
            if (_0x2aaf60.length === 0) {
                await react("❌");
                return reply("❌\x20\x4e\x6f\x20\x70\x61\x72\x74\x69\x63\x69\x70\x61\x6e\x74\x73\x20\x66\x6f\x75\x6e\x64\x20\x69\x6e\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x2e");
            }
            let _0xc9671e = "";
            let _0xcb8b98 = 1;
            for (const member of _0x2aaf60) {
                const _0xe65194 = member.jid || member.pn || member.id;
                if (!_0xe65194 || typeof _0xe65194 !== "\x73\x74\x72\x69\x6e\x67") continue;
                const _0xad408e = _0xe65194.includes("@s.whatsapp.net")
                    ? _0xe65194
                    : normalizeUserJid(_0xe65194);
                if (!_0xad408e || !_0xad408e.includes("@s.whatsapp.net"))
                    continue;
                const id = _0xad408e.split("@")[0];
                _0xc9671e += `BEGIN:VCARD\nVERSION:3.0\nFN:[${_0xcb8b98++}] +${id}\nTEL;type=CELL;type=VOICE;waid=${id}:+${id}\nEND:VCARD\n`;
            }
            const _0x99a0c2 = _0xcb8b98 - 1;
            if (_0x99a0c2 === 0) {
                await react("❌");
                return reply(
                    "❌\x20\x43\x6f\x75\x6c\x64\x20\x6e\x6f\x74\x20\x65\x78\x74\x72\x61\x63\x74\x20\x61\x6e\x79\x20\x76\x61\x6c\x69\x64\x20\x63\x6f\x6e\x74\x61\x63\x74\x73\x20\x66\x72\x6f\x6d\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x2e",
                );
            }
            const _0x434cd7 = `${_0x9b0e1a}.vcf`;
            await Gifted.sendMessage(
                from,
                {
                    document: Buffer.from(_0xc9671e.trim(), "\x75\x74\x66\x2d\x38"),
                    mimetype: "\x74\x65\x78\x74\x2f\x76\x63\x61\x72\x64",
                    _0x434cd7: _0x434cd7,
                    caption: `Done saving.\nGroup Name: *${_0x9b0e1a}*\nContacts: *${_0x99a0c2}*`,
                },
                { quoted: mek },
            );
            await react("✅");
        } catch (err) {
            await react("❌");
            return reply(`❌ Failed to export contacts: ${err.message}`);
        }
    },
);
