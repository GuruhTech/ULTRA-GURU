

// ── Serif Italic runtime converter ─────────────────────────────────────────
const _SI_FROM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const _SI_TO   = '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻';
const si = (str) => [...(str || '')].map(c => {
  const idx = _SI_FROM.indexOf(c);
  return idx >= 0 ? [..._SI_TO][idx] : c;
}).join('');
// ───────────────────────────────────────────────────────────────────────────

const { gmd } = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");

const OWNER_ONLY = true;

// ─────────────────────────────────────────────────────────────
//  HELPER: parse on/off
// ─────────────────────────────────────────────────────────────
function onOff(q) {
    const v = (q || "").trim().toLowerCase();
    if (v === "on" || v === "true") return "true";
    if (v === "off" || v === "false") return "false";
    return null;
}
function boolLabel(val) {
    return val === "true" ? "🟢 ON" : "🔴 OFF";
}

// ─────────────────────────────────────────────────────────────
//  1. SETWARNLIMIT
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setwarnlimit",
        react: "⚠️",
        description: "Set warn-before-action threshold — .setwarnlimit 3",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const num = parseInt(q);
        if (isNaN(num) || num < 1)
            return reply("❌ Provide a valid number (min 1).\nExample: `.setwarnlimit 3`");
        await setSetting("WARN_LIMIT", num.toString());
        await react("✅");
        reply(`✅ Warn limit set to *${num}*.\nMembers will face action after ${num} warning(s).`);
    },
);

// ─────────────────────────────────────────────────────────────
//  2. SETAUTOMUTE
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setautomute",
        react: "🔕",
        description: "Silence bot responses to all groups — .setautomute on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const val = onOff(q);
        if (!val) return reply("❌ Usage: `.setautomute on` or `.setautomute off`");
        await setSetting("AUTO_MUTE", val);
        await react("✅");
        reply(val === "true"
            ? "🔕 *Auto-mute* is ON — bot will not respond to groups."
            : "🔔 *Auto-mute* is OFF — bot responds normally.");
    },
);

// ─────────────────────────────────────────────────────────────
//  3. SETREJECTCALL
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setrejectcall",
        aliases: ["setanticall2", "rejectcall"],
        react: "📵",
        description: "Auto-reject all incoming calls — .setrejectcall on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const val = onOff(q);
        if (!val) return reply("❌ Usage: `.setrejectcall on` or `.setrejectcall off`");
        await setSetting("REJECT_CALL", val);
        await react("✅");
        reply(val === "true"
            ? "📵 *Reject Call* is ON — all incoming calls will be rejected."
            : "📞 *Reject Call* is OFF.");
    },
);

// ─────────────────────────────────────────────────────────────
//  4. SETBOTLANG
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setbotlang",
        aliases: ["botlang", "setlang"],
        react: "🌍",
        description: "Set bot language — .setbotlang en/fr/ar/sw/pt/es/de/zh/ha/yo/ig",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const supported = ["en", "fr", "ar", "sw", "pt", "es", "de", "zh", "ha", "yo", "ig"];
        const lang = (q || "").trim().toLowerCase();
        if (!lang)
            return reply(`❌ Provide a language code.\nSupported: ${supported.join(", ")}\nExample: \`.setbotlang en\``);
        if (!supported.includes(lang))
            return reply(`❌ *${lang}* is not supported.\nSupported: ${supported.join(", ")}`);
        await setSetting("BOT_LANG", lang);
        await react("✅");
        reply(`🌍 Bot language set to *${lang.toUpperCase()}*.`);
    },
);

// ─────────────────────────────────────────────────────────────
//  5. SETWELCOMEACTION
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setwelcomeaction",
        aliases: ["groupjoinaction"],
        react: "👋",
        description: "Bot behaviour when added to a group — .setwelcomeaction join/ignore/leave",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["join", "ignore", "leave"].includes(action))
            return reply("❌ Usage: `.setwelcomeaction join` | `ignore` | `leave`");
        await setSetting("GROUP_JOIN_ACTION", action);
        await react("✅");
        const msgs = {
            join:   "✅ Bot will *join* groups and send a greeting.",
            ignore: "✅ Bot will join groups *silently* (no greeting).",
            leave:  "✅ Bot will *leave* any group it is added to.",
        };
        reply(msgs[action]);
    },
);

