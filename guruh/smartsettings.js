const { gmd }               = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");
const { sendGreeting, sendWellness } = require("../guru/scheduler");

// ═══════════════════════════════════════════════════════════════════
//  SMART SETTINGS PANEL  ·  ULTRA GURU MD
//  Unique, highly useful settings — Daily Wellness, Auto-Status
//  Watermark, Smart Broadcast, Bot Bio updater, Message Counter,
//  Flood-guard config, and a rich settings dashboard.
// ═══════════════════════════════════════════════════════════════════

const VALID_TZ_SAMPLES = [
    "Africa/Nairobi","Africa/Lagos","Africa/Johannesburg","Africa/Cairo",
    "Asia/Dubai","Asia/Kolkata","Europe/London","America/New_York",
    "America/Sao_Paulo","Australia/Sydney",
];

// ── Helper: on/off toggle ──────────────────────────────────────────
const toggleSetting = async (key, val, onLabel, offLabel) => {
    if (!["on","off","true","false","1","0"].includes(val.toLowerCase())) return null;
    const v = ["on","true","1"].includes(val.toLowerCase()) ? "true" : "false";
    await setSetting(key, v);
    return v === "true" ? onLabel : offLabel;
};

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "smartsettings",
    aliases:     ["ssettings", "smartpanel", "advancedsettings"],
    react:       "⚙️",
    category:    "owner",
    description: "Full smart settings dashboard",
    usage:       ".smartsettings",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const get = async (k, def = "not set") => (await getSetting(k).catch(() => null)) || def;

    const wellness     = await get("DAILY_WELLNESS",   "false");
    const wellnessTime = await get("WELLNESS_TIME",    "10:00");
    const watermark    = await get("MSG_WATERMARK",    "false");
    const watermarkTxt = await get("WATERMARK_TEXT",   "ULTRA GURU MD");
    const antiflood    = await get("ANTIFLOOD",        "false");
    const floodCount   = await get("FLOOD_COUNT",      "7");
    const floodAction  = await get("FLOOD_ACTION",     "warn");
    const botBio       = await get("BOT_BIO",          "");
    const autoBio      = await get("AUTO_BIO",         "false");
    const msgCounter   = await get("MSG_COUNTER",      "0");
    const broadcastMsg = await get("BROADCAST_MSG",    "");
    const gmEnabled    = await get("GREETINGS_ENABLED","false");
    const gmTime       = await get("GREETINGS_GM_TIME","06:00");
    const gnTime       = await get("GREETINGS_GN_TIME","22:00");

    const bool = (v) => v === "true" ? "🟢 ON" : "🔴 OFF";

    await react("✅");
    reply(
        `*⚙️ Smart Settings Dashboard*\n` +
        `${"═".repeat(34)}\n\n` +

        `*🌅 Greetings Scheduler*\n` +
        `  Status  › ${bool(gmEnabled)}\n` +
        `  GM Time › ${gmTime}  |  GN Time › ${gnTime}\n\n` +

        `*💙 Daily Wellness Check-In*\n` +
        `  Status  › ${bool(wellness)}\n` +
        `  Time    › ${wellnessTime}\n\n` +

        `*💧 Message Watermark*\n` +
        `  Status  › ${bool(watermark)}\n` +
        `  Text    › _${watermarkTxt}_\n\n` +

        `*🛡️ Anti-Flood Guard*\n` +
        `  Status  › ${bool(antiflood)}\n` +
        `  Limit   › ${floodCount} msgs / 10s  |  Action › ${floodAction}\n\n` +

        `*🤖 Bot Bio (WhatsApp About)*\n` +
        `  Auto-update › ${bool(autoBio)}\n` +
        `  Bio Text    › _${botBio || "(default)"}..._\n\n` +

        `*📊 Stats*\n` +
        `  Messages Handled › ${parseInt(msgCounter).toLocaleString()}\n\n` +

        `${"─".repeat(34)}\n` +
        `*Commands:*\n` +
        `\`.wellness on/off\`  \`.wellnesstime HH:MM\`  \`.testwellness\`\n` +
        `\`.watermark on/off\`  \`.setwatermark <text>\`\n` +
        `\`.antiflood on/off\`  \`.floodlimit <n>\`  \`.floodaction warn|kick\`\n` +
        `\`.botbio <text>\`  \`.autobio on/off\`\n` +
        `\`.broadcastmsg <text>\`  \`.sendbroadcast\`\n` +
        `\`.msgstats\``
    );
});

