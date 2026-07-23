const { gmd } = require("../guru");
const Database = require("better-sqlite3");
const path     = require("path");
const fs       = require("fs-extra");

// ═══════════════════════════════════════════════════════════════════
//  SMART REMINDER ENGINE  ·  ULTRA GURU MD
//  Natural-language time parsing, per-user reminders,
//  background delivery, snooze, and full management commands.
//  Supports: "in 30m", "in 2h", "in 1d", "at 15:30", "tomorrow 9am"
// ═══════════════════════════════════════════════════════════════════

const DB_DIR = path.join(__dirname, "../guru/database");
fs.ensureDirSync(DB_DIR);

const db = new Database(path.join(DB_DIR, "reminders.db"));
db.pragma("journal_mode = WAL");
db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        requester    TEXT    NOT NULL,
        target_jid   TEXT    NOT NULL,
        chat_jid     TEXT    NOT NULL,
        message      TEXT    NOT NULL,
        remind_at    INTEGER NOT NULL,
        snoozed_from INTEGER,
        is_done      INTEGER NOT NULL DEFAULT 0,
        created_at   INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rem_due ON reminders (is_done, remind_at);
`);

const $insert  = db.prepare(
    `INSERT INTO reminders (requester,target_jid,chat_jid,message,remind_at,created_at)
     VALUES (?,?,?,?,?,?)`
);
const $getDue  = db.prepare(
    `SELECT * FROM reminders WHERE is_done = 0 AND remind_at <= ? LIMIT 30`
);
const $markDone= db.prepare(`UPDATE reminders SET is_done = 1 WHERE id = ?`);
const $snooze  = db.prepare(
    `UPDATE reminders SET remind_at = ?, snoozed_from = ?, is_done = 0 WHERE id = ?`
);
const $getOne  = db.prepare(`SELECT * FROM reminders WHERE id = ?`);
const $cancel  = db.prepare(`UPDATE reminders SET is_done = 1 WHERE id = ? AND requester = ?`);
const $myList  = db.prepare(
    `SELECT * FROM reminders WHERE requester = ? AND is_done = 0 ORDER BY remind_at ASC LIMIT 15`
);
const $allPending = db.prepare(`SELECT COUNT(*) as c FROM reminders WHERE is_done = 0`);

// ── Natural-language time parser ──────────────────────────────────
// Returns { remind_at: ms timestamp, message: string } or null
const parseRemind = (q) => {
    if (!q) return null;
    const now = Date.now();
    const s   = q.trim();

    // --- "in Xm / Xh / Xd" -----------------------------------------
    const inMatch = s.match(/^in\s+(\d+)\s*(m(?:in(?:ute)?s?)?|h(?:(?:ou)?rs?)?|d(?:ays?)?|s(?:ec(?:ond)?s?)?)\s+(.+)$/i);
    if (inMatch) {
        const [, num, unit, msg] = inMatch;
        const n = parseInt(num, 10);
        const multipliers = {
            s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000,
        };
        const key = unit[0].toLowerCase();
        const ms  = multipliers[key] ?? 60_000;
        return { remind_at: now + n * ms, message: msg.trim() };
    }

    // --- "at HH:MM [message]" (today or tomorrow if past) -----------
    const atMatch = s.match(/^at\s+(\d{1,2})[:.](\d{2})(?:\s*([ap]m?))?\s+(.+)$/i);
    if (atMatch) {
        let [, hh, mm, ampm, msg] = atMatch;
        let hours = parseInt(hh, 10);
        const mins = parseInt(mm, 10);
        if (ampm) {
            if (/pm?/i.test(ampm) && hours < 12) hours += 12;
            if (/am?/i.test(ampm) && hours === 12) hours = 0;
        }
        const target = new Date();
        target.setHours(hours, mins, 0, 0);
        if (target.getTime() <= now) target.setDate(target.getDate() + 1); // push to tomorrow
        return { remind_at: target.getTime(), message: msg.trim() };
    }

    // --- "tomorrow [HH:MM] message" ---------------------------------
    const tomMatch = s.match(/^tomorrow(?:\s+at?\s+(\d{1,2})[:.]?(\d{2})?(?:\s*([ap]m?))?)?(?:\s+(.+))?$/i);
    if (tomMatch && tomMatch[4]) {
        let [, hh, mm, ampm, msg] = tomMatch;
        let hours = hh ? parseInt(hh, 10) : 9;
        const mins = mm ? parseInt(mm, 10) : 0;
        if (ampm) {
            if (/pm?/i.test(ampm) && hours < 12) hours += 12;
            if (/am?/i.test(ampm) && hours === 12) hours = 0;
        }
        const target = new Date();
        target.setDate(target.getDate() + 1);
        target.setHours(hours, mins, 0, 0);
        return { remind_at: target.getTime(), message: msg.trim() };
    }

    // --- "Xm message" shorthand (e.g. "30m call John") -------------
    const shortMatch = s.match(/^(\d+)\s*(m(?:in)?|h(?:r)?|d)\s+(.+)$/i);
    if (shortMatch) {
        const [, num, unit, msg] = shortMatch;
        const n = parseInt(num, 10);
        const mult = { m: 60_000, h: 3_600_000, d: 86_400_000 };
        const ms   = mult[unit[0].toLowerCase()] ?? 60_000;
        return { remind_at: now + n * ms, message: msg.trim() };
    }

    return null;
};

// ── Human-readable duration ───────────────────────────────────────
const humanDur = (ms) => {
    const secs  = Math.floor(ms / 1_000);
    const mins  = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days  > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    if (mins  > 0) return `${mins}m`;
    return `${secs}s`;
};

const fmtDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ── Background reminder delivery (every 30 seconds) ───────────────
const deliverReminders = async () => {
    const due = $getDue.all(Date.now());
    if (!due.length) return;

    const sock = global._botSocket;
    if (!sock) return;

    for (const rem of due) {
        $markDone.run(rem.id);
        try {
            const from  = rem.target_jid;
            const isGroup = rem.chat_jid.endsWith("@g.us");
            const ping    = isGroup ? `@${from.split("@")[0].split(":")[0]}` : "";

            await sock.sendMessage(rem.chat_jid, {
                text:
                    `*⏰ REMINDER*\n${"═".repeat(28)}\n\n` +
                    `${ping} ${rem.message}\n\n` +
                    `${"─".repeat(28)}\n` +
                    `🆔 ID #${rem.id} · Reply \`.snooze ${rem.id} 15m\` to snooze`,
                ...(isGroup ? { mentions: [from] } : {}),
            });
        } catch (err) {
            console.error(`[Reminders] delivery failed for #${rem.id}:`, err.message);
        }
    }
};

