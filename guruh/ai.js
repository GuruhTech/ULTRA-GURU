
const { gmd } = require("../guru");
const axios = require("axios");

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

async function pollinationsQuery(prompt, model = "openai") {
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}&seed=${Math.floor(Math.random() * 99999)}&json=false`;
    const res = await axios.get(url, { timeout: 60000, responseType: "text" });
    const text = typeof res.data === "string" ? res.data.trim() : JSON.stringify(res.data);
    if (!text || text.includes('"error"')) throw new Error("No response from Pollinations");
    return text;
}

async function queryAI(endpoint, query, conText, pollinationsModel = "openai") {
    const { reply, react, GiftedTechApi, GiftedApiKey, botFooter, botName } = conText;
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
            const apiUrl = `${GiftedTechApi}/api/ai/${endpoint}?apikey=${GiftedApiKey}&q=${encodeURIComponent(query)}`;
            const res = await axios.get(apiUrl, { timeout: 15000 });
            if (res.data?.success && res.data?.result) {
                result = res.data.result;
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
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

            await Gifted.sendMessage(
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
    async (from, Gifted, conText) => {
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
    async (from, Gifted, conText) => {
        const { reply, react, botFooter, botName } = conText;
        const footer = buildFooter(botFooter, botName);
        const botN = botName || "ULTRA GURU MD";

        if (react) await react("🤖");
        await reply(`🤖 *${botN}* — AI WhatsApp Bot\n\n◈ 👤 *Creator*    ⤳ GuruTech\n◈ 🌐 *Owner*      ⤳ GuruTech\n◈ 🛠️ *Built By*   ⤳ GuruTech\n◈ 📦 *Platform*   ⤳ WhatsApp Multi-Device\n◈ ⚡ *Engine*     ⤳ Multi-AI (GPT, Gemini, Llama, Claude & more)\n◈ 🎯 *Purpose*    ⤳ AI, Tools, Downloads, Group Management & more\n\nI am _not_ ChatGPT, Gemini, or any other AI product. I am *${botN}*, exclusively created and owned by *GuruTech*.\n\nType *.menu* to explore all my features! ✨${footer}`);
    }
);
