"use strict";

const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const baileys = require("@whiskeysockets/baileys");
const { gmd } = require("../guru");

// ─── COLOR MAP (hex) ─────────────────────────────────────────────────────────
const COLORS = {
    blue: "#34B7F1",
    green: "#25D366",
    yellow: "#FFD700",
    orange: "#FF8C00",
    red: "#FF3B30",
    purple: "#9C27B0",
    gray: "#9E9E9E",
    black: "#000000",
    white: "#FFFFFF",
    cyan: "#00BCD4",
};

// ─── COMMAND ─────────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "togstatus",
        aliases: ["swgc", "groupstatus", "tostatus", "postgroups"],
        react: "📡",
        category: "group",
        description: "Send text / image / video / audio as group status (admin only). Use 'all' to post to every group (owner only).",
    },
    async (from, Guru, conText) => {
        const { reply, react, mek, isGroup, isSuperUser, newsletterJid, botName, botFooter, botPrefix } = conText;

        if (!isGroup) return reply("❌ This command only works in groups!");

        const contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid || "120363408668355773@newsletter",
                newsletterName: botName || "ULTRA GURU MD",
                serverMessageId: 143,
            },
            mentionedJid: [mek.key.participant || from],
        };

        const quickReply = (text) =>
            Guru.sendMessage(from, { text, contextInfo }, { quoted: mek });

        try {
            // ── ADMIN CHECK ──────────────────────────────────────────────────
            const groupMeta = await Guru.groupMetadata(from);
            const senderJid = mek.key.participant || from;
            const senderInfo = groupMeta.participants.find(p => p.id === senderJid);
            const isGroupAdmin = senderInfo?.admin === "admin" || senderInfo?.admin === "superadmin";
            if (!isGroupAdmin && !isSuperUser) {
                return quickReply("❌ Only group admins can post group status updates!");
            }

            const raw = conText.args.join(" ").trim();

            // Check for "all" broadcast mode (owner only)
            const broadcastAll = raw.toLowerCase().startsWith("all") && isSuperUser;
            const rest = broadcastAll ? raw.slice(3).trim() : raw;

            let [caption, color, groupUrl] = rest.split("|").map((v) => v?.trim());

            // Resolve target group (optional external link)
            let targetGroupId = from;
            if (groupUrl) {
                try {
                    const code = groupUrl.split("/").pop().split("?")[0];
                    const info = await Guru.groupGetInviteInfo(code);
                    targetGroupId = info.id;
                    await quickReply(`🎯 Target group: *${info.subject}*`);
                } catch {
                    return quickReply("❌ Invalid group link or bot is not in that group.");
                }
            }

            // Detect quoted message
            const quoted =
                mek.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                (mek.message?.imageMessage ? mek.message : null) ||
                (mek.message?.videoMessage ? mek.message : null) ||
                (mek.message?.audioMessage ? mek.message : null);

            const hasMedia =
                quoted &&
                (quoted.imageMessage || quoted.videoMessage || quoted.audioMessage);

            // ── BUILD RAW SEND OPTIONS ───────────────────────────────────────
            // We use sendMessage('status@broadcast', opts, {statusJidList}) which
            // is Baileys' own status pathway — handles media upload + encryption
            // correctly. The old generateWAMessageContent + groupStatusMessageV2
            // approach was broken because generateWAMessageFromContent strips
            // FutureProofMessage wrappers (including groupStatusMessageV2) via
            // normalizeMessageContent, causing media to be double-processed/broken.
            let sendOpts = null;
            let mediaType = "text";

            if (!hasMedia) {
                if (!caption) {
                    return quickReply(
                        `📝 *Group Status Usage*\n\n` +
                        `\`.togstatus caption|color\`\n` +
                        `\`.togstatus |blue\`\n` +
                        `\`.togstatus all caption\` _(owner only — all groups)_\n` +
                        `_Reply to image / video / audio_\n\n` +
                        `🎨 *Colors:*\nblue, green, yellow, orange, red,\npurple, gray, black, white, cyan`,
                    );
                }
                const bgHex = COLORS[color?.toLowerCase()] || COLORS.blue;
                sendOpts = {
                    text: caption,
                    backgroundArgb: hexToArgb(bgHex),
                    font: 0,
                };
                mediaType = "text";

            } else if (quoted.imageMessage) {
                await react("⏳");
                const buf = await baileys.downloadMediaMessage(
                    buildMsgObj(mek, quoted), "buffer", {},
                    { reuploadRequest: Guru.updateMediaMessage },
                );
                sendOpts = { image: buf, caption: caption || "" };
                mediaType = "image";

            } else if (quoted.videoMessage) {
                await react("⏳");
                const buf = await baileys.downloadMediaMessage(
                    buildMsgObj(mek, quoted), "buffer", {},
                    { reuploadRequest: Guru.updateMediaMessage },
                );
                sendOpts = { video: buf, caption: caption || "", gifPlayback: false };
                mediaType = "video";

            } else if (quoted.audioMessage) {
                await react("⏳");
                const buf = await baileys.downloadMediaMessage(
                    buildMsgObj(mek, quoted), "buffer", {},
                    { reuploadRequest: Guru.updateMediaMessage },
                );
                const vn = await toVN(buf);
                const wfBase64 = await generateWaveform(buf);
                sendOpts = {
                    audio: vn,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                    waveform: Buffer.from(wfBase64, "base64"),
                };
                mediaType = "audio";

            } else {
                return quickReply("❌ Unsupported media type. Reply to an image, video, or audio.");
            }

            // ── DETERMINE TARGET GROUPS ───────────────────────────────────────
            let targetGroups = [targetGroupId];

            if (broadcastAll) {
                try {
                    const allGroups = await Guru.groupFetchAllParticipating();
                    targetGroups = Object.keys(allGroups);
                    await quickReply(`📢 *Broadcasting to ${targetGroups.length} groups…*`);
                } catch (err) {
                    await react("❌");
                    return quickReply(`❌ Could not fetch groups: ${err.message}`);
                }
            }

            // ── POST TO STATUS@BROADCAST WITH GROUP PARTICIPANTS ──────────────
            // sendMessage('status@broadcast', ..., { statusJidList }) is the
            // correct Baileys API for status that properly handles media upload
            // and encryption. statusJidList makes it visible to group members.
            let sent = 0, failed = 0;
            const delay = (ms) => new Promise((r) => setTimeout(r, ms));

            for (const gid of targetGroups) {
                try {
                    await groupStatus(Guru, gid, sendOpts);
                    sent++;
                    if (targetGroups.length > 1) await delay(800);
                } catch (_) {
                    failed++;
                }
            }

            await react("✅");
            if (broadcastAll) {
                return quickReply(
                    `✅ *Group status posted!*\n📊 Sent: ${sent} | Failed: ${failed}\n_${mediaType} status delivered to group members_`
                );
            }
            return quickReply(`✅ ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} status sent to group!`);

        } catch (err) {
            console.error("[togstatus]", err);
            await react("❌");
            return quickReply(`❌ Status error:\n${err.message}`);
        }
    },
);

