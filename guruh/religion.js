
const { gmd } = require("../guru");
const axios = require("axios");
const { sendButtons } = require("gifted-btns");

gmd(
  {
    pattern: "bible",
    aliases: ["verse", "bibleverse", "scripture"],
    react: "📖",
    category: "religion",
    description: "Get Bible verses",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter, botName, GiftedTechApi, GiftedApiKey } =
      conText;

    const verse = q?.trim();
    if (!verse) {
      await react("❌");
      return reply(
        "Please provide a Bible verse reference\n\nUsage:\n.bible John 3:16\n.bible John 3:16-20\n.bible John 3",
      );
    }

    await react("⏳");

    try {
      const res = await axios.get(`${GiftedTechApi}/api/search/bible`, {
        params: { apikey: GiftedApiKey, verse: verse },
      });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply(
          "Failed to fetch Bible verse. Please check the reference format.",
        );
      }

      const r = res.data.result;

      let txt = `*${botName} BIBLE*\n\n`;
      txt += `📖 *Verse:* ${r.verse || verse}\n`;
      txt += `📊 *Verse Count:* ${r.versesCount || 1}\n\n`;
      txt += `*English:*\n${r.data?.trim() || "N/A"}\n\n`;

      if (r.translations) {
        if (r.translations.swahili) {
          txt += `*Swahili:*\n${r.translations.swahili}\n\n`;
        }
        if (r.translations.hindi) {
          txt += `*Hindi:*\n${r.translations.hindi}\n\n`;
        }
      }

      const copyContent = r.data?.trim() || "";

      await sendButtons(Gifted, from, {
        title: "",
        text: txt,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Verse",
              copy_code: copyContent,
            }),
          },
        ],
      });

      await react("✅");
    } catch (e) {
      console.error("Bible verse error:", e);
      await react("❌");
      return reply("Failed to fetch Bible verse: " + e.message);
    }
  },
);

module.exports = {};
