// ════════════════════════════════════════════════════════════════════════════
//  BUSINESS ADVERTISER — Store & post user business ads
//  Commands: .ads .setad .myad .postad .editad .destad
// ════════════════════════════════════════════════════════════════════════════

"use strict";

const { gmd }    = require("../guru");
const Database   = require("better-sqlite3");
const path       = require("path");
const fs         = require("fs-extra");

// ─── Database Setup ──────────────────────────────────────────────────────────
const DB_DIR = path.join(__dirname, "../guru/database");
fs.ensureDirSync(DB_DIR);

const db = new Database(path.join(DB_DIR, "advertise.db"));
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.exec(`
    CREATE TABLE IF NOT EXISTS business_ads (
        jid      TEXT PRIMARY KEY,
        name     TEXT NOT NULL,
        desc     TEXT NOT NULL,
        contact  TEXT NOT NULL,
        location TEXT NOT NULL,
        hours    TEXT DEFAULT '',
        website  TEXT DEFAULT '',
        posted   INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
    );
`);

const _getAd    = db.prepare("SELECT * FROM business_ads WHERE jid = ?");
const _upsertAd = db.prepare(`
    INSERT INTO business_ads (jid, name, desc, contact, location, hours, website)
    VALUES (@jid, @name, @desc, @contact, @location, @hours, @website)
    ON CONFLICT(jid) DO UPDATE SET
        name=@name, desc=@desc, contact=@contact, location=@location,
        hours=@hours, website=@website, updated_at=unixepoch()
`);
const _editField = db.prepare(`
    UPDATE business_ads SET updated_at=unixepoch() WHERE jid=?
`);
const _incrementPosted = db.prepare(`
    UPDATE business_ads SET posted = posted + 1 WHERE jid = ?
`);
const _deleteAd  = db.prepare("DELETE FROM business_ads WHERE jid = ?");
const _allCount  = db.prepare("SELECT COUNT(*) as total FROM business_ads");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAd(jid) {
    return _getAd.get(jid) || null;
}

