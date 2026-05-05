
const { gmd } = require("../guru");
const { getGroupSetting, setGroupSetting } = require("../guru/database/groupSettings");
const { getSetting, setSetting } = require("../guru/database/settings");

const OWNER_ONLY = true;
const ADMIN_ONLY = true;

const isGroupAdmin = async (Gifted, jid, senderJid) => {
    try {
        const meta = await Gifted.groupMetadata(jid);
        const senderNum = (senderJid || "").split("@")[0].split(":")[0];
        const participant = meta.participants.find(
            (p) => p.id.split("@")[0].split(":")[0] === senderNum
        );
        return participant?.admin ? true : false;
    } catch (_) {
        return false;
    }
};

const formatLockStatus = async (jid) => {
    const keys = {
        LOCK_TEXT: "Text",
        LOCK_MEDIA: "Media",
        LOCK_STICKERS: "Stickers",
        LOCK_GIF: "GIFs",
        LOCK_VIDEO: "Videos",
        LOCK_VOICE: "Voice",
        LOCK_AUDIO: "Audio",
        LOCK_DOCS: "Documents",
        LOCK_POLLS: "Polls",
        LOCK_VIEWONCE: "View-once",
        LOCK_CONTACTS: "Contacts",
        LOCK_LOCATION: "Location",
        SLOWMODE: "Slow mode",
        ANTISPAM: "Anti-spam",
    };
    let lines = [];
    for (const [key, label] of Object.entries(keys)) {
        const val = await getGroupSetting(jid, key);
        if (key === "SLOWMODE") {
            const secs = parseInt(val) || 0;
            lines.push(`◈ ${secs > 0 ? "⏳" : "✅"} ${label.padEnd(12)} ⤳ ${secs > 0 ? `${secs}s` : "off"}`);
        } else {
            lines.push(`◈ ${val === "true" ? "🔒" : "🔓"} ${label.padEnd(12)} ⤳ ${val === "true" ? "locked" : "open"}`);
        }
    }
    return lines.join("\n");
};

gmd(
    {
        pattern: "restrictions",
        aliases: ["locks", "grouplock"],
        react: "🔒",
        description: "View all current group restrictions",
        category: "group",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isGroup, jid } = conText;
        if (!isGroup) return reply("❌ This command is for groups only.");
        await react("🔒");
        const statusBlock = await formatLockStatus(jid);
        reply(`🔒 *GROUP RESTRICTIONS*\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n${statusBlock}\n\n> Use \`.lockall\` or \`.unlockall\` for bulk toggle.`);
    }
);

const makeLockCmd = (pattern, key, label, emoji) => {
    gmd(
        {
            pattern,
            react: "🔒",
            description: `Lock ${label} messages in this group`,
            category: "group",
        },
        async (from, Gifted, conText) => {
            const { reply, react, isGroup, jid, sender } = conText;
            if (!isGroup) return reply("❌ Groups only.");
            if (!(await isGroupAdmin(Gifted, jid, sender))) return reply("❌ You must be an admin to use this.");
            await setGroupSetting(jid, key, "true");
            await react("🔒");
            reply(`${emoji} *${label}* messages are now *locked* in this group.\nNon-admins cannot send ${label.toLowerCase()} messages.`);
        }
    );
};

const makeUnlockCmd = (pattern, key, label, emoji) => {
    gmd(
        {
            pattern,
            react: "🔓",
            description: `Unlock ${label} messages in this group`,
            category: "group",
        },
        async (from, Gifted, conText) => {
            const { reply, react, isGroup, jid, sender } = conText;
            if (!isGroup) return reply("❌ Groups only.");
            if (!(await isGroupAdmin(Gifted, jid, sender))) return reply("❌ You must be an admin to use this.");
            await setGroupSetting(jid, key, "false");
            await react("🔓");
            reply(`${emoji} *${label}* messages are now *unlocked* in this group.`);
        }
    );
};

makeLockCmd("locktext", "LOCK_TEXT", "Text", "📝");
makeUnlockCmd("unlocktext", "LOCK_TEXT", "Text", "📝");

makeLockCmd("lockmedia", "LOCK_MEDIA", "Media", "📸");
makeUnlockCmd("unlockmedia", "LOCK_MEDIA", "Media", "📸");

makeLockCmd("lockstickers", "LOCK_STICKERS", "Stickers", "🖼️");
makeUnlockCmd("unlockstickers", "LOCK_STICKERS", "Stickers", "🖼️");

makeLockCmd("lockgifs", "LOCK_GIF", "GIFs", "🎞️");
makeUnlockCmd("unlockgifs", "LOCK_GIF", "GIFs", "🎞️");

makeLockCmd("lockvideos", "LOCK_VIDEO", "Videos", "🎥");
makeUnlockCmd("unlockvideos", "LOCK_VIDEO", "Videos", "🎥");

makeLockCmd("lockvoice", "LOCK_VOICE", "Voice messages", "🎙️");
makeUnlockCmd("unlockvoice", "LOCK_VOICE", "Voice messages", "🎙️");