// Guard against duplicate intervals on hot-reload
if (global.__reminderInterval) clearInterval(global.__reminderInterval);
global.__reminderInterval = setInterval(deliverReminders, 30_000);

// Run once immediately on load so reminders survive a bot restart
setTimeout(deliverReminders, 3_000);

// ── COMMAND: .remind ──────────────────────────────────────────────
gmd({
    pattern:     "remind",
    aliases:     ["remindme", "reminder", "setalarm"],
    react:       "⏰",
    category:    "tools",
    description: "Set a smart reminder with natural language time",
    usage:       ".remind in 30m <message> | at 15:30 <message> | tomorrow <message>",
}, async (from, Guru, conText) => {
    const { q, reply, react, sender, pushName } = conText;

    if (!q) {
        await react("❓");
        return reply(
            `*⏰ Smart Reminder Engine*\n${"═".repeat(30)}\n\n` +
            `*Formats:*\n` +
            `\`.remind in 30m Call John\`\n` +
            `\`.remind in 2h Submit the report\`\n` +
            `\`.remind in 1d Team meeting\`\n` +
            `\`.remind at 14:30 Lunch with boss\`\n` +
            `\`.remind at 9am Wake up!\`\n` +
            `\`.remind tomorrow 8am Morning workout\`\n` +
            `\`.remind 10m Quick reminder text\`\n\n` +
            `*Manage:* \`.reminders\` · \`.cancelreminder <id>\` · \`.snooze <id> <time>\``
        );
    }

    const parsed = parseRemind(q);
    if (!parsed) {
        await react("❌");
        return reply(
            `❌ Couldn't parse that time.\n\n` +
            `*Try:*\n` +
            `• \`.remind in 30m <message>\`\n` +
            `• \`.remind at 14:30 <message>\`\n` +
            `• \`.remind tomorrow <message>\``
        );
    }

    const { remind_at, message } = parsed;
    const now = Date.now();
    if (remind_at <= now + 5_000) {
        await react("❌");
        return reply("❌ Reminder time must be in the future!");
    }
    if (remind_at > now + 30 * 86_400_000) {
        await react("❌");
        return reply("❌ Maximum reminder time is *30 days*.");
    }

    const result = $insert.run(sender, sender, from, message, remind_at, now);
    const id     = result.lastInsertRowid;
    const inMs   = remind_at - now;

    await react("✅");
    reply(
        `*⏰ Reminder Set!*\n${"═".repeat(28)}\n\n` +
        `🆔 *ID:*      #${id}\n` +
        `📝 *Message:* ${message}\n` +
        `⏱️ *In:*      ${humanDur(inMs)}\n` +
        `📅 *At:*      ${fmtDate(remind_at)}\n\n` +
        `> _I'll ping you when it's time!_\n` +
        `> _Cancel with \`.cancelreminder ${id}\`_`
    );
});

