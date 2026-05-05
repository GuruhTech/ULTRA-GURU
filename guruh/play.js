const { gmd, toPtt } = require("../guru");
const yts = require("yt-search");
const axios = require("axios");

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

const {
  downloadContentFromMessage,
  generateWAMessageFromContent,
  normalizeMessageContent,
} = require("gifted-baileys");
const { sendButtons } = require("gifted-btns");

// Working Audio APIs (apiskeith.top is primary)
const getAudioApis = (url) => [
    `https://apiskeith.top/download/audio?url=${encodeURIComponent(url)}`,
    `https://wadownloader.amitdas.site/api/yt?url=${encodeURIComponent(url)}`,
    `https://silva-md-bot.onrender.com/api/download?url=${encodeURIComponent(url)}`,
    `https://api-xeon.tech/api/download/ytmp3?url=${encodeURIComponent(url)}`,
];

// Working Video APIs
const getVideoApis = (url) => [
    `https://apiskeith.top/download/video?url=${encodeURIComponent(url)}`,
    `https://wadownloader.amitdas.site/api/yt?url=${encodeURIComponent(url)}&type=video`,
    `https://silva-md-bot.onrender.com/api/download?url=${encodeURIComponent(url)}`,
    `https://api-xeon.tech/api/download/ytmp4?url=${encodeURIComponent(url)}`,
];

const isValidBuffer = (buf) => Buffer.isBuffer(buf) && buf.length > 10240;

async function queryAPI(url, endpoints, timeout = 30000) {
    const errors = [];

    for (const endpoint of endpoints) {
        try {
            const apiUrl = endpoint;
            console.log(`🔄 Trying API: ${apiUrl}`);
            
            const response = await axios.get(apiUrl, { timeout });
            
            // Handle apiskeith.top response format
            let downloadUrl = null;
            let title = null;
            let duration = null;
            
            if (response.data.status === true && response.data.result) {
                downloadUrl = response.data.result;
                title = response.data.title;
                duration = response.data.duration;
                console.log(`✅ apiskeith.top API working!`);
            }
            // Handle other API response formats
            else if (response.data.download_url) {
                downloadUrl = response.data.download_url;
                title = response.data.title;
                duration = response.data.duration;
            } else if (response.data.result?.download_url) {
                downloadUrl = response.data.result.download_url;
                title = response.data.result.title;
                duration = response.data.result.duration;
            } else if (response.data.url) {
                downloadUrl = response.data.url;
                title = response.data.title;
            } else if (response.data.link) {
                downloadUrl = response.data.link;
                title = response.data.title;
            } else if (response.data.data?.url) {
                downloadUrl = response.data.data.url;
                title = response.data.data.title;
            }
            
            if (downloadUrl) {
                console.log(`✅ API working: ${endpoint}`);
                return { success: true, download_url: downloadUrl, title, duration, usedApi: endpoint };
            }
        } catch (error) {
            console.log(`❌ API failed: ${error.message}`);
            errors.push(`${endpoint}: ${error.message}`);
        }
    }
    
    return { success: false, error: `All APIs failed: ${errors.join(', ')}` };
}

