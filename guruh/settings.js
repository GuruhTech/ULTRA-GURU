var _0x010a1c=(function(_0x872abe,_0x94fab6){return !![]}());var _0x6b8577=function(){return ![]};
const { gmd, commands } = require("../guru/gmdCmds");
const {
  getSetting,
  setSetting,
  getAllSettings,
  resetSetting,
  resetAllSettings,
} = require("../guru/database/settings");
const {
  getGroupSetting,
  setGroupSetting,
  getEnabledGroupSettings,
  resetAllGroupSettings,
  getAllGroupSettings,
} = require("../guru/database/groupSettings");
const { getSudoNumbers, clearAllSudo } = require("../guru/database/sudo");
const {
  getAllUsersNotes,
  deleteNoteById,
  updateNoteById,
  deleteAllNotes,
  NotesDB,
} = require("../guru/database/notes");
function parseBooleanInput(_0xa1c488) {
  if (!_0xa1c488) return null;
  const _0x279258 = _0xa1c488.toLowerCase().trim();
  if (_0x279258 === "on") return "\x74\x72\x75\x65";
  if (_0x279258 === "\x6f\x66\x66") return "\x66\x61\x6c\x73\x65";
  return _0x279258;
}
function formatBoolDisplay(_0x279258) {
  return _0x279258 === "\x74\x72\x75\x65" ? "ON" : "\x4f\x46\x46";
}
function isSettingEnabled(_0x279258) {
  if (!_0x279258) return false;
  const v = String(_0x279258).toLowerCase().trim();
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
async function formatGroupsWithNames(jids, Gifted) {
  if (!jids || jids.length === 0) return "\x4e\x6f\x6e\x65";
  const _0x3f87fc = await Promise.all(
    jids.map(async (jid) => {
      try {
        const _0xd0aa50 = await Gifted.groupMetadata(jid);
        const _0xa1c1bf = _0xd0aa50?.subject || "\x55\x6e\x6b\x6e\x6f\x77\x6e";
        return `• ${_0xa1c1bf}`;
      } catch (e) {
        return `• ${jid}`;
      }
    }),
  );
  return _0x3f87fc.join("\n");
}
gmd(
  {
    pattern: "\x73\x65\x74\x74\x69\x6e\x67\x73",
    aliases: ["\x62\x6f\x74\x73\x65\x74\x74\x69\x6e\x67\x73", "\x73\x65\x74\x74\x69\x6e\x67", "\x62\x6f\x74\x73\x65\x74\x74\x69\x6e\x67", "\x61\x6c\x6c\x73\x65\x74\x74\x69\x6e\x67\x73"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x56\x69\x65\x77\x20\x61\x6c\x6c\x20\x62\x6f\x74\x20\x73\x65\x74\x74\x69\x6e\x67\x73",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    try {
      const _0xf31fcb = await getAllSettings();
      const _0x3fc3f6 = await getSudoNumbers();
      const _0x1f0b9b = await getEnabledGroupSettings();
      let _0xb040f9 = `╭━━━━━━━━━━━╮\n`;
      _0xb040f9 += `│   *⚙️ BOT SETTINGS*\n`;
      _0xb040f9 += `╰━━━━━━━━━━━╯\n\n`;
      const _0x61afb4 = Object.keys(_0xf31fcb).sort();
      for (const key of _0x61afb4) {
        const _0x279258 = _0xf31fcb[key] || "\x4e\x6f\x74\x20\x53\x65\x74";
        const _0x5793e5 = _0x279258.length > 0x28 ? _0x279258.substring(0, 0x28) + "..." : _0x279258;
        _0xb040f9 += `▸ *${key}:* ${_0x5793e5}\n`;
      }
      _0xb040f9 += `\n▸ *SUDO_USERS:* ${_0x3fc3f6.length > 0 ? _0x3fc3f6.join(", ") : "\x4e\x6f\x6e\x65"}\n`;
      _0xb040f9 += `\n╭━━━━━━━━━━━╮\n`;
      _0xb040f9 += `│   *📋 GROUP SETTINGS*\n`;
      _0xb040f9 += `╰━━━━━━━━━━━╯\n\n`;
      const [
        welcomeGroups,
        goodbyeGroups,
        eventsGroups,
        antilinkGroups,
        antibadGroups,
        antigroupmentionGroups,
      ] = await Promise.all([
        formatGroupsWithNames(_0x1f0b9b.WELCOME_MESSAGE, Gifted),
        formatGroupsWithNames(_0x1f0b9b.GOODBYE_MESSAGE, Gifted),
        formatGroupsWithNames(_0x1f0b9b.GROUP_EVENTS, Gifted),
        formatGroupsWithNames(_0x1f0b9b.ANTILINK, Gifted),
        formatGroupsWithNames(_0x1f0b9b.ANTIBAD, Gifted),
        formatGroupsWithNames(_0x1f0b9b.ANTIGROUPMENTION, Gifted),
      ]);
      _0xb040f9 += `*🎉 WELCOME MESSAGE:*\n${welcomeGroups}\n\n`;
      _0xb040f9 += `*👋 GOODBYE MESSAGE:*\n${goodbyeGroups}\n\n`;
      _0xb040f9 += `*📢 GROUP EVENTS:*\n${eventsGroups}\n\n`;
      _0xb040f9 += `*🔗 ANTILINK:*\n${antilinkGroups}\n\n`;
      _0xb040f9 += `*🚫 ANTIBAD:*\n${antibadGroups}\n\n`;
      _0xb040f9 += `*🛡️ ANTI-GROUP-MENTION:*\n${antigroupmentionGroups}\n`;
      await reply(_0xb040f9);
      await react("✅");
    } catch (error) {
      console.error("\x73\x65\x74\x74\x69\x6e\x67\x73\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x70\x72\x65\x66\x69\x78",
    aliases: ["\x70\x72\x65\x66\x69\x78", "\x62\x6f\x74\x70\x72\x65\x66\x69\x78", "\x63\x68\x61\x6e\x67\x65\x70\x72\x65\x66\x69\x78"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x70\x72\x65\x66\x69\x78",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x70\x72\x65\x66\x69\x78\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x2e\x73\x65\x74\x70\x72\x65\x66\x69\x78\x20\x21");
    try {
      const _0x503e31 = await getSetting("\x50\x52\x45\x46\x49\x58");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Prefix is already set to: *${q.trim()}*`);
      }
      await setSetting("\x50\x52\x45\x46\x49\x58", q.trim());
      await react("✅");
      await reply(`✅ Prefix set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x62\x6f\x74\x6e\x61\x6d\x65",
    aliases: ["\x62\x6f\x74\x6e\x61\x6d\x65", "\x6e\x61\x6d\x65\x62\x6f\x74", "\x63\x68\x61\x6e\x67\x65\x6e\x61\x6d\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x6e\x61\x6d\x65",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x62\x6f\x74\x20\x6e\x61\x6d\x65\x21");
    try {
      const _0x503e31 = await getSetting("\x42\x4f\x54\x5f\x4e\x41\x4d\x45");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Bot _0xa1c1bf is already set to: *${q.trim()}*`);
      }
      await setSetting("\x42\x4f\x54\x5f\x4e\x41\x4d\x45", q.trim());
      await react("✅");
      await reply(`✅ Bot _0xa1c1bf set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x6f\x77\x6e\x65\x72\x6e\x61\x6d\x65",
    aliases: ["\x6f\x77\x6e\x65\x72\x6e\x61\x6d\x65", "\x6d\x79\x6e\x61\x6d\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x6f\x77\x6e\x65\x72\x20\x6e\x61\x6d\x65",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x6e\x20\x6f\x77\x6e\x65\x72\x20\x6e\x61\x6d\x65\x21");
    try {
      const _0x503e31 = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x4e\x41\x4d\x45");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Owner _0xa1c1bf is already set to: *${q.trim()}*`);
      }
      await setSetting("\x4f\x57\x4e\x45\x52\x5f\x4e\x41\x4d\x45", q.trim());
      await react("✅");
      await reply(`✅ Owner _0xa1c1bf set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x6f\x77\x6e\x65\x72\x6e\x75\x6d\x62\x65\x72",
    aliases: ["\x6f\x77\x6e\x65\x72\x6e\x75\x6d\x62\x65\x72", "\x6f\x77\x6e\x65\x72\x6e\x75\x6d", "\x6d\x79\x6e\x75\x6d\x62\x65\x72"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x6f\x77\x6e\x65\x72\x20\x6e\x75\x6d\x62\x65\x72",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x6e\x20\x6f\x77\x6e\x65\x72\x20\x6e\x75\x6d\x62\x65\x72\x21");
    try {
      const _0xb2bdd4 = q.replace(/\D/g, "");
      const _0x503e31 = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x4e\x55\x4d\x42\x45\x52");
      if (_0x503e31 === _0xb2bdd4) {
        return reply(`⚠️ Owner number is already set to: *${_0xb2bdd4}*`);
      }
      await setSetting("\x4f\x57\x4e\x45\x52\x5f\x4e\x55\x4d\x42\x45\x52", _0xb2bdd4);
      await react("✅");
      await reply(`✅ Owner number set to: *${_0xb2bdd4}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x66\x6f\x6f\x74\x65\x72",
    aliases: ["\x66\x6f\x6f\x74\x65\x72", "\x62\x6f\x74\x66\x6f\x6f\x74\x65\x72"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x66\x6f\x6f\x74\x65\x72",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x66\x6f\x6f\x74\x65\x72\x20\x74\x65\x78\x74\x21");
    try {
      const _0x503e31 = await getSetting("\x46\x4f\x4f\x54\x45\x52");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Footer is already set to: *${q.trim()}*`);
      }
      await setSetting("\x46\x4f\x4f\x54\x45\x52", q.trim());
      await react("✅");
      await reply(`✅ Footer set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x63\x61\x70\x74\x69\x6f\x6e",
    aliases: ["\x63\x61\x70\x74\x69\x6f\x6e", "\x62\x6f\x74\x63\x61\x70\x74\x69\x6f\x6e"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x63\x61\x70\x74\x69\x6f\x6e",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x63\x61\x70\x74\x69\x6f\x6e\x21");
    try {
      const _0x503e31 = await getSetting("\x43\x41\x50\x54\x49\x4f\x4e");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Caption is already set to: *${q.trim()}*`);
      }
      await setSetting("\x43\x41\x50\x54\x49\x4f\x4e", q.trim());
      await react("✅");
      await reply(`✅ Caption set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x62\x6f\x74\x70\x69\x63",
    aliases: ["\x62\x6f\x74\x70\x69\x63", "\x62\x6f\x74\x69\x6d\x61\x67\x65", "\x73\x65\x74\x62\x6f\x74\x69\x6d\x61\x67\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x70\x69\x63\x74\x75\x72\x65\x20\x55\x52\x4c",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q) return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x6e\x20\x69\x6d\x61\x67\x65\x20\x55\x52\x4c\x21");
    try {
      const _0x503e31 = await getSetting("\x42\x4f\x54\x5f\x50\x49\x43");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Bot picture URL is already set to this _0x09195e!`);
      }
      await setSetting("\x42\x4f\x54\x5f\x50\x49\x43", q.trim());
      await react("✅");
      await reply(`✅ Bot picture URL updated!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x6d\x6f\x64\x65",
    aliases: ["\x6d\x6f\x64\x65", "\x62\x6f\x74\x6d\x6f\x64\x65", "\x63\x68\x61\x6e\x67\x65\x6d\x6f\x64\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x6d\x6f\x64\x65\x20\x28\x70\x75\x62\x6c\x69\x63\x2f\x70\x72\x69\x76\x61\x74\x65\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x3b9c64 = q?.toLowerCase();
    if (!_0x3b9c64 || !["\x70\x75\x62\x6c\x69\x63", "\x70\x72\x69\x76\x61\x74\x65"].includes(_0x3b9c64)) {
      return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x73\x70\x65\x63\x69\x66\x79\x3a\x20\x70\x75\x62\x6c\x69\x63\x20\x6f\x72\x20\x70\x72\x69\x76\x61\x74\x65");
    }
    try {
      const _0x503e31 = await getSetting("\x4d\x4f\x44\x45");
      if (_0x503e31 === _0x3b9c64) {
        return reply(`⚠️ Bot _0x3b9c64 is already set to: *${_0x3b9c64}*`);
      }
      await setSetting("\x4d\x4f\x44\x45", _0x3b9c64);
      await react("✅");
      await reply(`✅ Bot _0x3b9c64 set to: *${_0x3b9c64}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x74\x69\x6d\x65\x7a\x6f\x6e\x65",
    aliases: ["\x74\x69\x6d\x65\x7a\x6f\x6e\x65", "tz", "\x73\x65\x74\x74\x7a"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x74\x69\x6d\x65\x7a\x6f\x6e\x65",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q)
      return reply(
        "❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x74\x69\x6d\x65\x7a\x6f\x6e\x65\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x2e\x73\x65\x74\x74\x69\x6d\x65\x7a\x6f\x6e\x65\x20\x41\x66\x72\x69\x63\x61\x2f\x4e\x61\x69\x72\x6f\x62\x69",
      );
    try {
      const _0x503e31 = await getSetting("\x54\x49\x4d\x45\x5f\x5a\x4f\x4e\x45");
      if (_0x503e31 === q.trim()) {
        return reply(`⚠️ Timezone is already set to: *${q.trim()}*`);
      }
      await setSetting("\x54\x49\x4d\x45\x5f\x5a\x4f\x4e\x45", q.trim());
      await react("✅");
      await reply(`✅ Timezone set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x64\x6d\x70\x72\x65\x73\x65\x6e\x63\x65",
    aliases: ["\x64\x6d\x70\x72\x65\x73\x65\x6e\x63\x65", "\x63\x68\x61\x74\x70\x72\x65\x73\x65\x6e\x63\x65", "\x69\x6e\x62\x6f\x78\x70\x72\x65\x73\x65\x6e\x63\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x44\x4d\x20\x70\x72\x65\x73\x65\x6e\x63\x65\x20\x28\x6f\x6e\x6c\x69\x6e\x65\x2f\x6f\x66\x66\x6c\x69\x6e\x65\x2f\x74\x79\x70\x69\x6e\x67\x2f\x72\x65\x63\x6f\x72\x64\x69\x6e\x67\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x6f\x6e\x6c\x69\x6e\x65", "\x6f\x66\x66\x6c\x69\x6e\x65", "\x74\x79\x70\x69\x6e\x67", "\x72\x65\x63\x6f\x72\x64\x69\x6e\x67"];
    if (!q || !_0x1efddf.includes(q.toLowerCase())) {
      return reply(`❌ Please specify: ${_0x1efddf.join(", ")}`);
    }
    try {
      const _0x503e31 = await getSetting("\x44\x4d\x5f\x50\x52\x45\x53\x45\x4e\x43\x45");
      if (_0x503e31 === q.toLowerCase()) {
        return reply(`⚠️ DM presence is already set to: *${q.toLowerCase()}*`);
      }
      await setSetting("\x44\x4d\x5f\x50\x52\x45\x53\x45\x4e\x43\x45", q.toLowerCase());
      await react("✅");
      await reply(`✅ DM presence set to: *${q.toLowerCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x67\x63\x70\x72\x65\x73\x65\x6e\x63\x65",
    aliases: ["\x67\x63\x70\x72\x65\x73\x65\x6e\x63\x65", "\x67\x72\x6f\x75\x70\x70\x72\x65\x73\x65\x6e\x63\x65", "\x67\x72\x70\x70\x72\x65\x73\x65\x6e\x63\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x67\x72\x6f\x75\x70\x20\x70\x72\x65\x73\x65\x6e\x63\x65\x20\x28\x6f\x6e\x6c\x69\x6e\x65\x2f\x6f\x66\x66\x6c\x69\x6e\x65\x2f\x74\x79\x70\x69\x6e\x67\x2f\x72\x65\x63\x6f\x72\x64\x69\x6e\x67\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x6f\x6e\x6c\x69\x6e\x65", "\x6f\x66\x66\x6c\x69\x6e\x65", "\x74\x79\x70\x69\x6e\x67", "\x72\x65\x63\x6f\x72\x64\x69\x6e\x67"];
    if (!q || !_0x1efddf.includes(q.toLowerCase())) {
      return reply(`❌ Please specify: ${_0x1efddf.join(", ")}`);
    }
    try {
      const _0x503e31 = await getSetting("\x47\x43\x5f\x50\x52\x45\x53\x45\x4e\x43\x45");
      if (_0x503e31 === q.toLowerCase()) {
        return reply(
          `⚠️ Group presence is already set to: *${q.toLowerCase()}*`,
        );
      }
      await setSetting("\x47\x43\x5f\x50\x52\x45\x53\x45\x4e\x43\x45", q.toLowerCase());
      await react("✅");
      await reply(`✅ Group presence set to: *${q.toLowerCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x63\x68\x61\x74\x62\x6f\x74",
    aliases: ["\x63\x68\x61\x74\x62\x6f\x74", "ai", "\x73\x65\x74\x61\x69"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x63\x68\x61\x74\x62\x6f\x74\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x2f\x61\x75\x64\x69\x6f\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65", "\x61\x75\x64\x69\x6f"];
    const _0x09195e = parseBooleanInput(q);
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(`❌ Please specify: on, off, or audio`);
    }
    try {
      const _0x503e31 = await getSetting("\x43\x48\x41\x54\x42\x4f\x54");
      if (_0x503e31 === _0x09195e) {
        const _0x852c46 =
          _0x09195e === "\x74\x72\x75\x65" ? "ON" : _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e;
        return reply(`⚠️ Chatbot is already set to: *${_0x852c46}*`);
      }
      await setSetting("\x43\x48\x41\x54\x42\x4f\x54", _0x09195e);
      await react("✅");
      await reply(
        `✅ Chatbot set to: *${_0x09195e === "\x74\x72\x75\x65" ? "ON" : _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x63\x68\x61\x74\x62\x6f\x74\x6d\x6f\x64\x65",
    aliases: ["\x63\x68\x61\x74\x62\x6f\x74\x6d\x6f\x64\x65", "\x61\x69\x6d\x6f\x64\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x63\x68\x61\x74\x62\x6f\x74\x20\x6d\x6f\x64\x65\x20\x28\x69\x6e\x62\x6f\x78\x2f\x67\x72\x6f\x75\x70\x73\x2f\x61\x6c\x6c\x63\x68\x61\x74\x73\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x69\x6e\x62\x6f\x78", "\x67\x72\x6f\x75\x70\x73", "\x61\x6c\x6c\x63\x68\x61\x74\x73"];
    if (!q || !_0x1efddf.includes(q.toLowerCase())) {
      return reply(`❌ Please specify: ${_0x1efddf.join(", ")}`);
    }
    try {
      const _0x503e31 = await getSetting("\x43\x48\x41\x54\x42\x4f\x54\x5f\x4d\x4f\x44\x45");
      if (_0x503e31 === q.toLowerCase()) {
        return reply(`⚠️ Chatbot _0x3b9c64 is already set to: *${q.toLowerCase()}*`);
      }
      await setSetting("\x43\x48\x41\x54\x42\x4f\x54\x5f\x4d\x4f\x44\x45", q.toLowerCase());
      await react("✅");
      await reply(`✅ Chatbot _0x3b9c64 set to: *${q.toLowerCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x73\x74\x61\x72\x74\x6d\x73\x67",
    aliases: ["\x73\x74\x61\x72\x74\x6d\x73\x67", "\x73\x74\x61\x72\x74\x69\x6e\x67\x6d\x65\x73\x73\x61\x67\x65", "\x73\x74\x61\x72\x74\x6d\x65\x73\x73\x61\x67\x65"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x73\x74\x61\x72\x74\x69\x6e\x67\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x09195e = parseBooleanInput(q);
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x503e31 = await getSetting("\x53\x54\x41\x52\x54\x49\x4e\x47\x5f\x4d\x45\x53\x53\x41\x47\x45");
      if (_0x503e31 === _0x09195e) {
        return reply(
          `⚠️ Starting message is already: *${formatBoolDisplay(_0x09195e)}*`,
        );
      }
      await setSetting("\x53\x54\x41\x52\x54\x49\x4e\x47\x5f\x4d\x45\x53\x53\x41\x47\x45", _0x09195e);
      await react("✅");
      await reply(`✅ Starting message set to: *${formatBoolDisplay(_0x09195e)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65",
    aliases: ["\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65", "\x61\x6e\x74\x69\x64\x65\x6c"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65\x20\x28\x69\x6e\x63\x68\x61\x74\x2f\x69\x6e\x64\x6d\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x69\x6e\x63\x68\x61\x74", "\x69\x6e\x64\x6d", "\x66\x61\x6c\x73\x65"];
    const _0x09195e = parseBooleanInput(q);
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(`❌ Please specify: inchat, indm or off`);
    }
    try {
      const _0x503e31 = await getSetting("\x41\x4e\x54\x49\x44\x45\x4c\x45\x54\x45");
      if (_0x503e31 === _0x09195e) {
        const _0x5793e5 = _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e.toUpperCase();
        return reply(`⚠️ Antidelete is already set to: *${_0x5793e5}*`);
      }
      await setSetting("\x41\x4e\x54\x49\x44\x45\x4c\x45\x54\x45", _0x09195e);
      await react("✅");
      const _0x5793e5 = _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e.toUpperCase();
      await reply(`✅ Antidelete set to: *${_0x5793e5}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x6e\x74\x69\x65\x64\x69\x74",
    aliases: ["\x61\x6e\x74\x69\x65\x64\x69\x74"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x2d\x65\x64\x69\x74\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x2f\x69\x6e\x64\x6d\x2f\x69\x6e\x63\x68\x61\x74\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["on", "\x6f\x66\x66", "\x69\x6e\x64\x6d", "\x69\x6e\x63\x68\x61\x74"];
    const _0x09195e = (q || "").trim().toLowerCase();
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(
        `❌ Please specify: *on*, *off*, *indm* (DM only), or *inchat* (in chat only)\n\n` +
        `*Current _0x1efddf values:*\n` +
        `• *indm* - Alert in owner DM only (default)\n` +
        `• *inchat* - Alert in same chat only\n` +
        `• *on* - Alert in both DM and chat\n` +
        `• *off* - Disable anti-edit`,
      );
    }
    try {
      const _0x503e31 = await getSetting("\x41\x4e\x54\x49\x5f\x45\x44\x49\x54");
      if (_0x503e31 === _0x09195e) {
        return reply(`⚠️ Anti-edit is already set to: *${_0x09195e}*`);
      }
      await setSetting("\x41\x4e\x54\x49\x5f\x45\x44\x49\x54", _0x09195e);
      await react("✅");
      await reply(`✅ Anti-edit set to: *${_0x09195e}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x77\x65\x6c\x63\x6f\x6d\x65",
    aliases: ["\x77\x65\x6c\x63\x6f\x6d\x65", "\x77\x65\x6c\x63\x6f\x6d\x65\x6d\x73\x67"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x77\x65\x6c\x63\x6f\x6d\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x09195e = parseBooleanInput(q);
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x503e31 = await getGroupSetting(from, "\x57\x45\x4c\x43\x4f\x4d\x45\x5f\x4d\x45\x53\x53\x41\x47\x45");
      if (_0x503e31 === _0x09195e) {
        return reply(
          `⚠️ Welcome message for this group is already: *${formatBoolDisplay(_0x09195e)}*`,
        );
      }
      await setGroupSetting(from, "\x57\x45\x4c\x43\x4f\x4d\x45\x5f\x4d\x45\x53\x53\x41\x47\x45", _0x09195e);
      await react("✅");
      await reply(
        `✅ Welcome message for this group: *${formatBoolDisplay(_0x09195e)}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x67\x6f\x6f\x64\x62\x79\x65",
    aliases: ["\x67\x6f\x6f\x64\x62\x79\x65", "\x67\x6f\x6f\x64\x62\x79\x65\x6d\x73\x67", "\x62\x79\x65"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x67\x6f\x6f\x64\x62\x79\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x74\x72\x75\x65", "\x66\x61\x6c\x73\x65"];
    const _0x09195e = parseBooleanInput(q);
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const _0x503e31 = await getGroupSetting(from, "\x47\x4f\x4f\x44\x42\x59\x45\x5f\x4d\x45\x53\x53\x41\x47\x45");
      if (_0x503e31 === _0x09195e) {
        return reply(
          `⚠️ Goodbye message for this group is already: *${formatBoolDisplay(_0x09195e)}*`,
        );
      }
      await setGroupSetting(from, "\x47\x4f\x4f\x44\x42\x59\x45\x5f\x4d\x45\x53\x53\x41\x47\x45", _0x09195e);
      await react("✅");
      await reply(
        `✅ Goodbye message for this group: *${formatBoolDisplay(_0x09195e)}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x77\x65\x6c\x63\x6f\x6d\x65\x6d\x65\x73\x73\x61\x67\x65",
    aliases: ["\x73\x65\x74\x77\x65\x6c\x63\x6f\x6d\x65\x6d\x73\x67", "\x77\x65\x6c\x63\x6f\x6d\x65\x6d\x73\x67", "\x73\x65\x74\x77\x65\x6c\x63\x6f\x6d\x65\x74\x65\x78\x74"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x63\x75\x73\x74\x6f\x6d\x20\x77\x65\x6c\x63\x6f\x6d\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q || !q.trim()) {
      const _0x503e31 = await getGroupSetting(from, "\x57\x45\x4c\x43\x4f\x4d\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54");
      if (_0x503e31 && _0x503e31.trim()) {
        return reply(
          `📝 Current welcome message:\n\n${_0x503e31}\n\nTo change: .welcomemessage Your new message here\nTo clear: .welcomemessage clear`,
        );
      }
      return reply(
        `❌ Please provide a welcome message.\nExample: .welcomemessage Thank you for joining! Please follow the rules.`,
      );
    }
    try {
      if (q.toLowerCase().trim() === "\x63\x6c\x65\x61\x72") {
        await setGroupSetting(from, "\x57\x45\x4c\x43\x4f\x4d\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54", "");
        await react("✅");
        return reply(
          "✅\x20\x43\x75\x73\x74\x6f\x6d\x20\x77\x65\x6c\x63\x6f\x6d\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x63\x6c\x65\x61\x72\x65\x64\x2e\x20\x44\x65\x66\x61\x75\x6c\x74\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x77\x69\x6c\x6c\x20\x62\x65\x20\x75\x73\x65\x64\x2e",
        );
      }
      const _0x9139af = await getGroupSetting(from, "\x57\x45\x4c\x43\x4f\x4d\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54");
      if (_0x9139af && _0x9139af.trim() === q.trim()) {
        return reply(`⚠️ Welcome message is already set to that text!`);
      }
      await setGroupSetting(from, "\x57\x45\x4c\x43\x4f\x4d\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54", q.trim());
      await react("✅");
      await reply(`✅ Welcome message set:\n\n${q.trim()}`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x67\x6f\x6f\x64\x62\x79\x65\x6d\x65\x73\x73\x61\x67\x65",
    aliases: ["\x73\x65\x74\x67\x6f\x6f\x64\x62\x79\x65\x6d\x73\x67", "\x67\x6f\x6f\x64\x62\x79\x65\x6d\x73\x67", "\x73\x65\x74\x67\x6f\x6f\x64\x62\x79\x65\x74\x65\x78\x74", "\x62\x79\x65\x6d\x73\x67"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x63\x75\x73\x74\x6f\x6d\x20\x67\x6f\x6f\x64\x62\x79\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    if (!q || !q.trim()) {
      const _0x503e31 = await getGroupSetting(from, "\x47\x4f\x4f\x44\x42\x59\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54");
      if (_0x503e31 && _0x503e31.trim()) {
        return reply(
          `📝 Current goodbye message:\n\n${_0x503e31}\n\nTo change: .goodbyemessage Your new message here\nTo clear: .goodbyemessage clear`,
        );
      }
      return reply(
        `❌ Please provide a goodbye message.\nExample: .goodbyemessage Thank you for staying with us. Take care!`,
      );
    }
    try {
      if (q.toLowerCase().trim() === "\x63\x6c\x65\x61\x72") {
        await setGroupSetting(from, "\x47\x4f\x4f\x44\x42\x59\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54", "");
        await react("✅");
        return reply(
          "✅\x20\x43\x75\x73\x74\x6f\x6d\x20\x67\x6f\x6f\x64\x62\x79\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x63\x6c\x65\x61\x72\x65\x64\x2e\x20\x44\x65\x66\x61\x75\x6c\x74\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x77\x69\x6c\x6c\x20\x62\x65\x20\x75\x73\x65\x64\x2e",
        );
      }
      const _0x548141 = await getGroupSetting(from, "\x47\x4f\x4f\x44\x42\x59\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54");
      if (_0x548141 && _0x548141.trim() === q.trim()) {
        return reply(`⚠️ Goodbye message is already set to that text!`);
      }
      await setGroupSetting(from, "\x47\x4f\x4f\x44\x42\x59\x45\x5f\x4d\x45\x53\x53\x41\x47\x45\x5f\x54\x45\x58\x54", q.trim());
      await react("✅");
      await reply(`✅ Goodbye message set:\n\n${q.trim()}`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x6e\x74\x69\x63\x61\x6c\x6c",
    aliases: ["\x61\x6e\x74\x69\x63\x61\x6c\x6c", "\x62\x6c\x6f\x63\x6b\x63\x61\x6c\x6c"],
    react: "⚙️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x63\x61\x6c\x6c\x20\x28\x6f\x6e\x2f\x6f\x66\x66\x2f\x62\x6c\x6f\x63\x6b\x2f\x64\x65\x63\x6c\x69\x6e\x65\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x1efddf = ["\x74\x72\x75\x65", "\x62\x6c\x6f\x63\x6b", "\x66\x61\x6c\x73\x65", "\x64\x65\x63\x6c\x69\x6e\x65"];
    const _0x09195e = parseBooleanInput(q);
    if (!_0x09195e || !_0x1efddf.includes(_0x09195e)) {
      return reply(`❌ Please specify: on, off, block or decline`);
    }
    try {
      const _0x503e31 = await getSetting("\x41\x4e\x54\x49\x43\x41\x4c\x4c");
      if (_0x503e31 === _0x09195e) {
        const _0x5793e5 =
          _0x09195e === "\x74\x72\x75\x65"
            ? "ON"
            : _0x09195e === "\x66\x61\x6c\x73\x65"
              ? "\x4f\x46\x46"
              : _0x09195e.toUpperCase();
        return reply(`⚠️ Anticall is already set to: *${_0x5793e5}*`);
      }
      await setSetting("\x41\x4e\x54\x49\x43\x41\x4c\x4c", _0x09195e);
      await react("✅");
      const _0x5793e5 =
        _0x09195e === "\x74\x72\x75\x65"
          ? "ON"
          : _0x09195e === "\x66\x61\x6c\x73\x65"
            ? "\x4f\x46\x46"
            : _0x09195e.toUpperCase();
      await reply(`✅ Anticall set to: *${_0x5793e5}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x6e\x74\x69\x6c\x69\x6e\x6b",
    aliases: ["\x61\x6e\x74\x69\x6c\x69\x6e\x6b"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x6c\x69\x6e\x6b\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x20\x28\x6f\x6e\x2f\x77\x61\x72\x6e\x2f\x64\x65\x6c\x65\x74\x65\x2f\x6b\x69\x63\x6b\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0xa1c488 = (q || "").toLowerCase().trim();
    const _0xa55aae = {
      on: "\x64\x65\x6c\x65\x74\x65",
      off: "\x66\x61\x6c\x73\x65",
      true: "\x64\x65\x6c\x65\x74\x65",
      false: "\x66\x61\x6c\x73\x65",
      delete: "\x64\x65\x6c\x65\x74\x65",
      kick: "\x6b\x69\x63\x6b",
      warn: "\x77\x61\x72\x6e",
    };
    const _0x09195e = _0xa55aae[_0xa1c488];
    if (!_0x09195e) {
      const _0x91aec9 = await getGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54");
      return reply(`❌ Please specify a _0x3b9c64:
• *on/delete* - Delete links (no kick)
• *warn* - Warn user, kick after ${_0x91aec9} warnings
• *kick* - Delete link & immediately kick user
• *off* - Disable antilink`);
    }
    try {
      const _0x503e31 = await getGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b");
      if (_0x503e31 === _0x09195e) {
        const _0x5793e5 = _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e.toUpperCase();
        return reply(`⚠️ Antilink is already: *${_0x5793e5}*`);
      }
      await setGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b", _0x09195e);
      await react("✅");
      const _0x5793e5 = _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e.toUpperCase();
      let _0xb040f9 = `✅ Antilink: *${_0x5793e5}*`;
      if (_0x09195e === "\x77\x61\x72\x6e") {
        const _0x91aec9 = await getGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54");
        _0xb040f9 += `\nKick after *${_0x91aec9}* warnings`;
      }
      await reply(_0xb040f9);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x61\x6e\x74\x69\x6c\x69\x6e\x6b\x77\x61\x72\x6e",
    aliases: ["\x73\x65\x74\x77\x61\x72\x6e\x63\x6f\x75\x6e\x74", "\x77\x61\x72\x6e\x63\x6f\x75\x6e\x74", "\x61\x6e\x74\x69\x6c\x69\x6e\x6b\x77\x61\x72\x6e\x63\x6f\x75\x6e\x74", "\x77\x61\x72\x6e\x6c\x69\x6d\x69\x74"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x6c\x69\x6e\x6b\x20\x77\x61\x72\x6e\x69\x6e\x67\x20\x63\x6f\x75\x6e\x74\x20\x62\x65\x66\x6f\x72\x65\x20\x6b\x69\x63\x6b\x20\x28\x64\x65\x66\x61\x75\x6c\x74\x20\x35\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x899464 = parseInt(q);
    if (!q) {
      const _0x503e31 =
        (await getGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54")) || "5";
      return reply(
        `⚠️ Current warn _0x899464 for this group: *${_0x503e31}*\nUsage: .antilinkwarn 3`,
      );
    }
    if (isNaN(_0x899464) || _0x899464 < 1 || _0x899464 > 0xA) {
      return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x6e\x75\x6d\x62\x65\x72\x20\x62\x65\x74\x77\x65\x65\x6e\x20\x31\x2d\x31\x30");
    }
    try {
      const _0xa4aa41 = (await getGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54")) || "5";
      if (_0xa4aa41 === _0x899464.toString()) {
        return reply(`⚠️ Antilink warn _0x899464 is already set to: *${_0x899464}*`);
      }
      await setGroupSetting(from, "\x41\x4e\x54\x49\x4c\x49\x4e\x4b\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54", _0x899464.toString());
      await react("✅");
      await reply(
        `✅ Antilink warn _0x899464 set to: *${_0x899464}* for this group.\nUsers will be kicked after ${_0x899464} warnings.`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x61\x6e\x74\x69\x62\x61\x64",
    aliases: ["\x61\x6e\x74\x69\x62\x61\x64", "\x61\x6e\x74\x69\x62\x61\x64\x77\x6f\x72\x64\x73", "\x62\x61\x64\x77\x6f\x72\x64\x66\x69\x6c\x74\x65\x72"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x2d\x62\x61\x64\x77\x6f\x72\x64\x73\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x20\x28\x6f\x6e\x2f\x77\x61\x72\x6e\x2f\x64\x65\x6c\x65\x74\x65\x2f\x6b\x69\x63\x6b\x2f\x6f\x66\x66\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0xa1c488 = (q || "").toLowerCase().trim();
    const _0xa55aae = {
      on: "\x64\x65\x6c\x65\x74\x65",
      off: "\x66\x61\x6c\x73\x65",
      true: "\x64\x65\x6c\x65\x74\x65",
      false: "\x66\x61\x6c\x73\x65",
      delete: "\x64\x65\x6c\x65\x74\x65",
      kick: "\x6b\x69\x63\x6b",
      warn: "\x77\x61\x72\x6e",
    };
    const _0x09195e = _0xa55aae[_0xa1c488];
    if (!_0x09195e) {
      const _0x91aec9 = await getGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54");
      const { getBadWords } = require("../guru/database/groupSettings");
      const _0x3b3aec = await getBadWords(from);
      return reply(`❌ Please specify a _0x3b9c64:
• *on/delete* - Delete bad word messages
• *warn* - Warn user, kick after ${_0x91aec9} warnings
• *kick* - Delete & immediately kick user
• *off* - Disable anti-badwords
Current bad _0x3de6e5 (${_0x3b3aec.length}): ${_0x3b3aec.length > 0 ? _0x3b3aec.slice(0, 0xA).join(", ") + (_0x3b3aec.length > 0xA ? "..." : "") : "\x4e\x6f\x6e\x65\x20\x73\x65\x74"}`);
    }
    try {
      const _0x503e31 = await getGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44");
      if (_0x503e31 === _0x09195e) {
        const _0x5793e5 = _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e.toUpperCase();
        return reply(`⚠️ Anti-badwords is already: *${_0x5793e5}*`);
      }
      await setGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44", _0x09195e);
      await react("✅");
      const _0x5793e5 = _0x09195e === "\x66\x61\x6c\x73\x65" ? "\x4f\x46\x46" : _0x09195e.toUpperCase();
      let _0xb040f9 = `✅ Anti-BadWords: *${_0x5793e5}*`;
      if (_0x09195e === "\x77\x61\x72\x6e") {
        const _0x91aec9 = await getGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54");
        _0xb040f9 += `\nKick after *${_0x91aec9}* warnings`;
      }
      if (_0x09195e !== "\x66\x61\x6c\x73\x65") {
        _0xb040f9 += `\n\nUse *.badwords add <word>* to add prohibited words`;
      }
      await reply(_0xb040f9);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x61\x6e\x74\x69\x62\x61\x64\x77\x61\x72\x6e",
    aliases: ["\x62\x61\x64\x77\x61\x72\x6e\x63\x6f\x75\x6e\x74", "\x61\x6e\x74\x69\x62\x61\x64\x77\x61\x72\x6e\x63\x6f\x75\x6e\x74", "\x73\x65\x74\x62\x61\x64\x77\x61\x72\x6e"],
    react: "⚙️",
    category: "\x67\x72\x6f\x75\x70",
    description: "\x53\x65\x74\x20\x61\x6e\x74\x69\x2d\x62\x61\x64\x77\x6f\x72\x64\x73\x20\x77\x61\x72\x6e\x69\x6e\x67\x20\x63\x6f\x75\x6e\x74\x20\x62\x65\x66\x6f\x72\x65\x20\x6b\x69\x63\x6b\x20\x28\x64\x65\x66\x61\x75\x6c\x74\x20\x35\x29",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const _0x899464 = parseInt(q);
    if (!q) {
      const _0x503e31 =
        (await getGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54")) || "5";
      return reply(
        `⚠️ Current bad word warn _0x899464: *${_0x503e31}*\nUsage: .antibadwarn 3`,
      );
    }
    if (isNaN(_0x899464) || _0x899464 < 1 || _0x899464 > 0xA) {
      return reply("❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x6e\x75\x6d\x62\x65\x72\x20\x62\x65\x74\x77\x65\x65\x6e\x20\x31\x2d\x31\x30");
    }
    try {
      const _0xb70e6e = (await getGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54")) || "5";
      if (_0xb70e6e === _0x899464.toString()) {
        return reply(`⚠️ Anti-badwords warn _0x899464 is already set to: *${_0x899464}*`);
      }
      await setGroupSetting(from, "\x41\x4e\x54\x49\x42\x41\x44\x5f\x57\x41\x52\x4e\x5f\x43\x4f\x55\x4e\x54", _0x899464.toString());
      await react("✅");
      await reply(
        `✅ Anti-badwords warn _0x899464 set to: *${_0x899464}*\nUsers will be kicked after ${_0x899464} warnings.`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x62\x61\x64\x77\x6f\x72\x64\x73",
    aliases: ["\x73\x65\x74\x62\x61\x64\x77\x6f\x72\x64\x73", "\x62\x61\x64\x77\x6f\x72\x64", "\x70\x72\x6f\x66\x61\x6e\x69\x74\x79"],
    react: "🚫",
    category: "\x67\x72\x6f\x75\x70",
    description:
      "\x4d\x61\x6e\x61\x67\x65\x20\x62\x61\x64\x20\x77\x6f\x72\x64\x73\x20\x6c\x69\x73\x74\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x62\x61\x64\x77\x6f\x72\x64\x73\x20\x61\x64\x64\x2f\x72\x65\x6d\x6f\x76\x65\x2f\x6c\x69\x73\x74\x2f\x63\x6c\x65\x61\x72\x2f\x64\x65\x66\x61\x75\x6c\x74",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin, args } = conText;
    if (!isGroup) return reply("❌\x20\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x6f\x6e\x6c\x79\x20\x77\x6f\x72\x6b\x73\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21");
    if (!isSuperUser && !isAdmin) return reply("❌\x20\x41\x64\x6d\x69\x6e\x2f\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    const {
      getBadWords,
      addBadWord,
      removeBadWord,
      clearBadWords,
      initializeDefaultBadWords,
      DEFAULT_BAD_WORDS,
    } = require("../guru/database/groupSettings");
    const _0x81c04e = (args[0] || "").toLowerCase();
    const _0x3de6e5 = args.slice(1);
    if (
      !_0x81c04e ||
      ![
        "\x61\x64\x64",
        "\x72\x65\x6d\x6f\x76\x65",
        "\x64\x65\x6c",
        "\x64\x65\x6c\x65\x74\x65",
        "\x6c\x69\x73\x74",
        "\x63\x6c\x65\x61\x72",
        "\x72\x65\x73\x65\x74",
        "\x64\x65\x66\x61\x75\x6c\x74",
        "\x64\x65\x66\x61\x75\x6c\x74\x73",
      ].includes(_0x81c04e)
    ) {
      const _0x3b3aec = await getBadWords(from);
      return reply(`📋 *Bad Words Management*
*Usage:*
• *.badwords add <word>* - Add a bad word
• *.badwords add <word1> <word2>* - Add multiple _0x3de6e5
• *.badwords remove <word>* - Remove a word
• *.badwords list* - Show all bad _0x3de6e5
• *.badwords clear* - Remove all bad _0x3de6e5
• *.badwords default* - Load default offensive _0x3de6e5 (${DEFAULT_BAD_WORDS.length})
*Current list (${_0x3b3aec.length}):*
${
  _0x3b3aec.length > 0
    ? _0x3b3aec
        .slice(0, 0xF)
        .map((w, i) => `${i + 1}. ${w}`)
        .join("\n") +
      (_0x3b3aec.length > 0xF ? `\n... and ${_0x3b3aec.length - 0xF} more` : "")
    : "\x5f\x4e\x6f\x20\x62\x61\x64\x20\x77\x6f\x72\x64\x73\x20\x73\x65\x74\x5f"
}`);
    }
    try {
      if (_0x81c04e === "\x61\x64\x64") {
        if (_0x3de6e5.length === 0) {
          return reply(
            "❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x77\x6f\x72\x64\x28\x73\x29\x20\x74\x6f\x20\x61\x64\x64\x21\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x62\x61\x64\x77\x6f\x72\x64\x73\x20\x61\x64\x64\x20\x77\x6f\x72\x64\x31\x20\x77\x6f\x72\x64\x32",
          );
        }
        let _0xa7cb8c = 0;
        for (const word of _0x3de6e5) {
          if (word.length >= 2) {
            await addBadWord(from, word);
            _0xa7cb8c++;
          }
        }
        await react("✅");
        await reply(`✅ Added *${_0xa7cb8c}* bad word(s) to the filter.`);
      } else if (["\x72\x65\x6d\x6f\x76\x65", "\x64\x65\x6c", "\x64\x65\x6c\x65\x74\x65"].includes(_0x81c04e)) {
        if (_0x3de6e5.length === 0) {
          return reply(
            "❌\x20\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x77\x6f\x72\x64\x28\x73\x29\x20\x74\x6f\x20\x72\x65\x6d\x6f\x76\x65\x21\x5c\x6e\x55\x73\x61\x67\x65\x3a\x20\x2e\x62\x61\x64\x77\x6f\x72\x64\x73\x20\x72\x65\x6d\x6f\x76\x65\x20\x77\x6f\x72\x64\x31",
          );
        }
        let _0x1d4e81 = 0;
        for (const word of _0x3de6e5) {
          const _0x07cfd1 = await removeBadWord(from, word);
          if (_0x07cfd1) _0x1d4e81++;
        }
        await react("✅");
        await reply(`✅ Removed *${_0x1d4e81}* word(s) from the filter.`);
      } else if (_0x81c04e === "\x6c\x69\x73\x74") {
        const _0x3b3aec = await getBadWords(from);
        if (_0x3b3aec.length === 0) {
          return reply(
            "📭\x20\x4e\x6f\x20\x62\x61\x64\x20\x77\x6f\x72\x64\x73\x20\x73\x65\x74\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x2e\x5c\x6e\x55\x73\x65\x20\x2a\x2e\x62\x61\x64\x77\x6f\x72\x64\x73\x20\x61\x64\x64\x20\x3c\x77\x6f\x72\x64\x3e\x2a\x20\x74\x6f\x20\x61\x64\x64\x20\x77\x6f\x72\x64\x73\x2e",
          );
        }
        const _0xb721f2 = [];
        for (let i = 0; i < _0x3b3aec.length; i += 0x14) {
          _0xb721f2.push(_0x3b3aec.slice(i, i + 0x14));
        }
        for (let i = 0; i < _0xb721f2.length; i++) {
          const _0xa28909 = _0xb721f2[i];
          const _0x80ed95 = i * 0x14;
          let _0xb040f9 =
            i === 0
              ? `🚫 *BAD WORDS LIST* (${_0x3b3aec.length} _0x32d0ae)\n\n`
              : `🚫 *BAD WORDS* (continued)\n\n`;
          _0xb040f9 += _0xa28909
            .map((w, idx) => `${_0x80ed95 + idx + 1}. ${w}`)
            .join("\n");
          await Gifted.sendMessage(from, { text: _0xb040f9 });
        }
        await react("✅");
      } else if (["\x63\x6c\x65\x61\x72", "\x72\x65\x73\x65\x74"].includes(_0x81c04e)) {
        await clearBadWords(from);
        await react("✅");
        await reply("✅\x20\x41\x6c\x6c\x20\x62\x61\x64\x20\x77\x6f\x72\x64\x73\x20\x68\x61\x76\x65\x20\x62\x65\x65\x6e\x20\x63\x6c\x65\x61\x72\x65\x64\x20\x66\x6f\x72\x20\x74\x68\x69\x73\x20\x67\x72\x6f\x75\x70\x2e");
      } else if (["\x64\x65\x66\x61\x75\x6c\x74", "\x64\x65\x66\x61\x75\x6c\x74\x73"].includes(_0x81c04e)) {
        const _0xa7cb8c = await initializeDefaultBadWords(from);
        await react("✅");
        const _0x32d0ae = await getBadWords(from);
        await reply(
          `✅ Default bad _0x3de6e5 loaded!\n\n*Added:* ${_0xa7cb8c} new _0x3de6e5\n*Total:* ${_0x32d0ae.length} bad words`,
        );
      }
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x73\x65\x74\x65\x78\x70\x69\x72\x79",
    aliases: ["\x73\x65\x74\x62\x6f\x74\x65\x78\x70\x69\x72\x79", "\x65\x78\x70\x69\x72\x79\x73\x65\x74", "\x73\x65\x74\x65\x78\x70\x64\x61\x74\x65"],
    react: "📅",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x53\x65\x74\x20\x62\x6f\x74\x20\x65\x78\x70\x69\x72\x79\x20\x64\x61\x74\x65\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x73\x65\x74\x65\x78\x70\x69\x72\x79\x20\x32\x30\x32\x36\x2d\x31\x32\x2d\x33\x31",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    if (!q) return reply("❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x61\x6e\x20\x65\x78\x70\x69\x72\x79\x20\x64\x61\x74\x65\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x60\x2e\x73\x65\x74\x65\x78\x70\x69\x72\x79\x20\x32\x30\x32\x36\x2d\x31\x32\x2d\x33\x31\x60");
    const _0x15c3f3 = new Date(q.trim());
    if (isNaN(_0x15c3f3.getTime())) return reply("❌\x20\x49\x6e\x76\x61\x6c\x69\x64\x20\x64\x61\x74\x65\x20\x66\x6f\x72\x6d\x61\x74\x21\x20\x55\x73\x65\x3a\x20\x2a\x59\x59\x59\x59\x2d\x4d\x4d\x2d\x44\x44\x2a\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x60\x2e\x73\x65\x74\x65\x78\x70\x69\x72\x79\x20\x32\x30\x32\x36\x2d\x31\x32\x2d\x33\x31\x60");
    if (_0x15c3f3 <= new Date()) return reply("❌\x20\x45\x78\x70\x69\x72\x79\x20\x64\x61\x74\x65\x20\x6d\x75\x73\x74\x20\x62\x65\x20\x69\x6e\x20\x74\x68\x65\x20\x66\x75\x74\x75\x72\x65\x21");
    try {
      await setSetting("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45", _0x15c3f3.toISOString().split("T")[0]);
      await react("✅");
      const _0x172c3e = Math.ceil((_0x15c3f3 - new Date()) / (0x3E8 * 0x3C * 0x3C * 0x18));
      await reply(
        `✅ *Bot Expiry Date Set!*\n\n` +
        `📅 *Expires on:* ${_0x15c3f3.toDateString()}\n` +
        `⏳ *Days remaining:* ${_0x172c3e} day(s)\n\n` +
        `_Use .clearexpiry to remove the _0x5525bb _0x15c3f3._`
      );
    } catch (error) {
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x63\x68\x65\x63\x6b\x65\x78\x70\x69\x72\x79",
    aliases: ["\x65\x78\x70\x69\x72\x79", "\x65\x78\x70\x69\x72\x79\x63\x68\x65\x63\x6b", "\x62\x6f\x74\x65\x78\x70\x69\x72\x79", "\x65\x78\x70\x64\x61\x74\x65"],
    react: "📅",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x43\x68\x65\x63\x6b\x20\x62\x6f\x74\x20\x65\x78\x70\x69\x72\x79\x20\x64\x61\x74\x65\x20\x61\x6e\x64\x20\x72\x65\x6d\x61\x69\x6e\x69\x6e\x67\x20\x74\x69\x6d\x65",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    try {
      const _0x5525bb = await getSetting("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45");
      if (!_0x5525bb) {
        await react("✅");
        return reply(
          `📅 *Bot Expiry Status*\n\n` +
          `✅ *No _0x5525bb _0x15c3f3 set*\n` +
          `_This bot has no expiration _0x15c3f3._\n\n` +
          `_Use .setexpiry YYYY-MM-DD to set one._`
        );
      }
      const _0x937844 = new Date(_0x5525bb);
      const _0xb117be = new Date();
      const _0x684c65 = _0x937844 - _0xb117be;
      if (_0x684c65 <= 0) {
        await react("⚠️");
        return reply(
          `📅 *Bot Expiry Status*\n\n` +
          `🔴 *EXPIRED!*\n` +
          `📅 *Expired on:* ${_0x937844.toDateString()}\n` +
          `⚠️ _Bot access has expired! Contact owner to renew._`
        );
      }
      const _0x15ca90 = Math.ceil(_0x684c65 / (0x3E8 * 0x3C * 0x3C * 0x18));
      const _0x4b4efc = _0x15ca90 <= 3 ? "🔴" : _0x15ca90 <= 7 ? "🟡" : "🟢";
      const _0x8d4d1f = _0x15ca90 <= 3 ? "\x43\x52\x49\x54\x49\x43\x41\x4c\x20—\x20\x45\x78\x70\x69\x72\x69\x6e\x67\x20\x73\x6f\x6f\x6e\x21" : _0x15ca90 <= 7 ? "\x57\x41\x52\x4e\x49\x4e\x47\x20—\x20\x4c\x65\x73\x73\x20\x74\x68\x61\x6e\x20\x61\x20\x77\x65\x65\x6b\x20\x6c\x65\x66\x74" : "\x41\x43\x54\x49\x56\x45";
      await react("✅");
      await reply(
        `📅 *Bot Expiry Status*\n\n` +
        `${_0x4b4efc} *Status:* ${_0x8d4d1f}\n` +
        `📅 *Expiry Date:* ${_0x937844.toDateString()}\n` +
        `⏳ *Days Remaining:* ${_0x15ca90} day(s)\n\n` +
        `_Use .setexpiry YYYY-MM-DD to update._`
      );
    } catch (error) {
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x63\x6c\x65\x61\x72\x65\x78\x70\x69\x72\x79",
    aliases: ["\x72\x65\x6d\x6f\x76\x65\x65\x78\x70\x69\x72\x79", "\x64\x65\x6c\x65\x74\x65\x65\x78\x70\x69\x72\x79", "\x6e\x6f\x65\x78\x70\x69\x72\x79"],
    react: "🗑️",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x52\x65\x6d\x6f\x76\x65\x20\x74\x68\x65\x20\x62\x6f\x74\x20\x65\x78\x70\x69\x72\x79\x20\x64\x61\x74\x65",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    try {
      const _0x503e31 = await getSetting("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45");
      if (!_0x503e31) {
        return reply("⚠️\x20\x4e\x6f\x20\x65\x78\x70\x69\x72\x79\x20\x64\x61\x74\x65\x20\x69\x73\x20\x63\x75\x72\x72\x65\x6e\x74\x6c\x79\x20\x73\x65\x74\x21");
      }
      await setSetting("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45", "");
      await react("✅");
      await reply(`✅ *Expiry _0x15c3f3 cleared!*\n\n_The bot _0xb117be has no expiration _0x15c3f3._`);
    } catch (error) {
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);
