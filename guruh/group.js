
const { gmd, getGroupMetadata, getLidMapping } = require("../guru");
const { getGroupSetting, setGroupSetting } = require("../guru/database/groupSettings");

gmd(
  {
    pattern: "unmute",
    react: "⏳",
    aliases: ["open", "groupopen", "gcopen", "adminonly", "adminsonly"],
    category: "group",
    description: "Open Group Chat.",
  },
  async (from, Gifted, conText) => {
    const { reply, isAdmin, isSuperAdmin, isGroup, isBotAdmin, mek, sender } =
      conText;

    if (!isGroup) {
      return reply("Groups Only Command only");
    }

    if (!isBotAdmin) {
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} This bot is not an admin`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    }

    if (!isAdmin && !isSuperAdmin) {
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} you are not an admin`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    }

    try {
      await Gifted.groupSettingUpdate(from, "not_announcement");
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} Group successfully unmuted as you wished!`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    } catch (error) {
      console.error("Unmute error:", error);
      return reply(`❌ Failed to unmute group: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "mute",
    react: "⏳",
    aliases: ["close", "groupmute", "gcmute", "gcclose"],
    category: "group",
    description: "Close Group Chat",
  },
  async (from, Gifted, conText) => {
    const { reply, isAdmin, isSuperAdmin, isGroup, isBotAdmin, mek, sender } =
      conText;

    if (!isGroup) {
      return reply("Groups Only Command only");
    }

    if (!isBotAdmin) {
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} This bot is not an admin`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    }

    if (!isAdmin && !isSuperAdmin) {
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} you are not an admin`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    }

    try {
      await Gifted.groupSettingUpdate(from, "announcement");
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} Group successfully muted as you wished!`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    } catch (error) {
      console.error("Mute error:", error);
      return reply(`❌ Failed to mute group: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "met",
    react: "⚡",
    category: "general",
    description: "Check group metadata",
  },
  async (from, Gifted, conText) => {
    const { mek, react, newsletterJid, botName } = conText;
    try {
      const gInfo = await getGroupMetadata(Gifted, from);

      const formatJid = (jid) => {
        if (!jid) return "N/A";
        const cleanJid = `@${jid.split("@")[0]}`;
        return cleanJid;
      };

      const superAdmins = [];
      const admins = [];
      const members = [];

      gInfo.participants.forEach((p) => {
        const formattedJid = formatJid(p.phoneNumber || p.pn || p.jid);
        if (p.admin === "superadmin") {
          superAdmins.push(`• ${formattedJid} - 👑 Super Admin`);
        } else if (p.admin === "admin") {
          admins.push(`• ${formattedJid} - 👮 Admin`);
        } else {
          members.push(`• ${formattedJid} - 👤 Member`);
        }
      });

      const allParticipants = [...superAdmins, ...admins, ...members].join(
        "\n",
      );

      const allAdmins = [
        ...superAdmins.map((s) => s.replace(" - 👑 Super Admin", "")),
        ...admins.map((a) => a.replace(" - 👮 Admin", "")),
      ];

      const metadataText = `
📌 *GROUP METADATA* 📌

🔹 *ID:* ${gInfo.id}
🔹 *Subject:* ${gInfo.subject || "None"}
🔹 *Subject Owner:* ${formatJid(gInfo.subjectOwnerPn || gInfo.subjectOwnerJid)}
🔹 *Subject Changed:* ${new Date(gInfo.subjectTime * 1000).toLocaleString()}
🔹 *Owner:* ${formatJid(gInfo.ownerPn || gInfo.ownerJid)}
🔹 *Creation Date:* ${new Date(gInfo.creation * 1000).toLocaleString()}
🔹 *Size:* ${gInfo.size} participants
🔹 *Description:* ${gInfo.desc || "None"}
🔹 *Description Owner:* ${formatJid(gInfo.descOwnerPn || gInfo.descOwnerJid)}
🔹 *Description Changed:* ${new Date(gInfo.descTime * 1000).toLocaleString()}

👑 *ADMINS (${superAdmins.length + admins.length})*
${allAdmins.join("\n") || "No admins"}

👥 *PARTICIPANTS (${gInfo.participants.length})*
${allParticipants}

ℹ️ *GROUP SETTINGS*
• Restrict: ${gInfo.restrict ? "✅" : "❌"}
• Announce: ${gInfo.announce ? "✅" : "❌"}
• Join Approval: ${gInfo.joinApprovalMode ? "✅" : "❌"}
• Member Add: ${gInfo.memberAddMode ? "✅" : "❌"}
• Community: ${gInfo.isCommunity ? "✅" : "❌"}
    `.trim();

      await Gifted.sendMessage(
        from,
        {
          text: metadataText,
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
      console.error("Error in metadata command:", error);
      await react("❌");
      await Gifted.sendMessage(
        from,
        { text: "Failed to fetch group metadata." },
        { quoted: mek },
      );
    }
  },
);

gmd(
  {
    pattern: "demote",
    react: "👑",
    category: "group",
    description: "Demote a user from being an admin.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      quotedUser,
      superUser,
      isSuperAdmin,
      isAdmin,
      isGroup,
      isBotAdmin,
      q,
      mentionedJid,
      groupAdmins,
      groupMetadata,
    } = conText;
    const { getLidMapping } = require("../guru/connection/groupCache");

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    const convertLidToJid = async (lid) => {
      if (!lid || !lid.includes("@lid")) return lid;
      const cached = getLidMapping(lid);
      if (cached) return cached;
      try {
        const result = await Gifted.getJidFromLid(lid);
        if (result) return result;
      } catch (e) {}
      return lid;
    };

    let targetJid = null;

    if (mentionedJid && mentionedJid.length > 0) {
      targetJid = await convertLidToJid(mentionedJid[0]);
    } else if (quotedUser) {
      targetJid = await convertLidToJid(quotedUser);
    } else if (q) {
      const num = q.replace(/[^0-9]/g, "");
      if (num.length >= 10) {
        targetJid = num + "@s.whatsapp.net";
      }
    }

    if (!targetJid || targetJid.includes("@lid")) {
      if (
        targetJid &&
        targetJid.includes("@lid") &&
        groupMetadata?.participants
      ) {
        const lidNum = targetJid.split("@")[0];
        const found = groupMetadata.participants.find(
          (p) =>
            p.lid?.split("@")[0] === lidNum || p.id?.split("@")[0] === lidNum,
        );
        if (found?.id) targetJid = found.id;
        else if (found?.pn) targetJid = found.pn + "@s.whatsapp.net";
      }
    }

    if (!targetJid || targetJid.includes("@lid")) {
      await react("❌");
      return reply(
        "❌ Could not identify user. Please provide their number directly.\nExample: .demote 254712345678",
      );
    }

    if (!targetJid.includes("@")) targetJid += "@s.whatsapp.net";

    const { isSuperUser } = require("../guru/database/sudo");
    const targetNum = targetJid.split("@")[0];
    const isTargetSuperUser = await isSuperUser(targetJid, Gifted);
    
    const standardizedSuperUsers = superUser.map((u) => u.split("@")[0]);
    if (isTargetSuperUser || standardizedSuperUsers.includes(targetNum)) {
      await react("❌");
      return reply("❌ I cannot demote a superuser!");
    }

    const groupSuperAdmins = conText.groupSuperAdmins || [];
    const adminNums = groupAdmins.map((a) => a.split("@")[0]);
    const superAdminNums = groupSuperAdmins.map((a) => a.split("@")[0]);
    const allAdminNums = [...adminNums, ...superAdminNums];

    let isTargetAdmin = allAdminNums.includes(targetNum);
    let isSuperAdminTarget = superAdminNums.includes(targetNum);

    if (groupMetadata?.participants) {
      const participant = groupMetadata.participants.find((p) => {
        const pNum = (p.id || p.pn || p.phoneNumber || "").split("@")[0];
        const pPn = (p.pn || "").split("@")[0];
        return pNum === targetNum || pPn === targetNum;
      });
      if (participant?.admin) {
        isTargetAdmin = true;
        if (participant.admin === "superadmin") isSuperAdminTarget = true;
      }
    }

    if (!isTargetAdmin) {
      return reply(`❌ @${targetNum} is not an admin.`, {
        mentions: [targetJid],
        contextInfo: { mentionedJid: [targetJid] },
      });
    }

    if (isSuperAdminTarget) {
      return reply(
        `❌ @${targetNum} is the group owner and cannot be demoted.`,
        {
          mentions: [targetJid],
          contextInfo: { mentionedJid: [targetJid] },
        },
      );
    }

    try {
      await Gifted.groupParticipantsUpdate(from, [targetJid], "demote");
      await react("✅");
      await reply(`👑 @${targetNum} is no longer an admin.`, {
        mentions: [targetJid],
        contextInfo: { mentionedJid: [targetJid] },
      });
    } catch (error) {
      await react("❌");
      if (
        error.message?.includes("403") ||
        error.message?.toLowerCase().includes("forbidden")
      ) {
        await reply(
          `❌ Cannot demote @${targetNum}. They may be a group owner or have higher privileges.`,
          {
            mentions: [targetJid],
          },
        );
      } else {
        await reply(`❌ Failed to demote: ${error.message}`);
      }
    }
  },
);