makeLockCmd("lockaudio", "LOCK_AUDIO", "Audio", "🎵");
makeUnlockCmd("unlockaudio", "LOCK_AUDIO", "Audio", "🎵");

makeLockCmd("lockdocs", "LOCK_DOCS", "Documents", "📄");
makeUnlockCmd("unlockdocs", "LOCK_DOCS", "Documents", "📄");

makeLockCmd("lockpolls", "LOCK_POLLS", "Polls", "📊");
makeUnlockCmd("unlockpolls", "LOCK_POLLS", "Polls", "📊");

makeLockCmd("lockviewonce", "LOCK_VIEWONCE", "View-once", "👁️");
makeUnlockCmd("unlockviewonce", "LOCK_VIEWONCE", "View-once", "👁️");

makeLockCmd("lockcontacts", "LOCK_CONTACTS", "Contacts", "📞");
makeUnlockCmd("unlockcontacts", "LOCK_CONTACTS", "Contacts", "📞");

makeLockCmd("locklocation", "LOCK_LOCATION", "Location", "📍");
makeUnlockCmd("unlocklocation", "LOCK_LOCATION", "Location", "📍");

gmd(
    {
        pattern: "lockall",
        react: "🔒",
        description: "Lock all message types in this group",
        category: "group",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isGroup, jid, sender } = conText;
        if (!isGroup) return reply("❌ Groups only.");
        if (!(await isGroupAdmin(Gifted, jid, sender))) return reply("❌ Admin only.");
        const keys = ["LOCK_TEXT","LOCK_MEDIA","LOCK_STICKERS","LOCK_GIF","LOCK_VIDEO","LOCK_VOICE","LOCK_AUDIO","LOCK_DOCS","LOCK_POLLS","LOCK_VIEWONCE","LOCK_CONTACTS","LOCK_LOCATION"];
        for (const k of keys) await setGroupSetting(jid, k, "true");
        await react("🔒");
        reply("🔒 *ALL* message types are now *locked*.\nOnly admins can send messages.");
    }
);

gmd(
    {
        pattern: "unlockall",
        react: "🔓",
        description: "Unlock all message types in this group",
        category: "group",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isGroup, jid, sender } = conText;
        if (!isGroup) return reply("❌ Groups only.");
        if (!(await isGroupAdmin(Gifted, jid, sender))) return reply("❌ Admin only.");
        const keys = ["LOCK_TEXT","LOCK_MEDIA","LOCK_STICKERS","LOCK_GIF","LOCK_VIDEO","LOCK_VOICE","LOCK_AUDIO","LOCK_DOCS","LOCK_POLLS","LOCK_VIEWONCE","LOCK_CONTACTS","LOCK_LOCATION"];
        for (const k of keys) await setGroupSetting(jid, k, "false");
        await react("🔓");
        reply("🔓 *ALL* message types are now *unlocked*.");
    }
);

gmd(
    {
        pattern: "slowmode",
        react: "⏳",
        description: "Set slow mode delay in seconds (0 = off) — e.g. .slowmode 10",
        category: "group",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isGroup, jid, sender, q } = conText;
        if (!isGroup) return reply("❌ Groups only.");
        if (!(await isGroupAdmin(Gifted, jid, sender))) return reply("❌ Admin only.");

        const secs = parseInt(q);
        if (isNaN(secs) || secs < 0) return reply("❌ Please provide a valid number of seconds.\nExample: `.slowmode 10` or `.slowmode 0` to disable.");

        await setGroupSetting(jid, "SLOWMODE", secs.toString());
        await react(secs > 0 ? "⏳" : "✅");
        reply(secs > 0
            ? `⏳ Slow mode set to *${secs} seconds*.\nMembers must wait ${secs}s between messages.`
            : `✅ Slow mode has been *disabled*.`
        );
    }
);

gmd(
    {
        pattern: "antispam",
        react: "🚫",
        description: "Toggle anti-spam duplicate message detection — .antispam on/off",
        category: "group",
    },
    async (from, Gifted, conText) => {
        const { reply, react, isGroup, jid, sender, q } = conText;
        if (!isGroup) return reply("❌ Groups only.");
        if (!(await isGroupAdmin(Gifted, jid, sender))) return reply("❌ Admin only.");

        const action = (q || "").trim().toLowerCase();
        if (!["on", "off"].includes(action)) return reply("❌ Usage: `.antispam on` or `.antispam off`");

        await setGroupSetting(jid, "ANTISPAM", action === "on" ? "true" : "false");
        await react(action === "on" ? "🚫" : "✅");
        reply(action === "on"
            ? "🚫 *Anti-spam* is now *ON*. Duplicate messages will be deleted."
            : "✅ *Anti-spam* has been turned *OFF*."
        );
    }
);

