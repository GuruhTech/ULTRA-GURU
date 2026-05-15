var _0xc2535f=(function(_0x16820b,_0x2b8814){return !![]}());var _0x4d914b=function(){return ![]};
const { gmd } = require("../guru");
const axios = require("axios");
const { sendButtons } = require("gifted-btns");
gmd(
  {
    pattern: "\x62\x69\x62\x6c\x65",
    aliases: ["\x76\x65\x72\x73\x65", "\x62\x69\x62\x6c\x65\x76\x65\x72\x73\x65", "\x73\x63\x72\x69\x70\x74\x75\x72\x65"],
    react: "📖",
    category: "\x72\x65\x6c\x69\x67\x69\x6f\x6e",
    description: "\x47\x65\x74\x20\x42\x69\x62\x6c\x65\x20\x76\x65\x72\x73\x65\x73",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter, botName, GiftedTechApi, GiftedApiKey } =
      conText;
    const _0xf085af = q?.trim();
    if (!_0xf085af) {
      await react("❌");
      return reply(
        "\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x42\x69\x62\x6c\x65\x20\x76\x65\x72\x73\x65\x20\x72\x65\x66\x65\x72\x65\x6e\x63\x65\x5c\x6e\x5c\x6e\x55\x73\x61\x67\x65\x3a\x5c\x6e\x2e\x62\x69\x62\x6c\x65\x20\x4a\x6f\x68\x6e\x20\x33\x3a\x31\x36\x5c\x6e\x2e\x62\x69\x62\x6c\x65\x20\x4a\x6f\x68\x6e\x20\x33\x3a\x31\x36\x2d\x32\x30\x5c\x6e\x2e\x62\x69\x62\x6c\x65\x20\x4a\x6f\x68\x6e\x20\x33",
      );
    }
    await react("⏳");
    try {
      const _0x8fe9b1 = await axios.get(`${GiftedTechApi}/api/search/bible`, {
        params: { apikey: GiftedApiKey, _0xf085af: _0xf085af },
      });
      if (!_0x8fe9b1.data?.success || !_0x8fe9b1.data?.result) {
        await react("❌");
        return reply(
          "\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x66\x65\x74\x63\x68\x20\x42\x69\x62\x6c\x65\x20\x76\x65\x72\x73\x65\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x63\x68\x65\x63\x6b\x20\x74\x68\x65\x20\x72\x65\x66\x65\x72\x65\x6e\x63\x65\x20\x66\x6f\x72\x6d\x61\x74\x2e",
        );
      }
      const r = _0x8fe9b1.data.result;
      let _0xfb970b = `*${botName} BIBLE*\n\n`;
      _0xfb970b += `📖 *Verse:* ${r.verse || _0xf085af}\n`;
      _0xfb970b += `📊 *Verse Count:* ${r.versesCount || 1}\n\n`;
      _0xfb970b += `*English:*\n${r.data?.trim() || "\x4e\x2f\x41"}\n\n`;
      if (r.translations) {
        if (r.translations.swahili) {
          _0xfb970b += `*Swahili:*\n${r.translations.swahili}\n\n`;
        }
        if (r.translations.hindi) {
          _0xfb970b += `*Hindi:*\n${r.translations.hindi}\n\n`;
        }
      }
      const _0x3f8a0d = r.data?.trim() || "";
      await sendButtons(Gifted, from, {
        title: "",
        text: _0xfb970b,
        footer: botFooter,
        buttons: [
          {
            name: "\x63\x74\x61\x5f\x63\x6f\x70\x79",
            buttonParamsJson: JSON.stringify({
              display_text: "📋\x20\x43\x6f\x70\x79\x20\x56\x65\x72\x73\x65",
              copy_code: _0x3f8a0d,
            }),
          },
        ],
      });
      await react("✅");
    } catch (e) {
      console.error("\x42\x69\x62\x6c\x65\x20\x76\x65\x72\x73\x65\x20\x65\x72\x72\x6f\x72\x3a", e);
      await react("❌");
      return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x66\x65\x74\x63\x68\x20\x42\x69\x62\x6c\x65\x20\x76\x65\x72\x73\x65\x3a\x20" + e.message);
    }
  },
);
module.exports = {};