// ─────────────────────────────────────────────────────────────
//  6. SETTAGPROTECT
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "settagprotect",
        aliases: ["tagprotect", "antimasstag"],
        react: "🏷️",
        description: "Block mass-tag spam in groups — .settagprotect on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const val = onOff(q);
        if (!val) return reply("❌ Usage: `.settagprotect on` or `.settagprotect off`");
        await setSetting("TAG_PROTECT", val);
        await react("✅");
        reply(val === "true"
            ? "🏷️ *Tag Protection* ON — mass-tagging will be blocked."
            : "🏷️ *Tag Protection* OFF.");
    },
);

// ─────────────────────────────────────────────────────────────
//  7. SETSPAMFILTER
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setspamfilter",
        aliases: ["spamfilter", "globalspam"],
        react: "🚫",
        description: "Toggle global spam filter — .setspamfilter on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const val = onOff(q);
        if (!val) return reply("❌ Usage: `.setspamfilter on` or `.setspamfilter off`");
        await setSetting("GLOBAL_SPAM_FILTER", val);
        await react("✅");
        reply(val === "true"
            ? "🚫 *Global Spam Filter* is ON."
            : "✅ *Global Spam Filter* is OFF.");
    },
);

// ─────────────────────────────────────────────────────────────
//  8. SETBIOTEXT  (updates WhatsApp bio + DB)
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setbiotext",
        aliases: ["setbio", "botbio"],
        react: "✏️",
        description: "Update the bot's WhatsApp bio — .setbiotext Powered by GuruTech 🚀",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        if (!q) return reply("❌ Provide a status text.\nExample: `.setbiotext Powered by GuruTech 🚀`");
        try {
            await Guru.updateProfileStatus(q.trim());
            await setSetting("BOT_BIO", q.trim());
            await react("✅");
            reply(`✅ Bio updated:\n\n_${q.trim()}_`);
        } catch (err) {
            reply(`❌ Failed to update bio: ${err.message}`);
        }
    },
);

// ─────────────────────────────────────────────────────────────
//  9. SETBOTVERSION
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setbotversion",
        aliases: ["botversion", "setversion"],
        react: "🏷️",
        description: "Manually set the bot version string — .setbotversion 5.1.0",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        if (!q) return reply("❌ Provide a version.\nExample: `.setbotversion 5.1.0`");
        const semver = /^\d+\.\d+(\.\d+)?$/;
        if (!semver.test(q.trim()))
            return reply("❌ Use a valid semver format: e.g. `5.1.0` or `6.0`");
        await setSetting("BOT_VERSION", q.trim());
        await react("✅");
        reply(`✅ Bot version set to *v${q.trim()}*.`);
    },
);

// ─────────────────────────────────────────────────────────────
//  10. SETANTIVIEWONCE
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setantiviewonce",
        aliases: ["antiviewonce", "antiviewonce2"],
        react: "👁️",
        description: "Handle view-once messages — .setantiviewonce on/off/indm",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const modes = ["on", "off", "indm"];
        const input = (q || "").trim().toLowerCase();
        if (!modes.includes(input))
            return reply(`❌ Usage: \`.setantiviewonce on\` | \`off\` | \`indm\`\n\n• *on* — forward view-once to all chats\n• *indm* — only forward in your DM\n• *off* — disabled`);
        const stored = input === "on" ? "true" : input === "off" ? "false" : "indm";
        await setSetting("ANTIVIEWONCE", stored);
        await react("✅");
        const labels = { true: "🟢 ON (all chats)", indm: "📩 DM only", false: "🔴 OFF" };
        reply(`👁️ *Anti View-Once* set to: *${labels[stored]}*`);
    },
);

// ─────────────────────────────────────────────────────────────
//  11. SETVVTRACKER
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setvvtracker",
        aliases: ["vvtracker", "viewoncetracker"],
        react: "🎥",
        description: "Track & resend view-once media to owner — .setvvtracker on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const val = onOff(q);
        if (!val) return reply("❌ Usage: `.setvvtracker on` or `.setvvtracker off`");
        await setSetting("VV_TRACKER", val);
        await react("✅");
        reply(val === "true"
            ? "🎥 *VV Tracker* is ON — view-once media will be forwarded to you."
            : "🎥 *VV Tracker* is OFF.");
    },
);

