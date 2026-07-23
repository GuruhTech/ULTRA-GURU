/**
 * design.js — Bot Design & Menu Theme System
 * Commands: .setmenu, .previewmenu, .setbotpic, .setmenupic,
 *           .setfooter, .setcaption, .setbotname, .designinfo, .resetdesign
 */

"use strict";

const { gmd, commands }                          = require("../guru");
const { getSetting, setSetting, resetSetting }   = require("../guru/database/settings");
const { getExpiryStatus }                        = require("../guru/expiry");
const { S_WHATSAPP_NET }                         = require("@whiskeysockets/baileys");
const fs   = require("fs").promises;
const path = require("path");
const moment = require("moment-timezone");

// ─── helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400); seconds %= 86400;
    const h = Math.floor(seconds / 3600);  seconds %= 3600;
    const m = Math.floor(seconds / 60);    seconds %= 60;
    return `${d}d ${h}h ${m}m ${seconds}s`;
}

function memProgress(filled, total, width = 10) {
    const f   = Math.max(0, Math.min(width, Math.round((filled / total) * width)));
    const bar = '▰'.repeat(f) + '▱'.repeat(width - f);
    return `${bar} ${Math.round((filled / total) * 100)}%`;
}

function fmtMB(bytes) { return (bytes / 1024 / 1024).toFixed(1) + ' MB'; }

function now(fmt, tz) {
    return moment().tz(tz || 'Africa/Nairobi').format(fmt);
}

const CAT_ICONS = {
    general: "💬", owner: "🔐", group: "👥", ai: "🧠",
    downloader: "⬇️", tools: "⚒️", search: "🔎", games: "🕹️",
    fun: "🎭", religion: "🤲", sticker: "🪄", converter: "🔀",
    settings: "🛠️", media: "🎬", notes: "🗒️", channels: "📡",
    sports: "🏆", extras: "💎", texttools: "✍️", restrictions: "🛡️",
    ultracore: "🔥",
};

const CAT_ORDER = [
    "general","ai","downloader","tools","search","games","group","owner",
    "settings","fun","converter","religion","texttools","notes","channels",
    "sports","extras","restrictions","sticker","media","ultracore",
];

const GREETINGS = ['Habari', 'Sawubona', 'Sanibona', 'Dumela', 'Hello', 'Salut', 'Hola', 'Mambo'];

