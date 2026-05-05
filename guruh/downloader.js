
const {
        gmd,
        gitRepoRegex,
        MAX_MEDIA_SIZE,
        getFileSize,
        getMimeCategory,
        getMimeFromUrl,
    } = require("../guru"),
    GIFTED_DLS = require("gifted-dls"),
    giftedDls = new GIFTED_DLS(),
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
    async (from, Gifted, conText) => {
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

            await Gifted.sendMessage(
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

gmd(
    {
        pattern: "fb",
        category: "downloader",
        react: "📘",
        aliases: ["fbdl", "facebookdl", "facebook"],
        description: "Download Facebook videos",
    },
    async (from, Gifted, conText) => {
        const {
            q,
            mek,
            reply,
            react,
            botName,
            botFooter,
            newsletterJid,
            gmdBuffer,
            toAudio,
            formatAudio,
            GiftedTechApi,
            GiftedApiKey,
        } = conText;

        if (!q) {
            await react("❌");
            return reply("Please provide a Facebook video URL");
        }

        if (!q.includes("facebook.com") && !q.includes("fb.watch")) {
            await react("❌");
            return reply("Please provide a valid Facebook URL");
        }

        try {
            const apiUrl = `${GiftedTechApi}/api/download/facebook?apikey=${GiftedApiKey}&url=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl, { timeout: 60000 });

            if (!response.data?.success || !response.data?.result) {
                await react("❌");
                return reply(
                    "Failed to fetch video. Please check the URL and try again.",
                );
            }

            const { title, duration, thumbnail, hd_video, sd_video } =
                response.data.result;
            const dateNow = Date.now();
            const videoUrl = hd_video || sd_video;

            const buttons = [];
            if (hd_video)
                buttons.push({ id: `fb_hd_${dateNow}`, text: "HD Quality" });
            if (sd_video)
                buttons.push({ id: `fb_sd_${dateNow}`, text: "SD Quality" });
            buttons.push({ id: `fb_audio_${dateNow}`, text: "Audio Only" });

            await sendButtons(Gifted, from, {
                title: `${botName} FACEBOOK DOWNLOADER`,
                text: `*Title:* ${title || "Facebook Video"}\n*Duration:* ${duration || "Unknown"}\n\n*Select download type:*`,
                footer: botFooter,
                image: { url: thumbnail },
                buttons: buttons,
            });

            const handleResponse = async (event) => {
                const messageData = event.messages[0];
                if (!messageData.message) return;

                const selectedButtonId = extractButtonId(messageData.message);
                if (!selectedButtonId) return;
                if (!selectedButtonId.includes(`_${dateNow}`)) return;

                const isFromSameChat = messageData.key?.remoteJid === from;
                if (!isFromSameChat) return;

                await react("⬇️");

                try {
                    if (selectedButtonId.startsWith("fb_audio")) {
                        const sourceVideo = hd_video || sd_video;
                        if (!sourceVideo) {
                            await react("❌");
                            return reply(
                                "No video available for audio extraction.",
                                messageData,
                            );
                        }

                        const videoBuffer = await gmdBuffer(sourceVideo);
                        if (!videoBuffer || videoBuffer instanceof Error || !Buffer.isBuffer(videoBuffer)) {
                            await react("❌");
                            return reply(
                                "Failed to download video for audio extraction. Please try again.",
                                messageData,
                            );
                        }
                        let audioBuffer;
                        try {
                            audioBuffer = await toAudio(videoBuffer);
                        } catch (audioErr) {
                            await react("❌");
                            const errMsg = audioErr.message || String(audioErr);
                            if (errMsg.includes('no audio')) {
                                return reply("This video has no audio track to extract.", messageData);
                            }
                            return reply("Failed to convert video to audio: " + errMsg, messageData);
                        }
                        if (!audioBuffer || !Buffer.isBuffer(audioBuffer)) {
                            await react("❌");
                            return reply(
                                "Failed to convert video to audio. The video format may not be supported.",
                                messageData,
                            );
                        }
                        const fileSize = audioBuffer.length;

                        if (fileSize > MAX_MEDIA_SIZE) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: audioBuffer,
                                    fileName: `${(title || "facebook_audio").replace(/[^\w\s.-]/gi, "")}.mp3`,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        }
                    } else {
                        const selectedVideoUrl = selectedButtonId.startsWith(
                            "fb_hd",
                        )
                            ? hd_video
                            : sd_video;

                        if (!selectedVideoUrl) {
                            await react("❌");
                            return reply(
                                "Selected quality not available.",
                                messageData,
                            );
                        }

                        const fileSize = await getFileSize(selectedVideoUrl);
                        const sendAsDoc = fileSize > MAX_MEDIA_SIZE;

                        if (sendAsDoc) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: { url: selectedVideoUrl },
                                    fileName: `${(title || "facebook_video").replace(/[^\w\s.-]/gi, "")}.mp4`,
                                    mimetype: "video/mp4",
                                    caption: `*${title || "Facebook Video"}*`,
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    video: { url: selectedVideoUrl },
                                    mimetype: "video/mp4",
                                    caption: `*${title || "Facebook Video"}*`,
                                },
                                { quoted: messageData },
                            );
                        }
                    }

                    await react("✅");
                } catch (error) {
                    console.error("Facebook download error:", error);
                    await react("❌");
                    await reply(
                        "Failed to download. Please try again.",
                        messageData,
                    );
                }
            };

            Gifted.ev.on("messages.upsert", handleResponse);
            setTimeout(
                () => Gifted.ev.off("messages.upsert", handleResponse),
                300000,
            );
        } catch (error) {
            console.error("Facebook API error:", error);
            await react("❌");
            return reply("An error occurred. Please try again.");
        }
    },
);

gmd(
    {
        pattern: "tiktok",
        category: "downloader",
        react: "🎵",
        aliases: ["tiktokdl", "ttdl", "tt"],
        description: "Download TikTok videos",
    },
    async (from, Gifted, conText) => {
        const {
            q,
            mek,
            reply,
            react,
            botName,
            botFooter,
            newsletterJid,
            gmdBuffer,
            toAudio,
            formatAudio,
            GiftedTechApi,
            GiftedApiKey,
        } = conText;

        if (!q) {
            await react("❌");
            return reply("Please provide a TikTok URL");
        }

        if (!q.includes("tiktok.com")) {
            await react("❌");
            return reply("Please provide a valid TikTok URL");
        }

        try {
            const endpoints = [
                "tiktok",
                "tiktokdlv2",
                "tiktokdlv3",
                "tiktokdlv4",
            ];

            const t0 = Date.now();
            const result = await Promise.any(
                endpoints.map(endpoint => {
                    const apiUrl = `${GiftedTechApi}/api/download/${endpoint}?apikey=${GiftedApiKey}&url=${encodeURIComponent(q)}`;
                    return axios.get(apiUrl, { timeout: 20000 }).then(res => {
                        if (res.data?.success && res.data?.result) {
                            return res.data.result;
                        }
                        throw new Error(`${endpoint}: no result`);
                    });
                })
            ).catch(() => null);

            if (!result) {
                await react("❌");
                return reply(
                    "Failed to fetch TikTok video. Please try again later.",
                );
            }

            const { title, video, music, cover, author } = result;
            const dateNow = Date.now();

            const buttons = [
                { id: `tt_video_${dateNow}`, text: "Video" },
                { id: `tt_audio_${dateNow}`, text: "Audio Only" },
            ];

            await sendButtons(Gifted, from, {
                title: `${botName} TIKTOK DOWNLOADER`,
                text: `*Title:* ${title || "TikTok Video"}\n*Author:* ${author?.name || "Unknown"}\n\n*Select download type:*`,
                footer: botFooter,
                image: { url: cover },
                buttons: buttons,
            });

            const handleResponse = async (event) => {
                const messageData = event.messages[0];
                if (!messageData.message) return;

                const selectedButtonId = extractButtonId(messageData.message);
                if (!selectedButtonId) return;
                if (!selectedButtonId.includes(`_${dateNow}`)) return;

                const isFromSameChat = messageData.key?.remoteJid === from;
                if (!isFromSameChat) return;

                await react("⬇️");

                try {
                    if (selectedButtonId.startsWith("tt_video")) {
                        const fileSize = await getFileSize(video);
                        const sendAsDoc = fileSize > MAX_MEDIA_SIZE;

                        if (sendAsDoc) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: { url: video },
                                    fileName: `${(title || "tiktok_video").replace(/[^\w\s.-]/gi, "")}.mp4`,
                                    mimetype: "video/mp4",
                                    caption: `*${title || "TikTok Video"}*`,
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    video: { url: video },
                                    mimetype: "video/mp4",
                                    caption: `*${title || "TikTok Video"}*`,
                                },
                                { quoted: messageData },
                            );
                        }
                    } else if (selectedButtonId.startsWith("tt_audio")) {
                        let audioBuffer;

                        if (music) {
                            audioBuffer = await gmdBuffer(music);
                            audioBuffer = await formatAudio(audioBuffer);
                        } else {
                            const videoBuffer = await gmdBuffer(video);
                            audioBuffer = await toAudio(videoBuffer);
                        }

                        const fileSize = audioBuffer.length;

                        if (fileSize > MAX_MEDIA_SIZE) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: audioBuffer,
                                    fileName: `${(title || "tiktok_audio").replace(/[^\w\s.-]/gi, "")}.mp3`,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        }
                    }

                    await react("✅");
                } catch (error) {
                    console.error("TikTok download error:", error);
                    await react("❌");
                    await reply(
                        "Failed to download. Please try again.",
                        messageData,
                    );
                }
            };

            Gifted.ev.on("messages.upsert", handleResponse);
            setTimeout(
                () => Gifted.ev.off("messages.upsert", handleResponse),
                300000,
            );
        } catch (error) {
            console.error("TikTok API error:", error);
            await react("❌");
            return reply("An error occurred. Please try again.");
        }
    },
);

gmd(
    {
        pattern: "twitter",
        category: "downloader",
        react: "🐦",
        aliases: ["twitterdl", "xdl", "xdownloader", "twitterdownloader", "x"],
        description: "Download Twitter/X videos",
    },
    async (from, Gifted, conText) => {
        const {
            q,
            mek,
            reply,
            react,
            botName,
            botFooter,
            newsletterJid,
            gmdBuffer,
            toAudio,
            formatAudio,
            GiftedTechApi,
            GiftedApiKey,
        } = conText;

        if (!q) {
            await react("❌");
            return reply("Please provide a Twitter/X URL");
        }

        if (!q.includes("twitter.com") && !q.includes("x.com")) {
            await react("❌");
            return reply("Please provide a valid Twitter/X URL");
        }

        try {
            const apiUrl = `${GiftedTechApi}/api/download/twitter?apikey=${GiftedApiKey}&url=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl, { timeout: 60000 });

            if (!response.data?.success || !response.data?.result) {
                await react("❌");
                return reply(
                    "Failed to fetch video. Please check the URL and try again.",
                );
            }

            const { thumbnail, videoUrls } = response.data.result;

            if (!videoUrls || videoUrls.length === 0) {
                await react("❌");
                return reply("No video found in this tweet.");
            }

            const dateNow = Date.now();
            const buttons = videoUrls.map((v, index) => ({
                id: `tw_${index}_${dateNow}`,
                text: `${v.quality} Quality`,
            }));
            buttons.push({ id: `tw_audio_${dateNow}`, text: "Audio Only" });

            await sendButtons(Gifted, from, {
                title: `${botName} TWITTER DOWNLOADER`,
                text: `*Available qualities:* ${videoUrls.map((v) => v.quality).join(", ")}\n\n*Select download type:*`,
                footer: botFooter,
                image: { url: thumbnail },
                buttons: buttons,
            });

            const handleResponse = async (event) => {
                const messageData = event.messages[0];
                if (!messageData.message) return;

                const selectedButtonId = extractButtonId(messageData.message);
                if (!selectedButtonId) return;
                if (!selectedButtonId.includes(`_${dateNow}`)) return;

                const isFromSameChat = messageData.key?.remoteJid === from;
                if (!isFromSameChat) return;

                await react("⬇️");

                try {
                    if (selectedButtonId.startsWith("tw_audio")) {
                        const bestVideo = videoUrls[0]?.url;
                        if (!bestVideo) {
                            await react("❌");
                            return reply(
                                "No video available for audio extraction.",
                                messageData,
                            );
                        }

                        const videoBuffer = await gmdBuffer(bestVideo);
                        const audioBuffer = await toAudio(videoBuffer);
                        const fileSize = audioBuffer.length;

                        if (fileSize > MAX_MEDIA_SIZE) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: audioBuffer,
                                    fileName: "twitter_audio.mp3",
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        }
                    } else {
                        const index = parseInt(selectedButtonId.split("_")[1]);
                        const videoUrl = videoUrls[index]?.url;

                        if (!videoUrl) {
                            await react("❌");
                            return reply(
                                "Selected quality not available.",
                                messageData,
                            );
                        }

                        const fileSize = await getFileSize(videoUrl);
                        const sendAsDoc = fileSize > MAX_MEDIA_SIZE;

                        if (sendAsDoc) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: { url: videoUrl },
                                    fileName: `twitter_video_${videoUrls[index].quality}.mp4`,
                                    mimetype: "video/mp4",
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    video: { url: videoUrl },
                                    mimetype: "video/mp4",
                                },
                                { quoted: messageData },
                            );
                        }
                    }

                    await react("✅");
                } catch (error) {
                    console.error("Twitter download error:", error);
                    await react("❌");
                    await reply(
                        "Failed to download. Please try again.",
                        messageData,
                    );
                }
            };

            Gifted.ev.on("messages.upsert", handleResponse);
            setTimeout(
                () => Gifted.ev.off("messages.upsert", handleResponse),
                300000,
            );
        } catch (error) {
            console.error("Twitter API error:", error);
            await react("❌");
            return reply("An error occurred. Please try again.");
        }
    },
);

