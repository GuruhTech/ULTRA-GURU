
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

const GURUTECH_IDENTITY = `🤖 *ULTRA GURU MD* — AI WhatsApp Bot

◈ 👤 *Creator*    ⤳ GuruTech
◈ 🌐 *Owner*      ⤳ GuruTech
◈ 🛠️ *Built By*   ⤳ GuruTech
◈ 📦 *Platform*   ⤳ WhatsApp Multi-Device
◈ ⚡ *Engine*     ⤳ GiftedTech AI APIs
◈ 🎯 *Purpose*    ⤳ AI, Tools, Downloads, Group Management & more

I am _not_ ChatGPT, Gemini, or any other AI product. I am *ULTRA GURU MD*, exclusively created and owned by *GuruTech*.

Type *.menu* to explore all my features! ✨`;

const isIdentityQuestion = (q) =>
    typeof q === "string" && IDENTITY_PATTERNS.some((p) => p.test(q));

async function queryAI(endpoint, query, conText) {
    const { reply, react, GiftedTechApi, GiftedApiKey } = conText;

    if (!query) {
        return reply("❓ Please provide a question or prompt.");
    }

    if (isIdentityQuestion(query)) {
        if (react) await react("🤖");
        return reply(GURUTECH_IDENTITY);
    }

    try {
        if (react) await react("🧠");
        const apiUrl = `${GiftedTechApi}/api/ai/${endpoint}?apikey=${GiftedApiKey}&q=${encodeURIComponent(query)}`;
        const res = await axios.get(apiUrl, { timeout: 100000 });

        if (!res.data?.success || !res.data?.result) {
            return reply("⚠️ Failed to get a response. Please try again.");
        }

        if (react) await react("✅");
        reply(res.data.result);
    } catch (err) {
        console.error(`AI ${endpoint} error:`, err.message);
        if (react) await react("❌");
        reply("❌ Error: " + err.message);
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
        await queryAI("ai", conText.q || "Introduce yourself", conText);
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
        await queryAI("chat", conText.q, conText);
    }
);

gmd(
    {
        pattern: "gpt",
        aliases: ["chatgpt"],
        react: "🧠",
        description: "Chat with GPT AI model",
        category: "ai",
    },
    async (from, Gifted, conText) => {
        await queryAI("gpt", conText.q, conText);
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
        await queryAI("gpt4", conText.q, conText);
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
        await queryAI("gpt4o", conText.q, conText);
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
        await queryAI("gpt4o-mini", conText.q, conText);
    }
);

gmd(
    {
        pattern: "openai",
        react: "🧠",
        description: "Chat with OpenAI model via GuruTech API",
        category: "ai",
    },
    async (from, Gifted, conText) => {
        await queryAI("openai", conText.q, conText);
    }
);

gmd(
    {
        pattern: "gemini",
        react: "💎",
        description: "Chat with Gemini AI via GuruTech API",
        category: "ai",
    },
    async (from, Gifted, conText) => {
        await queryAI("geminiai", conText.q, conText);
    }
);

gmd(
    {
        pattern: "mistral",
        react: "🔮",
        description: "Chat with Mistral AI model via GuruTech API",
        category: "ai",
    },
    async (from, Gifted, conText) => {
        await queryAI("mistral", conText.q, conText);
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
        await queryAI("letmegpt", conText.q, conText);
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
        const { reply, react } = conText;
        await react("🤖");
        await reply(GURUTECH_IDENTITY);
    }
);