function timeGreeting(h) {
    if (h < 12) return '🌅 Good Morning';
    if (h < 17) return '☀️ Good Afternoon';
    if (h < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
}

/**
 * getSortedCategories — single source of truth for category ordering.
 */
function getSortedCategories() {
    const catMap = {};
    for (const cmd of commands) {
        if (!cmd.pattern || cmd.dontAddCommandList) continue;
        if (typeof cmd.pattern !== 'string') continue;
        const cat = (cmd.category || "general").toLowerCase();
        if (!catMap[cat]) catMap[cat] = [];
        catMap[cat].push(cmd);
    }
    return Object.keys(catMap).sort((a, b) => {
        const ai = CAT_ORDER.indexOf(a), bi = CAT_ORDER.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    }).map(cat => ({ cat, cmds: catMap[cat] }));
}

// ─── menu data builder ────────────────────────────────────────────────────────

async function buildMenuData(conText) {
    const {
        sender, pushName, botName, botPrefix, botVersion,
        botMode, botFooter, botCaption, newsletterJid,
    } = conText;

    const uptime     = formatUptime(Math.floor(process.uptime()));
    const totalCmds  = commands.filter(c => c.pattern && !c.dontAddCommandList).length;
    const mem        = process.memoryUsage();
    const memBar     = memProgress(mem.heapUsed, mem.heapTotal, 10);
    const memDetail  = `${fmtMB(mem.heapUsed)} / ${fmtMB(mem.heapTotal)}`;
    const tz         = process.env.TIME_ZONE || 'Africa/Nairobi';
    const hour       = parseInt(now('HH', tz), 10);
    const dateStr    = now('DD MMM YYYY', tz);
    const timeStr    = now('hh:mm A', tz);
    const timeStr24  = now('hh:mm:ss A', tz);
    const greeting   = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    const tGreet     = timeGreeting(hour);

    // Expiry — reads from env var + DB fallback
    const expiryStatus = await getExpiryStatus();
    const expiryLine   = expiryStatus.line;
    const expiryDetail = expiryStatus.daysLeft !== null
        ? (expiryStatus.daysLeft <= 0 ? 'EXPIRED' : `${expiryStatus.daysLeft}d remaining`)
        : 'Lifetime · Always active';

    const sortedCats = getSortedCategories();

    // Quoted blockquote style: > 01  icon  LABEL  (N cmds)
    const catLines = sortedCats.map(({ cat, cmds }, i) => {
        const icon  = CAT_ICONS[cat] || "🔥";
        const count = cmds.length;
        const label = (cat[0].toUpperCase() + cat.slice(1)).toUpperCase();
        const num   = String(i + 1).padStart(2, '0');
        return `> ${num}  ${icon}  ${label}  _(${count})_`;
    }).join("\n");

    return {
        sender,
        pushName:   pushName   || "User",
        botName:    botName    || "ULTRA GURU",
        botPrefix:  botPrefix  || ".",
        botVersion: botVersion || "5.0.0",
        botMode:    botMode    || "public",
        botFooter:  botFooter  || "Powered by GURUTECH",
        botCaption: botCaption || "",
        newsletterJid,
        uptime, totalCmds, catLines,
        expiryLine, expiryDetail,
        memBar, memDetail,
        dateStr, timeStr, timeStr24,
        greeting, timeGreet: tGreet,
        numCats: sortedCats.length,
    };
}

// ─── THEMES ───────────────────────────────────────────────────────────────────

const THEMES = {

    ultra: {
        name: "🔷 ULTRA",
        description: "Premium blockquote style with clean stats",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, numCats,
                  pushName, memBar, dateStr, timeStr, timeGreet }) {
            return (
`> 🔥 *${botName.toUpperCase()}*  ·  _v${botVersion}_
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 👤 Hey *${pushName}*  —  ${timeGreet}
> 📅 ${dateStr}  ·  🕐 ${timeStr}
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 💬 Commands  ›  *${totalCmds}*
> ⏱️  Uptime    ›  *${uptime}*
> 🔑  Prefix    ›  *${botPrefix}*
> 🛠️  Mode      ›  *${botMode.toUpperCase()}*
> 💾  RAM       ›  ${memBar}
> 🔒  Licence   ›  ${expiryLine}
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 📋 *CATEGORIES*  ·  _reply 1–${numCats}_
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${catLines}
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ✨ _${botFooter}_`
            );
        },
    },

    panther: {
        name: "🐾 PANTHER",
        description: "Wakanda-inspired bold blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, numCats,
                  pushName, memBar, dateStr, timeStr24, timeGreet }) {
            return (
`> 🐾 *${botName.toUpperCase()}*
> ⚡ WAKANDA FOREVER 🌍
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 🌟 ${timeGreet}, *${pushName}*
> 📅 ${dateStr}  ·  🕐 ${timeStr24}
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 🕹️  Commands  ›  *${totalCmds}*
> ⏱️  Uptime    ›  *${uptime}*
> 🔑  Prefix    ›  *${botPrefix}*
> 🛡️  Mode      ›  *${botMode.toUpperCase()}*
> 📦  Version   ›  *v${botVersion}*
> 💾  RAM       ›  ${memBar}
> 🔒  Licence   ›  ${expiryLine}
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 🐾 *COMMAND CATEGORIES*
> _Tap a number  ·  1–${numCats}_
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${catLines}
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 🐾 _${botFooter}_`
            );
        },
    },

    neon: {
        name: "⚡ NEON",
        description: "Cyberpunk electric blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, memBar, pushName, numCats }) {
            return (
`> ⚡ *${botName.toUpperCase()}*  ⚡
> ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
> 🤖 Hey *${pushName}*
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 💬 CMDS    ⟩  *${totalCmds}*
> ⏱️  UPTIME  ⟩  *${uptime}*
> 🔑  PREFIX  ⟩  *${botPrefix}*
> 🛠️  MODE    ⟩  *${botMode.toUpperCase()}*
> 📦  VER     ⟩  *v${botVersion}*
> 💾  RAM     ⟩  ${memBar}
> 🔒  LIC     ⟩  ${expiryLine}
> ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
> ⚡ *CATEGORIES*  ·  _reply 1–${numCats}_
> ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
${catLines}
> ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
> ⚡ _${botFooter}_`
            );
        },
    },

    minimal: {
        name: "🪶 MINIMAL",
        description: "Clean blockquote — no clutter",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, pushName, numCats }) {
            return (
`> 🪶 *${botName.toUpperCase()}*
> ──────────────────────────────
> 👋 Hi *${pushName}*
> 💬 Commands  ·  *${totalCmds}*
> ⏱️  Uptime    ·  *${uptime}*
> 🔑  Prefix    ·  *${botPrefix}*
> 🛠️  Mode      ·  *${botMode.toUpperCase()}*
> 📦  Version   ·  *v${botVersion}*
> 🔒  Licence   ·  ${expiryLine}
> ──────────────────────────────
> 📋 *Categories*  ·  _reply 1–${numCats}_
> ──────────────────────────────
${catLines}
> ──────────────────────────────
> _${botFooter}_`
            );
        },
    },

    royal: {
        name: "👑 ROYAL",
        description: "Elegant gold-crown blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, expiryDetail, pushName, numCats }) {
            return (
`> 👑 *${botName.toUpperCase()}* 👑
> ✦ ━━━━━━━━━━━━━━━━━━━━━━━ ✦
> 💎 Welcome, *${pushName}*
> ✦ ━━━━━━━━━━━━━━━━━━━━━━━ ✦
> 💬 Total Commands  ›  *${totalCmds}*
> ⏱️  Uptime          ›  *${uptime}*
> 🔑  Prefix          ›  *${botPrefix}*
> 🛠️  Mode            ›  *${botMode.toUpperCase()}*
> 📦  Version         ›  *v${botVersion}*
> 🔒  Licence         ›  ${expiryLine}
> 📅  Expiry          ›  _${expiryDetail}_
> ✦ ━━━━━━━━━━━━━━━━━━━━━━━ ✦
> 👑 *COMMAND CATEGORIES*
> _Reply a number to explore  ·  1–${numCats}_
> ✦ ━━━━━━━━━━━━━━━━━━━━━━━ ✦
${catLines}
> ✦ ━━━━━━━━━━━━━━━━━━━━━━━ ✦
> 👑 _${botFooter}_`
            );
        },
    },

    galaxy: {
        name: "🌌 GALAXY",
        description: "Space & stars blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, pushName, memBar, numCats }) {
            return (
`> 🌌 *${botName.toUpperCase()}*  🚀
> ✨ ━━━━━━━━━━━━━━━━━━━━━━━ ✨
> 🌟 Greetings, *${pushName}*
> ✨ ━━━━━━━━━━━━━━━━━━━━━━━ ✨
> 🪐  Commands  ··  *${totalCmds}*
> ⏳  Uptime    ··  *${uptime}*
> 🔭  Prefix    ··  *${botPrefix}*
> 🛸  Mode      ··  *${botMode.toUpperCase()}*
> 🌍  Version   ··  *v${botVersion}*
> 💾  RAM       ··  ${memBar}
> 🔒  Licence   ··  ${expiryLine}
> ✨ ━━━━━━━━━━━━━━━━━━━━━━━ ✨
> 🌌 *WARP TO A CATEGORY*
> _Reply with a number  ·  1–${numCats}_
> ✨ ━━━━━━━━━━━━━━━━━━━━━━━ ✨
${catLines}
> ✨ ━━━━━━━━━━━━━━━━━━━━━━━ ✨
> 🌙 _${botFooter}_`
            );
        },
    },

    dark: {
        name: "🖤 DARK",
        description: "Dark gothic blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, pushName, memBar, numCats }) {
            return (
`> 🖤 *${botName.toUpperCase()}* 🖤
> ◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
> ☠️  *${pushName}* entered the shadows
> ◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
> 💬  Commands  ›  *${totalCmds}*
> ⏱️   Uptime    ›  *${uptime}*
> 🔑  Prefix    ›  *${botPrefix}*
> 🛠️  Mode      ›  *${botMode.toUpperCase()}*
> 📦  Version   ›  *v${botVersion}*
> 💾  RAM       ›  ${memBar}
> 🔒  Licence   ›  ${expiryLine}
> ◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
> 🕷️ *COMMAND CATEGORIES*
> _Choose your path  ·  1–${numCats}_
> ◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
${catLines}
> ◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
> 🖤 _${botFooter}_`
            );
        },
    },

    flower: {
        name: "🌸 FLOWER",
        description: "Cute floral blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, pushName, numCats }) {
            return (
`> 🌸 *${botName.toUpperCase()}* 🌸
> 🌺 ━━━━━━━━━━━━━━━━━━━━━━━ 🌺
> 🌷 Hi *${pushName}*  ╰(✿◕‿◕✿)╯
> 🌺 ━━━━━━━━━━━━━━━━━━━━━━━ 🌺
> 🌻  Cmds     »  *${totalCmds}*
> 🌻  Uptime   »  *${uptime}*
> 🌻  Prefix   »  *${botPrefix}*
> 🌻  Mode     »  *${botMode.toUpperCase()}*
> 🌻  Version  »  *v${botVersion}*
> 🌻  Licence  »  ${expiryLine}
> 🌺 ━━━━━━━━━━━━━━━━━━━━━━━ 🌺
> 🌷 *CATEGORIES*
> _Reply a number  ·  1–${numCats}_
> 🌺 ━━━━━━━━━━━━━━━━━━━━━━━ 🌺
${catLines}
> 🌺 ━━━━━━━━━━━━━━━━━━━━━━━ 🌺
> 🌸 _${botFooter}_`
            );
        },
    },

    fire: {
        name: "🔥 FIRE",
        description: "Blazing hot blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, pushName, numCats }) {
            return (
`> 🔥 *${botName.toUpperCase()}* 🔥
> 🌋 ━━━━━━━━━━━━━━━━━━━━━━━ 🌋
> 💥 *${pushName}*, you're on fire!
> 🌋 ━━━━━━━━━━━━━━━━━━━━━━━ 🌋
> 🔥  Cmds     ⟩  *${totalCmds}*
> 🔥  Uptime   ⟩  *${uptime}*
> 🔥  Prefix   ⟩  *${botPrefix}*
> 🔥  Mode     ⟩  *${botMode.toUpperCase()}*
> 🔥  Version  ⟩  *v${botVersion}*
> 🔥  Licence  ⟩  ${expiryLine}
> 🌋 ━━━━━━━━━━━━━━━━━━━━━━━ 🌋
> 🔥 *COMMAND CATEGORIES*
> 🌶️ _Reply a number to ignite  ·  1–${numCats}_
> 🌋 ━━━━━━━━━━━━━━━━━━━━━━━ 🌋
${catLines}
> 🌋 ━━━━━━━━━━━━━━━━━━━━━━━ 🌋
> 🔥 _${botFooter}_`
            );
        },
    },

    wave: {
        name: "🌊 WAVE",
        description: "Calm ocean blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, pushName, numCats }) {
            return (
`> 🌊 *${botName.toUpperCase()}* 🌊
> 〰️ ━━━━━━━━━━━━━━━━━━━━━━━ 〰️
> 🐚 Riding the wave, *${pushName}*
> 〰️ ━━━━━━━━━━━━━━━━━━━━━━━ 〰️
> 🐠  Commands  ›  *${totalCmds}*
> 🐠  Uptime    ›  *${uptime}*
> 🐠  Prefix    ›  *${botPrefix}*
> 🐠  Mode      ›  *${botMode.toUpperCase()}*
> 🐠  Version   ›  *v${botVersion}*
> 🐠  Licence   ›  ${expiryLine}
> 〰️ ━━━━━━━━━━━━━━━━━━━━━━━ 〰️
> 🌊 *COMMAND CATEGORIES*
> ↯ _Reply a number  ·  1–${numCats}_
> 〰️ ━━━━━━━━━━━━━━━━━━━━━━━ 〰️
${catLines}
> 〰️ ━━━━━━━━━━━━━━━━━━━━━━━ 〰️
> 🌊 _${botFooter}_`
            );
        },
    },

    matrix: {
        name: "💻 MATRIX",
        description: "Hacker terminal blockquote style",
        render({ botName, botPrefix, botVersion, botMode, botFooter,
                  uptime, totalCmds, catLines, expiryLine, sender, memBar, numCats }) {
            return (
`> 💻 *${botName.toUpperCase()}*
> ══════════════════════════════
> ⌨️  INIT_USER  ::  ${sender.split("@")[0]}
> ✅  SYS_BOOT   ::  COMPLETE
> ══════════════════════════════
> 💬  CMDS       ::  *${totalCmds}*
> ⏱️   UPTIME     ::  *${uptime}*
> 🔑  PREFIX     ::  *${botPrefix}*
> 🛠️  MODE       ::  *${botMode.toUpperCase()}*
> 📦  VERSION    ::  *v${botVersion}*
> 💾  RAM        ::  ${memBar}
> 🔒  LICENCE    ::  ${expiryLine}
> ══════════════════════════════
> 🔎 SELECT_MODULE  ::  _reply 1–${numCats}_
> ══════════════════════════════
${catLines}
> ══════════════════════════════
> 💻 _${botFooter}_`
            );
        },
    },

};

