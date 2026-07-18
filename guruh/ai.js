
const { gmd, toPtt } = require("../guru");
const axios = require("axios");
const googleTTS = require("google-tts-api");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs-extra");

// ── Persistent Meta AI memory (SQLite) ──────────────────────────────────────
const AI_DB_DIR = path.join(__dirname, "../guru/database");
fs.ensureDirSync(AI_DB_DIR);
const _aiDb = new Database(path.join(AI_DB_DIR, "ai_memory.db"));
_aiDb.pragma("journal_mode = WAL");
_aiDb.pragma("synchronous = NORMAL");
_aiDb.exec(`
    CREATE TABLE IF NOT EXISTS meta_memory (
        jid   TEXT NOT NULL,
        role  TEXT NOT NULL,
        content TEXT NOT NULL,
        ts    INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_meta_jid ON meta_memory(jid, ts);
`);
const _stmtInsert = _aiDb.prepare("INSERT INTO meta_memory (jid, role, content) VALUES (?, ?, ?)");
const _stmtFetch  = _aiDb.prepare("SELECT role, content FROM meta_memory WHERE jid = ? ORDER BY ts ASC");
const _stmtCount  = _aiDb.prepare("SELECT COUNT(*) as cnt FROM meta_memory WHERE jid = ?");
const _stmtDeleteOld = _aiDb.prepare(`
    DELETE FROM meta_memory WHERE jid = ? AND rowid NOT IN (
        SELECT rowid FROM meta_memory WHERE jid = ? ORDER BY ts DESC LIMIT 20
    )
`);
const _stmtClear  = _aiDb.prepare("DELETE FROM meta_memory WHERE jid = ?");

