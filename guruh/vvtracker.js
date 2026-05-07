
const { gmd } = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");

gmd(
    {
        pattern: "vvtracker",
        aliases: ["vvtrack", "viewoncetrack", "vvt"],
        react: "👁️",
        category: "owner",
        description: "Toggle auto VV (view-once) tracker — saves view-once to linker's DM on reaction or emoji reply",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isSuperUser, q } = conText;
        if (!isSuperUser) return reply("*Owner Only Command!*");

        const current = await getSetting("VV_TRACKER");
        const isOn = current === "true";

        if (!q) {
            return reply(
                `👁️ *VV Tracker Status*\n\n` +
                `Current: *${isOn ? "ON ✅" : "OFF ❌"}*\n\n` +
                `Usage: \`.vvtracker on\` / \`.vvtracker off\`\n\n` +
                `_When ON, the bot silently saves view-once media to the DM of anyone who reacts or replies with an emoji to it._`
            );
        }

        const arg = q.trim().toLowerCase();
        if (arg === "on" || arg === "true") {
            await setSetting("VV_TRACKER", "true");
            await react("✅");
            return reply("✅ *VV Tracker enabled!*\n\n_The bot will now silently forward view-once media to the DM of anyone who reacts or replies with an emoji to it._");
        } else if (arg === "off" || arg === "false") {
            await setSetting("VV_TRACKER", "false");
            await react("✅");
            return reply("❌ *VV Tracker disabled!*");
        } else {
            return reply("Invalid option. Use `.vvtracker on` or `.vvtracker off`");
        }
    }
);

gmd(
    {
        pattern: "vvcache",
        aliases: ["vvstore", "viewoncecache"],
        react: "📊",
        category: "owner",
        description: "Show how many view-once messages are currently tracked in memory",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isSuperUser } = conText;
        if (!isSuperUser) return reply("*Owner Only Command!*");

        try {
            const { viewOnceStore } = require("../guru/vvTracker");
            const count = viewOnceStore.size;
            await react("✅");
            return reply(
                `👁️ *VV Cache Status*\n\n` +
                `Tracked view-once messages: *${count}*\n` +
                `_Messages are kept for 24 hours, then auto-purged._`
            );
        } catch (e) {
            return reply("Could not fetch VV cache status.");
        }
    }
);
