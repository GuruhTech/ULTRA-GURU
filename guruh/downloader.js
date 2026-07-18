
const {
        gmd,
        gitRepoRegex,
        MAX_MEDIA_SIZE,
        getFileSize,
        getMimeCategory,
        getMimeFromUrl,
    } = require("../guru"),
    GIFTED_DLS = require("gifted-dls"),
    guruDls = new GIFTED_DLS(),
    axios = require("axios"),
    { sendButtons } = require("gifted-btns");

function extractButtonId(msg) {
    if (!msg) return null;
    if (msg.templateButtonReplyMessage?.selectedId)
        return msg.templateButtonReplyMessage.selectedId;
    if (msg.buttonsResponseMessage?.selectedButtonId)
        return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
        return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.interactiveResponseMessage) {
        const nf = msg.interactiveResponseMessage.nativeFlowResponseMessage;
        if (nf?.paramsJson) {
            try { const p = JSON.parse(nf.paramsJson); if (p.id) return p.id; } catch {}
        }
        return msg.interactiveResponseMessage.buttonId || null;
    }
    return null;
}

gmd(
    {
        pattern: "gitclone",
        category: "downloader",
        react: "📦",
        aliases: ["gitdl", "github", "git", "repodl", "clone"],
        description: "Download GitHub repository as zip file",
    },
    async (from, Guru, conText) => {
        const { q, mek, reply, react, sender, botName, newsletterJid } =
            conText;

        if (!q) {
            await react("❌");
            return reply(
                `Please provide a GitHub repository link.\n\n*Usage:* .gitclone https://github.com/user/repo`,
            );
        }

        if (!gitRepoRegex.test(q)) {
            await react("❌");
            return reply(
                "Invalid GitHub link format. Please provide a valid GitHub repository URL.",
            );
        }

        try {
            let [, user, repo] = q.match(gitRepoRegex) || [];
            repo = repo.replace(/\.git$/, "").split("/")[0];

            const apiUrl = `https://api.github.com/repos/${user}/${repo}`;
            const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`;

            await reply(`Fetching repository *${user}/${repo}*...`);

            const repoResponse = await axios.get(apiUrl);
            if (!repoResponse.data) {
                await react("❌");
                return reply(
                    "Repository not found or access denied. Make sure the repository is public.",
                );
            }

            const repoData = repoResponse.data;
            const defaultBranch = repoData.default_branch || "main";
            const filename = `${user}-${repo}-${defaultBranch}.zip`;

            await Guru.sendMessage(
                from,
                {
                    document: { url: zipUrl },
                    fileName: filename,
                    mimetype: "application/zip",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: newsletterJid,
                            newsletterName: botName,
                            serverMessageId: 143,
                        },
                    },
                },
                { quoted: mek },
            );

            await react("✅");
        } catch (error) {
            console.error("GitClone error:", error);
            await react("❌");

            if (error.message?.includes("404")) {
                return reply("Repository not found.");
            } else if (error.message?.includes("rate limit")) {
                return reply(
                    "GitHub API rate limit exceeded. Please try again later.",
                );
            } else {
                return reply(`Failed to download repository: ${error.message}`);
            }
        }
    },
);

// ── Toxic-MD box formatter (shared across social downloaders) ─────────────────
function toxicBox(title, lines, footer) {
    return `╭─❏ 「 ${title} 」\n${lines.filter(Boolean).map(l => `│ ${l}`).join("\n")}\n╰───────────────────────────\n> _${footer}_`;
}

gmd(
    {
        pattern: "fb",
        category: "downloader",
        react: "📘",
        aliases: ["fbdl", "facebookdl", "facebook"],
        description: "Download Facebook videos. Usage: .fb <Facebook URL>",
    },
    async (from, Guru, conText) => {
        const {
            q,
            mek,
            reply,
            react,
            botName,
            botFooter,
            gmdBuffer,
            toAudio,
            GuruTechApi,
            GuruApiKey,
        } = conText;

        if (!q) {
            await react("❌");
            return reply(toxicBox("FACEBOOK DOWNLOADER", [
                "⚠️ Send a Facebook video URL.",
                "Example: .fb https://fb.watch/xxx",
            ], botFooter));
        }

        if (!q.includes("facebook.com") && !q.includes("fb.watch")) {
            await react("❌");
            return reply(toxicBox("FACEBOOK DOWNLOADER", ["❌ Invalid Facebook URL."], botFooter));
        }

        await react("⌛");
        await reply(toxicBox("FACEBOOK DOWNLOADER", ["⬇️ Fetching video..."], botFooter));

        try {
            let videoUrl = null, title = "Facebook Video", thumbnail = null;

            // Toxic-MD API: nexray
            try {
                const r = await axios.get(
                    `https://api.nexray.web.id/downloader/facebook?url=${encodeURIComponent(q)}`,
                    { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 20000 }
                );
                const d = r.data?.result;
                if (d?.url) { videoUrl = d.url; title = d.title || title; thumbnail = d.thumbnail || null; }
            } catch (_) {}

            // Fallback: GuruTech
            if (!videoUrl) {
                try {
                    const r = await axios.get(
                        `${GuruTechApi}/api/download/facebook?apikey=${GuruApiKey}&url=${encodeURIComponent(q)}`,
                        { timeout: 15000 }
                    );
                    const d = r.data?.result;
                    if (d?.hd_video || d?.sd_video) {
                        videoUrl = d.hd_video || d.sd_video;
                        title = d.title || title;
                        thumbnail = d.thumbnail || null;
                    }
                } catch (_) {}
            }

            if (!videoUrl) {
                await react("❌");
                return reply(toxicBox("FACEBOOK DOWNLOADER", [
                    "❌ Failed to download.",
                    "Make sure the video is public.",
                ], botFooter));
            }

            const fileSize = await getFileSize(videoUrl).catch(() => 0);
            const msgOpts = { quoted: mek };

            if (fileSize > MAX_MEDIA_SIZE) {
                await Guru.sendMessage(from, {
                    document: { url: videoUrl },
                    fileName: `${title.replace(/[^\w\s.-]/gi, "")}.mp4`,
                    mimetype: "video/mp4",
                    caption: toxicBox("FACEBOOK DOWNLOADER", [
                        `🎬 ${title}`,
                    ], botFooter),
                }, msgOpts);
            } else {
                await Guru.sendMessage(from, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: toxicBox("FACEBOOK DOWNLOADER", [
                        `🎬 ${title}`,
                    ], botFooter),
                }, msgOpts);
            }
            await react("✅");
        } catch (err) {
            console.error("Facebook error:", err);
            await react("❌");
            return reply(toxicBox("FACEBOOK DOWNLOADER", [`❌ Error: ${err.message}`], botFooter));
        }
    },
);

