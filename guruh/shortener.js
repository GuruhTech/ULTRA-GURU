
const { gmd } = require("../guru");
const axios = require("axios");
const { sendButtons } = require("gifted-btns");

const shorteners = [
    {
        pattern: "tinyurl",
        aliases: ["tiny"],
        name: "TinyURL",
        endpoint: "tinyurl",
    },
    {
        pattern: "cleanuri",
        aliases: ["cleanurl", "clean"],
        name: "CleanURI",
        endpoint: "cleanuri",
    },
    {
        pattern: "vgd",
        aliases: ["vgdurl"],
        name: "v.gd",
        endpoint: "vgd",
    },
    {
        pattern: "rebrandly",
        aliases: ["rebrand"],
        name: "Rebrandly",
        endpoint: "rebrandly",
    },
    {
        pattern: "vurl",
        aliases: ["vurlshort"],
        name: "vURL",
        endpoint: "vurl",
    },
    {
        pattern: "adfoc",
        aliases: ["adfocus"],
        name: "AdFoc.us",
        endpoint: "adfoc",
    },
    {
        pattern: "ssur",
        aliases: ["shorte"],
        name: "Shorte.st",
        endpoint: "ssur",
    },
];

for (const shortener of shorteners) {
    gmd(
        {
            pattern: shortener.pattern,
            aliases: shortener.aliases,
            react: "🔗",
            category: "tools",
            description: `Shorten a URL using ${shortener.name}`,
        },
        async (from, Gifted, conText) => {
            const {
                sender,
                mek,
                reply,
                react,
                q,
                botName,
                botFooter,
                GiftedTechApi,
                GiftedApiKey,
            } = conText;

            if (!q || q.trim() === "") {
                await react("❌");
                return reply(`❌ Please provide a URL to shorten.

*Usage:* .${shortener.pattern} <url>
*Example:* .${shortener.pattern} https://example.com`);
            }

            const url = q.trim();

            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                await react("❌");
                return reply(
                    `❌ Invalid URL. Please provide a valid URL starting with http:// or https://`,
                );
            }

            await react("⏳");

            try {
                const res = await axios.get(
                    `${GiftedTechApi}/api/tools/${shortener.endpoint}`,
                    {
                        params: {
                            apikey: GiftedApiKey,
                            url: url,
                        },
                        timeout: 30000,
                    },
                );

                if (!res.data?.success || !res.data?.result) {
                    await react("❌");
                    return reply(
                        `❌ Failed to shorten URL using ${shortener.name}. Try again later.`,
                    );
                }

                const shortUrl = res.data.result;

                await sendButtons(Gifted, from, {
                    text: `🔗 *${botName} URL SHORTENER*\n\n📎 *Original:* ${url}\n✂️ *Shortened:* ${shortUrl}`,
                    footer: botFooter,
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📋 Copy Short URL",
                                copy_code: shortUrl,
                            }),
                        },
                    ],
                });

                await react("✅");
            } catch (e) {
                await react("❌");
                return reply(`❌ Failed to shorten URL: ${e.message}`);
            }
        },
    );
}

gmd(
    {
        pattern: "shortener",
        aliases: ["shorteners", "shortenhelp", "urlshort"],
        react: "🔗",
        category: "tools",
        description: "Show all available URL shorteners",
    },
    async (from, Gifted, conText) => {
        const { reply } = conText;

        const helpText = `🔗 *URL SHORTENER COMMANDS*

Available shorteners:

*.tinyurl* / *.tiny* - TinyURL
*.cleanuri* / *.clean* - CleanURI
*.vgd* - v.gd
*.rebrandly* / *.rebrand* - Rebrandly
*.vurl* - vURL
*.adfoc* - AdFoc.us
*.ssur* - Shorte.st

*Usage:* .<command> <url>
*Example:* .tinyurl https://example.com`;

        return reply(helpText);
    },
);
