"use strict";

const { gmd } = require("../guru");
const axios   = require("axios");

// ─── helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isYtUrl(str) {
    return /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([A-Za-z0-9_-]{11})/.test(str);
}

function extractYtId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}

function fmtDuration(secs) {
    const s = parseInt(secs) || 0;
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
}

// ── Toxic-MD box formatter ────────────────────────────────────────────────────
const fmt = (title, lines, footer) =>
    `╭─❏ 「 ${title}」\n${lines.map(l => `│ ${l}`).join("\n")}\n╰───────────────\n> _${footer}_`;

// ── Audio API chain (primary: Toxic-MD APIs → fallbacks) ─────────────────────
async function resolveAudio(query, isUrl) {
    const enc = encodeURIComponent(query);

    // Toxic-MD primary APIs
    const toxicChain = isUrl ? [
        // Direct YouTube URL — sidycoders API
        async () => {
            const r = await axios.get(
                `https://api.sidycoders.xyz/api/ytdl?url=${enc}&format=mp3&apikey=memberdycoders`,
                { timeout: 35000 }
            );
            if (!r.data?.status || !r.data?.cdn) throw new Error("sidycoders fail");
            return { url: r.data.cdn, title: r.data.title || "Track" };
        },
        // Nexray ytmp3
        async () => {
            const id = extractYtId(query);
            if (!id) throw new Error("no id");
            const r = await axios.get(
                `https://api.nexray.web.id/downloader/ytmp3?url=${encodeURIComponent("https://youtube.com/watch?v=" + id)}`,
                { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 35000 }
            );
            if (!r.data?.status || !r.data?.result?.url) throw new Error("nexray fail");
            return { url: r.data.result.url, title: r.data.result.title || "Track" };
        },
    ] : [
        // Search query — apiziaul
        async () => {
            const r = await axios.get(
                `https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${enc}`,
                { timeout: 35000 }
            );
            if (!r.data?.status || !r.data?.result?.downloadUrl) throw new Error("apiziaul fail");
            return {
                url: r.data.result.downloadUrl,
                title: r.data.result.title || query,
                thumbnail: r.data.result.thumbnail || "",
                sourceUrl: r.data.result.videoUrl || "",
            };
        },
        // sidycoders search
        async () => {
            const r = await axios.get(
                `https://api.sidycoders.xyz/api/ytdl?url=${enc}&format=mp3&apikey=memberdycoders`,
                { timeout: 35000 }
            );
            if (!r.data?.status || !r.data?.cdn) throw new Error("sidycoders search fail");
            return { url: r.data.cdn, title: r.data.title || query };
        },
    ];

    // Legacy fallback chain
    const legacyChain = [
        `https://api.giftedtech.web.id/api/download/ytmp3?apikey=free&url=${enc}`,
        `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${enc}`,
        `https://api.siputzx.my.id/api/d/ytmp3?url=${enc}`,
        `https://apiskeith.top/download/audio?url=${enc}`,
    ].map(endpoint => async () => {
        const { data } = await axios.get(endpoint, { timeout: 35000 });
        const url = data?.result || data?.download_url || data?.result?.url ||
                    data?.result?.download_url || data?.url || data?.link ||
                    (data?.status === true && typeof data?.result === "string" ? data.result : null);
        if (!url || typeof url !== "string" || !url.startsWith("http")) throw new Error("no url");
        return { url, title: data?.title || data?.result?.title || query };
    });

    for (const fn of [...toxicChain, ...legacyChain]) {
        try { return await fn(); } catch {}
    }
    return null;
}

// ── Video API chain ───────────────────────────────────────────────────────────
async function resolveVideo(query, isUrl) {
    const enc = encodeURIComponent(query);
    const id  = isUrl ? extractYtId(query) : null;

    const toxicChain = [
        // Nexray ytmp4
        async () => {
            const fullUrl = id
                ? `https://youtube.com/watch?v=${id}`
                : `https://youtube.com/results?search_query=${enc}`;
            const r = await axios.get(
                `https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(isUrl ? fullUrl : query)}&resolusi=720`,
                { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 90000 }
            );
            if (!r.data?.status || !r.data?.result?.url) throw new Error("nexray mp4 fail");
            return {
                url: r.data.result.url,
                title: r.data.result.title || "Video",
                duration: r.data.result.duration || 0,
            };
        },
        // sidycoders mp4
        async () => {
            const r = await axios.get(
                `https://api.sidycoders.xyz/api/ytdl?url=${enc}&format=mp4&apikey=memberdycoders`,
                { timeout: 60000 }
            );
            if (!r.data?.status || !r.data?.cdn) throw new Error("sidycoders mp4 fail");
            return { url: r.data.cdn, title: r.data.title || "Video" };
        },
    ];

    const legacyChain = [
        `https://api.giftedtech.web.id/api/download/ytmp4?apikey=free&url=${enc}`,
        `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${enc}`,
        `https://api.siputzx.my.id/api/d/ytmp4?url=${enc}`,
        `https://apiskeith.top/download/video?url=${enc}`,
    ].map(endpoint => async () => {
        const { data } = await axios.get(endpoint, { timeout: 60000 });
        const url = data?.result || data?.download_url || data?.result?.url ||
                    data?.result?.download_url || data?.url || data?.link ||
                    (data?.status === true && typeof data?.result === "string" ? data.result : null);
        if (!url || typeof url !== "string" || !url.startsWith("http")) throw new Error("no url");
        return { url, title: data?.title || data?.result?.title || "Video" };
    });

    for (const fn of [...toxicChain, ...legacyChain]) {
        try { return await fn(); } catch {}
    }
    return null;
}