gmd(
    {
        pattern: "tiktok",
        category: "downloader",
        react: "🎵",
        aliases: ["tiktokdl", "ttdl", "tt"],
        description: "Download TikTok videos/audio. Usage: .tiktok <TikTok URL>",
    },
    async (from, Guru, conText) => {
        const { q, mek, reply, react, botFooter, gmdBuffer, toAudio, formatAudio, GuruTechApi, GuruApiKey } = conText;

        if (!q) {
            await react("❌");
            return reply(toxicBox("TIKTOK DOWNLOADER", [
                "⚠️ Send a TikTok URL.",
                "Example: .tiktok https://vm.tiktok.com/xxx",
            ], botFooter));
        }

        if (!q.includes("tiktok.com")) {
            await react("❌");
            return reply(toxicBox("TIKTOK DOWNLOADER", ["❌ Invalid TikTok URL."], botFooter));
        }

        await react("⌛");
        await reply(toxicBox("TIKTOK DOWNLOADER", ["⬇️ Fetching TikTok..."], botFooter));

        try {
            let result = null;

            // Toxic-MD primary: nexray
            try {
                const r = await axios.get(
                    `https://api.nexray.web.id/downloader/tiktok?url=${encodeURIComponent(q)}`,
                    { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 20000 }
                );
                const d = r.data?.result;
                if (d?.video) result = { video: d.video, music: d.music, title: d.title || "TikTok Video", author: d.author?.nickname || "Unknown", cover: d.cover || null };
            } catch (_) {}

            // Fallback: tikwm
            if (!result) {
                try {
                    const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(q)}`, { timeout: 15000 });
                    if (r.data?.code === 0 && r.data?.data) {
                        const d = r.data.data;
                        result = { video: d.play || d.wmplay, music: d.music, title: d.title || "TikTok Video", author: d.author?.nickname || "Unknown", cover: d.cover || null };
                    }
                } catch (_) {}
            }

            // Fallback: GuruTech
            if (!result) {
                for (const ep of ["tiktok", "tiktokdlv2", "tiktokdlv3"]) {
                    try {
                        const r = await axios.get(`${GuruTechApi}/api/download/${ep}?apikey=${GuruApiKey}&url=${encodeURIComponent(q)}`, { timeout: 15000 });
                        if (r.data?.success && r.data?.result) { result = r.data.result; break; }
                    } catch (_) {}
                }
            }

            if (!result?.video) {
                await react("❌");
                return reply(toxicBox("TIKTOK DOWNLOADER", ["❌ Failed to download. Try again."], botFooter));
            }

            const { video, music, title, author, cover } = result;

            // Send video
            const fileSize = await getFileSize(video).catch(() => 0);
            await Guru.sendMessage(from, {
                ...(fileSize > MAX_MEDIA_SIZE
                    ? { document: { url: video }, fileName: `${(title).replace(/[^\w\s.-]/gi, "")}.mp4`, mimetype: "video/mp4" }
                    : { video: { url: video }, mimetype: "video/mp4" }),
                caption: toxicBox("TIKTOK DOWNLOADER", [
                    `🎵 ${title}`,
                    `👤 @${author}`,
                ], botFooter),
            }, { quoted: mek });

            // Send music as audio too
            if (music) {
                try {
                    await Guru.sendMessage(from, {
                        audio: { url: music },
                        mimetype: "audio/mpeg",
                        ptt: false,
                        fileName: `${(title).replace(/[^\w\s.-]/gi, "")}_music.mp3`,
                    }, { quoted: mek });
                } catch (_) {}
            }

            await react("✅");
        } catch (err) {
            console.error("TikTok error:", err);
            await react("❌");
            return reply(toxicBox("TIKTOK DOWNLOADER", [`❌ Error: ${err.message}`], botFooter));
        }
    },
);

gmd(
    {
        pattern: "twitter",
        category: "downloader",
        react: "🐦",
        aliases: ["twitterdl", "xdl", "xdownloader", "twitterdownloader", "x"],
        description: "Download Twitter/X videos. Usage: .twitter <tweet URL>",
    },
    async (from, Guru, conText) => {
        const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } = conText;

        if (!q) {
            await react("❌");
            return reply(toxicBox("TWITTER/X DOWNLOADER", [
                "⚠️ Send a Twitter/X URL.",
                "Example: .twitter https://x.com/user/status/xxx",
            ], botFooter));
        }

        if (!q.includes("twitter.com") && !q.includes("x.com")) {
            await react("❌");
            return reply(toxicBox("TWITTER/X DOWNLOADER", ["❌ Invalid Twitter/X URL."], botFooter));
        }

        await react("⌛");
        await reply(toxicBox("TWITTER/X DOWNLOADER", ["⬇️ Fetching tweet video..."], botFooter));

        try {
            let videoUrl = null;

            // Toxic-MD API: nexray
            try {
                const r = await axios.get(
                    `https://api.nexray.web.id/downloader/twitter?url=${encodeURIComponent(q)}`,
                    { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 20000 }
                );
                const d = r.data?.result;
                const urls = d?.videoUrls || d?.urls || (d?.url ? [{ url: d.url }] : null);
                if (urls?.length) videoUrl = urls[0].url;
            } catch (_) {}

            // Fallback: GuruTech
            if (!videoUrl) {
                try {
                    const r = await axios.get(
                        `${GuruTechApi}/api/download/twitter?apikey=${GuruApiKey}&url=${encodeURIComponent(q)}`,
                        { timeout: 15000 }
                    );
                    const d = r.data?.result;
                    if (d?.videoUrls?.length) videoUrl = d.videoUrls[0].url;
                } catch (_) {}
            }

            if (!videoUrl) {
                await react("❌");
                return reply(toxicBox("TWITTER/X DOWNLOADER", [
                    "❌ No video found.",
                    "Make sure the tweet has a video and is public.",
                ], botFooter));
            }

            const fileSize = await getFileSize(videoUrl).catch(() => 0);
            await Guru.sendMessage(from, {
                ...(fileSize > MAX_MEDIA_SIZE
                    ? { document: { url: videoUrl }, fileName: "twitter_video.mp4", mimetype: "video/mp4" }
                    : { video: { url: videoUrl }, mimetype: "video/mp4" }),
                caption: toxicBox("TWITTER/X DOWNLOADER", ["🐦 Here's your video!"], botFooter),
            }, { quoted: mek });

            await react("✅");
        } catch (err) {
            console.error("Twitter error:", err);
            await react("❌");
            return reply(toxicBox("TWITTER/X DOWNLOADER", [`❌ Error: ${err.message}`], botFooter));
        }
    },
);

