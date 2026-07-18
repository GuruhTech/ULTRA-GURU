const { gmd } = require("../guru");
const Database = require("better-sqlite3");
const path     = require("path");
const fs       = require("fs-extra");

// ═══════════════════════════════════════════════════════════════════
//  SMART POLL SYSTEM  ·  ULTRA GURU MD
//  Create group polls with live voting, timed auto-close,
//  duplicate-vote protection and ASCII bar-chart results.
// ═══════════════════════════════════════════════════════════════════

const DB_DIR = path.join(__dirname, "../guru/database");
fs.ensureDirSync(DB_DIR);

const db = new Database(path.join(DB_DIR, "polls.db"));
db.pragma("journal_mode = WAL");
db.exec(`
    CREATE TABLE IF NOT EXISTS polls (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        group_jid  TEXT    NOT NULL,
        creator    TEXT    NOT NULL,
        question   TEXT    NOT NULL,
        options    TEXT    NOT NULL,
        is_active  INTEGER NOT NULL DEFAULT 1,
        ends_at    INTEGER,
        created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS votes (
        poll_id    INTEGER NOT NULL,
        voter_jid  TEXT    NOT NULL,
        option_idx INTEGER NOT NULL,
        voted_at   INTEGER NOT NULL,
        PRIMARY KEY (poll_id, voter_jid)
    );
    CREATE INDEX IF NOT EXISTS idx_polls_group ON polls (group_jid, is_active);
`);

const $create     = db.prepare(`INSERT INTO polls (group_jid,creator,question,options,ends_at,created_at) VALUES (?,?,?,?,?,?)`);
const $getActive  = db.prepare(`SELECT * FROM polls WHERE group_jid = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1`);
const $getById    = db.prepare(`SELECT * FROM polls WHERE id = ?`);
const $close      = db.prepare(`UPDATE polls SET is_active = 0 WHERE id = ?`);
const $listActive = db.prepare(`SELECT * FROM polls WHERE group_jid = ? AND is_active = 1 ORDER BY created_at DESC`);
const $addVote    = db.prepare(`INSERT OR REPLACE INTO votes (poll_id,voter_jid,option_idx,voted_at) VALUES (?,?,?,?)`);
const $getVote    = db.prepare(`SELECT option_idx FROM votes WHERE poll_id = ? AND voter_jid = ?`);
const $getResults = db.prepare(`SELECT option_idx, COUNT(*) as cnt FROM votes WHERE poll_id = ? GROUP BY option_idx`);
const $totalVotes = db.prepare(`SELECT COUNT(*) as total FROM votes WHERE poll_id = ?`);
const $expirePast = db.prepare(`UPDATE polls SET is_active = 0 WHERE is_active = 1 AND ends_at IS NOT NULL AND ends_at < ?`);

// ── Auto-expire timer ────────────────────────────────────────────────
if (!global.__pollExpireInterval) {
    global.__pollExpireInterval = setInterval(() => {
        try { $expirePast.run(Date.now()); } catch (_) {}
    }, 60_000);
}

// ── Helper: render results as an ASCII bar chart ─────────────────────
const buildResultsText = (poll, label = "📊 Results") => {
    const options  = JSON.parse(poll.options);
    const rawRows  = $getResults.all(poll.id);
    const total    = $totalVotes.get(poll.id)?.total || 0;
    const countMap = Object.fromEntries(rawRows.map(r => [r.option_idx, r.cnt]));

    const BAR_W  = 14;
    const lines  = options.map((opt, i) => {
        const votes = countMap[i] || 0;
        const pct   = total > 0 ? (votes / total) * 100 : 0;
        const filled = Math.round((pct / 100) * BAR_W);
        const bar   = "█".repeat(filled) + "░".repeat(BAR_W - filled);
        return `*${i + 1}.* ${opt}\n   [${bar}] ${pct.toFixed(1)}% _(${votes} votes)_`;
    });

    return (
        `*${label}*\n` +
        `${"═".repeat(32)}\n\n` +
        `❓ *${poll.question}*\n\n` +
        `${lines.join("\n\n")}\n\n` +
        `${"─".repeat(32)}\n` +
        `🗳️ *Total votes: ${total}*  |  Poll #${poll.id}`
    );
};

// ── Passive hook: detect vote messages (number in active-poll group) ──
if (!global.__pluginMsgHooks) global.__pluginMsgHooks = [];

