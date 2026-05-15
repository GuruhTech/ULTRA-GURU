var _0x0d8bce=(function(_0xc1c66f,_0x177122){return !![]}());var _0xa8f7de=function(){return ![]};
const { gmd } = require("../guru");
const { getSetting, setSetting } = require("../guru/database/settings");
const {
    addGreetingsChat,
    removeGreetingsChat,
    getAllGreetingsChats,
    hasGreetingsChat,
    countGreetingsChats,
} = require("../guru/database/greetings");
const { sendGreeting } = require("../guru/scheduler");
gmd(
    {
        pattern: "\x67\x72\x65\x65\x74\x69\x6e\x67\x73",
        aliases: ["\x67\x72\x65\x65\x74\x69\x6e\x67", "\x67\x6d\x67\x6e", "\x61\x75\x74\x6f\x67\x72\x65\x65\x74"],
        react: "🌅",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x54\x6f\x67\x67\x6c\x65\x20\x61\x75\x74\x6f\x6d\x61\x74\x69\x63\x20\x67\x6f\x6f\x64\x20\x6d\x6f\x72\x6e\x69\x6e\x67\x20\x2f\x20\x67\x6f\x6f\x64\x20\x6e\x69\x67\x68\x74\x20\x62\x72\x6f\x61\x64\x63\x61\x73\x74\x73\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x20\x6f\x6e",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x7ec8b4 = (q || "").toLowerCase().trim();
        if (!["on", "\x6f\x66\x66"].includes(_0x7ec8b4)) {
            const _0x69038c = await getSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x45\x4e\x41\x42\x4c\x45\x44");
            const _0xbcfa7e = (await getSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4d\x5f\x54\x49\x4d\x45")) || "\x30\x36\x3a\x30\x30";
            const _0xf1f440 = (await getSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4e\x5f\x54\x49\x4d\x45")) || "\x32\x32\x3a\x30\x30";
            const _0xfd2805 = await countGreetingsChats();
            return reply(
                `🌅 *Auto Greetings Status*\n\n` +
                `◈ Status  ›  ${_0x69038c === "\x74\x72\x75\x65" ? "🟢\x20\x4f\x4e" : "🔴\x20\x4f\x46\x46"}\n` +
                `◈ Morning  ›  ⏰ ${_0xbcfa7e}\n` +
                `◈ Night    ›  🌙 ${_0xf1f440}\n` +
                `◈ Chats    ›  ${_0xfd2805} registered\n\n` +
                `*Commands:*\n` +
                `◈ \`.greetings on/off\` — toggle\n` +
                `◈ \`.gmtime 0x6:0x0\` — set morning _0x1c07bc\n` +
                `◈ \`.gntime 0x16:0x0\` — set night _0x1c07bc\n` +
                `◈ \`.gmsg <message>\` — custom morning msg\n` +
                `◈ \`.gnmsg <message>\` — custom night msg\n` +
                `◈ \`.addchat\` — add this chat to list\n` +
                `◈ \`.removechat\` — remove this chat\n` +
                `◈ \`.greetchats\` — view all registered _0xa87384\n` +
                `◈ \`.testgm\` / \`.testgn\` — send test greeting now\n\n` +
                `> _${botFooter}_`
            );
        }
        await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x45\x4e\x41\x42\x4c\x45\x44", _0x7ec8b4 === "on" ? "\x74\x72\x75\x65" : "\x66\x61\x6c\x73\x65");
        await react("✅");
        await reply(
            `${_0x7ec8b4 === "on" ? "🟢" : "🔴"} *Auto Greetings ${_0x7ec8b4.toUpperCase()}*\n\n` +
            `${_0x7ec8b4 === "on"
                ? "\x42\x6f\x74\x20\x77\x69\x6c\x6c\x20\x6e\x6f\x77\x20\x73\x65\x6e\x64\x20\x47\x6f\x6f\x64\x20\x4d\x6f\x72\x6e\x69\x6e\x67\x20\x26\x20\x47\x6f\x6f\x64\x20\x4e\x69\x67\x68\x74\x20\x6d\x65\x73\x73\x61\x67\x65\x73\x20\x74\x6f\x20\x61\x6c\x6c\x20\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x63\x68\x61\x74\x73\x20\x64\x61\x69\x6c\x79\x2e"
                : "\x41\x75\x74\x6f\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x20\x68\x61\x76\x65\x20\x62\x65\x65\x6e\x20\x74\x75\x72\x6e\x65\x64\x20\x6f\x66\x66\x2e"
            }\n\n> _${botFooter}_`
        );
    }
);
gmd(
    {
        pattern: "\x67\x6d\x74\x69\x6d\x65",
        aliases: ["\x73\x65\x74\x67\x6d\x74\x69\x6d\x65", "\x6d\x6f\x72\x6e\x69\x6e\x67\x74\x69\x6d\x65"],
        react: "⏰",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x53\x65\x74\x20\x74\x68\x65\x20\x47\x6f\x6f\x64\x20\x4d\x6f\x72\x6e\x69\x6e\x67\x20\x62\x72\x6f\x61\x64\x63\x61\x73\x74\x20\x74\x69\x6d\x65\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x67\x6d\x74\x69\x6d\x65\x20\x30\x36\x3a\x30\x30",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x1c07bc = (q || "").trim();
        if (!_0x1c07bc || !/^\d{1,2}:\d{2}$/.test(_0x1c07bc)) {
            return reply(`❌ Invalid _0x1c07bc format.\nUsage: \`.gmtime 0x6:0x0\` (0x18-hour format)\n\n> _${botFooter}_`);
        }
        await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4d\x5f\x54\x49\x4d\x45", _0x1c07bc);
        await react("✅");
        await reply(`⏰ *Morning Time Set*\n\nGood Morning will be _0xfbdced at *${_0x1c07bc}* daily.\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x67\x6e\x74\x69\x6d\x65",
        aliases: ["\x73\x65\x74\x67\x6e\x74\x69\x6d\x65", "\x6e\x69\x67\x68\x74\x74\x69\x6d\x65"],
        react: "🌙",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x53\x65\x74\x20\x74\x68\x65\x20\x47\x6f\x6f\x64\x20\x4e\x69\x67\x68\x74\x20\x62\x72\x6f\x61\x64\x63\x61\x73\x74\x20\x74\x69\x6d\x65\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x67\x6e\x74\x69\x6d\x65\x20\x32\x32\x3a\x30\x30",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x1c07bc = (q || "").trim();
        if (!_0x1c07bc || !/^\d{1,2}:\d{2}$/.test(_0x1c07bc)) {
            return reply(`❌ Invalid _0x1c07bc format.\nUsage: \`.gntime 0x16:0x0\` (0x18-hour format)\n\n> _${botFooter}_`);
        }
        await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4e\x5f\x54\x49\x4d\x45", _0x1c07bc);
        await react("✅");
        await reply(`🌙 *Night Time Set*\n\nGood Night will be _0xfbdced at *${_0x1c07bc}* daily.\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x67\x6d\x73\x67",
        aliases: ["\x73\x65\x74\x67\x6d\x6d\x73\x67", "\x6d\x6f\x72\x6e\x69\x6e\x67\x6d\x73\x67", "\x73\x65\x74\x6d\x6f\x72\x6e\x69\x6e\x67\x6d\x73\x67"],
        react: "✏️",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x53\x65\x74\x20\x61\x20\x63\x75\x73\x74\x6f\x6d\x20\x47\x6f\x6f\x64\x20\x4d\x6f\x72\x6e\x69\x6e\x67\x20\x6d\x65\x73\x73\x61\x67\x65\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x67\x6d\x73\x67\x20\x47\x6f\x6f\x64\x20\x6d\x6f\x72\x6e\x69\x6e\x67\x20\x66\x61\x6d\x21",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        if (!q) {
            await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4d\x5f\x4d\x53\x47", "");
            await react("✅");
            return reply(`✏️ Morning message reset to default (random).\n\n> _${botFooter}_`);
        }
        await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4d\x5f\x4d\x53\x47", q.trim());
        await react("✅");
        await reply(`✏️ *Morning Message Saved!*\n\n_${q.trim()}_\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x67\x6e\x6d\x73\x67",
        aliases: ["\x73\x65\x74\x67\x6e\x6d\x73\x67", "\x6e\x69\x67\x68\x74\x6d\x73\x67", "\x73\x65\x74\x6e\x69\x67\x68\x74\x6d\x73\x67"],
        react: "✏️",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x53\x65\x74\x20\x61\x20\x63\x75\x73\x74\x6f\x6d\x20\x47\x6f\x6f\x64\x20\x4e\x69\x67\x68\x74\x20\x6d\x65\x73\x73\x61\x67\x65\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x67\x6e\x6d\x73\x67\x20\x53\x77\x65\x65\x74\x20\x64\x72\x65\x61\x6d\x73\x20\x66\x61\x6d\x21",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        if (!q) {
            await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4e\x5f\x4d\x53\x47", "");
            await react("✅");
            return reply(`✏️ Night message reset to default (random).\n\n> _${botFooter}_`);
        }
        await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x47\x4e\x5f\x4d\x53\x47", q.trim());
        await react("✅");
        await reply(`✏️ *Night Message Saved!*\n\n_${q.trim()}_\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x61\x64\x64\x63\x68\x61\x74",
        aliases: ["\x61\x64\x64\x67\x72\x65\x65\x74\x63\x68\x61\x74", "\x72\x65\x67\x69\x73\x74\x65\x72\x67\x72\x65\x65\x74\x63\x68\x61\x74"],
        react: "➕",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x41\x64\x64\x20\x74\x68\x65\x20\x63\x75\x72\x72\x65\x6e\x74\x20\x63\x68\x61\x74\x20\x74\x6f\x20\x74\x68\x65\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x20\x62\x72\x6f\x61\x64\x63\x61\x73\x74\x20\x6c\x69\x73\x74",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x40a83a = await hasGreetingsChat(from);
        if (_0x40a83a) {
            await react("ℹ️");
            return reply(`ℹ️ This chat is _0x40a83a in the greetings list!\n\n> _${botFooter}_`);
        }
        await addGreetingsChat(from);
        await react("✅");
        const _0xfd2805 = await countGreetingsChats();
        await reply(
            `➕ *Chat Added!*\n\nThis chat will now receive daily Good Morning & Good Night messages.\n\n◈ Total registered _0xa87384  ›  ${_0xfd2805}\n\n> _${botFooter}_`
        );
    }
);
gmd(
    {
        pattern: "\x72\x65\x6d\x6f\x76\x65\x63\x68\x61\x74",
        aliases: ["\x72\x65\x6d\x6f\x76\x65\x67\x72\x65\x65\x74\x63\x68\x61\x74", "\x75\x6e\x72\x65\x67\x69\x73\x74\x65\x72\x67\x72\x65\x65\x74\x63\x68\x61\x74"],
        react: "➖",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x52\x65\x6d\x6f\x76\x65\x20\x74\x68\x65\x20\x63\x75\x72\x72\x65\x6e\x74\x20\x63\x68\x61\x74\x20\x66\x72\x6f\x6d\x20\x74\x68\x65\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x20\x62\x72\x6f\x61\x64\x63\x61\x73\x74\x20\x6c\x69\x73\x74",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x2419fb = await hasGreetingsChat(from);
        if (!_0x2419fb) {
            await react("ℹ️");
            return reply(`ℹ️ This chat is not in the greetings list.\n\n> _${botFooter}_`);
        }
        await removeGreetingsChat(from);
        await react("✅");
        await reply(`➖ *Chat Removed!*\n\nThis chat will no longer receive greeting messages.\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x67\x72\x65\x65\x74\x63\x68\x61\x74\x73",
        aliases: ["\x6c\x69\x73\x74\x67\x72\x65\x65\x74\x63\x68\x61\x74\x73", "\x67\x72\x65\x65\x74\x6c\x69\x73\x74"],
        react: "📋",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x4c\x69\x73\x74\x20\x61\x6c\x6c\x20\x63\x68\x61\x74\x73\x20\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x66\x6f\x72\x20\x74\x68\x65\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x20\x62\x72\x6f\x61\x64\x63\x61\x73\x74",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0xa87384 = await getAllGreetingsChats();
        if (!_0xa87384.length) {
            await react("ℹ️");
            return reply(`ℹ️ No _0xa87384 registered yet.\n\nUse \`.addchat\` in any chat to register it.\n\n> _${botFooter}_`);
        }
        const _0xcaf634 = _0xa87384.filter(c => c.type === "dm");
        const _0xb2e732 = _0xa87384.filter(c => c.type === "\x67\x72\x6f\x75\x70");
        let _0xa3f3fd = `📋 *Registered Greetings Chats*\n\n`;
        _0xa3f3fd += `◈ Total  ›  ${_0xa87384.length}\n`;
        _0xa3f3fd += `◈ DMs    ›  ${_0xcaf634.length}\n`;
        _0xa3f3fd += `◈ Groups ›  ${_0xb2e732.length}\n\n`;
        if (_0xb2e732.length) {
            _0xa3f3fd += `*Groups:*\n`;
            _0xb2e732.slice(0, 0xF).forEach((c, i) => { _0xa3f3fd += `${i+1}. \`${c.jid.split("@")[0]}\`\n`; });
            if (_0xb2e732.length > 0xF) _0xa3f3fd += `_...and ${_0xb2e732.length - 0xF} more_\n`;
            _0xa3f3fd += "\n";
        }
        if (_0xcaf634.length) {
            _0xa3f3fd += `*DMs:*\n`;
            _0xcaf634.slice(0, 0xA).forEach((c, i) => { _0xa3f3fd += `${i+1}. \`+${c.jid.split("@")[0]}\`\n`; });
            if (_0xcaf634.length > 0xA) _0xa3f3fd += `_...and ${_0xcaf634.length - 0xA} more_\n`;
        }
        _0xa3f3fd += `\n> _${botFooter}_`;
        await react("✅");
        await reply(_0xa3f3fd);
    }
);
gmd(
    {
        pattern: "\x74\x65\x73\x74\x67\x6d",
        aliases: ["\x73\x65\x6e\x64\x67\x6d", "\x74\x72\x69\x67\x67\x65\x72\x6d\x6f\x72\x6e\x69\x6e\x67"],
        react: "🌅",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x53\x65\x6e\x64\x20\x61\x20\x74\x65\x73\x74\x20\x47\x6f\x6f\x64\x20\x4d\x6f\x72\x6e\x69\x6e\x67\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x20\x74\x6f\x20\x61\x6c\x6c\x20\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x63\x68\x61\x74\x73\x20\x72\x69\x67\x68\x74\x20\x6e\x6f\x77",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0xfd2805 = await countGreetingsChats();
        if (!_0xfd2805) {
            await react("ℹ️");
            return reply(`ℹ️ No _0xa87384 registered. Use \`.addchat\` first.\n\n> _${botFooter}_`);
        }
        await react("⏳");
        await reply(`🌅 Sending Good Morning to ${_0xfd2805} chat(s)...`);
        const _0xfbdced = await sendGreeting(Gifted, "\x6d\x6f\x72\x6e\x69\x6e\x67");
        await react("✅");
        await reply(`✅ Good Morning _0xfbdced to *${_0xfbdced}/${_0xfd2805}* _0xa87384!\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x74\x65\x73\x74\x67\x6e",
        aliases: ["\x73\x65\x6e\x64\x67\x6e", "\x74\x72\x69\x67\x67\x65\x72\x6e\x69\x67\x68\x74\x74\x69\x6d\x65"],
        react: "🌙",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x53\x65\x6e\x64\x20\x61\x20\x74\x65\x73\x74\x20\x47\x6f\x6f\x64\x20\x4e\x69\x67\x68\x74\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x20\x74\x6f\x20\x61\x6c\x6c\x20\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x63\x68\x61\x74\x73\x20\x72\x69\x67\x68\x74\x20\x6e\x6f\x77",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0xfd2805 = await countGreetingsChats();
        if (!_0xfd2805) {
            await react("ℹ️");
            return reply(`ℹ️ No _0xa87384 registered. Use \`.addchat\` first.\n\n> _${botFooter}_`);
        }
        await react("⏳");
        await reply(`🌙 Sending Good Night to ${_0xfd2805} chat(s)...`);
        const _0xfbdced = await sendGreeting(Gifted, "\x6e\x69\x67\x68\x74");
        await react("✅");
        await reply(`✅ Good Night _0xfbdced to *${_0xfbdced}/${_0xfd2805}* _0xa87384!\n\n> _${botFooter}_`);
    }
);
gmd(
    {
        pattern: "\x61\x75\x74\x6f\x74\x72\x61\x63\x6b",
        aliases: ["\x67\x72\x65\x65\x74\x61\x75\x74\x6f\x74\x72\x61\x63\x6b", "\x74\x6f\x67\x67\x6c\x65\x61\x75\x74\x6f\x74\x72\x61\x63\x6b"],
        react: "🔄",
        category: "\x6f\x77\x6e\x65\x72",
        description: "\x54\x6f\x67\x67\x6c\x65\x20\x61\x75\x74\x6f\x2d\x74\x72\x61\x63\x6b\x69\x6e\x67\x20\x6f\x66\x20\x63\x68\x61\x74\x73\x20\x66\x6f\x72\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x2e\x20\x55\x73\x61\x67\x65\x3a\x20\x2e\x61\x75\x74\x6f\x74\x72\x61\x63\x6b\x20\x6f\x6e",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;
        if (!isSuperUser) {
            await react("❌");
            return reply("❌\x20\x4f\x77\x6e\x65\x72\x20\x4f\x6e\x6c\x79\x20\x43\x6f\x6d\x6d\x61\x6e\x64\x21");
        }
        const _0x7ec8b4 = (q || "").toLowerCase().trim();
        if (!["on", "\x6f\x66\x66"].includes(_0x7ec8b4)) {
            const _0x69038c = await getSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x41\x55\x54\x4f\x54\x52\x41\x43\x4b");
            return reply(
                `🔄 *Auto-Track Status*  ›  ${_0x69038c === "\x66\x61\x6c\x73\x65" ? "🔴\x20\x4f\x46\x46" : "🟢\x20\x4f\x4e"}\n\n` +
                `When ON, any chat that messages the bot is automatically added to the greetings list.\n\n` +
                `Usage: \`.autotrack on\` or \`.autotrack off\`\n\n> _${botFooter}_`
            );
        }
        await setSetting("\x47\x52\x45\x45\x54\x49\x4e\x47\x53\x5f\x41\x55\x54\x4f\x54\x52\x41\x43\x4b", _0x7ec8b4 === "on" ? "\x74\x72\x75\x65" : "\x66\x61\x6c\x73\x65");
        await react("✅");
        await reply(
            `${_0x7ec8b4 === "on" ? "🟢" : "🔴"} *Auto-Track ${_0x7ec8b4.toUpperCase()}*\n\n` +
            `${_0x7ec8b4 === "on"
                ? "\x41\x6c\x6c\x20\x63\x68\x61\x74\x73\x20\x74\x68\x61\x74\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x74\x68\x65\x20\x62\x6f\x74\x20\x77\x69\x6c\x6c\x20\x62\x65\x20\x61\x75\x74\x6f\x2d\x72\x65\x67\x69\x73\x74\x65\x72\x65\x64\x20\x66\x6f\x72\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x2e"
                : "\x4f\x6e\x6c\x79\x20\x6d\x61\x6e\x75\x61\x6c\x6c\x79\x20\x61\x64\x64\x65\x64\x20\x63\x68\x61\x74\x73\x20\x28\x76\x69\x61\x20\x2e\x61\x64\x64\x63\x68\x61\x74\x29\x20\x77\x69\x6c\x6c\x20\x72\x65\x63\x65\x69\x76\x65\x20\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x2e"
            }\n\n> _${botFooter}_`
        );
    }
);
