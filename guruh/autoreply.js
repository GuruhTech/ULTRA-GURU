const { gmd } = require("../guru");
const Database = require("better-sqlite3");
const path     = require("path");
const fs       = require("fs-extra");

// ═══════════════════════════════════════════════════════════════════
//  SMART AUTO-REPLY ENGINE  ·  ULTRA GURU MD
//  SQLite-backed keyword auto-response system
//  Trigger types : exact | contains | starts | regex
//  Scopes        : global (all chats) | group (one group only)
//  Templates     : {name} {sender} {group} {time} {date} {bot}
// ═══════════════════════════════════════════════════════════════════

// ── Database ────────────────────────────────────────────────────────
const DB_DIR = path.join(__dirname, "../guru/database");
fs.ensureDirSync(DB_DIR);

const db = new Database(path.join(DB_DIR, "autoreply.db"));

db.pragma("journal_mode = WAL");
db.pragma("synchronous  = NORMAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS replies (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        scope         TEXT    NOT NULL DEFAULT 'global',
        group_jid     TEXT,
        trigger_type  TEXT    NOT NULL,
        trigger       TEXT    NOT NULL,
        response      TEXT    NOT NULL,
        is_active     INTEGER NOT NULL DEFAULT 1,
        cooldown_s    INTEGER NOT NULL DEFAULT 30,
        use_count     INTEGER NOT NULL DEFAULT 0,
        created_by    TEXT,
        created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reply_cooldowns (
        chat_jid   TEXT    NOT NULL,
        reply_id   INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (chat_jid, reply_id)
    );

    CREATE INDEX IF NOT EXISTS idx_replies_scope
        ON replies (is_active, scope, group_jid);
`);

// ── Prepared statements ─────────────────────────────────────────────
const $insert = db.prepare(
    `INSERT INTO replies
        (scope, group_jid, trigger_type, trigger, response, cooldown_s, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
const $getActive   = db.prepare(
    `SELECT * FROM replies
     WHERE  is_active = 1
       AND  (scope = 'global' OR group_jid = ?)
     ORDER  BY id`
);
const $getOne      = db.prepare(`SELECT * FROM replies WHERE id = ?`);
const $list        = db.prepare(
    `SELECT * FROM replies
     WHERE  (scope = 'global' OR group_jid = ?)
     ORDER  BY id
     LIMIT  ? OFFSET ?`
);
const $listCount   = db.prepare(
    `SELECT COUNT(*) as count FROM replies
     WHERE  (scope = 'global' OR group_jid = ?)`
);
const $toggle      = db.prepare(
    `UPDATE replies
     SET    is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
     WHERE  id = ?`
);
const $delete      = db.prepare(`DELETE FROM replies WHERE id = ?`);
const $incUse      = db.prepare(`UPDATE replies SET use_count = use_count + 1 WHERE id = ?`);
const $stats       = db.prepare(
    `SELECT COUNT(*) as total,
            SUM(use_count) as hits,
            SUM(is_active) as active
     FROM   replies`
);
const $topUsed     = db.prepare(
    `SELECT id, trigger, use_count, trigger_type
     FROM   replies
     ORDER  BY use_count DESC
     LIMIT  5`
);
const $getCooldown = db.prepare(
    `SELECT expires_at FROM reply_cooldowns
     WHERE  chat_jid = ? AND reply_id = ?`
);
const $setCooldown = db.prepare(
    `INSERT OR REPLACE INTO reply_cooldowns (chat_jid, reply_id, expires_at)
     VALUES (?, ?, ?)`
);
const $cleanCd     = db.prepare(
    `DELETE FROM reply_cooldowns WHERE expires_at < ?`
);

// Expire stale cooldowns every 5 min so the table stays lean
setInterval(() => { try { $cleanCd.run(Date.now()); } catch (_) {} }, 300_000);

// ── Matching engine ─────────────────────────────────────────────────
const matchTrigger = (type, trigger, body) => {
    const b = body.trim();
    switch (type) {
        case "exact":
            return b.toLowerCase() === trigger.toLowerCase();
        case "contains":
            return b.toLowerCase().includes(trigger.toLowerCase());
        case "starts":
            return b.toLowerCase().startsWith(trigger.toLowerCase());
        case "regex": {
            try {
                const m  = trigger.match(/^\/(.+)\/([gimsuy]*)$/);
                const re = m ? new RegExp(m[1], m[2]) : new RegExp(trigger, "i");
                return re.test(b);
            } catch { return false; }
        }
        default: return false;
    }
};

// ── Template renderer ───────────────────────────────────────────────
const renderTemplate = (response, vars = {}) =>
    response
        .replace(/\{name\}/gi,    vars.name    ?? "Friend")
        .replace(/\{sender\}/gi,  vars.sender  ?? "")
        .replace(/\{group\}/gi,   vars.group   ?? "")
        .replace(/\{time\}/gi,    vars.time    ?? "")
        .replace(/\{date\}/gi,    vars.date    ?? "")
        .replace(/\{bot\}/gi,     vars.bot     ?? "ULTRA GURU MD")
        .replace(/\{trigger\}/gi, vars.trigger ?? "");

// ── Display helpers ─────────────────────────────────────────────────
const TYPE_ICON  = { exact: "🎯", contains: "🔍", starts: "🔛", regex: "⚡" };
const SCOPE_ICON = { global: "🌐", group: "📍" };
const MEDALS     = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

const trim20 = (s) => (s.length > 20 ? s.slice(0, 19) + "…" : s);
const trim60 = (s) => (s.length > 60 ? s.slice(0, 59) + "…" : s);

// ── Passive message hook ────────────────────────────────────────────
// Registered into index.js's global.__pluginMsgHooks array.
// Fires on EVERY incoming message — silently matches and replies.
if (!global.__pluginMsgHooks) global.__pluginMsgHooks = [];

global.__pluginMsgHooks.push(async (ms, Guru, settings) => {
    try {
        // Extract the body text from any message type
        const body =
            ms.message?.conversation                     ||
            ms.message?.extendedTextMessage?.text        ||
            ms.message?.imageMessage?.caption            ||
            ms.message?.videoMessage?.caption            ||
            "";

        if (!body?.trim()) return;

        // Don't intercept bot commands
        const prefix = settings?.PREFIX || ".";
        if (body.trim().startsWith(prefix)) return;

        const from = ms.key.remoteJid;
        if (!from) return;

        const now        = Date.now();
        const candidates = $getActive.all(from);

        for (const reply of candidates) {
            if (!matchTrigger(reply.trigger_type, reply.trigger, body)) continue;

            // Respect per-chat cooldown to prevent spam
            const cd = $getCooldown.get(from, reply.id);
            if (cd && cd.expires_at > now) continue;

            // Stamp cooldown BEFORE sending (prevents race if two messages arrive fast)
            $setCooldown.run(from, reply.id, now + reply.cooldown_s * 1_000);
            $incUse.run(reply.id);

            const senderJid = ms.key.participant || ms.key.remoteJid || "";
            const senderNum = senderJid.split("@")[0].split(":")[0];
            const nowDate   = new Date();

            const text = renderTemplate(reply.response, {
                name:    ms.pushName || `+${senderNum}`,
                sender:  `@${senderNum}`,
                group:   from.endsWith("@g.us") ? "the group" : "DM",
                time:    nowDate.toLocaleTimeString(),
                date:    nowDate.toLocaleDateString(),
                bot:     settings?.BOT_NAME || "ULTRA GURU MD",
                trigger: reply.trigger,
            });

            await Guru.sendMessage(from, { text }, { quoted: ms });
            break; // fire only the FIRST match per message
        }
    } catch (err) {
        console.error("[AutoReply] passive hook error:", err.message);
    }
});

// ── Arg parser for .addreply ────────────────────────────────────────
// Accepted formats:
//   .addreply <type> | <trigger> | <response>
//   .addreply group <type> | <trigger> | <response>
const parseAddArgs = (q, fromJid, isGroup) => {
    const parts = q.split("|").map((s) => s.trim());
    if (parts.length < 3) return null;

    const head   = parts[0].trim().split(/\s+/);
    let   scope  = "global";
    let   type;

    if (head[0]?.toLowerCase() === "group") {
        scope = "group";
        type  = head[1]?.toLowerCase();
    } else {
        type = head[0]?.toLowerCase();
    }

    if (!["exact", "contains", "starts", "regex"].includes(type)) return null;

    const trigger  = parts[1];
    const response = parts.slice(2).join("|"); // allow | inside responses
    if (!trigger || !response) return null;

    const group_jid = scope === "group" && isGroup ? fromJid : null;
    if (scope === "group" && !isGroup) scope = "global"; // fallback if used in DM

    return { scope, type, trigger, response, group_jid };
};

// ── COMMAND: .addreply ──────────────────────────────────────────────
gmd({
    pattern:     "addreply",
    aliases:     ["newauto", "setreply"],
    react:       "⚡",
    category:    "tools",
    description: "Add a smart auto-reply trigger",
    usage:       ".addreply <exact|contains|starts|regex> | <trigger> | <response>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser, sender, groupName, isGroup } = conText;

    if (!isSuperUser) { await react("❌"); return reply("❌ Owner/Sudo only."); }

    if (!q) {
        await react("❓");
        return reply(
            `*⚡ Smart Auto-Reply Engine*\n` +
            `${"═".repeat(30)}\n\n` +
            `*Format:*\n` +
            `\`.addreply <type> | <trigger> | <response>\`\n\n` +
            `*Trigger Types:*\n` +
            `🎯 *exact*    — full message must match\n` +
            `🔍 *contains* — body contains keyword\n` +
            `🔛 *starts*   — body starts with keyword\n` +
            `⚡ *regex*    — full JS regex pattern\n\n` +
            `*Group-only reply:*\n` +
            `\`.addreply group <type> | <trigger> | <response>\`\n\n` +
            `*Template variables:*\n` +
            `\`{name}\` \`{sender}\` \`{group}\` \`{time}\` \`{date}\` \`{bot}\` \`{trigger}\`\n\n` +
            `*Examples:*\n` +
            `\`.addreply contains | price | Prices start at $10!\`\n` +
            `\`.addreply exact | !hours | We're open 9am–5pm Mon-Fri\`\n` +
            `\`.addreply regex | /\\bhello\\b/i | Hey {name}! 👋\``
        );
    }

    const parsed = parseAddArgs(q, from, isGroup);
    if (!parsed) {
        await react("❌");
        return reply(
            `❌ *Invalid format.*\n\n` +
            `Use: \`.addreply <type> | <trigger> | <response>\`\n` +
            `Types: exact · contains · starts · regex`
        );
    }

    const { scope, type, trigger, response, group_jid } = parsed;

    try {
        const result = $insert.run(scope, group_jid, type, trigger, response, 30, sender, Date.now());

        await react("✅");
        reply(
            `*✅ Auto-Reply Created!*\n` +
            `${"─".repeat(30)}\n` +
            `🆔 *ID:*       \`#${result.lastInsertRowid}\`\n` +
            `${TYPE_ICON[type]} *Type:*     ${type}\n` +
            `🔑 *Trigger:*  \`${trigger}\`\n` +
            `💬 *Response:* ${trim60(response)}\n` +
            `${SCOPE_ICON[scope]} *Scope:*    ${scope === "group" ? `Group (${groupName || "this group"})` : "Global (all chats)"}\n` +
            `⏱️ *Cooldown:* 30 seconds\n\n` +
            `> _This reply is now live — fires automatically on every matching message._`
        );
    } catch (err) {
        await react("❌");
        reply(`❌ Database error: ${err.message}`);
    }
});

// ── COMMAND: .replies ───────────────────────────────────────────────
gmd({
    pattern:     "replies",
    aliases:     ["listreplies", "autoreplies", "replylist"],
    react:       "📋",
    category:    "tools",
    description: "List all auto-reply triggers (paginated)",
    usage:       ".replies [page]",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;

    if (!isSuperUser) { await react("❌"); return reply("❌ Owner/Sudo only."); }

    const PAGE   = 8;
    const page   = Math.max(1, parseInt(q) || 1);
    const offset = (page - 1) * PAGE;
    const total  = $listCount.get(from)?.count || 0;

    if (total === 0) {
        await react("📭");
        return reply("📭 No auto-replies configured yet.\n\nCreate one with `.addreply`");
    }

    const totalPages = Math.ceil(total / PAGE);
    const items      = $list.all(from, PAGE, offset);

    const lines = items.map((r) => {
        const dot   = r.is_active ? "🟢" : "🔴";
        const tIcon = TYPE_ICON[r.trigger_type]  || "•";
        const sIcon = SCOPE_ICON[r.scope]         || "🌐";
        return `${dot} *#${r.id}* ${tIcon}${sIcon} \`${trim20(r.trigger)}\` _(${r.use_count} fires)_`;
    }).join("\n");

    await react("✅");
    reply(
        `*📋 Auto-Reply List · Page ${page}/${totalPages}*\n` +
        `${"═".repeat(32)}\n` +
        `${lines}\n` +
        `${"─".repeat(32)}\n` +
        `🟢 Active  🔴 Off  🎯 Exact  🔍 Contains  🔛 Starts  ⚡ Regex\n` +
        `🌐 Global  📍 Group  ·  Total: *${total}*\n\n` +
        (totalPages > page
            ? `> Next page: \`.replies ${page + 1}\``
            : `> _Showing all ${total} replies_`)
    );
});

// ── COMMAND: .delreply ──────────────────────────────────────────────
gmd({
    pattern:     "delreply",
    aliases:     ["removereply", "deletereply"],
    react:       "🗑️",
    category:    "tools",
    description: "Delete an auto-reply by ID",
    usage:       ".delreply <id>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;

    if (!isSuperUser) { await react("❌"); return reply("❌ Owner/Sudo only."); }

    const id = parseInt(q);
    if (!id || isNaN(id)) {
        await react("❓");
        return reply("❓ Usage: `.delreply <id>`\n\nGet IDs from `.replies`");
    }

    const row = $getOne.get(id);
    if (!row) {
        await react("❌");
        return reply(`❌ No auto-reply found with ID *#${id}*`);
    }

    $delete.run(id);
    await react("✅");
    reply(
        `*🗑️ Auto-Reply Deleted*\n\n` +
        `Removed *#${id}* — \`${row.trigger}\``
    );
});

// ── COMMAND: .togglereply ───────────────────────────────────────────
gmd({
    pattern:     "togglereply",
    aliases:     ["pausereply", "enablereply"],
    react:       "🔄",
    category:    "tools",
    description: "Enable or disable an auto-reply without deleting it",
    usage:       ".togglereply <id>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;

    if (!isSuperUser) { await react("❌"); return reply("❌ Owner/Sudo only."); }

    const id = parseInt(q);
    if (!id || isNaN(id)) {
        await react("❓");
        return reply("❓ Usage: `.togglereply <id>`");
    }

    const row = $getOne.get(id);
    if (!row) {
        await react("❌");
        return reply(`❌ No auto-reply found with ID *#${id}*`);
    }

    $toggle.run(id);
    const updated = $getOne.get(id);
    const status  = updated.is_active ? "🟢 *Enabled*" : "🔴 *Disabled*";

    await react("✅");
    reply(`*🔄 Toggled*\n\n#${id} \`${row.trigger}\` → ${status}`);
});

// ── COMMAND: .testreply ─────────────────────────────────────────────
gmd({
    pattern:     "testreply",
    aliases:     ["checkreply", "simreply"],
    react:       "🧪",
    category:    "tools",
    description: "Test what auto-reply would fire for any message",
    usage:       ".testreply <message text>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;

    if (!isSuperUser) { await react("❌"); return reply("❌ Owner/Sudo only."); }

    if (!q) {
        await react("❓");
        return reply("❓ Usage: `.testreply <text>`\n\nExample: `.testreply hello bot`");
    }

    const candidates = $getActive.all(from);
    const matched    = candidates.find((r) => matchTrigger(r.trigger_type, r.trigger, q));

    if (!matched) {
        await react("🔍");
        return reply(
            `*🧪 Simulation Result*\n\n` +
            `Input: \`${q}\`\n\n` +
            `❌ No auto-reply would fire for this message.\n` +
            `_(${candidates.length} active triggers checked)_`
        );
    }

    const preview = renderTemplate(matched.response, {
        name: "TestUser",   sender: "@0000000000",
        group: "Test Group", time: new Date().toLocaleTimeString(),
        date:  new Date().toLocaleDateString(),
        bot:   "ULTRA GURU MD", trigger: matched.trigger,
    });

    await react("✅");
    reply(
        `*🧪 Simulation Result*\n` +
        `${"═".repeat(30)}\n\n` +
        `📥 *Input:* \`${q}\`\n\n` +
        `✅ *Match Found!*\n` +
        `${"─".repeat(28)}\n` +
        `🆔 ID: *#${matched.id}*\n` +
        `${TYPE_ICON[matched.trigger_type]} Type: *${matched.trigger_type}*\n` +
        `🔑 Trigger: \`${matched.trigger}\`\n` +
        `${SCOPE_ICON[matched.scope]} Scope: *${matched.scope}*\n` +
        `🔥 Fired: *${matched.use_count}* times before\n\n` +
        `*📤 Bot would reply:*\n` +
        `${"─".repeat(28)}\n` +
        `${preview}`
    );
});

// ── COMMAND: .replystats ────────────────────────────────────────────
gmd({
    pattern:     "replystats",
    aliases:     ["autostats", "replyinfo"],
    react:       "📊",
    category:    "tools",
    description: "Show auto-reply usage statistics",
    usage:       ".replystats",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;

    if (!isSuperUser) { await react("❌"); return reply("❌ Owner/Sudo only."); }

    const stats   = $stats.get();
    const topFive = $topUsed.all();

    const topLines = topFive.length === 0
        ? "_No data yet_"
        : topFive.map((r, i) =>
            `${MEDALS[i]} *#${r.id}* ${TYPE_ICON[r.trigger_type]} \`${trim20(r.trigger)}\` — *${r.use_count}* fires`
          ).join("\n");

    await react("✅");
    reply(
        `*📊 Auto-Reply Statistics*\n` +
        `${"═".repeat(32)}\n\n` +
        `📁 Total replies:   *${stats.total  || 0}*\n` +
        `🟢 Active:          *${stats.active || 0}*\n` +
        `🔴 Inactive:        *${(stats.total || 0) - (stats.active || 0)}*\n` +
        `🔥 Total fires:     *${stats.hits   || 0}*\n\n` +
        `*🏆 Top 5 Most Fired*\n` +
        `${"─".repeat(30)}\n` +
        `${topLines}\n\n` +
        `> _Manage triggers with \`.replies\` · \`.addreply\` · \`.delreply\`_`
    );
});