gmd(
    {
        pattern: "ig",
        category: "downloader",
        react: "📸",
        aliases: ["insta", "instadl", "igdl", "instagram"],
        description: "Download Instagram reels/videos/images. Usage: .ig <Instagram URL>",
    },
    async (from, Guru, conText) => {
        const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } = conText;

        if (!q) {
            await react("❌");
            return reply(toxicBox("INSTAGRAM DOWNLOADER", [
                "⚠️ Send an Instagram URL.",
                "Example: .ig https://www.instagram.com/reel/xxx",
            ], botFooter));
        }

        if (!q.includes("instagram.com")) {
            await react("❌");
            return reply(toxicBox("INSTAGRAM DOWNLOADER", ["❌ Invalid Instagram URL."], botFooter));
        }

        await react("⌛");
        await reply(toxicBox("INSTAGRAM DOWNLOADER", ["⬇️ Fetching Instagram..."], botFooter));

        try {
            let mediaUrl = null, isVideo = true, caption = "";

            // Toxic-MD primary: nexray v2
            try {
                const r = await axios.get(
                    `https://api.nexray.web.id/downloader/v2/instagram?url=${encodeURIComponent(q)}`,
                    { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 20000 }
                );
                const d = r.data?.result;
                if (Array.isArray(d) && d.length) {
                    mediaUrl = d[0]?.url || d[0]?.video || d[0]?.image;
                    isVideo = !!(d[0]?.video || d[0]?.type === "video");
                } else if (d?.url) {
                    mediaUrl = d.url;
                    isVideo = d.type === "video";
                    caption = d.caption || "";
                }
            } catch (_) {}

            // Fallback: nexray v1
            if (!mediaUrl) {
                try {
                    const r = await axios.get(
                        `https://api.nexray.web.id/downloader/instagram?url=${encodeURIComponent(q)}`,
                        { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 20000 }
                    );
                    const d = r.data?.result;
                    if (d?.url) { mediaUrl = d.url; isVideo = d.type !== "image"; caption = d.caption || ""; }
                } catch (_) {}
            }

            // Fallback: GuruTech
            if (!mediaUrl) {
                try {
                    const r = await axios.get(
                        `${GuruTechApi}/api/download/instadl?apikey=${GuruApiKey}&url=${encodeURIComponent(q)}`,
                        { timeout: 15000 }
                    );
                    const d = r.data?.result;
                    if (d?.download_url) { mediaUrl = d.download_url; isVideo = true; }
                } catch (_) {}
            }

            if (!mediaUrl) {
                await react("❌");
                return reply(toxicBox("INSTAGRAM DOWNLOADER", [
                    "❌ Failed to download.",
                    "Make sure the post is public.",
                ], botFooter));
            }

            const boxCaption = toxicBox("INSTAGRAM DOWNLOADER", [
                caption ? `📝 ${caption.substring(0, 80)}${caption.length > 80 ? "..." : ""}` : "📸 Instagram Media",
            ], botFooter);

            const fileSize = await getFileSize(mediaUrl).catch(() => 0);

            if (isVideo) {
                await Guru.sendMessage(from, {
                    ...(fileSize > MAX_MEDIA_SIZE
                        ? { document: { url: mediaUrl }, fileName: "instagram_video.mp4", mimetype: "video/mp4" }
                        : { video: { url: mediaUrl }, mimetype: "video/mp4" }),
                    caption: boxCaption,
                }, { quoted: mek });
            } else {
                await Guru.sendMessage(from, {
                    image: { url: mediaUrl },
                    caption: boxCaption,
                }, { quoted: mek });
            }

            await react("✅");
        } catch (err) {
            console.error("Instagram error:", err);
            await react("❌");
            return reply(toxicBox("INSTAGRAM DOWNLOADER", [`❌ Error: ${err.message}`], botFooter));
        }
    },
);

