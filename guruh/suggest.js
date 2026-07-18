"use strict";

const { evt } = require("../guru/gmdCmds");

// ─── LEVENSHTEIN DISTANCE ─────────────────────────────────────────────────────

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = [];
    for (let i = 0; i <= m; i++) {
        dp[i] = [i];
        for (let j = 1; j <= n; j++) {
            dp[i][j] = i === 0 ? j
                : a[i - 1] === b[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// ─── BODY EXTRACTOR (mirrors serializer.js logic) ────────────────────────────

function extractBody(ms) {
    const msg = ms?.message;
    if (!msg) return "";
    if (msg.conversation)                           return msg.conversation;
    if (msg.extendedTextMessage?.text)              return msg.extendedTextMessage.text;
    if (msg.imageMessage?.caption)                  return msg.imageMessage.caption;
    if (msg.videoMessage?.caption)                  return msg.videoMessage.caption;
    if (msg.documentMessage?.caption)               return msg.documentMessage.caption;
    if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.templateButtonReplyMessage?.selectedId) return msg.templateButtonReplyMessage.selectedId;
    return "";
}

// ─── SUGGESTION ENGINE ───────────────────────────────────────────────────────

function getSuggestions(typed, maxResults = 3) {
    const scored = [];

    for (const cmd of evt.commands) {
        if (cmd.dontAddCommandList) continue;
        if (cmd.on === "body") continue;           // skip body-event handlers
        if (typeof cmd.pattern !== "string") continue;

        const names = [cmd.pattern, ...(Array.isArray(cmd.aliases) ? cmd.aliases : [])];

        let bestDist = Infinity;
        for (const name of names) {
            if (typeof name !== "string" || name.length < 2) continue;
            const dist = levenshtein(typed.toLowerCase(), name.toLowerCase());
            if (dist < bestDist) bestDist = dist;
        }

        if (bestDist < Infinity) {
            scored.push({ pattern: cmd.pattern, category: cmd.category || "general", dist: bestDist });
        }
    }

    // Sort by distance, then alphabetically
    scored.sort((a, b) => a.dist - b.dist || a.pattern.localeCompare(b.pattern));

    // Deduplicate and return top N
    const seen = new Set();
    const results = [];
    for (const r of scored) {
        if (!seen.has(r.pattern)) {
            seen.add(r.pattern);
            results.push(r);
        }
        if (results.length >= maxResults) break;
    }
    return results;
}

// ─── HOOK REGISTRATION ───────────────────────────────────────────────────────

if (!Array.isArray(global.__pluginMsgHooks)) {
    global.__pluginMsgHooks = [];
}

global.__pluginMsgHooks.push(async (ms, Guru, settings) => {
    try {
        // Ignore bot's own messages
        if (ms.key?.fromMe) return;

        const body = extractBody(ms);
        if (!body) return;

        const prefix = settings.PREFIX || ".";
        if (!body.startsWith(prefix)) return;

        // Extract the command the user typed
        const typed = body.slice(prefix.length).split(/\s+/)[0]?.toLowerCase();
        if (!typed || typed.length < 2) return;

        // Check if command already exists — don't interfere with valid commands
        const exists = evt.commands.find((c) =>
            c.on !== "body" &&
            (c.pattern === typed || (Array.isArray(c.aliases) && c.aliases.includes(typed)))
        );
        if (exists) return;

        // Dynamic threshold: allow up to half the word length in edits
        const threshold = Math.min(3, Math.max(1, Math.floor(typed.length / 2)));

        const suggestions = getSuggestions(typed);
        if (!suggestions.length || suggestions[0].dist > threshold) return;

        const from = ms.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        // Always reply privately to the sender — never spam the group
        const senderJid = isGroup
            ? (ms.key.participant || ms.participant || from)
            : from;

        // Build reply text
        let text;
        const p = prefix;

        if (suggestions[0].dist <= 1) {
            // Single very close match — "did you mean?"
            text =
                `🤔 *Did you mean* \`${p}${suggestions[0].pattern}\`?\n\n` +
                `You typed: \`${p}${typed}\`\n\n` +
                `_Type *${p}${suggestions[0].pattern}* to run it._`;
        } else {
            // Multiple possible matches
            const matchLines = suggestions
                .filter((s) => s.dist <= threshold)
                .map((s) => `• \`${p}${s.pattern}\`  _(${s.category})_`)
                .join("\n");

            text =
                `🔍 Command \`${p}${typed}\` not found.\n\n` +
                `*Did you mean one of these?*\n${matchLines}\n\n` +
                `_Use \`${p}menu\` or \`${p}help\` to see all commands._`;
        }

        // Send as private DM — only the user who typed sees this
        await Guru.sendMessage(senderJid, { text });

    } catch (_) {
        // Silently ignore any errors — this is a helper, not critical
    }
});
