
const { gmd } = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");

const OWNER_ONLY = true;

gmd(
    {
        pattern: "setwarnlimit",
        react: "⚠️",
        description: "Set the number of warns before action is taken — .setwarnlimit 3",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const num = parseInt(q);
        if (isNaN(num) || num < 1) return reply("❌ Please provide a valid number (minimum 1).\nExample: `.setwarnlimit 3`");
        await setSetting("WARN_LIMIT", num.toString());
        await react("✅");
        reply(`✅ Warn limit set to *${num}*.\nMembers will face action after ${num} warning(s).`);
    }
);

gmd(
    {
        pattern: "setautomute",
        react: "🔕",
        description: "Auto-mute all groups on restart — .setautomute on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["on", "off"].includes(action)) return reply("❌ Usage: `.setautomute on` or `.setautomute off`");
        await setSetting("AUTO_MUTE", action === "on" ? "true" : "false");
        await react("✅");
        reply(action === "on"
            ? "🔕 *Auto-mute* is ON. Bot will not respond to groups automatically."
            : "🔔 *Auto-mute* is OFF. Bot responds to groups normally."
        );
    }
);

gmd(
    {
        pattern: "setrejectcall",
        aliases: ["setanticall2"],
        react: "📵",
        description: "Reject incoming calls automatically — .setrejectcall on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["on", "off"].includes(action)) return reply("❌ Usage: `.setrejectcall on` or `.setrejectcall off`");
        await setSetting("REJECT_CALL", action === "on" ? "true" : "false");
        await react("✅");
        reply(action === "on"
            ? "📵 *Reject Call* is ON. All incoming calls will be rejected automatically."
            : "📞 *Reject Call* is OFF."
        );
    }
);

gmd(
    {
        pattern: "setbotlang",
        react: "🌍",
        description: "Set bot language preference — .setbotlang en/fr/ar/sw/pt",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const supported = ["en", "fr", "ar", "sw", "pt", "es", "de", "zh", "ha", "yo", "ig"];
        const lang = (q || "").trim().toLowerCase();
        if (!lang) return reply(`❌ Please provide a language code.\nSupported: ${supported.join(", ")}\nExample: \`.setbotlang en\``);
        if (!supported.includes(lang)) return reply(`❌ Language *${lang}* is not supported yet.\nSupported: ${supported.join(", ")}`);
        await setSetting("BOT_LANG", lang);
        await react("✅");
        reply(`🌍 Bot language preference set to *${lang.toUpperCase()}*.`);
    }
);

gmd(
    {
        pattern: "setwelcomeaction",
        react: "👋",
        description: "Action when bot is added to a group — .setwelcomeaction join/ignore/leave",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["join", "ignore", "leave"].includes(action))
            return reply("❌ Usage: `.setwelcomeaction join` | `.setwelcomeaction ignore` | `.setwelcomeaction leave`");
        await setSetting("GROUP_JOIN_ACTION", action);
        await react("✅");
        const msgs = {
            join: "✅ Bot will *join* groups and send a greeting when added.",
            ignore: "✅ Bot will join groups *silently* without greeting.",
            leave: "✅ Bot will *leave* groups it is added to automatically.",
        };
        reply(msgs[action]);
    }
);

gmd(
    {
        pattern: "settagprotect",
        react: "🏷️",
        description: "Protect against mass-tag spam in groups — .settagprotect on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["on", "off"].includes(action)) return reply("❌ Usage: `.settagprotect on` or `.settagprotect off`");
        await setSetting("TAG_PROTECT", action === "on" ? "true" : "false");
        await react("✅");
        reply(action === "on"
            ? "🏷️ *Tag Protection* is ON. Mass-tagging will be blocked."
            : "🏷️ *Tag Protection* is OFF."
        );
    }
);

gmd(
    {
        pattern: "setspamfilter",
        react: "🚫",
        description: "Toggle global spam filter — .setspamfilter on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["on", "off"].includes(action)) return reply("❌ Usage: `.setspamfilter on` or `.setspamfilter off`");
        await setSetting("GLOBAL_SPAM_FILTER", action === "on" ? "true" : "false");
        await react("✅");
        reply(action === "on"
            ? "🚫 *Global Spam Filter* is ON."
            : "✅ *Global Spam Filter* is OFF."
        );
    }
);

gmd(
    {
        pattern: "setbotprefix",
        react: "⚡",
        description: "Change the bot command prefix — .setbotprefix .",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const prefix = (q || "").trim();
        if (!prefix || prefix.length > 3) return reply("❌ Please provide a valid prefix (1-3 characters).\nExample: `.setbotprefix .` or `.setbotprefix !`");
        await setSetting("BOT_PREFIX", prefix);
        await react("✅");
        reply(`✅ Bot prefix changed to *${prefix}*\nAll commands now start with *${prefix}*\n\n> Restart the bot for full effect.`);
    }
);