gmd(
  {
    pattern: "promote",
    aliases: ["toadmin"],
    react: "👑",
    category: "group",
    description: "Promote a user to admin.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      quotedUser,
      isSuperAdmin,
      isAdmin,
      isGroup,
      isBotAdmin,
      q,
      mentionedJid,
      groupAdmins,
      groupSuperAdmins,
      groupMetadata,
    } = conText;
    const { getLidMapping } = require("../guru/connection/groupCache");

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    const convertLidToJid = async (lid) => {
      if (!lid || !lid.includes("@lid")) return lid;
      const cached = getLidMapping(lid);
      if (cached) return cached;
      try {
        const result = await Gifted.getJidFromLid(lid);
        if (result) return result;
      } catch (e) {}
      return lid;
    };

    let targetJid = null;

    if (mentionedJid && mentionedJid.length > 0) {
      targetJid = await convertLidToJid(mentionedJid[0]);
    } else if (quotedUser) {
      targetJid = await convertLidToJid(quotedUser);
    } else if (q) {
      const num = q.replace(/[^0-9]/g, "");
      if (num.length >= 10) {
        targetJid = num + "@s.whatsapp.net";
      }
    }

    if (!targetJid || targetJid.includes("@lid")) {
      if (
        targetJid &&
        targetJid.includes("@lid") &&
        groupMetadata?.participants
      ) {
        const lidNum = targetJid.split("@")[0];
        const found = groupMetadata.participants.find(
          (p) =>
            p.lid?.split("@")[0] === lidNum || p.id?.split("@")[0] === lidNum,
        );
        if (found?.id) targetJid = found.id;
        else if (found?.pn) targetJid = found.pn + "@s.whatsapp.net";
      }
    }

    if (!targetJid || targetJid.includes("@lid")) {
      await react("❌");
      return reply(
        "❌ Could not identify user. Please provide their number directly.\nExample: .promote 254712345678",
      );
    }

    if (!targetJid.includes("@")) targetJid += "@s.whatsapp.net";

    const targetNum = targetJid.split("@")[0];
    const adminNums = groupAdmins
      ? groupAdmins.map((a) => a.split("@")[0])
      : [];
    const superAdminNums = groupSuperAdmins
      ? groupSuperAdmins.map((a) => a.split("@")[0])
      : [];
    const allAdminNums = [...adminNums, ...superAdminNums];

    let isAlreadyAdmin = allAdminNums.includes(targetNum);
    let isSuperAdminTarget = superAdminNums.includes(targetNum);

    if (groupMetadata?.participants) {
      const participant = groupMetadata.participants.find((p) => {
        const pNum = (p.id || p.pn || p.phoneNumber || "").split("@")[0];
        const pPn = (p.pn || "").split("@")[0];
        return pNum === targetNum || pPn === targetNum;
      });
      if (participant?.admin) {
        isAlreadyAdmin = true;
        if (participant.admin === "superadmin") isSuperAdminTarget = true;
      }
    }

    if (isSuperAdminTarget) {
      return reply(
        `❌ @${targetNum} is the group owner and is already an admin.`,
        {
          mentions: [targetJid],
          contextInfo: { mentionedJid: [targetJid] },
        },
      );
    }

    if (isAlreadyAdmin) {
      return reply(`❌ @${targetNum} is already an admin.`, {
        mentions: [targetJid],
        contextInfo: { mentionedJid: [targetJid] },
      });
    }

    try {
      await Gifted.groupParticipantsUpdate(from, [targetJid], "promote");
      await react("✅");
      await reply(`👑 @${targetNum} is now an admin.`, {
        mentions: [targetJid],
        contextInfo: { mentionedJid: [targetJid] },
      });
    } catch (error) {
      await react("❌");
      if (
        error.message?.includes("403") ||
        error.message?.toLowerCase().includes("forbidden")
      ) {
        await reply(
          `❌ Cannot promote @${targetNum}. They may not be a group member.`,
          {
            mentions: [targetJid],
          },
        );
      } else {
        await reply(`❌ Failed to promote: ${error.message}`);
      }
    }
  },
);