const THEME_KEYS = Object.keys(THEMES);

// ─── shared send helper ───────────────────────────────────────────────────────

const MENU_IMAGE_URL = "https://res.cloudinary.com/dqxlb29uz/image/upload/v1780267810/bwm_uploads/media-1780267810008.jpg";

async function sendMenuMsg(Guru, from, text, conText) {
    const { mek, botName, newsletterJid, sender } = conText;
    // Use custom menu pic if owner set one via .setmenupic, otherwise use hardcoded default
    const customPic = await getSetting("MENU_PIC_CUSTOM");
    const picUrl = customPic || MENU_IMAGE_URL;
    try {
        await Guru.sendMessage(from, {
            image: { url: picUrl },
            caption: text.trim(),
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid || "120363406649804510@newsletter",
                    newsletterName: botName || "ULTRA GURU",
                    serverMessageId: 0,
                },
            },
        }, { quoted: mek });
    } catch {
        await Guru.sendMessage(from, { text: text.trim() }, { quoted: mek });
    }
}

// ─── 1. SETMENU ───────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setmenu",
        aliases: ["menutheme", "menudesign", "themenu"],
        react: "🎨",
        category: "owner",
        description: "Change the bot menu design. Usage: .setmenu [1-11] or .setmenu to list",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, args, botFooter } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const current = (await getSetting("MENU_THEME")) || "ultra";

        if (!args[0]) {
            const list = THEME_KEYS.map((key, i) => {
                const t   = THEMES[key];
                const cur = key === current ? " ✅ *[ACTIVE]*" : "";
                return `*${i + 1}.* ${t.name}${cur}\n   _${t.description}_`;
            }).join("\n\n");

            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎨  *MENU THEMES*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  *${THEME_KEYS.length}* themes available
┃  Current: *${THEMES[current]?.name || current}*
┃
┃  *.setmenu <number>* — switch
┃  *.previewmenu <n>*  — preview
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${list}

> _${botFooter}_`
            );
        }

        const n = parseInt(args[0], 10);
        if (isNaN(n) || n < 1 || n > THEME_KEYS.length) {
            await react("❌");
            return reply(`❌ Enter a number between 1 and ${THEME_KEYS.length}.\nSend *.setmenu* to see all themes.`);
        }

        const key = THEME_KEYS[n - 1];
        await setSetting("MENU_THEME", key);
        await react("⏳");

        const data = await buildMenuData(conText);
        const text = `✅ *Theme switched to ${THEMES[key].name}!*\n\nHere's a preview:\n\n${THEMES[key].render(data)}`;
        await sendMenuMsg(Guru, from, text, conText);
        await react("✅");
    }
);