// ═══════════════════════════════════════════════════════════════════
//  DAILY WELLNESS COMMANDS
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "wellness",
    aliases:     ["dailywellness", "checkintoggle"],
    react:       "💙",
    category:    "owner",
    description: "Toggle daily wellness check-in message (on/off)",
    usage:       ".wellness on",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const val = (q || "").trim().toLowerCase();
    if (!val) {
        const cur = (await getSetting("DAILY_WELLNESS").catch(() => "false")) || "false";
        const t   = (await getSetting("WELLNESS_TIME").catch(() => "10:00")) || "10:00";
        await react("ℹ️");
        return reply(
            `*💙 Daily Wellness Check-In*\n\n` +
            `Status : ${cur === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
            `Time   : ${t}\n\n` +
            `Every day at the set time, the bot sends a warm check-in message to all registered chats asking members:\n` +
            `• How are they doing today?\n` +
            `• Have they updated their bot?\n` +
            `• Wishing them a great day!\n\n` +
            `*Commands:*\n` +
            `\`.wellness on/off\` — toggle\n` +
            `\`.wellnesstime 10:00\` — set time\n` +
            `\`.testwellness\` — send now\n\n` +
            `_Uses same chat list as greetings (.addchat)_`
        );
    }

    const result = await toggleSetting("DAILY_WELLNESS", val, "🟢 Daily wellness ON", "🔴 Daily wellness OFF");
    if (!result) { await react("❌"); return reply("❌ Use: `.wellness on` or `.wellness off`"); }
    await react("✅");
    reply(`*${result}*\n\n${val === "on" || val === "true" ? "Daily check-in messages will be sent to all registered chats." : "Daily wellness messages stopped."}`);
});

gmd({
    pattern:     "wellnesstime",
    aliases:     ["setwellnesstime", "checkintime"],
    react:       "⏰",
    category:    "owner",
    description: "Set the daily wellness check-in time",
    usage:       ".wellnesstime 10:00",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const t = (q || "").trim();
    if (!t || !/^\d{1,2}:\d{2}$/.test(t)) {
        await react("❌");
        return reply("❌ Format: `.wellnesstime HH:MM`\nExample: `.wellnesstime 10:00`");
    }
    await setSetting("WELLNESS_TIME", t);
    await react("✅");
    reply(`✅ *Wellness Time Set*\n\nDaily check-in will be sent at *${t}* every day.`);
});

gmd({
    pattern:     "testwellness",
    aliases:     ["sendwellness", "triggerwellness"],
    react:       "💙",
    category:    "owner",
    description: "Send daily wellness check-in right now (test)",
    usage:       ".testwellness",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    await react("⏳");
    reply("💙 Sending wellness check-in...");
    const sent = await sendWellness(Guru);
    await react("✅");
    reply(`✅ Wellness check-in sent to *${sent}* chat(s)!\n\n_Use \`.addchat\` to add more chats to the list._`);
});

// ═══════════════════════════════════════════════════════════════════
//  MESSAGE WATERMARK
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "watermark",
    aliases:     ["msgwatermark", "botwatermark"],
    react:       "💧",
    category:    "owner",
    description: "Toggle message watermark footer on all bot replies",
    usage:       ".watermark on",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const val = (q || "").trim().toLowerCase();
    if (!val) {
        const cur = (await getSetting("MSG_WATERMARK").catch(() => "false")) || "false";
        const txt = (await getSetting("WATERMARK_TEXT").catch(() => "")) || "ULTRA GURU MD";
        await react("ℹ️");
        return reply(
            `*💧 Message Watermark*\n\n` +
            `Status : ${cur === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
            `Text   : _${txt}_\n\n` +
            `When ON, all bot text replies append a small watermark footer.\n\n` +
            `\`.watermark on/off\` · \`.setwatermark <text>\``
        );
    }

    const result = await toggleSetting("MSG_WATERMARK", val, "🟢 Watermark ON", "🔴 Watermark OFF");
    if (!result) { await react("❌"); return reply("❌ Use: `.watermark on` or `.watermark off`"); }
    await react("✅");
    reply(`*${result}*`);
});

