/**
 * KEITH-INSPIRED FEATURES - FIXED v2
 * New commands ported/inspired from kkeizza/Keith bot
 * Added to ULTRA-GURU-ULTIMATE by Guru
 *
 * Bugs fixed vs v1:
 *  - Removed duplicates: hidetag, unsplash, define, npm, online (already exist)
 *  - Fixed: groupMetadata -> groupInfo in conText for hidetag (removed duplicate)
 *  - Fixed: removed Guru.getContact() which doesn't exist; getname now uses onWhatsApp only
 *  - Fixed: removed unused getSetting import
 *  - Fixed: online/offline renamed to setonline/setoffline (online exists for different purpose)
 *  - Fixed: invite/revoke pattern aliases cleaned to avoid alias clash with group.js
 *
 * Commands added (27 total, no duplicates):
 *   Profile:    getbio, changebio, getname
 *   Presence:   setonline, setoffline, typing, recording
 *   Group:      poll, groupinfo, invite, revoke
 *   Fun:        lovecalc, wyr, nhie, faketype, advice, affirmation, numberfact
 *   Utility:    remindme, lyrics, geoip, pinterest, github2
 */

const { gmd } = require("../guru");
const axios = require("axios");

// ─────────────────────────────────────────────
//  PROFILE TOOLS
// ─────────────────────────────────────────────

