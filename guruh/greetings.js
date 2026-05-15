
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
        pattern: "greetings",
        aliases: ["greeting", "gmgn", "autogreet"],
        react: "🌅",
        category: "owner",
        description: "Toggle automatic good morning / good night broadcasts. Usage: .greetings on",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const val = (q || "").toLowerCase().trim();
        if (!["on", "off"].includes(val)) {
            const current = await getSetting("GREETINGS_ENABLED");
            const gmTime = (await getSetting("GREETINGS_GM_TIME")) || "06:00";
            const gnTime = (await getSetting("GREETINGS_GN_TIME")) || "22:00";
            const total = await countGreetingsChats();
            return reply(
                `🌅 *Auto Greetings Status*\n\n` +
                `◈ Status  ›  ${current === "true" ? "🟢 ON" : "🔴 OFF"}\n` +
                `◈ Morning  ›  ⏰ ${gmTime}\n` +
                `◈ Night    ›  🌙 ${gnTime}\n` +
                `◈ Chats    ›  ${total} registered\n\n` +
                `*Commands:*\n` +
                `◈ \`.greetings on/off\` — toggle\n` +
                `◈ \`.gmtime 06:00\` — set morning time\n` +
                `◈ \`.gntime 22:00\` — set night time\n` +
                `◈ \`.gmsg <message>\` — custom morning msg\n` +
                `◈ \`.gnmsg <message>\` — custom night msg\n` +
                `◈ \`.addchat\` — add this chat to list\n` +
                `◈ \`.removechat\` — remove this chat\n` +
                `◈ \`.greetchats\` — view all registered chats\n` +
                `◈ \`.testgm\` / \`.testgn\` — send test greeting now\n\n` +
                `> _${botFooter}_`
            );
        }

        await setSetting("GREETINGS_ENABLED", val === "on" ? "true" : "false");
        await react("✅");
        await reply(
            `${val === "on" ? "🟢" : "🔴"} *Auto Greetings ${val.toUpperCase()}*\n\n` +
            `${val === "on"
                ? "Bot will now send Good Morning & Good Night messages to all registered chats daily."
                : "Auto greetings have been turned off."
            }\n\n> _${botFooter}_`
        );
    }
);

gmd(
    {
        pattern: "gmtime",
        aliases: ["setgmtime", "morningtime"],
        react: "⏰",
        category: "owner",
        description: "Set the Good Morning broadcast time. Usage: .gmtime 06:00",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const time = (q || "").trim();
        if (!time || !/^\d{1,2}:\d{2}$/.test(time)) {
            return reply(`❌ Invalid time format.\nUsage: \`.gmtime 06:00\` (24-hour format)\n\n> _${botFooter}_`);
        }

        await setSetting("GREETINGS_GM_TIME", time);
        await react("✅");
        await reply(`⏰ *Morning Time Set*\n\nGood Morning will be sent at *${time}* daily.\n\n> _${botFooter}_`);
    }
);

gmd(
    {
        pattern: "gntime",
        aliases: ["setgntime", "nighttime"],
        react: "🌙",
        category: "owner",
        description: "Set the Good Night broadcast time. Usage: .gntime 22:00",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const time = (q || "").trim();
        if (!time || !/^\d{1,2}:\d{2}$/.test(time)) {
            return reply(`❌ Invalid time format.\nUsage: \`.gntime 22:00\` (24-hour format)\n\n> _${botFooter}_`);
        }

        await setSetting("GREETINGS_GN_TIME", time);
        await react("✅");
        await reply(`🌙 *Night Time Set*\n\nGood Night will be sent at *${time}* daily.\n\n> _${botFooter}_`);
    }
);

gmd(
    {
        pattern: "gmsg",
        aliases: ["setgmmsg", "morningmsg", "setmorningmsg"],
        react: "✏️",
        category: "owner",
        description: "Set a custom Good Morning message. Usage: .gmsg Good morning fam!",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        if (!q) {
            await setSetting("GREETINGS_GM_MSG", "");
            await react("✅");
            return reply(`✏️ Morning message reset to default (random).\n\n> _${botFooter}_`);
        }

        await setSetting("GREETINGS_GM_MSG", q.trim());
        await react("✅");
        await reply(`✏️ *Morning Message Saved!*\n\n_${q.trim()}_\n\n> _${botFooter}_`);
    }
);

gmd(
    {
        pattern: "gnmsg",
        aliases: ["setgnmsg", "nightmsg", "setnightmsg"],
        react: "✏️",
        category: "owner",
        description: "Set a custom Good Night message. Usage: .gnmsg Sweet dreams fam!",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        if (!q) {
            await setSetting("GREETINGS_GN_MSG", "");
            await react("✅");
            return reply(`✏️ Night message reset to default (random).\n\n> _${botFooter}_`);
        }

        await setSetting("GREETINGS_GN_MSG", q.trim());
        await react("✅");
        await reply(`✏️ *Night Message Saved!*\n\n_${q.trim()}_\n\n> _${botFooter}_`);
    }
);