// ─── 2. PREVIEWMENU ───────────────────────────────────────────────────────────

gmd(
    {
        pattern: "previewmenu",
        aliases: ["menupreview", "prevmenu"],
        react: "👁️",
        category: "owner",
        description: "Preview a menu theme without switching. Usage: .previewmenu <1-11>",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, args } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const n = parseInt(args[0], 10);
        if (isNaN(n) || n < 1 || n > THEME_KEYS.length) {
            await react("❌");
            return reply(`❌ Usage: .previewmenu <1-${THEME_KEYS.length}>\nSend *.setmenu* to see the list.`);
        }

        const key  = THEME_KEYS[n - 1];
        const data = await buildMenuData(conText);
        const text = `👁️ *Preview — ${THEMES[key].name}*\n_(Not applied. Send .setmenu ${n} to apply.)_\n\n${THEMES[key].render(data)}`;
        await sendMenuMsg(Guru, from, text, conText);
        await react("✅");
    }
);

// ─── 3. SETBOTPIC ─────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setbotpic",
        aliases: ["botpic", "changebotpic", "botimage"],
        react: "🖼️",
        category: "owner",
        description: "Change the bot WhatsApp profile picture. Quote an image or send a URL.",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, quoted, quotedMsg, q } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const quotedImg = quotedMsg?.imageMessage
            || quoted?.imageMessage
            || quoted?.message?.imageMessage
            || null;

        const hasUrl = q && q.trim().startsWith("http");

        if (!quotedImg && !hasUrl) {
            await react("❌");
            return reply(
                "❌ Please quote an image *or* provide a URL!\n\n" +
                "Examples:\n" +
                "• Quote an image → send *.setbotpic*\n" +
                "• *.setbotpic https://example.com/photo.jpg*"
            );
        }

        await react("⏳");
        let tempPath = null;

        try {
            const { Jimp } = require("jimp"); // lazy-loaded: only when a bot pic is actually set
            let imageBuffer;

            if (quotedImg) {
                tempPath = await Guru.downloadAndSaveMediaMessage(quotedImg, "temp_botpic");
                const img = await Jimp.read(tempPath);
                img.scaleToFit({ w: 720, h: 720 });
                imageBuffer = await img.getBuffer("image/jpeg");
            } else {
                const img = await Jimp.read(q.trim());
                img.scaleToFit({ w: 720, h: 720 });
                imageBuffer = await img.getBuffer("image/jpeg");
            }

            await Guru.query({
                tag: "iq",
                attrs: { to: S_WHATSAPP_NET, type: "set", xmlns: "w:profile:picture" },
                content: [{ tag: "picture", attrs: { type: "image" }, content: imageBuffer }],
            });

            if (hasUrl) await setSetting("BOT_PIC", q.trim());

            await react("✅");
            await reply("✅ Bot profile picture updated!\nThe menu image has also been updated.");
        } catch (error) {
            await react("❌");
            await reply(`❌ Failed to update picture: ${error.message}`);
        } finally {
            if (tempPath) await fs.unlink(tempPath).catch(() => {});
        }
    }
);