gmd(
    {
        pattern: "ig",
        category: "downloader",
        react: "📸",
        aliases: ["insta", "instadl", "igdl", "instagram"],
        description: "Download Instagram reels/videos",
    },
    async (from, Gifted, conText) => {
        const {
            q,
            mek,
            reply,
            react,
            botName,
            botFooter,
            newsletterJid,
            gmdBuffer,
            toAudio,
            formatAudio,
            GiftedTechApi,
            GiftedApiKey,
        } = conText;

        if (!q) {
            await react("❌");
            return reply("Please provide an Instagram URL");
        }

        if (!q.includes("instagram.com")) {
            await react("❌");
            return reply("Please provide a valid Instagram URL");
        }

        try {
            const apiUrl = `${GiftedTechApi}/api/download/instadl?apikey=${GiftedApiKey}&url=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl, { timeout: 60000 });

            if (!response.data?.success || !response.data?.result) {
                await react("❌");
                return reply(
                    "Failed to fetch content. Please check the URL and try again.",
                );
            }

            const { thumbnail, download_url } = response.data.result;

            if (!download_url) {
                await react("❌");
                return reply("No downloadable content found.");
            }

            const dateNow = Date.now();

            await sendButtons(Gifted, from, {
                title: `${botName} INSTAGRAM DOWNLOADER`,
                text: `*Select download type:*`,
                footer: botFooter,
                image: { url: thumbnail },
                buttons: [
                    { id: `ig_video_${dateNow}`, text: "Video" },
                    { id: `ig_audio_${dateNow}`, text: "Audio Only" },
                ],
            });

            const handleResponse = async (event) => {
                const messageData = event.messages[0];
                if (!messageData.message) return;

                const selectedButtonId = extractButtonId(messageData.message);
                if (!selectedButtonId) return;
                if (!selectedButtonId.includes(`_${dateNow}`)) return;

                const isFromSameChat = messageData.key?.remoteJid === from;
                if (!isFromSameChat) return;

                await react("⬇️");

                try {
                    if (selectedButtonId.startsWith("ig_audio")) {
                        const videoBuffer = await gmdBuffer(download_url);
                        const audioBuffer = await toAudio(videoBuffer);
                        const fileSize = audioBuffer.length;

                        if (fileSize > MAX_MEDIA_SIZE) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: audioBuffer,
                                    fileName: "instagram_audio.mp3",
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        }
                    } else {
                        const fileSize = await getFileSize(download_url);
                        const sendAsDoc = fileSize > MAX_MEDIA_SIZE;

                        if (sendAsDoc) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: { url: download_url },
                                    fileName: "instagram_video.mp4",
                                    mimetype: "video/mp4",
                                    caption: `*Downloaded via ${botName}*`,
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    video: { url: download_url },
                                    mimetype: "video/mp4",
                                    caption: `*Downloaded via ${botName}*`,
                                },
                                { quoted: messageData },
                            );
                        }
                    }

                    await react("✅");
                } catch (error) {
                    console.error("Instagram download error:", error);
                    await react("❌");
                    await reply(
                        "Failed to download. Please try again.",
                        messageData,
                    );
                }
            };

            Gifted.ev.on("messages.upsert", handleResponse);
            setTimeout(
                () => Gifted.ev.off("messages.upsert", handleResponse),
                300000,
            );
        } catch (error) {
            console.error("Instagram API error:", error);
            await react("❌");
            return reply("An error occurred. Please try again.");
        }
    },
);

gmd(
    {
        pattern: "snack",
        category: "downloader",
        react: "🍿",
        aliases: ["snackdl", "snackvideo"],
        description: "Download Snack Video",
    },
    async (from, Gifted, conText) => {
        const {
            q,
            mek,
            reply,
            react,
            botName,
            botFooter,
            newsletterJid,
            gmdBuffer,
            toAudio,
            formatAudio,
            GiftedTechApi,
            GiftedApiKey,
        } = conText;

        if (!q) {
            await react("❌");
            return reply("Please provide a Snack Video URL");
        }

        if (!q.includes("snackvideo.com")) {
            await react("❌");
            return reply("Please provide a valid Snack Video URL");
        }

        try {
            const apiUrl = `${GiftedTechApi}/api/download/snackdl?apikey=${GiftedApiKey}&url=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl, { timeout: 60000 });

            if (!response.data?.success || !response.data?.result) {
                await react("❌");
                return reply(
                    "Failed to fetch video. Please check the URL and try again.",
                );
            }

            const { title, media, thumbnail, author, like, comment, share } =
                response.data.result;

            if (!media) {
                await react("❌");
                return reply("No video found.");
            }

            const dateNow = Date.now();

            await sendButtons(Gifted, from, {
                title: `${botName} SNACK VIDEO`,
                text: `*Title:* ${title || "Snack Video"}\n*Author:* ${author || "Unknown"}\n*Likes:* ${like || "0"}\n\n*Select download type:*`,
                footer: botFooter,
                image: { url: thumbnail },
                buttons: [
                    { id: `sn_video_${dateNow}`, text: "Video" },
                    { id: `sn_audio_${dateNow}`, text: "Audio Only" },
                ],
            });

            const handleResponse = async (event) => {
                const messageData = event.messages[0];
                if (!messageData.message) return;

                const selectedButtonId = extractButtonId(messageData.message);
                if (!selectedButtonId) return;
                if (!selectedButtonId.includes(`_${dateNow}`)) return;

                const isFromSameChat = messageData.key?.remoteJid === from;
                if (!isFromSameChat) return;

                await react("⬇️");

                try {
                    if (selectedButtonId.startsWith("sn_video")) {
                        const fileSize = await getFileSize(media);
                        const sendAsDoc = fileSize > MAX_MEDIA_SIZE;

                        if (sendAsDoc) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: { url: media },
                                    fileName: `${(title || "snack_video").replace(/[^\w\s.-]/gi, "")}.mp4`,
                                    mimetype: "video/mp4",
                                    caption: `*${title || "Snack Video"}*`,
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    video: { url: media },
                                    mimetype: "video/mp4",
                                    caption: `*${title || "Snack Video"}*`,
                                },
                                { quoted: messageData },
                            );
                        }
                    } else if (selectedButtonId.startsWith("sn_audio")) {
                        const videoBuffer = await gmdBuffer(media);
                        const audioBuffer = await toAudio(videoBuffer);
                        const fileSize = audioBuffer.length;

                        if (fileSize > MAX_MEDIA_SIZE) {
                            await Gifted.sendMessage(
                                from,
                                {
                                    document: audioBuffer,
                                    fileName: `${(title || "snack_audio").replace(/[^\w\s.-]/gi, "")}.mp3`,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        } else {
                            await Gifted.sendMessage(
                                from,
                                {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                },
                                { quoted: messageData },
                            );
                        }
                    }

                    await react("✅");
                } catch (error) {
                    console.error("Snack Video download error:", error);
                    await react("❌");
                    await reply(
                        "Failed to download. Please try again.",
                        messageData,
                    );
                }
            };

            Gifted.ev.on("messages.upsert", handleResponse);
            setTimeout(
                () => Gifted.ev.off("messages.upsert", handleResponse),
                300000,
            );
        } catch (error) {
            console.error("Snack Video API error:", error);
            await react("❌");
            return reply("An error occurred. Please try again.");
        }
    },
);