// ─────────────────────────────────────────────────────────────
//  12. SETAUTOCHANNELLIKE
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setautochannellike",
        aliases: ["autochannellike", "channellike"],
        react: "📢",
        description: "Auto-react to tracked newsletter/channel posts — .setautochannellike on/off",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const val = onOff(q);
        if (!val) return reply("❌ Usage: `.setautochannellike on` or `.setautochannellike off`");
        await setSetting("AUTO_CHANNEL_LIKE", val);
        await react("✅");
        reply(val === "true"
            ? "📢 *Auto Channel Like* is ON — bot will react to tracked channel posts."
            : "📢 *Auto Channel Like* is OFF.");
    },
);

// ─────────────────────────────────────────────────────────────
//  13. SETDMPERMITACTION  (warn / block / delete)
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setdmpermitaction",
        aliases: ["dmpermitaction", "setpmaction"],
        react: "🔒",
        description: "Action taken against non-permitted DMs — .setdmpermitaction warn/block/delete",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        const actions = ["warn", "block", "delete"];
        const input = (q || "").trim().toLowerCase();
        if (!actions.includes(input))
            return reply(`❌ Usage: \`.setdmpermitaction warn\` | \`block\` | \`delete\`\n\n• *warn* — send a warning message\n• *block* — block the sender\n• *delete* — silently ignore the message`);
        await setSetting("DM_PERMIT_ACTION", input);
        await react("✅");
        reply(`🔒 *DM Permit Action* set to: *${input.toUpperCase()}*`);
    },
);

// ─────────────────────────────────────────────────────────────
//  14. SETDMPERMITMSG
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "setdmpermitmsg",
        aliases: ["dmpermitmsg", "setpmmsg"],
        react: "💬",
        description: "Custom message sent when DM permit triggers — .setdmpermitmsg <text>",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q } = conText;
        if (!q) return reply("❌ Provide the message text.\nExample: `.setdmpermitmsg 🚫 DMs are not allowed.`");
        await setSetting("DM_PERMIT_MSG", q.trim());
        await react("✅");
        reply(`✅ DM Permit message updated:\n\n_${q.trim()}_`);
    },
);