// ─── PLAY (audio) ─────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "play",
        aliases: ["music", "song", "yta", "audio", "ply"],
        category: "downloader",
        react: "🎶",
        description: "Download and send audio from YouTube. Usage: .play <song name or URL>",
    },
    async (from, Guru, conText) => {
        const { q, reply, react, mek, botFooter, botName } = conText;

        if (!q || !q.trim()) {
            await react("❌");
            return reply(
                fmt("PLAY", [
                    "Give me a song name or YouTube link.",
                    "Example: .play harlem shake",
                    "Or: .play https://youtu.be/dQw4w9WgXcQ",
                ], botFooter)
            );
        }

        const query = q.trim();
        const ytUrl = isYtUrl(query);

        await react("⌛");
        await reply(fmt("PLAY", ["Searching and downloading... please wait."], botFooter));

        const resolved = await resolveAudio(query, ytUrl);

        if (!resolved) {
            await react("❌");
            return reply(
                fmt("PLAY", [
                    `No result found for: "${query}"`,
                    "Try a different search term or paste a YouTube link.",
                ], botFooter)
            );
        }

        const { url, title, thumbnail, sourceUrl } = resolved;

        try {
            await Guru.sendMessage(
                from,
                {
                    audio: { url },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${(title || query).replace(/[^\w\s.-]/g, "")}.mp3`,
                    contextInfo: thumbnail ? {
                        externalAdReply: {
                            title: (title || query).substring(0, 30),
                            body: botName || "ULTRA GURU MD",
                            thumbnailUrl: thumbnail,
                            sourceUrl: sourceUrl || url,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                        },
                    } : undefined,
                },
                { quoted: mek }
            );

            // Also send as document for easy download
            await Guru.sendMessage(
                from,
                {
                    document: { url },
                    mimetype: "audio/mpeg",
                    fileName: `${(title || query).replace(/[<>:"/\\|?*]/g, "_")}.mp3`,
                    caption: fmt("PLAY", [
                        `🎵 ${title || query}`,
                    ], botFooter),
                },
                { quoted: mek }
            );

            await react("✅");
        } catch (err) {
            await react("❌");
            return reply(fmt("PLAY", [`Download failed: ${err.message}`], botFooter));
        }
    }
);

// ─── YTMP3 (direct YouTube link) ─────────────────────────────────────────────

gmd(
    {
        pattern: "ytmp3",
        aliases: ["ymp3", "yt3", "ytaudio"],
        category: "downloader",
        react: "🎵",
        description: "Download audio from a YouTube URL. Usage: .ytmp3 <YouTube URL>",
    },
    async (from, Guru, conText) => {
        const { q, reply, react, mek, botFooter } = conText;

        if (!q || !isYtUrl(q.trim())) {
            await react("❌");
            return reply(
                fmt("YTMP3", [
                    "Provide a valid YouTube URL.",
                    "Example: .ytmp3 https://youtu.be/xxxx",
                ], botFooter)
            );
        }

        await react("⌛");
        const resolved = await resolveAudio(q.trim(), true);

        if (!resolved) {
            await react("❌");
            return reply(fmt("YTMP3", ["Download failed. Try again."], botFooter));
        }

        try {
            const buf = await axios.get(resolved.url, {
                responseType: "arraybuffer",
                timeout: 90000,
                maxContentLength: Infinity,
                headers: { "User-Agent": "Mozilla/5.0" },
            }).then(r => Buffer.from(r.data));

            await Guru.sendMessage(
                from,
                {
                    audio: buf,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${(resolved.title || "audio").replace(/[^\w\s.-]/g, "")}.mp3`,
                },
                { quoted: mek }
            );

            await reply(fmt("YouTube MP3", [
                `🎵 ${resolved.title || "Track"}`,
            ], botFooter));

            await react("✅");
        } catch (err) {
            await react("❌");
            return reply(fmt("YTMP3", [`Failed: ${err.message}`], botFooter));
        }
    }
);

// ─── VIDEO ────────────────────────────────────────────────────────────────────

gmd(
    {
        pattern: "video",
        aliases: ["ytmp4", "mp4", "dlmp4", "ytv", "ytvideo"],
        category: "downloader",
        react: "🎥",
        description: "Download and send video from YouTube. Usage: .video <title or URL>",
    },
    async (from, Guru, conText) => {
        const { q, reply, react, mek, botFooter } = conText;

        if (!q || !q.trim()) {
            await react("❌");
            return reply(
                fmt("YTMP4", [
                    "Give me a YouTube URL or video title.",
                    "Example: .video Blinding Lights",
                    "Or: .video https://youtu.be/fHI8X4OXluQ [720]",
                ], botFooter)
            );
        }

        const parts  = q.trim().split(/\s+/);
        const query  = parts[0];
        const ytUrl  = isYtUrl(query);

        await react("⌛");
        await reply(fmt("YTMP4", ["Processing... This may take up to 60s."], botFooter));

        const resolved = await resolveVideo(query, ytUrl);

        if (!resolved) {
            await react("❌");
            return reply(
                fmt("YTMP4", [
                    "Download failed.",
                    "Video might be age-restricted, unavailable, or too large.",
                ], botFooter)
            );
        }

        const { url, title, duration } = resolved;

        try {
            await Guru.sendMessage(
                from,
                {
                    video: { url },
                    mimetype: "video/mp4",
                    caption: fmt("YouTube MP4", [
                        `🎬 ${title || query}`,
                        duration ? `⏱ ${fmtDuration(duration)}` : null,
                        "📺 Quality: 720p",
                    ].filter(Boolean), botFooter),
                },
                { quoted: mek }
            );
            await react("✅");
        } catch (err) {
            await react("❌");
            return reply(fmt("YTMP4", [`Download failed: ${err.message}`], botFooter));
        }
    }
);
