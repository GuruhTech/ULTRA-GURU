
const { gmd } = require("../guru");
const axios = require("axios");

const DC_API = "https://apis.davidcyril.name.ng";

gmd(
  {
    pattern: "news",
    aliases: ["bbnews", "bbcnews", "headlines"],
    react: "📰",
    category: "fun",
    description: "Fetch latest BBC world news headlines",
  },
  async (from, Gifted, conText) => {
    const { reply, react, mek, sender, newsletterJid, botName } = conText;
    try {
      const { data } = await axios.get(`${DC_API}/news/bbc`);
      if (!data.success || !data.articles?.length) {
        return reply("❌ Could not fetch news right now. Try again later.");
      }
      const articles = data.articles.slice(0, 6);
      let msg = `📰 *BBC NEWS — TOP HEADLINES*\n`;
      msg += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n`;
      articles.forEach((a, i) => {
        msg += `*${i + 1}.* ${a.title}\n`;
        if (a.description) {
          const desc = a.description.length > 120
            ? a.description.slice(0, 120) + "..."
            : a.description;
          msg += `   _${desc}_\n`;
        }
        msg += `   🔗 ${a.link}\n\n`;
      });
      msg += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
      msg += `_Source: BBC News — Powered by DavidCyrilTech_`;

      const firstImg = articles.find(a => a.image);
      if (firstImg) {
        await Gifted.sendMessage(from, {
          image: { url: firstImg.image },
          caption: msg,
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
        }, { quoted: mek });
      } else {
        await reply(msg);
      }
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`❌ Error fetching news: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "waifu",
    aliases: ["randomwaifu", "animegirl"],
    react: "🌸",
    category: "fun",
    description: "Get a random anime waifu image",
  },
  async (from, Gifted, conText) => {
    const { reply, react, mek, sender, newsletterJid, botName } = conText;
    try {
      const { data } = await axios.get(`${DC_API}/random/waifu`);
      if (!data.success || !data.url) {
        return reply("❌ Could not fetch a waifu image right now.");
      }
      await Gifted.sendMessage(from, {
        image: { url: data.url },
        caption: `🌸 *Random Waifu* 🌸\n_Powered by DavidCyrilTech_`,
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
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "anime",
    aliases: ["animesearch", "findanime"],
    react: "🎌",
    category: "search",
    description: "Search anime info — Usage: .anime <title>",
  },
  async (from, Gifted, conText) => {
    const { reply, react, mek, q, sender, newsletterJid, botName } = conText;
    if (!q) return reply("❌ Please provide an anime title.\n*Example:* .anime naruto");
    try {
      const { data } = await axios.get(`${DC_API}/anime/search`, { params: { q } });
      if (!data.success || !data.results?.length) {
        return reply(`❌ No results found for *${q}*`);
      }
      const results = data.results.slice(0, 5);
      let msg = `🎌 *ANIME SEARCH: ${q.toUpperCase()}*\n`;
      msg += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n`;
      results.forEach((a, i) => {
        msg += `*${i + 1}. ${a.title}*`;
        if (a.title_english && a.title_english !== a.title) msg += ` _(${a.title_english})_`;
        msg += `\n`;
        msg += `   📺 Type: ${a.type || "N/A"}  •  🎬 Episodes: ${a.episodes || "?"}\n`;
        msg += `   ⭐ Score: ${a.score || "N/A"}  •  📅 Year: ${a.year || "N/A"}\n`;
        msg += `   📊 Status: ${a.status || "N/A"}\n`;
        if (a.synopsis) {
          const syn = a.synopsis.length > 150 ? a.synopsis.slice(0, 150) + "..." : a.synopsis;
          msg += `   _${syn}_\n`;
        }
        msg += `\n`;
      });
      msg += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
      msg += `_Showing ${results.length} of ${data.total} results_`;

      const firstImg = results.find(r => r.image);
      if (firstImg) {
        await Gifted.sendMessage(from, {
          image: { url: firstImg.image },
          caption: msg,
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
        }, { quoted: mek });
      } else {
        await reply(msg);
      }
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "stalkwa",
    aliases: ["wachannel", "channelinfo"],
    react: "🔍",
    category: "stalk",
    description: "Get info about a WhatsApp channel — Usage: .stalkwa <channel url>",
  },
  async (from, Gifted, conText) => {
    const { reply, react, mek, q, sender, newsletterJid, botName } = conText;
    if (!q) return reply("❌ Please provide a WhatsApp channel URL.\n*Example:* .stalkwa https://whatsapp.com/channel/xxxx");
    const url = q.trim();
    if (!url.includes("whatsapp.com/channel")) {
      return reply("❌ Invalid WhatsApp channel URL.\n*Format:* https://whatsapp.com/channel/...");
    }
    try {
      const { data } = await axios.get(`${DC_API}/stalk/wa`, { params: { url } });
      if (!data.success) {
        return reply(`❌ Could not fetch channel info.`);
      }
      let msg = `🔍 *WHATSAPP CHANNEL INFO*\n`;
      msg += `╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n`;
      msg += `📛 *Name:* ${data.title || "N/A"}\n`;
      msg += `👥 *Followers:* ${data.followers || "0"}\n`;
      if (data.description) msg += `📝 *Description:* ${data.description}\n`;
      msg += `\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n`;
      msg += `_Powered by DavidCyrilTech_`;

      if (data.image) {
        await Gifted.sendMessage(from, {
          image: { url: data.image },
          caption: msg,
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
        }, { quoted: mek });
      } else {
        await reply(msg);
      }
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "aiask",
    aliases: ["deepseek", "guruai", "ask"],
    react: "🧠",
    category: "ai",
    description: "Ask the DeepSeek V3 AI a question — Usage: .aiask <question>",
  },
  async (from, Gifted, conText) => {
    const { reply, react, mek, q, sender } = conText;
    if (!q) return reply("❌ Please provide a question.\n*Example:* .aiask What is quantum physics?");
    try {
      await react("⏳");
      const { data } = await axios.post(`${DC_API}/ai/deepseek-v3`, {
        text: q,
        systemPrompt: "You are a helpful WhatsApp bot assistant called Ultra Guru MD powered by GuruTech. Be concise and friendly.",
        sessionId: sender.split("@")[0],
      });
      if (!data.success || !data.response) {
        return reply("❌ AI did not return a response. Try again.");
      }
      await reply(`🧠 *GURU AI*\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n${data.response}\n\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n_Powered by DavidCyrilTech DeepSeek V3_`);
      await react("✅");
    } catch (e) {
      console.error(e);
      reply(`❌ AI Error: ${e.message}`);
    }
  }
);