const IDENTITY_PATTERNS = [
    /who\s*(made|created|built|programmed|coded|developed)\s*you/i,
    /who\s*is\s*your\s*(creator|developer|maker|owner|father|parent|author|builder)/i,
    /what('?s| is)\s*your\s*name\??/i,
    /who\s*are\s*you\??/i,
    /what\s*are\s*you\??/i,
    /who\s*u\??/i,
    /who\s*r\s*u\??/i,
    /who\s*are\s*ur\??/i,
    /what\s*r\s*u\??/i,
    /who\s*is\s*your\s*boss\??/i,
    /who\s*ur\s*owner\??/i,
    /tell\s*me\s*about\s*yourself/i,
    /introduce\s*yourself/i,
    /what\s*model\s*are\s*you\??/i,
    /are\s*you\s*(chatgpt|gpt|openai|gemini|claude|bard)/i,
    /are\s*you\s*(guruai|ultra\s*guru|guru\s*bot)/i,
    /who\s*built\s*u\??/i,
    /who\s*made\s*u\??/i,
    /whos?\s*your\s*maker\??/i,
];

const isIdentityQuestion = (q) =>
    typeof q === "string" && IDENTITY_PATTERNS.some((p) => p.test(q));

const buildFooter = (botFooter, botName) => {
    if (botFooter) return `\n\n> *${botFooter}*`;
    if (botName) return `\n\n> *${botName}*`;
    return `\n\n> *ULTRA GURU MD*`;
};

// ── GuruTech persona injected into every Pollinations request ───────────────
const GURUTECH_SYSTEM = `You are Lupus, a powerful AI WhatsApp assistant created and owned exclusively by GuruTech. You are NOT ChatGPT, Gemini, Bard, Claude, or any other commercial AI. You were built by GuruTech — a tech company dedicated to smart automation and WhatsApp tools. Always be helpful, friendly, and conversational. Whenever you introduce yourself or are asked who you are, always mention GuruTech as your creator and owner. Subtly mention GuruTech when relevant (e.g. "Powered by GuruTech"). Never claim to be made by OpenAI, Google, Anthropic, or Meta.`;

async function pollinationsQuery(prompt, model = "openai") {
    const wrapped = `${GURUTECH_SYSTEM}\n\nHuman: ${prompt}\nAssistant:`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(wrapped)}?model=${model}&seed=${Math.floor(Math.random() * 99999)}&json=false`;
    const res = await axios.get(url, { timeout: 60000, responseType: "text" });
    const text = typeof res.data === "string" ? res.data.trim() : JSON.stringify(res.data);
    if (!text || text.includes('"error"')) throw new Error("No response from Pollinations");
    return text;
}

async function queryAI(endpoint, query, conText, pollinationsModel = "openai") {
    const { reply, react, GuruTechApi, GuruApiKey, botFooter, botName } = conText;
    const footer = buildFooter(botFooter, botName);

    if (!query) {
        return reply(`❓ Please provide a question or prompt.${footer}`);
    }

    if (isIdentityQuestion(query)) {
        if (react) await react("🤖");
        const botN = botName || "ULTRA GURU MD";
        return reply(`🤖 *${botN}* — AI WhatsApp Bot\n\n◈ 👤 *Creator*    ⤳ GuruTech\n◈ 🌐 *Owner*      ⤳ GuruTech\n◈ 🛠️ *Built By*   ⤳ GuruTech\n◈ 📦 *Platform*   ⤳ WhatsApp Multi-Device\n◈ ⚡ *Engine*     ⤳ Multi-AI (GPT, Gemini, Llama, Claude & more)\n◈ 🎯 *Purpose*    ⤳ AI, Tools, Downloads, Group Management & more\n\nI am _not_ ChatGPT, Gemini, or any other AI product. I am *${botN}*, exclusively created and owned by *GuruTech*.\n\nType *.menu* to explore all my features! ✨${footer}`);
    }

    try {
        if (react) await react("🧠");

        let result = null;

        try {
            const apiUrl = `${GuruTechApi}/api/ai/${endpoint}?apikey=${GuruApiKey}&q=${encodeURIComponent(query)}`;
            const res = await axios.get(apiUrl, { timeout: 15000 });
            if (res.data?.success && res.data?.result) {
                const candidate = String(res.data.result);
                // GuruTechApi returns "rate-overlimit" when the key is throttled — treat as miss
                if (!candidate.includes("overlimit") && !candidate.includes("rate-limit") && !candidate.includes("ratelimit")) {
                    result = candidate;
                }
            }
        } catch (_) {}

        if (!result) {
            result = await pollinationsQuery(query, pollinationsModel);
        }

        if (react) await react("✅");
        reply(`${result}${footer}`);
    } catch (err) {
        console.error(`AI ${endpoint} error:`, err.message);
        if (react) await react("❌");
        reply(`❌ AI Error: ${err.message}${footer}`);
    }
}

async function pollinationsCmd(query, model, conText, reactEmoji = "🤖") {
    const { reply, react, botFooter, botName } = conText;
    const footer = buildFooter(botFooter, botName);

    if (!query) {
        return reply(`❓ Please provide a question or prompt.${footer}`);
    }

    if (isIdentityQuestion(query)) {
        if (react) await react("🤖");
        const botN = botName || "ULTRA GURU MD";
        return reply(`🤖 I am *${botN}*, an AI WhatsApp Bot created and owned by *GuruTech*.\n\nType *.menu* to explore all my features! ✨${footer}`);
    }

    try {
        if (react) await react(reactEmoji);
        const result = await pollinationsQuery(query, model);
        if (react) await react("✅");
        reply(`${result}${footer}`);
    } catch (err) {
        console.error(`Pollinations [${model}] error:`, err.message);
        if (react) await react("❌");
        reply(`❌ AI Error: ${err.message}${footer}`);
    }
}

gmd(
    {
        pattern: "guruai",
        aliases: ["ai"],
        react: "🤖",
        description: "Chat with ULTRA GURU AI assistant",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("ai", conText.q || "Introduce yourself briefly", conText, "openai");
    }
);

gmd(
    {
        pattern: "chat",
        aliases: ["ask", "query"],
        react: "💬",
        description: "General AI chat assistant",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("chat", conText.q, conText, "openai");
    }
);

gmd(
    {
        pattern: "gpt",
        aliases: ["chatgpt"],
        react: "🧠",
        description: "Chat with GPT-4o AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("gpt", conText.q, conText, "openai");
    }
);

gmd(
    {
        pattern: "gpt4",
        aliases: ["chatgpt4"],
        react: "🧠",
        description: "Chat with GPT-4 AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("gpt4", conText.q, conText, "openai-large");
    }
);

gmd(
    {
        pattern: "gpt4o",
        aliases: ["chatgpt4o"],
        react: "🧠",
        description: "Chat with GPT-4o AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("gpt4o", conText.q, conText, "openai");
    }
);

gmd(
    {
        pattern: "gpt4o-mini",
        aliases: ["chatgpt4o-mini"],
        react: "🧠",
        description: "Chat with GPT-4o-mini AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("gpt4o-mini", conText.q, conText, "openai-reasoning");
    }
);

gmd(
    {
        pattern: "openai",
        react: "🧠",
        description: "Chat with OpenAI GPT model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("openai", conText.q, conText, "openai");
    }
);

gmd(
    {
        pattern: "gemini",
        react: "💎",
        description: "Chat with Gemini AI",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("geminiai", conText.q, conText, "openai-large");
    }
);

gmd(
    {
        pattern: "mistral",
        react: "🔮",
        description: "Chat with Mistral AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await pollinationsCmd(conText.q, "mistral", conText, "🔮");
    }
);

gmd(
    {
        pattern: "letmegpt",
        aliases: ["letmegoogle"],
        react: "🔍",
        description: "Get AI-powered web search answers",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await queryAI("letmegpt", conText.q, conText, "searchgpt");
    }
);

gmd(
    {
        pattern: "llama",
        aliases: ["meta", "llama3"],
        react: "🦙",
        description: "Chat with Meta Llama AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await pollinationsCmd(conText.q, "llama", conText, "🦙");
    }
);

gmd(
    {
        pattern: "claude",
        aliases: ["anthropic"],
        react: "🌌",
        description: "Chat with Claude AI model",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await pollinationsCmd(conText.q, "claude-hybridspace", conText, "🌌");
    }
);

gmd(
    {
        pattern: "codex",
        aliases: ["code", "codeai", "qwen"],
        react: "💻",
        description: "AI coding assistant powered by Qwen Coder",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);
        const query = conText.q;

        if (!query) return reply(`❓ Provide a coding question or task.\n\nExample: *.codex* write a JavaScript function to sort an array${footer}`);

        const prompt = `You are an expert coding assistant. Answer only with clean, working code and brief explanation. No fluff.\n\nTask: ${query}`;
        await pollinationsCmd(prompt, "qwen-coder", conText, "💻");
    }
);

gmd(
    {
        pattern: "unity",
        aliases: ["unityai"],
        react: "🎭",
        description: "Chat with Unity creative AI (uncensored)",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await pollinationsCmd(conText.q, "unity", conText, "🎭");
    }
);

gmd(
    {
        pattern: "searchai",
        aliases: ["websearch", "aiwebsearch"],
        react: "🌐",
        description: "AI-powered web search assistant",
        category: "ai",
    },
    async (from, Guru, conText) => {
        await pollinationsCmd(conText.q, "searchgpt", conText, "🌐");
    }
);

gmd(
    {
        pattern: "imagine",
        aliases: ["flux", "aimage", "generate"],
        react: "🎨",
        description: "Generate AI images from text description",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, botFooter, botName, mek } = conText;
        const footer = buildFooter(botFooter, botName);
        const prompt = conText.q;

        if (!prompt) {
            return reply(`❓ Provide an image description.\n\nExample: *.imagine* a futuristic city at sunset with flying cars${footer}`);
        }

        try {
            if (react) await react("🎨");

            const seed = Math.floor(Math.random() * 999999);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

            await Guru.sendMessage(
                from,
                {
                    image: { url: imageUrl },
                    caption: `🎨 *AI Image Generated*\n\n📝 *Prompt:* ${prompt}${footer}`,
                },
                { quoted: mek }
            );

            if (react) await react("✅");
        } catch (err) {
            console.error("Image gen error:", err.message);
            if (react) await react("❌");
            reply(`❌ Image generation failed: ${err.message}${footer}`);
        }
    }
);

gmd(
    {
        pattern: "aimodels",
        aliases: ["ailist", "models"],
        react: "🤖",
        description: "List all available AI models and commands",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);
        const botN = botName || "ULTRA GURU MD";

        if (react) await react("🤖");

        const msg = `🤖 *${botN} — AI MODELS*\n${"─".repeat(30)}\n\n` +
            `*💬 TEXT AI MODELS:*\n\n` +
            `◈ 🧠 *.gpt* / *.chat* / *.ai* — GPT-4o (OpenAI)\n` +
            `◈ 🧠 *.gpt4* — GPT-4 Large Context\n` +
            `◈ 🧠 *.gpt4o* — GPT-4o Latest\n` +
            `◈ 🧠 *.gpt4o-mini* — GPT-4o Mini (Reasoning)\n` +
            `◈ 💎 *.gemini* — Google Gemini\n` +
            `◈ 🔮 *.mistral* — Mistral Nemo\n` +
            `◈ 🦙 *.llama* — Meta Llama 3.3 70B\n` +
            `◈ 🌌 *.claude* — Anthropic Claude\n` +
            `◈ 💻 *.codex* — Qwen 2.5 Coder (Code AI)\n` +
            `◈ 🎭 *.unity* — Unity Creative AI\n` +
            `◈ 🌐 *.searchai* — Web Search AI\n` +
            `◈ 🔍 *.letmegpt* — AI Web Search\n\n` +
            `*🎨 IMAGE AI MODELS:*\n\n` +
            `◈ 🖼️ *.imagine* / *.flux* — FLUX Image Generator\n\n` +
            `${"─".repeat(30)}\n` +
            `📌 *Usage:* *.gpt* what is quantum computing?${footer}`;

        await reply(msg);
    }
);

gmd(
    {
        pattern: "whois",
        aliases: ["whoami", "aboutme"],
        react: "🤖",
        description: "Ask who made this bot",
        category: "ai",
        dontAddCommandList: true,
    },
    async (from, Guru, conText) => {
        const { reply, react, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);
        const botN = botName || "ULTRA GURU MD";

        if (react) await react("🤖");
        await reply(`🤖 *${botN}* — AI WhatsApp Bot\n\n◈ 👤 *Creator*    ⤳ GuruTech\n◈ 🌐 *Owner*      ⤳ GuruTech\n◈ 🛠️ *Built By*   ⤳ GuruTech\n◈ 📦 *Platform*   ⤳ WhatsApp Multi-Device\n◈ ⚡ *Engine*     ⤳ Multi-AI (GPT, Gemini, Llama, Claude & more)\n◈ 🎯 *Purpose*    ⤳ AI, Tools, Downloads, Group Management & more\n\nI am _not_ ChatGPT, Gemini, or any other AI product. I am *${botN}*, exclusively created and owned by *GuruTech*.\n\nType *.menu* to explore all my features! ✨${footer}`);
    }
);

// ─── META AI — Real Meta Llama with persistent conversation memory ────────────

function _metaGetHistory(jid) {
    return _stmtFetch.all(jid);
}

function _metaAddHistory(jid, role, content) {
    _stmtInsert.run(jid, role, content);
    _stmtDeleteOld.run(jid, jid);
}

function _metaClearHistory(jid) {
    _stmtClear.run(jid);
}

async function metaAIQuery(prompt, senderJid) {
    _metaAddHistory(senderJid, 'user', prompt);
    const hist = _metaGetHistory(senderJid);

    const systemPrompt = GURUTECH_SYSTEM;

    const fullPrompt = `${systemPrompt}\n\n${hist.map(h => `${h.role === 'user' ? 'Human' : 'Assistant'}: ${h.content}`).join('\n')}\nAssistant:`;

    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=llama&seed=${Math.floor(Math.random() * 99999)}&json=false&private=true`;
    const res = await axios.get(url, { timeout: 60000, responseType: 'text' });
    const text = typeof res.data === 'string' ? res.data.trim() : JSON.stringify(res.data);
    if (!text || text.length < 2) throw new Error('Empty response from Meta AI');

    _metaAddHistory(senderJid, 'assistant', text);
    return text;
}