gmd(
  {
    pattern: "kick",
    aliases: ["remove"],
    react: "🚫",
    category: "group",
    description: "Remove a user from the group.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      quotedUser,
      superUser,
      isSuperAdmin,
      isAdmin,
      isGroup,
      isBotAdmin,
      q,
      mentionedJid,
      groupMetadata,
    } = conText;
    const { getLidMapping } = require("../guru/connection/groupCache");

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    const convertLidToJid = async (lid) => {
      if (!lid || !lid.includes("@lid")) return lid;
      const cached = getLidMapping(lid);
      if (cached) return cached;
      try {
        const result = await Gifted.getJidFromLid(lid);
        if (result) return result;
      } catch (e) {}
      return lid;
    };

    let targetJid = null;

    if (mentionedJid && mentionedJid.length > 0) {
      targetJid = await convertLidToJid(mentionedJid[0]);
    } else if (quotedUser) {
      targetJid = await convertLidToJid(quotedUser);
    } else if (q) {
      const num = q.replace(/[^0-9]/g, "");
      if (num.length >= 10) {
        targetJid = num + "@s.whatsapp.net";
      }
    }

    if (!targetJid || targetJid.includes("@lid")) {
      if (
        targetJid &&
        targetJid.includes("@lid") &&
        groupMetadata?.participants
      ) {
        const lidNum = targetJid.split("@")[0];
        const found = groupMetadata.participants.find(
          (p) =>
            p.lid?.split("@")[0] === lidNum || p.id?.split("@")[0] === lidNum,
        );
        if (found?.id) targetJid = found.id;
        else if (found?.pn) targetJid = found.pn + "@s.whatsapp.net";
      }
    }

    if (!targetJid || targetJid.includes("@lid")) {
      await react("❌");
      return reply(
        "❌ Could not identify user. Please provide their number directly.\nExample: .kick 254712345678",
      );
    }

    if (!targetJid.includes("@")) targetJid += "@s.whatsapp.net";

    const targetNum = targetJid.split("@")[0];
    const standardizedSuperUsers = superUser.map((u) => u.split("@")[0]);
    if (standardizedSuperUsers.includes(targetNum)) {
      await react("❌");
      return reply("❌ I cannot kick my creator!");
    }

    const botJid = Gifted.user?.id?.split(":")[0] + "@s.whatsapp.net";
    if (targetJid.toLowerCase() === botJid.toLowerCase()) {
      await react("❌");
      return reply("❌ I cannot kick myself!");
    }

    const groupSuperAdmins = conText.groupSuperAdmins || [];
    const superAdminNums = groupSuperAdmins.map((a) => a.split("@")[0]);
    let isSuperAdminTarget = superAdminNums.includes(targetNum);

    if (groupMetadata?.participants) {
      const participant = groupMetadata.participants.find((p) => {
        const pNum = (p.id || p.pn || p.phoneNumber || "").split("@")[0];
        const pPn = (p.pn || "").split("@")[0];
        return pNum === targetNum || pPn === targetNum;
      });
      if (participant?.admin === "superadmin") isSuperAdminTarget = true;
    }

    if (isSuperAdminTarget) {
      await react("❌");
      return reply(
        `❌ @${targetNum} is the group owner and cannot be kicked.`,
        {
          mentions: [targetJid],
          contextInfo: { mentionedJid: [targetJid] },
        },
      );
    }

    try {
      await Gifted.groupParticipantsUpdate(from, [targetJid], "remove");
      await react("✅");
      await reply(`🚫 @${targetNum} has been removed from the group.`, {
        mentions: [targetJid],
        contextInfo: { mentionedJid: [targetJid] },
      });
    } catch (error) {
      await react("❌");
      if (
        error.message?.includes("403") ||
        error.message?.toLowerCase().includes("forbidden")
      ) {
        await reply(
          `❌ Cannot kick @${targetNum}. They may be an admin or not in the group.`,
          {
            mentions: [targetJid],
          },
        );
      } else {
        await reply(`❌ Failed to remove user: ${error.message}`);
      }
    }
  },
);