gmd(
  {
    pattern: "getbio",
    aliases: ["bio", "mybio"],
    description: "Get your or a quoted user's WhatsApp bio",
    react: "📋",
    category: "utility",
  },
  async (from, Guru, conText) => {
    const { reply, react, mek, sender, quoted, botFooter } = conText;
    await react("⏳");
    try {
      let target = sender;
      if (quoted && quoted.sender) target = quoted.sender;

      const status = await Guru.fetchStatus(target).catch(() => null);
      const num = target.split("@")[0];

      if (!status || !status.status) {
        await react("❌");
        return reply(`❌ No bio set for *+${num}*`);
      }

      await react("✅");
      await reply(
        `📋 *WhatsApp Bio*\n\n👤 *Number:* +${num}\n📝 *Bio:* ${status.status}\n\n> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Failed to fetch bio: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "changebio",
    aliases: ["updatebio"],
    description: "Change the bot's own WhatsApp bio. Usage: .changebio <text>",
    react: "✏️",
    category: "owner",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, isSuperUser, botFooter } = conText;
    if (!isSuperUser) return reply("*Owner Only Command*");
    if (!q) return reply("*Usage:* `.changebio <new bio text>`");
    if (q.length > 139) return reply("❌ Bio must be under 139 characters.");
    await react("⏳");
    try {
      await Guru.updateProfileStatus(q);
      await react("✅");
      await reply(`✅ *Bio Updated*\n\n📝 ${q}\n\n> _${botFooter}_`);
    } catch (e) {
      await react("❌");
      await reply(`❌ Failed to update bio: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "getname",
    aliases: ["nameof", "waname"],
    description: "Get a WhatsApp user's name. Reply to their message or use .getname <number>",
    react: "🪪",
    category: "utility",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, sender, quoted, botFooter } = conText;
    await react("⏳");
    try {
      let jid;
      if (quoted && quoted.sender) {
        jid = quoted.sender;
      } else if (q) {
        const num = q.replace(/[^0-9]/g, "");
        jid = `${num}@s.whatsapp.net`;
      } else {
        jid = sender;
      }

      const num = jid.split("@")[0];
      const [info] = await Guru.onWhatsApp(num).catch(() => [null]);
      const statusData = await Guru.fetchStatus(jid).catch(() => null);

      await react("✅");
      await reply(
        `🪪 *WhatsApp Name Info*\n\n` +
        `📞 *Number:* +${num}\n` +
        `✅ *Registered:* ${info?.exists ? "Yes" : "No"}\n` +
        (statusData?.status ? `📝 *Bio:* ${statusData.status}\n` : "") +
        `\n> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

// ─────────────────────────────────────────────
//  PRESENCE / PRIVACY TOOLS
// ─────────────────────────────────────────────

gmd(
  {
    pattern: "setonline",
    aliases: ["presenceon", "gonline"],
    description: "Set bot presence to online (available)",
    react: "🟢",
    category: "owner",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) return reply("*Owner Only Command*");
    await react("⏳");
    try {
      await Guru.sendPresenceUpdate("available");
      await react("✅");
      await reply(`🟢 *Presence set to Online*\n\n> _${botFooter}_`);
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "setoffline",
    aliases: ["presenceoff", "goffline"],
    description: "Set bot presence to offline/invisible",
    react: "⚫",
    category: "owner",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) return reply("*Owner Only Command*");
    await react("⏳");
    try {
      await Guru.sendPresenceUpdate("unavailable");
      await react("✅");
      await reply(`⚫ *Presence set to Offline*\n\n> _${botFooter}_`);
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "typing",
    aliases: ["faketyping", "istyping"],
    description: "Simulate bot typing for N seconds. Usage: .typing 5",
    react: "⌨️",
    category: "owner",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, isSuperUser, botFooter } = conText;
    if (!isSuperUser) return reply("*Owner Only Command*");
    const seconds = Math.min(parseInt(q) || 3, 30);
    await react("⏳");
    try {
      await Guru.sendPresenceUpdate("composing", from);
      await new Promise((r) => setTimeout(r, seconds * 1000));
      await Guru.sendPresenceUpdate("paused", from);
      await react("✅");
      await reply(`⌨️ Simulated typing for *${seconds}s*\n\n> _${botFooter}_`);
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "recording",
    aliases: ["fakerecording", "isrecording"],
    description: "Simulate bot recording audio for N seconds. Usage: .recording 5",
    react: "🎙️",
    category: "owner",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, isSuperUser, botFooter } = conText;
    if (!isSuperUser) return reply("*Owner Only Command*");
    const seconds = Math.min(parseInt(q) || 3, 30);
    await react("⏳");
    try {
      await Guru.sendPresenceUpdate("recording", from);
      await new Promise((r) => setTimeout(r, seconds * 1000));
      await Guru.sendPresenceUpdate("paused", from);
      await react("✅");
      await reply(`🎙️ Simulated recording for *${seconds}s*\n\n> _${botFooter}_`);
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

// ─────────────────────────────────────────────
//  GROUP TOOLS
// ─────────────────────────────────────────────

gmd(
  {
    pattern: "poll",
    aliases: ["createpoll", "vote"],
    description: "Create a WhatsApp poll. Usage: .poll Question | Option1 | Option2",
    react: "📊",
    category: "group",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, mek, botFooter } = conText;
    if (!q) {
      return reply(
        `📊 *Poll Usage*\n\n.poll Question | Option1 | Option2 | ...\n\n_Example:_\n.poll Best fruit? | Mango | Banana | Apple\n\n> _${botFooter}_`
      );
    }

    const parts = q.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) {
      return reply("❌ Provide a question and at least 2 options separated by `|`\n_Example: .poll Best food? | Ugali | Chapati | Rice_");
    }
    if (parts.length > 13) {
      return reply("❌ Maximum 12 options allowed.");
    }

    const question = parts[0];
    const options = parts.slice(1);

    await react("⏳");
    try {
      await Guru.sendMessage(from, {
        poll: {
          name: question,
          values: options,
          selectableCount: 1,
        },
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      await react("❌");
      await reply(`❌ Failed to create poll: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "groupinfo",
    aliases: ["gcinfo", "ginfo", "groupdetails"],
    description: "Get detailed information about the current group",
    react: "ℹ️",
    category: "group",
    isGroup: true,
  },
  async (from, Guru, conText) => {
    const { reply, react, mek, botFooter } = conText;
    await react("⏳");
    try {
      const meta = await Guru.groupMetadata(from);
      const allAdmins = meta.participants.filter((p) => p.admin);
      const admins = allAdmins.map((p) => `+${(p.id || p.jid || p.pn || "").split("@")[0]}`);
      const owner = meta.owner ? `+${meta.owner.split("@")[0]}` : "Unknown";
      const creation = meta.creation
        ? new Date(meta.creation * 1000).toLocaleDateString()
        : "Unknown";

      const text =
        `ℹ️ *Group Information*\n\n` +
        `📌 *Name:* ${meta.subject}\n` +
        `🆔 *JID:* ${from}\n` +
        `👥 *Members:* ${meta.participants.length}\n` +
        `👑 *Owner:* ${owner}\n` +
        `🛡️ *Admins (${admins.length}):*\n${admins.map((a) => `   • ${a}`).join("\n") || "   None"}\n` +
        `📅 *Created:* ${creation}\n` +
        (meta.desc ? `\n📝 *Description:*\n${meta.desc}\n` : "") +
        `\n> _${botFooter}_`;

      try {
        const pic = await Guru.profilePictureUrl(from, "image").catch(() => null);
        if (pic) {
          await Guru.sendMessage(from, { image: { url: pic }, caption: text }, { quoted: mek });
          return await react("✅");
        }
      } catch {}

      await react("✅");
      await reply(text);
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "invitelink",
    aliases: ["gclink", "grouplink", "getlink"],
    description: "Get the group invite link",
    react: "🔗",
    category: "group",
    isGroup: true,
  },
  async (from, Guru, conText) => {
    const { reply, react, isAdmin, isSuperAdmin, isSuperUser, botFooter } = conText;
    if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply("❌ *Admins Only*");
    await react("⏳");
    try {
      const code = await Guru.groupInviteCode(from);
      await react("✅");
      await reply(
        `🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}\n\n_Share to invite people._\n\n> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Failed to get invite link: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "revokelink",
    aliases: ["resetlink", "newlink"],
    description: "Reset/revoke the group invite link",
    react: "🔄",
    category: "group",
    isGroup: true,
  },
  async (from, Guru, conText) => {
    const { reply, react, isAdmin, isSuperAdmin, isSuperUser, botFooter } = conText;
    if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply("❌ *Admins Only*");
    await react("⏳");
    try {
      await Guru.groupRevokeInvite(from);
      const newCode = await Guru.groupInviteCode(from);
      await react("✅");
      await reply(
        `🔄 *Invite Link Revoked*\n\nNew link:\nhttps://chat.whatsapp.com/${newCode}\n\n> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Failed to revoke link: ${e.message}`);
    }
  }
);

// ─────────────────────────────────────────────
//  FUN TOOLS
// ─────────────────────────────────────────────

gmd(
  {
    pattern: "lovecalc",
    aliases: ["love", "lovemeter", "lovetest"],
    description: "Calculate love compatibility. Usage: .lovecalc Name1 & Name2",
    react: "💕",
    category: "fun",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q || !q.includes("&")) {
      return reply("*Usage:* `.lovecalc Name1 & Name2`\n_Example: .lovecalc Guru & Amira_");
    }
    const [n1, n2] = q.split("&").map((n) => n.trim());
    if (!n1 || !n2) return reply("❌ Provide two names separated by `&`");

    const combined = (n1 + n2).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash * 31 + combined.charCodeAt(i)) % 100;
    }
    const percentage = Math.abs(hash) + 1;
    const filled = Math.floor(percentage / 10);
    const hearts = "❤️".repeat(filled) + "🤍".repeat(10 - filled);
    const verdict =
      percentage >= 85 ? "💍 Perfect match! Get married already! 😂" :
      percentage >= 70 ? "💖 Great chemistry between you two!" :
      percentage >= 50 ? "💛 There's potential, nurture it!" :
      percentage >= 30 ? "🤍 It could work with effort..." :
      "💔 Yikes... not looking great 😬";

    await react("✅");
    await reply(
      `💕 *Love Calculator*\n\n👤 *${n1}* ❤️ *${n2}*\n\n${hearts}\n\n💯 *Compatibility:* ${percentage}%\n\n${verdict}\n\n> _${botFooter}_`
    );
  }
);

gmd(
  {
    pattern: "wyr",
    aliases: ["wouldyourather", "wyrq"],
    description: "Would You Rather question",
    react: "🤔",
    category: "fun",
  },
  async (from, Guru, conText) => {
    const { reply, react, botFooter } = conText;
    const questions = [
      ["Be able to fly", "Be able to breathe underwater"],
      ["Never use social media again", "Never watch TV/movies again"],
      ["Have unlimited money but no friends", "Have amazing friends but be broke forever"],
      ["Know when you're going to die", "Know how you're going to die"],
      ["Be famous but hated", "Be unknown but loved"],
      ["Live in the past", "Live in the future"],
      ["Lose all your memories", "Never make new ones"],
      ["Be able to read minds", "Be able to see the future"],
      ["Always be overdressed", "Always be underdressed"],
      ["Give up your phone", "Give up your laptop/PC"],
      ["Eat the same food every day", "Never eat your favourite food again"],
      ["Have a pause button for life", "Have a rewind button for life"],
      ["Be 10 minutes late to everything", "Be 20 minutes early to everything"],
      ["Only be able to whisper", "Only be able to shout"],
      ["Never sleep again", "Always be sleepy but never sleep"],
    ];
    const [optA, optB] = questions[Math.floor(Math.random() * questions.length)];
    await react("✅");
    await reply(
      `🤔 *Would You Rather?*\n\n🅰️ *${optA}*\n\n_— OR —_\n\n🅱️ *${optB}*\n\n_Reply A or B! 👇_\n\n> _${botFooter}_`
    );
  }
);

gmd(
  {
    pattern: "nhie",
    aliases: ["neverihave", "neverhaveievere"],
    description: "Never Have I Ever question",
    react: "🙋",
    category: "fun",
  },
  async (from, Guru, conText) => {
    const { reply, react, botFooter } = conText;
    const list = [
      "Never have I ever lied to get out of plans 😅",
      "Never have I ever fallen asleep in a meeting or class 😴",
      "Never have I ever sent a text to the wrong person 📲",
      "Never have I ever pretended to be sick to avoid work 🤒",
      "Never have I ever eaten food off the floor and not told anyone 🤭",
      "Never have I ever stalked someone's WhatsApp status 👀",
      "Never have I ever forgotten an important birthday 🎂",
      "Never have I ever cried watching a movie 🎬😭",
      "Never have I ever ordered food just because of the picture 🍕",
      "Never have I ever ghosted someone I liked 👻",
      "Never have I ever lied about my age 🎂",
      "Never have I ever stayed up past 3am for no good reason 🌙",
      "Never have I ever talked to myself out loud in public 🗣️",
      "Never have I ever secretly read someone's messages 👀",
      "Never have I ever laughed at the wrong moment 😬",
    ];
    const item = list[Math.floor(Math.random() * list.length)];
    await react("✅");
    await reply(
      `🙋 *Never Have I Ever*\n\n${item}\n\n_Put your finger down if you have! 👇_\n\n> _${botFooter}_`
    );
  }
);

gmd(
  {
    pattern: "faketype",
    aliases: ["slowtype", "typeeffect"],
    description: "Send a message with a realistic typing delay. Usage: .faketype <message>",
    react: "⌨️",
    category: "fun",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, mek, isSuperUser } = conText;
    if (!isSuperUser) return reply("*Owner Only Command*");
    if (!q) return reply("*Usage:* `.faketype <your message>`");
    await react("⏳");
    try {
      await Guru.sendPresenceUpdate("composing", from);
      const delay = Math.min(q.length * 60, 5000);
      await new Promise((r) => setTimeout(r, delay));
      await Guru.sendPresenceUpdate("paused", from);
      await Guru.sendMessage(from, { text: q }, { quoted: mek });
      await react("✅");
    } catch (e) {
      await react("❌");
      await reply(`❌ ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "advice",
    aliases: ["getadvice", "lifetip"],
    description: "Get a random piece of advice",
    react: "💡",
    category: "fun",
  },
  async (from, Guru, conText) => {
    const { reply, react, botFooter } = conText;
    await react("⏳");
    try {
      const res = await axios.get("https://api.adviceslip.com/advice", { timeout: 10000 });
      const advice = res.data?.slip?.advice;
      if (!advice) throw new Error("No advice returned");
      await react("✅");
      await reply(`💡 *Daily Advice*\n\n_"${advice}"_\n\n> _${botFooter}_`);
    } catch {
      await react("❌");
      await reply("❌ Could not fetch advice right now. Try again!");
    }
  }
);

gmd(
  {
    pattern: "affirmation",
    aliases: ["affirm", "positivity", "motivation2"],
    description: "Get a positive affirmation",
    react: "🌟",
    category: "fun",
  },
  async (from, Guru, conText) => {
    const { reply, react, botFooter } = conText;
    const list = [
      "You are capable of achieving great things. Believe in yourself! 💪",
      "Every day is a new opportunity to grow and become better. 🌱",
      "You are enough, exactly as you are. 🌟",
      "Your potential is limitless. Never stop reaching for your dreams. 🚀",
      "Challenges make you stronger. You've overcome hard things before! 🏆",
      "You deserve love, happiness, and success. Claim it! ❤️",
      "One step at a time. You're doing better than you think. 🦋",
      "Your uniqueness is your superpower. Own it! ✨",
      "Today, choose progress over perfection. 🎯",
      "You have survived 100% of your worst days. You're unstoppable! 🔥",
      "Be proud of how far you've come. Your journey matters. 🛣️",
      "Good things are coming your way. Stay patient and positive. 🌈",
    ];
    const msg = list[Math.floor(Math.random() * list.length)];
    await react("✅");
    await reply(`🌟 *Positive Affirmation*\n\n${msg}\n\n> _${botFooter}_`);
  }
);

// ─────────────────────────────────────────────
//  UTILITY TOOLS
// ─────────────────────────────────────────────

gmd(
  {
    pattern: "geoip",
    aliases: ["iplookup", "ipinfo", "checkip"],
    description: "Get location info for an IP address. Usage: .geoip 8.8.8.8",
    react: "🌐",
    category: "utility",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("*Usage:* `.geoip <ip address>`\n_Example: .geoip 8.8.8.8_");

    const ip = q.trim();
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      return reply("❌ Invalid IP format.\n_Example: .geoip 8.8.8.8_");
    }

    await react("⏳");
    try {
      const res = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 10000 });
      const d = res.data;
      if (d.error) throw new Error(d.reason || "IP lookup failed");

      await react("✅");
      await reply(
        `🌐 *IP Lookup*\n\n` +
        `🔍 *IP:* ${d.ip}\n` +
        `🏳️ *Country:* ${d.country_name || "N/A"}${d.country ? ` (${d.country})` : ""}\n` +
        `🗺️ *Region:* ${d.region || "N/A"}\n` +
        `🏙️ *City:* ${d.city || "N/A"}\n` +
        `📍 *Coords:* ${d.latitude || "?"}, ${d.longitude || "?"}\n` +
        `🌍 *Timezone:* ${d.timezone || "N/A"}\n` +
        `🏢 *ISP/Org:* ${d.org || "N/A"}\n` +
        `💰 *Currency:* ${d.currency_name || "N/A"} (${d.currency || "N/A"})\n` +
        `\n> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ IP lookup failed: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "pinterest",
    aliases: ["pin", "pinsearch"],
    description: "Search for images (Unsplash). Usage: .pinterest nature sunset",
    react: "📌",
    category: "utility",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, mek, botFooter } = conText;
    if (!q) return reply("*Usage:* `.pinterest <search query>`\n_Example: .pinterest anime wallpaper_");

    await react("⏳");
    try {
      const res = await axios.get(
        `https://source.unsplash.com/featured/?${encodeURIComponent(q)}`,
        { timeout: 10000, maxRedirects: 5, responseType: "arraybuffer" }
      );

      const buf = Buffer.from(res.data);
      await Guru.sendMessage(
        from,
        {
          image: buf,
          caption: `📌 *Search:* ${q}\n\n_Powered by Unsplash_\n\n> _${botFooter}_`,
          mimetype: "image/jpeg",
        },
        { quoted: mek }
      );
      await react("✅");
    } catch (e) {
      await react("❌");
      await reply(`❌ Image search failed: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "github2",
    aliases: ["ghuser", "gitprofile"],
    description: "Look up a GitHub user profile. Usage: .github2 torvalds",
    react: "🐱",
    category: "utility",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, mek, botFooter } = conText;
    if (!q) return reply("*Usage:* `.github2 <username>`\n_Example: .github2 torvalds_");
    await react("⏳");
    try {
      const res = await axios.get(`https://api.github.com/users/${q.trim()}`, {
        headers: { "User-Agent": "ULTRA-GURU-MD" },
        timeout: 10000,
      });
      const u = res.data;

      const caption =
        `🐱 *GitHub Profile*\n\n` +
        `👤 *Name:* ${u.name || u.login}\n` +
        `🏷️ *Username:* @${u.login}\n` +
        `📝 *Bio:* ${u.bio || "N/A"}\n` +
        `🏢 *Company:* ${u.company || "N/A"}\n` +
        `📍 *Location:* ${u.location || "N/A"}\n` +
        `📦 *Public Repos:* ${u.public_repos}\n` +
        `👥 *Followers:* ${u.followers}  |  *Following:* ${u.following}\n` +
        `🔗 *Profile:* ${u.html_url}\n` +
        (u.blog ? `🌐 *Website:* ${u.blog}\n` : "") +
        `📅 *Joined:* ${new Date(u.created_at).toLocaleDateString()}\n` +
        `\n> _${botFooter}_`;

      if (u.avatar_url) {
        await Guru.sendMessage(from, { image: { url: u.avatar_url }, caption }, { quoted: mek });
      } else {
        await reply(caption);
      }
      await react("✅");
    } catch {
      await react("❌");
      await reply(`❌ GitHub user *${q}* not found.`);
    }
  }
);