global.__pluginMsgHooks.push(async (ms, Guru, settings) => {
    try {
        const from = ms.key.remoteJid;
        if (!from?.endsWith("@g.us")) return;

        const body = (
            ms.message?.conversation ||
            ms.message?.extendedTextMessage?.text || ""
        ).trim();

        const prefix = settings?.PREFIX || ".";
        if (!body || body.startsWith(prefix)) return;

        const num = parseInt(body, 10);
        if (isNaN(num) || String(num) !== body) return;

        const poll = $getActive.get(from);
        if (!poll) return;

        const options = JSON.parse(poll.options);
        const idx     = num - 1;
        if (idx < 0 || idx >= options.length) return;

        const voterJid = ms.key.participant || ms.key.remoteJid;
        const existing = $getVote.get(poll.id, voterJid);

        if (existing) {
            const prev = existing.option_idx + 1;
            if (prev === num) return; // same vote, ignore silently
            $addVote.run(poll.id, voterJid, idx, Date.now());
            await Guru.sendMessage(from, {
                text: `🔄 Vote changed to *${num}. ${options[idx]}* ✅`,
            }, { quoted: ms });
        } else {
            $addVote.run(poll.id, voterJid, idx, Date.now());
            await Guru.sendMessage(from, {
                text: `✅ Voted for *${num}. ${options[idx]}*  _(reply again to change)_`,
            }, { quoted: ms });
        }
    } catch (err) {
        console.error("[Polls] passive hook error:", err.message);
    }
});

// ── Parse .poll args: "Question?" "Opt1" "Opt2" ... [time in minutes] ──
const parsePollArgs = (q) => {
    const matches = [];
    let   rest    = q.trim();
    const re      = /^"([^"]+)"\s*/;

    while (re.test(rest)) {
        matches.push(re.exec(rest)[1]);
        rest = rest.replace(re, "");
    }

    let durationMin = null;
    const numMatch  = rest.trim().match(/^(\d+)$/);
    if (numMatch) durationMin = parseInt(numMatch[1], 10);

    if (matches.length < 3) return null;
    const [question, ...options] = matches;
    if (options.length > 10) return null;

    return { question, options, durationMin };
};

// ── COMMAND: .poll ───────────────────────────────────────────────────
gmd({
    pattern:     "poll",
    aliases:     ["createpoll", "newpoll"],
    react:       "🗳️",
    category:    "group",
    description: "Create a group poll with timed auto-close",
    usage:       `.poll "Question?" "Option 1" "Option 2" [minutes]`,
}, async (from, Guru, conText) => {
    const { q, reply, react, isGroup, sender, isAdmin, isBotAdmin, isSuperUser } = conText;

    if (!isGroup) { await react("❌"); return reply("❌ Polls work in groups only."); }
    if (!isAdmin && !isSuperUser) { await react("❌"); return reply("❌ Group admins only."); }

    if (!q) {
        await react("❓");
        return reply(
            `*🗳️ Poll Creator*\n${"═".repeat(30)}\n\n` +
            `*Format:*\n\`.poll "Question?" "Option 1" "Option 2" [minutes]\`\n\n` +
            `• Wrap each part in double quotes\n` +
            `• 2–10 options allowed\n` +
            `• Optional: add number of minutes before auto-close\n\n` +
            `*Example:*\n\`.poll "Best fruit?" "🍎 Apple" "🍌 Banana" "🍊 Orange" 30\``
        );
    }

    const parsed = parsePollArgs(q);
    if (!parsed) {
        await react("❌");
        return reply(`❌ Invalid format. Use: \`.poll "Question?" "Option 1" "Option 2"\`\n\nMin 2 options, max 10.`);
    }

    const existing = $getActive.get(from);
    if (existing) {
        await react("❌");
        return reply(`❌ There's already an active poll (#${existing.id}) in this group.\nEnd it with *.endpoll* first.`);
    }

    const { question, options, durationMin } = parsed;
    const endsAt = durationMin ? Date.now() + durationMin * 60_000 : null;
    const result = $create.run(from, sender, question, JSON.stringify(options), endsAt, Date.now());
    const id     = result.lastInsertRowid;

    const optLines = options.map((o, i) => `   *${i + 1}.* ${o}`).join("\n");
    const timeNote = durationMin
        ? `\n⏱️ *Auto-closes in:* ${durationMin} minute${durationMin > 1 ? "s" : ""}`
        : "\n⏱️ *No time limit* — end with .endpoll";

    await react("✅");
    reply(
        `*🗳️ POLL STARTED — #${id}*\n` +
        `${"═".repeat(32)}\n\n` +
        `❓ *${question}*\n\n` +
        `${optLines}\n` +
        `${"─".repeat(32)}\n` +
        `📲 Reply with the *option number* to vote!\n` +
        `${timeNote}`
    );
});