gmd({
    pattern:     "setwatermark",
    aliases:     ["watermarktext", "setbrand"],
    react:       "✏️",
    category:    "owner",
    description: "Set the message watermark text",
    usage:       ".setwatermark <text>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    if (!q) { await react("❓"); return reply("❓ Usage: `.setwatermark <text>`\nExample: `.setwatermark Powered by ULTRA GURU MD ⚡`"); }
    if (q.length > 80) { await react("❌"); return reply("❌ Watermark text must be under 80 characters."); }

    await setSetting("WATERMARK_TEXT", q.trim());
    await react("✅");
    reply(`✅ *Watermark Text Saved*\n\n_${q.trim()}_`);
});

// ═══════════════════════════════════════════════════════════════════
//  ANTI-FLOOD GUARD
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "antiflood",
    aliases:     ["floodguard", "floodprotect"],
    react:       "🛡️",
    category:    "owner",
    description: "Toggle anti-flood detection in groups",
    usage:       ".antiflood on",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const val = (q || "").trim().toLowerCase();
    if (!val) {
        const cur    = (await getSetting("ANTIFLOOD").catch(() => "false")) || "false";
        const limit  = (await getSetting("FLOOD_COUNT").catch(() => "7")) || "7";
        const action = (await getSetting("FLOOD_ACTION").catch(() => "warn")) || "warn";
        await react("ℹ️");
        return reply(
            `*🛡️ Anti-Flood Guard*\n\n` +
            `Status : ${cur === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
            `Limit  : ${limit} messages per 10 seconds\n` +
            `Action : ${action} (warn / kick / remove)\n\n` +
            `When ON, any group member who sends more than the limit within 10 seconds is automatically acted on.\n\n` +
            `\`.antiflood on/off\`\n` +
            `\`.floodlimit <number>\` — set message limit\n` +
            `\`.floodaction warn|kick\` — set action`
        );
    }

    const result = await toggleSetting("ANTIFLOOD", val, "🟢 Anti-flood ON", "🔴 Anti-flood OFF");
    if (!result) { await react("❌"); return reply("❌ Use `.antiflood on` or `.antiflood off`"); }
    await react("✅");
    reply(`*${result}*\n\n${val === "on" ? "Bot will now detect and act on message flooding in groups." : "Anti-flood protection disabled."}`);
});

gmd({
    pattern:     "floodlimit",
    aliases:     ["setfloodlimit", "floodcount"],
    react:       "🔢",
    category:    "owner",
    description: "Set the flood message limit per 10 seconds",
    usage:       ".floodlimit 7",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const n = parseInt((q || "").trim(), 10);
    if (isNaN(n) || n < 2 || n > 30) { await react("❌"); return reply("❌ Flood limit must be between 2 and 30."); }

    await setSetting("FLOOD_COUNT", String(n));
    await react("✅");
    reply(`✅ *Flood Limit Set*\n\nBots will act after *${n}* messages in 10 seconds.`);
});

gmd({
    pattern:     "floodaction",
    aliases:     ["setfloodaction"],
    react:       "⚡",
    category:    "owner",
    description: "Set action when flood is detected: warn or kick",
    usage:       ".floodaction warn",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const v = (q || "").trim().toLowerCase();
    if (!["warn","kick","remove"].includes(v)) { await react("❌"); return reply("❌ Valid actions: `warn`, `kick`"); }

    await setSetting("FLOOD_ACTION", v);
    await react("✅");
    reply(`✅ *Flood Action Set*\n\nAction on flood detection: *${v.toUpperCase()}*`);
});

// Anti-flood passive enforcement hook
if (!global.__pluginMsgHooks) global.__pluginMsgHooks = [];
const floodTracker = new Map(); // jid → { count, resetAt }

