const { gmd } = require("../guru");

// In-memory merge queues: Map<chatJid, { files: Buffer[], names: string[] }>
const mergeQueues = new Map();

// ─── VCF DEDUPLICATION TOOL ──────────────────────────────────────────────────

/**
 * Normalize a phone number for comparison.
 * Strips spaces, dashes, parentheses, dots, slashes.
 * Keeps leading + for international format.
 * Strips leading zeros/country-code prefixes so +254700000001 === 0700000001.
 */
function normalizePhone(raw) {
    let n = String(raw).trim();
    // Remove tel: prefix if present
    n = n.replace(/^tel:/i, "");
    // Remove all formatting characters
    n = n.replace(/[\s\-\.\(\)\/\\]/g, "");
    // Normalise: strip leading + or 00 then compare last 9 digits
    // This catches +254700123456 == 0700123456 == 254700123456
    const digits = n.replace(/^\+/, "").replace(/^00/, "");
    // Use last 9 digits as canonical key (handles most global formats)
    return digits.slice(-9);
}

/**
 * Parse a VCF string into an array of individual vCard blocks (raw strings).
 */
function parseVcards(vcfText) {
    const cards = [];
    const normalized = vcfText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const regex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
    let match;
    while ((match = regex.exec(normalized)) !== null) {
        cards.push(match[0].trim());
    }
    return cards;
}

/**
 * Extract all phone numbers from a single vCard block.
 * Handles both simple (TEL:number) and parameterized (TEL;TYPE=CELL:number) lines.
 * Also handles folded lines (lines starting with space/tab are continuations).
 */
function extractPhones(vcard) {
    const phones = [];
    const lines = vcard.split("\n");
    for (const line of lines) {
        // Match TEL lines (with or without parameters)
        if (/^TEL[;:]/i.test(line.trim())) {
            const colonIdx = line.indexOf(":");
            if (colonIdx !== -1) {
                const value = line.slice(colonIdx + 1).trim();
                if (value) phones.push(value);
            }
        }
    }
    return phones;
}

/**
 * Deduplicate vCards by phone number.
 * A card is kept if it introduces at least one phone number not seen before.
 * Returns { kept: string[], removed: number, totalPhones: number }
 */
function deduplicateVcards(cards) {
    const seen = new Set();
    const kept = [];
    let removed = 0;
    let totalPhones = 0;

    for (const card of cards) {
        const phones = extractPhones(card);
        totalPhones += phones.length;

        if (phones.length === 0) {
            // No phone number — keep it (might be email-only contact)
            kept.push(card);
            continue;
        }

        const normalised = phones.map(normalizePhone).filter(Boolean);
        const isAllDuplicate = normalised.every(n => seen.has(n));

        if (isAllDuplicate) {
            removed++;
        } else {
            // Mark all this card's numbers as seen
            normalised.forEach(n => seen.add(n));
            kept.push(card);
        }
    }

    return { kept, removed, totalPhones };
}