function buildAdMessage(ad, pushName, botFooter) {
    const lines = [
        `╔══════════════════════════════╗`,
        `║  📢  *BUSINESS ADVERTISEMENT*`,
        `╚══════════════════════════════╝`,
        ``,
        `🏪 *${ad.name}*`,
        ``,
        `📋 *Services / Description:*`,
        `${ad.desc}`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📞 *Contact:*  ${ad.contact}`,
        `📍 *Location:* ${ad.location}`,
    ];

    if (ad.hours && ad.hours.trim()) lines.push(`⏰ *Hours:*    ${ad.hours}`);
    if (ad.website && ad.website.trim()) lines.push(`🌐 *Website:*  ${ad.website}`);

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);
    lines.push(`> _Advertised via ${botFooter || "ULTRA GURU MD"}_`);

    return lines.join("\n");
}

function buildPreviewMessage(ad) {
    const optional = [];
    if (ad.hours?.trim())   optional.push(`  ⏰ Hours   : ${ad.hours}`);
    if (ad.website?.trim()) optional.push(`  🌐 Website : ${ad.website}`);

    return [
        `📋 *Your Saved Ad:*`,
        ``,
        `  🏪 Name    : ${ad.name}`,
        `  📝 Desc    : ${ad.desc.slice(0, 60)}${ad.desc.length > 60 ? "…" : ""}`,
        `  📞 Contact : ${ad.contact}`,
        `  📍 Location: ${ad.location}`,
        ...optional,
        ``,
        `  📤 Times posted: *${ad.posted}*`,
        ``,
        `Use *.postad* to post this ad here.`,
        `Use *.editad <field> <value>* to edit a field.`,
        `Use *.destad* to delete your ad.`,
    ].join("\n");
}

const FIELD_ALIASES = {
    name: "name", biz: "name", business: "name",
    desc: "desc", description: "desc", services: "desc", about: "desc",
    contact: "contact", phone: "contact", number: "contact", tel: "contact",
    location: "location", address: "location", loc: "location", city: "location",
    hours: "hours", time: "hours", timing: "hours", schedule: "hours",
    website: "website", web: "website", link: "website", url: "website",
};

// ════════════════════════════════════════════════════════════════════════════
//  .ads — Show advertiser menu
// ════════════════════════════════════════════════════════════════════════════

gmd(
    {
        pattern: "ads",
        aliases: ["advertise", "adsmenu", "businessmenu"],
        react: "📢",
        category: "advertise",
        description: "Show the business advertiser menu",
    },
    async (_from, _Guru, conText) => {
        const { reply, react, botPrefix, botFooter, pushName } = conText;
        const p   = botPrefix || ".";
        const total = _allCount.get().total;

        await react("📢");
        await reply(
            `╔══════════════════════════════╗\n` +
            `║  📢  *BUSINESS ADVERTISER*\n` +
            `╚══════════════════════════════╝\n\n` +
            `Promote your business to everyone in any chat!\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `*🛠️ Setup Commands*\n\n` +
            `▸ *${p}setad*\n` +
            `  _Create or update your business ad_\n` +
            `  Format: \`${p}setad Name | Description | Contact | Location\`\n` +
            `  Optional: \`| Working Hours | Website\`\n\n` +
            `▸ *${p}editad <field> <value>*\n` +
            `  _Edit one field of your ad_\n` +
            `  Fields: name, desc, contact, location, hours, website\n\n` +
            `▸ *${p}myad*\n` +
            `  _Preview your saved ad_\n\n` +
            `▸ *${p}destad*\n` +
            `  _Delete your ad_\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `*📤 Posting Commands*\n\n` +
            `▸ *${p}postad*\n` +
            `  _Post your formatted ad in this chat_\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📊 *${total}* business ad(s) registered\n\n` +
            `> *${botFooter || "ULTRA GURU MD"}*`
        );
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .setad — Create or update a business ad
// ════════════════════════════════════════════════════════════════════════════

gmd(
    {
        pattern: "setad",
        aliases: ["createad", "newad", "regad"],
        react: "✍️",
        category: "advertise",
        description: "Create or update your business ad. Usage: .setad Name | Desc | Contact | Location",
    },
    async (_from, _Guru, conText) => {
        const { q, reply, react, sender, botPrefix, botFooter, pushName } = conText;
        const p = botPrefix || ".";

        if (!q || !q.trim()) {
            return reply(
                `✍️ *Create Your Business Ad*\n\n` +
                `*Format (use | to separate fields):*\n\n` +
                `\`\`\`${p}setad Business Name | What you sell/offer | Contact Number | Your Location\`\`\`\n\n` +
                `*With optional fields:*\n` +
                `\`\`\`${p}setad Business Name | Description | Contact | Location | Working Hours | Website\`\`\`\n\n` +
                `*Example:*\n` +
                `\`\`\`${p}setad GuruTech Shop | Phone repairs & accessories | +254700000000 | Nairobi CBD | Mon-Sat 8am-6pm | gurutech.co.ke\`\`\`\n\n` +
                `> _${botFooter || "ULTRA GURU MD"}_`
            );
        }

        const parts = q.split("|").map((p) => p.trim());

        if (parts.length < 4) {
            return reply(
                `❌ *Too few fields.*\n\n` +
                `You need at least: *Name | Description | Contact | Location*\n\n` +
                `Type *${p}setad* (no text) to see the full guide.`
            );
        }

        const [name, desc, contact, location, hours = "", website = ""] = parts;

        if (!name)     return reply("❌ Business *name* cannot be empty.");
        if (!desc)     return reply("❌ Business *description* cannot be empty.");
        if (!contact)  return reply("❌ *Contact* number cannot be empty.");
        if (!location) return reply("❌ *Location* cannot be empty.");

        _upsertAd.run({ jid: sender, name, desc, contact, location, hours, website });

        await react("✅");
        await reply(
            `✅ *Business ad saved!*\n\n` +
            `🏪 *${name}*\n` +
            `📝 ${desc.slice(0, 80)}${desc.length > 80 ? "…" : ""}\n` +
            `📞 ${contact}\n` +
            `📍 ${location}\n` +
            `${hours ? `⏰ ${hours}\n` : ""}` +
            `${website ? `🌐 ${website}\n` : ""}` +
            `\nType *${p}postad* to post your ad in any chat.\n` +
            `Type *${p}myad* to preview your full ad.\n\n` +
            `> _${botFooter || "ULTRA GURU MD"}_`
        );
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .myad — Preview your saved ad
// ════════════════════════════════════════════════════════════════════════════