// ─── 4. SETMENUPIC ────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setmenupic",
        aliases: ["menupic", "menuimage", "setmenuimg"],
        react: "🖼️",
        category: "owner",
        description: "Set the image shown in .menu. Usage: .setmenupic <URL> or quote an image.",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, quoted, quotedMsg, q } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const quotedImg = quotedMsg?.imageMessage
            || quoted?.imageMessage
            || quoted?.message?.imageMessage
            || null;

        const hasUrl = q && q.trim().startsWith("http");

        if (!quotedImg && !hasUrl) {
            await react("❌");
            return reply(
                "❌ Please quote an image *or* provide a URL!\n\n" +
                "Examples:\n" +
                "• Quote an image → send *.setmenupic*\n" +
                "• *.setmenupic https://example.com/banner.jpg*"
            );
        }

        await react("⏳");
        let tempPath = null;

        try {
            let finalUrl;

            if (hasUrl) {
                finalUrl = q.trim();
            } else {
                const { uploadToCatbox } = require("../guru");
                tempPath = await Guru.downloadAndSaveMediaMessage(quotedImg, "temp_menupic");
                finalUrl = await uploadToCatbox(tempPath);
                if (!finalUrl) throw new Error("Upload to catbox failed — try a URL instead.");
            }

            await setSetting("MENU_PIC_CUSTOM", finalUrl);
            await react("✅");
            await reply(`✅ Menu image updated!\n\nURL: ${finalUrl}\n\nSend *.menu* to see the result.`);
        } catch (error) {
            await react("❌");
            await reply(`❌ Failed: ${error.message}`);
        } finally {
            if (tempPath) await fs.unlink(tempPath).catch(() => {});
        }
    }
);

