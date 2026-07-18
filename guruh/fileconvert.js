"use strict";

const AdmZip = require("adm-zip");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const fsA = require("node:fs");

const path = require("path");
const { gmd } = require("../guru");

const ROOT = path.resolve(__dirname, "..");

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function safePath(target) {
    const resolved = path.resolve(ROOT, target);
    if (!resolved.startsWith(ROOT)) return null;
    return resolved;
}

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (c) => chunks.push(c));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

function expandTargets(targets) {
    const files = [];
    for (const t of targets) {
        const fp = safePath(t);
        if (!fp) continue;
        if (!fsA.existsSync(fp)) continue;
        const stat = fsA.statSync(fp);
        if (stat.isDirectory()) {
            const entries = fsA.readdirSync(fp, { withFileTypes: true });
            for (const e of entries) {
                if (e.isFile()) files.push({ disk: path.join(fp, e.name), arc: path.join(t, e.name) });
            }
        } else {
            files.push({ disk: fp, arc: t });
        }
    }
    return files;
}

// ─── .tozip ──────────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "tozip",
        aliases: ["zipfile", "zipscript", "makezip"],
        react: "🗜️",
        category: "owner",
        description: "Pack one or more files/folders into a zip. Usage: .tozip <file1> <file2> ... OR .tozip scripts (all bot scripts)",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, mek, args } = conText;
        if (!isSuperUser) return reply("❌ Owner/Sudo only.");

        const raw = args.join(" ").trim();

        if (!raw) {
            return reply(
                "🗜️ *Zip Creator*\n\n" +
                "Usage: `.tozip <file or folder>`\n\n" +
                "*Examples:*\n" +
                "• `.tozip guru/config.js` — single file\n" +
                "• `.tozip guruh/owner2.js guruh/togstatus.js` — multiple files\n" +
                "• `.tozip guruh` — entire folder\n" +
                "• `.tozip scripts` — all bot .js scripts\n" +
                "• `.tozip all` — whole bot (excl. node_modules)"
            );
        }

        await react("⏳");

        let targets = raw.split(/\s+/).filter(Boolean);

        // Special keywords
        if (targets[0] === "scripts") {
            targets = ["guru", "guruh", "index.js"];
        } else if (targets[0] === "all") {
            targets = ["guru", "guruh", "index.js", "package.json"];
        }

        const files = expandTargets(targets);

        if (files.length === 0) {
            await react("❌");
            return reply("❌ No readable files found for those targets.\n\nTip: Use `.viewscript list` to see available files.");
        }

        try {
            const zip = new AdmZip();

            for (const { disk, arc } of files) {
                const dir = path.dirname(arc);
                const name = path.basename(arc);
                zip.addLocalFile(disk, dir === "." ? "" : dir, name);
            }

            const zipBuffer = zip.toBuffer();
            const zipName = `ultraguru_${targets[0].replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.zip`;

            await Guru.sendMessage(
                from,
                {
                    document: zipBuffer,
                    mimetype: "application/zip",
                    fileName: zipName,
                    caption: `🗜️ *${zipName}*\n📦 ${files.length} file(s) packed`,
                },
                { quoted: mek }
            );

            await react("✅");
        } catch (err) {
            await react("❌");
            await reply(`❌ Zip failed: ${err.message}`);
        }
    }
);

// ─── .topdf ──────────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "topdf",
        aliases: ["scripttopdf", "filetopdf", "makepdf"],
        react: "📑",
        category: "owner",
        description: "Convert a script/text file to a PDF document. Usage: .topdf <file>",
    },
    async (from, Guru, conText) => {
        const { reply, react, isSuperUser, mek, args } = conText;
        if (!isSuperUser) return reply("❌ Owner/Sudo only.");

        const target = args.join(" ").trim();

        if (!target) {
            return reply(
                "📑 *PDF Converter*\n\n" +
                "Usage: `.topdf <file>`\n\n" +
                "*Examples:*\n" +
                "• `.topdf guru/config.js`\n" +
                "• `.topdf guruh/owner2.js`\n" +
                "• `.topdf index.js`\n" +
                "• `.topdf package.json`"
            );
        }

        const filePath = safePath(target);
        if (!filePath) {
            await react("❌");
            return reply("❌ Access denied — path is outside the bot directory.");
        }

        if (!fsA.existsSync(filePath) || fsA.statSync(filePath).isDirectory()) {
            await react("❌");
            return reply(`❌ File not found or is a directory: \`${target}\`\n\nUse \`.viewscript list\` to see available files.`);
        }

        await react("⏳");

        try {
            const content = fsA.readFileSync(filePath, "utf8");
            const lines = content.split("\n");

            const doc = new PDFDocument({ margin: 40, size: "A4" });
            const passThrough = new PassThrough();
            const bufferPromise = streamToBuffer(passThrough);
            doc.pipe(passThrough);

            // Header
            doc.fontSize(11).font("Courier-Bold").fillColor("#1a1a2e")
                .text(`ULTRA GURU MD — ${target}`, { align: "center" });
            doc.moveDown(0.3);
            doc.fontSize(8).font("Courier").fillColor("#555555")
                .text(`Generated: ${new Date().toUTCString()}  |  Lines: ${lines.length}`, { align: "center" });
            doc.moveDown(0.5);
            doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#cccccc").stroke();
            doc.moveDown(0.5);

            // Content — line by line for proper wrapping
            doc.fontSize(7.5).font("Courier").fillColor("#000000");
            for (const line of lines) {
                doc.text(line || " ", { lineBreak: true, lineGap: 1 });
            }

            doc.end();

            const pdfBuffer = await bufferPromise;
            const pdfName = path.basename(target).replace(/\.[^.]+$/, "") + `_${Date.now()}.pdf`;

            await Guru.sendMessage(
                from,
                {
                    document: pdfBuffer,
                    mimetype: "application/pdf",
                    fileName: pdfName,
                    caption: `📑 *${pdfName}*\n📄 ${lines.length} lines converted from \`${target}\``,
                },
                { quoted: mek }
            );

            await react("✅");
        } catch (err) {
            await react("❌");
            await reply(`❌ PDF conversion failed: ${err.message}`);
        }
    }
);
