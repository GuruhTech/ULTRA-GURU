var _0x85b696=(function(_0xd2421b,_0xbbf0c5){return !![]}());var _0x29c40c=function(){return ![]};
const { gmd, commands, getSetting } = require("../guru");
const fs = require("fs").promises;
const _0x71f708 = require("node:fs");
const { S_WHATSAPP_NET } = require("@whiskeysockets/baileys");
const { Jimp } = require("jimp");
const path = require("path");
const _0xc75fb9 = require("moment-timezone");
const {
  groupCache,
  getGroupMetadata,
  cachedGroupMetadata,
} = require("../guru/connection/groupCache");
const { exec: _shellExec } = require("child_process");
gmd(
  {
    pattern: "$",
    on: "\x62\x6f\x64\x79",
    react: "🖥️",
    category: "\x6f\x77\x6e\x65\x72",
    dontAddCommandList: true,
    description: "\x52\x75\x6e\x20\x61\x20\x73\x68\x65\x6c\x6c\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x24\x20\x3c\x63\x6f\x6d\x6d\x61\x6e\x64\x3e",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, body } = conText;
    if (!body.startsWith("$")) return;
    if (!isSuperUser) return;
    const _0x3c53db = body.slice(1).trim();
    if (!_0x3c53db) return reply("\x55\x73\x61\x67\x65\x3a\x20\x24\x20\x3c\x63\x6f\x6d\x6d\x61\x6e\x64\x3e");
    await react("⏳");
    _shellExec(_0x3c53db, { timeout: 0x7530, maxBuffer: 0x400 * 0x400 * 5 }, async (err, stdout, stderr) => {
      const _0x6e90be = (stdout || "") + (stderr ? `\n[stderr]\n${stderr}` : "");
      const _0xf9cd20 = err && !_0x6e90be.trim()
        ? `❌ Error: ${err.message}`
        : _0x6e90be.trim() || "\x28\x6e\x6f\x20\x6f\x75\x74\x70\x75\x74\x29";
      await react("✅");
      await reply("\x60\x60\x60\x5c\x6e" + _0xf9cd20.slice(0, 0xFA0) + "\n```");
    });
  }
);
gmd(
  {
    pattern: ">",
    on: "\x62\x6f\x64\x79",
    react: "⚡",
    category: "\x6f\x77\x6e\x65\x72",
    dontAddCommandList: true,
    description: "\x45\x76\x61\x6c\x75\x61\x74\x65\x20\x61\x20\x4a\x61\x76\x61\x53\x63\x72\x69\x70\x74\x20\x65\x78\x70\x72\x65\x73\x73\x69\x6f\x6e\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x3e\x20\x3c\x63\x6f\x64\x65\x3e",
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, isSuperUser, body } = conText;
    if (!body.startsWith(">")) return;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x6f\x6e\x6c\x79");
    const _0x4cc69a = body.slice(1).trim();
    if (!_0x4cc69a) return reply("\x55\x73\x61\x67\x65\x3a\x20\x3e\x20\x3c\x6a\x73\x20\x65\x78\x70\x72\x65\x73\x73\x69\x6f\x6e\x3e");
    await react("⏳");
    try {
      const _0x8aade7 = require("../guru");
      const _0xb0c651 = require("../guru/database/database").DATABASE;
      const _0x8533b8 = await _0x8aade7.getAllSettings();
      const { getSetting, setSetting, getAllSettings, commands } = _0x8aade7;
      const _0xb2b7cc = _0x8533b8.PREFIX;
      const _0x4e83aa = _0x8533b8.PREFIX;
      const db = new Proxy({ raw: _0xb0c651 }, {
        get(target, key) {
          if (key === '\x72\x61\x77') return _0xb0c651;
          if (key === '\x74\x6f\x4a\x53\x4f\x4e') return () => _0x8533b8;
          if (key === '\x74\x6f\x53\x74\x72\x69\x6e\x67') return () => JSON.stringify(_0x8533b8, null, 2);
          const _0x2630fc = String(key).toUpperCase();
          if (_0x2630fc in _0x8533b8) return _0x8533b8[_0x2630fc];
          return target[key];
        }
      });
      const _0x117672 = Gifted;
      const m = mek;
      const {
        sender, isGroup, groupInfo, groupName, participants,
        isSuperAdmin, isAdmin, isBotAdmin, superUser,
        botName, ownerNumber, ownerName,
        q, args, quotedMsg, quotedUser, quotedKey,
        pushName, tagged, mentionedJid, repliedMessage,
        botFooter, botCaption, botVersion, botPic,
        timeZone, newsletterJid, newsletterUrl,
        groupAdmins, isSuperUser, authorMessage,
      } = conText;
      let _0xf9cd20;
      try {
        _0xf9cd20 = await eval(`(async () => { return (${_0x4cc69a}) })()`);
      } catch (e1) {
        _0xf9cd20 = await eval(`(async () => { ${_0x4cc69a} })()`);
      }
      if (_0xf9cd20 === undefined) _0xf9cd20 = "\x28\x75\x6e\x64\x65\x66\x69\x6e\x65\x64\x29";
      let _0x6e90be;
      if (typeof _0xf9cd20 === "\x6f\x62\x6a\x65\x63\x74" && _0xf9cd20 !== null) {
        try {
          _0x6e90be = JSON.stringify(_0xf9cd20, null, 2);
        } catch (_) {
          _0x6e90be = String(_0xf9cd20);
        }
      } else {
        _0x6e90be = String(_0xf9cd20);
      }
      await react("✅");
      await reply("\x60\x60\x60\x5c\x6e" + _0x6e90be.slice(0, 0xFA0) + "\n```");
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);