// ─── 5. SETFOOTER ─────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setfooter",
        aliases: ["footer", "botfooter", "changefooter"],
        react: "✏️",
        category: "owner",
        description: "Change the bot footer shown in menus. Usage: .setfooter <text>",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, q } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        if (!q || !q.trim()) {
            await react("❌");
            const cur = (await getSetting("FOOTER")) || "Not set";
            return reply(`❌ Provide footer text!\n\nCurrent: _${cur}_\n\nExample: *.setfooter Powered by ULTRA-GURU 🔥*`);
        }

        await setSetting("FOOTER", q.trim());
        await react("✅");
        return reply(`✅ Footer updated to:\n\n_${q.trim()}_`);
    }
);

// ─── 6. SETCAPTION ────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setcaption",
        aliases: ["caption", "botcaption", "changecaption"],
        react: "✏️",
        category: "owner",
        description: "Change the bot caption/tagline. Usage: .setcaption <text>",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, q } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        if (!q || !q.trim()) {
            await react("❌");
            const cur = (await getSetting("CAPTION")) || "Not set";
            return reply(`❌ Provide a caption!\n\nCurrent: _${cur}_\n\nExample: *.setcaption ⚡ ULTRA GURU | Ultra Fast*`);
        }

        await setSetting("CAPTION", q.trim());
        await react("✅");
        return reply(`✅ Caption updated to:\n\n_${q.trim()}_`);
    }
);