// ── COMMAND: .reminders ───────────────────────────────────────────
gmd({
    pattern:     "reminders",
    aliases:     ["myreminders", "alarms", "remlist"],
    react:       "📋",
    category:    "tools",
    description: "List all your pending reminders",
    usage:       ".reminders",
}, async (from, Guru, conText) => {
    const { reply, react, sender } = conText;

    const rows = $myList.all(sender);
    if (rows.length === 0) {
        await react("📭");
        return reply("📭 You have no pending reminders.\n\nSet one with `.remind in 30m <message>`!");
    }

    const now   = Date.now();
    const lines = rows.map(r => {
        const left = r.remind_at - now;
        const when = left > 0 ? `in ${humanDur(left)}` : "⚠️ overdue";
        return `⏰ *#${r.id}* — _${r.message}_\n   📅 ${fmtDate(r.remind_at)} _(${when})_`;
    }).join("\n\n");

    await react("✅");
    reply(
        `*📋 Your Reminders (${rows.length})*\n${"═".repeat(32)}\n\n` +
        `${lines}\n\n` +
        `${"─".repeat(32)}\n` +
        `_Cancel: \`.cancelreminder <id>\` · Snooze: \`.snooze <id> <time>\`_`
    );
});

// ── COMMAND: .cancelreminder ──────────────────────────────────────
gmd({
    pattern:     "cancelreminder",
    aliases:     ["cancelrem", "cancelalarm", "delreminder"],
    react:       "🗑️",
    category:    "tools",
    description: "Cancel a pending reminder by ID",
    usage:       ".cancelreminder <id>",
}, async (from, Guru, conText) => {
    const { q, reply, react, sender } = conText;

    const id = parseInt(q?.trim(), 10);
    if (!id || isNaN(id)) {
        await react("❓");
        return reply("❓ Usage: `.cancelreminder <id>`\n\nGet IDs from `.reminders`");
    }

    const row = $getOne.get(id);
    if (!row || row.requester !== sender || row.is_done) {
        await react("❌");
        return reply(`❌ Reminder #${id} not found or already done.`);
    }

    $cancel.run(id, sender);
    await react("✅");
    reply(`*🗑️ Reminder Cancelled*\n\n#${id} — _${row.message}_`);
});

// ── COMMAND: .snooze ─────────────────────────────────────────────
gmd({
    pattern:     "snooze",
    aliases:     ["snz"],
    react:       "😴",
    category:    "tools",
    description: "Snooze a reminder for an extra time period",
    usage:       ".snooze <id> <time>  (e.g. .snooze 3 15m)",
}, async (from, Guru, conText) => {
    const { q, reply, react, sender } = conText;

    if (!q) {
        await react("❓");
        return reply("❓ Usage: `.snooze <id> <time>`\n\nExample: `.snooze 3 15m`");
    }

    const parts = q.trim().split(/\s+/);
    const id    = parseInt(parts[0], 10);
    const rest  = parts.slice(1).join(" ");

    if (!id || !rest) {
        await react("❓");
        return reply("❓ Usage: `.snooze <id> <time>`\nExample: `.snooze 3 15m`");
    }

    const parsed = parseRemind(`in ${rest} placeholder`);
    if (!parsed) {
        await react("❌");
        return reply("❌ Invalid time. Try: `15m`, `1h`, `30m`");
    }

    const row = $getOne.get(id);
    if (!row || row.requester !== sender) {
        await react("❌");
        return reply(`❌ Reminder #${id} not found.`);
    }

    const delay     = parsed.remind_at - Date.now();
    const newTime   = Date.now() + delay;
    $snooze.run(newTime, Date.now(), id);

    await react("✅");
    reply(
        `*😴 Snoozed!*\n\n` +
        `#${id} — _${row.message}_\n` +
        `📅 New time: *${fmtDate(newTime)}*`
    );
});
