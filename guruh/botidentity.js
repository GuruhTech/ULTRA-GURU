const { gmd, getSetting, setSetting } = require("../guru");

// ═══════════════════════════════════════════════════════════════════
//  BOT IDENTITY SUITE
//  Commands: .identity  .rebrand  .setpic  .setwm  .wmtoggle
// ═══════════════════════════════════════════════════════════════════

// ── Helpers ─────────────────────────────────────────────────────────

async function uploadImage(buffer) {
    // Try Telegraph (no API key needed)
    try {
        const { Blob } = require("buffer");
        const blob = new Blob([buffer], { type: "image/jpeg" });
        const form = new FormData();
        form.append("file", blob, "bot-image.jpg");
        const res = await fetch("https://telegra.ph/upload", {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(15_000),
        });
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.src) {
            return "https://telegra.ph" + data[0].src;
        }
    } catch (_) {}

    // Fallback: catbox.moe
    try {
        const { Blob } = require("buffer");
        const blob = new Blob([buffer], { type: "image/jpeg" });
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", blob, "image.jpg");
        const res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(15_000),
        });
        const url = (await res.text()).trim();
        if (url.startsWith("https://")) return url;
    } catch (_) {}

    return null;
}

async function fetchImageBuffer(url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
}

// ── .identity — dashboard ──────────────────────────────────────────

gmd({
    pattern:     "identity",
    aliases:     ["botidentity", "brandpanel", "identitypanel"],
    react:       "🎨",
    category:    "owner",
    description: "View and manage bot identity (name, image, watermark)",
    usage:       ".identity",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const [name, pic, wmOn, wmText, bio] = await Promise.all([
        getSetting("BOT_NAME").catch(() => "ULTRA GURU MD"),
        getSetting("BOT_PIC").catch(() => ""),
        getSetting("WATERMARK").catch(() => "false"),
        getSetting("WATERMARK_TEXT").catch(() => ""),
        getSetting("BOT_BIO").catch(() => ""),
    ]);

    const botName    = name    || "ULTRA GURU MD";
    const picUrl     = pic     || "";
    const watermark  = wmOn === "true";
    const wmLabel    = wmText  || `_Powered by ${botName}_`;
    const bioText    = bio     || "Auto-generated (uptime)";

    const text =
        `*🎨 BOT IDENTITY PANEL*\n${"═".repeat(32)}\n\n` +
        `🤖 *Bot Name*\n` +
        `   ${botName}\n` +
        `   ↳ _.rebrand <new name>_\n\n` +
        `🖼️ *Bot Image*\n` +
        `   ${picUrl ? "✅ Set" : "❌ Not set (using default)"}\n` +
        `   ↳ _.setpic <url>_ or send photo with _.setpic_\n\n` +
        `✍️ *Watermark*\n` +
        `   ${watermark ? "✅ ON" : "⭕ OFF"} — _${wmLabel}_\n` +
        `   ↳ _.setwm <text>_  _.wmtoggle_\n\n` +
        `📝 *Bio (WhatsApp About)*\n` +
        `   ${bioText}\n` +
        `   ↳ _.botbio <text>_\n\n` +
        `${"─".repeat(32)}\n` +
        `*Quick Commands:*\n` +
        `• \`.rebrand ULTRA GURU MD\`\n` +
        `• \`.setpic https://…\`\n` +
        `• \`.setpic\` _(reply to a photo)_\n` +
        `• \`.setwm Powered by GURU\`\n` +
        `• \`.wmtoggle\`\n` +
        `• \`.previewbot\``;

    if (picUrl) {
        try {
            const imgBuf = await fetchImageBuffer(picUrl);
            return Guru.sendMessage(from, {
                image: imgBuf,
                caption: text,
            });
        } catch (_) {}
    }

    await react("✅");
    reply(text);
});

// ── .rebrand — set name (DB + live WhatsApp profile) ──────────────