global.__pluginMsgHooks.push(async (ms, Guru, settings) => {
    try {
        const enabled = await getSetting("ANTIFLOOD").catch(() => "false");
        if (enabled !== "true") return;

        const from = ms.key.remoteJid;
        if (!from?.endsWith("@g.us")) return; // groups only

        const sender  = ms.key.participant;
        if (!sender || ms.key.fromMe) return;

        const key     = `${from}::${sender}`;
        const now     = Date.now();
        const limit   = parseInt(await getSetting("FLOOD_COUNT").catch(() => "7"), 10) || 7;
        const entry   = floodTracker.get(key) || { count: 0, resetAt: now + 10_000 };

        if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 10_000; }
        entry.count++;
        floodTracker.set(key, entry);

        if (entry.count !== limit + 1) return; // only act exactly once per flood burst

        const action  = (await getSetting("FLOOD_ACTION").catch(() => "warn")) || "warn";
        const numStr  = sender.split("@")[0].split(":")[0];

        if (action === "warn") {
            await Guru.sendMessage(from, {
                text: `⚠️ @${numStr} — *Flood detected!*\nPlease slow down or you will be removed from the group.`,
                mentions: [sender],
            });
        } else if (action === "kick" || action === "remove") {
            await Guru.groupParticipantsUpdate(from, [sender], "remove").catch(() => {});
            await Guru.sendMessage(from, { text: `🚫 @${numStr} was removed for message flooding.`, mentions: [sender] });
        }

        // Reset after action so they get another chance
        floodTracker.delete(key);
    } catch (_) {}
});

// ═══════════════════════════════════════════════════════════════════
//  BOT BIO AUTO-UPDATER
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "botbio",
    aliases:     ["setbotbio", "botstatus", "botabout"],
    react:       "🤖",
    category:    "owner",
    description: "Set the bot's WhatsApp About/Bio text",
    usage:       ".botbio <text>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    if (!q) {
        const cur = (await getSetting("BOT_BIO").catch(() => "")) || "";
        await react("ℹ️");
        return reply(`*🤖 Bot Bio*\n\nCurrent: _${cur || "(not set)"}_\n\nUsage: \`.botbio <text>\`\nExample: \`.botbio ⚡ ULTRA GURU MD — Always Online!\`\n\nMax 139 characters.`);
    }

    if (q.length > 139) { await react("❌"); return reply("❌ Bio must be under 139 characters (WhatsApp limit)."); }

    await setSetting("BOT_BIO", q.trim());
    try {
        await Guru.updateProfileStatus(q.trim());
    } catch (e) {
        console.error("[BotBio] update error:", e.message);
    }
    await react("✅");
    reply(`✅ *Bot Bio Updated!*\n\n_${q.trim()}_`);
});

gmd({
    pattern:     "autobio",
    aliases:     ["toggleautobio", "dynamicbio"],
    react:       "🔄",
    category:    "owner",
    description: "Toggle auto-updating bot bio with uptime/date",
    usage:       ".autobio on",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const val = (q || "").trim().toLowerCase();
    if (!["on","off"].includes(val)) {
        const cur = (await getSetting("AUTO_BIO").catch(() => "false")) || "false";
        await react("ℹ️");
        return reply(
            `*🔄 Auto-Bio*\n\nStatus: ${cur === "true" ? "🟢 ON" : "🔴 OFF"}\n\n` +
            `When ON, the bot updates its WhatsApp About status every 30 minutes with:\n` +
            `• Current uptime\n• Date\n• System health\n\n` +
            `\`.autobio on/off\``
        );
    }

    await setSetting("AUTO_BIO", val === "on" ? "true" : "false");

    if (val === "on") {
        if (global.__autoBioInterval) clearInterval(global.__autoBioInterval);
        global.__autoBioInterval = setInterval(async () => {
            try {
                const startTime = global.__botStartTime || Date.now();
                const upMs      = Date.now() - startTime;
                const upH       = Math.floor(upMs / 3_600_000);
                const upM       = Math.floor((upMs % 3_600_000) / 60_000);
                const bio       = `⚡ ULTRA GURU MD | Up ${upH}h${upM}m | ${new Date().toLocaleDateString()} | Always Online 🤖`;
                await Guru.updateProfileStatus(bio);
            } catch (_) {}
        }, 30 * 60_000);
    } else {
        if (global.__autoBioInterval) { clearInterval(global.__autoBioInterval); global.__autoBioInterval = null; }
    }

    await react("✅");
    reply(`${val === "on" ? "🟢" : "🔴"} *Auto-Bio ${val.toUpperCase()}*\n\n${val === "on" ? "Bot About text will auto-update every 30 minutes." : "Auto-bio disabled."}`);
});

