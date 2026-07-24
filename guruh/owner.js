const { gmd, commands, getSetting } = require("../guru");
const { addTrustedVOSaver } = require("../guru/connection/connectionHandler");
const fs = require("fs").promises;
const fsA = require("node:fs");
const { S_WHATSAPP_NET } = require("@whiskeysockets/baileys");
const path = require("path");
const moment = require("moment-timezone");
const {
  groupCache,
  getGroupMetadata,
  cachedGroupMetadata,
} = require("../guru/connection/groupCache");

const pendingCmdFiles = new Map();

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
    pattern: "owner",
    react: "👑",
    category: "owner",
    description: "Get Bot Owner.",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, isSuperUser, ownerNumber, ownerName, botName } =
      conText;

    if (!isSuperUser) {
      await react("❌");
      return reply(`Owner Only Command!`);
    }

    try {
      const vcard =
        "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        `FN:${ownerName}\n` +
        `ORG:${botName};\n` +
        `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` +
        "END:VCARD";

      await Guru.sendMessage(
        from,
        {
          contacts: {
            displayName: ownerName,
            contacts: [{ vcard }],
          },
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (error) {
      await react("❌");
      await reply(`❌ Failed: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "gcpp",
    aliases: ["setgcpp", "gcfullpp", "fullgcpp"],
    react: "🔮",
    category: "group",
    description: "Set group full profile picture without cropping.",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, sender, quoted, isGroup, isSuperUser, isAdmin } =
      conText;

    if (!isAdmin) {
      await react("❌");
      return reply(`Admin Only Command!`);
    }

    if (!isGroup) {
      await react("❌");
      return reply(`Command can only be used in groups!`);
    }

    let tempFilePath;
    try {
      const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
      if (!quotedImg) {
        await react("❌");
        return reply("Please quote an image");
      }
      tempFilePath = await Guru.downloadAndSaveMediaMessage(
        quotedImg,
        "temp_media",
      );

      const { Jimp } = require("jimp"); // lazy-loaded: only when a picture is actually set
      const image = await Jimp.read(tempFilePath);
      image.crop({ x: 0, y: 0, w: image.width, h: image.height });
      image.scaleToFit({ w: 720, h: 720 });
      const imageBuffer = await image.getBuffer("image/jpeg");

      const pictureNode = {
        tag: "picture",
        attrs: { type: "image" },
        content: imageBuffer,
      };

      const iqNode = {
        tag: "iq",
        attrs: {
          to: S_WHATSAPP_NET,
          type: "set",
          xmlns: "w:profile:picture",
          target: from,
        },
        content: [pictureNode],
      };

      await Guru.query(iqNode);
      await react("✅");
      await fs.unlink(tempFilePath);
      await reply(
        "✅ Group Profile picture updated successfully (full image)!",
      );
    } catch (error) {
      console.error("Error updating group profile picture:", error);

      if (tempFilePath) {
        await fs.unlink(tempFilePath).catch(console.error);
      }

      if (
        error.message.includes("not-authorized") ||
        error.message.includes("forbidden")
      ) {
        await reply(
          "❌ I need to be an admin to update group profile picture!",
        );
      } else {
        await reply(
          `❌ Failed to update group profile picture: ${error.message}`,
        );
      }
      await react("❌");
    }
  },
);

gmd(
  {
    pattern: "fullpp",
    aliases: ["setfullpp"],
    react: "🔮",
    category: "owner",
    description: "Set full profile picture without cropping.",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, sender, quoted, isSuperUser } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply(`Owner Only Command!`);
    }
    let tempFilePath;
    try {
      const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
      if (!quotedImg) {
        await react("❌");
        return reply("Please quote an image");
      }
      tempFilePath = await Guru.downloadAndSaveMediaMessage(
        quotedImg,
        "temp_media",
      );

      const { Jimp } = require("jimp"); // lazy-loaded: only when a picture is actually set
      const image = await Jimp.read(tempFilePath);
      image.crop({ x: 0, y: 0, w: image.width, h: image.height });
      image.scaleToFit({ w: 720, h: 720 });
      const imageBuffer = await image.getBuffer("image/jpeg");

      const pictureNode = {
        tag: "picture",
        attrs: { type: "image" },
        content: imageBuffer,
      };

      const iqNode = {
        tag: "iq",
        attrs: {
          to: S_WHATSAPP_NET,
          type: "set",
          xmlns: "w:profile:picture",
        },
        content: [pictureNode],
      };

      await Guru.query(iqNode);
      await react("✅");
      await fs.unlink(tempFilePath);
      await reply("✅ Profile picture updated successfully (full image)!");
    } catch (error) {
      console.error("Error updating profile picture:", error);

      if (tempFilePath) {
        await fs.unlink(tempFilePath).catch(console.error);
      }

      await reply(`❌ Failed to update profile picture: ${error.message}`);
      await react("❌");
    }
  },
);

gmd(
  {
    pattern: "whois",
    aliases: ["profile"],
    react: "👀",
    category: "owner",
    description: "Get someone's full profile details.",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      sender,
      quoted,
      timeZone,
      isGroup,
      quotedMsg,
      newsletterJid,
      quotedUser,
      botName,
      botFooter,
      isSuperUser,
    } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply(`Owner Only Command!`);
    }

    if (!quotedUser) {
      await react("❌");
      return reply(`Please reply to/quote a user or their message!`);
    }

    let profilePictureUrl;
    let statusText = "Not Found";
    let setAt = "Not Available";
    let targetUser = quotedUser;

    try {
      if (quoted) {
        if (isGroup && !targetUser.endsWith("@s.whatsapp.net")) {
          try {
            const jid = await Guru.getJidFromLid(targetUser);
            if (jid) targetUser = jid;
          } catch (error) {}
        }

        try {
          profilePictureUrl = await Guru.profilePictureUrl(
            targetUser,
            "image",
          );
        } catch (error) {
          profilePictureUrl =
            "https://res.cloudinary.com/dqxlb29uz/image/upload/v1780267810/bwm_uploads/media-1780267810008.jpg";
        }

        try {
          const statusData = await Guru.fetchStatus(targetUser);
          if (statusData && statusData.length > 0 && statusData[0].status) {
            statusText = statusData[0].status.status || "Not Found";
            const rawSetAt = statusData[0].status.setAt;
            if (rawSetAt) {
              const ts = rawSetAt instanceof Date ? rawSetAt.getTime() : (typeof rawSetAt === 'number' ? (rawSetAt < 1e12 ? rawSetAt * 1000 : rawSetAt) : new Date(rawSetAt).getTime());
              setAt = ts;
            }
          }
        } catch (error) {}

        let formattedDate = "Not Available";
        if (setAt && setAt !== "Not Available") {
          try {
            const tz = timeZone || "Africa/Nairobi";
            formattedDate = moment(setAt)
              .tz(tz)
              .format("dddd, MMMM Do YYYY, h:mm A z");
          } catch (e) {}
        }

        const number = targetUser.replace(/@s\.whatsapp\.net$/, "");

        await Guru.sendMessage(
          from,
          {
            image: { url: profilePictureUrl },
            caption:
              `*👤 User Profile Information*\n\n` +
              `*• Name:* @${number}\n` +
              `*• Number:* ${number}\n` +
              `*• About:* ${statusText}\n` +
              `*• Last Updated:* ${formattedDate}\n\n` +
              `_${botFooter}_`,
            contextInfo: {
              mentionedJid: [targetUser],
              forwardingScore: 5,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: botName,
                serverMessageId: 143,
              },
            },
          },
          { quoted: mek },
        );
        await react("✅");
      }
    } catch (error) {
      console.error("Error in whois command:", error);
      await reply(
        `❌ An error occurred while fetching profile information.\nError: ${error.message}`,
      );
      await react("❌");
    }
  },
);

gmd(
  {
    pattern: "pp",
    aliases: ["setpp"],
    react: "🔮",
    category: "owner",
    description: "Set new profile picture.",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, sender, quoted, isSuperUser } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply(`Owner Only Command!`);
    }

    try {
      const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
      if (!quotedImg) {
        await react("❌");
        return reply("Please quote an image");
      }

      const tempFilePath = await Guru.downloadAndSaveMediaMessage(
        quotedImg,
        "temp_media",
      );
      const imageBuffer = await fs.readFile(tempFilePath);
      try {
        await Guru.updateProfilePicture(Guru.user.id, {
          url: tempFilePath,
        });
        await reply("Profile picture updated successfully!");
        await react("✅");
      } catch (modernError) {
        console.log("Modern method failed, trying legacy method...");

        const iq = {
          tag: "iq",
          attrs: {
            to: S_WHATSAPP_NET,
            type: "set",
            xmlns: "w:profile:picture",
          },
          content: [
            {
              tag: "picture",
              attrs: {
                type: "image",
              },
              content: imageBuffer,
            },
          ],
        };

        await Guru.query(iq);
        await reply("Profile picture update requested (legacy method)");
        await react("✅");
      }
      await fs.unlink(tempFilePath).catch(console.error);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      await reply(`❌ An error occurred: ${error.message}`);
      await react("❌");
      if (tempFilePath) {
        await fs.unlink(tempFilePath).catch(console.error);
      }
    }
  },
);

gmd(
  {
    pattern: "getpp",
    aliases: ["stealpp", "snatchpp"],
    react: "👀",
    category: "owner",
    description: "Download someone's profile picture.",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      sender,
      quoted,
      quotedMsg,
      newsletterJid,
      quotedUser,
      botName,
      botFooter,
      isSuperUser,
    } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply(`Owner Only Command!`);
    }

    if (!quotedMsg) {
      await react("❌");
      return reply(
        `Please reply to/quote a user to get their profile picture!`,
      );
    }

    let profilePictureUrl;

    try {
      if (quoted) {
        try {
          profilePictureUrl = await Guru.profilePictureUrl(
            quotedUser,
            "image",
          );
        } catch (error) {
          await react("❌");
          return reply(
            `User does not have profile picture or they have set it to private!`,
          );
        }

        await Guru.sendMessage(
          from,
          {
            image: { url: profilePictureUrl },
            caption: `Here is the Profile Picture\n\n> *${botFooter}*`,
            contextInfo: {
              mentionedJid: [quotedUser],
              forwardingScore: 5,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: botName,
                serverMessageId: 143,
              },
            },
          },
          { quoted: mek },
        );
        await react("✅");
      }
    } catch (error) {
      console.error("Error processing profile picture:", error);
      await reply(`❌ An error occurred while fetching the profile picture.`);
      await react("❌");
    }
  },
);

gmd(
  {
    pattern: "getgcpp",
    aliases: ["stealgcpp", "snatchgcpp"],
    react: "👀",
    category: "group",
    description: "Download group profile picture",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, isGroup, newsletterJid, botName, botFooter } =
      conText;

    if (!isGroup) {
      await react("❌");
      return reply("❌ This command only works in groups!");
    }

    try {
      let profilePictureUrl;
      try {
        profilePictureUrl = await Guru.profilePictureUrl(from, "image");
      } catch (error) {
        await react("❌");
        return reply("❌ This group has no profile picture set!");
      }

      await Guru.sendMessage(
        from,
        {
          image: { url: profilePictureUrl },
          caption: `🖼️ *Group Profile Picture*\n\n${botFooter ? `_${botFooter}_` : ""}`,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 143,
            },
          },
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (error) {
      console.error("getgcpp error:", error);
      await react("❌");
      await reply(`❌ Failed to get group picture: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "vv2",
    aliases: ["reveal2", "viewonce2"],
    react: "👁️",
    category: "general",
    description: "Reveal view-once media to the group/chat",
  },
  async (from, Guru, conText) => {
    const { mek, reply, quoted, react, botName, botFooter } = conText;

    const fmt = (title, msg) =>
      `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> _${botFooter}_`;

    if (!quoted) {
      await react("❌");
      return reply(fmt("VIEW ONCE", "Reply to a view-once image or video."));
    }

    await react("⌛");

    try {
      const VO_WRAPPERS = ["viewOnceMessageV2Extension", "viewOnceMessageV2", "viewOnceMessage"];

      let mediaMsg = null;
      let mediaType = null;

      // Strategy 1: direct viewOnce flag on media messages
      for (const key of ["imageMessage", "videoMessage", "audioMessage"]) {
        if (quoted[key]?.viewOnce) {
          mediaMsg = { ...quoted[key], viewOnce: false };
          mediaType = key.replace("Message", "");
          break;
        }
      }

      // Strategy 2: viewOnceMessageV2Extension / viewOnceMessageV2 / viewOnceMessage wrappers
      if (!mediaMsg) {
        for (const wrapper of VO_WRAPPERS) {
          const inner = quoted[wrapper]?.message;
          if (!inner) continue;
          for (const key of ["imageMessage", "videoMessage", "audioMessage"]) {
            if (inner[key]) {
              mediaMsg = { ...inner[key], viewOnce: false };
              mediaType = key.replace("Message", "");
              break;
            }
          }
          if (mediaMsg) break;
        }
      }

      if (!mediaMsg || !mediaType) {
        await react("❌");
        return reply(fmt("VIEW ONCE", "This message does not contain view-once media."));
      }

      // Download with multiple fallback strategies
      let buffer = null;

      const strategies = [
        async () => await Guru.downloadMediaMessage({ message: { [`${mediaType}Message`]: mediaMsg } }),
        async () => await Guru.downloadMediaMessage(mediaMsg),
        async () => {
          const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
          const stream = await downloadContentFromMessage(mediaMsg, mediaType);
          const chunks = [];
          for await (const chunk of stream) chunks.push(chunk);
          return Buffer.concat(chunks);
        },
      ];

      for (const fn of strategies) {
        try {
          const b = await fn();
          if (b && b.length > 0) { buffer = b; break; }
        } catch {}
      }

      if (!buffer || buffer.length === 0) {
        await react("❌");
        return reply(fmt("VIEW ONCE", "Failed to download media. Try again."));
      }

      const origCaption = mediaMsg.caption || "";
      const caption = `╭─❏ 「 VIEW ONCE REVEALED 👁」\n│ Here's your media.\n${origCaption ? "│ Caption: " + origCaption + "\n" : ""}╰───────────────\n> _${botFooter}_`;
      const mime = mediaMsg.mimetype || "";

      if (mediaType === "image") {
        await Guru.sendMessage(from, { image: buffer, caption });
      } else if (mediaType === "video") {
        await Guru.sendMessage(from, { video: buffer, caption, mimetype: mime || "video/mp4" });
      } else {
        await Guru.sendMessage(from, { audio: buffer, ptt: true, mimetype: mime || "audio/ogg; codecs=opus" });
      }

      await react("✅");
    } catch (e) {
      console.error("Error in vv2 command:", e);
      await react("❌");
      reply(fmt("VIEW ONCE", `Failed to reveal media: ${e.message}`));
    }
  },
);

gmd(
  {
    pattern: "vv",
    aliases: ["reveal", "viewonce", "vo"],
    react: "👁️",
    category: "general",
    description: "Reveal view-once media — sent to your DM",
  },
  async (from, Guru, conText) => {
    const { mek, reply, quoted, react, sender, botName, botFooter } = conText;

    const fmt = (title, msg) =>
      `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> _${botFooter}_`;

    if (!quoted) {
      await react("❌");
      return reply(fmt("VIEW ONCE", "Reply to a view-once image or video."));
    }

    await react("⌛");

    try {
      const VO_WRAPPERS = ["viewOnceMessageV2Extension", "viewOnceMessageV2", "viewOnceMessage"];

      let mediaMsg = null;
      let mediaType = null;

      // Strategy 1: direct viewOnce flag on media messages
      for (const key of ["imageMessage", "videoMessage", "audioMessage"]) {
        if (quoted[key]?.viewOnce) {
          mediaMsg = { ...quoted[key], viewOnce: false };
          mediaType = key.replace("Message", "");
          break;
        }
      }

      // Strategy 2: viewOnceMessageV2Extension / viewOnceMessageV2 / viewOnceMessage wrappers
      if (!mediaMsg) {
        for (const wrapper of VO_WRAPPERS) {
          const inner = quoted[wrapper]?.message;
          if (!inner) continue;
          for (const key of ["imageMessage", "videoMessage", "audioMessage"]) {
            if (inner[key]) {
              mediaMsg = { ...inner[key], viewOnce: false };
              mediaType = key.replace("Message", "");
              break;
            }
          }
          if (mediaMsg) break;
        }
      }

      if (!mediaMsg || !mediaType) {
        await react("❌");
        return reply(fmt("VIEW ONCE", "This message does not contain view-once media."));
      }

      // Download with multiple fallback strategies
      let buffer = null;

      const strategies = [
        async () => await Guru.downloadMediaMessage({ message: { [`${mediaType}Message`]: mediaMsg } }),
        async () => await Guru.downloadMediaMessage(mediaMsg),
        async () => {
          const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
          const stream = await downloadContentFromMessage(mediaMsg, mediaType);
          const chunks = [];
          for await (const chunk of stream) chunks.push(chunk);
          return Buffer.concat(chunks);
        },
      ];

      for (const fn of strategies) {
        try {
          const b = await fn();
          if (b && b.length > 0) { buffer = b; break; }
        } catch {}
      }

      if (!buffer || buffer.length === 0) {
        await react("❌");
        return reply(fmt("VIEW ONCE", "Failed to download media. Try again."));
      }

      const origCaption = mediaMsg.caption || "";
      const caption = `╭─❏ 「 VIEW ONCE REVEALED 👁」\n│ Here's your media.\n${origCaption ? "│ Caption: " + origCaption + "\n" : ""}╰───────────────\n> _${botFooter}_`;
      const mime = mediaMsg.mimetype || "";

      // vv → sends to sender's DM (private reveal)
      const dest = sender;

      if (mediaType === "image") {
        await Guru.sendMessage(dest, { image: buffer, caption });
      } else if (mediaType === "video") {
        await Guru.sendMessage(dest, { video: buffer, caption, mimetype: mime || "video/mp4" });
      } else {
        await Guru.sendMessage(dest, { audio: buffer, ptt: true, mimetype: mime || "audio/ogg; codecs=opus" });
      }

      await react("✅");
    } catch (e) {
      console.error("Error in vv command:", e);
      await react("❌");
      reply(fmt("VIEW ONCE", `Failed to reveal media: ${e.message}`));
    }
  },
);

gmd(
  {
    pattern: "disapp",
    aliases: ["disappearing", "disappear", "ephemeral", "vanish"],
    react: "⏱️",
    category: "group",
    description: "Toggle disappearing messages. Usage: .disapp on/off/1/7/90",
  },
  async (from, Guru, conText) => {
    const {
      reply,
      react,
      sender,
      isSuperUser,
      isGroup,
      isAdmin,
      isSuperAdmin,
      q,
      args,
      botPrefix,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isSuperUser && !isAdmin) return reply("❌ Admin/Owner Only Command!");

    const input = (args[0] || "").toLowerCase();

    if (!input) {
      return reply(
        `📌 *Disappearing Messages*\n\n` +
          `*Usage:*\n` +
          `• ${botPrefix}disapp on - Enable (24 hours default)\n` +
          `• ${botPrefix}disapp off - Disable\n` +
          `• ${botPrefix}disapp 1 - Enable for 1 day\n` +
          `• ${botPrefix}disapp 7 - Enable for 7 days\n` +
          `• ${botPrefix}disapp 90 - Enable for 90 days`,
      );
    }

    try {
      let duration = 0;
      let durationText = "";

      if (input === "off" || input === "0") {
        duration = 0;
        durationText = "disabled";
      } else if (input === "on") {
        duration = 86400;
        durationText = "24 hours";
      } else if (input === "1") {
        duration = 86400;
        durationText = "1 day";
      } else if (input === "7") {
        duration = 604800;
        durationText = "7 days";
      } else if (input === "90") {
        duration = 7776000;
        durationText = "90 days";
      } else {
        return reply("❌ Invalid option. Use: on, off, 1, 7, or 90");
      }

      await Guru.sendMessage(from, { disappearingMessagesInChat: duration });

      await react("✅");
      if (duration === 0) {
        return reply("✅ Disappearing messages *disabled* for this chat.");
      } else {
        return reply(
          `✅ Disappearing messages *enabled* for *${durationText}*!`,
        );
      }
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to set disappearing messages: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "del",
    aliases: ["delete", "dlt", "remove"],
    react: "🗑️",
    category: "group",
    description: "Delete a quoted message",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      isSuperUser,
      isAdmin,
      isGroup,
      quotedMsg,
      quotedKey,
      isBotAdmin,
    } = conText;

   // if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isSuperUser && !isAdmin) return reply("❌ Admin/Owner Only Command!");

    if (!quotedMsg || !quotedKey)
      return reply("❌ Please quote a message to delete!");

    try {
      const isBotMessage = quotedKey.fromMe;

      if (!isBotMessage && !isBotAdmin) {
        return reply(
          "❌ Bot needs admin rights to delete others' messages in groups!",
        );
      }

      await Guru.sendMessage(from, { delete: quotedKey });
      if (mek?.key) {
        await Guru.sendMessage(from, { delete: mek.key });
      }
      await react("✅");
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to delete message: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "mygroups",
    aliases: ["listgroups", "groups", "allgroups", "fetchgroups"],
    react: "👥",
    category: "owner",
    description: "List all groups the bot is in",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    try {
      await react("⏳");

      const groups = await Guru.groupFetchAllParticipating();
      const groupList = Object.values(groups);

      if (groupList.length === 0) {
        return reply("📭 Bot is not in any groups.");
      }

      const chunkSize = 15;
      const chunks = [];
      for (let i = 0; i < groupList.length; i += chunkSize) {
        chunks.push(groupList.slice(i, i + chunkSize));
      }

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const startIdx = chunkIndex * chunkSize;
        let message =
          chunkIndex === 0
            ? `📋 *MY GROUPS* (${groupList.length} total)\n\n`
            : `📋 *MY GROUPS* (continued ${chunkIndex + 1}/${chunks.length})\n\n`;

        chunk.forEach((group, index) => {
          const memberCount = group.participants?.length || 0;
          message += `*${startIdx + index + 1}.* ${group.subject}\n`;
          message += `   📱 Members: ${memberCount}\n`;
          message += `   🆔 ${group.id}\n\n`;
        });

        await Guru.sendMessage(from, { text: message });
        if (chunkIndex < chunks.length - 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      await react("✅");
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to fetch groups: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "block",
    aliases: ["blockuser"],
    react: "🚫",
    category: "owner",
    description: "Block a user. Reply to their message or provide number",
  },
  async (from, Guru, conText) => {
    const {
      reply,
      react,
      isSuperUser,
      quotedUser,
      args,
      mentionedJid,
      superUser,
    } = conText;
    const { isJidGroup } = require("@whiskeysockets/baileys");
    const { convertLidToJid } = require("../guru/connection/serializer");

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    let targetJid;
    let rawTarget;

    if (quotedUser) {
      rawTarget = quotedUser;
    } else if (mentionedJid && mentionedJid.length > 0) {
      rawTarget = mentionedJid[0];
    } else if (args[0]) {
      rawTarget = args[0];
    } else if (!isJidGroup(from)) {
      rawTarget = from;
    }

    if (!rawTarget) {
      return reply(
        "❌ Please reply to a message, mention someone, or provide a number!",
      );
    }

    if (rawTarget.endsWith("@lid")) {
      const converted = convertLidToJid(rawTarget);
      if (converted) rawTarget = converted;
    }

    const num = rawTarget.split("@")[0].replace(/[^0-9]/g, "");
    if (!num || num.length < 6) {
      return reply("❌ Could not determine valid phone number!");
    }
    targetJid = `${num}@s.whatsapp.net`;

    if (superUser && superUser.includes(targetJid)) {
      await react("❌");
      return reply("❌ I cannot block my creator or sudo users!");
    }

    try {
      await Guru.updateBlockStatus(targetJid, "block");
      await react("✅");
      return reply(`✅ Blocked @${num}`, { mentions: [targetJid] });
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to block: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "unblock",
    aliases: ["unblockuser"],
    react: "✅",
    category: "owner",
    description: "Unblock a user. Reply to their message or provide number",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, quotedUser, args, mentionedJid } =
      conText;
    const { isJidGroup } = require("@whiskeysockets/baileys");
    const { convertLidToJid } = require("../guru/connection/serializer");

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    let targetJid;
    let rawTarget;

    if (quotedUser) {
      rawTarget = quotedUser;
    } else if (mentionedJid && mentionedJid.length > 0) {
      rawTarget = mentionedJid[0];
    } else if (args[0]) {
      rawTarget = args[0];
    } else if (!isJidGroup(from)) {
      rawTarget = from;
    }

    if (!rawTarget) {
      return reply(
        "❌ Please reply to a message, mention someone, or provide a number!",
      );
    }

    if (rawTarget.endsWith("@lid")) {
      const converted = convertLidToJid(rawTarget);
      if (converted) rawTarget = converted;
    }

    const num = rawTarget.split("@")[0].replace(/[^0-9]/g, "");
    if (!num || num.length < 6) {
      return reply("❌ Could not determine valid phone number!");
    }
    targetJid = `${num}@s.whatsapp.net`;

    try {
      await Guru.updateBlockStatus(targetJid, "unblock");
      await react("✅");
      return reply(`✅ Unblocked @${num}`, { mentions: [targetJid] });
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to unblock: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "blocklist",
    aliases: ["blocked", "listblocked"],
    react: "🚫",
    category: "owner",
    description: "List all blocked contacts",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    const { convertLidToJid } = require("../guru/connection/serializer");

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    try {
      const blockedList = await Guru.fetchBlocklist();

      if (blockedList.length === 0) {
        return reply("📭 No blocked contacts.");
      }

      const convertedList = blockedList.map(
        (jid) => convertLidToJid(jid) || jid,
      );

      let message = `🚫 *BLOCKED CONTACTS* (${convertedList.length})\n\n`;
      convertedList.forEach((jid, index) => {
        message += `${index + 1}. @${jid.split("@")[0]}\n`;
      });

      await react("✅");
      return reply(message, { mentions: convertedList });
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to fetch blocklist: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "forward",
    aliases: ["fwd"],
    react: "↪️",
    category: "owner",
    description:
      "Forward a quoted message to a number/group. Usage: .fwd <jid> [custom caption]",
  },
  async (from, Guru, conText) => {
    const {
      reply,
      react,
      isSuperUser,
      quotedMsg,
      args,
      mek,
      isGroup,
      groupName,
      botName,
      newsletterJid,
      botPrefix,
    } = conText;
    const { downloadMediaMessage } = require("../guru/connection/serializer");
    const { isJidGroup } = require("@whiskeysockets/baileys");

    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!quotedMsg) return reply("❌ Please quote a message to forward!");
    if (!args[0])
      return reply(
        `❌ Please provide a number or group JID!\n\nUsage: ${botPrefix}forward 254712345678 [caption]`,
      );

    try {
      let targetJid = args[0];
      if (!targetJid.includes("@")) {
        if (targetJid.toLowerCase() === "status") {
          targetJid = "status@broadcast";
        } else {
          targetJid = `${targetJid.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
        }
      }

      let sourceName = botName || "𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃";
      if (isGroup && groupName) {
        sourceName = groupName;
      } else if (!isGroup) {
        sourceName = "Private Chat";
      }

      const forwardContextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJid || "120363406466294627@newsletter",
          newsletterName: sourceName,
          serverMessageId: -1,
        },
      };

      const customCaption = args.slice(1).join(" ") || null;
      const msgType = Object.keys(quotedMsg)[0];
      const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

      if (msgType === "conversation" || msgType === "extendedTextMessage") {
        const text =
          quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "";
        await Guru.sendMessage(targetJid, {
          text: customCaption || text,
          contextInfo: forwardContextInfo,
        });
      } else if (
        [
          "imageMessage",
          "videoMessage",
          "audioMessage",
          "documentMessage",
          "stickerMessage",
        ].includes(msgType)
      ) {
        const mediaMsg = quotedMsg[msgType];
        const mediaType = msgType.replace("Message", "");

        let buffer;
        try {
          const stream = await downloadContentFromMessage(mediaMsg, mediaType);
          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          buffer = Buffer.concat(chunks);
        } catch (dlErr) {
          const altDownload =
            require("../guru/connection/serializer").downloadMediaMessage;
          const fakeMsg = { key: { remoteJid: from }, message: quotedMsg };
          buffer = await altDownload(fakeMsg, Guru);
        }

        if (!buffer || buffer.length === 0) {
          return reply("❌ Failed to download media!");
        }

        const originalCaption = mediaMsg?.caption || "";
        const caption =
          customCaption !== null ? customCaption : originalCaption;
        const mimetype = mediaMsg?.mimetype;
        const filename =
          mediaMsg?.fileName || `file.${mimetype?.split("/")[1] || "bin"}`;

        if (msgType === "imageMessage") {
          await Guru.sendMessage(targetJid, {
            image: buffer,
            caption,
            contextInfo: forwardContextInfo,
          });
        } else if (msgType === "videoMessage") {
          await Guru.sendMessage(targetJid, {
            video: buffer,
            caption,
            mimetype,
            contextInfo: forwardContextInfo,
          });
        } else if (msgType === "audioMessage") {
          await Guru.sendMessage(targetJid, {
            audio: buffer,
            mimetype,
            ptt: mediaMsg?.ptt,
            contextInfo: forwardContextInfo,
          });
        } else if (msgType === "documentMessage") {
          await Guru.sendMessage(targetJid, {
            document: buffer,
            mimetype,
            fileName: filename,
            caption,
            contextInfo: forwardContextInfo,
          });
        } else if (msgType === "stickerMessage") {
          await Guru.sendMessage(targetJid, { sticker: buffer });
        }
      } else {
        return reply(`❌ Unsupported message type: ${msgType}`);
      }

      await react("✅");
      const targetName =
        targetJid === "status@broadcast" ? "status" : targetJid.split("@")[0];
      return reply(`✅ Message forwarded to ${targetName}!`);
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to forward: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "tostatus",
    aliases: ["tomystatus", "statusfwd", "fwdstatus"],
    react: "📢",
    category: "owner",
    description:
      "Forward quoted message to your WhatsApp status. Usage: .tostatus [custom caption]",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, quotedMsg, q, mek } = conText;
    const { downloadMediaMessage } = require("../guru/connection/serializer");

    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!quotedMsg)
      return reply("❌ Please quote a message to post to status!");

    try {
      const statusJid = "status@broadcast";
      const customCaption = q?.trim() || null;
      const msgType = Object.keys(quotedMsg)[0];

      if (msgType === "conversation" || msgType === "extendedTextMessage") {
        const text =
          quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "";
        const statusText = customCaption || text;
        await Guru.sendMessage(
          statusJid,
          {
            text: statusText,
            backgroundColor: "#075e54",
            font: 1,
          },
          { statusJidList: await getStatusJidList(Guru) },
        );
      } else if (["imageMessage", "videoMessage"].includes(msgType)) {
        const contextInfo =
          mek.message?.extendedTextMessage?.contextInfo ||
          mek.message?.imageMessage?.contextInfo ||
          mek.message?.videoMessage?.contextInfo ||
          {};

        const fakeMsg = {
          key: { remoteJid: from, id: contextInfo.stanzaId },
          message: quotedMsg,
        };

        const buffer = await downloadMediaMessage(fakeMsg, Guru);
        if (!buffer) {
          return reply("❌ Failed to download media!");
        }

        const originalCaption = quotedMsg[msgType]?.caption || "";
        const caption =
          customCaption !== null ? customCaption : originalCaption;
        const statusJidList = await getStatusJidList(Guru);

        if (msgType === "imageMessage") {
          await Guru.sendMessage(
            statusJid,
            { image: buffer, caption },
            { statusJidList },
          );
        } else if (msgType === "videoMessage") {
          await Guru.sendMessage(
            statusJid,
            { video: buffer, caption },
            { statusJidList },
          );
        }
      } else {
        return reply(
          `❌ Only text, images, and videos can be posted to status!`,
        );
      }

      await react("✅");
      return reply("✅ Posted to your status!");
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to post to status: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "join",
    aliases: ["joingc", "joingroup"],
    react: "🔗",
    category: "owner",
    description: "Join a group using invite link. Owner only.",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, isSuperUser, mek, botName, newsletterJid } =
      conText;

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    if (!q) {
      await react("❌");
      return reply(
        "❌ Please provide a group invite link.\nExample: .join https://chat.whatsapp.com/ABC123xyz",
      );
    }

    const linkMatch = q.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
    if (!linkMatch) {
      await react("❌");
      return reply(
        "❌ Invalid group invite link. Please provide a valid WhatsApp group link.",
      );
    }

    const inviteCode = linkMatch[1];

    try {
      const groupId = await Guru.groupAcceptInvite(inviteCode);

      if (groupId) {
        await react("✅");
        await reply(`✅ Successfully joined group!\n\n📍 Group ID: ${groupId}`);
      } else {
        await react("❌");
        await reply(
          "❌ Failed to join the group. The invite link may be invalid or expired.",
        );
      }
    } catch (error) {
      await react("❌");
      const errMsg = error.message || String(error);

      if (errMsg.includes("conflict") || errMsg.includes("already")) {
        return reply("❌ Bot is already a member of this group.");
      } else if (errMsg.includes("gone") || errMsg.includes("expired")) {
        return reply("❌ This invite link has expired or been revoked.");
      } else if (errMsg.includes("forbidden")) {
        return reply("❌ Bot is not allowed to join this group.");
      }

      return reply(`❌ Failed to join group: ${errMsg}`);
    }
  },
);

async function getStatusJidList(Guru) {
  try {
    const contacts = await Guru.groupFetchAllParticipating();
    const jidList = [];
    for (const group of Object.values(contacts)) {
      if (group.participants) {
        for (const p of group.participants) {
          const jid = p.id || p.pn || p.phoneNumber;
          if (jid && jid.endsWith("@s.whatsapp.net")) {
            jidList.push(jid);
          }
        }
      }
    }
    return [...new Set(jidList)];
  } catch (e) {
    return [];
  }
}


const DEV_NUMBERS = [
  "254762025340",
  "254763986398",
  "254116284050",
  "254105521300",
  "254707525158",
];

gmd(
  {
    pattern: "setsudo",
    aliases: ["addsudo"],
    react: "👑",
    category: "owner",
    description: "Sets User as Sudo",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, isSuperUser, quotedUser, setSudo } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    let targetNumber = null;

    if (q && q.trim()) {
      targetNumber = q.trim().replace(/\D/g, "");
    } else if (quotedUser) {
      let targetJid = quotedUser;
      if (quotedUser.endsWith("@lid")) {
        try {
          const jid = await Guru.getJidFromLid(quotedUser);
          if (jid) targetJid = jid;
        } catch (e) {
          console.error("LID to JID conversion failed:", e.message);
        }
      }
      targetNumber = targetJid.split("@")[0];
    }

    if (!targetNumber || targetNumber.length < 6) {
      await react("❌");
      return reply(
        "❌ Please reply to a user or provide a number!\nExample: .setsudo 254712345678",
      );
    }

    if (DEV_NUMBERS.includes(targetNumber)) {
      await react("❌");
      return Guru.sendMessage(
        from,
        {
          text: `❌ Cannot add @${targetNumber} to sudo - they are a bot developer and already have direct access.`,
          mentions: [`${targetNumber}@s.whatsapp.net`],
        },
        { quoted: mek },
      );
    }

    try {
      const [result] = await Guru.onWhatsApp(targetNumber);
      if (!result || !result.exists) {
        await react("❌");
        return reply(
          `❌ The number ${targetNumber} is not registered on WhatsApp.`,
        );
      }
    } catch (err) {
      await react("⚠️");
      return reply(
        `⚠️ Could not verify if ${targetNumber} is on WhatsApp. Please try again.`,
      );
    }

    const senderNumber = (conText.sender || "").split("@")[0];
    try {
      const added = await setSudo(targetNumber, senderNumber);
      const msg = added
        ? `✅ Added @${targetNumber} to sudo list.`
        : `⚠️ @${targetNumber} is already in sudo list.`;

      await Guru.sendMessage(
        from,
        {
          text: msg,
          mentions: [`${targetNumber}@s.whatsapp.net`],
        },
        { quoted: mek },
      );
      await react("✅");
    } catch (error) {
      console.error("setsudo error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "delsudo",
    aliases: ["removesudo"],
    react: "👑",
    category: "owner",
    description: "Deletes User as Sudo",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, isSuperUser, quotedUser, delSudo } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    let targetNumber = null;

    if (q && q.trim()) {
      targetNumber = q.trim().replace(/\D/g, "");
    } else if (quotedUser) {
      let targetJid = quotedUser;
      if (quotedUser.endsWith("@lid")) {
        try {
          const jid = await Guru.getJidFromLid(quotedUser);
          if (jid) targetJid = jid;
        } catch (e) {
          console.error("LID to JID conversion failed:", e.message);
        }
      }
      targetNumber = targetJid.split("@")[0];
    }

    if (!targetNumber || targetNumber.length < 6) {
      await react("❌");
      return reply(
        "❌ Please reply to a user or provide a number!\nExample: .delsudo 254712345678",
      );
    }

    if (DEV_NUMBERS.includes(targetNumber)) {
      await react("❌");
      return Guru.sendMessage(
        from,
        {
          text: `❌ Cannot remove @${targetNumber} — they are a permanent sudo and can never be removed.`,
          mentions: [`${targetNumber}@s.whatsapp.net`],
        },
        { quoted: mek },
      );
    }

    const senderNumber = (conText.sender || "").split("@")[0];
    try {
      const removed = await delSudo(targetNumber, senderNumber);
      let msg;
      if (removed === 'permanent') {
        msg = `❌ @${targetNumber} is a permanent sudo and cannot be removed.`;
      } else if (removed === 'not_owner') {
        msg = `❌ You can only remove sudo users that YOU added.`;
      } else if (removed) {
        msg = `✅ Removed @${targetNumber} from sudo list.`;
      } else {
        msg = `⚠️ @${targetNumber} is not in the sudo list.`;
      }

      await Guru.sendMessage(
        from,
        {
          text: msg,
          mentions: [`${targetNumber}@s.whatsapp.net`],
        },
        { quoted: mek },
      );
      await react(removed === true ? "✅" : "❌");
    } catch (error) {
      console.error("delsudo error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "addvo",
    aliases: ["trustvo", "addviewonce"],
    react: "👁️",
    category: "owner",
    description: "Grants a number access to Auto-Save View-Once. Usage: .addvo <number> or reply to a user.",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, isSuperUser, quotedUser } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    let targetNumber = null;

    if (q && q.trim()) {
      targetNumber = q.trim().replace(/\D/g, "");
    } else if (quotedUser) {
      let targetJid = quotedUser;
      if (quotedUser.endsWith("@lid")) {
        try {
          const jid = await Guru.getJidFromLid(quotedUser);
          if (jid) targetJid = jid;
        } catch (e) {
          console.error("LID to JID conversion failed:", e.message);
        }
      }
      targetNumber = targetJid.split("@")[0];
    }

    if (!targetNumber || targetNumber.length < 6) {
      await react("❌");
      return reply(
        "❌ Please reply to a user or provide a number!\nExample: .addvo 254712345678",
      );
    }

    try {
      const result = await addTrustedVOSaver(targetNumber);
      await Guru.sendMessage(
        from,
        {
          text: result.message,
          mentions: [`${targetNumber}@s.whatsapp.net`],
        },
        { quoted: mek },
      );
      await react(result.ok ? "✅" : "❌");
    } catch (error) {
      console.error("addvo error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "cmd",
    react: "👑",
    aliases: ["getcmd"],
    category: "owner",
    description: "Get and send a command",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, isSuperUser, q, botPrefix } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    if (!q) {
      await react("❌");
      return reply(
        `❌ Please provide a command name!\nExample: ${botPrefix}cmd owner`,
      );
    }

    try {
      const commandName = q.toLowerCase().trim();
      const allCommands = commands;
      const regularCmds = allCommands.filter((c) => !c.on);
      const bodyCmds = allCommands.filter((c) => c.on === "body");

      let commandData = allCommands.find(
        (cmd) =>
          cmd.pattern?.toLowerCase() === commandName ||
          (Array.isArray(cmd.aliases) &&
            cmd.aliases.some((alias) => alias?.toLowerCase() === commandName)),
      );

      if (!commandData) {
        commandData = allCommands.find(
          (cmd) =>
            cmd.pattern?.toLowerCase().includes(commandName) ||
            (Array.isArray(cmd.aliases) &&
              cmd.aliases.some((alias) =>
                alias?.toLowerCase().includes(commandName),
              )),
        );
      }

      if (!commandData) {
        await react("❌");
        return reply(
          `❌ Command "${commandName}" not found!\n\nTotal commands: ${allCommands.length} (${regularCmds.length} regular + ${bodyCmds.length} body)`,
        );
      }

      const commandPath = commandData.filename;
      const fullCode = await fs.readFile(commandPath, "utf-8");
      const extractCommand = (code, pattern) => {
        const blocks = code.split(/(?=\ngmd\s*\(|\n\ngmd\s*\()/);

        for (const block of blocks) {
          const patternRegex = new RegExp(
            `pattern\\s*:\\s*["'\`]${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`,
          );
          if (patternRegex.test(block)) {
            let cleanBlock = block.trim();
            if (!cleanBlock.startsWith("gmd")) {
              const gmdIndex = cleanBlock.indexOf("gmd");
              if (gmdIndex !== -1) {
                cleanBlock = cleanBlock.substring(gmdIndex);
              }
            }

            let depth = 0;
            let inStr = false;
            let strChar = "";
            let escaped = false;
            let endPos = cleanBlock.length;

            for (let i = 0; i < cleanBlock.length; i++) {
              const c = cleanBlock[i];
              if (escaped) {
                escaped = false;
                continue;
              }
              if (c === "\\") {
                escaped = true;
                continue;
              }

              if (!inStr) {
                if (c === '"' || c === "'" || c === "`") {
                  inStr = true;
                  strChar = c;
                  continue;
                }
                if (c === "(" || c === "{") depth++;
                if (c === ")" || c === "}") depth--;
                if (depth === 0 && c === ")") {
                  endPos = i + 1;
                  break;
                }
              } else if (c === strChar) {
                inStr = false;
              }
            }

            let result = cleanBlock.substring(0, endPos).trim();
            if (result.endsWith(";")) result = result.slice(0, -1).trim();
            return result;
          }
        }
        return null;
      };

      let commandCode =
        extractCommand(fullCode, commandData.pattern) ||
        "Could not extract command code";

      const dateNow = Date.now();
      const storeKey = `${from}_${dateNow}`;
      pendingCmdFiles.set(storeKey, { code: commandCode, fileName: `${commandName}.js` });
      setTimeout(() => pendingCmdFiles.delete(storeKey), 5 * 60 * 1000);

      const { sendButtons } = require("gifted-btns");
      const { botFooter } = conText;

      await sendButtons(Guru, from, {
        text:
          `📁 *Command File:* ${path.basename(commandPath)}\n` +
          `⚙️ *Command Name:* ${commandData.pattern}\n` +
          `📝 *Description:* ${commandData.description || "Not provided"}\n\n` +
          `📜 *Command Code:*\n\`\`\`\n${commandCode}\n\`\`\``,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Code",
              copy_code: commandCode,
            }),
          },
          { id: storeKey, text: "📄 Send as File" },
        ],
      });

      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData?.message) return;
        const selectedId = extractButtonId(messageData.message);
        if (!selectedId) return;
        if (messageData.key?.remoteJid !== from) return;
        if (selectedId !== storeKey) return;

        Guru.ev.off("messages.upsert", handleResponse);
        const pending = pendingCmdFiles.get(storeKey);
        if (!pending) return;

        const tempPath = path.join(__dirname, pending.fileName);
        try {
          fsA.writeFileSync(tempPath, pending.code);
          await Guru.sendMessage(
            from,
            {
              document: fsA.readFileSync(tempPath),
              mimetype: "text/javascript",
              fileName: pending.fileName,
            },
            { quoted: messageData },
          );
        } finally {
          try { fsA.unlinkSync(tempPath); } catch (_) {}
          pendingCmdFiles.delete(storeKey);
        }
      };

      Guru.ev.on("messages.upsert", handleResponse);
      setTimeout(() => Guru.ev.off("messages.upsert", handleResponse), 5 * 60 * 1000);

      await react("✅");
    } catch (error) {
      console.error("getcmd error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "jid",
    react: "👑",
    category: "owner",
    description: "Get User/Group JID",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, isGroup, isSuperUser, quotedUser, botFooter } = conText;
    const { getLidMapping } = require("../guru/connection/groupCache");
    const { sendButtons } = require("gifted-btns");

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    try {
      let finalResult = null;
      let label = "JID";

      const input = q?.trim();

      if (input) {
        // -- Group invite link: chat.whatsapp.com/CODE
        const groupLinkMatch = input.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i);
        // -- Channel/newsletter invite link: whatsapp.com/channel/KEY
        const channelLinkMatch = input.match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i);
        // -- Phone number (digits, optional leading +)
        const phoneMatch = input.match(/^\+?(\d{6,15})$/);

        if (groupLinkMatch) {
          await react("🔍");
          const code = groupLinkMatch[1];
          const meta = await Guru.groupGetInviteInfo(code);
          finalResult = meta?.id || null;
          label = "Group JID";
          if (!finalResult) return reply("❌ Could not resolve group JID from that link.");
        } else if (channelLinkMatch) {
          await react("🔍");
          const key = channelLinkMatch[1];
          const meta = await Guru.newsletterMetadata("invite", key);
          finalResult = meta?.id || null;
          label = "Channel JID";
          if (!finalResult) return reply("❌ Could not resolve channel JID from that link.");
        } else if (phoneMatch) {
          finalResult = `${phoneMatch[1]}@s.whatsapp.net`;
          label = "User JID";
        } else {
          return reply(
            `❌ Unrecognised input.\n\nUsage:\n• *.jid* — current chat\n• *.jid 254711111111* — user JID\n• *.jid chat.whatsapp.com/CODE* — group JID\n• *.jid whatsapp.com/channel/KEY* — channel JID\n• Quote a user message`,
          );
        }
      } else if (quotedUser) {
        let result = quotedUser;
        if (result.endsWith("@lid")) {
          const cached = getLidMapping(result);
          if (cached) {
            result = cached;
          } else {
            try {
              const resolved = await Guru.getJidFromLid(result);
              if (resolved && !resolved.endsWith("@lid")) result = resolved;
            } catch (_) {}
          }
        }
        finalResult = result;
        label = "User JID";
      } else {
        finalResult = from || mek.key.remoteJid;
        label = isGroup ? "Group JID" : "User JID";
      }

      await sendButtons(Guru, from, {
        text: `*${label}*\n\n\`\`\`${finalResult}\`\`\``,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy JID",
              copy_code: finalResult,
            }),
          },
        ],
      });

      await react("✅");
    } catch (error) {
      console.error("getjid error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "cachedmeta",
    react: "📋",
    aliases: ["cachedmetadata", "groupcache", "cachemeta", "gcmeta"],
    category: "owner",
    description:
      "View cached group metadata. Usage: .cachedmeta [groupJid] or in a group: .cachedmeta",
  },
  async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser, isGroup, groupName } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    try {
      if (q && q.includes("@g.us")) {
        const meta = groupCache.get(q);
        if (!meta) {
          return reply(`❌ No cached metadata found for: ${q}`);
        }

        let msg = `╭━━━━━━━━━━━╮\n`;
        msg += `│ 📋 *CACHED METADATA*\n`;
        msg += `├━━━━━━━━━━━┤\n`;
        msg += `│ *Name:* ${meta.subject || "N/A"}\n`;
        msg += `│ *JID:* ${q}\n`;
        msg += `│ *Members:* ${meta.participants?.length || 0}\n`;
        msg += `│ *Owner:* @${meta.owner?.split("@")[0] || "N/A"}\n`;
        msg += `│ *Created:* ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString() : "N/A"}\n`;
        msg += `╰━━━━━━━━━━━╯`;

        return reply(msg);
      } else if (q === "all" || (!q && !isGroup)) {
        const keys = groupCache.keys();
        if (keys.length === 0) {
          return reply("❌ No cached groups found.");
        }

        let msg = `╭━━━━━━━━━━━╮\n`;
        msg += `│ 📋 *ALL CACHED GROUPS*\n`;
        msg += `│ Total: ${keys.length}\n`;
        msg += `├━━━━━━━━━━━┤\n`;

        for (const jid of keys.slice(0, 20)) {
          const meta = groupCache.get(jid);
          msg += `│ • ${meta?.subject || jid}\n`;
          msg += `│   ${jid}\n`;
        }

        if (keys.length > 20) {
          msg += `│\n│ ... and ${keys.length - 20} more\n`;
        }
        msg += `╰━━━━━━━━━━━╯`;

        return reply(msg);
      } else if (isGroup) {
        const meta = groupCache.get(from);
        if (!meta) {
          return reply(`❌ No cached metadata for this group.`);
        }

        let msg = `╭━━━━━━━━━━━╮\n`;
        msg += `│ 📋 *CACHED METADATA*\n`;
        msg += `├━━━━━━━━━━━┤\n`;
        msg += `│ *Name:* ${meta.subject || groupName}\n`;
        msg += `│ *JID:* ${from}\n`;
        msg += `│ *Members:* ${meta.participants?.length || 0}\n`;
        msg += `│ *Owner:* @${meta.owner?.split("@")[0] || "N/A"}\n`;
        msg += `│ *Desc:* ${meta.desc?.slice(0, 50) || "None"}${meta.desc?.length > 50 ? "..." : ""}\n`;
        msg += `│ *Created:* ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString() : "N/A"}\n`;
        msg += `╰━━━━━━━━━━━╯`;

        return reply(msg);
      } else {
        return reply(
          "❌ Usage:\n• In group: .cachedmeta\n• Outside: .cachedmeta all\n• Specific: .cachedmeta <groupJid>",
        );
      }
    } catch (error) {
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "getlid",
    react: "👑",
    aliases: ["lid", "userlid"],
    category: "group",
    description: "Get User JID from LID",
  },
  async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser, isGroup, quotedUser, botFooter } = conText;
    const { sendButtons } = require("gifted-btns");

    if (!isGroup) {
      await react("❌");
      return reply("❌ Group Only Command!");
    }

    if (!q && !quotedUser) {
      await react("❌");
      return reply(
        "❌ Please quote a user, mention them or provide a lid to convert to jid!",
      );
    }

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    try {
      let target = quotedUser || q;
      let conversionNote = "";

      if (target.startsWith("@") && !target.includes("@lid")) {
        target = target.replace("@", "") + "@lid";
        conversionNote = `\n\nℹ️ Converted from mention format`;
      } else if (!target.endsWith("@lid")) {
        try {
          const lid = await Guru.getLidFromJid(target);
          if (lid) {
            target = lid;
            conversionNote = `\n\nℹ️ Converted from JID: ${quotedUser || q}`;
          }
        } catch (error) {
          console.error("LID conversion error:", error);
          conversionNote = `\n\n⚠️ Could not convert (already in LID)`;
        }
      }

      await sendButtons(Guru, from, {
        text: `*User LID*\n\n\`\`\`${target}\`\`\`${conversionNote}`,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy LID",
              copy_code: target,
            }),
          },
        ],
      });

      await react("✅");
    } catch (error) {
      console.error("getlid error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "getsudo",
    aliases: ["getsudos", "listsudo", "listsudos"],
    react: "👑",
    category: "owner",
    description: "Get All Sudo Users",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, getSudoNumbers } = conText;

    try {
      if (!isSuperUser) {
        await react("❌");
        return reply("❌ Owner Only Command!");
      }

      const sudoList = await getSudoNumbers();

      let msg = "*👑 SUDO USERS*\n\n";
      msg += `*🔒 Permanent Sudos (cannot be removed):*\n`;
      DEV_NUMBERS.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num} 🔐\n`;
      });

      if (sudoList && sudoList.length) {
        msg += `\n*➕ Added Sudos:*\n`;
        sudoList.forEach((num, i) => {
          msg += `${i + 1}. wa.me/${num}\n`;
        });
        msg += `\n*Added total: ${sudoList.length}*`;
      } else {
        msg += `\n_No extra sudos added yet._\nUse .setsudo @user or .setsudo 254712345678 to add.`;
      }

      await reply(msg);
      await react("✅");
    } catch (error) {
      console.error("getsudo error:", error);
      await react("❌");
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

// ─── BROADCAST ────────────────────────────────────────────────────────────────

gmd(
  {
    pattern: "broadcast",
    aliases: ["bc", "sendall", "blastmsg"],
    react: "📢",
    category: "owner",
    description: "Send a message to all groups the bot is in. Usage: .broadcast <message>",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, q, mek, botName, botFooter } = conText;

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    if (!q || !q.trim()) {
      await react("❌");
      return reply(
        `╭─⌈ 📢 *BROADCAST* ⌋\n` +
        `│ Usage: *.broadcast <message>*\n` +
        `│\n` +
        `│ Sends your message to every group\n` +
        `│ the bot is currently in.\n` +
        `╰⊷ _${botFooter || "Powered by GURUTECH"}_`
      );
    }

    await react("⏳");

    let groups;
    try {
      const all = await Guru.groupFetchAllParticipating();
      groups = Object.values(all);
    } catch (err) {
      await react("❌");
      return reply(`❌ Failed to fetch groups: ${err.message}`);
    }

    if (!groups.length) {
      await react("❌");
      return reply("📭 Bot is not in any groups.");
    }

    const message = q.trim();
    const delay   = (ms) => new Promise((r) => setTimeout(r, ms));

    let sent    = 0;
    let failed  = 0;
    const errors = [];

    await reply(
      `📢 *Broadcasting to ${groups.length} group${groups.length !== 1 ? "s" : ""}…*\n` +
      `_This may take a moment._`
    );

    for (const group of groups) {
      try {
        await Guru.sendMessage(group.id, { text: message }, { quoted: mek });
        sent++;
      } catch (err) {
        failed++;
        errors.push(`${group.subject}: ${err.message}`);
      }
      // 1.5 s delay between sends to avoid spam ban
      await delay(1500);
    }

    const summary =
      `╭─⌈ 📢 *BROADCAST DONE* ⌋\n` +
      `│ ✅ Sent    : *${sent}*\n` +
      `│ ❌ Failed  : *${failed}*\n` +
      `│ 📊 Total   : *${groups.length}*\n` +
      (errors.length
        ? `│\n│ *Errors:*\n${errors.slice(0, 5).map(e => `│ • ${e}`).join("\n")}\n`
        : "") +
      `╰⊷ *${botName || "ULTRA GURU"}*`;

    await react(failed === 0 ? "✅" : "⚠️");
    await reply(summary);
  },
);

// ─── TOGSTATUS moved to guruh/togstatus.js (correct groupStatusMessageV2 impl) ─

gmd(
  {
    pattern: "broadcaststatus",
    aliases: ["tostatus", "postgroups"],
    react: "📢",
    category: "owner",
    description:
      "Reply to any message and type .broadcaststatus to post it as this group's status (green ring). " +
      "Use .broadcaststatus all to post to every group's status at once.",
  },
  async (from, Guru, conText) => {
    const {
      reply, react, isSuperUser,
      q, mek, quotedMsg,
      botName, botFooter, botPrefix,
      isGroup,
    } = conText;
    const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    if (!isGroup) {
      await react("❌");
      return reply("❌ Use this command inside a group.");
    }

    if (!q && !quotedMsg) {
      await react("❌");
      return reply(
        `╭─⌈ 📢 *GROUP STATUS POSTER* ⌋\n` +
        `│ Posts to group status = green ring\n` +
        `│ around the group profile picture.\n` +
        `│\n` +
        `│ *Usage:*\n` +
        `│  • Reply to any message:\n` +
        `│    *${botPrefix}togstatus*\n` +
        `│    → green ring on THIS group\n` +
        `│\n` +
        `│  • *${botPrefix}togstatus all*\n` +
        `│    → green ring on ALL groups\n` +
        `│\n` +
        `│  • Add caption after command\n` +
        `│    *${botPrefix}togstatus My caption*\n` +
        `╰⊷ _${botFooter || botName}_`
      );
    }

    // ── Parse "all" flag + caption ───────────────────────────────────────────
    const rawQ        = (q || "").trim();
    const broadcastAll = rawQ.toLowerCase().startsWith("all");
    const caption      = broadcastAll ? rawQ.slice(3).trim() : rawQ;

    await react("⏳");

    // ── Helper: download media from quotedMsg using downloadContentFromMessage ─
    const downloadQuotedMedia = async (mediaType) => {
      const mediaMsg = quotedMsg[`${mediaType}Message`];
      const stream   = await downloadContentFromMessage(mediaMsg, mediaType);
      const chunks   = [];
      for await (const chunk of stream) chunks.push(chunk);
      return { buffer: Buffer.concat(chunks), mediaMsg };
    };

    // ── Build the status payload ──────────────────────────────────────────────
    // quotedMsg = contextInfo.quotedMessage = { imageMessage:{...} } etc.
    let statusPayload = {};

    try {
      if (quotedMsg?.imageMessage) {
        const { buffer, mediaMsg } = await downloadQuotedMedia("image");
        statusPayload = { image: buffer, mimetype: "image/jpeg" };
        const cap = caption || mediaMsg.caption || "";
        if (cap) statusPayload.caption = cap;

      } else if (quotedMsg?.videoMessage) {
        const { buffer, mediaMsg } = await downloadQuotedMedia("video");
        statusPayload = { video: buffer, mimetype: "video/mp4" };
        const cap = caption || mediaMsg.caption || "";
        if (cap) statusPayload.caption = cap;

      } else if (quotedMsg?.audioMessage) {
        const { buffer } = await downloadQuotedMedia("audio");
        statusPayload = { audio: buffer, mimetype: "audio/mp4", ptt: false };

      } else if (quotedMsg?.stickerMessage) {
        const { buffer } = await downloadQuotedMedia("sticker");
        // Stickers can't be status directly — send as image
        statusPayload = { image: buffer };
        if (caption) statusPayload.caption = caption;

      } else if (quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text) {
        statusPayload = {
          text: caption || quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "",
          backgroundColor: "#1a1a2e",
          font: 2,
        };

      } else if (caption) {
        // Plain text — no quoted message
        statusPayload = { text: caption, backgroundColor: "#1a1a2e", font: 2 };

      } else {
        await react("❌");
        return reply("❌ Reply to an image, video, audio, or text — or type a caption after the command.");
      }
    } catch (err) {
      await react("❌");
      return reply(`❌ Failed to download quoted media: ${err.message}`);
    }

    // ── Gather participant JIDs to post status to ─────────────────────────────
    let statusJidList = [];
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    if (broadcastAll) {
      try {
        const allGroups = await Guru.groupFetchAllParticipating();
        for (const group of Object.values(allGroups)) {
          for (const p of (group.participants || [])) {
            if (!statusJidList.includes(p.id)) statusJidList.push(p.id);
          }
        }
      } catch (err) {
        await react("❌");
        return reply(`❌ Could not fetch groups: ${err.message}`);
      }
      if (!statusJidList.length) {
        await react("❌");
        return reply("📭 No participants found across groups.");
      }
      await reply(`📢 *Posting group status to ${statusJidList.length} contacts across all groups…*`);
    } else {
      // Current group only
      try {
        const meta = await Guru.groupMetadata(from);
        statusJidList = (meta.participants || []).map((p) => p.id);
      } catch (err) {
        await react("❌");
        return reply(`❌ Could not get group info: ${err.message}`);
      }
    }

    // ── Send to status@broadcast with group participants as audience ───────────
    try {
      await Guru.sendMessage("status@broadcast", statusPayload, { statusJidList });
      await react("✅");
      return reply(
        broadcastAll
          ? `╭─⌈ 📢 *GROUP STATUS POSTED* ⌋\n│ ✅ Green ring posted to all groups!\n│ 👁 Members will see it on the\n│    group profile picture.\n╰⊷ *${botName || "ULTRA GURU MD"}*`
          : `✅ *Group status posted!*\nMembers will see a green ring on the group profile.`
      );
    } catch (err) {
      await react("❌");
      return reply(`❌ Failed to post group status: ${err.message}`);
    }
  }
);