gmd({
    pattern:     "rebrand",
    aliases:     ["setname", "newbotname", "botrebrand"],
    react:       "✏️",
    category:    "owner",
    description: "Set bot name and update WhatsApp display name live",
    usage:       ".rebrand ULTRA GURU MD",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }
    if (!q?.trim()) {
        return reply(
            `✏️ *Set Bot Name*\n\n` +
            `Usage: \`.rebrand <new name>\`\n\n` +
            `Example: \`.rebrand ULTRA GURU MD v2\`\n\n` +
            `_Updates both the bot settings and the WhatsApp profile name._`
        );
    }

    const newName = q.trim();
    await react("⏳");

    const results = [];

    // 1 — save to settings
    try {
        await setSetting("BOT_NAME", newName);
        results.push("✅ Saved to bot settings");
    } catch (e) {
        results.push(`⚠️ Settings save: ${e.message}`);
    }

    // 2 — update WhatsApp profile name live
    try {
        await Guru.updateProfileName(newName);
        results.push("✅ WhatsApp display name updated");
    } catch (e) {
        results.push(`⚠️ WhatsApp name: ${e.message}`);
    }

    await react("✅");
    reply(
        `*✏️ Bot Rebranded!*\n\n` +
        `🤖 New Name: *${newName}*\n\n` +
        results.map(r => `  ${r}`).join("\n") +
        `\n\n_Use \`.identity\` to see the full panel._`
    );
});

// ── .setpic — set bot image (URL or quoted photo → auto-upload) ───

gmd({
    pattern:     "setpic",
    aliases:     ["newbotpic", "botphoto", "setbotphoto"],
    react:       "🖼️",
    category:    "owner",
    description: "Set bot image from URL or by sending/replying to a photo",
    usage:       ".setpic <url>  OR  reply to image with .setpic",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser, quotedMsg, getMediaBuffer, mek } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    await react("⏳");

    let imageUrl  = null;
    let imgBuffer = null;

    // ── path 1: URL provided as text ──────────────────────────────
    if (q?.trim()?.startsWith("http")) {
        imageUrl = q.trim();
        try {
            imgBuffer = await fetchImageBuffer(imageUrl);
        } catch (e) {
            await react("❌");
            return reply(`❌ Could not fetch image from URL.\n\n${e.message}`);
        }
    }
    // ── path 2: quoted / replied image ────────────────────────────
    else if (quotedMsg?.message?.imageMessage || mek?.message?.imageMessage) {
        try {
            imgBuffer = await getMediaBuffer(
                quotedMsg?.message?.imageMessage
                    ? quotedMsg
                    : mek,
                "image"
            );
            if (!imgBuffer || imgBuffer.length < 1000) throw new Error("Empty buffer");
            reply("☁️ _Uploading image to cloud…_");
            imageUrl = await uploadImage(imgBuffer);
            if (!imageUrl) throw new Error("All upload services failed");
        } catch (e) {
            await react("❌");
            return reply(
                `❌ Image upload failed: ${e.message}\n\n` +
                `_Try providing a direct URL instead:_\n` +
                `\`.setpic https://example.com/image.jpg\``
            );
        }
    }
    // ── path 3: no input ──────────────────────────────────────────
    else {
        await react("💡");
        return reply(
            `*🖼️ Set Bot Image*\n\n` +
            `*Option 1 — URL:*\n` +
            `\`.setpic https://example.com/photo.jpg\`\n\n` +
            `*Option 2 — Photo:*\n` +
            `Send a photo with the caption \`.setpic\`\n` +
            `_or_ reply to any image with \`.setpic\`\n\n` +
            `_Image is automatically uploaded and saved._`
        );
    }

    const results = [];

    // 1 — save URL to settings
    try {
        await setSetting("BOT_PIC", imageUrl);
        results.push("✅ Saved to bot settings");
    } catch (e) {
        results.push(`⚠️ Settings save: ${e.message}`);
    }

    // 2 — update WhatsApp profile picture live
    try {
        await Guru.updateProfilePicture(Guru.user.id, { url: imageUrl });
        results.push("✅ WhatsApp profile photo updated");
    } catch (e) {
        results.push(`⚠️ WhatsApp photo: ${e.message}`);
    }

    await react("✅");

    // Send preview of the new image with result
    try {
        await Guru.sendMessage(from, {
            image: imgBuffer || { url: imageUrl },
            caption:
                `*🖼️ Bot Image Updated!*\n\n` +
                results.map(r => `  ${r}`).join("\n") +
                `\n\n🔗 _Stored URL:_ ${imageUrl}\n\n` +
                `_Use \`.identity\` to see the full panel._`,
        });
    } catch (_) {
        reply(
            `*🖼️ Bot Image Updated!*\n\n` +
            results.map(r => `  ${r}`).join("\n") +
            `\n\n🔗 _Stored URL:_ ${imageUrl}`
        );
    }
});