// ═══════════════════════════════════════════════════════════════════
//  SMART BROADCAST
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "broadcastmsg",
    aliases:     ["setbroadcast", "savebcast"],
    react:       "📢",
    category:    "owner",
    description: "Save a message for instant broadcast to all registered chats",
    usage:       ".broadcastmsg <message>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    if (!q) { await react("❓"); return reply("❓ Usage: `.broadcastmsg <message>`\n\nThen send it with `.sendbroadcast`"); }

    await setSetting("BROADCAST_MSG", q.trim());
    await react("✅");
    reply(`✅ *Broadcast Message Saved!*\n\n_${q.trim().slice(0, 120)}${q.length > 120 ? "..." : ""}_\n\nSend it to all registered chats with \`.sendbroadcast\``);
});

gmd({
    pattern:     "sendbroadcast",
    aliases:     ["bcastnow", "broadcastnow"],
    react:       "📡",
    category:    "owner",
    description: "Broadcast the saved message to all registered chats",
    usage:       ".sendbroadcast",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const msg = await getSetting("BROADCAST_MSG").catch(() => null);
    if (!msg) { await react("❌"); return reply("❌ No broadcast message saved. Use `.broadcastmsg <text>` first."); }

    const { getAllGreetingsChats } = require("../guru/database/greetings");
    const chats = await getAllGreetingsChats();
    if (!chats.length) { await react("❌"); return reply("❌ No chats registered. Use `.addchat` in a chat first."); }

    await react("⏳");
    reply(`📡 Broadcasting to *${chats.length}* chat(s)...`);

    let sent = 0;
    for (const { jid } of chats) {
        try {
            await Guru.sendMessage(jid, { text: msg });
            sent++;
            await new Promise(r => setTimeout(r, 1_200));
        } catch (_) {}
    }

    await react("✅");
    reply(`✅ *Broadcast Complete!*\n\nDelivered to *${sent}/${chats.length}* chats.`);
});

// ═══════════════════════════════════════════════════════════════════
//  MESSAGE STATS
// ═══════════════════════════════════════════════════════════════════
if (!global.__msgCountHooked) {
    global.__msgCountHooked = true;
    if (!global.__pluginMsgHooks) global.__pluginMsgHooks = [];
    global.__pluginMsgHooks.push(async () => {
        try {
            const cur = parseInt(await getSetting("MSG_COUNTER").catch(() => "0"), 10) || 0;
            await setSetting("MSG_COUNTER", String(cur + 1));
        } catch (_) {}
    });
}

gmd({
    pattern:     "msgstats",
    aliases:     ["botstats", "messagestats", "statscounter"],
    react:       "📊",
    category:    "owner",
    description: "Show total messages handled by the bot",
    usage:       ".msgstats",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const total    = parseInt(await getSetting("MSG_COUNTER").catch(() => "0"), 10) || 0;
    const startMs  = global.__botStartTime || Date.now();
    const uptimeMs = Date.now() - startMs;
    const uptimeH  = Math.floor(uptimeMs / 3_600_000);
    const uptimeM  = Math.floor((uptimeMs % 3_600_000) / 60_000);
    const rate     = uptimeMs > 0 ? ((total / uptimeMs) * 60_000).toFixed(1) : "0";

    await react("✅");
    reply(
        `*📊 Bot Message Statistics*\n${"═".repeat(32)}\n\n` +
        `📨 *Total Messages:*  ${total.toLocaleString()}\n` +
        `⏱️ *Uptime:*          ${uptimeH}h ${uptimeM}m\n` +
        `⚡ *Rate:*            ~${rate} msgs/min\n\n` +
        `> _Counter persists across restarts_`
    );
});

