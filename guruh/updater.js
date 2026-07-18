
const { gmd } = require("../guru");
const axios = require("axios");
const { getSetting } = require("../guru/database/settings");
const { getCommitHash } = require("../guru/database/autoUpdate");
const { runUpdate } = require("../guru/autoUpdater");

const getRepo = async (guruRepo) => {
    const raw = guruRepo || (await getSetting("BOT_REPO")) || "GuruhTech/ULTRA-GURU";
    const match = String(raw).match(/github\.com\/([^/\s]+\/[^/\s]+)/);
    return match ? match[1].replace(/\.git$/, "").replace(/\/*$/, "") : String(raw).trim();
};

gmd(
    {
        pattern: "update",
        aliases: ["updatenow", "updt", "forceupdatenow"],
        react: "🆕",
        description: "Manually check and apply the latest bot update from GitHub.",
        category: "owner",
    },
    async (from, Guru, conText) => {
        const { react, reply, isSuperUser, botFooter, guruRepo } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        try {
            await react("🔍");
            const repo = await getRepo(guruRepo);

            await reply(
                `🔍 *Checking for updates...*\n\n` +
                `◈ 📦 Repo ⤳ \`github.com/${repo}\``
            );

            const currentHash = await getCommitHash();
            const { data: commitData } = await axios.get(
                `https://api.github.com/repos/${repo}/commits/main`,
                {
                    timeout: 20000,
                    headers: {
                        "Accept": "application/vnd.github.v3+json",
                        "Cache-Control": "no-cache",
                        "User-Agent": "ULTRA-GURU-Bot",
                    },
                }
            );
            const latestHash = commitData.sha;

            if (latestHash === currentHash) {
                await react("✅");
                return reply(
                    `✅ *Already Up To Date!*\n\n` +
                    `◈ 📦 Repo    ⤳ \`github.com/${repo}\`\n` +
                    `◈ 🏷️ Commit  ⤳ \`${currentHash.slice(0, 7)}\`\n` +
                    `◈ 📅 Date    ⤳ ${new Date(commitData.commit.author.date).toLocaleString()}\n` +
                    `◈ 💬 Message ⤳ ${commitData.commit.message}\n\n` +
                    `> _${botFooter}_`
                );
            }

            // Progress callback — sends each step as a WhatsApp message
            const onProgress = async (msg) => {
                try {
                    await reply(msg);
                } catch (_) {}
            };

            await runUpdate(repo, Guru, null, onProgress);

            await react("✅");
            await reply(
                `✅ *Update Complete!*\n\n` +
                `◈ 📦 Repo   ⤳ \`github.com/${repo}\`\n` +
                `◈ 🏷️ From   ⤳ \`${currentHash.slice(0, 7)}\`\n` +
                `◈ 🏷️ To     ⤳ \`${latestHash.slice(0, 7)}\`\n\n` +
                `_Bot is restarting now..._`
            );
            setTimeout(() => process.exit(0), 2000);
        } catch (error) {
            console.error("Update error:", error);
            await react("❌");
            return reply(
                `❌ *Update Failed*\n\n` +
                `Error: ${error.message}\n\n` +
                `_Try running \`.update\` again or check the repo is accessible._\n\n` +
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
    async (from, Guru, conText) => {
        const { react, reply, isSuperUser, botFooter, guruRepo } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        try {
            await react("🔍");
            const repo = await getRepo(guruRepo);
            const currentHash = await getCommitHash();

            const { data: commitData } = await axios.get(
                `https://api.github.com/repos/${repo}/commits/main`,
                {
                    timeout: 20000,
                    headers: {
                        "Accept": "application/vnd.github.v3+json",
                        "Cache-Control": "no-cache",
                        "User-Agent": "ULTRA-GURU-Bot",
                    },
                }
            );
            const latestHash = commitData.sha;
            const hasUpdate = latestHash !== currentHash;

            await react(hasUpdate ? "🆕" : "✅");
            await reply(
                `${hasUpdate ? "🆕 *Update Available!*" : "✅ *Up To Date*"}\n\n` +
                `◈ 📦 Repo      ⤳ \`github.com/${repo}\`\n` +
                `◈ 🔖 Current   ⤳ \`${currentHash.slice(0, 7)}\`\n` +
                `◈ 🔖 Latest    ⤳ \`${latestHash.slice(0, 7)}\`\n` +
                (hasUpdate
                    ? `◈ 👤 Author    ⤳ ${commitData.commit.author.name}\n` +
                      `◈ 📅 Date      ⤳ ${new Date(commitData.commit.author.date).toLocaleString()}\n` +
                      `◈ 💬 Changes   ⤳ ${commitData.commit.message}\n\n` +
                      `_Run \`.update\` to apply the update._`
                    : `\n_No action needed._`
                ) +
                `\n\n> _${botFooter}_`
            );
        } catch (error) {
            await react("❌");
            return reply(`❌ Could not check for updates.\nError: ${error.message}\n\n> _${botFooter}_`);
        }
    }
);

gmd(
    {
        pattern: "resetupdate",
        aliases: ["clearupdatehash", "forcereupdate"],
        react: "🔄",
        description: "Reset the stored update hash so next .update re-downloads everything.",
        category: "owner",
    },
    async (from, Guru, conText) => {
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
                `The stored version has been reset to _unknown_.\n` +
                `Next time you run \`.update\` it will re-download and apply all files.\n\n` +
                `> _${botFooter}_`
            );
        } catch (err) {
            await react("❌");
            await reply(`❌ Error: ${err.message}`);
        }
    }
);