// ─── 7. SETBOTNAME ────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setbotname",
        aliases: ["botname", "namebot", "changename", "renamebot"],
        react: "✏️",
        category: "owner",
        description: "Change the bot display name in menus. Usage: .setbotname <name>",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, q } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        if (!q || !q.trim()) {
            await react("❌");
            const cur = (await getSetting("BOT_NAME")) || "ULTRA GURU";
            return reply(`❌ Provide a name!\n\nCurrent: *${cur}*\n\nExample: *.setbotname MY GURU BOT*`);
        }

        await setSetting("BOT_NAME", q.trim());

        try { await Guru.updateProfileName(q.trim()); } catch {}

        await react("✅");
        return reply(`✅ Bot name set to: *${q.trim()}*\n_(WhatsApp profile name also updated)_`);
    }
);

// ─── 8. SETEXPIRY ─────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "setexpiry",
        aliases: ["expiry", "setlicence", "licence", "licensedate"],
        react: "🔒",
        category: "owner",
        description: "Set the bot licence expiry date. Usage: .setexpiry YYYY-MM-DD",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, args } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const { expiryLine, parseExpiryDate } = require("../guru/expiry");

        if (!args[0]) {
            await react("ℹ️");
            const current = await expiryLine();
            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔒  *LICENCE EXPIRY*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Current: ${current}
┃
┃  *Usage:* .setexpiry YYYY-MM-DD
┃  *Example:* .setexpiry 2026-12-31
┃
┃  Set EXPIRY_DATE in Heroku
┃  config vars for persistence.
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            );
        }

        const raw = args[0].trim();
        const parsed = parseExpiryDate(raw);
        if (!parsed) {
            await react("❌");
            return reply(`❌ Invalid date format!\n\nAccepted: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY\n\nExample: *.setexpiry 2026-12-31*`);
        }

        await setSetting("BOT_EXPIRY_DATE", raw);
        const status = await expiryLine();
        await react("✅");
        return reply(`✅ *Expiry date set!*\n\n🔒 ${status}\n\n_Note: Set EXPIRY_DATE in Heroku config vars for persistence across restarts._`);
    }
);