// ── COMMAND: .vote ───────────────────────────────────────────────────
gmd({
    pattern:     "vote",
    aliases:     ["v"],
    react:       "🗳️",
    category:    "group",
    description: "Vote in the active group poll",
    usage:       ".vote <option number>",
}, async (from, Guru, conText) => {
    const { q, reply, react, isGroup, sender } = conText;

    if (!isGroup) { await react("❌"); return reply("❌ No active poll here."); }

    const poll = $getActive.get(from);
    if (!poll) { await react("❌"); return reply("❌ No active poll in this group."); }

    const options = JSON.parse(poll.options);
    const num     = parseInt(q?.trim(), 10);

    if (isNaN(num) || num < 1 || num > options.length) {
        await react("❓");
        return reply(`❓ Choose a valid option: 1 – ${options.length}\n\nOr just send the number directly!`);
    }

    const idx      = num - 1;
    const existing = $getVote.get(poll.id, sender);

    $addVote.run(poll.id, sender, idx, Date.now());

    if (existing) {
        const prev = existing.option_idx + 1;
        await react("🔄");
        return reply(`🔄 Changed vote from *${prev}* → *${num}. ${options[idx]}* ✅`);
    }

    await react("✅");
    reply(`✅ Voted for *${num}. ${options[idx]}*`);
});

// ── COMMAND: .endpoll ────────────────────────────────────────────────
gmd({
    pattern:     "endpoll",
    aliases:     ["closepoll", "stoppoll"],
    react:       "📊",
    category:    "group",
    description: "End the active poll and show final results",
    usage:       ".endpoll",
}, async (from, Guru, conText) => {
    const { q, reply, react, isGroup, isAdmin, isSuperUser } = conText;

    if (!isGroup) { await react("❌"); return reply("❌ Groups only."); }
    if (!isAdmin && !isSuperUser) { await react("❌"); return reply("❌ Group admins only."); }

    const id   = parseInt(q?.trim(), 10);
    const poll = id ? $getById.get(id) : $getActive.get(from);

    if (!poll || poll.group_jid !== from) {
        await react("❌");
        return reply("❌ No active poll found. Use `.polls` to see what's running.");
    }

    $close.run(poll.id);
    await react("✅");
    reply(buildResultsText(poll, "📊 Final Results"));
});

// ── COMMAND: .pollresult ─────────────────────────────────────────────
gmd({
    pattern:     "pollresult",
    aliases:     ["presult", "pollstats"],
    react:       "📊",
    category:    "group",
    description: "Show live results of the active poll",
    usage:       ".pollresult",
}, async (from, Guru, conText) => {
    const { reply, react, isGroup } = conText;

    if (!isGroup) { await react("❌"); return reply("❌ Groups only."); }

    const poll = $getActive.get(from);
    if (!poll) { await react("❌"); return reply("❌ No active poll in this group."); }

    await react("✅");
    reply(buildResultsText(poll, "📊 Live Results"));
});

// ── COMMAND: .polls ──────────────────────────────────────────────────
gmd({
    pattern:     "polls",
    aliases:     ["activepolls"],
    react:       "📋",
    category:    "group",
    description: "List all active polls in this group",
    usage:       ".polls",
}, async (from, Guru, conText) => {
    const { reply, react, isGroup } = conText;

    if (!isGroup) { await react("❌"); return reply("❌ Groups only."); }

    const active = $listActive.all(from);
    if (active.length === 0) {
        await react("📭");
        return reply("📭 No active polls.\n\nStart one with `.poll`!");
    }

    const lines = active.map(p => {
        const opts = JSON.parse(p.options).length;
        const rem  = p.ends_at ? `⏱️ ${Math.max(0, Math.ceil((p.ends_at - Date.now()) / 60_000))}m left` : "⏾ No limit";
        return `🗳️ *#${p.id}* — ${p.question}\n   ${opts} options · ${rem}`;
    }).join("\n\n");

    await react("✅");
    reply(`*📋 Active Polls (${active.length})*\n${"═".repeat(30)}\n\n${lines}\n\n_Vote by replying with the option number!_`);
});