// ── .setwm — set watermark text ────────────────────────────────────

gmd({
    pattern:     "setwm",
    aliases:     ["setwatermark2", "newwatermark", "wmtext"],
    react:       "✍️",
    category:    "owner",
    description: "Set the watermark text appended to bot messages",
    usage:       ".setwm Powered by ULTRA GURU MD",
}, async (from, Guru, conText) => {
    const { q, reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    if (!q?.trim()) {
        const cur = (await getSetting("WATERMARK_TEXT").catch(() => "")) || "Not set";
        return reply(
            `*✍️ Watermark Text*\n\n` +
            `Current: _${cur}_\n\n` +
            `Usage: \`.setwm Powered by GURU BOT\`\n\n` +
            `_Use \`.wmtoggle\` to turn it on/off_`
        );
    }

    await setSetting("WATERMARK_TEXT", q.trim());
    const isOn = (await getSetting("WATERMARK").catch(() => "false")) === "true";
    if (!isOn) await setSetting("WATERMARK", "true");

    await react("✅");
    reply(
        `*✍️ Watermark Updated!*\n\n` +
        `New text: _${q.trim()}_\n` +
        `Status: ${isOn ? "✅ Already ON" : "✅ Auto-enabled"}\n\n` +
        `_Use \`.wmtoggle\` to turn it off._`
    );
});

// ── .wmtoggle — toggle watermark on/off ───────────────────────────

gmd({
    pattern:     "wmtoggle",
    aliases:     ["togglewm", "togglewatermark", "wmonoff"],
    react:       "🔄",
    category:    "owner",
    description: "Toggle the watermark on or off",
    usage:       ".wmtoggle",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const cur = (await getSetting("WATERMARK").catch(() => "false")) === "true";
    const next = !cur;
    await setSetting("WATERMARK", next ? "true" : "false");
    await react(next ? "✅" : "⭕");
    reply(
        `*✍️ Watermark ${next ? "ON" : "OFF"}*\n\n` +
        `${next ? "✅ Watermark will now appear on bot messages." : "⭕ Watermark is now hidden."}\n\n` +
        `_Use \`.setwm <text>\` to change the watermark text._`
    );
});

// ── .previewbot — send a sample bot message with all branding ─────

gmd({
    pattern:     "previewbot",
    aliases:     ["botpreview", "identitypreview", "previewbrand"],
    react:       "👁️",
    category:    "owner",
    description: "Preview how the bot looks with current identity settings",
    usage:       ".previewbot",
}, async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) { await react("❌"); return reply("❌ Owner only."); }

    const [name, pic, wmOn, wmText] = await Promise.all([
        getSetting("BOT_NAME").catch(() => "ULTRA GURU MD"),
        getSetting("BOT_PIC").catch(() => ""),
        getSetting("WATERMARK").catch(() => "false"),
        getSetting("WATERMARK_TEXT").catch(() => ""),
    ]);

    const botName   = name   || "ULTRA GURU MD";
    const picUrl    = pic    || "";
    const watermark = wmOn === "true";
    const wm        = wmText || `_Powered by ${botName}_`;

    const sampleMsg =
        `*Hey there! 👋*\n\n` +
        `I'm *${botName}*, your AI-powered WhatsApp assistant.\n\n` +
        `Here's what I can do:\n` +
        `• 🎵 Download music & videos\n` +
        `• 🤖 Answer any question with AI\n` +
        `• 📊 Manage your groups\n` +
        `• 🎮 Play games & more!\n\n` +
        `Type *.help* to see all commands.\n\n` +
        (watermark ? `> ${wm}` : "");

    await react("⏳");

    if (picUrl) {
        try {
            const imgBuf = await fetchImageBuffer(picUrl);
            await Guru.sendMessage(from, { image: imgBuf, caption: sampleMsg });
            await react("✅");
            return reply(
                `👁️ *Preview sent above!*\n\n` +
                `Name: *${botName}*\n` +
                `Image: ✅ Custom photo\n` +
                `Watermark: ${watermark ? `✅ ON — _${wm}_` : "⭕ OFF"}`
            );
        } catch (_) {}
    }

    await react("✅");
    reply(
        `${sampleMsg}\n\n` +
        `─────────────────\n` +
        `_👁️ This is how your bot message looks._\n` +
        `_Set a bot image with \`.setpic\` to include a photo._`
    );
});