// ─── 9. DESIGNINFO ────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "designinfo",
        aliases: ["mydesign", "designstatus", "currentdesign"],
        react: "🎨",
        category: "owner",
        description: "Show current bot design settings.",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const [theme, pic, footer, caption, name] = await Promise.all([
            getSetting("MENU_THEME"),
            getSetting("BOT_PIC"),
            getSetting("FOOTER"),
            getSetting("CAPTION"),
            getSetting("BOT_NAME"),
        ]);

        const { expiryLine } = require("../guru/expiry");
        const expStatus = await expiryLine();

        const themeKey  = theme || "ultra";
        const themeName = THEMES[themeKey]?.name || themeKey;
        const themeNum  = THEME_KEYS.indexOf(themeKey) + 1;
        const picShort  = (pic || "Not set").length > 45
            ? (pic || "").slice(0, 42) + "..."
            : (pic || "Not set");

        await react("✅");
        return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎨  *BOT DESIGN SETTINGS*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Menu Theme : ${themeName} (${themeNum}/${THEME_KEYS.length})
┃  Bot Name   : ${name || "ULTRA GURU"}
┃  Footer     : _${footer || "Not set"}_
┃  Caption    : _${caption || "Not set"}_
┃  Menu Pic   : ${picShort}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  🔒 ${expStatus}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

*Commands:*
◈ *.setmenu* — browse & switch themes
◈ *.previewmenu <n>* — preview a theme
◈ *.setbotname <text>* — change bot name
◈ *.setbotpic* — change profile + menu image
◈ *.setmenupic* — change menu image only
◈ *.setfooter <text>* — change footer
◈ *.setcaption <text>* — change caption
◈ *.setexpiry YYYY-MM-DD* — set expiry date
◈ *.resetdesign* — reset all to defaults`
        );
    }
);

// ─── 10. RESETDESIGN ──────────────────────────────────────────────────────────

const _resetConfirm = new Map();

gmd(
    {
        pattern: "resetdesign",
        aliases: ["designreset", "resettheme"],
        react: "🔄",
        category: "owner",
        description: "Reset all bot design settings to defaults. Run twice to confirm.",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser } = conText;

        if (!isSuperUser) { await react("❌"); return reply("❌ Owner Only Command!"); }

        const now     = Date.now();
        const pending = _resetConfirm.get(from);

        if (!pending || now - pending > 25_000) {
            _resetConfirm.set(from, now);
            await react("⚠️");
            return reply(
                "⚠️ *Reset Confirmation*\n\n" +
                "This will reset:\n◈ Menu theme → ultra\n◈ Bot name → default\n◈ Footer, caption, pic → defaults\n\n" +
                "Send *.resetdesign* again within *25 seconds* to confirm."
            );
        }

        _resetConfirm.delete(from);

        await Promise.all([
            resetSetting("MENU_THEME"),
            resetSetting("BOT_PIC"),
            resetSetting("FOOTER"),
            resetSetting("CAPTION"),
            resetSetting("BOT_NAME"),
        ]);

        await react("✅");
        return reply("✅ All design settings reset to defaults!\n\nSend *.menu* to see the result.");
    }
);

// ─── exported for general.js ──────────────────────────────────────────────────

async function buildThemedMenu(conText, Guru) {
    const themeKey = (await getSetting("MENU_THEME")) || "ultra";
    const theme    = THEMES[themeKey] || THEMES.ultra;
    const data     = await buildMenuData(conText);
    return theme.render(data);
}

module.exports = { buildThemedMenu, THEMES, THEME_KEYS, buildMenuData, sendMenuMsg, getSortedCategories, CAT_ICONS };