// ═══════════════════════════════════════════════════════════════════
//  GITHUB PUSH COMMAND
// ═══════════════════════════════════════════════════════════════════
gmd({
    pattern:     "pushgit",
    aliases:     ["githubsync", "pushgithub", "syncgithub"],
    react:       "🐙",
    category:    "owner",
    description: "Push all bot changes to GitHub via REST API",
    usage:       ".pushgit",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    if (!token) {
        await react("❌");
        return reply("❌ *GITHUB_PERSONAL_ACCESS_TOKEN* is not set in environment variables.");
    }

    await react("⏳");
    reply("🐙 Starting GitHub sync...\n\n_Pushing files via REST API (no git required)_");

    const scriptPath = require("path").join(__dirname, "../scripts/github-sync.js");
    try {
        const { execFile } = require("child_process");
        const child = execFile(process.execPath, [scriptPath], {
            env: { ...process.env },
            timeout: 120_000,
        });

        let out = "";
        child.stdout?.on("data", d => { out += d; });
        child.stderr?.on("data", d => { out += d; });

        child.on("close", async (code) => {
            const lines  = out.split("\n").filter(Boolean);
            const pushed = lines.filter(l => l.includes("✅")).length;
            const failed = lines.filter(l => l.includes("❌")).length;
            const skip   = lines.filter(l => l.includes("⏭️")).length;

            if (code === 0 || failed === 0) {
                await react("✅");
                await Guru.sendMessage(from, {
                    text:
                        `*🐙 GitHub Sync Complete!*\n${"═".repeat(30)}\n\n` +
                        `✅ Pushed   : *${pushed}* files\n` +
                        `⏭️ Unchanged: *${skip}* files\n` +
                        `❌ Failed   : *${failed}* files\n\n` +
                        `> _All changes are now live on GitHub!_`,
                });
            } else {
                await react("❌");
                const failLines = lines.filter(l => l.includes("❌")).join("\n");
                await Guru.sendMessage(from, {
                    text:
                        `*🐙 GitHub Sync — Partial Failure*\n\n` +
                        `✅ ${pushed} pushed | ❌ ${failed} failed\n\n` +
                        `${failLines}\n\n` +
                        `_Check that GITHUB_PERSONAL_ACCESS_TOKEN has write access._`,
                });
            }
        });
    } catch (err) {
        await react("❌");
        reply(`❌ Sync error: ${err.message}`);
    }
});

// Track bot start time
if (!global.__botStartTime) global.__botStartTime = Date.now();

// ── Auto-bio startup launcher ────────────────────────────────────
// Starts the interval automatically if AUTO_BIO is on (default: true)
if (!global.__autoBioInterval) {
    getSetting("AUTO_BIO").then(val => {
        const enabled = (val === null || val === undefined) ? "true" : val;
        if (enabled !== "true") return;

        global.__autoBioInterval = setInterval(async () => {
            try {
                const sock = global._botSocket;
                if (!sock) return;
                const startTime = global.__botStartTime || Date.now();
                const upMs = Date.now() - startTime;
                const upH  = Math.floor(upMs / 3_600_000);
                const upM  = Math.floor((upMs % 3_600_000) / 60_000);
                const customBio = await getSetting("BOT_BIO").catch(() => "");
                const bio = customBio && customBio.trim()
                    ? customBio.trim()
                    : `⚡ ULTRA GURU MD | Up ${upH}h${upM}m | ${new Date().toLocaleDateString()} | Always Online 🤖`;
                await sock.updateProfileStatus(bio);
            } catch (_) {}
        }, 30 * 60_000);

        // Run once immediately on startup (after 10s to let socket settle)
        setTimeout(async () => {
            try {
                const sock = global._botSocket;
                if (!sock) return;
                const customBio = await getSetting("BOT_BIO").catch(() => "");
                const bio = customBio && customBio.trim()
                    ? customBio.trim()
                    : `⚡ ULTRA GURU MD | Online & Ready | ${new Date().toLocaleDateString()} | Always Active 🤖`;
                await sock.updateProfileStatus(bio);
            } catch (_) {}
        }, 10_000);
    }).catch(() => {});
}
