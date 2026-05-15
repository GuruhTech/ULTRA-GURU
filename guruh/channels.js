var _0x6839d3=(function(_0x00973f,_0x4a5646){return !![]}());var _0xd8185c=function(){return ![]};
const { gmd } = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");
const { safeNewsletterFollow, OWNER_CHANNELS, PROFESSOR_EMOJIS } = require("../guru/connection/connectionHandler");
gmd(
  {
    pattern: "\x63\x68\x61\x6e\x6e\x65\x6c\x73",
    aliases: ["\x6d\x79\x63\x68\x61\x6e\x6e\x65\x6c", "\x6d\x79\x63\x68\x61\x6e\x6e\x65\x6c\x73", "\x63\x68\x61\x6e\x6e\x65\x6c\x69\x6e\x66\x6f", "\x63\x68\x69\x6e\x66\x6f"],
    react: "📡",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x56\x69\x65\x77\x20\x61\x75\x74\x6f\x2d\x66\x6f\x6c\x6c\x6f\x77\x65\x64\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73\x20\x61\x6e\x64\x20\x74\x68\x65\x69\x72\x20\x72\x65\x61\x63\x74\x20\x73\x74\x61\x74\x75\x73",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    try {
      let _0x792a31 = [];
      const _0x59d8fb = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53");
      if (_0x59d8fb) {
        _0x792a31 = _0x59d8fb.split(",").map((j) => j.trim()).filter((j) => j.endsWith("@newsletter"));
      }
      const _0x3c927f = [...new Set([...OWNER_CHANNELS, ...extraChannels])];
      let _0xc4d080 =
        `📡 *CHANNEL MANAGER*\n` +
        `${"─".repeat(0x1E)}\n\n` +
        `🟢 *Auto-React:* ALWAYS ON\n` +
        `🎭 *React Style:* Random Professor Emojis\n` +
        `📊 *Total Channels:* ${_0x3c927f.length}\n\n` +
        `*📌 TRACKED CHANNELS:*\n`;
      _0x3c927f.forEach((_0x932c62, i) => {
        const _0x0c1fc0 = OWNER_CHANNELS.includes(_0x932c62);
        _0xc4d080 += `\n${i + 1}. \`${_0x932c62}\`\n`;
        _0xc4d080 += `   ${_0x0c1fc0 ? "🔒\x20\x42\x75\x69\x6c\x74\x2d\x69\x6e\x20\x28\x61\x6c\x77\x61\x79\x73\x20\x61\x63\x74\x69\x76\x65\x29" : "➕\x20\x43\x75\x73\x74\x6f\x6d"}\n`;
      });
      _0xc4d080 +=
        `\n${"─".repeat(0x1E)}\n` +
        `📘 *Commands:*\n` +
        `• \`.addchannel <_0x932c62>\` — add channel\n` +
        `• \`.removechannel <_0x932c62>\` — remove channel\n` +
        `• \`.followchannels\` — manually re-follow all\n\n` +
        `> _${botFooter}_`;
      await react("✅");
      await reply(_0xc4d080);
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);
gmd(
  {
    pattern: "\x61\x64\x64\x63\x68\x61\x6e\x6e\x65\x6c",
    aliases: ["\x73\x65\x74\x63\x68\x61\x6e\x6e\x65\x6c", "\x74\x72\x61\x63\x6b\x63\x68\x61\x6e\x6e\x65\x6c"],
    react: "➕",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x41\x64\x64\x20\x61\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x74\x6f\x20\x61\x75\x74\x6f\x2d\x66\x6f\x6c\x6c\x6f\x77\x20\x61\x6e\x64\x20\x61\x75\x74\x6f\x2d\x72\x65\x61\x63\x74\x20\x6c\x69\x73\x74\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x64\x64\x63\x68\x61\x6e\x6e\x65\x6c\x20\x31\x32\x33\x34\x35\x36\x37\x38\x39\x30\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    if (!q) return reply("❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x4a\x49\x44\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x60\x2e\x61\x64\x64\x63\x68\x61\x6e\x6e\x65\x6c\x20\x31\x32\x30\x33\x36\x33\x34\x30\x36\x36\x34\x39\x38\x30\x34\x35\x31\x30\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x60");
    const _0x932c62 = q.trim();
    if (!_0x932c62.endsWith("@newsletter")) return reply("❌\x20\x49\x6e\x76\x61\x6c\x69\x64\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x4a\x49\x44\x21\x20\x4d\x75\x73\x74\x20\x65\x6e\x64\x20\x77\x69\x74\x68\x20\x60\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x60");
    try {
      const _0x183163 = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53");
      const _0x9636f6 = _0x183163 ? _0x183163.split(",").map((j) => j.trim()).filter(Boolean) : [];
      if (OWNER_CHANNELS.includes(_0x932c62) || _0x9636f6.includes(_0x932c62)) {
        return reply(`⚠️ Channel \`${_0x932c62}\` is already being tracked!`);
      }
      _0x9636f6.push(_0x932c62);
      await setSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53", _0x9636f6.join(","));
      await safeNewsletterFollow(Gifted, _0x932c62);
      await react("✅");
      await reply(
        `✅ *Channel Added & Followed!*\n\n` +
        `📡 \`${_0x932c62}\`\n\n` +
        `✨ Will now auto-follow and auto-react to posts from this channel.\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);
gmd(
  {
    pattern: "\x72\x65\x6d\x6f\x76\x65\x63\x68\x61\x6e\x6e\x65\x6c",
    aliases: ["\x64\x65\x6c\x63\x68\x61\x6e\x6e\x65\x6c", "\x75\x6e\x74\x72\x61\x63\x6b\x63\x68\x61\x6e\x6e\x65\x6c"],
    react: "➖",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x52\x65\x6d\x6f\x76\x65\x20\x61\x20\x63\x75\x73\x74\x6f\x6d\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x66\x72\x6f\x6d\x20\x61\x75\x74\x6f\x2d\x72\x65\x61\x63\x74\x20\x6c\x69\x73\x74\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x72\x65\x6d\x6f\x76\x65\x63\x68\x61\x6e\x6e\x65\x6c\x20\x31\x32\x33\x34\x35\x36\x37\x38\x39\x30\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    if (!q) return reply("❌\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x4a\x49\x44\x21\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x60\x2e\x72\x65\x6d\x6f\x76\x65\x63\x68\x61\x6e\x6e\x65\x6c\x20\x31\x32\x30\x33\x36\x33\x34\x30\x36\x36\x34\x39\x38\x30\x34\x35\x31\x30\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x60");
    const _0x932c62 = q.trim();
    if (OWNER_CHANNELS.includes(_0x932c62)) {
      return reply(`⚠️ \`${_0x932c62}\` is a built-in channel and cannot be removed.\nBuilt-in channels always remain active.`);
    }
    try {
      const _0x183163 = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53");
      const _0x9636f6 = _0x183163 ? _0x183163.split(",").map((j) => j.trim()).filter(Boolean) : [];
      const _0x89b332 = _0x9636f6.indexOf(_0x932c62);
      if (_0x89b332 === -1) return reply(`⚠️ Channel \`${_0x932c62}\` is not in the custom list.`);
      _0x9636f6.splice(_0x89b332, 1);
      await setSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53", _0x9636f6.join(","));
      await react("✅");
      await reply(
        `✅ *Channel Removed!*\n\n` +
        `📡 \`${_0x932c62}\` removed from auto-react tracking.\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);
gmd(
  {
    pattern: "\x66\x6f\x6c\x6c\x6f\x77\x63\x68\x61\x6e\x6e\x65\x6c\x73",
    aliases: ["\x72\x65\x63\x68\x61\x6e\x6e\x65\x6c\x73", "\x72\x65\x66\x6f\x6c\x6c\x6f\x77\x63\x68\x61\x6e\x6e\x65\x6c\x73", "\x66\x6f\x6c\x6c\x6f\x77\x61\x6c\x6c"],
    react: "📡",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x4d\x61\x6e\x75\x61\x6c\x6c\x79\x20\x72\x65\x2d\x66\x6f\x6c\x6c\x6f\x77\x20\x61\x6c\x6c\x20\x74\x72\x61\x63\x6b\x65\x64\x20\x63\x68\x61\x6e\x6e\x65\x6c\x73",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    try {
      let _0x792a31 = [];
      const _0x59d8fb = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53");
      if (_0x59d8fb) {
        _0x792a31 = _0x59d8fb.split(",").map((j) => j.trim()).filter((j) => j.endsWith("@newsletter"));
      }
      const _0x3c927f = [...new Set([...OWNER_CHANNELS, ...extraChannels])];
      let _0xfc8206 = 0;
      let _0xcaa139 = 0;
      for (const _0x932c62 of _0x3c927f) {
        const ok = await safeNewsletterFollow(Gifted, _0x932c62);
        if (ok) _0xfc8206++; else _0xcaa139++;
      }
      await react("✅");
      await reply(
        `📡 *Channel Follow Complete*\n\n` +
        `✅ Followed: ${_0xfc8206}\n` +
        `❌ Failed: ${_0xcaa139}\n` +
        `📊 Total: ${_0x3c927f.length}\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);
gmd(
  {
    pattern: "\x70\x72\x6f\x66\x65\x73\x73\x6f\x72\x65\x6d\x6f\x6a\x69\x73",
    aliases: ["\x70\x72\x6f\x66\x65\x6d\x6f\x6a\x69\x73", "\x63\x68\x61\x6e\x6e\x65\x6c\x65\x6d\x6f\x6a\x69\x73", "\x72\x65\x61\x63\x74\x65\x6d\x6f\x6a\x69\x73"],
    react: "🎓",
    category: "\x6f\x77\x6e\x65\x72",
    description: "\x56\x69\x65\x77\x20\x61\x6c\x6c\x20\x70\x72\x6f\x66\x65\x73\x73\x6f\x72\x20\x65\x6d\x6f\x6a\x69\x73\x20\x75\x73\x65\x64\x20\x66\x6f\x72\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x61\x75\x74\x6f\x2d\x72\x65\x61\x63\x74\x69\x6f\x6e\x73",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
    }
    await react("✅");
    await reply(
      `🎓 *Professor React Emojis*\n\n` +
      `These emojis are used randomly when auto-reacting to channel posts:\n\n` +
      PROFESSOR_EMOJIS.join("  ") +
      `\n\n📊 *Total:* ${PROFESSOR_EMOJIS.length} emojis\n\n> _${botFooter}_`
    );
  }
);
