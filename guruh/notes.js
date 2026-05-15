var _0xea791c=(function(_0x77ebea,_0xa7ecd2){return !![]}());var _0xc8ad2e=function(){return ![]};
const { gmd } = require("../guru");
const {
    initNotesDB,
    addNote,
    getNote,
    getAllNotes,
    updateNote,
    deleteNote,
    deleteAllNotes,
} = require("../guru/database/notes");
const { getContextInfo } = require("../guru/contextInfo");
const { sendButtons } = require("gifted-btns");
const _0xb736f0 = String.fromCharCode(0x200E);
const _0x90ebb5 = _0xb736f0.repeat(0xFA1);
initNotesDB();
function getUserName(jid) {
    return jid.split("@")[0];
}
gmd(
    {
        pattern: "\x6e\x6f\x74\x65\x73",
        react: "📝",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x53\x68\x6f\x77\x20\x61\x6c\x6c\x20\x6e\x6f\x74\x65\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x73",
    },
    async (from, Gifted, conText) => {
        const { botPrefix } = conText;
        const _0xe37782 = `📝 *NOTES COMMANDS*
*Add a _0x663742:*
${botPrefix}addnote <_0xfcce23>
${botPrefix}newnote <_0xfcce23>
${botPrefix}makenote <_0xfcce23>
*Get a specific _0x663742:*
${botPrefix}getnote <number>
${botPrefix}listnote <number>
*Get all your _0x9ca240:*
${botPrefix}getnotes
${botPrefix}getallnotes
${botPrefix}listnotes
*Update a _0x663742:*
${botPrefix}updatenote <number> <new _0xfcce23>
*Delete a specific _0x663742:*
${botPrefix}delnote <number>
${botPrefix}deletenote <number>
${botPrefix}removenote <number>
*Delete all your _0x9ca240:*
${botPrefix}delallnotes
${botPrefix}removeallnotes
${botPrefix}deleteallnotes
_Notes are personal and stored securely in the database._`;
        return await Gifted.sendMessage(from, {
            _0xfcce23: _0xe37782,
            contextInfo: await getContextInfo(),
        });
    },
);
gmd(
    {
        pattern: "\x61\x64\x64\x6e\x6f\x74\x65",
        aliases: ["\x6e\x65\x77\x6e\x6f\x74\x65", "\x6d\x61\x6b\x65\x6e\x6f\x74\x65", "\x63\x72\x65\x61\x74\x65\x6e\x6f\x74\x65"],
        react: "📝",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x41\x64\x64\x20\x61\x20\x6e\x65\x77\x20\x6e\x6f\x74\x65",
    },
    async (from, Gifted, conText) => {
        const { sender, args, quoted, botPrefix } = conText;
        let _0xa2ff02 = args.join(" ").trim();
        if (!_0xa2ff02 && quoted) {
            const _0xf29c2d = quoted.message || quoted;
            if (_0xf29c2d.conversation) {
                _0xa2ff02 = _0xf29c2d.conversation;
            } else if (_0xf29c2d.extendedTextMessage?.text) {
                _0xa2ff02 = _0xf29c2d.extendedTextMessage.text;
            } else if (_0xf29c2d.imageMessage?.caption) {
                _0xa2ff02 = _0xf29c2d.imageMessage.caption;
            } else if (_0xf29c2d.videoMessage?.caption) {
                _0xa2ff02 = _0xf29c2d.videoMessage.caption;
            }
        }
        if (!_0xa2ff02) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, provide _0x565755 for your _0x663742.\n\nUsage: ${botPrefix}addnote <your _0x663742 _0xfcce23>\nOr reply to a message with ${botPrefix}addnote`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0x663742 = await addNote(sender, _0xa2ff02);
        const _0xc7e73f = _0x663742.content.length > 0x1E ? _0x663742.content.slice(0, 0x1E) + "..." : _0x663742.content;
        return await Gifted.sendMessage(from, {
            _0xfcce23: `✅ Hey @${getUserName(sender)}, Note #${_0x663742.noteNumber} saved!\n\n📝 "\x24\x7b\x70\x72\x65\x76\x69\x65\x77\x7d"`,
            contextInfo: await getContextInfo([sender]),
        });
    },
);
gmd(
    {
        pattern: "\x67\x65\x74\x6e\x6f\x74\x65",
        aliases: ["\x6c\x69\x73\x74\x6e\x6f\x74\x65", "\x76\x69\x65\x77\x6e\x6f\x74\x65", "\x73\x68\x6f\x77\x6e\x6f\x74\x65"],
        react: "📄",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x47\x65\x74\x20\x61\x20\x73\x70\x65\x63\x69\x66\x69\x63\x20\x6e\x6f\x74\x65\x20\x62\x79\x20\x6e\x75\x6d\x62\x65\x72",
    },
    async (from, Gifted, conText) => {
        const { sender, q, botPrefix, botFooter } = conText;
        if (!q || isNaN(parseInt(q))) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, provide a _0x663742 number.\n\nUsage: ${botPrefix}getnote <number>`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0x710628 = parseInt(q);
        const _0x663742 = await getNote(sender, _0x710628);
        if (!_0x663742) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, Note #${_0x710628} not found.`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0x54fffd = 0x12C;
        const _0x565755 = _0x663742.content;
        let displayContent;
        if (_0x565755.length > _0x54fffd) {
            const _0x673ab0 = _0x565755.slice(0, _0x54fffd);
            const _0x772338 = _0x565755.slice(_0x54fffd);
            displayContent = `${_0x673ab0}${_0x90ebb5}${_0x772338}`;
        } else {
            displayContent = _0x565755;
        }
        const _0xfcce23 =
            `📝 *Note #${_0x663742.noteNumber}*\n\n` +
            `${displayContent}\n\n` +
            `_Created: ${_0x663742.createdAt.toLocaleString()}_`;
        await sendButtons(Gifted, from, {
            _0xfcce23,
            footer: botFooter,
            buttons: [
                {
                    name: "\x63\x74\x61\x5f\x63\x6f\x70\x79",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📋\x20\x43\x6f\x70\x79\x20\x4e\x6f\x74\x65",
                        copy_code: _0x565755,
                    }),
                },
            ],
        });
    },
);
gmd(
    {
        pattern: "\x67\x65\x74\x6e\x6f\x74\x65\x73",
        aliases: [
            "\x67\x65\x74\x61\x6c\x6c\x6e\x6f\x74\x65\x73",
            "\x6c\x69\x73\x74\x6e\x6f\x74\x65\x73",
            "\x61\x6c\x6c\x6e\x6f\x74\x65\x73",
            "\x6d\x79\x6e\x6f\x74\x65\x73",
            "\x76\x69\x65\x77\x6e\x6f\x74\x65\x73",
        ],
        react: "📋",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x47\x65\x74\x20\x61\x6c\x6c\x20\x79\x6f\x75\x72\x20\x6e\x6f\x74\x65\x73",
    },
    async (from, Gifted, conText) => {
        const { sender, botPrefix } = conText;
        const _0x9ca240 = await getAllNotes(sender);
        if (_0x9ca240.length === 0) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `📭 Hey @${getUserName(sender)}, you have no _0x9ca240 yet.\n\nUse ${botPrefix}addnote <_0xfcce23> to create one!`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        let _0xfcce23 = `📋 Hey @${getUserName(sender)}, here are *YOUR NOTES (${_0x9ca240.length})*\n\n`;
        _0x9ca240.forEach((_0x663742) => {
            const _0xc7e73f =
                _0x663742.content.length > 0x32
                    ? _0x663742.content.substring(0, 0x32) + "..."
                    : _0x663742.content;
            _0xfcce23 += `*#${_0x663742.noteNumber}* - ${_0xc7e73f}\n`;
        });
        _0xfcce23 += `\n_Use ${botPrefix}getnote <number> to view full note_`;
        return await Gifted.sendMessage(from, {
            _0xfcce23,
            contextInfo: await getContextInfo([sender]),
        });
    },
);
gmd(
    {
        pattern: "\x75\x70\x64\x61\x74\x65\x6e\x6f\x74\x65",
        aliases: ["\x65\x64\x69\x74\x6e\x6f\x74\x65", "\x6d\x6f\x64\x69\x66\x79\x6e\x6f\x74\x65"],
        react: "✏️",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x55\x70\x64\x61\x74\x65\x20\x61\x6e\x20\x65\x78\x69\x73\x74\x69\x6e\x67\x20\x6e\x6f\x74\x65",
    },
    async (from, Gifted, conText) => {
        const { sender, q, botPrefix } = conText;
        if (!q || q.trim() === "") {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, provide _0x663742 number and new _0x565755.\n\nUsage: ${botPrefix}updatenote <number> <new _0xfcce23>`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0xe169b6 = q.trim().split(/\s+/);
        const _0x710628 = parseInt(_0xe169b6[0]);
        if (isNaN(_0x710628)) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, first argument must be a _0x663742 number.\n\nUsage: ${botPrefix}updatenote <number> <new _0xfcce23>`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0x09c438 = _0xe169b6.slice(1).join(" ");
        if (!_0x09c438) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, provide new _0x565755 for the _0x663742.\n\nUsage: ${botPrefix}updatenote <number> <new _0xfcce23>`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0x663742 = await updateNote(sender, _0x710628, _0x09c438);
        if (!_0x663742) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, Note #${_0x710628} not found.`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        return await Gifted.sendMessage(from, {
            _0xfcce23: `✅ Hey @${getUserName(sender)}, Note #${_0x663742.noteNumber} updated!\n\n📝 "\x24\x7b\x6e\x6f\x74\x65\x2e\x63\x6f\x6e\x74\x65\x6e\x74\x7d"`,
            contextInfo: await getContextInfo([sender]),
        });
    },
);
gmd(
    {
        pattern: "\x64\x65\x6c\x6e\x6f\x74\x65",
        aliases: ["\x64\x65\x6c\x65\x74\x65\x6e\x6f\x74\x65", "\x72\x65\x6d\x6f\x76\x65\x6e\x6f\x74\x65", "\x72\x6d\x6e\x6f\x74\x65"],
        react: "🗑️",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x44\x65\x6c\x65\x74\x65\x20\x61\x20\x73\x70\x65\x63\x69\x66\x69\x63\x20\x6e\x6f\x74\x65",
    },
    async (from, Gifted, conText) => {
        const { sender, q, botPrefix } = conText;
        if (!q || isNaN(parseInt(q))) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, provide a _0x663742 number to delete.\n\nUsage: ${botPrefix}delnote <number>`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        const _0x710628 = parseInt(q);
        const _0x059de9 = await deleteNote(sender, _0x710628);
        if (!_0x059de9) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `❌ Hey @${getUserName(sender)}, Note #${_0x710628} not found.`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        return await Gifted.sendMessage(from, {
            _0xfcce23: `✅ Hey @${getUserName(sender)}, Note #${_0x710628} _0x059de9!`,
            contextInfo: await getContextInfo([sender]),
        });
    },
);
gmd(
    {
        pattern: "\x64\x65\x6c\x61\x6c\x6c\x6e\x6f\x74\x65\x73",
        aliases: ["\x64\x65\x6c\x65\x74\x65\x61\x6c\x6c\x6e\x6f\x74\x65\x73", "\x72\x65\x6d\x6f\x76\x65\x61\x6c\x6c\x6e\x6f\x74\x65\x73", "\x63\x6c\x65\x61\x72\x6e\x6f\x74\x65\x73", "\x64\x65\x6c\x6e\x6f\x74\x65\x73"],
        react: "🗑️",
        category: "\x6e\x6f\x74\x65\x73",
        description: "\x44\x65\x6c\x65\x74\x65\x20\x61\x6c\x6c\x20\x79\x6f\x75\x72\x20\x6e\x6f\x74\x65\x73",
    },
    async (from, Gifted, conText) => {
        const { sender } = conText;
        const _0x7d4591 = await deleteAllNotes(sender);
        if (_0x7d4591 === 0) {
            return await Gifted.sendMessage(from, {
                _0xfcce23: `📭 Hey @${getUserName(sender)}, you have no _0x9ca240 to delete.`,
                contextInfo: await getContextInfo([sender]),
            });
        }
        return await Gifted.sendMessage(from, {
            _0xfcce23: `✅ Hey @${getUserName(sender)}, _0x059de9 ${_0x7d4591} note${_0x7d4591 > 1 ? "s" : ""}!`,
            contextInfo: await getContextInfo([sender]),
        });
    },
);
module.exports = {};