gmd(
    {
        pattern: "addchat",
        aliases: ["addgreetchat", "registergreetchat"],
        react: "➕",
        category: "owner",
        description: "Add the current chat to the greetings broadcast list",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const already = await hasGreetingsChat(from);
        if (already) {
            await react("ℹ️");
            return reply(`ℹ️ This chat is already in the greetings list!\n\n> _${botFooter}_`);
        }

        await addGreetingsChat(from);
        await react("✅");
        const total = await countGreetingsChats();
        await reply(
            `➕ *Chat Added!*\n\nThis chat will now receive daily Good Morning & Good Night messages.\n\n◈ Total registered chats  ›  ${total}\n\n> _${botFooter}_`
        );
    }
);

gmd(
    {
        pattern: "removechat",
        aliases: ["removegreetchat", "unregistergreetchat"],
        react: "➖",
        category: "owner",
        description: "Remove the current chat from the greetings broadcast list",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const exists = await hasGreetingsChat(from);
        if (!exists) {
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
        pattern: "greetchats",
        aliases: ["listgreetchats", "greetlist"],
        react: "📋",
        category: "owner",
        description: "List all chats registered for the greetings broadcast",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const chats = await getAllGreetingsChats();
        if (!chats.length) {
            await react("ℹ️");
            return reply(`ℹ️ No chats registered yet.\n\nUse \`.addchat\` in any chat to register it.\n\n> _${botFooter}_`);
        }

        const dms = chats.filter(c => c.type === "dm");
        const groups = chats.filter(c => c.type === "group");

        let txt = `📋 *Registered Greetings Chats*\n\n`;
        txt += `◈ Total  ›  ${chats.length}\n`;
        txt += `◈ DMs    ›  ${dms.length}\n`;
        txt += `◈ Groups ›  ${groups.length}\n\n`;

        if (groups.length) {
            txt += `*Groups:*\n`;
            groups.slice(0, 15).forEach((c, i) => { txt += `${i+1}. \`${c.jid.split("@")[0]}\`\n`; });
            if (groups.length > 15) txt += `_...and ${groups.length - 15} more_\n`;
            txt += "\n";
        }

        if (dms.length) {
            txt += `*DMs:*\n`;
            dms.slice(0, 10).forEach((c, i) => { txt += `${i+1}. \`+${c.jid.split("@")[0]}\`\n`; });
            if (dms.length > 10) txt += `_...and ${dms.length - 10} more_\n`;
        }

        txt += `\n> _${botFooter}_`;
        await react("✅");
        await reply(txt);
    }
);

gmd(
    {
        pattern: "testgm",
        aliases: ["sendgm", "triggermorning"],
        react: "🌅",
        category: "owner",
        description: "Send a test Good Morning greeting to all registered chats right now",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const total = await countGreetingsChats();
        if (!total) {
            await react("ℹ️");
            return reply(`ℹ️ No chats registered. Use \`.addchat\` first.\n\n> _${botFooter}_`);
        }

        await react("⏳");
        await reply(`🌅 Sending Good Morning to ${total} chat(s)...`);
        const sent = await sendGreeting(Gifted, "morning");
        await react("✅");
        await reply(`✅ Good Morning sent to *${sent}/${total}* chats!\n\n> _${botFooter}_`);
    }
);

gmd(
    {
        pattern: "testgn",
        aliases: ["sendgn", "triggernighttime"],
        react: "🌙",
        category: "owner",
        description: "Send a test Good Night greeting to all registered chats right now",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const total = await countGreetingsChats();
        if (!total) {
            await react("ℹ️");
            return reply(`ℹ️ No chats registered. Use \`.addchat\` first.\n\n> _${botFooter}_`);
        }

        await react("⏳");
        await reply(`🌙 Sending Good Night to ${total} chat(s)...`);
        const sent = await sendGreeting(Gifted, "night");
        await react("✅");
        await reply(`✅ Good Night sent to *${sent}/${total}* chats!\n\n> _${botFooter}_`);
    }
);

gmd(
    {
        pattern: "autotrack",
        aliases: ["greetautotrack", "toggleautotrack"],
        react: "🔄",
        category: "owner",
        description: "Toggle auto-tracking of chats for greetings. Usage: .autotrack on",
    },
    async (from, Gifted, conText) => {
        const { react, reply, isSuperUser, q, botFooter } = conText;

        if (!isSuperUser) {
            await react("❌");
            return reply("❌ Owner Only Command!");
        }

        const val = (q || "").toLowerCase().trim();
        if (!["on", "off"].includes(val)) {
            const current = await getSetting("GREETINGS_AUTOTRACK");
            return reply(
                `🔄 *Auto-Track Status*  ›  ${current === "false" ? "🔴 OFF" : "🟢 ON"}\n\n` +
                `When ON, any chat that messages the bot is automatically added to the greetings list.\n\n` +
                `Usage: \`.autotrack on\` or \`.autotrack off\`\n\n> _${botFooter}_`
            );
        }

        await setSetting("GREETINGS_AUTOTRACK", val === "on" ? "true" : "false");
        await react("✅");
        await reply(
            `${val === "on" ? "🟢" : "🔴"} *Auto-Track ${val.toUpperCase()}*\n\n` +
            `${val === "on"
                ? "All chats that message the bot will be auto-registered for greetings."
                : "Only manually added chats (via .addchat) will receive greetings."
            }\n\n> _${botFooter}_`
        );
    }
);
