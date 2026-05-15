var _0x5fb42f=(function(_0x10f600,_0xb91c69){return !![]}());var _0xeaddd6=function(){return ![]};
const { gmd } = require("../guru"),
  axios = require("axios"),
  {
    generateWAMessageContent,
    generateWAMessageFromContent,
  } = require("@whiskeysockets/baileys"),
  { sendButtons } = require("gifted-btns");
function extractButtonId(msg) {
    if (!msg) return null;
    if (msg.templateButtonReplyMessage?.selectedId)
        return msg.templateButtonReplyMessage.selectedId;
    if (msg.buttonsResponseMessage?.selectedButtonId)
        return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
        return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.interactiveResponseMessage) {
        const nf = msg.interactiveResponseMessage.nativeFlowResponseMessage;
        if (nf?.paramsJson) {
            try { const p = JSON.parse(nf.paramsJson); if (p.id) return p.id; } catch {}
        }
        return msg.interactiveResponseMessage.buttonId || null;
    }
    return null;
}
gmd(
  {
    pattern: "\x67\x67\x6c\x65\x69\x6d\x61\x67\x65",
    aliases: ["\x67\x6f\x6f\x67\x6c\x65\x69\x6d\x61\x67\x65", "\x67\x69\x6d\x61\x67\x65", "\x67\x67\x6c\x65\x69\x6d\x61\x67\x65\x73\x65\x61\x72\x63\x68", "\x67\x6f\x6f\x67\x6c\x65\x69\x6d\x61\x67\x65\x73\x65\x61\x72\x63\x68"],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "🖼️",
    description: "\x53\x65\x61\x72\x63\x68\x20\x47\x6f\x6f\x67\x6c\x65\x20\x49\x6d\x61\x67\x65\x73\x20\x61\x6e\x64\x20\x73\x65\x6e\x64\x20\x66\x69\x72\x73\x74\x20\x31\x30\x20\x69\x6d\x61\x67\x65\x73",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x65\x61\x72\x63\x68\x20\x71\x75\x65\x72\x79\x20\x66\x6f\x72\x20\x69\x6d\x61\x67\x65\x73");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/googleimage?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (
        !_0x2e3eb1.data?.success ||
        !_0x2e3eb1.data?.results ||
        _0x2e3eb1.data.results.length === 0
      ) {
        await react("❌");
        return reply("\x4e\x6f\x20\x69\x6d\x61\x67\x65\x73\x20\x66\x6f\x75\x6e\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x20\x64\x69\x66\x66\x65\x72\x65\x6e\x74\x20\x71\x75\x65\x72\x79\x2e");
      }
      const _0x8ec011 = _0x2e3eb1.data.results.slice(0, 0xA);
      await reply(`Found ${_0x8ec011.length} _0x8ec011 for: *${q}*\nSending...`);
      for (let i = 0; i < _0x8ec011.length; i++) {
        try {
          await Gifted.sendMessage(
            from,
            {
              image: { url: _0x8ec011[i] },
              caption: `🖼️ Image ${i + 1}/${_0x8ec011.length}\n\n> *${botFooter}*`,
            },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 0x1F4));
        } catch (imgErr) {
          console.error("\x45\x72\x72\x6f\x72\x20\x73\x65\x6e\x64\x69\x6e\x67\x20\x69\x6d\x61\x67\x65\x3a", imgErr.message);
        }
      }
      await react("✅");
    } catch (error) {
      console.error("\x47\x6f\x6f\x67\x6c\x65\x20\x69\x6d\x61\x67\x65\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68\x20\x69\x6d\x61\x67\x65\x73\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
gmd(
  {
    pattern: "\x75\x6e\x73\x70\x6c\x61\x73\x68",
    aliases: ["\x75\x6e\x73\x70\x6c\x61\x73\x68\x70\x68\x6f\x74\x6f\x73", "\x75\x6e\x73\x70\x6c\x61\x73\x68\x73\x65\x61\x72\x63\x68"],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "📷",
    description: "\x53\x65\x61\x72\x63\x68\x20\x55\x6e\x73\x70\x6c\x61\x73\x68\x20\x61\x6e\x64\x20\x73\x65\x6e\x64\x20\x66\x69\x72\x73\x74\x20\x31\x30\x20\x70\x68\x6f\x74\x6f\x73",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x65\x61\x72\x63\x68\x20\x71\x75\x65\x72\x79\x20\x66\x6f\x72\x20\x70\x68\x6f\x74\x6f\x73");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/unsplash?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (
        !_0x2e3eb1.data?.success ||
        !_0x2e3eb1.data?.results ||
        _0x2e3eb1.data.results.length === 0
      ) {
        await react("❌");
        return reply("\x4e\x6f\x20\x70\x68\x6f\x74\x6f\x73\x20\x66\x6f\x75\x6e\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x20\x64\x69\x66\x66\x65\x72\x65\x6e\x74\x20\x71\x75\x65\x72\x79\x2e");
      }
      const _0x4050e6 = _0x2e3eb1.data.results.slice(0, 0xA);
      await reply(
        `Found ${_0x4050e6.length} Unsplash _0x4050e6 for: *${q}*\nSending...`,
      );
      for (let i = 0; i < _0x4050e6.length; i++) {
        try {
          await Gifted.sendMessage(
            from,
            {
              image: { url: _0x4050e6[i] },
              caption: `📷 Unsplash Photo ${i + 1}/${_0x4050e6.length}\n\n> *${botFooter}*`,
            },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 0x1F4));
        } catch (imgErr) {
          console.error("\x45\x72\x72\x6f\x72\x20\x73\x65\x6e\x64\x69\x6e\x67\x20\x55\x6e\x73\x70\x6c\x61\x73\x68\x20\x70\x68\x6f\x74\x6f\x3a", imgErr.message);
        }
      }
      await react("✅");
    } catch (error) {
      console.error("\x55\x6e\x73\x70\x6c\x61\x73\x68\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68\x20\x55\x6e\x73\x70\x6c\x61\x73\x68\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
gmd(
  {
    pattern: "\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73",
    aliases: [
      "\x77\x61\x6c\x6c\x70\x61\x70\x65\x72",
      "\x68\x64\x77\x61\x6c\x6c\x70\x61\x70\x65\x72",
      "\x68\x64\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73",
      "\x67\x65\x74\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73",
      "\x72\x61\x6e\x64\x6f\x6d\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73",
    ],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "🖼️",
    description: "\x53\x65\x61\x72\x63\x68\x20\x48\x44\x20\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73\x20\x62\x79\x20\x63\x61\x74\x65\x67\x6f\x72\x79",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x20\x63\x61\x74\x65\x67\x6f\x72\x79\x20\x6f\x72\x20\x73\x65\x61\x72\x63\x68\x20\x71\x75\x65\x72\x79");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/wallpaper?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (
        !_0x2e3eb1.data?.success ||
        !_0x2e3eb1.data?.results ||
        _0x2e3eb1.data.results.length === 0
      ) {
        await react("❌");
        return reply("\x4e\x6f\x20\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73\x20\x66\x6f\x75\x6e\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x20\x64\x69\x66\x66\x65\x72\x65\x6e\x74\x20\x71\x75\x65\x72\x79\x2e");
      }
      const _0xc12a2b = _0x2e3eb1.data.results.slice(0, 0xA);
      await reply(
        `Found ${_0xc12a2b.length} _0xc12a2b for: *${q}*\nSending...`,
      );
      for (let i = 0; i < _0xc12a2b.length; i++) {
        try {
          const wp = _0xc12a2b[i];
          const _0x42c636 = Array.isArray(wp.image) ? wp.image[0] : wp.image;
          await Gifted.sendMessage(
            from,
            {
              image: { url: _0x42c636 },
              caption: `🖼️ *Wallpaper ${i + 1}/${_0xc12a2b.length}*\n📂 Category: ${wp.type || "\x55\x6e\x6b\x6e\x6f\x77\x6e"}\n\n> *${botFooter}*`,
            },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 0x1F4));
        } catch (wpErr) {
          console.error("\x45\x72\x72\x6f\x72\x20\x73\x65\x6e\x64\x69\x6e\x67\x20\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x3a", wpErr.message);
        }
      }
      await react("✅");
    } catch (error) {
      console.error("\x57\x61\x6c\x6c\x70\x61\x70\x65\x72\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68\x20\x77\x61\x6c\x6c\x70\x61\x70\x65\x72\x73\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
gmd(
  {
    pattern: "\x77\x65\x61\x74\x68\x65\x72",
    aliases: ["\x67\x65\x74\x77\x65\x61\x74\x68\x65\x72", "\x63\x6c\x69\x6d\x61"],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "🌤️",
    description: "\x47\x65\x74\x20\x77\x65\x61\x74\x68\x65\x72\x20\x69\x6e\x66\x6f\x72\x6d\x61\x74\x69\x6f\x6e\x20\x66\x6f\x72\x20\x61\x20\x6c\x6f\x63\x61\x74\x69\x6f\x6e",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      GiftedTechApi,
      GiftedApiKey,
    } = conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x6c\x6f\x63\x61\x74\x69\x6f\x6e\x20\x6e\x61\x6d\x65");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/weather?apikey=${GiftedApiKey}&location=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (!_0x2e3eb1.data?.success || !_0x2e3eb1.data?.result) {
        await react("❌");
        return reply(
          "\x43\x6f\x75\x6c\x64\x20\x6e\x6f\x74\x20\x67\x65\x74\x20\x77\x65\x61\x74\x68\x65\x72\x20\x66\x6f\x72\x20\x74\x68\x61\x74\x20\x6c\x6f\x63\x61\x74\x69\x6f\x6e\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x20\x64\x69\x66\x66\x65\x72\x65\x6e\x74\x20\x6c\x6f\x63\x61\x74\x69\x6f\x6e\x2e",
        );
      }
      const w = _0x2e3eb1.data.result;
      const _0x6372a4 = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Drizzle: "🌦️",
        Thunderstorm: "⛈️",
        Snow: "❄️",
        Mist: "🌫️",
        Fog: "🌫️",
        Haze: "🌫️",
      };
      const _0x646be5 = _0x6372a4[w.weather?.main] || "🌡️";
      let _0x5225b2 = `*${botName} 𝐖𝐄𝐀𝐓𝐇𝐄𝐑*\n\n`;
      _0x5225b2 += `${_0x646be5} *Location:* ${w.location}, ${w.sys?.country || ""}\n\n`;
      _0x5225b2 += `🌡️ *Temperature:* ${w.main?.temp}°C\n`;
      _0x5225b2 += `🤒 *Feels Like:* ${w.main?.feels_like}°C\n`;
      _0x5225b2 += `📉 *Min Temp:* ${w.main?.temp_min}°C\n`;
      _0x5225b2 += `📈 *Max Temp:* ${w.main?.temp_max}°C\n\n`;
      _0x5225b2 += `☁️ *Weather:* ${w.weather?.main} (${w.weather?.description})\n`;
      _0x5225b2 += `💧 *Humidity:* ${w.main?.humidity}%\n`;
      _0x5225b2 += `🌬️ *Wind Speed:* ${w.wind?.speed} m/s\n`;
      _0x5225b2 += `👁️ *Visibility:* ${w.visibility / 0x3E8} km\n`;
      _0x5225b2 += `🔘 *Pressure:* ${w.main?.pressure} hPa\n\n`;
      _0x5225b2 += `> *${botFooter}*`;
      await reply(_0x5225b2);
      await react("✅");
    } catch (error) {
      console.error("\x57\x65\x61\x74\x68\x65\x72\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x67\x65\x74\x20\x77\x65\x61\x74\x68\x65\x72\x20\x64\x61\x74\x61\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
gmd(
  {
    pattern: "\x6e\x70\x6d",
    aliases: ["\x6e\x70\x6d\x73\x65\x61\x72\x63\x68", "\x6e\x70\x6d\x70\x61\x63\x6b", "\x6e\x70\x6d\x70\x61\x63\x6b\x61\x67\x65"],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "📦",
    description: "\x53\x65\x61\x72\x63\x68\x20\x4e\x50\x4d\x20\x70\x61\x63\x6b\x61\x67\x65\x73",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      GiftedTechApi,
      GiftedApiKey,
    } = conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x70\x61\x63\x6b\x61\x67\x65\x20\x6e\x61\x6d\x65");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/npmsearch?apikey=${GiftedApiKey}&packagename=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (!_0x2e3eb1.data?.success || !_0x2e3eb1.data?.result) {
        await react("❌");
        return reply("\x50\x61\x63\x6b\x61\x67\x65\x20\x6e\x6f\x74\x20\x66\x6f\x75\x6e\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x63\x68\x65\x63\x6b\x20\x74\x68\x65\x20\x70\x61\x63\x6b\x61\x67\x65\x20\x6e\x61\x6d\x65\x2e");
      }
      const _0x6ca5ed = _0x2e3eb1.data.result;
      let _0x5225b2 = `*${botName} 𝐍𝐏𝐌 𝐏𝐀𝐂𝐊𝐀𝐆𝐄*\n\n`;
      _0x5225b2 += `📦 *Name:* ${_0x6ca5ed.name}\n`;
      _0x5225b2 += `📝 *Description:* ${_0x6ca5ed.description || "\x4e\x6f\x20\x64\x65\x73\x63\x72\x69\x70\x74\x69\x6f\x6e"}\n`;
      _0x5225b2 += `🏷️ *Version:* ${_0x6ca5ed.version}\n`;
      _0x5225b2 += `📜 *License:* ${_0x6ca5ed.license || "\x4e\x2f\x41"}\n`;
      _0x5225b2 += `👤 *Owner:* ${_0x6ca5ed.owner || "\x4e\x2f\x41"}\n`;
      _0x5225b2 += `📅 *Published:* ${_0x6ca5ed.publishedDate || "\x4e\x2f\x41"}\n`;
      _0x5225b2 += `📅 *Created:* ${_0x6ca5ed.createdDate || "\x4e\x2f\x41"}\n`;
      _0x5225b2 += `🔗 *Package:* ${_0x6ca5ed.packageLink}\n`;
      if (_0x6ca5ed.homepage) _0x5225b2 += `🏠 *Homepage:* ${_0x6ca5ed.homepage}\n`;
      _0x5225b2 += `\n> *${botFooter}*`;
      if (_0x6ca5ed.downloadLink) {
        const _0x119f64 = Date.now();
        await sendButtons(Gifted, from, {
          title: "",
          text: _0x5225b2,
          footer: botFooter,
          _0x06f814: [
            {
              id: `npm_dl_${_0x119f64}`,
              text: "📥\x20\x44\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x50\x61\x63\x6b\x61\x67\x65",
            },
          ],
        });
        const _0x2176b3 = async (event) => {
          const _0x7ec25d = event.messages[0];
          if (!_0x7ec25d?.message) return;
          const _0x9cf5c6 = extractButtonId(_0x7ec25d.message);
          if (!_0x9cf5c6) return;
          if (!_0x9cf5c6?.includes(`npm_dl_${_0x119f64}`)) return;
          const _0x86653a = _0x7ec25d.key?.remoteJid === from;
          if (!_0x86653a) return;
          try {
            await Gifted.sendMessage(
              from,
              {
                document: { url: _0x6ca5ed.downloadLink },
                fileName: `${_0x6ca5ed.name}-${_0x6ca5ed.version}.tgz`,
                mimetype: "\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e\x2f\x67\x7a\x69\x70",
              },
              { quoted: _0x7ec25d },
            );
            await react("✅");
          } catch (dlErr) {
            await reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x70\x61\x63\x6b\x61\x67\x65\x3a\x20" + dlErr.message);
          }
        };
        Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x2176b3);
        setTimeout(
          () => Gifted.ev.off("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x2176b3),
          0x493E0,
        );
      } else {
        await reply(_0x5225b2);
      }
      await react("✅");
    } catch (error) {
      console.error("\x4e\x50\x4d\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68\x20\x4e\x50\x4d\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
gmd(
  {
    pattern: "\x77\x61\x74\x74\x70\x61\x64",
    aliases: ["\x77\x61\x74\x74", "\x77\x61\x74\x74\x73\x65\x61\x72\x63\x68", "\x77\x61\x74\x74\x70\x61\x64\x73\x65\x61\x72\x63\x68"],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "📚",
    description: "\x53\x65\x61\x72\x63\x68\x20\x57\x61\x74\x74\x70\x61\x64\x20\x73\x74\x6f\x72\x69\x65\x73",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x65\x61\x72\x63\x68\x20\x71\x75\x65\x72\x79");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/wattpad?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (
        !_0x2e3eb1.data?.success ||
        !_0x2e3eb1.data?.results ||
        _0x2e3eb1.data.results.length === 0
      ) {
        await react("❌");
        return reply("\x4e\x6f\x20\x73\x74\x6f\x72\x69\x65\x73\x20\x66\x6f\x75\x6e\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x20\x64\x69\x66\x66\x65\x72\x65\x6e\x74\x20\x71\x75\x65\x72\x79\x2e");
      }
      const _0x620be0 = _0x2e3eb1.data.results.slice(0, 5);
      const _0xaca5f9 = await Promise.all(
        _0x620be0.map(async (story) => ({
          header: {
            title: `📚 *${story.tittle}*`,
            hasMediaAttachment: true,
            imageMessage: (
              await generateWAMessageContent(
                { image: { url: story.thumbnail } },
                {
                  upload: Gifted.waUploadToServer,
                },
              )
            ).imageMessage,
          },
          body: {
            text: `👁️ Reads: ${story.reads}\n❤️ Likes: ${story.likes}`,
          },
          footer: { text: `> *${botFooter}*` },
          nativeFlowMessage: {
            _0x06f814: [
              {
                name: "\x63\x74\x61\x5f\x75\x72\x6c",
                buttonParamsJson: JSON.stringify({
                  display_text: "\x52\x65\x61\x64\x20\x53\x74\x6f\x72\x79",
                  url: story.link,
                }),
              },
            ],
          },
        })),
      );
      const _0x4d5604 = generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            _0x4d5604: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: {
                body: { text: `📚 Wattpad Results for: *${q}*` },
                footer: {
                  text: `📂 Displaying first *${_0x620be0.length}* stories`,
                },
                carouselMessage: { _0xaca5f9 },
              },
            },
          },
        },
        { quoted: mek },
      );
      await Gifted.relayMessage(from, _0x4d5604.message, {
        messageId: _0x4d5604.key.id,
      });
      await react("✅");
    } catch (error) {
      console.error("\x57\x61\x74\x74\x70\x61\x64\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68\x20\x57\x61\x74\x74\x70\x61\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
gmd(
  {
    pattern: "\x73\x70\x6f\x74\x69\x66\x79\x73\x65\x61\x72\x63\x68",
    aliases: ["\x73\x70\x6f\x74\x69\x73\x65\x61\x72\x63\x68"],
    category: "\x73\x65\x61\x72\x63\x68",
    react: "🎵",
    description: "\x53\x65\x61\x72\x63\x68\x20\x53\x70\x6f\x74\x69\x66\x79\x20\x66\x6f\x72\x20\x74\x72\x61\x63\x6b\x73",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      botPrefix,
      GiftedTechApi,
      GiftedApiKey,
    } = conText;
    if (!q) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x6f\x6e\x67\x20\x6f\x72\x20\x61\x72\x74\x69\x73\x74\x20\x6e\x61\x6d\x65\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68");
    }
    try {
      const _0x1948de = `${GiftedTechApi}/api/search/spotifysearch?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const _0x2e3eb1 = await axios.get(_0x1948de, { timeout: 0xEA60 });
      if (
        !_0x2e3eb1.data?.success ||
        !_0x2e3eb1.data?.results ||
        !Array.isArray(_0x2e3eb1.data.results) ||
        _0x2e3eb1.data.results.length === 0
      ) {
        await react("❌");
        const _0xa01c47 =
          _0x2e3eb1.data?.results?.msg ||
          "\x4e\x6f\x20\x74\x72\x61\x63\x6b\x73\x20\x66\x6f\x75\x6e\x64\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x20\x64\x69\x66\x66\x65\x72\x65\x6e\x74\x20\x71\x75\x65\x72\x79\x2e";
        return reply(_0xa01c47);
      }
      const _0xa6c584 = _0x2e3eb1.data.results.slice(0, 5);
      const _0x119f64 = Date.now();
      let _0x5225b2 = `*${botName} 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐒𝐄𝐀𝐑𝐂𝐇*\n\n`;
      _0x5225b2 += `🔍 *Query:* ${q}\n\n`;
      _0xa6c584.forEach((track, i) => {
        _0x5225b2 += `*${i + 1}. ${track.title}*\n`;
        _0x5225b2 += `🎤 Artist: ${track.artist}\n`;
        _0x5225b2 += `⏱️ Duration: ${track.duration}\n\n`;
      });
      const _0x06f814 = _0xa6c584.map((track, i) => ({
        id: `${botPrefix}spotify ${track.url}`,
        text: `${i + 1}. ${track.title.substring(0, 0x1E)}`,
      }));
      await sendButtons(Gifted, from, {
        title: "",
        text: _0x5225b2,
        footer: botFooter,
        _0x06f814: _0x06f814,
      });
      const _0x2176b3 = async (event) => {
        const _0x7ec25d = event.messages[0];
        if (!_0x7ec25d?.message) return;
        const _0x9cf5c6 = extractButtonId(_0x7ec25d.message);
        if (!_0x9cf5c6) return;
        if (!_0x9cf5c6?.includes(`spotify_dl_${_0x119f64}`)) return;
        const _0x86653a = _0x7ec25d.key?.remoteJid === from;
        if (!_0x86653a) return;
        const _0xc8e632 = parseInt(_0x9cf5c6.split("_").pop());
        const _0x7173ff = _0xa6c584[_0xc8e632];
        if (_0x7173ff) {
          await Gifted.sendMessage(
            from,
            { text: `${botPrefix}spotify ${_0x7173ff.url}` },
            { quoted: _0x7ec25d },
          );
        }
      };
      Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x2176b3);
      setTimeout(
        () => Gifted.ev.off("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x2176b3),
        0x493E0,
      );
      await react("✅");
    } catch (error) {
      console.error("\x53\x70\x6f\x74\x69\x66\x79\x20\x73\x65\x61\x72\x63\x68\x20\x65\x72\x72\x6f\x72\x3a", error);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x61\x72\x63\x68\x20\x53\x70\x6f\x74\x69\x66\x79\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e");
    }
  },
);
