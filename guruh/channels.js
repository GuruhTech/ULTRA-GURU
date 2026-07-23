
const { gmd } = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");
const { safeNewsletterFollow, OWNER_CHANNELS, PROFESSOR_EMOJIS } = require("../guru/connection/connectionHandler");


gmd(
  {
    pattern: "channels",
    aliases: ["mychannel", "mychannels", "channelinfo", "chinfo"],
    react: "📡",
    category: "owner",
    description: "View auto-followed channels and their react status",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    try {
      let extraChannels = [];
      const extra = await getSetting("OWNER_CHANNELS");
      if (extra) {
        extraChannels = extra.split(",").map((j) => j.trim()).filter((j) => j.endsWith("@newsletter"));
      }
      const allChannels = [...new Set([...OWNER_CHANNELS, ...extraChannels])];

      let msg =
        `📡 *CHANNEL MANAGER*\n` +
        `${"─".repeat(30)}\n\n` +
        `🟢 *Auto-React:* ALWAYS ON\n` +
        `🎭 *React Style:* Random Professor Emojis\n` +
        `📊 *Total Channels:* ${allChannels.length}\n\n` +
        `*📌 TRACKED CHANNELS:*\n`;

      allChannels.forEach((jid, i) => {
        const isDefault = OWNER_CHANNELS.includes(jid);
        msg += `\n${i + 1}. \`${jid}\`\n`;
        msg += `   ${isDefault ? "🔒 Built-in (always active)" : "➕ Custom"}\n`;
      });

      msg +=
        `\n${"─".repeat(30)}\n` +
        `📘 *Commands:*\n` +
        `• \`.addchannel <jid>\` — add channel\n` +
        `• \`.removechannel <jid>\` — remove channel\n` +
        `• \`.followchannels\` — manually re-follow all\n\n` +
        `> _${botFooter}_`;

      await react("✅");
      await reply(msg);
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);

gmd(
  {
    pattern: "addchannel",
    aliases: ["setchannel", "trackchannel"],
    react: "➕",
    category: "owner",
    description: "Add a channel to auto-follow and auto-react list. Usage: .addchannel 1234567890@newsletter",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q) return reply("❌ Provide a channel JID!\nExample: `.addchannel 120363406649804510@newsletter`");
    const jid = q.trim();
    if (!jid.endsWith("@newsletter")) return reply("❌ Invalid channel JID! Must end with `@newsletter`");

    try {
      const current = await getSetting("OWNER_CHANNELS");
      const existing = current ? current.split(",").map((j) => j.trim()).filter(Boolean) : [];
      if (OWNER_CHANNELS.includes(jid) || existing.includes(jid)) {
        return reply(`⚠️ Channel \`${jid}\` is already being tracked!`);
      }
      existing.push(jid);
      await setSetting("OWNER_CHANNELS", existing.join(","));
      await safeNewsletterFollow(Guru, jid);
      await react("✅");
      await reply(
        `✅ *Channel Added & Followed!*\n\n` +
        `📡 \`${jid}\`\n\n` +
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
    pattern: "removechannel",
    aliases: ["delchannel", "untrackchannel"],
    react: "➖",
    category: "owner",
    description: "Remove a custom channel from auto-react list. Usage: .removechannel 1234567890@newsletter",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q) return reply("❌ Provide a channel JID!\nExample: `.removechannel 120363406649804510@newsletter`");
    const jid = q.trim();

    if (OWNER_CHANNELS.includes(jid)) {
      return reply(`⚠️ \`${jid}\` is a built-in channel and cannot be removed.\nBuilt-in channels always remain active.`);
    }

    try {
      const current = await getSetting("OWNER_CHANNELS");
      const existing = current ? current.split(",").map((j) => j.trim()).filter(Boolean) : [];
      const idx = existing.indexOf(jid);
      if (idx === -1) return reply(`⚠️ Channel \`${jid}\` is not in the custom list.`);
      existing.splice(idx, 1);
      await setSetting("OWNER_CHANNELS", existing.join(","));
      await react("✅");
      await reply(
        `✅ *Channel Removed!*\n\n` +
        `📡 \`${jid}\` removed from auto-react tracking.\n\n` +
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
    pattern: "followchannels",
    aliases: ["rechannels", "refollowchannels", "followall"],
    react: "📡",
    category: "owner",
    description: "Manually re-follow all tracked channels",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    try {
      let extraChannels = [];
      const extra = await getSetting("OWNER_CHANNELS");
      if (extra) {
        extraChannels = extra.split(",").map((j) => j.trim()).filter((j) => j.endsWith("@newsletter"));
      }
      const allChannels = [...new Set([...OWNER_CHANNELS, ...extraChannels])];
      let succeeded = 0;
      let failed = 0;
      for (const jid of allChannels) {
        const ok = await safeNewsletterFollow(Guru, jid);
        if (ok) succeeded++; else failed++;
      }
      await react("✅");
      await reply(
        `📡 *Channel Follow Complete*\n\n` +
        `✅ Followed: ${succeeded}\n` +
        `❌ Failed: ${failed}\n` +
        `📊 Total: ${allChannels.length}\n\n` +
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
    pattern: "professoremojis",
    aliases: ["profemojis", "channelemojis", "reactemojis"],
    react: "🎓",
    category: "owner",
    description: "View all professor emojis used for channel auto-reactions",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
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


// ─────────────────────────────────────────────────────────────
//  BROADCAST — send a message to all groups the bot is in
// ─────────────────────────────────────────────────────────────
gmd(
  {
    pattern: "broadcast",
    aliases: ["bc", "sendall", "groupbroadcast"],
    react: "📣",
    category: "owner",
    description: "Broadcast a message to all groups. Usage: .broadcast <message>",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter, quoted } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q && !quoted) return reply("❌ Provide a message to broadcast!\nExample: `.broadcast Hello everyone! 👋`");

    await react("📣");
    const text = q || "";

    try {
      const groups = await Guru.groupFetchAllParticipating();
      const groupJids = Object.keys(groups);
      if (!groupJids.length) return reply("⚠️ Bot is not in any groups!");

      await reply(
        `📣 *Broadcasting to ${groupJids.length} groups...*\n\n⏳ _Please wait_`
      );

      let success = 0;
      let failed = 0;

      for (const jid of groupJids) {
        try {
          if (quoted) {
            // Forward the quoted media/message if reply was used
            await Guru.sendMessage(jid, { forward: quoted }, { quoted: null });
            if (text) await Guru.sendMessage(jid, { text });
          } else {
            await Guru.sendMessage(jid, { text });
          }
          success++;
          // Small delay to avoid rate-limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (_) {
          failed++;
        }
      }

      await react("✅");
      await reply(
        `📣 *Broadcast Complete!*\n\n` +
        `✅ Delivered: ${success}\n` +
        `❌ Failed: ${failed}\n` +
        `📊 Total: ${groupJids.length}\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Broadcast error: ${err.message}`);
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  BROADCASTDM — broadcast a message/media to all DM contacts
// ─────────────────────────────────────────────────────────────
gmd(
  {
    pattern: "broadcastdm",
    aliases: ["bcdm", "dmall", "dmbroadcast"],
    react: "📨",
    category: "owner",
    description: "Broadcast a message/media to saved DM contacts. Usage: .broadcastdm <message> or quote media",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter, quoted } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q && !quoted) return reply("❌ Provide a message or quote media!\nExample: `.broadcastdm Hey! 👋`");

    await react("📨");
    const text = q || "";

    try {
      const chats = await Guru.groupFetchAllParticipating();
      const groupJids = new Set(Object.keys(chats));

      const contacts = Guru.store?.contacts || {};
      const dmJids = Object.keys(contacts).filter(
        j => j.endsWith("@s.whatsapp.net") && !groupJids.has(j)
      );

      if (!dmJids.length) return reply("⚠️ No DM contacts found in store.");

      await reply(`📨 *Broadcasting to ${dmJids.length} DM contacts...*\n\n⏳ _Please wait_`);

      let success = 0;
      let failed = 0;
      for (const jid of dmJids) {
        try {
          if (quoted) {
            await Guru.sendMessage(jid, { forward: quoted }, { quoted: null });
            if (text) await Guru.sendMessage(jid, { text });
          } else {
            await Guru.sendMessage(jid, { text });
          }
          success++;
          await new Promise(r => setTimeout(r, 800));
        } catch (_) {
          failed++;
        }
      }

      await react("✅");
      await reply(
        `📨 *DM Broadcast Complete!*\n\n` +
        `✅ Sent: ${success}\n` +
        `❌ Failed: ${failed}\n` +
        `📊 Total: ${dmJids.length}\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  BROADCASTALL — broadcast to ALL groups + DM contacts
// ─────────────────────────────────────────────────────────────
gmd(
  {
    pattern: "broadcastall",
    aliases: ["bcall", "sendeveryone", "massbroadcast"],
    react: "📢",
    category: "owner",
    description: "Broadcast a message to ALL groups and DM contacts. Usage: .broadcastall <message> or quote media",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter, quoted } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q && !quoted) return reply(
      "❌ Provide a message or quote media!\n\n" +
      "Example: `.broadcastall 🔥 Bot update coming soon!`\n\n" +
      "⚠️ _This sends to every group AND every DM contact — use carefully!_"
    );

    await react("📢");
    const text = q || "";

    try {
      // ── Fetch groups ──────────────────────────────────────
      const groupsMap  = await Guru.groupFetchAllParticipating();
      const groupJids  = Object.keys(groupsMap);

      // ── Fetch DM contacts ─────────────────────────────────
      const groupSet   = new Set(groupJids);
      const contacts   = Guru.store?.contacts || {};
      const dmJids     = Object.keys(contacts).filter(
        j => j.endsWith("@s.whatsapp.net") && !groupSet.has(j)
      );

      const totalTargets = groupJids.length + dmJids.length;
      if (!totalTargets) return reply("⚠️ No groups or contacts found!");

      await reply(
        `📢 *Mass Broadcast Starting...*\n\n` +
        `👥 Groups : ${groupJids.length}\n` +
        `💬 DMs    : ${dmJids.length}\n` +
        `📊 Total  : ${totalTargets}\n\n` +
        `⏳ _Please wait..._`
      );

      let gSuccess = 0, gFailed = 0;
      let dSuccess = 0, dFailed = 0;

      // ── Send to groups ────────────────────────────────────
      for (const jid of groupJids) {
        try {
          if (quoted) {
            await Guru.sendMessage(jid, { forward: quoted }, { quoted: null });
            if (text) await Guru.sendMessage(jid, { text });
          } else {
            await Guru.sendMessage(jid, { text });
          }
          gSuccess++;
          await new Promise(r => setTimeout(r, 500));
        } catch (_) {
          gFailed++;
        }
      }

      // ── Send to DMs ───────────────────────────────────────
      for (const jid of dmJids) {
        try {
          if (quoted) {
            await Guru.sendMessage(jid, { forward: quoted }, { quoted: null });
            if (text) await Guru.sendMessage(jid, { text });
          } else {
            await Guru.sendMessage(jid, { text });
          }
          dSuccess++;
          await new Promise(r => setTimeout(r, 800));
        } catch (_) {
          dFailed++;
        }
      }

      await react("✅");
      await reply(
        `📢 *Mass Broadcast Complete!*\n\n` +
        `👥 *Groups*\n` +
        `   ✅ Delivered : ${gSuccess}\n` +
        `   ❌ Failed    : ${gFailed}\n\n` +
        `💬 *DMs*\n` +
        `   ✅ Delivered : ${dSuccess}\n` +
        `   ❌ Failed    : ${dFailed}\n\n` +
        `📊 *Total Reached : ${gSuccess + dSuccess} / ${totalTargets}*\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Broadcast error: ${err.message}`);
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  CHANNELPOST — post a message to your WhatsApp channel
// ─────────────────────────────────────────────────────────────
gmd(
  {
    pattern: "channelpost",
    aliases: ["postch", "sendchannel", "chpost"],
    react: "📡",
    category: "owner",
    description: "Send a text post to your WhatsApp channel. Usage: .channelpost <text>",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q) return reply("❌ Provide text for the channel post!\nExample: `.channelpost Hello fans! 🔥`");

    try {
      const { getSetting } = require("../guru/database/settings");
      const channelJid = await getSetting("NEWSLETTER_JID");
      if (!channelJid || !channelJid.endsWith("@newsletter"))
        return reply("❌ NEWSLETTER_JID not configured. Use `.setchanneljid <jid>` first.");

      await Guru.sendMessage(channelJid, { text: q });
      await react("✅");
      await reply(
        `📡 *Channel Post Sent!*\n\n` +
        `📝 Message posted to your channel.\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  SETCHANNELJID — set your own channel JID in settings
// ─────────────────────────────────────────────────────────────
gmd(
  {
    pattern: "setchanneljid",
    aliases: ["mychanneljid", "setnewsletterjid"],
    react: "🔧",
    category: "owner",
    description: "Set your WhatsApp channel JID. Usage: .setchanneljid 120363xxxxxx@newsletter",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }
    if (!q) return reply("❌ Provide your channel JID!\nExample: `.setchanneljid 120363406649804510@newsletter`");
    const jid = q.trim();
    if (!jid.endsWith("@newsletter")) return reply("❌ Invalid JID — must end with `@newsletter`");

    try {
      const { setSetting } = require("../guru/database/settings");
      await setSetting("NEWSLETTER_JID", jid);
      // Also auto-follow it
      await safeNewsletterFollow(Guru, jid);
      await react("✅");
      await reply(
        `✅ *Channel JID Updated!*\n\n` +
        `📡 \`${jid}\`\n\n` +
        `The bot will now auto-react to posts on this channel.\n\n` +
        `> _${botFooter}_`
      );
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  CHANNELSTATS — show channel reaction stats
// ─────────────────────────────────────────────────────────────
gmd(
  {
    pattern: "channelstats",
    aliases: ["chstats", "mystats", "channelreactstats"],
    react: "📊",
    category: "owner",
    description: "Show your bot's channel reaction configuration",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, botFooter } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    try {
      const { getSetting } = require("../guru/database/settings");
      const autoChannelLike = await getSetting("AUTO_CHANNEL_LIKE");
      const antiViewOnce = await getSetting("ANTIVIEWONCE");
      const vvTracker = await getSetting("VV_TRACKER");
      const newsletterJid = await getSetting("NEWSLETTER_JID");
      const dbChannels = await getSetting("OWNER_CHANNELS");

      const customChannels = dbChannels
        ? dbChannels.split(",").map(j => j.trim()).filter(j => j.endsWith("@newsletter"))
        : [];

      const status = v => v === "true" ? "🟢 ON" : v === "indm" ? "📩 DM Only" : "🔴 OFF";

      const msg =
        `📊 *CHANNEL & VIEW-ONCE STATUS*\n` +
        `${"─".repeat(30)}\n\n` +
        `📡 *Auto Channel React:* ${status(autoChannelLike)}\n` +
        `👁️ *Anti View-Once:* ${status(antiViewOnce)}\n` +
        `🎥 *VV Tracker (react/reply):* ${status(vvTracker)}\n\n` +
        `*📌 YOUR CHANNEL:*\n` +
        `\`${newsletterJid || "Not set"}\`\n\n` +
        (customChannels.length ? `*➕ CUSTOM CHANNELS (${customChannels.length}):*\n${customChannels.map((j, i) => `${i + 1}. \`${j}\``).join("\n")}\n\n` : "") +
        `*📘 Toggle Commands:*\n` +
        `• \`.setautochannellike on/off\`\n` +
        `• \`.setantiviewonce on/off/indm\`\n` +
        `• \`.setvvtracker on/off\`\n\n` +
        `> _${botFooter}_`;

      await react("✅");
      await reply(msg);
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);