gmd(
  {
    pattern: "add",
    aliases: ["invite"],
    react: "➕",
    category: "group",
    description: "Add a user to the group.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      isSuperAdmin,
      isAdmin,
      isGroup,
      isBotAdmin,
      q,
      groupMetadata,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    if (!q) {
      await react("❌");
      return reply(
        "❌ Please provide the number to add.\nExample: .add 254712345678",
      );
    }

    const num = q.replace(/[^0-9]/g, "");
    if (num.length < 10) {
      await react("❌");
      return reply(
        "❌ Invalid number format. Please provide a valid phone number.",
      );
    }

    const targetJid = num + "@s.whatsapp.net";

    try {
      const [result] = await Gifted.onWhatsApp(num);
      if (!result || !result.exists) {
        await react("❌");
        return reply(`❌ The number ${num} is not registered on WhatsApp.`);
      }
    } catch (err) {
      await react("⚠️");
      return reply(
        `⚠️ Could not verify if ${num} is on WhatsApp. Please try again.`,
      );
    }

    if (groupMetadata?.participants) {
      const alreadyInGroup = groupMetadata.participants.find((p) => {
        const pNum = (p.id || p.pn || p.phoneNumber || "").split("@")[0];
        return pNum === num;
      });
      if (alreadyInGroup) {
        await react("❌");
        return reply(`❌ @${num} is already in this group.`, {
          mentions: [targetJid],
          contextInfo: { mentionedJid: [targetJid] },
        });
      }
    }

    try {
      const result = await Gifted.groupParticipantsUpdate(
        from,
        [targetJid],
        "add",
      );
      const status = result[0]?.status;

      if (status === "403") {
        const meta = await Gifted.groupMetadata(from);
        const groupName = meta.subject;
        const inviteCode = await Gifted.groupInviteCode(from);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        await Gifted.sendMessage(targetJid, {
          text: `👋 Hello! You've been invited to join *${groupName}*\n\n🔗 *Invite Link:* ${inviteLink}\n\n_Click the link above to join the group._`,
        });

        await react("⚠️");
        await reply(
          `⚠️ @${num} has privacy settings that prevent adding them directly. An invite link has been sent to their DM.`,
          {
            mentions: [targetJid],
            contextInfo: { mentionedJid: [targetJid] },
          },
        );
      } else if (status === "408") {
        await react("❌");
        await reply(
          `❌ @${num} has left this group recently and cannot be added yet.`,
          {
            mentions: [targetJid],
            contextInfo: { mentionedJid: [targetJid] },
          },
        );
      } else if (status === "409") {
        await react("❌");
        await reply(`❌ @${num} is already in this group.`, {
          mentions: [targetJid],
          contextInfo: { mentionedJid: [targetJid] },
        });
      } else {
        await react("✅");
        await reply(`✅ @${num} has been added to the group.`, {
          mentions: [targetJid],
          contextInfo: { mentionedJid: [targetJid] },
        });
      }
    } catch (error) {
      await react("❌");
      await reply(`❌ Failed to add user: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "link",
    aliases: ["gclink", "grouplink", "invitelink", "invite"],
    react: "🔗",
    category: "group",
    description: "Get the group invite link.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      isAdmin,
      isSuperAdmin,
      isGroup,
      isBotAdmin,
      mek,
      botName,
      newsletterJid,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      const meta = await Gifted.groupMetadata(from);
      const groupName = meta.subject;
      const participantCount = meta.participants.length;
      const adminCount = meta.participants.filter(
        (p) => p.admin === "admin" || p.admin === "superadmin",
      ).length;

      const inviteCode = await Gifted.groupInviteCode(from);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      const linkText =
        `*🔗 Group Invite Link*\n\n` +
        `*Group:* ${groupName}\n` +
        `*Participants:* ${participantCount}\n` +
        `*Admins:* ${adminCount}\n\n` +
        `*Link:* ${inviteLink}`;

      await Gifted.sendMessage(
        from,
        {
          text: linkText,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (error) {
      await react("❌");
      await reply(`❌ Failed to get invite link: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "newgroup",
    aliases: ["newgc", "creategroup", "creategroup"],
    react: "🆕",
    category: "group",
    description: "Create a new group with the bot as admin.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isSuperUser,
      q,
      mek,
      botName,
      newsletterJid,
    } = conText;

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    if (!q || !q.trim()) {
      await react("❌");
      return reply(
        "❌ Please provide a group name.\nExample: .newgroup ATASSA MD",
      );
    }

    const groupName = q.trim();

    try {
      const group = await Gifted.groupCreate(groupName, [sender]);

      const inviteCode = await Gifted.groupInviteCode(group.id);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      const successText =
        `*🆕 Group Created Successfully!*\n\n` +
        `*Group Name:* ${groupName}\n` +
        `*Group ID:* ${group.id}\n\n` +
        `*Invite Link:* ${inviteLink}`;

      await Gifted.sendMessage(
        from,
        {
          text: successText,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (error) {
      await react("❌");
      await reply(`❌ Failed to create group: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "killgc",
    aliases: ["terminategc", "destroygc", "nukegc"],
    react: "💀",
    category: "group",
    description: "Terminate group - removes all members and bot leaves.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isSuperUser,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      mek,
      botName,
      newsletterJid,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      await Gifted.sendMessage(
        from,
        {
          text: `⚠️ *WARNING* ⚠️\n\n💀 *Group will be terminated now...*\n\n_All members will be removed._\n\n⚠️ _Using this command frequently might lead to WhatsApp bans._`,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const meta = await Gifted.groupMetadata(from);
      const participants = meta.participants;
      const botJid = Gifted.user?.id?.split(":")[0] + "@s.whatsapp.net";

      const membersToRemove = participants
        .filter((p) => p.id !== botJid && p.id !== sender)
        .map((p) => p.id);

      if (membersToRemove.length > 0) {
        await Gifted.groupParticipantsUpdate(from, membersToRemove, "remove");
      }

      await Gifted.groupLeave(from);
    } catch (error) {
      await react("❌");
      await reply(`❌ Failed to terminate group: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "accept",
    aliases: ["approve"],
    react: "✅",
    category: "group",
    description: "Accept a pending join request. Usage: .accept 254712345678",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      args,
      botPrefix,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    if (!args[0])
      return reply(
        `❌ Please provide a phone number.\n\n*Usage:* ${botPrefix}accept 254712345678`,
      );

    try {
      const number = args[0].replace(/[^0-9]/g, "");
      const userJid = `${number}@s.whatsapp.net`;

      await Gifted.groupRequestParticipantsUpdate(from, [userJid], "approve");

      await react("✅");
      return reply(`✅ Successfully approved @${number}'s join request!`, {
        mentions: [userJid],
      });
    } catch (error) {
      await react("❌");
      if (
        error.message?.includes("not-found") ||
        error.message?.includes("item-not-found")
      ) {
        return reply("❌ No pending join request found for this number.");
      }
      return reply(`❌ Failed to accept request: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "reject",
    aliases: ["decline"],
    react: "❌",
    category: "group",
    description: "Reject a pending join request. Usage: .reject 254712345678",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      args,
      botPrefix,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    if (!args[0])
      return reply(
        `❌ Please provide a phone number.\n\n*Usage:* ${botPrefix}reject 254712345678`,
      );

    try {
      const number = args[0].replace(/[^0-9]/g, "");
      const userJid = `${number}@s.whatsapp.net`;

      await Gifted.groupRequestParticipantsUpdate(from, [userJid], "reject");

      await react("✅");
      return reply(`✅ Successfully rejected @${number}'s join request!`, {
        mentions: [userJid],
      });
    } catch (error) {
      await react("❌");
      if (
        error.message?.includes("not-found") ||
        error.message?.includes("item-not-found")
      ) {
        return reply("❌ No pending join request found for this number.");
      }
      return reply(`❌ Failed to reject request: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "acceptall",
    aliases: ["approveall"],
    react: "✅",
    category: "group",
    description: "Accept all pending join requests in the group.",
  },
  async (from, Gifted, conText) => {
    const { reply, react, sender, isGroup, isBotAdmin, isAdmin, isSuperAdmin } =
      conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      const pendingRequests = await Gifted.groupRequestParticipantsList(from);

      if (!pendingRequests || pendingRequests.length === 0) {
        return reply("📭 No pending join requests in this group.");
      }

      const jids = pendingRequests.map((r) => r.jid);
      await Gifted.groupRequestParticipantsUpdate(from, jids, "approve");

      await react("✅");
      return reply(
        `✅ Successfully approved *${jids.length}* pending join request(s)!`,
      );
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to accept all requests: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "rejectall",
    aliases: ["declineall"],
    react: "❌",
    category: "group",
    description: "Reject all pending join requests in the group.",
  },
  async (from, Gifted, conText) => {
    const { reply, react, sender, isGroup, isBotAdmin, isAdmin, isSuperAdmin } =
      conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      const pendingRequests = await Gifted.groupRequestParticipantsList(from);

      if (!pendingRequests || pendingRequests.length === 0) {
        return reply("📭 No pending join requests in this group.");
      }

      const jids = pendingRequests.map((r) => r.jid);
      await Gifted.groupRequestParticipantsUpdate(from, jids, "reject");

      await react("✅");
      return reply(
        `✅ Successfully rejected *${jids.length}* pending join request(s)!`,
      );
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to reject all requests: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "online",
    aliases: ["listonline", "whos online", "whosonline"],
    react: "🟢",
    category: "group",
    description: "List members who are currently online in the group.",
  },
  async (from, Gifted, conText) => {
    const { reply, react, sender, isGroup, mek, botName, newsletterJid } =
      conText;

    if (!isGroup) return reply("❌ This command only works in groups!");

    try {
      await reply("🔍 Checking online members... Please wait...");

      const groupMeta = await Gifted.groupMetadata(from);
      const participants = groupMeta.participants;

      const onlineMembers = [];
      const presenceData = new Map();

      const presenceHandler = (update) => {
        const chatJid = update.id;
        if (update.presences) {
          for (const [jid, presence] of Object.entries(update.presences)) {
            presenceData.set(jid, presence);
            const numOnly = jid.split("@")[0];
            presenceData.set(numOnly, presence);
          }
        }
      };

      Gifted.ev.on("presence.update", presenceHandler);

      try {
        const batchSize = 5;
        for (let i = 0; i < participants.length; i += batchSize) {
          const batch = participants.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (p) => {
              const jid = p.id || p.jid;
              try {
                await Gifted.presenceSubscribe(jid);
              } catch (e) {}
            }),
          );
          await new Promise((r) => setTimeout(r, 500));
        }

        await new Promise((r) => setTimeout(r, 2000));

        for (const p of participants) {
          const participantId = p.id || p.jid;
          const numOnly = participantId.split("@")[0];

          let presence =
            presenceData.get(participantId) || presenceData.get(numOnly);

          if (!presence && p.pn) {
            presence =
              presenceData.get(p.pn) || presenceData.get(p.pn.split("@")[0]);
          }

          if (
            presence?.lastKnownPresence === "composing" ||
            presence?.lastKnownPresence === "recording" ||
            presence?.lastKnownPresence === "available"
          ) {
            let displayJid = participantId;
            if (participantId.endsWith("@lid")) {
              const cachedJid = getLidMapping(participantId);
              if (cachedJid) {
                displayJid = cachedJid;
              } else if (p.pn) {
                displayJid = p.pn;
              }
            }
            const number = displayJid.split("@")[0];
            const name = p.notify || p.name || number;
            onlineMembers.push({ jid: displayJid, name, number });
          }
        }
      } finally {
        Gifted.ev.off("presence.update", presenceHandler);
      }

      if (onlineMembers.length === 0) {
        await react("😴");
        return reply(
          "😴 No members are currently typing or recording.\n\n_Note: This only detects active typing/recording presence._",
        );
      }

      const mentions = onlineMembers.map((m) => m.jid);
      const memberList = onlineMembers
        .map((m, i) => `${i + 1}. @${m.name}`)
        .join("\n");

      const message =
        `🟢 *ACTIVE MEMBERS (Typing/Recording)*\n\n` +
        `📊 *${onlineMembers.length}* of *${participants.length}* members active\n\n` +
        `${memberList}\n\n` +
        `_Note: Only shows members currently typing or recording._`;

      await react("✅");
      await Gifted.sendMessage(
        from,
        {
          text: message,
          mentions: mentions,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to check online members: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "resetlink",
    aliases: [
      "resetgclink",
      "revoke",
      "resetgrouplink",
      "revokelink",
      "newlink",
    ],
    react: "🔄",
    category: "group",
    description: "Reset the group invite link and get a new one.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      mek,
      botName,
      newsletterJid,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      await Gifted.groupRevokeInvite(from);

      const newInviteCode = await Gifted.groupInviteCode(from);
      const newLink = `https://chat.whatsapp.com/${newInviteCode}`;

      const groupMeta = await Gifted.groupMetadata(from);
      const groupName = groupMeta.subject;
      const totalMembers = groupMeta.participants.length;
      const totalAdmins = groupMeta.participants.filter(
        (p) => p.admin === "admin" || p.admin === "superadmin",
      ).length;

      const message =
        `🔄 *GROUP LINK RESET*\n\n` +
        `📛 *Group:* ${groupName}\n` +
        `👥 *Total Members:* ${totalMembers}\n` +
        `👑 *Total Admins:* ${totalAdmins}\n\n` +
        `🔗 *New Link:*\n${newLink}\n\n` +
        `_The old invite link has been revoked._`;

      await react("✅");
      await Gifted.sendMessage(
        from,
        {
          text: message,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to reset group link: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "left",
    aliases: ["leave", "exitgroup", "exitgc"],
    react: "👋",
    category: "group",
    description: "Bot leaves the group. Owner only.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isGroup,
      isSuperUser,
      mek,
      botName,
      newsletterJid,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isSuperUser) return reply("❌ Owner Only Command!");

    try {
      await Gifted.sendMessage(
        from,
        {
          text: `👋 *Goodbye!*\n\n_${botName} is leaving this group..._`,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );

      await new Promise((r) => setTimeout(r, 1000));
      await Gifted.groupLeave(from);
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to leave group: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "listrequests",
    aliases: ["joinrequests", "listjoinrequests", "pendingrequests"],
    react: "📋",
    category: "group",
    description: "List all pending join requests in the group.",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      mek,
      botName,
      newsletterJid,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      const pendingRequests = await Gifted.groupRequestParticipantsList(from);

      if (!pendingRequests || pendingRequests.length === 0) {
        await react("📭");
        return reply("📭 No pending join requests in this group.");
      }

      const resolvedJids = await Promise.all(
        pendingRequests.map(async (r) => {
          let jid = r.jid;
          if (jid.endsWith("@lid")) {
            const cachedJid = getLidMapping(jid);
            if (cachedJid) {
              jid = cachedJid;
            } else if (Gifted.getJidFromLid) {
              try {
                const resolved = await Gifted.getJidFromLid(jid);
                if (resolved) jid = resolved;
              } catch {}
            }
          }
          return jid;
        }),
      );

      const requestList = resolvedJids
        .map((jid, i) => {
          const number = jid.split("@")[0];
          return `${i + 1}. @${number}`;
        })
        .join("\n");

      const mentions = resolvedJids;

      const message =
        `📋 *PENDING JOIN REQUESTS*\n\n` +
        `📊 Total: *${pendingRequests.length}* request(s)\n\n` +
        `${requestList}\n\n` +
        `_Use .accept <number> or .acceptall to approve_\n` +
        `_Use .reject <number> or .rejectall to decline_`;

      await react("✅");
      await Gifted.sendMessage(
        from,
        {
          text: message,
          mentions: mentions,
          contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0,
            },
          },
        },
        { quoted: mek },
      );
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to list requests: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "togroupstatus",
    aliases: ["groupstatus", "statusgroup", "togcstatus"],
    react: "📢",
    category: "group",
    description: "Send text or quoted media to group status. Superuser only.",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, isGroup, q, quoted, quotedMsg, mek, formatAudio, formatVideo, botPrefix } = conText;
    const { downloadMediaMessage } = require("gifted-baileys");

    if (!isGroup) return reply("❌ Group only command!");
    if (!isSuperUser) return reply("❌ Owner Only Command!");

    if (!q && !quotedMsg) {
      return reply(
        `📌 *Usage:*\n` +
          `• ${botPrefix}togroupstatus <text>\n` +
          `• Reply to image/video/audio with ${botPrefix}togroupstatus <caption>\n` +
          `• Or just ${botPrefix}togroupstatus to forward quoted media`,
      );
    }

    try {
      let statusPayload = {};

      if (quotedMsg) {
        if (quoted?.imageMessage) {
          const caption = q || quoted.imageMessage.caption || "";
          const buffer = await downloadMediaMessage(
            { message: quotedMsg },
            "buffer",
            {},
          );
          statusPayload = { 
            image: buffer,
            mimetype: "image/jpeg"
          };
          if (caption) statusPayload.caption = caption;
        } else if (quoted?.videoMessage) {
          const caption = q || quoted.videoMessage.caption || "";
          let buffer = await downloadMediaMessage(
            { message: quotedMsg },
            "buffer",
            {},
          );
          buffer = await formatVideo(buffer);
          statusPayload = { 
            video: buffer,
            mimetype: "video/mp4"
          };
          if (caption) statusPayload.caption = caption;
        } else if (quoted?.audioMessage) {
          let buffer = await downloadMediaMessage(
            { message: quotedMsg },
            "buffer",
            {},
          );
          buffer = await formatAudio(buffer);
          statusPayload = { 
            audio: buffer,
            mimetype: "audio/mp4",
            ptt: true
          };
        } else if (quoted?.conversation || quoted?.extendedTextMessage?.text) {
          statusPayload.text = quoted.conversation || quoted.extendedTextMessage.text;
        } else {
          return reply("❌ Unsupported media type for group status.");
        }

        if (q && !statusPayload.caption && !statusPayload.text) {
          statusPayload.caption = q;
        }
      } else {
        statusPayload.text = q;
      }

      await Gifted.giftedStatus.sendGroupStatus(from, statusPayload);
      await react("✅");
    } catch (error) {
      console.error("togroupstatus error:", error);
      await react("❌");
      return reply(`❌ Error sending group status: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "groupname",
    aliases: [
      "gcname",
      "setgcname",
      "setgroupname",
      "gcsubject",
      "setgcsubject",
    ],
    react: "✏️",
    category: "group",
    description: "Change group name/subject. Usage: .groupname New Group Name",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      q,
      botPrefix,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    if (!q)
      return reply(
        `❌ Please provide a new group name.\n\n*Usage:* ${botPrefix}groupname New Group Name`,
      );

    try {
      await Gifted.groupUpdateSubject(from, q);
      await react("✅");
      return reply(`✅ Group name changed to: *${q}*`);
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to change group name: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "gcdesc",
    aliases: [
      "groupdesc",
      "setgcdesc",
      "setgroupdesc",
      "description",
      "setdescription",
    ],
    react: "📝",
    category: "group",
    description: "Change group description. Usage: .gcdesc New Description",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      sender,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      q,
      botPrefix,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    if (!q)
      return reply(
        `❌ Please provide a new group description.\n\n*Usage:* ${botPrefix}gcdesc New Description Here`,
      );

    try {
      await Gifted.groupUpdateDescription(from, q);
      await react("✅");
      return reply(`✅ Group description updated successfully!`);
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to change group description: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "everyone",
    react: "📢",
    aliases: ["tag", "all", "mention"],
    category: "group",
    description: "Tag everyone in the group with custom message",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      isAdmin,
      isSuperAdmin,
      isGroup,
      mek,
      q,
      participants,
      sender,
      botName,
      newsletterJid,
    } = conText;

    if (!isGroup) {
      return reply("❌ This command can only be used in groups!");
    }

    if (!isAdmin && !isSuperAdmin) {
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} Only group admins can use this command!`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    }

    const subject = q || "everyone";
    const mentionedJids = participants
      .map((p) => {
        const jid =
          typeof p === "string"
            ? p
            : p.id || p.jid || p.pn || p.phoneNumber || "";
        if (!jid) return null;
        return jid.includes("@") ? jid : `${jid}@s.whatsapp.net`;
      })
      .filter(Boolean);

    try {
      await Gifted.sendMessage(
        from,
        {
          text: `@${from}`,
          contextInfo: {
            mentionedJid: mentionedJids,
            groupMentions: [
              {
                groupJid: from,
                groupSubject: subject,
              },
            ],
            forwardingScore: 1,
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
    } catch (error) {
      console.error("Tag custom error:", error);
      return reply(`❌ Failed to tag custom: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "hidetag",
    react: "📢",
    aliases: ["htag", "hidden", "hidtag"],
    category: "group",
    description: "Send a message that secretly tags everyone",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      isAdmin,
      isSuperAdmin,
      isGroup,
      mek,
      q,
      participants,
      sender,
      quotedMsg,
      botName,
      newsletterJid,
      botPrefix,
    } = conText;

    if (!isGroup) {
      return reply("❌ This command can only be used in groups!");
    }

    if (!isAdmin && !isSuperAdmin) {
      const userNumber = sender.split("@")[0];
      return reply(`@${userNumber} Only group admins can use this command!`, {
        mentions: [`${userNumber}@s.whatsapp.net`],
      });
    }

    let text = q;
    if (!text && quotedMsg) {
      text =
        quotedMsg.conversation ||
        quotedMsg.extendedTextMessage?.text ||
        quotedMsg.imageMessage?.caption ||
        quotedMsg.videoMessage?.caption ||
        "";
    }

    if (!text) {
      return reply(
        `❌ Please provide a message or reply to one.\n\n*Usage:* ${botPrefix}hidetag Your message here`,
      );
    }

    const mentionedJids = participants
      .map((p) => {
        const jid =
          typeof p === "string"
            ? p
            : p.id || p.jid || p.pn || p.phoneNumber || "";
        if (!jid) return null;
        return jid.includes("@") ? jid : `${jid}@s.whatsapp.net`;
      })
      .filter(Boolean);

    try {
      await Gifted.sendMessage(
        from,
        {
          text: text,
          contextInfo: {
            mentionedJid: mentionedJids,
            forwardingScore: 1,
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
    } catch (error) {
      console.error("Hidetag error:", error);
      return reply(`❌ Failed to send hidden tag: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "antigroupmention",
    aliases: [
      "antigcmention",
      "antimentiongroup",
      "antigcstatusmention",
      "antistatusmention",
    ],
    react: "🛡️",
    category: "group",
    description:
      "Toggle anti-group-mention protection. Modes: on/warn (default), kick, off",
  },
  async (from, Gifted, conText) => {
    const {
      reply,
      react,
      isGroup,
      isBotAdmin,
      isAdmin,
      isSuperAdmin,
      q,
      mek,
      botName,
      botPrefix,
    } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      const currentSetting = await getGroupSetting(from, "ANTIGROUPMENTION");
      const arg = q?.toLowerCase()?.trim();

      if (!arg) {
        const status =
          currentSetting === "false" || currentSetting === "off"
            ? "OFF"
            : `ON (${currentSetting})`;
        return reply(
          `🛡️ *Anti-Group-Mention Status*\n\nCurrent: *${status}*\n\n*Usage:*\n• ${botPrefix}antigroupmention on - Enable with warnings\n• ${botPrefix}antigroupmention warn - Enable with warnings\n• ${botPrefix}antigroupmention delete - Delete message only\n• ${botPrefix}antigroupmention kick - Kick immediately\n• ${botPrefix}antigroupmention off - Disable`,
        );
      }

      let newValue;
      let message;

      if (arg === "on" || arg === "true" || arg === "warn") {
        newValue = "warn";
        message = `✅ Anti-Group-Mention *ENABLED* with warnings!\n\nUsers who mention this group in their status will be warned and kicked after reaching the warn limit.`;
      } else if (arg === "delete") {
        newValue = "delete";
        message = `✅ Anti-Group-Mention *ENABLED* with delete!\n\nMessages mentioning this group in status will be deleted with a warning. No kick action.`;
      } else if (arg === "kick") {
        newValue = "kick";
        message = `✅ Anti-Group-Mention *ENABLED* with immediate kick!\n\nUsers who mention this group in their status will be kicked immediately.`;
      } else if (arg === "off" || arg === "false") {
        newValue = "false";
        message = `❌ Anti-Group-Mention *DISABLED*!`;
      } else {
        return reply(`❌ Invalid option. Use: on, warn, delete, kick, or off`);
      }

      await setGroupSetting(from, "ANTIGROUPMENTION", newValue);
      await react("✅");
      return reply(message);
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to update setting: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setantigcmentionwarnlimit",
    aliases: [
      "antigcmentionwarnlimit",
      "setantigroupmentionwarn",
      "antigroupmentionwarnlimit",
      "antigcwarnlimit2",
    ],
    react: "⚙️",
    category: "group",
    description: "Set the warning limit for anti-group-mention before kicking",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isGroup, isBotAdmin, isAdmin, isSuperAdmin, q, mek, botPrefix } =
      conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin)
      return reply("❌ You must be an admin to use this command!");

    try {
      const currentLimit = await getGroupSetting(
        from,
        "ANTIGROUPMENTION_WARN_COUNT",
      );

      if (!q || !q.trim()) {
        return reply(
          `⚙️ *Anti-Group-Mention Warn Limit*\n\nCurrent: *${currentLimit || 3}* warnings\n\n*Usage:* ${botPrefix}setantigcmentionwarnlimit <number>\n*Example:* ${botPrefix}setantigcmentionwarnlimit 5`,
        );
      }

      const newLimit = parseInt(q.trim());
      if (isNaN(newLimit) || newLimit < 1 || newLimit > 50) {
        return reply(`❌ Please provide a valid number between 1 and 50`);
      }

      await setGroupSetting(
        from,
        "ANTIGROUPMENTION_WARN_COUNT",
        String(newLimit),
      );
      await react("✅");
      return reply(
        `✅ Anti-Group-Mention warn limit set to *${newLimit}*!\n\nUsers will be kicked after ${newLimit} warnings.`,
      );
    } catch (error) {
      await react("❌");
      return reply(`❌ Failed to update warn limit: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "tagall",
    react: "📢",
    aliases: ["mentionall"],
    category: "group",
    description: "Tag all group members with optional message",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isAdmin, isSuperAdmin, isGroup, isSuperUser, mek, sender, q, botName } = conText;

    if (!isGroup) {
      return reply("❌ This command only works in groups!");
    }

    if (!isAdmin && !isSuperAdmin && !isSuperUser) {
      return reply("❌ Admin/Owner Only Command!");
    }

    try {
      const meta = await Gifted.groupMetadata(from);
      const participants = meta.participants;

      const superAdmins = [];
      const admins = [];
      const members = [];

      for (let p of participants) {
        if (p.admin === "superadmin") {
          superAdmins.push(p.id);
        } else if (p.admin === "admin") {
          admins.push(p.id);
        } else {
          members.push(p.id);
        }
      }

      const sortedParticipants = [...superAdmins, ...admins, ...members];
      let mentions = sortedParticipants;

      let text = `*${botName} TAGALL*\n\n`;
      
      if (q && q.trim()) {
        text += `*Message:* ${q.trim()}\n\n`;
      }
      
      text += `*Tagged By:* @${sender.split('@')[0]}\n\n`;
      text += `*Tagged Members:*\n`;

      for (let id of superAdmins) {
        text += `👑 @${id.split('@')[0]}\n`;
      }
      for (let id of admins) {
        text += `👮 @${id.split('@')[0]}\n`;
      }
      for (let id of members) {
        text += `👤 @${id.split('@')[0]}\n`;
      }

      mentions.push(sender);

      await Gifted.sendMessage(from, {
        text: text.trim(),
        mentions
      }, { quoted: mek });

      await react("✅");
    } catch (error) {
      console.error("Tagall error:", error);
      return reply(`❌ Failed to tag all: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "tagadmins",
    react: "👮",
    aliases: ["taggcadmins", "taggroupadmins"],
    category: "group",
    description: "Tag all group admins with optional message",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isAdmin, isSuperAdmin, isGroup, isSuperUser, mek, sender, q, botName } = conText;

    if (!isGroup) {
      return reply("❌ This command only works in groups!");
    }

    if (!isAdmin && !isSuperAdmin && !isSuperUser) {
      return reply("❌ Admin/Owner Only Command!");
    }

    try {
      const meta = await Gifted.groupMetadata(from);
      const participants = meta.participants;

      const superAdmins = [];
      const admins = [];

      for (let p of participants) {
        if (p.admin === "superadmin") {
          superAdmins.push(p.id);
        } else if (p.admin === "admin") {
          admins.push(p.id);
        }
      }

      const allAdmins = [...superAdmins, ...admins];
      
      if (allAdmins.length === 0) {
        return reply("❌ No admins found in this group!");
      }

      let mentions = [...allAdmins, sender];

      let text = `*${botName} TAG ADMINS*\n\n`;
      
      if (q && q.trim()) {
        text += `*Message:* ${q.trim()}\n\n`;
      }
      
      text += `*Tagged By:* @${sender.split('@')[0]}\n\n`;
      text += `*Tagged Admins:*\n`;

      for (let id of superAdmins) {
        text += `👑 @${id.split('@')[0]}\n`;
      }
      for (let id of admins) {
        text += `👮 @${id.split('@')[0]}\n`;
      }

      await Gifted.sendMessage(from, {
        text: text.trim(),
        mentions
      }, { quoted: mek });

      await react("✅");
    } catch (error) {
      console.error("Tagadmins error:", error);
      return reply(`❌ Failed to tag admins: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "antipromote",
    react: "🛡️",
    category: "group",
    description: "Toggle anti-promote protection. Demotes both promoter and promoted user.",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isGroup, isBotAdmin, isAdmin, isSuperAdmin, args, botPrefix } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ You must be an admin to use this command!");

    const action = args[0]?.toLowerCase();
    const rawCurrent = await getGroupSetting(from, "ANTIPROMOTE");
    const current = rawCurrent === "true" ? "true" : "false";
    
    if (!action || !["on", "off"].includes(action)) {
      return reply(`🛡️ *Anti-Promote Protection*\n\nCurrent: ${current === "true" ? "ON ✅" : "OFF ❌"}\n\n*Usage:*\n${botPrefix}antipromote on - Enable\n${botPrefix}antipromote off - Disable\n\n_When enabled, if someone promotes another user, both will be demoted._`);
    }

    const value = action === "on" ? "true" : "false";
    if (current === value) {
      return reply(`⚠️ Anti-Promote is already ${action === "on" ? "ON" : "OFF"}!`);
    }
    
    await setGroupSetting(from, "ANTIPROMOTE", value);
    await react("✅");
    return reply(`✅ Anti-Promote is now ${action === "on" ? "ON" : "OFF"} for this group.`);
  },
);

gmd(
  {
    pattern: "antidemote",
    react: "🛡️",
    category: "group",
    description: "Toggle anti-demote protection. Demotes demoter and re-promotes demoted user.",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isGroup, isBotAdmin, isAdmin, isSuperAdmin, args, botPrefix } = conText;

    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isBotAdmin) return reply("❌ Bot is not an admin in this group!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ You must be an admin to use this command!");

    const action = args[0]?.toLowerCase();
    const rawCurrent = await getGroupSetting(from, "ANTIDEMOTE");
    const current = rawCurrent === "true" ? "true" : "false";
    
    if (!action || !["on", "off"].includes(action)) {
      return reply(`🛡️ *Anti-Demote Protection*\n\nCurrent: ${current === "true" ? "ON ✅" : "OFF ❌"}\n\n*Usage:*\n${botPrefix}antidemote on - Enable\n${botPrefix}antidemote off - Disable\n\n_When enabled, if someone demotes an admin, the demoter gets demoted and the demoted user is re-promoted._`);
    }

    const value = action === "on" ? "true" : "false";
    if (current === value) {
      return reply(`⚠️ Anti-Demote is already ${action === "on" ? "ON" : "OFF"}!`);
    }
    
    await setGroupSetting(from, "ANTIDEMOTE", value);
    await react("✅");
    return reply(`✅ Anti-Demote is now ${action === "on" ? "ON" : "OFF"} for this group.`);
  },
);