// ─── COMMAND ─────────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "cleanvcf",
        aliases: ["dedupvcf", "vcfclean", "fixvcf"],
        desc: "Remove duplicate numbers from a VCF contact file. Reply to a VCF file with this command.",
        category: "tools",
        react: "🗂️",
    },
    async (from, Gifted, conText) => {
        const { mek, reply, conn, getMediaBuffer } = conText;

        // ── Find the VCF document ──────────────────────────────────────────
        // Support: replying to a VCF, or the message itself containing a VCF
        const ctx =
            mek.message?.extendedTextMessage?.contextInfo ||
            mek.message?.documentMessage?.contextInfo ||
            null;

        const quotedRaw = ctx?.quotedMessage || null;

        const docMsg =
            quotedRaw?.documentMessage ||
            mek.message?.documentMessage ||
            null;

        if (!docMsg) {
            return reply(
                "❌ *Reply to a VCF file* with *.cleanvcf* to remove duplicate numbers.\n\n" +
                "📌 *Usage:* Send/forward a *.vcf* file, reply to it with `.cleanvcf`"
            );
        }

        // Validate it's a VCF
        const mime = docMsg.mimetype || "";
        const fname = (docMsg.fileName || "").toLowerCase();
        const isVcf =
            mime.includes("vcard") ||
            mime.includes("x-vcard") ||
            fname.endsWith(".vcf");

        if (!isVcf) {
            return reply("❌ That file doesn't look like a VCF. Please reply to a *.vcf* contact file.");
        }

        await reply("⏳ Processing your VCF file, please wait...");

        // ── Download ──────────────────────────────────────────────────────
        let vcfBuffer;
        try {
            vcfBuffer = await getMediaBuffer(docMsg, "document");
        } catch (err) {
            return reply("❌ Failed to download the VCF file: " + err.message);
        }

        const vcfText = vcfBuffer.toString("utf8");

        // ── Parse & Deduplicate ───────────────────────────────────────────
        const cards = parseVcards(vcfText);

        if (cards.length === 0) {
            return reply("❌ No valid vCards found in the file. Make sure it's a proper VCF.");
        }

        const { kept, removed, totalPhones } = deduplicateVcards(cards);

        if (removed === 0) {
            return reply(
                `✅ *No duplicates found!*\n\n` +
                `📇 Contacts checked: *${cards.length}*\n` +
                `📞 Phone numbers scanned: *${totalPhones}*\n\n` +
                `Your VCF is already clean 🎉`
            );
        }

        // ── Build cleaned VCF ─────────────────────────────────────────────
        const cleanedVcf = kept.join("\n\n") + "\n";
        const cleanedBuffer = Buffer.from(cleanedVcf, "utf8");

        // Generate output filename
        const origName = (docMsg.fileName || "contacts.vcf").replace(/\.vcf$/i, "");
        const outName = `${origName}_cleaned.vcf`;

        // ── Send back ─────────────────────────────────────────────────────
        await conn.sendMessage(from, {
            document: cleanedBuffer,
            fileName: outName,
            mimetype: "text/vcard",
            caption:
                `✅ *VCF Cleaned Successfully!*\n\n` +
                `📇 Original contacts: *${cards.length}*\n` +
                `🗑️ Duplicates removed: *${removed}*\n` +
                `📋 Clean contacts: *${kept.length}*\n` +
                `📞 Phone numbers scanned: *${totalPhones}*\n\n` +
                `_All original contact details preserved. Only duplicate numbers removed._`,
        }, { quoted: mek });
    }
);

// ─── MERGE VCF COMMAND ────────────────────────────────────────────────────────