gmd(
  {
    pattern: "play",
    aliases: ["ytmp3", "ytmp3doc", "audiodoc", "yta"],
    category: "downloader",
    react: "🎶",
    description: "Download Audio from Youtube",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      reply,
      react,
      botPic,
      botName,
      botFooter,
      gmdBuffer,
      formatAudio,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a song name or YouTube link");
    }

    try {
      // Check if input is a YouTube URL or search query
      let videoUrl;
      let videoInfo;
      
      if (q.includes('youtube.com/watch') || q.includes('youtu.be/')) {
        videoUrl = q;
        // Extract video ID to get info
        let videoId;
        if (q.includes('youtube.com/watch')) {
          videoId = q.split('v=')[1]?.split('&')[0];
        } else {
          videoId = q.split('/').pop();
        }
        const searchResponse = await yts({ videoId });
        videoInfo = searchResponse;
      } else {
        // Search for the video
        const searchResponse = await yts(q);
        if (!searchResponse.videos.length) {
          return reply("❌ No video found for your query.");
        }
        videoInfo = searchResponse.videos[0];
        videoUrl = videoInfo.url;
      }
      
      const title = videoInfo.title || videoInfo.name || "Unknown Title";
      const duration = videoInfo.timestamp || videoInfo.duration || "Unknown";
      const thumbnail = videoInfo.thumbnail || videoInfo.image || botPic;
      
      await react("🔍");
      
      // Try APIs for audio download
      const audioApis = getAudioApis(videoUrl);
      const result = await queryAPI(videoUrl, audioApis, 30000);
      
      if (!result.success) {
        await react("❌");
        return reply("❌ All download services are currently unavailable. Please try again later.");
      }
      
      let buffer = await gmdBuffer(result.download_url);
      
      if (!isValidBuffer(buffer)) {
        await react("❌");
        return reply("Failed to download audio. Please try again later.");
      }
      
      // Large file handling (over 60MB)
      if (buffer.length > 60 * 1024 * 1024) {
        await react("📄");
        const convertedBuffer = await formatAudio(buffer);
        await Gifted.sendMessage(from, {
          document: convertedBuffer,
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`.replace(/[^\w\s.-]/gi, ""),
          caption: `🎵 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n\n_File too large - sent as document_`,
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
          { id: `audio_${buttonId}`, text: "Audio 🎶" },
          { id: `doc_${buttonId}`, text: "Document 📄" },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "▶️ Watch on YouTube",
              url: videoUrl,
            }),
          },
        ],
      });
      
      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData.message) return;
        
        const selectedButtonId = extractButtonId(messageData.message);
        if (!selectedButtonId) return;
        
        const isFromSameChat = messageData.key?.remoteJid === from;
        if (!isFromSameChat || !selectedButtonId.includes(dateNow.toString())) return;
        
        await react("⬇️");
        
        try {
          if (selectedButtonId.startsWith('audio_')) {
            const convertedBuffer = await formatAudio(buffer);
            await Gifted.sendMessage(
              from,
              {
                audio: convertedBuffer,
                mimetype: "audio/mpeg",
                ptt: false,
              },
              { quoted: messageData }
            );
          } else if (selectedButtonId.startsWith('doc_')) {
            const convertedBuffer = await formatAudio(buffer);
            await Gifted.sendMessage(
              from,
              {
                document: convertedBuffer,
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`.replace(/[^\w\s.-]/gi, ""),
                caption: `🎵 ${title}`,
              },
              { quoted: messageData }
            );
          } else {
            return;
          }
          
          await react("✅");
        } catch (error) {
          console.error("Error sending media:", error);
          await react("❌");
          await Gifted.sendMessage(from, { text: "Failed to send media. Please try again." }, { quoted: messageData });
        }
      };
      
      Gifted.ev.on("messages.upsert", handleResponse);
      
      setTimeout(() => {
        Gifted.ev.off("messages.upsert", handleResponse);
      }, 300000);
      
    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("❌ Oops! Something went wrong. Please try again.\n\nError: " + error.message);
    }
  },
);