// ─────────────────────────────────────────────────────────────
//  15. QUICKSETUP  — configure multiple settings at once
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "quicksetup",
        aliases: ["setup", "botsetup"],
        react: "⚡",
        description: "Configure multiple bot settings in one shot — .quicksetup prefix=! mode=public lang=en warn=3",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react, q, isSuperUser } = conText;
        if (!isSuperUser) return reply("❌ Owner Only Command!");
        if (!q) return reply(
`❌ Provide key=value pairs.
*Available keys:*
▸ \`prefix\`  — command prefix (e.g. !)
▸ \`mode\`    — public / private / inbox
▸ \`lang\`    — en/fr/sw/ar/pt/es/de…
▸ \`warn\`    — warn limit (number)
▸ \`anticall\` — on/off
▸ \`pmpermit\` — on/off
▸ \`spamfilter\` — on/off
▸ \`tagprotect\` — on/off
▸ \`rejectcall\` — on/off
▸ \`vvtracker\` — on/off

Example: \`.quicksetup prefix=. mode=public lang=en warn=3 pmpermit=off\``
        );

        const pairs = q.trim().split(/\s+/);
        const results = [];
        const errors = [];

        for (const pair of pairs) {
            const [key, ...rest] = pair.split("=");
            const value = rest.join("=").trim();
            if (!key || !value) { errors.push(`⚠️ Invalid pair: \`${pair}\``); continue; }

            switch (key.toLowerCase()) {
                case "prefix":
                    if (value.length > 3) { errors.push("❌ prefix too long (max 3 chars)"); break; }
                    await setSetting("PREFIX", value);
                    await setSetting("BOT_PREFIX", value);
                    results.push(`✅ Prefix → *${value}*`);
                    break;
                case "mode": {
                    const modes = ["public", "private", "inbox"];
                    if (!modes.includes(value.toLowerCase())) { errors.push(`❌ mode must be: ${modes.join(" / ")}`); break; }
                    await setSetting("MODE", value.toLowerCase());
                    results.push(`✅ Mode → *${value}*`);
                    break;
                }
                case "lang": {
                    const supported = ["en", "fr", "ar", "sw", "pt", "es", "de", "zh", "ha", "yo", "ig"];
                    if (!supported.includes(value.toLowerCase())) { errors.push(`❌ lang *${value}* not supported`); break; }
                    await setSetting("BOT_LANG", value.toLowerCase());
                    results.push(`✅ Language → *${value.toUpperCase()}*`);
                    break;
                }
                case "warn": {
                    const n = parseInt(value);
                    if (isNaN(n) || n < 1) { errors.push("❌ warn must be a number ≥ 1"); break; }
                    await setSetting("WARN_LIMIT", n.toString());
                    results.push(`✅ Warn limit → *${n}*`);
                    break;
                }
                case "anticall":
                case "rejectcall": {
                    const v = onOff(value);
                    if (!v) { errors.push(`❌ ${key} must be on/off`); break; }
                    const skey = key === "anticall" ? "ANTICALL" : "REJECT_CALL";
                    await setSetting(skey, v);
                    results.push(`✅ ${key} → *${v === "true" ? "ON" : "OFF"}*`);
                    break;
                }
                case "pmpermit": {
                    const v = onOff(value);
                    if (!v) { errors.push("❌ pmpermit must be on/off"); break; }
                    await setSetting("PM_PERMIT", v);
                    results.push(`✅ PM Permit → *${v === "true" ? "ON" : "OFF"}*`);
                    break;
                }
                case "spamfilter": {
                    const v = onOff(value);
                    if (!v) { errors.push("❌ spamfilter must be on/off"); break; }
                    await setSetting("GLOBAL_SPAM_FILTER", v);
                    results.push(`✅ Spam Filter → *${v === "true" ? "ON" : "OFF"}*`);
                    break;
                }
                case "tagprotect": {
                    const v = onOff(value);
                    if (!v) { errors.push("❌ tagprotect must be on/off"); break; }
                    await setSetting("TAG_PROTECT", v);
                    results.push(`✅ Tag Protect → *${v === "true" ? "ON" : "OFF"}*`);
                    break;
                }
                case "vvtracker": {
                    const v = onOff(value);
                    if (!v) { errors.push("❌ vvtracker must be on/off"); break; }
                    await setSetting("VV_TRACKER", v);
                    results.push(`✅ VV Tracker → *${v === "true" ? "ON" : "OFF"}*`);
                    break;
                }
                default:
                    errors.push(`⚠️ Unknown key: \`${key}\``);
            }
        }

        await react(errors.length === 0 ? "✅" : "⚠️");
        let out = `⚡ *QUICK SETUP COMPLETE*\n${"─".repeat(30)}\n`;
        if (results.length) out += results.join("\n") + "\n";
        if (errors.length) out += "\n" + errors.join("\n") + "\n";
        out += `\n> ${results.length} applied · ${errors.length} skipped`;
        reply(out);
    },
);