gmd(
    {
        pattern: "dmpermit",
        aliases: ["pmpermit"],
        react: "📩",
        description: "Toggle DM (PM) permit mode — only approved contacts can DM bot",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["on", "off"].includes(action)) return reply("❌ Usage: `.dmpermit on` or `.dmpermit off`");

        await setSetting("DM_PERMIT", action === "on" ? "true" : "false");
        await react(action === "on" ? "🔒" : "🔓");
        reply(action === "on"
            ? "🔒 *DM Permit* is now *ON*.\nOnly whitelisted contacts can message this bot in DMs."
            : "🔓 *DM Permit* is now *OFF*. Anyone can DM the bot."
        );
    }
);

gmd(
    {
        pattern: "dmpermitmsg",
        aliases: ["pmpermitmsg", "setdmmsg"],
        react: "📩",
        description: "Set the message shown to blocked DM senders — .dmpermitmsg Your message",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        if (!q) return reply("❌ Please provide a message.\nExample: `.dmpermitmsg Only approved contacts can DM this bot.`");

        await setSetting("DM_PERMIT_MSG", q.trim());
        await react("✅");
        reply(`✅ *DM permit message* updated:\n\n_${q.trim()}_`);
    }
);

gmd(
    {
        pattern: "dmpermitaction",
        aliases: ["pmpermitaction"],
        react: "📩",
        description: "Set action for blocked DMs: warn or block — .dmpermitaction warn/block",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const action = (q || "").trim().toLowerCase();
        if (!["warn", "block"].includes(action)) return reply("❌ Usage: `.dmpermitaction warn` or `.dmpermitaction block`");

        await setSetting("DM_PERMIT_ACTION", action);
        await react("✅");
        reply(`✅ DM permit action set to *${action.toUpperCase()}*.\n${action === "block" ? "Unapproved DM senders will be *blocked*." : "Unapproved DM senders will receive a *warning message*."}`);
    }
);

gmd(
    {
        pattern: "dmwhitelist",
        aliases: ["pmpermitwhitelist"],
        react: "📋",
        description: "Manage DM whitelist — .dmwhitelist add/remove/list <number>",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react, q } = conText;
        const args = (q || "").trim().split(" ");
        const subCmd = args[0]?.toLowerCase();
        const number = (args[1] || "").replace(/[^0-9]/g, "");

        const whitelistRaw = (await getSetting("DM_WHITELIST")) || "";
        let whitelist = whitelistRaw ? whitelistRaw.split(",").map((n) => n.trim()).filter(Boolean) : [];

        if (subCmd === "add") {
            if (!number) return reply("❌ Please provide a number.\nExample: `.dmwhitelist add 2348012345678`");
            if (!whitelist.includes(number)) whitelist.push(number);
            await setSetting("DM_WHITELIST", whitelist.join(","));
            await react("✅");
            return reply(`✅ *+${number}* added to the DM whitelist.\nThey can now DM this bot freely.`);
        }

        if (subCmd === "remove") {
            if (!number) return reply("❌ Please provide a number.\nExample: `.dmwhitelist remove 2348012345678`");
            whitelist = whitelist.filter((n) => n !== number);
            await setSetting("DM_WHITELIST", whitelist.join(","));
            await react("✅");
            return reply(`✅ *+${number}* removed from the DM whitelist.`);
        }

        if (subCmd === "list") {
            await react("📋");
            if (!whitelist.length) return reply("📋 DM whitelist is *empty*.");
            return reply(`📋 *DM Whitelist* (${whitelist.length} contacts)\n\n` + whitelist.map((n, i) => `${i + 1}. +${n}`).join("\n"));
        }

        reply("❌ Usage:\n`.dmwhitelist add <number>`\n`.dmwhitelist remove <number>`\n`.dmwhitelist list`");
    }
);

gmd(
    {
        pattern: "dmstatus",
        aliases: ["pmpermitinfo"],
        react: "📩",
        description: "View current DM permit configuration",
        category: "settings",
        ownerOnly: OWNER_ONLY,
    },
    async (from, Gifted, conText) => {
        const { reply, react } = conText;
        const dmPermit = (await getSetting("DM_PERMIT")) || "false";
        const dmAction = (await getSetting("DM_PERMIT_ACTION")) || "warn";
        const dmMsg = (await getSetting("DM_PERMIT_MSG")) || "_Not set_";
        const dmWhitelistRaw = (await getSetting("DM_WHITELIST")) || "";
        const dmWhitelist = dmWhitelistRaw ? dmWhitelistRaw.split(",").filter(Boolean) : [];

        await react("📩");
        reply(
`📩 *DM PERMIT STATUS*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍

◈ 🔒 DM Permit    ⤳ ${dmPermit === "true" ? "*ON*" : "*OFF*"}
◈ ⚡ Action       ⤳ ${dmAction.toUpperCase()}
◈ 💬 Reject Msg  ⤳ ${dmMsg.length > 40 ? dmMsg.substring(0, 40) + "…" : dmMsg}
◈ 📋 Whitelist   ⤳ ${dmWhitelist.length} contacts

> Use \`.dmwhitelist list\` to see whitelisted numbers.`
        );
    }
);
