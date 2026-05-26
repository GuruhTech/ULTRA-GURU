const { gmd } = require("../guru");
const yts = require("yt-search");
const axios = require("axios");
const { sendButtons } = require("gifted-btns");

const API_BASE = "https://apis.davidcyril.name.ng";
const API_TIMEOUT = 25000;

function extractButtonId(msg) {
    if (!msg) return null;

    const text = msg.conversation || msg.extendedTextMessage?.text || '';
    if (text && /^(audio_|doc_)play_/.test(text)) return text.trim();

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

async function fetchAudio(query) {
    const url = `${API_BASE}/play?query=${encodeURIComponent(query)}`;
    console.log(`[play] Fetching: ${url}`);
    const res = await axios.get(url, { timeout: API_TIMEOUT });
    const d = res.data;
    if (d.status === true && d.result?.download_url) {
        return {
            download_url: d.result.download_url,
            title: d.result.title,
            duration: d.result.duration,
            thumbnail: d.result.thumbnail,
            video_url: d.result.video_url,
        };
    }
    throw new Error(d.message || "API returned no download URL");
}

gmd(
    {
        pattern: "play",
        aliases: ["ytmp3", "ytmp3doc", "audiodoc", "yta"],
        category: "downloader",
        react: "🎶",
        description: "Download Audio from YouTube",
    },
    async (from, Gifted, conText) => {
        const { q, reply, react, botPic, botName, botFooter, gmdBuffer, formatAudio } = conText;

        if (!q) {
            await react("❌");
            return reply("Please provide a song name or YouTube link.\n\nExample: *.play mambichwa*");
        }

        try {
            await react("🔍");

            let videoUrl, videoTitle, videoThumbnail, videoDuration;

            if (q.includes("youtube.com/watch") || q.includes("youtu.be/")) {
                const videoId = q.includes("youtube.com/watch")
                    ? q.split("v=")[1]?.split("&")[0]
                    : q.split("/").pop()?.split("?")[0];

                const info = await yts({ videoId });
                videoUrl = q;
                videoTitle = info.title || info.name || q;
                videoThumbnail = info.thumbnail || info.image || botPic;
                videoDuration = info.timestamp || info.duration || "Unknown";
            } else {
                const search = await yts(q);
                if (!search.videos.length) {
                    await react("❌");
                    return reply("❌ No results found for *" + q + "*. Try a different song name.");
                }
                const top = search.videos[0];
                videoUrl = top.url;
                videoTitle = top.title || q;
                videoThumbnail = top.thumbnail || top.image || botPic;
                videoDuration = top.timestamp || top.duration || "Unknown";
            }

            let apiResult;
            try {
                apiResult = await fetchAudio(videoTitle);
            } catch (err) {
                console.log(`[play] API error: ${err.message}`);
                await react("❌");
                return reply("❌ Could not fetch audio for *" + videoTitle + "*.\nPlease try again later.");
            }

            const title = apiResult.title || videoTitle;
            const duration = apiResult.duration || videoDuration;
            const thumbnail = apiResult.thumbnail || videoThumbnail;
            const watchUrl = apiResult.video_url || videoUrl;

            const buffer = await gmdBuffer(apiResult.download_url);

            if (!Buffer.isBuffer(buffer) || buffer.length < 0x2800) {
                await react("❌");
                return reply("❌ Failed to download audio. Please try again.");
            }

            if (buffer.length > 60 * 1024 * 1024) {
                await react("📄");
                const converted = await formatAudio(buffer);
                await Gifted.sendMessage(from, {
                    document: converted,
                    mimetype: "audio/mpeg",
                    fileName: `${title.replace(/[^\w\s.-]/gi, "")}.mp3`,
                    caption: `🎵 *${title}*\n⏱️ ${duration}\n\n_File too large — sent as document_`,
                });
                await react("✅");
                return;
            }

            const dateNow = Date.now();
            const buttonId = `play_${dateNow}`;

            await sendButtons(Gifted, from, {
                title: `${botName} 🎵 SONG DOWNLOADER`,
                text: `🎶 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n\n*Select download format:*`,
                footer: botFooter,
                image: { url: thumbnail },
                buttons: [
                    { id: `audio_${buttonId}`, text: "Audio 🎵" },
                    { id: `doc_${buttonId}`,   text: "Document 📄" },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "▶️ Watch on YouTube",
                            url: watchUrl,
                        }),
                    },
                ],
            });

            const handleResponse = async (event) => {
                const messageData = event.messages[0];
                if (!messageData?.message) return;

                const selectedId = extractButtonId(messageData.message);
                if (!selectedId) return;

                const isFromSameChat = messageData.key?.remoteJid === from;
                if (!isFromSameChat || !selectedId.includes(dateNow.toString())) return;

                Gifted.ev.off("messages.upsert", handleResponse);
                await react("⬇️");

                try {
                    const converted = await formatAudio(buffer);

                    if (selectedId.startsWith("audio_")) {
                        await Gifted.sendMessage(
                            from,
                            { audio: converted, mimetype: "audio/mpeg", ptt: false },
                            { quoted: messageData }
                        );
                    } else if (selectedId.startsWith("doc_")) {
                        await Gifted.sendMessage(
                            from,
                            {
                                document: converted,
                                mimetype: "audio/mpeg",
                                fileName: `${title.replace(/[^\w\s.-]/gi, "")}.mp3`,
                                caption: `🎵 ${title}`,
                            },
                            { quoted: messageData }
                        );
                    } else {
                        return;
                    }

                    await react("✅");
                } catch (err) {
                    console.error("[play] Send error:", err.message);
                    await react("❌");
                    await Gifted.sendMessage(from, { text: "❌ Failed to send audio. Please try again." }, { quoted: messageData });
                }
            };

            Gifted.ev.on("messages.upsert", handleResponse);

            setTimeout(() => {
                Gifted.ev.off("messages.upsert", handleResponse);
            }, 5 * 60 * 1000);

        } catch (error) {
            console.error("[play] Unexpected error:", error.message);
            await react("❌");
            return reply("❌ Something went wrong. Please try again.\n\nError: " + error.message);
        }
    }
);