// ─────────────────────────────────────────────────────────────
//  16. BOTINFO  (replaces duplicate in settings3, improved)
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "botinfo",
        aliases: ["about", "info"],
        react: "🤖",
        description: "Show bot information and live system stats",
        category: "general",
    },
    async (from, Guru, conText) => {
        const { reply, react } = conText;
        const { totalmem, freemem } = require("os");
        const { formatBytes } = require("../guru");

        const botName    = (await getSetting("BOT_NAME"))    || "ULTRA GURU MD";
        const botVersion = (await getSetting("BOT_VERSION")) || "5.0.0";
        const botMode    = (await getSetting("MODE"))        || "Public";
        const botLang    = (await getSetting("BOT_LANG"))    || "en";
        const botRepo    = (await getSetting("BOT_REPO"))    || "GuruhTech/ULTRA-GURU";
        const botPrefix  = (await getSetting("PREFIX"))      || ".";
        const warnLimit  = (await getSetting("WARN_LIMIT"))  || "3";

        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = Math.floor(uptime % 60);
        const uptimeStr = `${h}h ${m}m ${s}s`;

        const usedRam  = formatBytes(totalmem() - freemem());
        const totalRam = formatBytes(totalmem());
        const node     = process.version;
        const platform = process.platform;

        let expiryInfo = "♾️ LIFETIME";
        try {
            const expiryDate = await getSetting("BOT_EXPIRY_DATE");
            if (expiryDate) {
                const exp = new Date(expiryDate);
                const dLeft = Math.ceil((exp - Date.now()) / 86400000);
                expiryInfo = dLeft <= 0
                    ? `🔴 EXPIRED (${exp.toDateString()})`
                    : `🟢 ${dLeft}d left (${exp.toDateString()})`;
            }
        } catch {}

        await react("🤖");
        reply(
`◢◣◢◣◢◣◢ *𝘉𝘖𝘛 𝘐𝘕𝘍𝘖𝘙𝘔𝘈𝘛𝘐𝘖𝘕* ◢◣◢◣◢◣◢
     ⋄ _𝘗𝘖𝘞𝘌𝘙𝘌𝘋 𝘉𝘠 𝘎𝘜𝘙𝘜𝘛𝘌𝘊𝘏_ ⋄
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

◈ 🤖 *𝘉𝘰𝘵 𝘕𝘢𝘮𝘦*    ⤳ ${botName}
◈ 👤 *𝘊𝘳𝘦𝘢𝘵𝘰𝘳*     ⤳ GuruTech
◈ 🏷️ *𝘝𝘦𝘳𝘴𝘪𝘰𝘯*     ⤳ v${botVersion}
◈ 📱 *𝘔𝘰𝘥𝘦*        ⤳ ${botMode}
◈ 🌍 *𝘓𝘢𝘯𝘨𝘶𝘢𝘨𝘦*    ⤳ ${botLang.toUpperCase()}
◈ ⌨️ *𝘗𝘳𝘦𝘧𝘪𝘹*      ⤳ ${botPrefix}
◈ ⚠️ *𝘞𝘢𝘳𝘯 𝘓𝘪𝘮𝘪𝘵*  ⤳ ${warnLimit}
◈ 🔗 *𝘙𝘦𝘱𝘰𝘴𝘪𝘵𝘰𝘳𝘺*  ⤳ ${botRepo}
◈ ⏱️ *𝘜𝘱𝘵𝘪𝘮𝘦*      ⤳ ${uptimeStr}
◈ 💾 *𝘙𝘈𝘔 𝘜𝘴𝘢𝘨𝘦*   ⤳ ${usedRam} / ${totalRam}
◈ 🖥️ *𝘗𝘭𝘢𝘵𝘧𝘰𝘳𝘮*    ⤳ ${platform}
◈ 🟩 *𝘕𝘰𝘥𝘦.𝘫𝘴*     ⤳ ${node}
◈ 🔑 *𝘓𝘪𝘤𝘦𝘯𝘴𝘦*     ⤳ ${expiryInfo}

▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

> _ULTRA GURU MD — built by GuruTech. All rights reserved._`
        );
    },
);