gmd(
  {
    pattern: "video",
    aliases: ["ytmp4doc", "mp4", "ytmp4", "dlmp4"],
    category: "downloader",
    react: "🎥",
    description: "Download Video from Youtube",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      reply,
      react,
      botPic,
      botName,
      botFooter,
      gmdBuffer,
      formatVideo,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a video name or YouTube link");
    }

    try {
      // Check if input is a YouTube URL or search query
      let videoUrl;
      let videoInfo;
      
      if (q.includes('youtube.com/watch') || q.includes('youtu.be/')) {
        videoUrl = q;
        let videoId;
        if (q.includes('youtube.com/watch')) {
          videoId = q.split('v=')[1]?.split('&')[0];
        } else {
          videoId = q.split('/').pop();
        }
        const searchResponse = await yts({ videoId });
        videoInfo = searchResponse;
      } else {
        const searchResponse = await yts(q);
        if (!searchResponse.videos.length) {
          return reply("❌ No video found for your query.");
        }
        videoInfo = searchResponse.videos[0];
        videoUrl = videoInfo.url;
      }
      
      const title = videoInfo.title || videoInfo.name || "Unknown Title";
      const duration = videoInfo.timestamp || videoInfo.duration || "Unknown";
      const thumbnail = videoInfo.thumbnail || videoInfo.image || botPic;
      
      await react("🔍");
      
      // Try APIs for video download
      const videoApis = getVideoApis(videoUrl);
      const result = await queryAPI(videoUrl, videoApis, 30000);
      
      if (!result.success) {
        await react("❌");
        return reply("❌ All download services are currently unavailable. Please try again later.");
      }
      
      let buffer = await gmdBuffer(result.download_url);
      
      if (!isValidBuffer(buffer)) {
        await react("❌");
        return reply("Failed to download video. Please try again later.");
      }
      
      const sizeMB = buffer.length / (1024 * 1024);
      
      // Large file handling (over 100MB)
      if (sizeMB > 100) {
        await react("📄");
        await Gifted.sendMessage(from, {
          document: buffer,
          mimetype: "video/mp4",
          fileName: `${title}.mp4`.replace(/[^\w\s.-]/gi, ""),
          caption: `🎥 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n📦 *Size:* ${sizeMB.toFixed(2)} MB\n\n_File too large - sent as document_`,
        });
        await react("✅");
        return;
      }
      
      if (sizeMB > 20) {
        await reply("⏳ File is large, processing might take a while...");
      }
      
      const dateNow = Date.now();
      const buttonId = `video_${dateNow}`;
      
      await sendButtons(Gifted, from, {
        title: `${botName} 🎥 VIDEO DOWNLOADER`,
        text: `🎬 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n📦 *Size:* ${sizeMB.toFixed(2)} MB\n\n*Select download format:*`,
        footer: botFooter,
        image: { url: thumbnail },
        buttons: [
          { id: `vid_${buttonId}`, text: "Video 🎥" },
          { id: `doc_${buttonId}`, text: "Document 📄" },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "▶️ Watch on YouTube",
              url: videoUrl,
            }),
          },
        ],
      });
      
      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData.message) return;
        
        const selectedButtonId = extractButtonId(messageData.message);
        if (!selectedButtonId) return;
        
        const isFromSameChat = messageData.key?.remoteJid === from;
        if (!isFromSameChat || !selectedButtonId.includes(dateNow.toString())) return;
        
        await react("⬇️");
        
        try {
          if (selectedButtonId.startsWith('vid_')) {
            const formattedVideo = await formatVideo(buffer);
            await Gifted.sendMessage(
              from,
              {
                video: formattedVideo,
                mimetype: "video/mp4",
                caption: `🎬 ${title}`,
              },
              { quoted: messageData }
            );
          } else if (selectedButtonId.startsWith('doc_')) {
            await Gifted.sendMessage(
              from,
              {
                document: buffer,
                mimetype: "video/mp4",
                fileName: `${title}.mp4`.replace(/[^\w\s.-]/gi, ""),
                caption: `📄 ${title}`,
              },
              { quoted: messageData }
            );
          } else {
            return;
          }
          
          await react("✅");
        } catch (error) {
          console.error("Error sending media:", error);
          await react("❌");
          await Gifted.sendMessage(from, { text: "Failed to send media. Please try again." }, { quoted: messageData });
        }
      };
      
      Gifted.ev.on("messages.upsert", handleResponse);
      
      setTimeout(() => {
        Gifted.ev.off("messages.upsert", handleResponse);
      }, 300000);
      
    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("❌ Oops! Something went wrong. Please try again.\n\nError: " + error.message);
    }
  },
);
