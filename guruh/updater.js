
const { gmd } = require("../guru");
const axios = require("axios");
const { getSetting, setSetting } = require("../guru/database/settings");
const { getCommitHash } = require("../guru/database/autoUpdate");
const { runUpdate } = require("../guru/autoUpdater");

gmd(
    {
        pattern: "update",
        aliases: ["updatenow", "updt", "forceupdatenow"],
        react: "🆕",
        description: "Manually check and apply the latest bot update.",
        category: "owner",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter, giftedRepo } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        try {
            await react("🔍");
            const repo = giftedRepo || (await getSetting("BOT_REPO")) || "GuruhTech/ULTRA-GURU";
            await reply(`🔍 Checking for updates on \`${repo}\`...`);

            const currentHash = await getCommitHash();
            const { data: commitData } = await axios.get(
                `https://api.github.com/repos/${repo}/commits/main`,
                { timeout: 20000 }
            );
            const latestHash = commitData.sha;

            if (latestHash === currentHash) {
                await react("✅");
                return reply(
                    `✅ *Already Up To Date!*\n\n` +
                    `◈ 🏷️ Commit  ⤳ \`${currentHash.slice(0, 7)}\`\n` +
                    `◈ 📅 Date    ⤳ ${new Date(commitData.commit.author.date).toLocaleString()}\n` +
                    `◈ 💬 Message ⤳ ${commitData.commit.message}\n\n` +
                    `> _${botFooter}_`
                );
            }

            const authorName = commitData.commit.author.name;
            const commitMessage = commitData.commit.message;
            const commitDate = new Date(commitData.commit.author.date).toLocaleString();

            await reply(
                `🔄 *Update Found! Applying...*\n\n` +
                `◈ 👤 Author   ⤳ ${authorName}\n` +
                `◈ 📅 Date     ⤳ ${commitDate}\n` +
                `◈ 💬 Changes  ⤳ ${commitMessage}\n\n` +
                `_Please wait — bot will restart when done._`
            );

            await runUpdate(repo, Gifted, null);

            await react("✅");
            await reply("✅ *Update Complete! Restarting now...*");
            setTimeout(() => process.exit(0), 2000);
        } catch (error) {
            console.error("Update error:", error);
            await react("❌");
            return reply(
                `❌ *Update Failed*\n\n` +
                `Error: ${error.message}\n\n` +
                `_Try redeploying manually if the issue persists._\n\n` +
                `> _${botFooter}_`
            );
        }
    }
);

gmd(
    {
        pattern: "checkupdate",
        aliases: ["updatecheck", "hasupdate", "updatestatus"],
        react: "🔍",
        description: "Check if a new bot update is available without applying it.",
        category: "owner",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter, giftedRepo } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        try {
            await react("🔍");
            const repo = giftedRepo || (await getSetting("BOT_REPO")) || "GuruhTech/ULTRA-GURU";
            const autoUpdate = await getSetting("AUTO_UPDATE");
            const currentHash = await getCommitHash();

            const { data: commitData } = await axios.get(
                `https://api.github.com/repos/${repo}/commits/main`,
                { timeout: 20000 }
            );
            const latestHash = commitData.sha;
            const hasUpdate = latestHash !== currentHash;

            await react(hasUpdate ? "🆕" : "✅");
            await reply(
                `${hasUpdate ? "🆕 *Update Available!*" : "✅ *Up To Date*"}\n\n` +
                `◈ 📦 Repo       ⤳ \`${repo}\`\n` +
                `◈ 🔖 Current    ⤳ \`${currentHash.slice(0, 7)}\`\n` +
                `◈ 🔖 Latest     ⤳ \`${latestHash.slice(0, 7)}\`\n` +
                (hasUpdate
                    ? `◈ 👤 Author     ⤳ ${commitData.commit.author.name}\n` +
                      `◈ 📅 Date       ⤳ ${new Date(commitData.commit.author.date).toLocaleString()}\n` +
                      `◈ 💬 Changes    ⤳ ${commitData.commit.message}\n\n` +
                      `_Run \`.update\` to apply the update._`
                    : ""
                ) +
                `\n◈ 🔁 AutoUpdate ⤳ ${autoUpdate === "false" ? "🔴 OFF" : "🟢 ON"}\n\n` +
                `> _${botFooter}_`
            );
        } catch (error) {
            await react("❌");
            return reply(`❌ Could not check for updates.\nError: ${error.message}\n\n> _${botFooter}_`);
        }
    }
);

gmd(
    {
        pattern: "autoupdate",
        aliases: ["setautoupdate", "toggleautoupdate", "autoupdateset"],
        react: "🔁",
        description: "Enable or disable automatic updates on restart. Usage: .autoupdate on",
        category: "owner",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const val = (q || "").toLowerCase().trim();
        if (!["on", "off"].includes(val)) {
            const current = await getSetting("AUTO_UPDATE");
            return reply(
                `🔁 *Auto-Update Status*\n\n` +
                `◈ Current ⤳ ${current === "false" ? "🔴 OFF" : "🟢 ON"}\n\n` +
                `Usage: \`.autoupdate on\` or \`.autoupdate off\`\n\n` +
                `> _${botFooter}_`
            );
        }

        try {
            await setSetting("AUTO_UPDATE", val === "on" ? "true" : "false");
            await react("✅");
            await reply(
                `${val === "on" ? "🟢" : "🔴"} *Auto-Update ${val.toUpperCase()}*\n\n` +
                `${val === "on"
                    ? "Bot will automatically check for and apply updates every time it restarts."
                    : "Bot will no longer auto-update on restart. Use `.update` to update manually."
                }\n\n> _${botFooter}_`
            );
        } catch (err) {
            await react("❌");
            await reply(`❌ Error: ${err.message}`);
        }
    }
);

gmd(
    {
        pattern: "resetupdate",
        aliases: ["clearupdatehash", "forcereupdate"],
        react: "🔄",
        description: "Reset the stored update hash to force a full re-download on next restart.",
        category: "owner",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        try {
            const { setCommitHash } = require("../guru/database/autoUpdate");
            await setCommitHash("unknown");
            await react("✅");
            await reply(
                `✅ *Update Hash Cleared!*\n\n` +
                `The stored version hash has been reset to _unknown_.\n` +
                `Bot will re-download and apply the latest update on next restart.\n\n` +
                `◈ _Restart the bot now to trigger the full update._\n\n` +
                `> _${botFooter}_`
            );
        } catch (err) {
            await react("❌");
            await reply(`❌ Error: ${err.message}`);
        }
    }
);