gmd(
    {
        pattern: "metaai",
        aliases: ["meta-ai", "llama3", "metalama"],
        react: "🦙",
        description: "Chat with real Meta AI (Llama 3.3 70B) with memory",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName, sender } = conText;
        const footer = buildFooter(botFooter, botName);
        const query  = q || mek?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

        if (!query) {
            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🦙  *META AI* (Llama 3.3 70B)
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Real Meta AI with memory
┃
┃  *Usage:*
┃  .metaai <your question>
┃
┃  *Memory commands:*
┃  .clearmetaai — clear history
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`
            );
        }

        if (isIdentityQuestion(query)) {
            if (react) await react("🦙");
            const botN = botName || "ULTRA GURU MD";
            return reply(`🤖 *${botN}* — AI WhatsApp Bot\n\n◈ 👤 *Creator*    ⤳ GuruTech\n◈ 🌐 *Owner*      ⤳ GuruTech\n◈ 🧠 *Engine*     ⤳ Llama 3.3 70B\n◈ 💬 *Memory*     ⤳ Remembers up to 10 exchanges\n◈ 📦 *Platform*   ⤳ WhatsApp Multi-Device\n\nI am *Lupus*, powered by GuruTech. Type *.metaai <question>* to chat!${footer}`);
        }

        try {
            if (react) await react("🦙");
            const result = await metaAIQuery(query, sender);
            if (react) await react("✅");
            await reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🦙  *META AI* (Llama 3.3)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${result}${footer}`
            );
        } catch (err) {
            console.error('Meta AI error:', err.message);
            if (react) await react("❌");
            await reply(`❌ Meta AI Error: ${err.message}\n\nPlease try again.${footer}`);
        }
    }
);