// ─── HELPERS ────────────────────────────────────────────────────────────────

function hexToArgb(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return ((0xff << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

function buildMsgObj(originalMessage, quotedContent) {
    const ctxInfo = originalMessage.message?.extendedTextMessage?.contextInfo;
    return {
        key: {
            remoteJid: originalMessage.key.remoteJid,
            fromMe: false,
            id: ctxInfo?.stanzaId || originalMessage.key.id,
            participant: ctxInfo?.participant,
        },
        message: quotedContent,
    };
}

// Post content to status@broadcast with the group's participant list so all
// group members see it. Uses Baileys' native status pathway which correctly
// handles media upload encryption — unlike the raw generateWAMessageContent
// + groupStatusMessageV2 approach which gets silently stripped at send time.
async function groupStatus(conn, jid, sendOpts) {
    const meta = await conn.groupMetadata(jid);
    const participants = meta.participants.map(p => p.id);
    if (!participants.length) throw new Error("No participants found in group");
    return await conn.sendMessage("status@broadcast", sendOpts, {
        statusJidList: participants,
    });
}

function toVN(buffer) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const output = new PassThrough();
        const chunks = [];

        input.end(buffer);

        ffmpeg(input)
            .noVideo()
            .audioCodec("libopus")
            .format("ogg")
            .audioChannels(1)
            .audioFrequency(48000)
            .on("error", reject)
            .on("end", () => resolve(Buffer.concat(chunks)))
            .pipe(output);

        output.on("data", (c) => chunks.push(c));
        output.on("error", reject);
    });
}

function generateWaveform(buffer, bars = 64) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const output = new PassThrough();
        const chunks = [];

        input.end(buffer);

        ffmpeg(input)
            .audioChannels(1)
            .audioFrequency(16000)
            .format("s16le")
            .on("error", reject)
            .on("end", () => {
                const raw = Buffer.concat(chunks);
                const samples = raw.length / 2;
                const amps = [];

                for (let i = 0; i < samples; i++) {
                    amps.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
                }

                const size = Math.max(1, Math.floor(amps.length / bars));
                const avg = Array.from({ length: bars }, (_, i) => {
                    const slice = amps.slice(i * size, (i + 1) * size);
                    return slice.length
                        ? slice.reduce((a, b) => a + b, 0) / slice.length
                        : 0;
                });

                const max = Math.max(...avg) || 1;
                resolve(
                    Buffer.from(
                        avg.map((v) => Math.floor((v / max) * 100)),
                    ).toString("base64"),
                );
            })
            .pipe(output);

        output.on("data", (c) => chunks.push(c));
        output.on("error", reject);
    });
}