gmd(
    {
        pattern: "snack",
        category: "downloader",
        react: "🍿",
        aliases: ["snackdl", "snackvideo"],
        description: "Download Snack Video. Usage: .snack <Snack Video URL>",
    },
    async (from, Guru, conText) => {
        const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } = conText;

        if (!q) {
            await react("❌");
            return reply(toxicBox("SNACK VIDEO", [
                "⚠️ Send a Snack Video URL.",
                "Example: .snack https://snackvideo.com/video/xxx",
            ], botFooter));
        }

        if (!q.includes("snackvideo.com")) {
            await react("❌");
            return reply(toxicBox("SNACK VIDEO", ["❌ Invalid Snack Video URL."], botFooter));
        }

        await react("⌛");
        await reply(toxicBox("SNACK VIDEO", ["⬇️ Downloading Snack Video..."], botFooter));

        try {
            const r = await axios.get(
                `${GuruTechApi}/api/download/snackdl?apikey=${GuruApiKey}&url=${encodeURIComponent(q)}`,
                { timeout: 60000 }
            );

            if (!r.data?.success || !r.data?.result?.media) {
                await react("❌");
                return reply(toxicBox("SNACK VIDEO", ["❌ Failed to fetch. Check URL and try again."], botFooter));
            }

            const { title, media, author, like } = r.data.result;

            const fileSize = await getFileSize(media).catch(() => 0);
            await Guru.sendMessage(from, {
                ...(fileSize > MAX_MEDIA_SIZE
                    ? { document: { url: media }, fileName: `${(title || "snack_video").replace(/[^\w\s.-]/gi, "")}.mp4`, mimetype: "video/mp4" }
                    : { video: { url: media }, mimetype: "video/mp4" }),
                caption: toxicBox("SNACK VIDEO", [
                    `🎬 ${title || "Snack Video"}`,
                    `👤 ${author || "Unknown"}`,
                    like ? `❤️ ${like} likes` : null,
                ], botFooter),
            }, { quoted: mek });

            await react("✅");
        } catch (err) {
            console.error("Snack Video error:", err);
            await react("❌");
            return reply(toxicBox("SNACK VIDEO", [`❌ Error: ${err.message}`], botFooter));
        }
    },
);
