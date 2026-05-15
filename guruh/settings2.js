var _0x5ec97a=(function(_0x31a674,_0xdfb152){return !![]}());var _0xeb55f3=function(){return ![]};
const { gmd } = require("../guru/gmdCmds");
const { getSetting, setSetting } = require("../guru/database/settings");
const {
  getGroupSetting,
  setGroupSetting,
  resetAllGroupSettings,
  getAllGroupSettings,
} = require("../guru/database/groupSettings");
const { clearAllSudo, getSudoNumbers } = require("../guru/database/sudo");
const {
  getAllUsersNotes,
  deleteNoteById,
  updateNoteById,
  deleteAllNotes,
} = require("../guru/database/notes");
function parseBooleanInput(_0x1b58d7) {
  if (!_0x1b58d7) return null;
  const _0x7b8804 = _0x1b58d7.toLowerCase().trim();
  if (_0x7b8804 === "on") return "\x74\x72\x75\x65";
  if (_0x7b8804 === "\x6f\x66\x66") return "\x66\x61\x6c\x73\x65";
  return _0x7b8804;
}
function formatBoolDisplay(_0x7b8804) {
  return _0x7b8804 === "\x74\x72\x75\x65" ? "ON" : "\x4f\x46\x46";
}
function isSettingEnabled(_0x7b8804) {
  if (!_0x7b8804) return false;
  const v = String(_0x7b8804).toLowerCase().trim();
  return (
    v === "\x74\x72\x75\x65" ||
    v === "on" ||
    v === "1" ||
    v === "\x79\x65\x73" ||
    v === "\x77\x61\x72\x6e" ||
    v === "\x6b\x69\x63\x6b" ||
    v === "\x64\x65\x6c\x65\x74\x65"
  );
}
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x6c\x69\x6b\x65\x73\x74\x61\x74\x75\x73",
    aliases: ["\x61\x75\x74\x6f\x6c\x69\x6b\x65\x73\x74\x61\x74\x75\x73", "\x61\x75\x74\x6f\x73\x74\x61\x74\x75\x73\x6c\x69\x6b\x65", "\x73\x74\x61\x74\x75\x73\x6c\x69\x6b\x65", "\x61\x75\x74\x6f\x6c\x69\x6b\x65", "\x6c\x69\x6b\x65\x73\x74\x61\x74\x75\x73"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x6c\x69\x6b\x65\x20\x73\x74\x61\x74\x75\x73\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x4c\x49\x4b\x45\x5f\x53\x54\x41\x54\x55\x53");
      if (_0x21974d === _0x877eac) {
        return reply(
          `⚠️ Auto like status is already: *${formatBoolDisplay(_0x877eac)}*`,
        );
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x4c\x49\x4b\x45\x5f\x53\x54\x41\x54\x55\x53", _0x877eac);
      await react("✅");
      await reply(`✅ Auto like status set to: *${formatBoolDisplay(_0x877eac)}*\n\n⚠️ Note: Auto like only works when auto view (*autoreadstatus*) is also *ON*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x72\x65\x61\x64\x73\x74\x61\x74\x75\x73",
    aliases: ["\x61\x75\x74\x6f\x72\x65\x61\x64\x73\x74\x61\x74\x75\x73", "\x72\x65\x61\x64\x73\x74\x61\x74\x75\x73", "\x76\x69\x65\x77\x73\x74\x61\x74\x75\x73"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x72\x65\x61\x64\x20\x73\x74\x61\x74\x75\x73\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x52\x45\x41\x44\x5f\x53\x54\x41\x54\x55\x53");
      if (_0x21974d === _0x877eac) {
        return reply(
          `⚠️ Auto read status is already: *${formatBoolDisplay(_0x877eac)}*`,
        );
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x52\x45\x41\x44\x5f\x53\x54\x41\x54\x55\x53", _0x877eac);
      await react("✅");
      await reply(`✅ Auto read status set to: *${formatBoolDisplay(_0x877eac)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x73\x74\x61\x74\x75\x73\x65\x6d\x6f\x6a\x69\x73",
    aliases: ["\x73\x74\x61\x74\x75\x73\x65\x6d\x6f\x6a\x69\x73", "\x6c\x69\x6b\x65\x65\x6d\x6f\x6a\x69\x73"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x73\x74\x61\x74\x75\x73\x20\x6c\x69\x6b\x65\x20\x65\x6d\x6f\x6a\x69\x73\x20\x28\x63\x6f\x6d\x6d\x61\x20\x73\x65\x70\x61\x72\x61\x74\x65\x64\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q)
      return reply(
        "❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x65\x6d\x6f\x6a\x69\x73\x20\x73\x65\x70\x61\x72\x61\x74\x65\x64\x20\x62\x79\x20\x63\x6f\x6d\x6d\x61\x73\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x2e\x73\x65\x74\x73\x74\x61\x74\x75\x73\x65\x6d\x6f\x6a\x69\x73\x20💛\x2c❤️\x2c💜",
      );
    try {
      const _0x21974d = await getSetting("\x53\x54\x41\x54\x55\x53\x5f\x4c\x49\x4b\x45\x5f\x45\x4d\x4f\x4a\x49\x53");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Status emojis are already set to: *${q.trim()}*`);
      }
      await setSetting("\x53\x54\x41\x54\x55\x53\x5f\x4c\x49\x4b\x45\x5f\x45\x4d\x4f\x4a\x49\x53", q.trim());
      await react("✅");
      await reply(`✅ Status emojis set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x73\x74\x61\x74\x75\x73\x72\x65\x70\x6c\x79\x74\x65\x78\x74",
    aliases: ["\x73\x74\x61\x74\x75\x73\x72\x65\x70\x6c\x79\x74\x65\x78\x74", "\x73\x74\x61\x74\x75\x73\x72\x65\x70\x6c\x79"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x73\x74\x61\x74\x75\x73\x20\x72\x65\x70\x6c\x79\x20\x74\x65\x78\x74",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x72\x65\x70\x6c\x79\x20\x74\x65\x78\x74\x21");
    try {
      const _0x21974d = await getSetting("\x53\x54\x41\x54\x55\x53\x5f\x52\x45\x50\x4c\x59\x5f\x54\x45\x58\x54");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Status reply _0x7c0f1e is already set to this _0x877eac!`);
      }
      await setSetting("\x53\x54\x41\x54\x55\x53\x5f\x52\x45\x50\x4c\x59\x5f\x54\x45\x58\x54", q.trim());
      await react("✅");
      await reply(`✅ Status reply _0x7c0f1e updated!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x72\x65\x61\x63\x74",
    aliases: ["\x61\x75\x74\x6f\x72\x65\x61\x63\x74", "\x72\x65\x61\x63\x74"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x72\x65\x61\x63\x74\x20\x6d\x6f\x64\x65\x20\x28\x6f\x6e\x2f\x61\x6c\x6c\x2f\x64\x6d\x2f\x67\x72\x6f\x75\x70\x73\x2f\x63\x6f\x6d\x6d\x61\x6e\x64\x73\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1b58d7 = (q || "").toLowerCase().trim();
    const _0xbaa6d4 = ["on", "\x61\x6c\x6c", "dm", "\x67\x72\x6f\x75\x70\x73", "\x63\x6f\x6d\x6d\x61\x6e\x64\x73", "\x6f\x66\x66"];
    if (!_0x1b58d7 || !_0xbaa6d4.includes(_0x1b58d7)) {
      return reply(
        `❌ Please specify a _0x578c6c mode:\n• *on/all* - React to all messages\n• *dm* - React to private chats only\n• *groups* - React to group messages only\n• *commands* - React to bot commands only\n• *off* - Disable auto react`,
      );
    }
    const _0x877eac = _0x1b58d7 === "on" ? "\x61\x6c\x6c" : _0x1b58d7;
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x52\x45\x41\x43\x54");
      if (_0x21974d === _0x877eac) {
        return reply(
          `⚠️ Auto react is already set to: *${_0x877eac.toUpperCase()}*`,
        );
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x52\x45\x41\x43\x54", _0x877eac);
      await react("✅");
      await reply(`✅ Auto react set to: *${_0x877eac.toUpperCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x72\x65\x70\x6c\x79",
    aliases: ["\x61\x75\x74\x6f\x72\x65\x70\x6c\x79"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x72\x65\x70\x6c\x79\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x52\x45\x50\x4c\x59");
      if (_0x21974d === _0x877eac) {
        return reply(`⚠️ Auto reply is already: *${formatBoolDisplay(_0x877eac)}*`);
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x52\x45\x50\x4c\x59", _0x877eac);
      await react("✅");
      await reply(`✅ Auto reply set to: *${formatBoolDisplay(_0x877eac)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x62\x69\x6f",
    aliases: ["\x61\x75\x74\x6f\x62\x69\x6f", "\x62\x69\x6f"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x62\x69\x6f\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x42\x49\x4f");
      if (_0x21974d === _0x877eac) {
        return reply(`⚠️ Auto bio is already: *${formatBoolDisplay(_0x877eac)}*`);
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x42\x49\x4f", _0x877eac);
      await react("✅");
      await reply(`✅ Auto bio set to: *${formatBoolDisplay(_0x877eac)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x62\x6c\x6f\x63\x6b",
    aliases: ["\x61\x75\x74\x6f\x62\x6c\x6f\x63\x6b", "\x62\x6c\x6f\x63\x6b\x63\x6f\x75\x6e\x74\x72\x79"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description:
      "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x62\x6c\x6f\x63\x6b\x20\x63\x6f\x75\x6e\x74\x72\x79\x20\x63\x6f\x64\x65\x73\x20\x28\x63\x6f\x6d\x6d\x61\x20\x73\x65\x70\x61\x72\x61\x74\x65\x64\x20\x6f\x72\x20\x65\x6d\x70\x74\x79\x20\x74\x6f\x20\x64\x69\x73\x61\x62\x6c\x65\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    try {
      const _0x877eac = q ? q.trim() : "";
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x42\x4c\x4f\x43\x4b");
      if (_0x21974d === _0x877eac) {
        if (_0x877eac) {
          return reply(`⚠️ Auto block is already set to: *${_0x877eac}*`);
        } else {
          return reply(`⚠️ Auto block is already disabled!`);
        }
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x42\x4c\x4f\x43\x4b", _0x877eac);
      await react("✅");
      if (_0x877eac) {
        await reply(`✅ Auto block set for country codes: *${_0x877eac}*`);
      } else {
        await reply(`✅ Auto block disabled`);
      }
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x72\x65\x61\x64",
    aliases: ["\x61\x75\x74\x6f\x72\x65\x61\x64", "\x72\x65\x61\x64\x6d\x65\x73\x73\x61\x67\x65\x73"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x72\x65\x61\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x73\x20\x6d\x6f\x64\x65\x20\x28\x6f\x6e\x2f\x61\x6c\x6c\x2f\x64\x6d\x2f\x67\x72\x6f\x75\x70\x73\x2f\x63\x6f\x6d\x6d\x61\x6e\x64\x73\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1b58d7 = (q || "").toLowerCase().trim();
    const _0xbaa6d4 = ["on", "\x61\x6c\x6c", "dm", "\x67\x72\x6f\x75\x70\x73", "\x63\x6f\x6d\x6d\x61\x6e\x64\x73", "\x6f\x66\x66"];
    if (!_0x1b58d7 || !_0xbaa6d4.includes(_0x1b58d7)) {
      return reply(
        `❌ Please specify a _0x578c6c mode:\n• *on/all* - Read all messages\n• *dm* - Read private chats only\n• *groups* - Read group messages only\n• *commands* - Read bot commands only\n• *off* - Disable auto read`,
      );
    }
    const _0x877eac = _0x1b58d7 === "on" ? "\x61\x6c\x6c" : _0x1b58d7;
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x52\x45\x41\x44\x5f\x4d\x45\x53\x53\x41\x47\x45\x53");
      if (_0x21974d === _0x877eac) {
        return reply(
          `⚠️ Auto read messages is already set to: *${_0x877eac.toUpperCase()}*`,
        );
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x52\x45\x41\x44\x5f\x4d\x45\x53\x53\x41\x47\x45\x53", _0x877eac);
      await react("✅");
      await reply(`✅ Auto read messages set to: *${_0x877eac.toUpperCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x79\x74\x6c\x69\x6e\x6b",
    aliases: ["\x79\x74\x6c\x69\x6e\x6b", "\x79\x6f\x75\x74\x75\x62\x65", "\x73\x65\x74\x79\x74"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x59\x6f\x75\x54\x75\x62\x65\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x6c\x69\x6e\x6b",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x59\x6f\x75\x54\x75\x62\x65\x20\x6c\x69\x6e\x6b\x21");
    try {
      const _0x21974d = await getSetting("YT");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ YouTube link is already set to: *${q.trim()}*`);
      }
      await setSetting("YT", q.trim());
      await react("✅");
      await reply(`✅ YouTube link set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x6a\x69\x64",
    aliases: ["\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x6a\x69\x64", "\x63\x68\x61\x6e\x6e\x65\x6c\x6a\x69\x64"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x20\x4a\x49\x44",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x20\x4a\x49\x44\x21");
    try {
      const _0x21974d = await getSetting("\x4e\x45\x57\x53\x4c\x45\x54\x54\x45\x52\x5f\x4a\x49\x44");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Newsletter JID is already set to this _0x877eac!`);
      }
      await setSetting("\x4e\x45\x57\x53\x4c\x45\x54\x54\x45\x52\x5f\x4a\x49\x44", q.trim());
      await react("✅");
      await reply(`✅ Newsletter JID set!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x67\x63\x6a\x69\x64",
    aliases: ["\x67\x63\x6a\x69\x64", "\x67\x72\x6f\x75\x70\x6a\x69\x64", "\x73\x75\x70\x70\x6f\x72\x74\x67\x63"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x67\x72\x6f\x75\x70\x20\x63\x68\x61\x74\x20\x4a\x49\x44\x2f\x69\x6e\x76\x69\x74\x65\x20\x63\x6f\x64\x65",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x67\x72\x6f\x75\x70\x20\x4a\x49\x44\x20\x6f\x72\x20\x69\x6e\x76\x69\x74\x65\x20\x63\x6f\x64\x65\x21");
    try {
      const _0x21974d = await getSetting("\x47\x43\x5f\x4a\x49\x44");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Group JID is already set to this _0x877eac!`);
      }
      await setSetting("\x47\x43\x5f\x4a\x49\x44", q.trim());
      await react("✅");
      await reply(`✅ Group JID set!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x75\x72\x6c",
    aliases: ["\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x75\x72\x6c", "\x63\x68\x61\x6e\x6e\x65\x6c\x75\x72\x6c"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x20\x55\x52\x4c",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x20\x55\x52\x4c\x21");
    try {
      const _0x21974d = await getSetting("\x4e\x45\x57\x53\x4c\x45\x54\x54\x45\x52\x5f\x55\x52\x4c");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Newsletter URL is already set to this _0x877eac!`);
      }
      await setSetting("\x4e\x45\x57\x53\x4c\x45\x54\x54\x45\x52\x5f\x55\x52\x4c", q.trim());
      await react("✅");
      await reply(`✅ Newsletter URL set!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x62\x6f\x74\x72\x65\x70\x6f",
    aliases: ["\x62\x6f\x74\x72\x65\x70\x6f", "\x72\x65\x70\x6f", "\x73\x65\x74\x72\x65\x70\x6f"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x72\x65\x70\x6f\x73\x69\x74\x6f\x72\x79",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x72\x65\x70\x6f\x73\x69\x74\x6f\x72\x79\x21");
    try {
      const _0x21974d = await getSetting("\x42\x4f\x54\x5f\x52\x45\x50\x4f");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Bot repository is already set to: *${q.trim()}*`);
      }
      await setSetting("\x42\x4f\x54\x5f\x52\x45\x50\x4f", q.trim());
      await react("✅");
      await reply(`✅ Bot repository set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x70\x61\x63\x6b\x6e\x61\x6d\x65",
    aliases: ["\x70\x61\x63\x6b\x6e\x61\x6d\x65", "\x73\x74\x69\x63\x6b\x65\x72\x70\x61\x63\x6b", "\x73\x74\x69\x63\x6b\x65\x72\x6e\x61\x6d\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x73\x74\x69\x63\x6b\x65\x72\x20\x70\x61\x63\x6b\x20\x6e\x61\x6d\x65",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x70\x61\x63\x6b\x20\x6e\x61\x6d\x65\x21");
    try {
      const _0x21974d = await getSetting("\x50\x41\x43\x4b\x5f\x4e\x41\x4d\x45");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Pack name is already set to: *${q.trim()}*`);
      }
      await setSetting("\x50\x41\x43\x4b\x5f\x4e\x41\x4d\x45", q.trim());
      await react("✅");
      await reply(`✅ Pack name set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x70\x61\x63\x6b\x61\x75\x74\x68\x6f\x72",
    aliases: ["\x70\x61\x63\x6b\x61\x75\x74\x68\x6f\x72", "\x73\x74\x69\x63\x6b\x65\x72\x61\x75\x74\x68\x6f\x72"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x73\x74\x69\x63\x6b\x65\x72\x20\x70\x61\x63\x6b\x20\x61\x75\x74\x68\x6f\x72",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x70\x61\x63\x6b\x20\x61\x75\x74\x68\x6f\x72\x21");
    try {
      const _0x21974d = await getSetting("\x50\x41\x43\x4b\x5f\x41\x55\x54\x48\x4f\x52");
      if (_0x21974d === q.trim()) {
        return reply(`⚠️ Pack author is already set to: *${q.trim()}*`);
      }
      await setSetting("\x50\x41\x43\x4b\x5f\x41\x55\x54\x48\x4f\x52", q.trim());
      await react("✅");
      await reply(`✅ Pack author set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x67\x65\x74\x73\x65\x74\x74\x69\x6e\x67",
    aliases: ["\x67\x65\x74\x63\x6f\x6e\x66\x69\x67", "\x76\x69\x65\x77\x73\x65\x74\x74\x69\x6e\x67"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x47\x65\x74\x20\x61\x20\x73\x70\x65\x63\x69\x66\x69\x63\x20\x73\x65\x74\x74\x69\x6e\x67\x20\x76\x61\x6c\x75\x65",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q)
      return reply(
        "❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x65\x74\x74\x69\x6e\x67\x20\x6b\x65\x79\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x2e\x67\x65\x74\x73\x65\x74\x74\x69\x6e\x67\x20\x50\x52\x45\x46\x49\x58",
      );
    try {
      const _0x877eac = await getSetting(q.toUpperCase().trim());
      await react("✅");
      await reply(`⚙️ *${q.toUpperCase()}:* ${_0x877eac || "\x4e\x6f\x74\x20\x53\x65\x74"}`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x73\x65\x74\x74\x69\x6e\x67",
    aliases: ["\x73\x65\x74\x63\x6f\x6e\x66\x69\x67", "\x63\x6f\x6e\x66\x69\x67"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x6e\x79\x20\x73\x65\x74\x74\x69\x6e\x67\x20\x28\x6b\x65\x79\x20\x76\x61\x6c\x75\x65\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q || !q.includes(" ")) {
      return reply(
        "❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x6b\x65\x79\x20\x61\x6e\x64\x20\x76\x61\x6c\x75\x65\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x2e\x73\x65\x74\x73\x65\x74\x74\x69\x6e\x67\x20\x50\x52\x45\x46\x49\x58\x20\x21",
      );
    }
    try {
      const _0x53f440 = q.split(" ");
      const _0xe975fe = _0x53f440[0].toUpperCase();
      const _0x877eac = _0x53f440.slice(1).join(" ");
      const _0x21974d = await getSetting(_0xe975fe);
      if (_0x21974d === _0x877eac) {
        return reply(`⚠️ *${_0xe975fe}* is already set to: *${_0x877eac}*`);
      }
      await setSetting(_0xe975fe, _0x877eac);
      await react("✅");
      await reply(`✅ *${_0xe975fe}* set to: *${_0x877eac}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x72\x65\x73\x65\x74\x73\x65\x74\x74\x69\x6e\x67",
    aliases: ["\x72\x65\x73\x65\x74\x63\x6f\x6e\x66\x69\x67", "\x64\x65\x66\x61\x75\x6c\x74\x73\x65\x74\x74\x69\x6e\x67"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x52\x65\x73\x65\x74\x20\x61\x20\x73\x65\x74\x74\x69\x6e\x67\x20\x74\x6f\x20\x64\x65\x66\x61\x75\x6c\x74",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x65\x74\x74\x69\x6e\x67\x20\x6b\x65\x79\x20\x74\x6f\x20\x72\x65\x73\x65\x74\x21");
    try {
      const _0x074250 = await resetSetting(q.toUpperCase().trim());
      await react("✅");
      await reply(
        `✅ *${q.toUpperCase()}* reset to default: *${_0x074250 || "\x4e\x6f\x74\x20\x53\x65\x74"}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x72\x65\x73\x65\x74\x61\x6c\x6c\x73\x65\x74\x74\x69\x6e\x67\x73",
    aliases: ["\x72\x65\x73\x65\x74\x73\x65\x74\x74\x69\x6e\x67\x73", "\x72\x65\x73\x65\x74\x61\x6c\x6c", "\x64\x65\x66\x61\x75\x6c\x74\x73\x65\x74\x74\x69\x6e\x67\x73"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x52\x65\x73\x65\x74\x20\x61\x6c\x6c\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x20\x74\x6f\x20\x64\x65\x66\x61\x75\x6c\x74\x73",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    try {
      await resetAllSettings();
      await react("✅");
      await reply(`✅ All _0x35a1de have been reset to defaults!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x75\x74\x6f\x72\x65\x70\x6c\x79\x73\x74\x61\x74\x75\x73",
    aliases: ["\x61\x75\x74\x6f\x72\x65\x70\x6c\x79\x73\x74\x61\x74\x75\x73", "\x72\x65\x70\x6c\x79\x73\x74\x61\x74\x75\x73\x61\x75\x74\x6f"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x75\x74\x6f\x20\x72\x65\x70\x6c\x79\x20\x74\x6f\x20\x73\x74\x61\x74\x75\x73\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getSetting("\x41\x55\x54\x4f\x5f\x52\x45\x50\x4c\x59\x5f\x53\x54\x41\x54\x55\x53");
      if (_0x21974d === _0x877eac) {
        return reply(
          `⚠️ Auto reply status is already: *${formatBoolDisplay(_0x877eac)}*`,
        );
      }
      await setSetting("\x41\x55\x54\x4f\x5f\x52\x45\x50\x4c\x59\x5f\x53\x54\x41\x54\x55\x53", _0x877eac);
      await react("✅");
      await reply(`✅ Auto reply status set to: *${formatBoolDisplay(_0x877eac)}*\n\n⚠️ Note: Auto reply to status only works when auto view (*autoreadstatus*) is also *ON*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x70\x6d\x70\x65\x72\x6d\x69\x74",
    aliases: ["\x70\x6d\x70\x65\x72\x6d\x69\x74"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x50\x4d\x20\x70\x65\x72\x6d\x69\x74\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getSetting("\x50\x4d\x5f\x50\x45\x52\x4d\x49\x54");
      if (_0x21974d === _0x877eac) {
        return reply(`⚠️ PM Permit is already: *${formatBoolDisplay(_0x877eac)}*`);
      }
      await setSetting("\x50\x4d\x5f\x50\x45\x52\x4d\x49\x54", _0x877eac);
      await react("✅");
      await reply(`✅ PM Permit set to: *${formatBoolDisplay(_0x877eac)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x67\x72\x6f\x75\x70\x65\x76\x65\x6e\x74\x73",
    aliases: ["\x67\x72\x6f\x75\x70\x65\x76\x65\x6e\x74\x73", "\x67\x63\x65\x76\x65\x6e\x74\x73", "\x73\x65\x74\x67\x63\x65\x76\x65\x6e\x74\x73", "\x65\x76\x65\x6e\x74\x73"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description:
      "\x53\x65\x74\x20\x67\x72\x6f\x75\x70\x20\x65\x76\x65\x6e\x74\x73\x20\x6e\x6f\x74\x69\x66\x69\x63\x61\x74\x69\x6f\x6e\x73\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29\x20\x2d\x20\x70\x72\x6f\x6d\x6f\x74\x65\x73\x2f\x64\x65\x6d\x6f\x74\x65\x73",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x578c6c = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x877eac = parseBooleanInput(q);
    if (!_0x877eac || !_0x578c6c.includes(_0x877eac)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x21974d = await getGroupSetting(from, "\x47\x52\x4f\x55\x50\x5f\x45\x56\x45\x4e\x54\x53");
      if (_0x21974d === _0x877eac) {
        return reply(
          `⚠️ Group events for this group is already: *${formatBoolDisplay(_0x877eac)}*`,
        );
      }
      await setGroupSetting(from, "\x47\x52\x4f\x55\x50\x5f\x45\x56\x45\x4e\x54\x53", _0x877eac);
      await react("✅");
      await reply(
        `✅ Group events for this group: *${formatBoolDisplay(_0x877eac)}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x72\x65\x73\x65\x74\x73\x75\x64\x6f",
    aliases: ["\x64\x65\x6c\x65\x74\x65\x61\x6c\x6c\x73\x75\x64\x6f\x73", "\x72\x65\x73\x65\x74\x73\x75\x64\x6f\x73", "\x63\x6c\x65\x61\x72\x73\x75\x64\x6f", "\x63\x6c\x65\x61\x72\x73\x75\x64\x6f\x73"],
    react: "🗑️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x52\x65\x6d\x6f\x76\x65\x20\x61\x6c\x6c\x20\x73\x75\x64\x6f\x20\x6e\x75\x6d\x62\x65\x72\x73\x20\x66\x72\x6f\x6d\x20\x64\x61\x74\x61\x62\x61\x73\x65",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    try {
      const _0x8125ad = await getSudoNumbers();
      if (_0x8125ad.length === 0) {
        return reply("⚠️\x20\x4e\x6f\x20\x73\x75\x64\x6f\x20\x6e\x75\x6d\x62\x65\x72\x73\x20\x74\x6f\x20\x72\x65\x6d\x6f\x76\x65\x2e");
      }
      const _0x6718e5 = await clearAllSudo();
      await react("✅");
      await reply(`✅ Removed *${_0x6718e5}* sudo number(s) from database.`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x67\x72\x6f\x75\x70\x73\x65\x74\x74\x69\x6e\x67\x73",
    aliases: ["\x67\x63\x73\x65\x74\x74\x69\x6e\x67\x73", "\x67\x63\x73\x65\x74", "\x67\x72\x6f\x75\x70\x73\x65\x74", "\x67\x73\x65\x74\x74\x69\x6e\x67\x73"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x56\x69\x65\x77\x20\x61\x6c\x6c\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isAdmin, isSuperAdmin, isGroup, groupName } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isAdmin && !isSuperAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    try {
      const {
        getBadWords,
        DEFAULT_BAD_WORDS,
      } = require("../guru/database/groupSettings");
      const _0x35a1de = await getAllGroupSettings(from);
      const _0x2516da = isSettingEnabled(_0x35a1de.WELCOME_MESSAGE)
        ? "ON"
        : "\x4f\x46\x46";
      const _0x345c5a = isSettingEnabled(_0x35a1de.GOODBYE_MESSAGE)
        ? "ON"
        : "\x4f\x46\x46";
      const _0xdec512 = isSettingEnabled(_0x35a1de.GROUP_EVENTS)
        ? "ON"
        : "\x4f\x46\x46";
      const _0x4bf2bd = isSettingEnabled(_0x35a1de.ANTILINK) ? "ON" : "\x4f\x46\x46";
      const _0x5faa38 = isSettingEnabled(_0x35a1de.ANTIBAD) ? "ON" : "\x4f\x46\x46";
      const _0x80f279 = _0x35a1de.ANTIGROUPMENTION || "\x6f\x66\x66";
      let _0xaaaf36 = "\x4f\x46\x46";
      let _0x56433c = "";
      if (isSettingEnabled(_0x80f279)) {
        _0xaaaf36 = "ON";
        if (_0x80f279 === "\x6b\x69\x63\x6b") {
          _0x56433c = "\x6b\x69\x63\x6b";
        } else {
          _0x56433c = "\x77\x61\x72\x6e";
        }
      }
      const _0x7d50b6 = await getBadWords(from);
      const _0x1cd3da = new Set(
        DEFAULT_BAD_WORDS.map((w) => w.toLowerCase()),
      );
      const _0xd7dbbd =
        _0x7d50b6.length === DEFAULT_BAD_WORDS.length &&
        _0x7d50b6.every((w) => _0x1cd3da.has(w.toLowerCase()));
      let _0x18dac7 = "\x4e\x6f\x6e\x65";
      if (_0x7d50b6.length > 0) {
        if (_0xd7dbbd) {
          _0x18dac7 = "\x44\x65\x66\x61\x75\x6c\x74\x20\x6c\x69\x73\x74";
        } else {
          const _0x7064dc = _0x7d50b6.slice(0, 5).join(", ");
          _0x18dac7 =
            _0x7d50b6.length > 5
              ? `${_0x7064dc}... (+${_0x7d50b6.length - 5} more)`
              : _0x7064dc;
        }
      }
      const _0x192d42 = _0x35a1de.WELCOME_MESSAGE_TEXT || "\x44\x65\x66\x61\x75\x6c\x74";
      const _0x54ca26 = _0x35a1de.GOODBYE_MESSAGE_TEXT || "\x44\x65\x66\x61\x75\x6c\x74";
      let _0x583702 = `╭━━━━━━━━━━━╮\n`;
      _0x583702 += `│ ⚙️ *GROUP SETTINGS*\n`;
      _0x583702 += `├━━━━━━━━━━━┤\n`;
      _0x583702 += `│ 📍 *${groupName || "\x54\x68\x69\x73\x20\x47\x72\x6f\x75\x70"}*\n`;
      _0x583702 += `├━━━━━━━━━━━┤\n`;
      _0x583702 += `│\n`;
      _0x583702 += `│ 👋 *Welcome:* ${_0x2516da}\n`;
      _0x583702 += `│ 👋 *Goodbye:* ${_0x345c5a}\n`;
      _0x583702 += `│ 📢 *Events:* ${_0xdec512}\n`;
      _0x583702 += `│\n`;
      _0x583702 += `├━━━━━━━━━━━┤\n`;
      _0x583702 += `│ 🛡️ *PROTECTION*\n`;
      _0x583702 += `├━━━━━━━━━━━┤\n`;
      _0x583702 += `│\n`;
      const _0xea32ae = _0x35a1de.ANTILINK || "\x6f\x66\x66";
      let _0x8a8fce = "\x64\x65\x6c\x65\x74\x65";
      if (_0xea32ae === "\x77\x61\x72\x6e") _0x8a8fce = "\x77\x61\x72\x6e";
      else if (_0xea32ae === "\x6b\x69\x63\x6b") _0x8a8fce = "\x6b\x69\x63\x6b";
      _0x583702 += `│ 🔗 *Antilink:* ${_0x4bf2bd}\n`;
      if (_0x4bf2bd === "ON") {
        _0x583702 += `│ └ Action: ${_0x8a8fce}\n`;
        if (_0x8a8fce === "\x77\x61\x72\x6e") {
          _0x583702 += `│ └ Warns: ${_0x35a1de.ANTILINK_WARN_COUNT}\n`;
        }
      }
      _0x583702 += `│\n`;
      _0x583702 += `│ 🚫 *Antibad:* ${_0x5faa38}\n`;
      _0x583702 += `│ └ Warns: ${_0x35a1de.ANTIBAD_WARN_COUNT}\n`;
      _0x583702 += `│ └ Words: ${_0x18dac7}\n`;
      _0x583702 += `│\n`;
      _0x583702 += `│ 📢 *Anti-Status-Mention:* ${_0xaaaf36}\n`;
      if (_0xaaaf36 === "ON") {
        _0x583702 += `│ └ Action: ${_0x56433c}\n`;
        if (_0x56433c === "\x77\x61\x72\x6e") {
          _0x583702 += `│ └ Warn Limit: ${_0x35a1de.ANTIGROUPMENTION_WARN_COUNT || 3}\n`;
        }
      }
      _0x583702 += `│\n`;
      _0x583702 += `├━━━━━━━━━━━┤\n`;
      _0x583702 += `│ 💬 *MESSAGES*\n`;
      _0x583702 += `├━━━━━━━━━━━┤\n`;
      _0x583702 += `│\n`;
      _0x583702 += `│ *Welcome Msg:*\n`;
      _0x583702 += `│ ${_0x192d42.length > 0x32 ? _0x192d42.substring(0, 0x32) + "..." : _0x192d42}\n`;
      _0x583702 += `│\n`;
      _0x583702 += `│ *Goodbye Msg:*\n`;
      _0x583702 += `│ ${_0x54ca26.length > 0x32 ? _0x54ca26.substring(0, 0x32) + "..." : _0x54ca26}\n`;
      _0x583702 += `│\n`;
      _0x583702 += `╰━━━━━━━━━━━╯\n`;
      _0x583702 += `\n_Use .setwelcome, .setgoodbye, .setantilink, etc to modify_`;
      await react("✅");
      await reply(_0x583702);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x72\x65\x73\x65\x74\x67\x72\x6f\x75\x70",
    aliases: ["\x72\x65\x73\x65\x74\x67\x72\x6f\x75\x70\x73\x65\x74\x74\x69\x6e\x67\x73", "\x63\x6c\x65\x61\x72\x67\x72\x6f\x75\x70\x73\x65\x74\x74\x69\x6e\x67\x73", "\x72\x65\x73\x65\x74\x67\x63", "\x63\x6c\x65\x61\x72\x67\x63"],
    react: "🗑️",
    category: "\x67\x72\x6f\x75\x70",
    description:
      "\x52\x65\x73\x65\x74\x20\x61\x6c\x6c\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x20\x28\x77\x65\x6c\x63\x6f\x6d\x65\x2c\x20\x67\x6f\x6f\x64\x62\x79\x65\x2c\x20\x61\x6e\x74\x69\x6c\x69\x6e\x6b\x2c\x20\x65\x74\x63\x2e\x29",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, isGroup } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    try {
      await resetAllGroupSettings(from);
      await react("✅");
      await reply(
        `✅ All _0x35a1de for this group have been reset to defaults.\n\n*Cleared:*\n▸ Welcome message\n▸ Goodbye message\n▸ Group events\n▸ Antilink\n▸ Antilink warnings`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x72\x65\x73\x65\x74\x64\x62",
    aliases: [
      "\x72\x65\x73\x65\x74\x64\x61\x74\x61\x62\x61\x73\x65",
      "\x77\x69\x70\x65\x64\x61\x74\x61\x62\x61\x73\x65",
      "\x77\x69\x70\x65\x64\x62",
      "\x66\x61\x63\x74\x6f\x72\x79\x72\x65\x73\x65\x74",
      "\x66\x6c\x75\x73\x68\x64\x62",
      "\x66\x6c\x75\x73\x68\x64\x61\x74\x61\x62\x61\x73\x65",
    ],
    react: "⚠️",
    category: "\x6f\x77\x6e\x65\x72",
    description:
      "\x52\x65\x73\x65\x74\x20\x65\x6e\x74\x69\x72\x65\x20\x64\x61\x74\x61\x62\x61\x73\x65\x20\x74\x6f\x20\x64\x65\x66\x61\x75\x6c\x74\x73\x20\x28\x62\x6f\x74\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x2c\x20\x73\x75\x64\x6f\x2c\x20\x67\x72\x6f\x75\x70\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (q !== "\x63\x6f\x6e\x66\x69\x72\x6d") {
      return reply(
        `⚠️ *WARNING: This will reset EVERYTHING!*\n\n*Will be cleared:*\n▸ All bot _0x35a1de\n▸ All sudo numbers\n▸ All group _0x35a1de\n▸ All antilink warnings\n\nTo confirm, type: *.resetdb confirm*`,
      );
    }
    try {
      await resetAllSettings();
      await clearAllSudo();
      const {
        GroupSettingsDB,
        AntilinkWarningsDB,
      } = require("../guru/database/groupSettings");
      await GroupSettingsDB.destroy({ where: {} });
      await AntilinkWarningsDB.destroy({ where: {} });
      await react("✅");
      await reply(
        `✅ Database has been completely reset to defaults.\n\nAll _0x35a1de, sudo numbers, and group configurations have been cleared.`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x61\x6c\x6c\x6e\x6f\x74\x65\x73",
    aliases: ["\x76\x69\x65\x77\x6e\x6f\x74\x65\x73", "\x75\x73\x65\x72\x6e\x6f\x74\x65\x73", "\x61\x6c\x6c\x6e\x6f\x74\x65\x73\x64\x62"],
    react: "📋",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x56\x69\x65\x77\x20\x61\x6c\x6c\x20\x75\x73\x65\x72\x73\x27\x20\x6e\x6f\x74\x65\x73\x20\x28\x6f\x77\x6e\x65\x72\x20\x6f\x6e\x6c\x79\x29",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    try {
      const _0xe9d6f0 = await getAllUsersNotes();
      if (_0xe9d6f0.length === 0) {
        return reply("📭\x20\x4e\x6f\x20\x6e\x6f\x74\x65\x73\x20\x69\x6e\x20\x74\x68\x65\x20\x64\x61\x74\x61\x62\x61\x73\x65\x2e");
      }
      const _0xf4c838 = {};
      for (const _0x93d791 of _0xe9d6f0) {
        if (!_0xf4c838[_0x93d791.userJid]) {
          _0xf4c838[_0x93d791.userJid] = [];
        }
        _0xf4c838[_0x93d791.userJid].push(_0x93d791);
      }
      let _0x7c0f1e = `📋 *ALL USER NOTES*\n\n`;
      _0x7c0f1e += `Total: ${_0xe9d6f0.length} notes from ${Object.keys(_0xf4c838).length} users\n\n`;
      for (const [_0x25057b, notes] of Object.entries(_0xf4c838)) {
        const _0x212790 = _0x25057b.split("@")[0];
        _0x7c0f1e += `👤 *@${_0x212790}* (${notes.length} notes)\n`;
        for (const _0x93d791 of notes) {
          const _0x31e7be =
            _0x93d791.content.length > 0x1E
              ? _0x93d791.content.substring(0, 0x1E) + "..."
              : _0x93d791.content;
          _0x7c0f1e += `  ID:${_0x93d791.id} #${_0x93d791.noteNumber} - ${_0x31e7be}\n`;
        }
        _0x7c0f1e += `\n`;
      }
      _0x7c0f1e += `_Use .admindelnote <id> to delete a note_\n`;
      _0x7c0f1e += `_Use .adminupdatenote <id> <_0x7c0f1e> to update_\n`;
      _0x7c0f1e += `_Use .adminclearnotes <number> to clear user notes_`;
      await reply(_0x7c0f1e);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x61\x64\x6d\x69\x6e\x64\x65\x6c\x6e\x6f\x74\x65",
    aliases: ["\x64\x65\x6c\x65\x74\x65\x6e\x6f\x74\x65\x62\x79\x69\x64", "\x72\x6d\x6e\x6f\x74\x65\x62\x79\x69\x64", "\x61\x64\x6d\x69\x6e\x64\x65\x6c\x65\x74\x65\x6e\x6f\x74\x65"],
    react: "🗑️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x44\x65\x6c\x65\x74\x65\x20\x61\x6e\x79\x20\x6e\x6f\x74\x65\x20\x62\x79\x20\x49\x44\x20\x28\x6f\x77\x6e\x65\x72\x20\x6f\x6e\x6c\x79\x29",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    if (!q || isNaN(parseInt(q))) {
      return reply("❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x6e\x6f\x74\x65\x20\x49\x44\x2e\x5c\x6e\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x64\x6d\x69\x6e\x64\x65\x6c\x6e\x6f\x74\x65\x20\x3c\x69\x64\x3e");
    }
    try {
      const _0xe9f8ca = parseInt(q);
      const _0x8811a7 = await deleteNoteById(_0xe9f8ca);
      if (!_0x8811a7) {
        return reply(`❌ Note with ID ${_0xe9f8ca} not found.`);
      }
      await react("✅");
      return reply(`✅ Note ID ${_0xe9f8ca} _0x8811a7!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x61\x64\x6d\x69\x6e\x75\x70\x64\x61\x74\x65\x6e\x6f\x74\x65",
    aliases: ["\x65\x64\x69\x74\x6e\x6f\x74\x65\x62\x79\x69\x64", "\x75\x70\x64\x61\x74\x65\x6e\x6f\x74\x65\x62\x79\x69\x64", "\x61\x64\x6d\x69\x6e\x65\x64\x69\x74\x6e\x6f\x74\x65"],
    react: "✏️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x55\x70\x64\x61\x74\x65\x20\x61\x6e\x79\x20\x6e\x6f\x74\x65\x20\x62\x79\x20\x49\x44\x20\x28\x6f\x77\x6e\x65\x72\x20\x6f\x6e\x6c\x79\x29",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    if (!q || q.trim() === "") {
      return reply(
        "❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x6e\x6f\x74\x65\x20\x49\x44\x20\x61\x6e\x64\x20\x6e\x65\x77\x20\x63\x6f\x6e\x74\x65\x6e\x74\x2e\x5c\x6e\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x64\x6d\x69\x6e\x75\x70\x64\x61\x74\x65\x6e\x6f\x74\x65\x20\x3c\x69\x64\x3e\x20\x3c\x6e\x65\x77\x20\x74\x65\x78\x74\x3e",
      );
    }
    try {
      const _0x53f440 = q.trim().split(/\s+/);
      const _0xe9f8ca = parseInt(_0x53f440[0]);
      if (isNaN(_0xe9f8ca)) {
        return reply(
          "❌\x20\x46\x69\x72\x73\x74\x20\x61\x72\x67\x75\x6d\x65\x6e\x74\x20\x6d\x75\x73\x74\x20\x62\x65\x20\x61\x20\x6e\x6f\x74\x65\x20\x49\x44\x2e\x5c\x6e\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x64\x6d\x69\x6e\x75\x70\x64\x61\x74\x65\x6e\x6f\x74\x65\x20\x3c\x69\x64\x3e\x20\x3c\x6e\x65\x77\x20\x74\x65\x78\x74\x3e",
        );
      }
      const _0xd340d0 = _0x53f440.slice(1).join(" ");
      if (!_0xd340d0) {
        return reply(
          "❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x6e\x65\x77\x20\x63\x6f\x6e\x74\x65\x6e\x74\x2e\x5c\x6e\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x64\x6d\x69\x6e\x75\x70\x64\x61\x74\x65\x6e\x6f\x74\x65\x20\x3c\x69\x64\x3e\x20\x3c\x6e\x65\x77\x20\x74\x65\x78\x74\x3e",
        );
      }
      const _0x93d791 = await updateNoteById(_0xe9f8ca, _0xd340d0);
      if (!_0x93d791) {
        return reply(`❌ Note with ID ${_0xe9f8ca} not found.`);
      }
      await react("✅");
      return reply(`✅ Note ID ${_0xe9f8ca} updated!\n\n📝 "\x24\x7b\x6e\x6f\x74\x65\x2e\x63\x6f\x6e\x74\x65\x6e\x74\x7d"`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x61\x64\x6d\x69\x6e\x63\x6c\x65\x61\x72\x6e\x6f\x74\x65\x73",
    aliases: ["\x63\x6c\x65\x61\x72\x75\x73\x65\x72\x6e\x6f\x74\x65\x73", "\x64\x65\x6c\x65\x74\x65\x75\x73\x65\x72\x6e\x6f\x74\x65\x73", "\x61\x64\x6d\x69\x6e\x72\x6d\x61\x6c\x6c\x6e\x6f\x74\x65\x73"],
    react: "🗑️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x44\x65\x6c\x65\x74\x65\x20\x61\x6c\x6c\x20\x6e\x6f\x74\x65\x73\x20\x66\x6f\x72\x20\x61\x20\x73\x70\x65\x63\x69\x66\x69\x63\x20\x75\x73\x65\x72\x20\x28\x6f\x77\x6e\x65\x72\x20\x6f\x6e\x6c\x79\x29",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    if (!q || q.trim() === "") {
      return reply(
        "❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x75\x73\x65\x72\x20\x6e\x75\x6d\x62\x65\x72\x2e\x5c\x6e\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x64\x6d\x69\x6e\x63\x6c\x65\x61\x72\x6e\x6f\x74\x65\x73\x20\x3c\x6e\x75\x6d\x62\x65\x72\x3e",
      );
    }
    try {
      let _0x142ef9 = q.trim().replace(/[^0-9]/g, "");
      const _0x25057b = _0x142ef9 + "@s.whatsapp.net";
      const _0x6718e5 = await deleteAllNotes(_0x25057b);
      if (_0x6718e5 === 0) {
        return reply(`📭 No notes found for ${_0x142ef9}.`);
      }
      await react("✅");
      return reply(
        `✅ Deleted ${_0x6718e5} note${_0x6718e5 > 1 ? "s" : ""} for ${_0x142ef9}!`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
module.exports = {};
