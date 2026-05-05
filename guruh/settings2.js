
const { gmd } = require("../guru/gmdCmds");
const { getSetting, setSetting } = require("../guru/database/settings");
const {
  getGroupSetting,
  setGroupSetting,
  resetAllGroupSettings,
  getAllGroupSettings,
} = require("../guru/database/groupSettings");
const { clearAllSudo, getSudoNumbers } = require("../guru/database/sudo");
const {
  getAllUsersNotes,
  deleteNoteById,
  updateNoteById,
  deleteAllNotes,
} = require("../guru/database/notes");

function parseBooleanInput(input) {
  if (!input) return null;
  const val = input.toLowerCase().trim();
  if (val === "on") return "true";
  if (val === "off") return "false";
  return val;
}

function formatBoolDisplay(val) {
  return val === "true" ? "ON" : "OFF";
}

function isSettingEnabled(val) {
  if (!val) return false;
  const v = String(val).toLowerCase().trim();
  return (
    v === "true" ||
    v === "on" ||
    v === "1" ||
    v === "yes" ||
    v === "warn" ||
    v === "kick" ||
    v === "delete"
  );
}

gmd(
  {
    pattern: "setautolikestatus",
    aliases: ["autolikestatus", "autostatuslike", "statuslike", "autolike", "likestatus"],
    react: "⚙️",
    category: "owner",
    description: "Set auto like status (on/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getSetting("AUTO_LIKE_STATUS");
      if (current === value) {
        return reply(
          `⚠️ Auto like status is already: *${formatBoolDisplay(value)}*`,
        );
      }
      await setSetting("AUTO_LIKE_STATUS", value);
      await react("✅");
      await reply(`✅ Auto like status set to: *${formatBoolDisplay(value)}*\n\n⚠️ Note: Auto like only works when auto view (*autoreadstatus*) is also *ON*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautoreadstatus",
    aliases: ["autoreadstatus", "readstatus", "viewstatus"],
    react: "⚙️",
    category: "owner",
    description: "Set auto read status (on/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getSetting("AUTO_READ_STATUS");
      if (current === value) {
        return reply(
          `⚠️ Auto read status is already: *${formatBoolDisplay(value)}*`,
        );
      }
      await setSetting("AUTO_READ_STATUS", value);
      await react("✅");
      await reply(`✅ Auto read status set to: *${formatBoolDisplay(value)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setstatusemojis",
    aliases: ["statusemojis", "likeemojis"],
    react: "⚙️",
    category: "owner",
    description: "Set status like emojis (comma separated)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q)
      return reply(
        "❌ Please provide emojis separated by commas!\nExample: .setstatusemojis 💛,❤️,💜",
      );
    try {
      const current = await getSetting("STATUS_LIKE_EMOJIS");
      if (current === q.trim()) {
        return reply(`⚠️ Status emojis are already set to: *${q.trim()}*`);
      }
      await setSetting("STATUS_LIKE_EMOJIS", q.trim());
      await react("✅");
      await reply(`✅ Status emojis set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setstatusreplytext",
    aliases: ["statusreplytext", "statusreply"],
    react: "⚙️",
    category: "owner",
    description: "Set status reply text",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide reply text!");
    try {
      const current = await getSetting("STATUS_REPLY_TEXT");
      if (current === q.trim()) {
        return reply(`⚠️ Status reply text is already set to this value!`);
      }
      await setSetting("STATUS_REPLY_TEXT", q.trim());
      await react("✅");
      await reply(`✅ Status reply text updated!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautoreact",
    aliases: ["autoreact", "react"],
    react: "⚙️",
    category: "owner",
    description: "Set auto react mode (on/all/dm/groups/commands/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");

    const input = (q || "").toLowerCase().trim();
    const validModes = ["on", "all", "dm", "groups", "commands", "off"];

    if (!input || !validModes.includes(input)) {
      return reply(
        `❌ Please specify a valid mode:\n• *on/all* - React to all messages\n• *dm* - React to private chats only\n• *groups* - React to group messages only\n• *commands* - React to bot commands only\n• *off* - Disable auto react`,
      );
    }

    const value = input === "on" ? "all" : input;

    try {
      const current = await getSetting("AUTO_REACT");
      if (current === value) {
        return reply(
          `⚠️ Auto react is already set to: *${value.toUpperCase()}*`,
        );
      }
      await setSetting("AUTO_REACT", value);
      await react("✅");
      await reply(`✅ Auto react set to: *${value.toUpperCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautoreply",
    aliases: ["autoreply"],
    react: "⚙️",
    category: "owner",
    description: "Set auto reply (on/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getSetting("AUTO_REPLY");
      if (current === value) {
        return reply(`⚠️ Auto reply is already: *${formatBoolDisplay(value)}*`);
      }
      await setSetting("AUTO_REPLY", value);
      await react("✅");
      await reply(`✅ Auto reply set to: *${formatBoolDisplay(value)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautobio",
    aliases: ["autobio", "bio"],
    react: "⚙️",
    category: "owner",
    description: "Set auto bio (on/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getSetting("AUTO_BIO");
      if (current === value) {
        return reply(`⚠️ Auto bio is already: *${formatBoolDisplay(value)}*`);
      }
      await setSetting("AUTO_BIO", value);
      await react("✅");
      await reply(`✅ Auto bio set to: *${formatBoolDisplay(value)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautoblock",
    aliases: ["autoblock", "blockcountry"],
    react: "⚙️",
    category: "owner",
    description:
      "Set auto block country codes (comma separated or empty to disable)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    try {
      const value = q ? q.trim() : "";
      const current = await getSetting("AUTO_BLOCK");
      if (current === value) {
        if (value) {
          return reply(`⚠️ Auto block is already set to: *${value}*`);
        } else {
          return reply(`⚠️ Auto block is already disabled!`);
        }
      }
      await setSetting("AUTO_BLOCK", value);
      await react("✅");
      if (value) {
        await reply(`✅ Auto block set for country codes: *${value}*`);
      } else {
        await reply(`✅ Auto block disabled`);
      }
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautoread",
    aliases: ["autoread", "readmessages"],
    react: "⚙️",
    category: "owner",
    description: "Set auto read messages mode (on/all/dm/groups/commands/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");

    const input = (q || "").toLowerCase().trim();
    const validModes = ["on", "all", "dm", "groups", "commands", "off"];

    if (!input || !validModes.includes(input)) {
      return reply(
        `❌ Please specify a valid mode:\n• *on/all* - Read all messages\n• *dm* - Read private chats only\n• *groups* - Read group messages only\n• *commands* - Read bot commands only\n• *off* - Disable auto read`,
      );
    }

    const value = input === "on" ? "all" : input;

    try {
      const current = await getSetting("AUTO_READ_MESSAGES");
      if (current === value) {
        return reply(
          `⚠️ Auto read messages is already set to: *${value.toUpperCase()}*`,
        );
      }
      await setSetting("AUTO_READ_MESSAGES", value);
      await react("✅");
      await reply(`✅ Auto read messages set to: *${value.toUpperCase()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setytlink",
    aliases: ["ytlink", "youtube", "setyt"],
    react: "⚙️",
    category: "owner",
    description: "Set YouTube channel link",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a YouTube link!");
    try {
      const current = await getSetting("YT");
      if (current === q.trim()) {
        return reply(`⚠️ YouTube link is already set to: *${q.trim()}*`);
      }
      await setSetting("YT", q.trim());
      await react("✅");
      await reply(`✅ YouTube link set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setnewsletterjid",
    aliases: ["newsletterjid", "channeljid"],
    react: "⚙️",
    category: "owner",
    description: "Set newsletter JID",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a newsletter JID!");
    try {
      const current = await getSetting("NEWSLETTER_JID");
      if (current === q.trim()) {
        return reply(`⚠️ Newsletter JID is already set to this value!`);
      }
      await setSetting("NEWSLETTER_JID", q.trim());
      await react("✅");
      await reply(`✅ Newsletter JID set!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setgcjid",
    aliases: ["gcjid", "groupjid", "supportgc"],
    react: "⚙️",
    category: "owner",
    description: "Set group chat JID/invite code",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a group JID or invite code!");
    try {
      const current = await getSetting("GC_JID");
      if (current === q.trim()) {
        return reply(`⚠️ Group JID is already set to this value!`);
      }
      await setSetting("GC_JID", q.trim());
      await react("✅");
      await reply(`✅ Group JID set!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setnewsletterurl",
    aliases: ["newsletterurl", "channelurl"],
    react: "⚙️",
    category: "owner",
    description: "Set newsletter URL",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a newsletter URL!");
    try {
      const current = await getSetting("NEWSLETTER_URL");
      if (current === q.trim()) {
        return reply(`⚠️ Newsletter URL is already set to this value!`);
      }
      await setSetting("NEWSLETTER_URL", q.trim());
      await react("✅");
      await reply(`✅ Newsletter URL set!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setbotrepo",
    aliases: ["botrepo", "repo", "setrepo"],
    react: "⚙️",
    category: "owner",
    description: "Set bot repository",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a repository!");
    try {
      const current = await getSetting("BOT_REPO");
      if (current === q.trim()) {
        return reply(`⚠️ Bot repository is already set to: *${q.trim()}*`);
      }
      await setSetting("BOT_REPO", q.trim());
      await react("✅");
      await reply(`✅ Bot repository set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setpackname",
    aliases: ["packname", "stickerpack", "stickername"],
    react: "⚙️",
    category: "owner",
    description: "Set sticker pack name",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a pack name!");
    try {
      const current = await getSetting("PACK_NAME");
      if (current === q.trim()) {
        return reply(`⚠️ Pack name is already set to: *${q.trim()}*`);
      }
      await setSetting("PACK_NAME", q.trim());
      await react("✅");
      await reply(`✅ Pack name set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setpackauthor",
    aliases: ["packauthor", "stickerauthor"],
    react: "⚙️",
    category: "owner",
    description: "Set sticker pack author",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a pack author!");
    try {
      const current = await getSetting("PACK_AUTHOR");
      if (current === q.trim()) {
        return reply(`⚠️ Pack author is already set to: *${q.trim()}*`);
      }
      await setSetting("PACK_AUTHOR", q.trim());
      await react("✅");
      await reply(`✅ Pack author set to: *${q.trim()}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "getsetting",
    aliases: ["getconfig", "viewsetting"],
    react: "⚙️",
    category: "owner",
    description: "Get a specific setting value",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q)
      return reply(
        "❌ Please provide a setting key!\nExample: .getsetting PREFIX",
      );
    try {
      const value = await getSetting(q.toUpperCase().trim());
      await react("✅");
      await reply(`⚙️ *${q.toUpperCase()}:* ${value || "Not Set"}`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setsetting",
    aliases: ["setconfig", "config"],
    react: "⚙️",
    category: "owner",
    description: "Set any setting (key value)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q || !q.includes(" ")) {
      return reply(
        "❌ Please provide key and value!\nExample: .setsetting PREFIX !",
      );
    }
    try {
      const parts = q.split(" ");
      const key = parts[0].toUpperCase();
      const value = parts.slice(1).join(" ");
      const current = await getSetting(key);
      if (current === value) {
        return reply(`⚠️ *${key}* is already set to: *${value}*`);
      }
      await setSetting(key, value);
      await react("✅");
      await reply(`✅ *${key}* set to: *${value}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "resetsetting",
    aliases: ["resetconfig", "defaultsetting"],
    react: "⚙️",
    category: "owner",
    description: "Reset a setting to default",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    if (!q) return reply("❌ Please provide a setting key to reset!");
    try {
      const defaultValue = await resetSetting(q.toUpperCase().trim());
      await react("✅");
      await reply(
        `✅ *${q.toUpperCase()}* reset to default: *${defaultValue || "Not Set"}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "resetallsettings",
    aliases: ["resetsettings", "resetall", "defaultsettings"],
    react: "⚙️",
    category: "owner",
    description: "Reset all settings to defaults",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    try {
      await resetAllSettings();
      await react("✅");
      await reply(`✅ All settings have been reset to defaults!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setautoreplystatus",
    aliases: ["autoreplystatus", "replystatusauto"],
    react: "⚙️",
    category: "owner",
    description: "Set auto reply to status (on/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getSetting("AUTO_REPLY_STATUS");
      if (current === value) {
        return reply(
          `⚠️ Auto reply status is already: *${formatBoolDisplay(value)}*`,
        );
      }
      await setSetting("AUTO_REPLY_STATUS", value);
      await react("✅");
      await reply(`✅ Auto reply status set to: *${formatBoolDisplay(value)}*\n\n⚠️ Note: Auto reply to status only works when auto view (*autoreadstatus*) is also *ON*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setpmpermit",
    aliases: ["pmpermit"],
    react: "⚙️",
    category: "owner",
    description: "Set PM permit (on/off)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getSetting("PM_PERMIT");
      if (current === value) {
        return reply(`⚠️ PM Permit is already: *${formatBoolDisplay(value)}*`);
      }
      await setSetting("PM_PERMIT", value);
      await react("✅");
      await reply(`✅ PM Permit set to: *${formatBoolDisplay(value)}*`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "setgroupevents",
    aliases: ["groupevents", "gcevents", "setgcevents", "events"],
    react: "⚙️",
    category: "group",
    description:
      "Set group events notifications for this group (on/off) - promotes/demotes",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser, isGroup, isAdmin } = conText;
    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isSuperUser && !isAdmin) return reply("❌ Admin/Owner Only Command!");
    const valid = ["true", "false"];
    const value = parseBooleanInput(q);
    if (!value || !valid.includes(value)) {
      return reply(`❌ Please specify: on or off`);
    }
    try {
      const current = await getGroupSetting(from, "GROUP_EVENTS");
      if (current === value) {
        return reply(
          `⚠️ Group events for this group is already: *${formatBoolDisplay(value)}*`,
        );
      }
      await setGroupSetting(from, "GROUP_EVENTS", value);
      await react("✅");
      await reply(
        `✅ Group events for this group: *${formatBoolDisplay(value)}*`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "resetsudo",
    aliases: ["deleteallsudos", "resetsudos", "clearsudo", "clearsudos"],
    react: "🗑️",
    category: "owner",
    description: "Remove all sudo numbers from database",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    try {
      const sudoList = await getSudoNumbers();
      if (sudoList.length === 0) {
        return reply("⚠️ No sudo numbers to remove.");
      }
      const count = await clearAllSudo();
      await react("✅");
      await reply(`✅ Removed *${count}* sudo number(s) from database.`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "groupsettings",
    aliases: ["gcsettings", "gcset", "groupset", "gsettings"],
    react: "⚙️",
    category: "group",
    description: "View all settings for this group",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isAdmin, isSuperAdmin, isGroup, groupName } = conText;
    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admin Only Command!");

    try {
      const {
        getBadWords,
        DEFAULT_BAD_WORDS,
      } = require("../guru/database/groupSettings");
      const settings = await getAllGroupSettings(from);

      const welcomeStatus = isSettingEnabled(settings.WELCOME_MESSAGE)
        ? "ON"
        : "OFF";
      const goodbyeStatus = isSettingEnabled(settings.GOODBYE_MESSAGE)
        ? "ON"
        : "OFF";
      const eventsStatus = isSettingEnabled(settings.GROUP_EVENTS)
        ? "ON"
        : "OFF";
      const antilinkStatus = isSettingEnabled(settings.ANTILINK) ? "ON" : "OFF";
      const antibadStatus = isSettingEnabled(settings.ANTIBAD) ? "ON" : "OFF";

      const antiGcMentionRaw = settings.ANTIGROUPMENTION || "off";
      let antiGcMentionStatus = "OFF";
      let antiGcMentionAction = "";
      if (isSettingEnabled(antiGcMentionRaw)) {
        antiGcMentionStatus = "ON";
        if (antiGcMentionRaw === "kick") {
          antiGcMentionAction = "kick";
        } else {
          antiGcMentionAction = "warn";
        }
      }

      const badWords = await getBadWords(from);
      const defaultBadWordsSet = new Set(
        DEFAULT_BAD_WORDS.map((w) => w.toLowerCase()),
      );
      const isUsingDefault =
        badWords.length === DEFAULT_BAD_WORDS.length &&
        badWords.every((w) => defaultBadWordsSet.has(w.toLowerCase()));
      let badWordsDisplay = "None";
      if (badWords.length > 0) {
        if (isUsingDefault) {
          badWordsDisplay = "Default list";
        } else {
          const displayWords = badWords.slice(0, 5).join(", ");
          badWordsDisplay =
            badWords.length > 5
              ? `${displayWords}... (+${badWords.length - 5} more)`
              : displayWords;
        }
      }

      const welcomeText = settings.WELCOME_MESSAGE_TEXT || "Default";
      const goodbyeText = settings.GOODBYE_MESSAGE_TEXT || "Default";

      let msg = `╭━━━━━━━━━━━╮\n`;
      msg += `│ ⚙️ *GROUP SETTINGS*\n`;
      msg += `├━━━━━━━━━━━┤\n`;
      msg += `│ 📍 *${groupName || "This Group"}*\n`;
      msg += `├━━━━━━━━━━━┤\n`;
      msg += `│\n`;
      msg += `│ 👋 *Welcome:* ${welcomeStatus}\n`;
      msg += `│ 👋 *Goodbye:* ${goodbyeStatus}\n`;
      msg += `│ 📢 *Events:* ${eventsStatus}\n`;
      msg += `│\n`;
      msg += `├━━━━━━━━━━━┤\n`;
      msg += `│ 🛡️ *PROTECTION*\n`;
      msg += `├━━━━━━━━━━━┤\n`;
      msg += `│\n`;
      const antilinkRaw = settings.ANTILINK || "off";
      let antilinkAction = "delete";
      if (antilinkRaw === "warn") antilinkAction = "warn";
      else if (antilinkRaw === "kick") antilinkAction = "kick";

      msg += `│ 🔗 *Antilink:* ${antilinkStatus}\n`;
      if (antilinkStatus === "ON") {
        msg += `│ └ Action: ${antilinkAction}\n`;
        if (antilinkAction === "warn") {
          msg += `│ └ Warns: ${settings.ANTILINK_WARN_COUNT}\n`;
        }
      }
      msg += `│\n`;
      msg += `│ 🚫 *Antibad:* ${antibadStatus}\n`;
      msg += `│ └ Warns: ${settings.ANTIBAD_WARN_COUNT}\n`;
      msg += `│ └ Words: ${badWordsDisplay}\n`;
      msg += `│\n`;
      msg += `│ 📢 *Anti-Status-Mention:* ${antiGcMentionStatus}\n`;
      if (antiGcMentionStatus === "ON") {
        msg += `│ └ Action: ${antiGcMentionAction}\n`;
        if (antiGcMentionAction === "warn") {
          msg += `│ └ Warn Limit: ${settings.ANTIGROUPMENTION_WARN_COUNT || 3}\n`;
        }
      }
      msg += `│\n`;
      msg += `├━━━━━━━━━━━┤\n`;
      msg += `│ 💬 *MESSAGES*\n`;
      msg += `├━━━━━━━━━━━┤\n`;
      msg += `│\n`;
      msg += `│ *Welcome Msg:*\n`;
      msg += `│ ${welcomeText.length > 50 ? welcomeText.substring(0, 50) + "..." : welcomeText}\n`;
      msg += `│\n`;
      msg += `│ *Goodbye Msg:*\n`;
      msg += `│ ${goodbyeText.length > 50 ? goodbyeText.substring(0, 50) + "..." : goodbyeText}\n`;
      msg += `│\n`;
      msg += `╰━━━━━━━━━━━╯\n`;
      msg += `\n_Use .setwelcome, .setgoodbye, .setantilink, etc to modify_`;

      await react("✅");
      await reply(msg);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "resetgroup",
    aliases: ["resetgroupsettings", "cleargroupsettings", "resetgc", "cleargc"],
    react: "🗑️",
    category: "group",
    description:
      "Reset all settings for this group (welcome, goodbye, antilink, etc.)",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, isGroup } = conText;
    if (!isGroup) return reply("❌ This command only works in groups!");
    if (!isSuperUser) return reply("❌ Owner Only Command!");
    try {
      await resetAllGroupSettings(from);
      await react("✅");
      await reply(
        `✅ All settings for this group have been reset to defaults.\n\n*Cleared:*\n▸ Welcome message\n▸ Goodbye message\n▸ Group events\n▸ Antilink\n▸ Antilink warnings`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "resetdb",
    aliases: [
      "resetdatabase",
      "wipedatabase",
      "wipedb",
      "factoryreset",
      "flushdb",
      "flushdatabase",
    ],
    react: "⚠️",
    category: "owner",
    description:
      "Reset entire database to defaults (bot settings, sudo, group settings)",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner Only Command!");

    if (q !== "confirm") {
      return reply(
        `⚠️ *WARNING: This will reset EVERYTHING!*\n\n*Will be cleared:*\n▸ All bot settings\n▸ All sudo numbers\n▸ All group settings\n▸ All antilink warnings\n\nTo confirm, type: *.resetdb confirm*`,
      );
    }

    try {
      await resetAllSettings();
      await clearAllSudo();
      const {
        GroupSettingsDB,
        AntilinkWarningsDB,
      } = require("../guru/database/groupSettings");
      await GroupSettingsDB.destroy({ where: {} });
      await AntilinkWarningsDB.destroy({ where: {} });
      await react("✅");
      await reply(
        `✅ Database has been completely reset to defaults.\n\nAll settings, sudo numbers, and group configurations have been cleared.`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "allnotes",
    aliases: ["viewnotes", "usernotes", "allnotesdb"],
    react: "📋",
    category: "owner",
    description: "View all users' notes (owner only)",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    try {
      const allNotes = await getAllUsersNotes();

      if (allNotes.length === 0) {
        return reply("📭 No notes in the database.");
      }

      const groupedByUser = {};
      for (const note of allNotes) {
        if (!groupedByUser[note.userJid]) {
          groupedByUser[note.userJid] = [];
        }
        groupedByUser[note.userJid].push(note);
      }

      let text = `📋 *ALL USER NOTES*\n\n`;
      text += `Total: ${allNotes.length} notes from ${Object.keys(groupedByUser).length} users\n\n`;

      for (const [userJid, notes] of Object.entries(groupedByUser)) {
        const userName = userJid.split("@")[0];
        text += `👤 *@${userName}* (${notes.length} notes)\n`;
        for (const note of notes) {
          const preview =
            note.content.length > 30
              ? note.content.substring(0, 30) + "..."
              : note.content;
          text += `  ID:${note.id} #${note.noteNumber} - ${preview}\n`;
        }
        text += `\n`;
      }

      text += `_Use .admindelnote <id> to delete a note_\n`;
      text += `_Use .adminupdatenote <id> <text> to update_\n`;
      text += `_Use .adminclearnotes <number> to clear user notes_`;

      await reply(text);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "admindelnote",
    aliases: ["deletenotebyid", "rmnotebyid", "admindeletenote"],
    react: "🗑️",
    category: "owner",
    description: "Delete any note by ID (owner only)",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    if (!q || isNaN(parseInt(q))) {
      return reply("❌ Provide a note ID.\n\nUsage: .admindelnote <id>");
    }

    try {
      const noteId = parseInt(q);
      const deleted = await deleteNoteById(noteId);

      if (!deleted) {
        return reply(`❌ Note with ID ${noteId} not found.`);
      }

      await react("✅");
      return reply(`✅ Note ID ${noteId} deleted!`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "adminupdatenote",
    aliases: ["editnotebyid", "updatenotebyid", "admineditnote"],
    react: "✏️",
    category: "owner",
    description: "Update any note by ID (owner only)",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    if (!q || q.trim() === "") {
      return reply(
        "❌ Provide note ID and new content.\n\nUsage: .adminupdatenote <id> <new text>",
      );
    }

    try {
      const parts = q.trim().split(/\s+/);
      const noteId = parseInt(parts[0]);

      if (isNaN(noteId)) {
        return reply(
          "❌ First argument must be a note ID.\n\nUsage: .adminupdatenote <id> <new text>",
        );
      }

      const newContent = parts.slice(1).join(" ");
      if (!newContent) {
        return reply(
          "❌ Provide new content.\n\nUsage: .adminupdatenote <id> <new text>",
        );
      }

      const note = await updateNoteById(noteId, newContent);

      if (!note) {
        return reply(`❌ Note with ID ${noteId} not found.`);
      }

      await react("✅");
      return reply(`✅ Note ID ${noteId} updated!\n\n📝 "${note.content}"`);
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

gmd(
  {
    pattern: "adminclearnotes",
    aliases: ["clearusernotes", "deleteusernotes", "adminrmallnotes"],
    react: "🗑️",
    category: "owner",
    description: "Delete all notes for a specific user (owner only)",
  },
  async (from, Gifted, conText) => {
    const { reply, react, isSuperUser, q } = conText;
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    if (!q || q.trim() === "") {
      return reply(
        "❌ Provide user number.\n\nUsage: .adminclearnotes <number>",
      );
    }

    try {
      let userNumber = q.trim().replace(/[^0-9]/g, "");
      const userJid = userNumber + "@s.whatsapp.net";

      const count = await deleteAllNotes(userJid);

      if (count === 0) {
        return reply(`📭 No notes found for ${userNumber}.`);
      }

      await react("✅");
      return reply(
        `✅ Deleted ${count} note${count > 1 ? "s" : ""} for ${userNumber}!`,
      );
    } catch (error) {
      await reply(`❌ Error: ${error.message}`);
    }
  },
);

module.exports = {};