gmd(
    {
        pattern: "setbiotext",
        react: "✏️",
        description: "Set the bot's WhatsApp bio/status text — .setbiotext Your status here",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        if (!q) return reply("❌ Please provide a status text.\nExample: `.setbiotext Powered by GuruTech 🚀`");
        try {
            await Gifted.updateProfileStatus(q.trim());
            await setSetting("BOT_BIO", q.trim());
            await react("✅");
            reply(`✅ Bot bio updated to:\n\n_${q.trim()}_`);
        } catch (err) {
            reply(`❌ Failed to update bio: ${err.message}`);
        }
    }
);

gmd(
    {
        pattern: "setbotname",
        react: "✏️",
        description: "Set the bot's WhatsApp display name — .setbotname ULTRA GURU MD",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        if (!q) return reply("❌ Please provide a name.\nExample: `.setbotname ULTRA GURU MD`");
        try {
            await Gifted.updateProfileName(q.trim());
            await setSetting("BOT_NAME", q.trim());
            await react("✅");
            reply(`✅ Bot name updated to *${q.trim()}*.`);
        } catch (err) {
            reply(`❌ Failed to update name: ${err.message}`);
        }
    }
);

gmd(
    {
        pattern: "botinfo",
        aliases: ["about", "info"],
        react: "🤖",
        description: "Show detailed bot information and system stats",
        category: "general",
    },
    async (from, Gifted, conText) => {
        const { reply, react } = conText;
        const { totalmem, freemem } = require("os");
        const { formatBytes } = require("../guru");

        const botName = (await getSetting("BOT_NAME")) || "ULTRA GURU MD";
        const botVersion = (await getSetting("BOT_VERSION")) || "5.0.0";
        const botMode = (await getSetting("BOT_MODE")) || "Public";
        const botRepo = (await getSetting("BOT_REPO")) || "GuruhTech/ULTRA-GURU";
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
        const usedRam = formatBytes(totalmem() - freemem());
        const totalRam = formatBytes(totalmem());
        const nodeVersion = process.version;
        const platform = process.platform;

        let expiryInfo = "Not set";
        try {
            const expiryDate = await getSetting("BOT_EXPIRY_DATE");
            if (expiryDate) {
                const exp = new Date(expiryDate);
                const daysLeft = Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
                expiryInfo = daysLeft <= 0
                    ? `🔴 EXPIRED (${exp.toDateString()})`
                    : `🟢 ${daysLeft}d left (${exp.toDateString()})`;
            }
        } catch {}

        await react("🤖");
        reply(
`◢◣◢◣◢◣◢ *BOT INFORMATION* ◢◣◢◣◢◣◢
     ⋄ _POWERED BY GURUTECH_ ⋄
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

◈ 🤖 *Bot Name*    ⤳ ${botName}
◈ 👤 *Creator*     ⤳ GuruTech
◈ 🏷️ *Version*     ⤳ v${botVersion}
◈ 📱 *Mode*        ⤳ ${botMode}
◈ 🔗 *Repository*  ⤳ ${botRepo}
◈ ⏱️ *Uptime*      ⤳ ${uptimeStr}
◈ 💾 *RAM Usage*   ⤳ ${usedRam} / ${totalRam}
◈ 🖥️ *Platform*    ⤳ ${platform}
◈ 🟩 *Node.js*     ⤳ ${nodeVersion}
◈ 🔑 *License*     ⤳ ${expiryInfo}

▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

> _ULTRA GURU MD is built and maintained by GuruTech. All rights reserved._`
        );
    }
);

gmd(
    {
        pattern: "settingsinfo",
        aliases: ["showsettings", "allsettings"],
        react: "⚙️",
        description: "View a summary of all bot settings",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react } = conText;

        const keys = [
            ["BOT_NAME", "Bot Name"],
            ["BOT_MODE", "Mode"],
            ["BOT_PREFIX", "Prefix"],
            ["BOT_LANG", "Language"],
            ["BOT_VERSION", "Version"],
            ["BOT_EXPIRY_DATE", "Expiry"],
            ["WARN_LIMIT", "Warn Limit"],
            ["AUTO_MUTE", "Auto Mute"],
            ["REJECT_CALL", "Reject Call"],
            ["TAG_PROTECT", "Tag Protect"],
            ["GLOBAL_SPAM_FILTER", "Spam Filter"],
            ["DM_PERMIT", "DM Permit"],
            ["DM_PERMIT_ACTION", "DM Action"],
            ["GROUP_JOIN_ACTION", "Group Join"],
            ["BOT_REPO", "Repo"],
        ];

        const lines = [];
        for (const [key, label] of keys) {
            const val = (await getSetting(key)) || "_not set_";
            lines.push(`◈ *${label.padEnd(14)}* ⤳ ${val}`);
        }

        await react("⚙️");
        reply(`⚙️ *BOT SETTINGS OVERVIEW*\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n${lines.join("\n")}\n\n> Use \`.setXXX\` commands to change any setting.`);
    }
);
