
const { gmd } = require("../guru");
const {
    getLidMapping,
    getGroupMetadata,
} = require("../guru/connection/groupCache");

function getUserName(jid) {
    return jid.split("@")[0];
}

function normalizeUserJid(jid) {
    if (!jid || typeof jid !== "string") return "";

    if (jid.endsWith("@lid")) {
        const mapped = getLidMapping(jid);
        if (mapped) return mapped;
    }

    let normalized = jid.split(":")[0].split("/")[0];
    if (!normalized.includes("@")) {
        normalized += "@s.whatsapp.net";
    }

    if (normalized.endsWith("@lid")) {
        const mapped = getLidMapping(normalized);
        if (mapped) return mapped;
    }

    return normalized;
}

gmd(
    {
        pattern: "onwa",
        aliases: ["onwhatsapp", "checkwa", "checknumber"],
        react: "🔍",
        category: "utility",
        description: "Check if a phone number is registered on WhatsApp",
    },
    async (from, Gifted, conText) => {
        const { sender, mek, reply, react, q, botPrefix } = conText;

        if (!q || q.trim() === "") {
            await react("❌");
            return reply(`❌ Please provide a phone number.

*Usage:* ${botPrefix}onwa <number>
*Example:* ${botPrefix}onwa 254712345678

_Include country code without + or spaces_`);
        }

        const num = q.trim().replace(/[^0-9]/g, "");

        if (num.length < 7 || num.length > 15) {
            await react("❌");
            return reply(`❌ Invalid phone number format.

Please provide a valid number with country code.
*Example:* .onwa 254712345678`);
        }

        await react("⏳");

        try {
            const [result] = await Gifted.onWhatsApp(num);

            if (result && result.exists) {
                await react("✅");
                return reply(`✅ *Number Found on WhatsApp*

📞 *Number:* ${num}
🆔 *JID:* ${result.jid}

_This number is registered on WhatsApp._`);
            } else {
                await react("❌");
                return reply(`❌ *Not on WhatsApp*

📞 *Number:* ${num}

_This number is not registered on WhatsApp._`);
            }
        } catch (err) {
            await react("⚠️");
            return reply(`⚠️ Could not verify if ${num} is on WhatsApp.

Error: ${err.message}

_Please try again later._`);
        }
    },
);

gmd(
    {
        pattern: "vcf",
        aliases: ["contacts", "savecontact", "scontact", "savecontacts"],
        react: "📇",
        category: "group",
        description: "Export all group participants as VCF contact file",
        isGroup: true,
    },
    async (from, Gifted, conText) => {
        const { sender, mek, reply, react } = conText;

        await react("⏳");

        try {
            const groupMetadata = await getGroupMetadata(Gifted, from);
            const participants = groupMetadata?.participants || [];
            const groupName = groupMetadata?.subject || "Group";

            if (participants.length === 0) {
                await react("❌");
                return reply("❌ No participants found in this group.");
            }

            let vcfContent = "";
            let index = 1;

            for (const member of participants) {
                const jid = member.jid || member.pn || member.id;
                if (!jid || typeof jid !== "string") continue;

                const phoneJid = jid.includes("@s.whatsapp.net")
                    ? jid
                    : normalizeUserJid(jid);
                if (!phoneJid || !phoneJid.includes("@s.whatsapp.net"))
                    continue;

                const id = phoneJid.split("@")[0];
                vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:[${index++}] +${id}\nTEL;type=CELL;type=VOICE;waid=${id}:+${id}\nEND:VCARD\n`;
            }

            const count = index - 1;

            if (count === 0) {
                await react("❌");
                return reply(
                    "❌ Could not extract any valid contacts from this group.",
                );
            }

            const fileName = `${groupName}.vcf`;

            await Gifted.sendMessage(
                from,
                {
                    document: Buffer.from(vcfContent.trim(), "utf-8"),
                    mimetype: "text/vcard",
                    fileName: fileName,
                    caption: `Done saving.\nGroup Name: *${groupName}*\nContacts: *${count}*`,
                },
                { quoted: mek },
            );

            await react("✅");
        } catch (err) {
            await react("❌");
            return reply(`❌ Failed to export contacts: ${err.message}`);
        }
    },
);
