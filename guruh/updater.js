var _0xc82dc2=(function(_0x4bf5f7,_0x5f222b){return !![]}());var _0x6c45ec=function(){return ![]};
const { gmd } = require("../guru");
const axios = require("axios");
const { getSetting, setSetting } = require("../guru/database/settings");
const { getCommitHash } = require("../guru/database/autoUpdate");
const { runUpdate } = require("../guru/autoUpdater");
gmd(
    {
        pattern: "\x75\x70\x64\x61\x74\x65",
        aliases: ["\x75\x70\x64\x61\x74\x65\x6e\x6f\x77", "\x75\x70\x64\x74", "\x66\x6f\x72\x63\x65\x75\x70\x64\x61\x74\x65\x6e\x6f\x77"],
        react: "🆕",
        description: "\x4d\x61\x6e\x75\x61\x6c\x6c\x79\x20\x63\x68\x65\x63\x6b\x20\x61\x6e\x64\x20\x61\x70\x70\x6c\x79\x20\x74\x68\x65\x20\x6c\x61\x74\x65\x73\x74\x20\x62\x6f\x74\x20\x75\x70\x64\x61\x74\x65\x2e",
        category: "\x6f\x77\x6e\x65\x72",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter, giftedRepo } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        try {
            await react("🔍");
            const _0xf2aa45 = giftedRepo || (await getSetting("\x42\x4f\x54\x5f\x52\x45\x50\x4f")) || "\x47\x75\x72\x75\x68\x54\x65\x63\x68\x2f\x55\x4c\x54\x52\x41\x2d\x47\x55\x52\x55";
            await reply(`🔍 Checking for updates on \`${_0xf2aa45}\`...`);
            const _0x0cc4ca = await getCommitHash();
            const { data: commitData } = await axios.get(
                `https:
                { timeout: 0x4E20 }
            );
            const _0x030898 = commitData.sha;
            if (_0x030898 === _0x0cc4ca) {
                await react("✅");
                return reply(
                    `✅ *Already Up To Date!*\n\n` +
                    `◈ 🏷️ Commit  ⤳ \`${_0x0cc4ca.slice(0, 7)}\`\n` +
                    `◈ 📅 Date    ⤳ ${new Date(commitData.commit.author.date).toLocaleString()}\n` +
                    `◈ 💬 Message ⤳ ${commitData.commit.message}\n\n` +
                    `> _${botFooter}_`
                );
            }
            const _0x237b74 = commitData.commit.author.name;
            const _0x8e36d0 = commitData.commit.message;
            const _0x4b9882 = new Date(commitData.commit.author.date).toLocaleString();
            await reply(
                `🔄 *Update Found! Applying...*\n\n` +
                `◈ 👤 Author   ⤳ ${_0x237b74}\n` +
                `◈ 📅 Date     ⤳ ${_0x4b9882}\n` +
                `◈ 💬 Changes  ⤳ ${_0x8e36d0}\n\n` +
                `_Please wait — bot will restart when done._`
            );
            await runUpdate(_0xf2aa45, Gifted, null);
            await react("✅");
            await reply("✅\x20\x2a\x55\x70\x64\x61\x74\x65\x20\x43\x6f\x6d\x70\x6c\x65\x74\x65\x21\x20\x52\x65\x73\x74\x61\x72\x74\x69\x6e\x67\x20\x6e\x6f\x77\x2e\x2e\x2e\x2a");
            setTimeout(() => process.exit(0), 0x7D0);
        } catch (error) {
            console.error("\x55\x70\x64\x61\x74\x65\x20\x65\x72\x72\x6f\x72\x3a", error);
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
        pattern: "\x63\x68\x65\x63\x6b\x75\x70\x64\x61\x74\x65",
        aliases: ["\x75\x70\x64\x61\x74\x65\x63\x68\x65\x63\x6b", "\x68\x61\x73\x75\x70\x64\x61\x74\x65", "\x75\x70\x64\x61\x74\x65\x73\x74\x61\x74\x75\x73"],
        react: "🔍",
        description: "\x43\x68\x65\x63\x6b\x20\x69\x66\x20\x61\x20\x6e\x65\x77\x20\x62\x6f\x74\x20\x75\x70\x64\x61\x74\x65\x20\x69\x73\x20\x61\x76\x61\x69\x6c\x61\x62\x6c\x65\x20\x77\x69\x74\x68\x6f\x75\x74\x20\x61\x70\x70\x6c\x79\x69\x6e\x67\x20\x69\x74\x2e",
        category: "\x6f\x77\x6e\x65\x72",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter, giftedRepo } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        try {
            await react("🔍");
            const _0xf2aa45 = giftedRepo || (await getSetting("\x42\x4f\x54\x5f\x52\x45\x50\x4f")) || "\x47\x75\x72\x75\x68\x54\x65\x63\x68\x2f\x55\x4c\x54\x52\x41\x2d\x47\x55\x52\x55";
            const _0x0574a7 = await getSetting("\x41\x55\x54\x4f\x5f\x55\x50\x44\x41\x54\x45");
            const _0x0cc4ca = await getCommitHash();
            const { data: commitData } = await axios.get(
                `https:
                { timeout: 0x4E20 }
            );
            const _0x030898 = commitData.sha;
            const _0x457d1a = _0x030898 !== _0x0cc4ca;
            await react(_0x457d1a ? "🆕" : "✅");
            await reply(
                `${_0x457d1a ? "🆕\x20\x2a\x55\x70\x64\x61\x74\x65\x20\x41\x76\x61\x69\x6c\x61\x62\x6c\x65\x21\x2a" : "✅\x20\x2a\x55\x70\x20\x54\x6f\x20\x44\x61\x74\x65\x2a"}\n\n` +
                `◈ 📦 Repo       ⤳ \`${_0xf2aa45}\`\n` +
                `◈ 🔖 Current    ⤳ \`${_0x0cc4ca.slice(0, 7)}\`\n` +
                `◈ 🔖 Latest     ⤳ \`${_0x030898.slice(0, 7)}\`\n` +
                (_0x457d1a
                    ? `◈ 👤 Author     ⤳ ${commitData.commit.author.name}\n` +
                      `◈ 📅 Date       ⤳ ${new Date(commitData.commit.author.date).toLocaleString()}\n` +
                      `◈ 💬 Changes    ⤳ ${commitData.commit.message}\n\n` +
                      `_Run \`.update\` to apply the update._`
                    : ""
                ) +
                `\n◈ 🔁 AutoUpdate ⤳ ${_0x0574a7 === "\x66\x61\x6c\x73\x65" ? "🔴\x20\x4f\x46\x46" : "🟢\x20\x4f\x4e"}\n\n` +
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
        pattern: "\x61\x75\x74\x6f\x75\x70\x64\x61\x74\x65",
        aliases: ["\x73\x65\x74\x61\x75\x74\x6f\x75\x70\x64\x61\x74\x65", "\x74\x6f\x67\x67\x6c\x65\x61\x75\x74\x6f\x75\x70\x64\x61\x74\x65", "\x61\x75\x74\x6f\x75\x70\x64\x61\x74\x65\x73\x65\x74"],
        react: "🔁",
        description: "\x45\x6e\x61\x62\x6c\x65\x20\x6f\x72\x20\x64\x69\x73\x61\x62\x6c\x65\x20\x61\x75\x74\x6f\x6d\x61\x74\x69\x63\x20\x75\x70\x64\x61\x74\x65\x73\x20\x6f\x6e\x20\x72\x65\x73\x74\x61\x72\x74\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x75\x74\x6f\x75\x70\x64\x61\x74\x65\x20\x6f\x6e",
        category: "\x6f\x77\x6e\x65\x72",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x4cac69 = (q || "").toLowerCase().trim();
        if (!["on", "\x6f\x66\x66"].includes(_0x4cac69)) {
            const _0x749c96 = await getSetting("\x41\x55\x54\x4f\x5f\x55\x50\x44\x41\x54\x45");
            return reply(
                `🔁 *Auto-Update Status*\n\n` +
                `◈ Current ⤳ ${_0x749c96 === "\x66\x61\x6c\x73\x65" ? "🔴\x20\x4f\x46\x46" : "🟢\x20\x4f\x4e"}\n\n` +
                `Usage: \`.autoupdate on\` or \`.autoupdate off\`\n\n` +
                `> _${botFooter}_`
            );
        }
        try {
            await setSetting("\x41\x55\x54\x4f\x5f\x55\x50\x44\x41\x54\x45", _0x4cac69 === "on" ? "\x74\x72\x75\x65" : "\x66\x61\x6c\x73\x65");
            await react("✅");
            await reply(
                `${_0x4cac69 === "on" ? "🟢" : "🔴"} *Auto-Update ${_0x4cac69.toUpperCase()}*\n\n` +
                `${_0x4cac69 === "on"
                    ? "\x42\x6f\x74\x20\x77\x69\x6c\x6c\x20\x61\x75\x74\x6f\x6d\x61\x74\x69\x63\x61\x6c\x6c\x79\x20\x63\x68\x65\x63\x6b\x20\x66\x6f\x72\x20\x61\x6e\x64\x20\x61\x70\x70\x6c\x79\x20\x75\x70\x64\x61\x74\x65\x73\x20\x65\x76\x65\x72\x79\x20\x74\x69\x6d\x65\x20\x69\x74\x20\x72\x65\x73\x74\x61\x72\x74\x73\x2e"
                    : "\x42\x6f\x74\x20\x77\x69\x6c\x6c\x20\x6e\x6f\x20\x6c\x6f\x6e\x67\x65\x72\x20\x61\x75\x74\x6f\x2d\x75\x70\x64\x61\x74\x65\x20\x6f\x6e\x20\x72\x65\x73\x74\x61\x72\x74\x2e\x20\x55\x73\x65\x20\x60\x2e\x75\x70\x64\x61\x74\x65\x60\x20\x74\x6f\x20\x75\x70\x64\x61\x74\x65\x20\x6d\x61\x6e\x75\x61\x6c\x6c\x79\x2e"
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
        pattern: "\x72\x65\x73\x65\x74\x75\x70\x64\x61\x74\x65",
        aliases: ["\x63\x6c\x65\x61\x72\x75\x70\x64\x61\x74\x65\x68\x61\x73\x68", "\x66\x6f\x72\x63\x65\x72\x65\x75\x70\x64\x61\x74\x65"],
        react: "🔄",
        description: "\x52\x65\x73\x65\x74\x20\x74\x68\x65\x20\x73\x74\x6f\x72\x65\x64\x20\x75\x70\x64\x61\x74\x65\x20\x68\x61\x73\x68\x20\x74\x6f\x20\x66\x6f\x72\x63\x65\x20\x61\x20\x66\x75\x6c\x6c\x20\x72\x65\x2d\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x6f\x6e\x20\x6e\x65\x78\x74\x20\x72\x65\x73\x74\x61\x72\x74\x2e",
        category: "\x6f\x77\x6e\x65\x72",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        try {
            const { setCommitHash } = require("../guru/database/autoUpdate");
            await setCommitHash("\x75\x6e\x6b\x6e\x6f\x77\x6e");
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
