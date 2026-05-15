var _0xb7b6a2=(function(_0x9a82e9,_0x951d02){return !![]}());var _0x3fb6d4=function(){return ![]};
const { gmd, commands, monospace, formatBytes } = require("../guru"),
  fs = require("fs"),
  axios = require("axios"),
  BOT_START_TIME = Date.now(),
  { totalmem: totalMemoryBytes, freemem: freeMemoryBytes } = require("os"),
  moment = require("moment-timezone"),
  more = String.fromCharCode(0x200E),
  readmore = more.repeat(0xFA1),
  ram = `${formatBytes(freeMemoryBytes)} / ${formatBytes(totalMemoryBytes)}`;
const { sendButtons } = require("gifted-btns");
gmd(
  {
    pattern: "\x70\x69\x6e\x67",
    aliases: ["pi", "p"],
    react: "⚡",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
    description: "\x43\x68\x65\x63\x6b\x20\x62\x6f\x74\x20\x72\x65\x73\x70\x6f\x6e\x73\x65\x20\x73\x70\x65\x65\x64",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      react,
      newsletterJid,
      newsletterUrl,
      botFooter,
      botName,
      botPrefix,
    } = conText;
    const _0x39fdde = process.hrtime();
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(0x50 + Math.random() * 0x1A4)),
    );
    const _0x71c08f = process.hrtime(_0x39fdde);
    const _0xd0fd9f = Math.floor(_0x71c08f[0] * 0x3E8 + _0x71c08f[1] / 0xF4240);
    const _0xde4929 = _0xd0fd9f < 0x64 ? "🟢\x20\x45\x78\x63\x65\x6c\x6c\x65\x6e\x74" : _0xd0fd9f < 0x12C ? "🟡\x20\x47\x6f\x6f\x64" : "🔴\x20\x53\x6c\x6f\x77";
    const _0x93407e = 0xA;
    const _0xac7379 = Math.max(1, Math.round((1 - Math.min(_0xd0fd9f, 0x3E8) / 0x3E8) * _0x93407e));
    const _0x8ff187 = "▓".repeat(_0xac7379) + "░".repeat(_0x93407e - _0xac7379);
    const _0xb7d978 = Math.round((1 - Math.min(_0xd0fd9f, 0x3E8) / 0x3E8) * 0x64);
    await sendButtons(Gifted, from, {
      title: "",
      _0x8d8434:
`꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  ⚡ *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}* ⚡
       _Ping & Response Check_
꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  🏓 *Response* ›  ${monospace(_0xd0fd9f + "ms")}
  📶 *Signal*   ›  ${_0x8ff187} ${_0xb7d978}%
  ${_0xde4929} *Network Quality*
  🔰 *Status*   ›  Online & Ready`,
      footer: `> ✨ _${botFooter}_`,
      buttons: [
        { id: `${botPrefix}uptime`, _0x8d8434: "⏱️\x20\x55\x70\x74\x69\x6d\x65" },
        {
          name: "\x63\x74\x61\x5f\x75\x72\x6c",
          buttonParamsJson: JSON.stringify({
            display_text: "\x57\x61\x43\x68\x61\x6e\x6e\x65\x6c",
            url: newsletterUrl,
          }),
        },
      ],
    });
    await react("✅");
  },
);
gmd(
  {
    pattern: "\x72\x65\x70\x6f\x72\x74",
    aliases: ["\x72\x65\x71\x75\x65\x73\x74"],
    react: "💫",
    description: "\x52\x65\x71\x75\x65\x73\x74\x20\x4e\x65\x77\x20\x46\x65\x61\x74\x75\x72\x65\x73\x2e",
    category: "\x6f\x77\x6e\x65\x72",
  },
  async (from, Gifted, conText) => {
    const { mek, q, sender, react, pushName, botPrefix, isSuperUser, reply } =
      conText;
    const _0x4b2350 = {};
    const _0xdc48a7 = "\x32\x35\x34\x37\x39\x39\x39\x31\x36\x36\x37\x33";
    try {
      if (!isSuperUser) return reply("\x2a\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x2a");
      if (!q)
        return reply(
          `Example: ${botPrefix}request hi dev downloader commands are not working`,
        );
      const _0x204b4f = mek.key.id;
      if (_0x4b2350[_0x204b4f]) {
        return reply(
          "\x54\x68\x69\x73\x20\x72\x65\x70\x6f\x72\x74\x20\x68\x61\x73\x20\x61\x6c\x72\x65\x61\x64\x79\x20\x62\x65\x65\x6e\x20\x66\x6f\x72\x77\x61\x72\x64\x65\x64\x20\x74\x6f\x20\x74\x68\x65\x20\x6f\x77\x6e\x65\x72\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x77\x61\x69\x74\x20\x66\x6f\x72\x20\x61\x20\x72\x65\x73\x70\x6f\x6e\x73\x65\x2e",
        );
      }
      _0x4b2350[_0x204b4f] = true;
      const _0x279f58 = `*| REQUEST/REPORT |*`;
      const _0x25a1fa = `\n\n*User*: @${sender.split("@")[0]}\n*Request:* ${q}`;
      Gifted.sendMessage(
        _0xdc48a7 + "@s.whatsapp.net",
        {
          _0x8d8434: _0x279f58 + _0x25a1fa,
          mentions: [sender],
        },
        {
          quoted: mek,
        },
      );
      reply(
        "\x54ʜᴀɴᴋ\x20ʏᴏᴜ\x20ꜰᴏʀ\x20ʏᴏᴜʀ\x20ʀᴇᴘᴏʀᴛ\x2e\x20\x49ᴛ\x20ʜᴀ\x73\x20ʙᴇᴇɴ\x20ꜰᴏʀᴡᴀʀᴅᴇᴅ\x20ᴛᴏ\x20ᴛʜᴇ\x20ᴏᴡɴᴇʀ\x2e\x20\x50ʟᴇᴀ\x73ᴇ\x20ᴡᴀɪᴛ\x20ꜰᴏʀ\x20ᴀ\x20ʀᴇ\x73ᴘᴏɴ\x73ᴇ\x2e",
      );
      await react("✅");
    } catch (e) {
      reply(e);
      console.log(e);
    }
  },
);
gmd(
  {
    pattern: "\x6d\x65\x6e\x75\x73",
    aliases: ["\x6d\x61\x69\x6e\x6d\x65\x6e\x75", "\x6d\x61\x69\x6e\x6d\x65\x6e\x73"],
    description: "\x44\x69\x73\x70\x6c\x61\x79\x20\x42\x6f\x74\x27\x73\x20\x55\x70\x74\x69\x6d\x65\x2c\x20\x44\x61\x74\x65\x2c\x20\x54\x69\x6d\x65\x2c\x20\x61\x6e\x64\x20\x4f\x74\x68\x65\x72\x20\x53\x74\x61\x74\x73",
    react: "📜",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      sender,
      react,
      pushName,
      botPic,
      botMode,
      botVersion,
      botName,
      botFooter,
      timeZone,
      botPrefix,
      newsletterJid,
      reply,
      ownerNumber,
    } = conText;
    try {
      const { getSetting } = require("../guru/database/settings");
      function formatUptime(_0x9dd04a) {
        const _0x8c9d06 = Math.floor(_0x9dd04a / (0x18 * 0x3C * 0x3C));
        _0x9dd04a %= 0x18 * 0x3C * 0x3C;
        const _0x7cc441 = Math.floor(_0x9dd04a / (0x3C * 0x3C));
        _0x9dd04a %= 0x3C * 0x3C;
        const _0x0a2b15 = Math.floor(_0x9dd04a / 0x3C);
        _0x9dd04a = Math.floor(_0x9dd04a % 0x3C);
        return `${_0x8c9d06}d ${_0x7cc441}h ${_0x0a2b15}m ${_0x9dd04a}s`;
      }
      const _0xa5d48c = new Date();
      const _0x0efdb0 = new Intl.DateTimeFormat("\x65\x6e\x2d\x47\x42", {
        timeZone: timeZone,
        day: "\x32\x2d\x64\x69\x67\x69\x74",
        month: "\x32\x2d\x64\x69\x67\x69\x74",
        year: "\x6e\x75\x6d\x65\x72\x69\x63",
      }).format(_0xa5d48c);
      const _0x2427aa = new Intl.DateTimeFormat("\x65\x6e\x2d\x47\x42", {
        timeZone: timeZone,
        hour: "\x32\x2d\x64\x69\x67\x69\x74",
        minute: "\x32\x2d\x64\x69\x67\x69\x74",
        second: "\x32\x2d\x64\x69\x67\x69\x74",
        hour12: true,
      }).format(_0xa5d48c);
      const _0xc79d7d = formatUptime(process.uptime());
      const _0xd5a7f0 = commands.filter(
        (command) => command.pattern && !command.dontAddCommandList,
      ).length;
      let _0x13e75b = "\x20\x20♾️\x20\x20\x2a\x4c\x49\x46\x45\x54\x49\x4d\x45\x20\x4c\x49\x43\x45\x4e\x53\x45\x2a\x5c\x6e\x20\x20✅\x20\x20\x5f\x4e\x6f\x20\x65\x78\x70\x69\x72\x79\x20\x73\x65\x74\x20·\x20\x41\x6c\x77\x61\x79\x73\x20\x61\x63\x74\x69\x76\x65\x5f";
      try {
        const _0x14b08f = await getSetting("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45");
        if (_0x14b08f) {
          const _0xb87340 = new Date(_0x14b08f);
          const _0xb094dd = Math.ceil((_0xb87340 - _0xa5d48c) / (0x3E8 * 0x3C * 0x3C * 0x18));
          if (_0xb094dd <= 0) {
            _0x13e75b = `  🔴  *EXPIRED*\n  ❌  _License ended · ${_0xb87340.toDateString()}_`;
          } else if (_0xb094dd <= 7) {
            _0x13e75b = `  🟡  *EXPIRY SOON* · _${_0xb094dd} day(s) left!_\n  ⚠️  _Expires: ${_0xb87340.toDateString()}_`;
          } else {
            _0x13e75b = `  🟢  *ACTIVE* · _${_0xb094dd} _0x8c9d06 remaining_\n  📅  _Expires: ${_0xb87340.toDateString()}_`;
          }
        }
      } catch {}
      const _0xa87f73 = {
        general: "🌐", owner: "👑", group: "👥", ai: "🤖",
        downloader: "📥", tools: "🔧", search: "🔍", games: "🎮",
        fun: "🎉", religion: "🕌", sticker: "🖼️", converter: "🔄",
        settings: "⚙️", media: "📸",
      };
      const _0x10b5d6 = commands.reduce((acc, cmd) => {
        if (cmd.pattern && !cmd.dontAddCommandList) {
          const _0xe13a11 = cmd.category || "\x67\x65\x6e\x65\x72\x61\x6c";
          if (!acc[_0xe13a11]) acc[_0xe13a11] = 0;
          acc[_0xe13a11]++;
        }
        return acc;
      }, {});
      let _0x40bc60 = Object.entries(_0x10b5d6)
        .sort(([, a], [, b]) => b - a)
        .map(([_0xe13a11, _0x4c7e55]) => {
          const _0xa1cef5 = _0xa87f73[_0xe13a11.toLowerCase()] || "⚡";
          return `  ✦ ${_0xa1cef5} ${_0xe13a11.charAt(0).toUpperCase() + _0xe13a11.slice(1)}  ·  ${_0x4c7e55} cmds`;
        })
        .join("\n");
      let _0xbadecb =
`꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  ⚡ _The Ultimate WhatsApp Bot_ ⚡
  🤖 *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}* 🤖
꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  🔰 *GᴜʀᴜTᴇᴄʜ Lᴀʙ*  ·  _Official Build_
━━━━━━ 🔑 *LICENSE STATUS* ━━━━━━
${_0x13e75b}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 *Version* ›  v${botVersion || "\x35\x2e\x30\x2e\x30"}
  ⏱️ *Uptime*  ›  ${_0xc79d7d}
  ⚡ *Prefix*  ›  ${monospace(botPrefix)}
  👤 *User*    ›  ${pushName}
  ⚙️ *Mode*    ›  ${botMode?.toUpperCase() || "\x50\x55\x42\x4c\x49\x43"}
  📊 *Cmds*    ›  ${_0xd5a7f0} loaded
  🕒 *Time*    ›  ${_0x2427aa}
  📅 *Date*    ›  ${_0x0efdb0}
  🌍 *Zone*    ›  ${timeZone}
▬▬▬▬▬▬ ❯ *COMMAND CATEGORIES* ❮ ▬▬▬▬▬
${_0x40bc60}
▬▬▬▬▬▬▬ ❯ *QUICK ACCESS* ❮ ▬▬▬▬▬▬▬▬
  ⚡ ${monospace(botPrefix + "\x6d\x65\x6e\x75")}   ›  Full command _0x489efb
  📋 ${monospace(botPrefix + "\x6c\x69\x73\x74")}   ›  All commands
  🏓 ${monospace(botPrefix + "\x70\x69\x6e\x67")}   ›  Bot _0xa1f7fd speed
  ⏱️ ${monospace(botPrefix + "\x75\x70\x74\x69\x6d\x65")} ›  Bot _0xc79d7d
  🗂️ ${monospace(botPrefix + "\x72\x65\x70\x6f")}   ›  Source code
  ❓ ${monospace(botPrefix + "\x68\x65\x6c\x70")}   ›  Usage guide
> ✨ _${botFooter}_`;
      const _0xfb0673 = {
        image: { url: botPic },
        caption: _0xbadecb.trim(),
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 0,
          },
        },
      };
      try {
        await Gifted.sendMessage(from, _0xfb0673, { quoted: mek });
      } catch (_) {
        await Gifted.sendMessage(from, { _0x8d8434: _0xbadecb.trim() }, { quoted: mek });
      }
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`${e}`);
    }
  },
);
gmd(
  {
    pattern: "\x6c\x69\x73\x74",
    aliases: ["\x6c\x69\x73\x74\x6d\x65\x6e\x75", "\x6c\x69\x73\x74\x6d\x65\x6e"],
    description: "\x53\x68\x6f\x77\x20\x41\x6c\x6c\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x73\x20\x61\x6e\x64\x20\x74\x68\x65\x69\x72\x20\x55\x73\x61\x67\x65",
    react: "📜",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      sender,
      react,
      pushName,
      botPic,
      botMode,
      botVersion,
      botName,
      botFooter,
      timeZone,
      botPrefix,
      newsletterJid,
      reply,
    } = conText;
    try {
      function formatUptime(_0x9dd04a) {
        const _0x8c9d06 = Math.floor(_0x9dd04a / (0x18 * 0x3C * 0x3C));
        _0x9dd04a %= 0x18 * 0x3C * 0x3C;
        const _0x7cc441 = Math.floor(_0x9dd04a / (0x3C * 0x3C));
        _0x9dd04a %= 0x3C * 0x3C;
        const _0x0a2b15 = Math.floor(_0x9dd04a / 0x3C);
        _0x9dd04a = Math.floor(_0x9dd04a % 0x3C);
        return `${_0x8c9d06}d ${_0x7cc441}h ${_0x0a2b15}m ${_0x9dd04a}s`;
      }
      const _0xa5d48c = new Date();
      const _0x0efdb0 = new Intl.DateTimeFormat("\x65\x6e\x2d\x47\x42", {
        timeZone: timeZone,
        day: "\x32\x2d\x64\x69\x67\x69\x74",
        month: "\x32\x2d\x64\x69\x67\x69\x74",
        year: "\x6e\x75\x6d\x65\x72\x69\x63",
      }).format(_0xa5d48c);
      const _0x2427aa = new Intl.DateTimeFormat("\x65\x6e\x2d\x47\x42", {
        timeZone: timeZone,
        hour: "\x32\x2d\x64\x69\x67\x69\x74",
        minute: "\x32\x2d\x64\x69\x67\x69\x74",
        second: "\x32\x2d\x64\x69\x67\x69\x74",
        hour12: true,
      }).format(_0xa5d48c);
      const _0xc79d7d = formatUptime(process.uptime());
      const _0xd5a7f0 = commands.filter(
        (command) => command.pattern && !command.dontAddCommandList,
      ).length;
      let _0x45c49b = "\x20\x20♾️\x20\x20\x2a\x4c\x49\x46\x45\x54\x49\x4d\x45\x20\x4c\x49\x43\x45\x4e\x53\x45\x2a\x5c\x6e\x20\x20✅\x20\x20\x5f\x4e\x6f\x20\x65\x78\x70\x69\x72\x79\x20\x73\x65\x74\x20·\x20\x41\x6c\x77\x61\x79\x73\x20\x61\x63\x74\x69\x76\x65\x5f";
      try {
        const { getSetting: getSettingList } = require("../guru/database/settings");
        const _0xb8dfbf = await getSettingList("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45");
        if (_0xb8dfbf) {
          const _0xb326e8 = new Date(_0xb8dfbf);
          const dL = Math.ceil((_0xb326e8 - _0xa5d48c) / (0x3E8 * 0x3C * 0x3C * 0x18));
          if (dL <= 0) _0x45c49b = `  🔴  *EXPIRED*\n  ❌  _License ended · ${_0xb326e8.toDateString()}_`;
          else if (dL <= 7) _0x45c49b = `  🟡  *EXPIRY SOON* · _${dL} day(s) left!_\n  ⚠️  _Expires: ${_0xb326e8.toDateString()}_`;
          else _0x45c49b = `  🟢  *ACTIVE* · _${dL} _0x8c9d06 remaining_\n  📅  _Expires: ${_0xb326e8.toDateString()}_`;
        }
      } catch {}
      let _0x489efb =
`꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  ⚡ _The Ultimate WhatsApp Bot_ ⚡
  🤖 *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}* 🤖
꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  🔰 *GᴜʀᴜTᴇᴄʜ Lᴀʙ*  ·  _Official Build_
━━━━━━ 🔑 *LICENSE STATUS* ━━━━━━
${_0x45c49b}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         📋 _Full Command Index_
  ✦ 📦 *Version* ›  ${monospace("v" + (botVersion || "\x35\x2e\x30\x2e\x30"))}
  ✦ ⏱️ *Uptime*  ›  ${monospace(_0xc79d7d)}
  ✦ ⚡ *Prefix*  ›  ${monospace(botPrefix)}
  ✦ 👤 *User*    ›  ${monospace(pushName)}
  ✦ ⚙️ *Mode*    ›  ${monospace((botMode || "\x70\x75\x62\x6c\x69\x63").toUpperCase())}
  ✦ 📊 *Cmds*    ›  ${monospace(_0xd5a7f0.toString())} loaded
  ✦ 🕒 *Time*    ›  ${monospace(_0x2427aa)}
  ✦ 📅 *Date*    ›  ${monospace(_0x0efdb0)}
  ✦ 🌍 *Zone*    ›  ${monospace(timeZone)}
  ✦ 💾 *RAM*     ›  ${monospace(ram)}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬${readmore}\n\n`;
      const _0xe9120f = commands
        .filter((gmd) => gmd.pattern && gmd.description)
        .sort((a, b) => b.pattern.length - a.pattern.length);
      _0xe9120f.forEach((gmd, index) => {
        _0x489efb += `*${index + 1}.* ${monospace(gmd.pattern)}\n   ↳ ${gmd.description}\n\n`;
      });
      const _0xfb0673 = {
        image: { url: botPic },
        caption: _0x489efb.trim(),
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 0,
          },
        },
      };
      try {
        await Gifted.sendMessage(from, _0xfb0673, { quoted: mek });
      } catch (_) {
        await Gifted.sendMessage(from, { _0x8d8434: _0x489efb.trim() }, { quoted: mek });
      }
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`${e}`);
    }
  },
);
const _0x8f2f02 = {
  general: "🌐", owner: "👑", group: "👥", ai: "🤖",
  downloader: "📥", tools: "🔧", search: "🔍", games: "🎮",
  fun: "🎉", religion: "🕌", sticker: "🖼️", converter: "🔄",
  settings: "⚙️", media: "📸", notes: "📝", channels: "📢",
  sports: "⚽", extras: "✨", texttools: "🔡", restrictions: "🚫",
};
const _0xaf03e8 = ["\x67\x65\x6e\x65\x72\x61\x6c","ai","\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x65\x72","\x74\x6f\x6f\x6c\x73","\x73\x65\x61\x72\x63\x68","\x67\x61\x6d\x65\x73","\x67\x72\x6f\x75\x70","\x6f\x77\x6e\x65\x72","\x73\x65\x74\x74\x69\x6e\x67\x73","\x66\x75\x6e","\x63\x6f\x6e\x76\x65\x72\x74\x65\x72","\x72\x65\x6c\x69\x67\x69\x6f\x6e","\x74\x65\x78\x74\x74\x6f\x6f\x6c\x73","\x6e\x6f\x74\x65\x73","\x63\x68\x61\x6e\x6e\x65\x6c\x73","\x73\x70\x6f\x72\x74\x73","\x65\x78\x74\x72\x61\x73","\x72\x65\x73\x74\x72\x69\x63\x74\x69\x6f\x6e\x73","\x73\x74\x69\x63\x6b\x65\x72","\x6d\x65\x64\x69\x61"];
function buildCategorizedMenu(commands) {
  const _0x10b5d6 = {};
  for (const cmd of commands) {
    if (!cmd.pattern || cmd.dontAddCommandList) continue;
    const _0xe13a11 = (cmd.category || "\x67\x65\x6e\x65\x72\x61\x6c").toLowerCase();
    if (!_0x10b5d6[_0xe13a11]) _0x10b5d6[_0xe13a11] = [];
    _0x10b5d6[_0xe13a11].push({
      pattern: cmd.pattern,
      description: cmd.description || "",
      isBody: cmd.on === "\x62\x6f\x64\x79",
    });
  }
  for (const _0xe13a11 of Object.keys(_0x10b5d6)) {
    _0x10b5d6[_0xe13a11].sort((a, b) => a.pattern.localeCompare(b.pattern));
  }
  return _0x10b5d6;
}
function getSortedCats(_0x10b5d6) {
  return Object.keys(_0x10b5d6).sort((a, b) => {
    const ai = _0xaf03e8.indexOf(a), bi = _0xaf03e8.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
gmd(
  {
    pattern: "\x6d\x65\x6e\x75",
    aliases: ["\x68\x65\x6c\x70", "\x6d\x65\x6e", "\x61\x6c\x6c\x6d\x65\x6e\x75"],
    react: "📜",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
    description: "\x42\x72\x6f\x77\x73\x65\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x73\x20\x62\x79\x20\x63\x61\x74\x65\x67\x6f\x72\x79\x20—\x20\x72\x65\x70\x6c\x79\x20\x77\x69\x74\x68\x20\x61\x20\x6e\x75\x6d\x62\x65\x72",
  },
  async (from, Gifted, conText) => {
    const {
      mek, sender, react, pushName, botPic, botMode, botVersion,
      botName, botFooter, botPrefix, newsletterJid, reply,
    } = conText;
    try {
      function formatUptime(s) {
        const d = Math.floor(s / 0x15180); s %= 0x15180;
        const h = Math.floor(s / 0xE10); s %= 0xE10;
        const m = Math.floor(s / 0x3C);
        return `${d}d ${h}h ${m}m`;
      }
      const _0xa5d48c = new Date();
      const _0xc79d7d = formatUptime(Math.floor(process.uptime()));
      const _0x92336e = commands.filter(c => c.pattern && !c.dontAddCommandList).length;
      const { getSetting: getSettingMenu } = require("../guru/database/settings");
      let _0xc394b7 = "♾️\x20\x20\x4c\x49\x46\x45\x54\x49\x4d\x45\x20\x4c\x49\x43\x45\x4e\x53\x45";
      let _0x4a0ee5 = "\x4e\x6f\x20\x65\x78\x70\x69\x72\x79\x20\x73\x65\x74\x20·\x20\x41\x6c\x77\x61\x79\x73\x20\x61\x63\x74\x69\x76\x65";
      try {
        const _0x61e4b7 = await getSettingMenu("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45");
        if (_0x61e4b7) {
          const _0xb87340 = new Date(_0x61e4b7);
          const _0xf4cb2a = Math.ceil((_0xb87340 - _0xa5d48c) / 86400000);
          const _0xa46313 = Math.floor(((_0xb87340 - _0xa5d48c) % 86400000) / 0x36EE80);
          const _0xa6f243 = Math.floor(((_0xb87340 - _0xa5d48c) % 0x36EE80) / 0xEA60);
          if (_0xf4cb2a <= 0) {
            _0xc394b7 = "🔴\x20\x20\x45\x58\x50\x49\x52\x45\x44";
            _0x4a0ee5 = `License ended · ${_0xb87340.toDateString()}`;
          } else if (_0xf4cb2a <= 7) {
            _0xc394b7 = "🟡\x20\x20\x45\x58\x50\x49\x52\x59\x20\x53\x4f\x4f\x4e";
            _0x4a0ee5 = `${_0xf4cb2a}d ${_0xa46313}h ${_0xa6f243}m left`;
          } else {
            _0xc394b7 = "🟢\x20\x20\x41\x43\x54\x49\x56\x45\x20\x4c\x49\x43\x45\x4e\x53\x45";
            _0x4a0ee5 = `${_0xb87340.toLocaleDateString("\x65\x6e\x2d\x47\x42")}, (${_0xf4cb2a}d ${_0xa46313}h ${_0xa6f243}m left)`;
          }
        }
      } catch {}
      const _0x10b5d6 = buildCategorizedMenu(commands);
      const _0xd89bb8 = getSortedCats(_0x10b5d6);
      const _0x05de9f = _0xd89bb8.map((_0xe13a11, i) => {
        const _0xa1cef5 = _0x8f2f02[_0xe13a11] || "⚡";
        const _0x4c7e55 = _0x10b5d6[_0xe13a11].length;
        const _0x2c78c9 = (_0xe13a11.charAt(0).toUpperCase() + _0xe13a11.slice(1)).toUpperCase();
        return `> │◦➛ ${i + 1}. ${_0xa1cef5} ${_0x2c78c9}  _(${_0x4c7e55} _0x8d817c)_`;
      }).join("\n");
      const _0x1d548d =
`╰► Hey, @${sender.split("@")[0]}
╭───〔  *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}*  〕──────┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
├──────────────────────
│✵│▸ 📊 *TOTAL COMMANDS:* ${_0x92336e}
│✵│▸ ⏱️ *UPTIME:* ${_0xc79d7d}
│✵│▸ ⚡ *PREFIX:* ${botPrefix}
│✵│▸ ⚙️ *MODE:* ${(botMode || "\x70\x75\x62\x6c\x69\x63").toUpperCase()}
│✵│▸ 📦 *VERSION:* v${botVersion || "\x35\x2e\x30\x2e\x30"}
│✵│▸ 🔑 *LICENSE:* ${_0xc394b7}
│✵│▸ 📅 *EXPIRY:* ${_0x4a0ee5}
╰──────────────────────────────⊷
╭───◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇──────┈⊷
│「 Reply with a number below 」
${_0x05de9f}
╰─────────────────────┈⊷
> ✨ _${botFooter}_`;
      const _0xfb0673 = {
        image: { url: botPic },
        caption: _0x1d548d.trim(),
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 0,
          },
        },
      };
      try {
        await Gifted.sendMessage(from, _0xfb0673, { quoted: mek });
      } catch (_) {
        await Gifted.sendMessage(from, { _0x8d8434: _0x1d548d.trim() }, { quoted: mek });
      }
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`${e}`);
    }
  },
);
gmd(
  {
    on: "\x62\x6f\x64\x79",
    pattern: /^\d{1,2}$/,
    dontAddCommandList: true,
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
  },
  async (from, Gifted, conText) => {
    const {
      mek, sender, react, pushName, botPic, botMode, botVersion,
      botName, botFooter, botPrefix, newsletterJid, reply, body,
    } = conText;
    try {
      const _0x41aa86 = (body || "").trim();
      if (!/^\d{1,2}$/.test(_0x41aa86)) return;
      const _0xfd6639 = parseInt(_0x41aa86, 0xA);
      if (isNaN(_0xfd6639) || _0xfd6639 < 0) return;
      const _0x10b5d6 = buildCategorizedMenu(commands);
      const _0xd89bb8 = getSortedCats(_0x10b5d6);
      if (_0xfd6639 === 0) {
        function formatUptime(s) {
          const d = Math.floor(s / 0x15180); s %= 0x15180;
          const h = Math.floor(s / 0xE10); s %= 0xE10;
          const m = Math.floor(s / 0x3C);
          return `${d}d ${h}h ${m}m`;
        }
        const _0xc79d7d = formatUptime(Math.floor(process.uptime()));
        const _0x92336e = commands.filter(c => c.pattern && !c.dontAddCommandList).length;
        const { getSetting: getSettingMenu } = require("../guru/database/settings");
        let _0xc394b7 = "♾️\x20\x20\x4c\x49\x46\x45\x54\x49\x4d\x45\x20\x4c\x49\x43\x45\x4e\x53\x45";
        let _0x4a0ee5 = "\x4e\x6f\x20\x65\x78\x70\x69\x72\x79\x20\x73\x65\x74\x20·\x20\x41\x6c\x77\x61\x79\x73\x20\x61\x63\x74\x69\x76\x65";
        try {
          const _0xa5d48c = new Date();
          const _0x61e4b7 = await getSettingMenu("\x42\x4f\x54\x5f\x45\x58\x50\x49\x52\x59\x5f\x44\x41\x54\x45");
          if (_0x61e4b7) {
            const _0xb87340 = new Date(_0x61e4b7);
            const _0xf4cb2a = Math.ceil((_0xb87340 - _0xa5d48c) / 86400000);
            const _0xa46313 = Math.floor(((_0xb87340 - _0xa5d48c) % 86400000) / 0x36EE80);
            const _0xa6f243 = Math.floor(((_0xb87340 - _0xa5d48c) % 0x36EE80) / 0xEA60);
            if (_0xf4cb2a <= 0) {
              _0xc394b7 = "🔴\x20\x20\x45\x58\x50\x49\x52\x45\x44";
              _0x4a0ee5 = `License ended · ${_0xb87340.toDateString()}`;
            } else if (_0xf4cb2a <= 7) {
              _0xc394b7 = "🟡\x20\x20\x45\x58\x50\x49\x52\x59\x20\x53\x4f\x4f\x4e";
              _0x4a0ee5 = `${_0xf4cb2a}d ${_0xa46313}h ${_0xa6f243}m left`;
            } else {
              _0xc394b7 = "🟢\x20\x20\x41\x43\x54\x49\x56\x45\x20\x4c\x49\x43\x45\x4e\x53\x45";
              _0x4a0ee5 = `${_0xb87340.toLocaleDateString("\x65\x6e\x2d\x47\x42")}, (${_0xf4cb2a}d ${_0xa46313}h ${_0xa6f243}m left)`;
            }
          }
        } catch {}
        const _0x05de9f = _0xd89bb8.map((_0xe13a11, i) => {
          const _0xa1cef5 = _0x8f2f02[_0xe13a11] || "⚡";
          const _0x4c7e55 = _0x10b5d6[_0xe13a11].length;
          const _0x2c78c9 = (_0xe13a11.charAt(0).toUpperCase() + _0xe13a11.slice(1)).toUpperCase();
          return `> │◦➛ ${i + 1}. ${_0xa1cef5} ${_0x2c78c9}  _(${_0x4c7e55} _0x8d817c)_`;
        }).join("\n");
        const _0x1d548d =
`╰► Hey, @${sender.split("@")[0]}
╭───〔  *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}*  〕──────┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
├──────────────────────
│✵│▸ 📊 *TOTAL COMMANDS:* ${_0x92336e}
│✵│▸ ⏱️ *UPTIME:* ${_0xc79d7d}
│✵│▸ ⚡ *PREFIX:* ${botPrefix}
│✵│▸ ⚙️ *MODE:* ${(botMode || "\x70\x75\x62\x6c\x69\x63").toUpperCase()}
│✵│▸ 📦 *VERSION:* v${botVersion || "\x35\x2e\x30\x2e\x30"}
│✵│▸ 🔑 *LICENSE:* ${_0xc394b7}
│✵│▸ 📅 *EXPIRY:* ${_0x4a0ee5}
╰──────────────────────────────⊷
╭───◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇──────┈⊷
│「 Reply with a number below 」
${_0x05de9f}
╰─────────────────────┈⊷
> ✨ _${botFooter}_`;
        const _0xfb0673 = {
          image: { url: botPic },
          caption: _0x1d548d.trim(),
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        };
        try {
          await Gifted.sendMessage(from, _0xfb0673, { quoted: mek });
        } catch (_) {
          await Gifted.sendMessage(from, { _0x8d8434: _0x1d548d.trim() }, { quoted: mek });
        }
        return await react("✅");
      }
      if (_0xfd6639 > _0xd89bb8.length) return;
      const _0xe13a11 = _0xd89bb8[_0xfd6639 - 1];
      const _0x8d817c = _0x10b5d6[_0xe13a11];
      const _0xa1cef5 = _0x8f2f02[_0xe13a11] || "⚡";
      const _0x2c78c9 = (_0xe13a11.charAt(0).toUpperCase() + _0xe13a11.slice(1)).toUpperCase();
      const _0x208839 = _0x8d817c.map(cmd => {
        const _0x6a1099 = cmd.isBody ? "" : botPrefix;
        const _0x2c1d48 = (_0x6a1099 + cmd.pattern).padEnd(0x12, " ");
        const _0x0b3e32 = cmd.description
          ? (cmd.description.length > 0x1C ? cmd.description.slice(0, 0x1A) + "…" : cmd.description)
          : "—";
        return `> │◈ *${_0x2c1d48}* › _${_0x0b3e32}_`;
      }).join("\n> │\n");
      const _0x3d1418 =
`╭───〔 *${_0xa1cef5} ${_0x2c78c9} COMMANDS* 〕──────┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭
├──────────────────────
│✵│▸ 📊 *TOTAL:* ${_0x8d817c.length} commands
│✵│▸ ⚡ *PREFIX:* ${botPrefix}
├──────────────────────
│
${_0x208839}
│
╰─────────────────────┈⊷
  💬 _Reply_ *0* _to go back to menu_
> ✨ _${botFooter}_`;
      await Gifted.sendMessage(from, { _0x8d8434: _0x3d1418.trim() }, { quoted: mek });
      await react("✅");
    } catch (e) {
      console.error(e);
    }
  },
);
gmd(
  {
    pattern: "\x72\x65\x74\x75\x72\x6e",
    aliases: ["\x64\x65\x74\x61\x69\x6c\x73", "\x64\x65\x74", "\x72\x65\x74"],
    react: "⚡",
    category: "\x6f\x77\x6e\x65\x72",
    description:
      "\x44\x69\x73\x70\x6c\x61\x79\x73\x20\x74\x68\x65\x20\x66\x75\x6c\x6c\x20\x72\x61\x77\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x75\x73\x69\x6e\x67\x20\x42\x61\x69\x6c\x65\x79\x73\x20\x73\x74\x72\x75\x63\x74\x75\x72\x65\x2e",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      reply,
      react,
      _0x2e0170,
      isSuperUser,
      botName,
      botFooter,
      newsletterJid,
      newsletterUrl,
    } = conText;
    if (!isSuperUser) {
      return reply(`Owner Only Command!`);
    }
    if (!_0x2e0170) {
      return reply(`Please reply to/quote a message`);
    }
    try {
      const _0xe86bd1 = JSON.stringify(_0x2e0170, null, 2);
      const _0x30a032 = _0xe86bd1.match(/[\s\S]{1,0x186A0}/g) || [];
      for (const chunk of _0x30a032) {
        const _0x2f522d = `\`\`\`\n${chunk}\n\`\`\``;
        await sendButtons(Gifted, from, {
          title: "",
          _0x8d8434: _0x2f522d,
          footer: `> *${botFooter}*`,
          buttons: [
            {
              name: "\x63\x74\x61\x5f\x63\x6f\x70\x79",
              buttonParamsJson: JSON.stringify({
                display_text: "\x43\x6f\x70\x79",
                copy_code: _0x2f522d,
              }),
            },
            {
              name: "\x63\x74\x61\x5f\x75\x72\x6c",
              buttonParamsJson: JSON.stringify({
                display_text: "\x57\x61\x43\x68\x61\x6e\x6e\x65\x6c",
                url: newsletterUrl,
              }),
            },
          ],
        });
        await react("✅");
      }
    } catch (error) {
      console.error("\x45\x72\x72\x6f\x72\x20\x70\x72\x6f\x63\x65\x73\x73\x69\x6e\x67\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x3a", error);
      await reply(`❌ An error occurred while processing the message.`);
    }
  },
);
gmd(
  {
    pattern: "\x75\x70\x74\x69\x6d\x65",
    aliases: ["up"],
    react: "⏳",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
    description: "\x63\x68\x65\x63\x6b\x20\x62\x6f\x74\x20\x75\x70\x74\x69\x6d\x65\x20\x73\x74\x61\x74\x75\x73\x2e",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      react,
      newsletterJid,
      newsletterUrl,
      botFooter,
      botName,
      botPrefix,
    } = conText;
    const _0xe7aea0 = Date.now() - BOT_START_TIME;
    const _0x9dd04a = Math.floor((_0xe7aea0 / 0x3E8) % 0x3C);
    const _0x0a2b15 = Math.floor((_0xe7aea0 / (0x3E8 * 0x3C)) % 0x3C);
    const _0x7cc441 = Math.floor((_0xe7aea0 / (0x3E8 * 0x3C * 0x3C)) % 0x18);
    const _0x8c9d06 = Math.floor(_0xe7aea0 / (0x3E8 * 0x3C * 0x3C * 0x18));
    await sendButtons(Gifted, from, {
      title: "",
      _0x8d8434:
`꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  ⏱️ *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}* ⏱️
      _Uptime & Status Check_
꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  ⏳ *Runtime* ›  ${monospace(`${_0x8c9d06}d ${_0x7cc441}h ${_0x0a2b15}m ${_0x9dd04a}s`)}
  🟢 *Status*  ›  Running Smoothly
  💡 *Session* ›  Active & Stable`,
      footer: `> ✨ _${botFooter}_`,
      buttons: [
        { id: `${botPrefix}ping`, _0x8d8434: "⚡\x20\x50\x69\x6e\x67" },
        {
          name: "\x63\x74\x61\x5f\x75\x72\x6c",
          buttonParamsJson: JSON.stringify({
            display_text: "\x57\x61\x43\x68\x61\x6e\x6e\x65\x6c",
            url: newsletterUrl,
          }),
        },
      ],
    });
    await react("✅");
  },
);
gmd(
  {
    pattern: "\x68\x65\x6c\x70",
    aliases: ["h", "\x67\x75\x69\x64\x65", "\x73\x74\x61\x72\x74"],
    react: "📖",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
    description: "\x55\x73\x61\x67\x65\x20\x67\x75\x69\x64\x65\x20\x61\x6e\x64\x20\x71\x75\x69\x63\x6b\x20\x68\x65\x6c\x70\x20\x66\x6f\x72\x20\x74\x68\x65\x20\x62\x6f\x74\x2e",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      react,
      sender,
      pushName,
      botPic,
      botName,
      botFooter,
      botPrefix,
      botVersion,
      newsletterUrl,
      newsletterJid,
    } = conText;
    const _0xddadc6 =
`꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  📖 *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()}* 📖
        _Quick Usage Guide_
꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  🔰 *GᴜʀᴜTᴇᴄʜ Lᴀʙ*  ·  _Official Build_
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
👋 Welcome *${pushName}!*
_Here's everything you need to get started._
▬▬▬▬▬ ❯ *HOW TO USE* ❮ ▬▬▬▬▬▬
  ⚡ *Prefix*  ›  ${monospace(botPrefix)}
  📌 *Format*  ›  ${monospace(botPrefix + "\x63\x6f\x6d\x6d\x61\x6e\x64")}
  📦 *Version* ›  v${botVersion || "\x35\x2e\x30\x2e\x30"}
▬▬▬▬ ❯ *KEY COMMANDS* ❮ ▬▬▬▬▬▬
  ${monospace(botPrefix + "\x6d\x65\x6e\x75")}    ›  Full _0x10b5d6 menu
  ${monospace(botPrefix + "\x6c\x69\x73\x74")}    ›  All commands + descriptions
  ${monospace(botPrefix + "\x70\x69\x6e\x67")}    ›  Check bot _0xa1f7fd speed
  ${monospace(botPrefix + "\x75\x70\x74\x69\x6d\x65")}  ›  How long bot has been online
  ${monospace(botPrefix + "\x72\x65\x70\x6f")}    ›  Get the source code
  ${monospace(botPrefix + "ai")}      ›  Talk to the AI assistant
  ${monospace(botPrefix + "\x73\x74\x69\x63\x6b\x65\x72")} ›  Create stickers from media
  ${monospace(botPrefix + "\x74\x69\x6b\x74\x6f\x6b")}  ›  Download TikTok videos
  ${monospace(botPrefix + "\x73\x70\x6f\x74\x69\x66\x79")} ›  Download Spotify tracks
▬▬▬▬ ❯ *TIPS & NOTES* ❮ ▬▬▬▬▬▬
  ✦ Reply to media with a command
  ✦ All commands need the _0x6a1099: ${monospace(botPrefix)}
  ✦ Use ${monospace(botPrefix + "\x6c\x69\x73\x74")} to see every command
  ✦ Owner commands need permission
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
> ✨ _${botFooter}_`;
    const _0xfb0673 = {
      image: { url: botPic },
      caption: _0xddadc6,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJid,
          newsletterName: botName,
          serverMessageId: 0xC8,
        },
      },
    };
    try {
      await Gifted.sendMessage(from, _0xfb0673, { quoted: mek });
    } catch (_) {
      await Gifted.sendMessage(from, { _0x8d8434: _0xddadc6 }, { quoted: mek });
    }
    await react("✅");
  },
);
gmd(
  {
    pattern: "\x72\x65\x70\x6f",
    aliases: ["sc", "\x72\x65\x70", "\x73\x63\x72\x69\x70\x74"],
    react: "💜",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
    description: "\x46\x65\x74\x63\x68\x20\x62\x6f\x74\x20\x73\x63\x72\x69\x70\x74\x2e",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      sender,
      react,
      pushName,
      botPic,
      botName,
      botFooter,
      newsletterUrl,
      ownerName,
      newsletterJid,
      giftedRepo,
    } = conText;
    const _0xa1f7fd = await axios.get(
      `https:
    );
    const _0x577920 = _0xa1f7fd.data;
    const {
      full_name,
      name,
      forks_count,
      stargazers_count,
      created_at,
      updated_at,
      owner,
    } = _0x577920;
    const _0x7db7c4 =
`꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  🗂️ *${(botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44").toUpperCase()} REPO* 🗂️
     ⚡ _Open Source · Free Forever_ ⚡
꧁✦━━━━━━━━━━━━━━━━━━━━━━━━━✦꧂
  🔰 *GᴜʀᴜTᴇᴄʜ Lᴀʙ*  ·  _Official Build_
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
👋 Hey *${pushName}!*
_${botName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55\x20\x4d\x44"} is a powerful multi-device WhatsApp bot built by *${ownerName}*, packed with amazing features to enhance your experience._
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  📦 *Name*     ›  ${monospace(name)}
  ⭐ *Stars*    ›  ${monospace(String(stargazers_count))}
  🍴 *Forks*    ›  ${monospace(String(forks_count))}
  🗓️ *Created*  ›  ${monospace(new Date(created_at).toLocaleDateString())}
  🔄 *Updated*  ›  ${monospace(new Date(updated_at).toLocaleDateString())}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
> ✨ _${botFooter}_`;
    const _0xacd622 = Date.now();
    await sendButtons(Gifted, from, {
      title: "",
      _0x8d8434: _0x7db7c4,
      footer: `> *${botFooter}*`,
      image: { url: botPic },
      buttons: [
        {
          name: "\x63\x74\x61\x5f\x63\x6f\x70\x79",
          buttonParamsJson: JSON.stringify({
            display_text: "\x43\x6f\x70\x79\x20\x4c\x69\x6e\x6b",
            copy_code: `https:
          }),
        },
        {
          name: "\x63\x74\x61\x5f\x75\x72\x6c",
          buttonParamsJson: JSON.stringify({
            display_text: "\x56\x69\x73\x69\x74\x20\x52\x65\x70\x6f",
            url: `https:
          }),
        },
        {
          id: `repo_dl_${_0xacd622}`,
          _0x8d8434: "📥\x20\x44\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x5a\x69\x70",
        },
      ],
    });
    const _0x4f855d = async (event) => {
      const _0x42b18a = event.messages[0];
      if (!_0x42b18a?.message) return;
      const _0x644d07 =
        _0x42b18a.message?.templateButtonReplyMessage;
      if (!_0x644d07) return;
      const _0xfcccaf = _0x644d07.selectedId;
      if (!_0xfcccaf?.includes(`repo_dl_${_0xacd622}`)) return;
      const _0x0e59e5 = _0x42b18a.key?.remoteJid === from;
      if (!_0x0e59e5) return;
      try {
        const _0x07e9fa = `https:
        await Gifted.sendMessage(
          from,
          {
            document: { url: _0x07e9fa },
            fileName: `${name}.zip`,
            mimetype: "\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e\x2f\x7a\x69\x70",
          },
          { quoted: _0x42b18a },
        );
        await react("✅");
      } catch (dlErr) {
        await Gifted.sendMessage(from, { _0x8d8434: "\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x72\x65\x70\x6f\x20\x7a\x69\x70\x3a\x20" + dlErr.message }, { quoted: _0x42b18a });
      }
      Gifted.ev.off("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x4f855d);
    };
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x4f855d);
    setTimeout(
      () => Gifted.ev.off("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x4f855d),
      0x1D4C0,
    );
    await react("✅");
  },
);
gmd(
  {
    pattern: "\x73\x61\x76\x65",
    aliases: ["sv", "s", "\x73\x61\x76", "."],
    react: "⚡",
    category: "\x6f\x77\x6e\x65\x72",
    description:
      "\x53\x61\x76\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x73\x20\x28\x73\x75\x70\x70\x6f\x72\x74\x73\x20\x69\x6d\x61\x67\x65\x73\x2c\x20\x76\x69\x64\x65\x6f\x73\x2c\x20\x61\x75\x64\x69\x6f\x2c\x20\x73\x74\x69\x63\x6b\x65\x72\x73\x2c\x20\x61\x6e\x64\x20\x74\x65\x78\x74\x29\x2e",
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, sender, isSuperUser, getMediaBuffer } = conText;
    if (!isSuperUser) {
      return reply(`❌ Owner Only Command!`);
    }
    const _0x2e0170 =
      mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!_0x2e0170) {
      return reply(`⚠️ Please reply to/quote a message.`);
    }
    try {
      let mediaData;
      if (_0x2e0170.imageMessage) {
        const _0xd1e79d = await getMediaBuffer(_0x2e0170.imageMessage, "\x69\x6d\x61\x67\x65");
        mediaData = {
          image: _0xd1e79d,
          caption: _0x2e0170.imageMessage.caption || "",
        };
      } else if (_0x2e0170.videoMessage) {
        const _0xd1e79d = await getMediaBuffer(_0x2e0170.videoMessage, "\x76\x69\x64\x65\x6f");
        mediaData = {
          video: _0xd1e79d,
          caption: _0x2e0170.videoMessage.caption || "",
        };
      } else if (_0x2e0170.audioMessage) {
        const _0xd1e79d = await getMediaBuffer(_0x2e0170.audioMessage, "\x61\x75\x64\x69\x6f");
        mediaData = {
          audio: _0xd1e79d,
          mimetype: "\x61\x75\x64\x69\x6f\x2f\x6d\x70\x34",
        };
      } else if (_0x2e0170.stickerMessage) {
        const _0xd1e79d = await getMediaBuffer(
          _0x2e0170.stickerMessage,
          "\x73\x74\x69\x63\x6b\x65\x72",
        );
        mediaData = {
          sticker: _0xd1e79d,
        };
      } else if (_0x2e0170.documentMessage || _0x2e0170.documentWithCaptionMessage?.message?.documentMessage) {
        const _0x4c4b33 = _0x2e0170.documentMessage || _0x2e0170.documentWithCaptionMessage.message.documentMessage;
        const _0xd1e79d = await getMediaBuffer(_0x4c4b33, "\x64\x6f\x63\x75\x6d\x65\x6e\x74");
        mediaData = {
          document: _0xd1e79d,
          fileName: _0x4c4b33.fileName || "\x64\x6f\x63\x75\x6d\x65\x6e\x74",
          mimetype: _0x4c4b33.mimetype || "\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e\x2f\x6f\x63\x74\x65\x74\x2d\x73\x74\x72\x65\x61\x6d",
        };
      } else if (
        _0x2e0170.conversation ||
        _0x2e0170.extendedTextMessage?.text
      ) {
        const _0x8d8434 =
          _0x2e0170.conversation || _0x2e0170.extendedTextMessage.text;
        mediaData = {
          _0x8d8434: _0x8d8434,
        };
      } else if (_0x2e0170.buttonsMessage || _0x2e0170.templateMessage || _0x2e0170.interactiveMessage || _0x2e0170.listMessage || _0x2e0170.buttonsResponseMessage || _0x2e0170.templateButtonReplyMessage) {
        let _0x8d8434 = "";
        if (_0x2e0170.buttonsMessage) {
          _0x8d8434 = _0x2e0170.buttonsMessage.contentText || _0x2e0170.buttonsMessage.text || "";
        } else if (_0x2e0170.templateMessage?.hydratedTemplate) {
          _0x8d8434 = _0x2e0170.templateMessage.hydratedTemplate.hydratedContentText || "";
        } else if (_0x2e0170.interactiveMessage?.body?.text) {
          _0x8d8434 = _0x2e0170.interactiveMessage.body.text;
        } else if (_0x2e0170.listMessage) {
          _0x8d8434 = _0x2e0170.listMessage.description || _0x2e0170.listMessage.title || "";
        } else if (_0x2e0170.buttonsResponseMessage) {
          _0x8d8434 = _0x2e0170.buttonsResponseMessage.selectedDisplayText || "";
        } else if (_0x2e0170.templateButtonReplyMessage) {
          _0x8d8434 = _0x2e0170.templateButtonReplyMessage.selectedDisplayText || "";
        }
        if (!_0x8d8434) {
          return reply(`❌ Could not extract _0x8d8434 from the quoted message.`);
        }
        mediaData = {
          _0x8d8434: _0x8d8434,
        };
      } else {
        return reply(`❌ Unsupported message type.`);
      }
      await Gifted.sendMessage(sender, mediaData, { quoted: mek });
      await react("✅");
    } catch (error) {
      console.error("\x53\x61\x76\x65\x20\x45\x72\x72\x6f\x72\x3a", error);
      await reply(`❌ Failed to save the message. Error: ${error.message}`);
    }
  },
);
gmd(
  {
    pattern: "\x63\x68\x6a\x69\x64",
    aliases: [
      "\x63\x68\x61\x6e\x6e\x65\x6c\x6a\x69\x64",
      "\x63\x68\x69\x6e\x66\x6f",
      "\x63\x68\x61\x6e\x6e\x65\x6c\x69\x6e\x66\x6f",
      "\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x6a\x69\x64",
      "\x6e\x65\x77\x73\x6a\x69\x64",
      "\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x69\x6e\x66\x6f",
    ],
    react: "📢",
    category: "\x67\x65\x6e\x65\x72\x61\x6c",
    description: "\x47\x65\x74\x20\x57\x68\x61\x74\x73\x41\x70\x70\x20\x43\x68\x61\x6e\x6e\x65\x6c\x2f\x4e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x20\x49\x6e\x66\x6f",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, botFooter, botPrefix, GiftedTechApi, GiftedApiKey } = conText;
    const _0x1a3005 = q?.trim();
    if (!_0x1a3005) {
      await react("❌");
      return reply(
        `❌ Provide a channel link.\nUsage: *${botPrefix}chjid* https:
      );
    }
    const _0x06bb15 = _0x1a3005.match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i);
    if (!_0x06bb15) {
      await react("❌");
      return reply(
        "❌\x20\x49\x6e\x76\x61\x6c\x69\x64\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x6c\x69\x6e\x6b\x2e\x20\x50\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x76\x61\x6c\x69\x64\x20\x57\x68\x61\x74\x73\x41\x70\x70\x20\x63\x68\x61\x6e\x6e\x65\x6c\x20\x6c\x69\x6e\x6b\x2e\x5c\x6e\x45\x78\x61\x6d\x70\x6c\x65\x3a\x20\x68\x74\x74\x70\x73\x3a
\x20\x20\x20\x20\x20\x20\x29\x3b
\x20\x20\x20\x20\x7d
\x20\x20\x20\x20\x61\x77\x61\x69\x74\x20\x72\x65\x61\x63\x74\x28"🔍"\x29\x3b
\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x69\x6e\x76\x69\x74\x65\x4b\x65\x79\x20\x3d\x20\x63\x68\x61\x6e\x6e\x65\x6c\x4d\x61\x74\x63\x68\x5b\x31\x5d\x3b
\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x63\x68\x61\x6e\x6e\x65\x6c\x55\x72\x6c\x20\x3d\x20\x60\x68\x74\x74\x70\x73\x3a
\x20\x20\x20\x20\x74\x72\x79\x20\x7b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x6d\x65\x74\x61\x20\x3d\x20\x61\x77\x61\x69\x74\x20\x47\x69\x66\x74\x65\x64\x2e\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x4d\x65\x74\x61\x64\x61\x74\x61\x28"invite"\x2c\x20\x69\x6e\x76\x69\x74\x65\x4b\x65\x79\x29\x3b
\x20\x20\x20\x20\x20\x20\x69\x66\x20\x28\x21\x6d\x65\x74\x61\x20\x7c\x7c\x20\x21\x6d\x65\x74\x61\x2e\x69\x64\x29\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x61\x77\x61\x69\x74\x20\x72\x65\x61\x63\x74\x28"❌"\x29\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x72\x65\x74\x75\x72\x6e\x20\x72\x65\x70\x6c\x79\x28
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20"❌ Could not fetch channel info. The link may be invalid or the channel no longer exists."\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x29\x3b
\x20\x20\x20\x20\x20\x20\x7d
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x63\x68\x61\x6e\x6e\x65\x6c\x4a\x69\x64\x20\x3d\x20\x6d\x65\x74\x61\x2e\x69\x64\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x74\x6d\x20\x3d\x20\x6d\x65\x74\x61\x2e\x74\x68\x72\x65\x61\x64\x5f\x6d\x65\x74\x61\x64\x61\x74\x61\x20\x7c\x7c\x20\x7b\x7d\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x6e\x61\x6d\x65\x20\x3d\x20\x74\x6d\x2e\x6e\x61\x6d\x65\x3f\x2e\x74\x65\x78\x74\x20\x7c\x7c\x20"Unknown Channel"\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x72\x61\x77\x44\x65\x73\x63\x20\x3d\x20\x74\x6d\x2e\x64\x65\x73\x63\x72\x69\x70\x74\x69\x6f\x6e\x3f\x2e\x74\x65\x78\x74\x20\x7c\x7c\x20""\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x76\x65\x72\x69\x66\x69\x63\x61\x74\x69\x6f\x6e\x20\x3d\x20\x74\x6d\x2e\x76\x65\x72\x69\x66\x69\x63\x61\x74\x69\x6f\x6e\x20\x7c\x7c\x20""\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x69\x73\x56\x65\x72\x69\x66\x69\x65\x64\x20\x3d\x20\x76\x65\x72\x69\x66\x69\x63\x61\x74\x69\x6f\x6e\x20\x3d\x3d\x3d\x20"VERIFIED"\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x73\x74\x61\x74\x65\x54\x79\x70\x65\x20\x3d\x20\x6d\x65\x74\x61\x2e\x73\x74\x61\x74\x65\x3f\x2e\x74\x79\x70\x65\x20\x7c\x7c\x20""\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x69\x73\x41\x63\x74\x69\x76\x65\x20\x3d\x20\x73\x74\x61\x74\x65\x54\x79\x70\x65\x20\x3d\x3d\x3d\x20"ACTIVE"\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x73\x75\x62\x43\x6f\x75\x6e\x74\x20\x3d\x20\x70\x61\x72\x73\x65\x49\x6e\x74\x28\x74\x6d\x2e\x73\x75\x62\x73\x63\x72\x69\x62\x65\x72\x73\x5f\x63\x6f\x75\x6e\x74\x20\x7c\x7c\x20"0"\x2c\x20\x31\x30\x29\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x66\x6f\x6c\x6c\x6f\x77\x65\x72\x73\x20\x3d
\x20\x20\x20\x20\x20\x20\x20\x20\x73\x75\x62\x43\x6f\x75\x6e\x74\x20\x3e\x3d\x20\x31\x5f\x30\x30\x30\x5f\x30\x30\x30
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3f\x20\x60\x24\x7b\x28\x73\x75\x62\x43\x6f\x75\x6e\x74\x20\x2f\x20\x31\x5f\x30\x30\x30\x5f\x30\x30\x30\x29\x2e\x74\x6f\x46\x69\x78\x65\x64\x28\x31\x29\x7d\x4d\x60
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3a\x20\x73\x75\x62\x43\x6f\x75\x6e\x74\x20\x3e\x3d\x20\x31\x5f\x30\x30\x30
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3f\x20\x60\x24\x7b\x28\x73\x75\x62\x43\x6f\x75\x6e\x74\x20\x2f\x20\x31\x5f\x30\x30\x30\x29\x2e\x74\x6f\x46\x69\x78\x65\x64\x28\x31\x29\x7d\x4b\x60
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3a\x20\x73\x75\x62\x43\x6f\x75\x6e\x74\x20\x3e\x20\x30
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3f\x20\x73\x75\x62\x43\x6f\x75\x6e\x74\x2e\x74\x6f\x4c\x6f\x63\x61\x6c\x65\x53\x74\x72\x69\x6e\x67\x28\x29
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3a\x20"N/A"\x3b
\x20\x20\x20\x20\x20\x20\x6c\x65\x74\x20\x70\x69\x63\x55\x72\x6c\x20\x3d\x20\x6e\x75\x6c\x6c\x3b
\x20\x20\x20\x20\x20\x20\x74\x72\x79\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x61\x70\x69\x55\x72\x6c\x20\x3d\x20\x60\x5c\x28\x20\x7b\x47\x69\x66\x74\x65\x64\x54\x65\x63\x68\x41\x70\x69\x7d\x2f\x61\x70\x69\x2f\x73\x74\x61\x6c\x6b\x2f\x77\x61\x63\x68\x61\x6e\x6e\x65\x6c\x3f\x61\x70\x69\x6b\x65\x79\x3d\x20\x5c\x29\x7b\x47\x69\x66\x74\x65\x64\x41\x70\x69\x4b\x65\x79\x7d\x26\x75\x72\x6c\x3d\x24\x7b\x65\x6e\x63\x6f\x64\x65\x55\x52\x49\x43\x6f\x6d\x70\x6f\x6e\x65\x6e\x74\x28\x63\x68\x61\x6e\x6e\x65\x6c\x55\x72\x6c\x29\x7d\x60\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x61\x70\x69\x52\x65\x73\x20\x3d\x20\x61\x77\x61\x69\x74\x20\x61\x78\x69\x6f\x73\x2e\x67\x65\x74\x28\x61\x70\x69\x55\x72\x6c\x2c\x20\x7b\x20\x74\x69\x6d\x65\x6f\x75\x74\x3a\x20\x31\x30\x30\x30\x30\x20\x7d\x29\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x70\x69\x63\x55\x72\x6c\x20\x3d\x20\x61\x70\x69\x52\x65\x73\x2e\x64\x61\x74\x61\x3f\x2e\x72\x65\x73\x75\x6c\x74\x3f\x2e\x69\x6d\x67\x20\x7c\x7c\x20\x6e\x75\x6c\x6c\x3b
\x20\x20\x20\x20\x20\x20\x7d\x20\x63\x61\x74\x63\x68\x20\x28\x61\x70\x69\x45\x72\x72\x29\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x6f\x6c\x65\x2e\x65\x72\x72\x6f\x72\x28"chjid pic error:"\x2c\x20\x61\x70\x69\x45\x72\x72\x2e\x6d\x65\x73\x73\x61\x67\x65\x29\x3b
\x20\x20\x20\x20\x20\x20\x7d
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x4d\x41\x58\x5f\x44\x45\x53\x43\x20\x3d\x20\x32\x30\x30\x3b
\x20\x20\x20\x20\x20\x20\x6c\x65\x74\x20\x64\x65\x73\x63\x53\x65\x63\x74\x69\x6f\x6e\x20\x3d\x20""\x3b
\x20\x20\x20\x20\x20\x20\x69\x66\x20\x28\x72\x61\x77\x44\x65\x73\x63\x29\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x74\x72\x69\x6d\x6d\x65\x64\x20\x3d\x20\x72\x61\x77\x44\x65\x73\x63\x2e\x74\x72\x69\x6d\x28\x29\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x69\x66\x20\x28\x74\x72\x69\x6d\x6d\x65\x64\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3e\x20\x4d\x41\x58\x5f\x44\x45\x53\x43\x29\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x76\x69\x73\x69\x62\x6c\x65\x20\x3d\x20\x74\x72\x69\x6d\x6d\x65\x64\x2e\x73\x6c\x69\x63\x65\x28\x30\x2c\x20\x4d\x41\x58\x5f\x44\x45\x53\x43\x29\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x68\x69\x64\x64\x65\x6e\x20\x3d\x20\x74\x72\x69\x6d\x6d\x65\x64\x2e\x73\x6c\x69\x63\x65\x28\x4d\x41\x58\x5f\x44\x45\x53\x43\x29\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x64\x65\x73\x63\x53\x65\x63\x74\x69\x6f\x6e\x20\x3d\x20\x60\x5c\x6e\x5c\x6e📄\x20\x2a\x44\x65\x73\x63\x72\x69\x70\x74\x69\x6f\x6e\x3a\x2a\x5c\x6e\x24\x7b\x76\x69\x73\x69\x62\x6c\x65\x7d\x24\x7b\x72\x65\x61\x64\x6d\x6f\x72\x65\x7d\x24\x7b\x68\x69\x64\x64\x65\x6e\x7d\x60\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x7d\x20\x65\x6c\x73\x65\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x64\x65\x73\x63\x53\x65\x63\x74\x69\x6f\x6e\x20\x3d\x20\x60\x5c\x6e\x5c\x6e📄\x20\x2a\x44\x65\x73\x63\x72\x69\x70\x74\x69\x6f\x6e\x3a\x2a\x5c\x6e\x24\x7b\x74\x72\x69\x6d\x6d\x65\x64\x7d\x60\x3b
\x20\x20\x20\x20\x20\x20\x20\x20\x7d
\x20\x20\x20\x20\x20\x20\x7d
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x74\x65\x78\x74\x20\x3d
\x20\x20\x20\x20\x20\x20\x20\x20\x60📢\x20\x2a\x43\x68\x61\x6e\x6e\x65\x6c\x20\x49\x6e\x66\x6f\x2a\x5c\x6e\x5c\x6e\x60\x20\x2b
\x20\x20\x20\x20\x20\x20\x20\x20\x60🔖\x20\x2a\x4e\x61\x6d\x65\x3a\x2a\x20\x24\x7b\x6e\x61\x6d\x65\x7d\x5c\x6e\x60\x20\x2b
\x20\x20\x20\x20\x20\x20\x20\x20\x60🟢\x20\x2a\x53\x74\x61\x74\x75\x73\x3a\x2a\x20\x24\x7b\x69\x73\x41\x63\x74\x69\x76\x65\x20\x3f\x20"Active"\x20\x3a\x20\x73\x74\x61\x74\x65\x54\x79\x70\x65\x20\x7c\x7c\x20"Unknown"\x7d\x5c\x6e\x60\x20\x2b
\x20\x20\x20\x20\x20\x20\x20\x20\x60\x24\x7b\x69\x73\x56\x65\x72\x69\x66\x69\x65\x64\x20\x3f\x20"✅ *Verified:* Yes\n"\x20\x3a\x20"❌ *Verified:* No\n"\x7d\x60\x20\x2b
\x20\x20\x20\x20\x20\x20\x20\x20\x60👥\x20\x2a\x46\x6f\x6c\x6c\x6f\x77\x65\x72\x73\x3a\x2a\x20\x24\x7b\x66\x6f\x6c\x6c\x6f\x77\x65\x72\x73\x7d\x5c\x6e\x60\x20\x2b
\x20\x20\x20\x20\x20\x20\x20\x20\x60🆔\x20\x2a\x4a\x49\x44\x3a\x2a\x20\x5c\x60\x24\x7b\x63\x68\x61\x6e\x6e\x65\x6c\x4a\x69\x64\x7d\x5c\x60\x60\x20\x2b
\x20\x20\x20\x20\x20\x20\x20\x20\x64\x65\x73\x63\x53\x65\x63\x74\x69\x6f\x6e\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x62\x75\x74\x74\x6f\x6e\x73\x20\x3d\x20\x5b
\x20\x20\x20\x20\x20\x20\x20\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x6e\x61\x6d\x65\x3a\x20"cta_copy"\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x62\x75\x74\x74\x6f\x6e\x50\x61\x72\x61\x6d\x73\x4a\x73\x6f\x6e\x3a\x20\x4a\x53\x4f\x4e\x2e\x73\x74\x72\x69\x6e\x67\x69\x66\x79\x28\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x64\x69\x73\x70\x6c\x61\x79\x5f\x74\x65\x78\x74\x3a\x20"📋 Copy JID"\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x70\x79\x5f\x63\x6f\x64\x65\x3a\x20\x63\x68\x61\x6e\x6e\x65\x6c\x4a\x69\x64\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x7d\x29\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x7d\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x6e\x61\x6d\x65\x3a\x20"cta_url"\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x62\x75\x74\x74\x6f\x6e\x50\x61\x72\x61\x6d\x73\x4a\x73\x6f\x6e\x3a\x20\x4a\x53\x4f\x4e\x2e\x73\x74\x72\x69\x6e\x67\x69\x66\x79\x28\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x64\x69\x73\x70\x6c\x61\x79\x5f\x74\x65\x78\x74\x3a\x20"➕ Follow Channel"\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x75\x72\x6c\x3a\x20\x63\x68\x61\x6e\x6e\x65\x6c\x55\x72\x6c\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x6d\x65\x72\x63\x68\x61\x6e\x74\x5f\x75\x72\x6c\x3a\x20\x63\x68\x61\x6e\x6e\x65\x6c\x55\x72\x6c\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x7d\x29\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x7d\x2c
\x20\x20\x20\x20\x20\x20\x5d\x3b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x73\x65\x6e\x64\x4f\x70\x74\x73\x20\x3d\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x74\x65\x78\x74\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x66\x6f\x6f\x74\x65\x72\x3a\x20\x62\x6f\x74\x46\x6f\x6f\x74\x65\x72\x2c
\x20\x20\x20\x20\x20\x20\x20\x20\x62\x75\x74\x74\x6f\x6e\x73\x2c
\x20\x20\x20\x20\x20\x20\x7d\x3b
\x20\x20\x20\x20\x20\x20\x69\x66\x20\x28\x70\x69\x63\x55\x72\x6c\x29\x20\x7b
\x20\x20\x20\x20\x20\x20\x20\x20\x73\x65\x6e\x64\x4f\x70\x74\x73\x2e\x69\x6d\x61\x67\x65\x20\x3d\x20\x7b\x20\x75\x72\x6c\x3a\x20\x70\x69\x63\x55\x72\x6c\x20\x7d\x3b
\x20\x20\x20\x20\x20\x20\x7d
\x20\x20\x20\x20\x20\x20\x61\x77\x61\x69\x74\x20\x73\x65\x6e\x64\x42\x75\x74\x74\x6f\x6e\x73\x28\x47\x69\x66\x74\x65\x64\x2c\x20\x66\x72\x6f\x6d\x2c\x20\x73\x65\x6e\x64\x4f\x70\x74\x73\x29\x3b
\x20\x20\x20\x20\x20\x20\x61\x77\x61\x69\x74\x20\x72\x65\x61\x63\x74\x28"✅"\x29\x3b
\x20\x20\x20\x20\x7d\x20\x63\x61\x74\x63\x68\x20\x28\x65\x72\x72\x6f\x72\x29\x20\x7b
\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x6f\x6c\x65\x2e\x65\x72\x72\x6f\x72\x28"chjid error:"\x2c\x20\x65\x72\x72\x6f\x72\x29\x3b
\x20\x20\x20\x20\x20\x20\x61\x77\x61\x69\x74\x20\x72\x65\x61\x63\x74\x28"❌");
      await reply(`❌ Error fetching channel info: ${error.message}`);
    }
  },
);