// ─────────────────────────────────────────────────────────────
//  17. SETTINGSINFO  — comprehensive overview (replaces old)
// ─────────────────────────────────────────────────────────────
gmd(
    {
        pattern: "settingsinfo",
        aliases: ["showsettings", "mysettings"],
        react: "⚙️",
        description: "Full overview of all configurable bot settings",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Guru, conText) => {
        const { reply, react } = conText;

        const sections = [
            {
                title: "🤖 𝘉𝘖𝘛 𝘐𝘋𝘌𝘕𝘛𝘐𝘛𝘠",
                keys: [
                    ["BOT_NAME",    "Name"],
                    ["BOT_VERSION", "Version"],
                    ["PREFIX",      "Prefix"],
                    ["MODE",        "Mode"],
                    ["BOT_LANG",    "Language"],
                    ["BOT_REPO",    "Repository"],
                    ["BOT_EXPIRY_DATE", "Expiry"],
                ],
            },
            {
                title: "🛡️ 𝘚𝘌𝘊𝘜𝘙𝘐𝘛𝘠 & 𝘗𝘙𝘖𝘛𝘌𝘊𝘛𝘐𝘖𝘕",
                keys: [
                    ["PM_PERMIT",          "PM Permit"],
                    ["DM_PERMIT_ACTION",   "DM Action"],
                    ["ANTICALL",           "Anti-Call"],
                    ["REJECT_CALL",        "Reject Call"],
                    ["TAG_PROTECT",        "Tag Protect"],
                    ["GLOBAL_SPAM_FILTER", "Spam Filter"],
                    ["ANTIVIEWONCE",       "Anti ViewOnce"],
                    ["WARN_LIMIT",         "Warn Limit"],
                ],
            },
            {
                title: "⚙️ 𝘈𝘜𝘛𝘖𝘔𝘈𝘛𝘐𝘖𝘕",
                keys: [
                    ["AUTO_LIKE_STATUS",   "Auto-Like Status"],
                    ["AUTO_READ_STATUS",   "Auto-Read Status"],
                    ["AUTO_REACT",         "Auto-React"],
                    ["AUTO_REPLY",         "Auto-Reply"],
                    ["AUTO_BIO",           "Auto-Bio"],
                    ["AUTO_READ_MESSAGES", "Auto-Read Msgs"],
                    ["AUTO_CHANNEL_LIKE",  "Channel Like"],
                    ["VV_TRACKER",         "VV Tracker"],
                ],
            },
            {
                title: "👥 𝘎𝘙𝘖𝘜𝘗 𝘉𝘌𝘏𝘈𝘝𝘐𝘖𝘜𝘙",
                keys: [
                    ["GROUP_JOIN_ACTION",  "Group Join"],
                    ["AUTO_MUTE",          "Auto-Mute"],
                    ["CHATBOT",            "Chatbot"],
                    ["CHATBOT_MODE",       "Chatbot Mode"],
                    ["STARTING_MESSAGE",   "Start Msg"],
                    ["ANTIDELETE",         "Anti-Delete"],
                    ["ANTI_EDIT",          "Anti-Edit"],
                    ["GREETINGS_ENABLED",  "Greetings"],
                ],
            },
        ];

        // Helper: format a setting value for display — special-cases BOT_EXPIRY_DATE
        const formatSettingDisplay = (key, raw) => {
            if (key === "BOT_EXPIRY_DATE") {
                if (!raw) return "♾️ 𝘕𝘖𝘛 𝘚𝘌𝘛 (𝘓𝘪𝘧𝘦𝘵𝘪𝘮𝘦)";
                const exp = new Date(raw);
                if (isNaN(exp.getTime())) return `⚠️ 𝘐𝘕𝘝𝘈𝘓𝘐𝘋 𝘋𝘈𝘛𝘌`;
                const now = Date.now();
                const dLeft = Math.ceil((exp - now) / 86400000);
                const hLeft = Math.floor(((exp - now) % 86400000) / 3600000);
                if (dLeft <= 0)  return `🔴 𝘌𝘟𝘗𝘐𝘙𝘌𝘋 · ${exp.toLocaleDateString("en-GB")}`;
                if (dLeft <= 7)  return `🟡 𝘌𝘟𝘗𝘐𝘙𝘐𝘕𝘎 · ${dLeft}d ${hLeft}h left`;
                return `🟢 𝘈𝘊𝘛𝘐𝘝𝘌 · ${exp.toLocaleDateString("en-GB")} (${dLeft}d left)`;
            }
            if (!raw) return "_not set_";
            return raw.length > 28 ? raw.substring(0, 28) + "…" : raw;
        };

        let out = `⚙️ *𝘜𝘓𝘛𝘙𝘈 𝘎𝘜𝘙𝘜 𝘔𝘋 — 𝘚𝘌𝘛𝘛𝘐𝘕𝘎𝘚 𝘖𝘝𝘌𝘙𝘝𝘐𝘌𝘞*\n${"━".repeat(34)}\n`;

        for (const sec of sections) {
            out += `\n*${sec.title}*\n`;
            for (const [key, label] of sec.keys) {
                const raw = await getSetting(key);
                const display = formatSettingDisplay(key, raw);
                out += `  ◈ *${si(label).padEnd(32)}* ⤳ ${display}\n`;
            }
        }

        out += `\n${"━".repeat(34)}\n> Use \`.setXXX\` commands to change any setting.\n> Try \`.quicksetup\` to configure multiple at once.`;

        await react("⚙️");
        reply(out);
    },
);