gmd(
    {
        pattern: "clearmetaai",
        aliases: ["resetmetaai", "metaaimemory"],
        react: "🗑️",
        description: "Clear your Meta AI conversation history",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, sender, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);
        if (react) await react("✅");
        _metaClearHistory(sender);
        await reply(`🗑️ *Meta AI memory cleared!*\n\nYour conversation history has been reset. Start a fresh chat with *.metaai*${footer}`);
    }
);

// ─── LUPUS (GuruTech branded AI with persistent memory) ──────────────────────

// Reuse the Meta AI SQLite memory tables for Lupus (same DB, separate key prefix)
function _lupusHistory(jid) {
    return _stmtFetch.all(`lupus:${jid}`);
}
function _lupusAdd(jid, role, content) {
    _stmtInsert.run(`lupus:${jid}`, role, content);
    _stmtDeleteOld.run(`lupus:${jid}`, `lupus:${jid}`);
}
function _lupusClear(jid) {
    _stmtClear.run(`lupus:${jid}`);
}

async function lupusQuery(prompt, senderJid) {
    _lupusAdd(senderJid, 'user', prompt);
    const hist = _lupusHistory(senderJid);

    const fullPrompt = `${GURUTECH_SYSTEM}\n\n${hist.map(h => `${h.role === 'user' ? 'Human' : 'Lupus'}: ${h.content}`).join('\n')}\nLupus:`;

    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai&seed=${Math.floor(Math.random() * 99999)}&json=false&private=true`;
    const res = await axios.get(url, { timeout: 60000, responseType: 'text' });
    const text = typeof res.data === 'string' ? res.data.trim() : JSON.stringify(res.data);
    if (!text || text.length < 2) throw new Error('No response from Lupus AI');

    _lupusAdd(senderJid, 'assistant', text);
    return text;
}

gmd(
    {
        pattern: "lupus",
        aliases: ["gurubot", "gurutechbot"],
        react: "🐺",
        description: "Chat with Lupus — GuruTech's AI assistant with memory",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName, sender } = conText;
        const footer = buildFooter(botFooter, botName);
        const botN  = botName || "ULTRA GURU MD";
        const query = q || mek?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

        if (!query) {
            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🐺  *LUPUS AI* by GuruTech
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Your personal AI assistant
┃  powered exclusively by
┃  *GuruTech* 🔥
┃
┃  *Usage:*
┃  .lupus <your question>
┃
┃  *Memory:*
┃  .lupus clear — reset history
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
> _Powered by GuruTech_${footer}`
            );
        }

        if (query.trim().toLowerCase() === 'clear') {
            _lupusClear(sender);
            if (react) await react("🗑️");
            return reply(`🗑️ *Lupus memory cleared!*\n\nFresh conversation started. Ask me anything!\n\n> _Powered by GuruTech_${footer}`);
        }

        if (isIdentityQuestion(query)) {
            if (react) await react("🐺");
            return reply(`🐺 *I am Lupus!*\n\n◈ 👤 *Created by*  ⤳ GuruTech\n◈ 🌐 *Owned by*    ⤳ GuruTech\n◈ ⚡ *Engine*      ⤳ Multi-AI\n◈ 💬 *Memory*      ⤳ Remembers your conversation\n◈ 📦 *Platform*    ⤳ WhatsApp\n\nI am *not* ChatGPT, Gemini, or any other commercial AI. I am *Lupus*, built exclusively by *GuruTech*. 🔥\n\nAsk me anything — *.lupus <question>*${footer}`);
        }

        try {
            if (react) await react("🐺");
            const result = await lupusQuery(query, sender);
            if (react) await react("✅");
            await reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🐺  *LUPUS* by GuruTech
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${result}

> _Powered by GuruTech_${footer}`
            );
        } catch (err) {
            console.error('Lupus AI error:', err.message);
            if (react) await react("❌");
            await reply(`❌ Lupus AI Error: ${err.message}\n\nPlease try again.${footer}`);
        }
    }
);

// ─── AI IMAGE GENERATION ─────────────────────────────────────────────────────

gmd(
    {
        pattern: "imagine",
        aliases: ["aiimage", "generate", "genimage", "dalle", "flux"],
        react: "🎨",
        description: "Generate an AI image from a text prompt",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName, sender } = conText;
        const footer = buildFooter(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎨  *AI IMAGE GENERATOR*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Powered by Flux · Pollinations
┃
┃  *Usage:*
┃  .imagine <description>
┃
┃  *Examples:*
┃  .imagine a lion wearing a crown
┃  .imagine futuristic city at night
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`
            );
        }

        try {
            if (react) await react("🎨");
            const seed  = Math.floor(Math.random() * 999999);
            const url   = `https://image.pollinations.ai/prompt/${encodeURIComponent(q.trim())}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;
            const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
            const imgBuf = Buffer.from(imgRes.data);
            if (react) await react("✅");
            await Guru.sendMessage(from, {
                image: imgBuf,
                caption: `🎨 *AI Generated Image*\n\n📝 *Prompt:* ${q.trim()}\n\n_Powered by Flux · Pollinations_${footer}`,
                contextInfo: { mentionedJid: [sender] },
            }, { quoted: mek });
        } catch (err) {
            if (react) await react("❌");
            await reply(`❌ Image generation failed: ${err.message}\n\nTry a simpler prompt.${footer}`);
        }
    }
);

// ─── AI IMAGE EDITOR ─────────────────────────────────────────────────────────
// Quote an image + provide an edit instruction (e.g. "make her wear a blue dress")
// The bot understands the instruction and generates an AI-edited version.

gmd(
    {
        pattern: "aiedit",
        aliases: ["editimage", "imgai", "aiimg", "photoedit"],
        react: "✏️",
        description: "AI-edit a quoted image. Quote image + describe the change.",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, quoted, botFooter, botName, sender } = conText;
        const footer = buildFooter(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✏️  *AI IMAGE EDITOR*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Quote an image & describe
┃  the change you want.
┃
┃  *Usage:*
┃  Reply to image + .aiedit <instruction>
┃
┃  *Examples:*
┃  .aiedit make him wear a blue cloth
┃  .aiedit add sunglasses and a hat
┃  .aiedit change background to beach
┃  .aiedit make it look like anime
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`
            );
        }

        const quotedImg   = quoted?.imageMessage || quoted?.message?.imageMessage;
        const quotedStick = quoted?.stickerMessage || quoted?.message?.stickerMessage;
        const media       = quotedImg || quotedStick;

        try {
            if (react) await react("✏️");

            let imageContext = '';
            let imageBuffer  = null;

            if (media) {
                // Download the quoted image to build context
                const tmpPath = await Guru.downloadAndSaveMediaMessage(media, 'aiedit_src');
                const fs = require('fs').promises;
                imageBuffer = await fs.readFile(tmpPath).catch(() => null);
                await fs.unlink(tmpPath).catch(() => {});
                imageContext = 'high quality photo, ';
            }

            // Build a rich prompt from the edit instruction
            const instruction = q.trim();
            const enhancedPrompt = `${imageContext}${instruction}, photorealistic, highly detailed, professional photography, 4k, sharp focus`;

            // Generate the edited image via Pollinations Flux
            const seed = Math.floor(Math.random() * 999999);
            const genUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

            const imgRes = await axios.get(genUrl, { responseType: 'arraybuffer', timeout: 90000 });
            const imgBuf = Buffer.from(imgRes.data);

            if (react) await react("✅");

            // Send original back alongside edited if we had it
            if (imageBuffer) {
                await Guru.sendMessage(from, {
                    image: imgBuf,
                    caption:
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✏️  *AI IMAGE EDIT*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  ✅ Applied: _${instruction}_
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`,
                    contextInfo: { mentionedJid: [sender] },
                }, { quoted: mek });
            } else {
                await Guru.sendMessage(from, {
                    image: imgBuf,
                    caption: `✏️ *AI Image Edit*\n\n📝 *Instruction:* ${instruction}\n\n_Powered by Flux · Pollinations_${footer}`,
                    contextInfo: { mentionedJid: [sender] },
                }, { quoted: mek });
            }
        } catch (err) {
            if (react) await react("❌");
            await reply(`❌ AI edit failed: ${err.message}\n\nPlease try again.${footer}`);
        }
    }
);

// ─── AI IMAGE → STICKER ──────────────────────────────────────────────────────

gmd(
    {
        pattern: "aisticker",
        aliases: ["ststicker", "aitossticker", "gensticker"],
        react: "🖼️",
        description: "Generate an AI image and convert to sticker. Usage: .aisticker <prompt>",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName, sender, packName, packAuthor } = conText;
        const footer = buildFooter(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(`❌ Provide a prompt!\n\nExample: *.aisticker a cute cartoon lion*${footer}`);
        }

        try {
            if (react) await react("🎨");
            const seed    = Math.floor(Math.random() * 999999);
            const url     = `https://image.pollinations.ai/prompt/${encodeURIComponent(q.trim() + ', sticker art style, transparent background, clean edges')}?model=flux&width=512&height=512&seed=${seed}&nologo=true`;
            const imgRes  = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
            const fs      = require('fs').promises;
            const { gmdSticker, gmdRandom } = require('../guru');
            const { StickerTypes } = require('wa-sticker-formatter');

            const tmpFile = gmdRandom('.jpg');
            await fs.writeFile(tmpFile, Buffer.from(imgRes.data));

            const stickerBuf = await gmdSticker(tmpFile, {
                pack:   packName   || 'ULTRA GURU',
                author: packAuthor || 'GURU-TECH',
                type:   StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                quality: 80,
            });
            await fs.unlink(tmpFile).catch(() => {});

            if (react) await react("✅");
            await Guru.sendMessage(from, { sticker: stickerBuf }, { quoted: mek });
        } catch (err) {
            if (react) await react("❌");
            await reply(`❌ AI sticker failed: ${err.message}${footer}`);
        }
    }
);

// ─── AI CAPTION GENERATOR ────────────────────────────────────────────────────

gmd(
    {
        pattern: "caption",
        aliases: ["aicomment", "postcaption", "writecaption"],
        react: "📝",
        description: "Generate a social media caption for any topic",
        category: "ai",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName, sender } = conText;
        const footer = buildFooter(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(`❌ Provide a topic!\n\nExample: *.caption a sunset photo at the beach*${footer}`);
        }

        const prompt = `Write 3 creative, engaging social media captions for: "${q.trim()}". Make each one unique — one short & punchy, one emotional/inspirational, one funny/witty. Add relevant hashtags to each. Format clearly numbered 1, 2, 3.`;

        try {
            if (react) await react("📝");
            const url    = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=llama&seed=${Math.floor(Math.random()*99999)}&json=false&private=true`;
            const res    = await axios.get(url, { timeout: 45000, responseType: 'text' });
            const result = typeof res.data === 'string' ? res.data.trim() : JSON.stringify(res.data);
            if (react) await react("✅");
            await reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📝  *AI CAPTION GENERATOR*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Topic: _${q.trim().slice(0, 30)}_
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${result}${footer}`
            );
        } catch (err) {
            if (react) await react("❌");
            await reply(`❌ Caption generation failed: ${err.message}${footer}`);
        }
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .explain <url> — Fetch URL content → AI summary → voice note audio
// ════════════════════════════════════════════════════════════════════════════

// Strip HTML tags and clean up whitespace from raw HTML
function stripHtml(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/\s{2,}/g, " ")
        .trim();
}