gmd(
    {
        pattern: "myad",
        aliases: ["viewad", "myads", "checkad"],
        react: "👁️",
        category: "advertise",
        description: "Preview your saved business ad",
    },
    async (_from, _Guru, conText) => {
        const { reply, react, sender, botPrefix, pushName } = conText;
        const p = botPrefix || ".";

        const ad = getAd(sender);
        if (!ad) {
            return reply(
                `❌ You don't have a business ad yet.\n\n` +
                `Type *${p}setad* to create one!`
            );
        }

        await react("👁️");
        await reply(buildPreviewMessage(ad));
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .postad — Post your formatted ad to the current chat
// ════════════════════════════════════════════════════════════════════════════

gmd(
    {
        pattern: "postad",
        aliases: ["postmyad", "sendad", "publishad"],
        react: "📤",
        category: "advertise",
        description: "Post your business ad in this chat",
    },
    async (from, Guru, conText) => {
        const { reply, react, sender, botPrefix, botFooter, pushName } = conText;
        const p = botPrefix || ".";

        const ad = getAd(sender);
        if (!ad) {
            return reply(
                `❌ You don't have a business ad set up yet.\n\n` +
                `Type *${p}setad* to create your ad first.`
            );
        }

        await react("📤");

        const adText = buildAdMessage(ad, pushName, botFooter);

        await Guru.sendMessage(from, { text: adText });
        _incrementPosted.run(sender);

        await react("✅");
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .editad <field> <value> — Edit one field of your ad
// ════════════════════════════════════════════════════════════════════════════

gmd(
    {
        pattern: "editad",
        aliases: ["updatead", "changead", "modifyad"],
        react: "✏️",
        category: "advertise",
        description: "Edit a field of your ad. Usage: .editad name My New Name",
    },
    async (_from, _Guru, conText) => {
        const { q, reply, react, sender, botPrefix } = conText;
        const p = botPrefix || ".";

        if (!q || !q.trim()) {
            return reply(
                `✏️ *Edit Your Ad*\n\n` +
                `Usage: *${p}editad <field> <new value>*\n\n` +
                `*Available fields:*\n` +
                `  • \`name\` — Business name\n` +
                `  • \`desc\` — Description / services\n` +
                `  • \`contact\` — Phone number\n` +
                `  • \`location\` — Address / city\n` +
                `  • \`hours\` — Working hours\n` +
                `  • \`website\` — Website URL\n\n` +
                `*Example:*\n` +
                `\`${p}editad name GuruTech Enterprises\``
            );
        }

        const ad = getAd(sender);
        if (!ad) {
            return reply(`❌ You don't have an ad yet. Type *${p}setad* to create one.`);
        }

        const spaceIdx = q.indexOf(" ");
        if (spaceIdx === -1) {
            return reply(`❌ Please provide a value.\nExample: *${p}editad name My Business*`);
        }

        const rawField = q.slice(0, spaceIdx).toLowerCase();
        const newValue = q.slice(spaceIdx + 1).trim();
        const field    = FIELD_ALIASES[rawField];

        if (!field) {
            return reply(
                `❌ Unknown field: *${rawField}*\n\n` +
                `Valid fields: name, desc, contact, location, hours, website`
            );
        }

        if (!newValue) return reply(`❌ New value cannot be empty.`);

        // Update just the one field using a dynamic query
        db.prepare(`UPDATE business_ads SET ${field} = ?, updated_at = unixepoch() WHERE jid = ?`)
            .run(newValue, sender);

        await react("✅");
        await reply(`✅ *${field}* updated successfully!\n\nNew value: _${newValue}_\n\nType *${p}myad* to preview your full ad.`);
    }
);

// ════════════════════════════════════════════════════════════════════════════
//  .destad — Delete your ad
// ════════════════════════════════════════════════════════════════════════════

gmd(
    {
        pattern: "destad",
        aliases: ["deletead", "removead", "clearad"],
        react: "🗑️",
        category: "advertise",
        description: "Delete your saved business ad",
    },
    async (_from, _Guru, conText) => {
        const { q, reply, react, sender, botPrefix } = conText;
        const p = botPrefix || ".";

        const ad = getAd(sender);
        if (!ad) {
            return reply(`❌ You don't have a saved ad to delete.`);
        }

        // Require confirmation
        if (!q || q.trim().toLowerCase() !== "confirm") {
            return reply(
                `⚠️ *Are you sure you want to delete your ad?*\n\n` +
                `🏪 *${ad.name}*\n` +
                `_This cannot be undone._\n\n` +
                `Type *${p}destad confirm* to permanently delete it.`
            );
        }

        _deleteAd.run(sender);
        await react("🗑️");
        await reply(
            `🗑️ Your business ad *"${ad.name}"* has been deleted.\n\n` +
            `Type *${p}setad* anytime to create a new one.`
        );
    }
);