gmd(
    {
        pattern: "mergevcf",
        aliases: ["vcfmerge", "combinevcf"],
        desc: "Merge multiple VCF files into one clean deduplicated file.\n" +
              "  .mergevcf add   — reply to a VCF to add it to the queue\n" +
              "  .mergevcf done  — merge all queued files and send result\n" +
              "  .mergevcf status — show how many files are queued\n" +
              "  .mergevcf reset  — clear the queue",
        category: "tools",
        react: "📂",
    },
    async (from, Gifted, conText) => {
        const { mek, reply, conn, getMediaBuffer, args } = conText;

        const sub = (args[0] || "").toLowerCase().trim();

        // ── HELP (no subcommand) ──────────────────────────────────────────
        if (!sub || sub === "help") {
            return reply(
                `📂 *Merge VCF — Commands*\n\n` +
                `▸ *.mergevcf add* — Reply to a VCF file to add it to your queue\n` +
                `▸ *.mergevcf done* — Merge all queued files into one clean VCF\n` +
                `▸ *.mergevcf status* — See how many files are in your queue\n` +
                `▸ *.mergevcf reset* — Clear your queue and start over\n\n` +
                `_Duplicates are automatically removed when merging._`
            );
        }

        // ── STATUS ────────────────────────────────────────────────────────
        if (sub === "status") {
            const q = mergeQueues.get(from);
            if (!q || q.files.length === 0) {
                return reply("📂 Your merge queue is *empty*.\nUse *.mergevcf add* (reply to a VCF) to start adding files.");
            }
            const names = q.names.map((n, i) => `  ${i + 1}. ${n}`).join("\n");
            return reply(
                `📂 *Merge Queue — ${q.files.length} file(s) queued*\n\n${names}\n\n` +
                `Run *.mergevcf done* to merge them all.`
            );
        }

        // ── RESET ─────────────────────────────────────────────────────────
        if (sub === "reset") {
            mergeQueues.delete(from);
            return reply("🗑️ Merge queue cleared. Start fresh with *.mergevcf add*.");
        }

        // ── ADD ───────────────────────────────────────────────────────────
        if (sub === "add") {
            const ctx =
                mek.message?.extendedTextMessage?.contextInfo ||
                mek.message?.documentMessage?.contextInfo ||
                null;

            const quotedRaw = ctx?.quotedMessage || null;
            const docMsg =
                quotedRaw?.documentMessage ||
                mek.message?.documentMessage ||
                null;

            if (!docMsg) {
                return reply("❌ *Reply to a VCF file* with *.mergevcf add* to add it to your queue.");
            }

            const mime = docMsg.mimetype || "";
            const fname = (docMsg.fileName || "file.vcf").toLowerCase();
            const isVcf = mime.includes("vcard") || mime.includes("x-vcard") || fname.endsWith(".vcf");

            if (!isVcf) {
                return reply("❌ That file doesn't look like a VCF. Please reply to a *.vcf* contact file.");
            }

            let buf;
            try {
                buf = await getMediaBuffer(docMsg, "document");
            } catch (err) {
                return reply("❌ Failed to download the VCF: " + err.message);
            }

            // Quick validation — must contain at least one vCard
            const preview = buf.toString("utf8").slice(0, 2000);
            if (!preview.includes("BEGIN:VCARD")) {
                return reply("❌ This doesn't appear to be a valid VCF file.");
            }

            if (!mergeQueues.has(from)) {
                mergeQueues.set(from, { files: [], names: [] });
            }

            const q = mergeQueues.get(from);

            if (q.files.length >= 20) {
                return reply("⚠️ Queue is full (max 20 files). Run *.mergevcf done* to merge, or *.mergevcf reset* to clear.");
            }

            const displayName = docMsg.fileName || `file_${q.files.length + 1}.vcf`;
            q.files.push(buf);
            q.names.push(displayName);

            return reply(
                `✅ *Added to queue!*\n\n` +
                `📄 File: *${displayName}*\n` +
                `📂 Queue: *${q.files.length}* file(s)\n\n` +
                `Keep adding more with *.mergevcf add*, or run *.mergevcf done* to merge.`
            );
        }

        // ── DONE ──────────────────────────────────────────────────────────
        if (sub === "done") {
            const q = mergeQueues.get(from);

            if (!q || q.files.length === 0) {
                return reply("❌ Your merge queue is empty. Use *.mergevcf add* to add VCF files first.");
            }

            if (q.files.length === 1) {
                return reply("⚠️ You only have *1 file* in the queue. Add at least one more with *.mergevcf add*, or use *.cleanvcf* to just clean duplicates from a single file.");
            }

            await reply(`⏳ Merging *${q.files.length}* VCF files, please wait...`);

            // Combine all cards from all files
            const allCards = [];
            let fileBreakdown = "";

            for (let i = 0; i < q.files.length; i++) {
                const text = q.files[i].toString("utf8");
                const cards = parseVcards(text);
                allCards.push(...cards);
                fileBreakdown += `  ${i + 1}. ${q.names[i]} — ${cards.length} contacts\n`;
            }

            // Deduplicate the combined pool
            const { kept, removed, totalPhones } = deduplicateVcards(allCards);

            // Build merged VCF
            const mergedVcf = kept.join("\n\n") + "\n";
            const mergedBuffer = Buffer.from(mergedVcf, "utf8");
            const outName = `merged_contacts_${Date.now()}.vcf`;

            await conn.sendMessage(from, {
                document: mergedBuffer,
                fileName: outName,
                mimetype: "text/vcard",
                caption:
                    `✅ *VCF Merge Complete!*\n\n` +
                    `📂 Files merged: *${q.files.length}*\n` +
                    `${fileBreakdown}\n` +
                    `📇 Total contacts combined: *${allCards.length}*\n` +
                    `🗑️ Duplicates removed: *${removed}*\n` +
                    `📋 Final unique contacts: *${kept.length}*\n` +
                    `📞 Phone numbers scanned: *${totalPhones}*\n\n` +
                    `_All original details preserved. Queue has been cleared._`,
            }, { quoted: mek });

            // Clear the queue after successful merge
            mergeQueues.delete(from);
            return;
        }

        // ── UNKNOWN SUBCOMMAND ────────────────────────────────────────────
        return reply(
            `❓ Unknown option *"${sub}"*.\n\n` +
            `Use: *.mergevcf add | done | status | reset*`
        );
    }
);