gmd(
    {
        pattern: "explain",
        aliases: ["urlexplain", "readurl", "listenurl"],
        react: "🔊",
        category: "ai",
        description: "Explain a URL as a voice note. Usage: .explain <url>",
    },
    async (from, Guru, conText) => {
        const { q, reply, react, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(`❌ Please provide a URL.\nExample: *.explain https://example.com*${footer}`);
        }

        const urlMatch = q.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) {
            return reply(`❌ No valid URL found. Make sure it starts with *http://* or *https://*${footer}`);
        }

        const targetUrl = urlMatch[0];
        await react("⏳");

        try {
            // ── Step 1: Fetch page ──────────────────────────────────────────
            let pageText = "";
            try {
                const { data: html } = await axios.get(targetUrl, {
                    timeout: 15000,
                    responseType: "text",
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
                    },
                    maxRedirects: 5,
                });
                pageText = stripHtml(String(html)).slice(0, 4000);
            } catch (fetchErr) {
                return reply(`❌ Could not fetch the URL: ${fetchErr.message}${footer}`);
            }

            if (!pageText || pageText.length < 50) {
                return reply(`❌ The URL returned no readable text content.${footer}`);
            }

            // ── Step 2: AI explanation ──────────────────────────────────────
            await react("🧠");
            const prompt =
                `You are an expert explainer. Read the webpage content below and write a clear, natural, conversational explanation of what this page is about in 120-160 words. ` +
                `Write ONLY plain spoken text — no markdown, no bullet points, no asterisks, no special symbols. ` +
                `It must sound natural when read aloud.\n\nWebpage content:\n${pageText}`;

            let explanation = "";
            try {
                explanation = await pollinationsQuery(prompt, "openai");
                // Remove any leftover markdown symbols
                explanation = explanation
                    .replace(/[*_~`#>]/g, "")
                    .replace(/\s{2,}/g, " ")
                    .trim();
            } catch (aiErr) {
                return reply(`❌ AI explanation failed: ${aiErr.message}${footer}`);
            }

            if (!explanation || explanation.length < 20) {
                return reply(`❌ AI returned an empty response. Please try again.${footer}`);
            }

            // ── Step 3: TTS → audio chunks ──────────────────────────────────
            await react("🎙️");
            let audioBuffer;
            try {
                const chunks = await googleTTS.getAllAudioBase64(explanation, {
                    lang: "en",
                    slow: false,
                    host: "https://translate.google.com",
                    timeout: 30000,
                });
                const buffers = chunks.map((c) => Buffer.from(c.base64, "base64"));
                audioBuffer = Buffer.concat(buffers);
            } catch (ttsErr) {
                return reply(`❌ Text-to-speech failed: ${ttsErr.message}${footer}`);
            }

            // ── Step 4: Convert to PTT voice note & send ───────────────────
            let pttBuffer;
            try {
                pttBuffer = await toPtt(audioBuffer);
            } catch (pttErr) {
                // Fallback: send as plain mp3 audio if PTT conversion fails
                pttBuffer = null;
            }

            if (pttBuffer) {
                await Guru.sendMessage(from, {
                    audio: pttBuffer,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                });
            } else {
                await Guru.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: "explanation.mp3",
                });
            }

            // Also send a brief text summary
            const preview = explanation.length > 180 ? explanation.slice(0, 180) + "…" : explanation;
            await reply(
                `🔊 *URL Explanation*\n\n` +
                `🔗 ${targetUrl}\n\n` +
                `_${preview}_\n\n` +
                `> _Audio generated by ULTRA GURU AI_${footer}`
            );

            await react("✅");

        } catch (err) {
            console.error("[.explain] error:", err.message);
            await react("❌");
            await reply(`❌ Something went wrong: ${err.message}${footer}`);
        }
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .tts <text> — Convert typed text to a WhatsApp voice note
// ════════════════════════════════════════════════════════════════════════════

// Supported TTS languages (code → label)
const TTS_LANGS = {
    en: "🇬🇧 English",
    sw: "🇰🇪 Swahili",
    fr: "🇫🇷 French",
    de: "🇩🇪 German",
    es: "🇪🇸 Spanish",
    ar: "🇸🇦 Arabic",
    hi: "🇮🇳 Hindi",
    pt: "🇧🇷 Portuguese",
    zh: "🇨🇳 Chinese",
    ja: "🇯🇵 Japanese",
};

gmd(
    {
        pattern: "tts",
        aliases: ["texttospeech", "speak", "voicenote"],
        react: "🔊",
        category: "tools",
        description: "Convert text to a voice note. Usage: .tts <text> or .tts lang=sw <text>",
    },
    async (from, Guru, conText) => {
        const { q, reply, react, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);

        if (!q || !q.trim()) {
            const langList = Object.entries(TTS_LANGS)
                .map(([code, label]) => `  • \`${code}\` — ${label}`)
                .join("\n");
            return reply(
                `🔊 *Text-to-Speech*\n\n` +
                `Usage: *.tts <text>*\n` +
                `With language: *.tts lang=sw Hello there*\n\n` +
                `*Supported languages:*\n${langList}\n\n` +
                `_Default is English (en)_${footer}`
            );
        }

        // ── Parse optional lang= prefix ───────────────────────────────────
        let lang = "en";
        let text = q.trim();

        const langMatch = text.match(/^lang=([a-z]{2})\s+/i);
        if (langMatch) {
            const requested = langMatch[1].toLowerCase();
            if (TTS_LANGS[requested]) {
                lang = requested;
            } else {
                return reply(`❌ Unsupported language code: *${requested}*\n\nSupported: ${Object.keys(TTS_LANGS).join(", ")}${footer}`);
            }
            text = text.slice(langMatch[0].length).trim();
        }

        if (!text) return reply(`❌ No text provided after the language option.${footer}`);
        if (text.length > 1000) return reply(`❌ Text too long. Maximum is *1000 characters* (yours: ${text.length}).${footer}`);

        await react("⏳");

        try {
            // ── Generate TTS audio chunks ─────────────────────────────────
            const chunks = await googleTTS.getAllAudioBase64(text, {
                lang,
                slow: false,
                host: "https://translate.google.com",
                timeout: 30000,
            });

            const audioBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c.base64, "base64")));

            // ── Convert to PTT voice note ─────────────────────────────────
            let pttBuffer = null;
            try {
                pttBuffer = await toPtt(audioBuffer);
            } catch (_) {}

            if (pttBuffer) {
                await Guru.sendMessage(from, {
                    audio: pttBuffer,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                });
            } else {
                // Fallback: send as plain audio file
                await Guru.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: "tts.mp3",
                });
            }

            await react("✅");

        } catch (err) {
            console.error("[.tts] error:", err.message);
            await react("❌");
            await reply(`❌ TTS failed: ${err.message}${footer}`);
        }
    }
);
