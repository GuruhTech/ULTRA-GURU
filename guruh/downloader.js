var _0x8cb412=function(){return ![]};
const { gmd, toPtt } = require("../guru");
const yts = require("yt-search");
const axios = require("axios");

function extractButtonId(msg) {
    if (!msg) return null;

    // Plain-text button reply (most common on newer WA versions)
    const text = msg.conversation || msg.extendedTextMessage?.text || '';
    if (text && /^(audio_|doc_|vid_)/.test(text)) return text.trim();

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
} = require("@whiskeysockets/baileys");
const { sendButtons } = require("gifted-btns");

const BASE = "https://apis.davidcyril.name.ng";

// Single audio API — returns direct MP3 download URL
const getAudioApis = (url, query) => [
    { url: `${BASE}/play?query=${encodeURIComponent(query || url)}`, timeout: 25000 },
];

// Single video API — returns direct MP4 download URL
const getVideoApis = (url) => [
    { url: `${BASE}/download/savetube?url=${encodeURIComponent(url)}`, timeout: 25000 },
];

const isValidBuffer = (buf) => Buffer.isBuffer(buf) && buf.length > 0x2800;

async function queryAPI(url, endpoints) {
    const errors = [];

    for (const ep of endpoints) {
        const endpoint = typeof ep === 'string' ? ep : ep.url;
        const timeout = typeof ep === 'object' ? ep.timeout : 20000;
        const audioOnly = typeof ep === 'object' ? ep.audioOnly : false;

        try {
            console.log(`🔄 Trying API: ${endpoint}`);
            const response = await axios.get(endpoint, { timeout });
            const d = response.data;

            let downloadUrl = null;
            let title = null;
            let duration = null;
            let thumbnail = null;

            // Format: { status: true, result: { download_url, title, duration, thumbnail } }
            if (d.status === true && d.result?.download_url) {
                downloadUrl = d.result.download_url;
                title = d.result.title;
                duration = d.result.duration;
                thumbnail = d.result.thumbnail;

            // Format: { success: true, data: { download_url, title, duration, cover } }
            } else if (d.success === true && d.data?.download_url) {
                downloadUrl = d.data.download_url;
                title = d.data.title;
                duration = d.data.duration;
                thumbnail = d.data.cover;

            // Format: { success: true, data: { medias: [...], title, thumbnail } }
            } else if (d.success === true && Array.isArray(d.data?.medias)) {
                // For audio: prefer smallest mp4 (has audio track). For video: prefer mp4 video
                let media;
                if (audioOnly) {
                    // Pick format with audio — prefer mp4 formats that include audio
                    media = d.data.medias.find(m => m.url && m.ext === 'mp4' && m.is_audio)
                         || d.data.medias.find(m => m.url && m.is_audio)
                         || d.data.medias.find(m => m.url);
                } else {
                    // For video: prefer mp4 at reasonable quality (360p or 720p)
                    media = d.data.medias.find(m => m.url && m.ext === 'mp4' && m.height <= 720 && !m.is_audio)
                         || d.data.medias.find(m => m.url && m.ext === 'mp4')
                         || d.data.medias.find(m => m.url);
                }
                if (media) {
                    downloadUrl = media.url;
                    title = d.data.title;
                    duration = d.data.duration;
                    thumbnail = d.data.thumbnail;
                }

            // Generic fallbacks
            } else if (d.download_url) {
                downloadUrl = d.download_url;
                title = d.title;
                duration = d.duration;
            } else if (d.result?.download_url) {
                downloadUrl = d.result.download_url;
                title = d.result.title;
                duration = d.result.duration;
            } else if (d.url) {
                downloadUrl = d.url;
                title = d.title;
            } else if (d.link) {
                downloadUrl = d.link;
                title = d.title;
            }

            if (downloadUrl) {
                console.log(`✅ API working: ${endpoint}`);
                return { success: true, download_url: downloadUrl, title, duration, thumbnail, usedApi: endpoint };
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
    description: (Buffer.from("RG93bmxvYWQgQXVkaW8gZnJvbSBZb3V0dWJl","base64").toString()),
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
      return reply((Buffer.from("UGxlYXNlIHByb3ZpZGUgYSBzb25nIG5hbWUgb3IgWW91VHViZSBsaW5r","base64").toString()));
    }

    try {
      let videoUrl;
      let videoInfo;
      let searchQuery = q;

      if (q.includes((Buffer.from("eW91dHViZS5jb20vd2F0Y2g=","base64").toString())) || q.includes((Buffer.from("eW91dHUuYmUv","base64").toString()))) {
        videoUrl = q;
        let videoId;
        if (q.includes((Buffer.from("eW91dHViZS5jb20vd2F0Y2g=","base64").toString()))) {
          videoId = q.split('v=')[1]?.split('&')[0];
        } else {
          videoId = q.split('/').pop();
        }
        const searchResponse = await yts({ videoId });
        videoInfo = searchResponse;
        searchQuery = videoInfo.title || videoInfo.name || q;
      } else {
        const searchResponse = await yts(q);
        if (!searchResponse.videos.length) {
          return reply((Buffer.from("4p2MIE5vIHZpZGVvIGZvdW5kIGZvciB5b3VyIHF1ZXJ5Lg==","base64").toString()));
        }
        videoInfo = searchResponse.videos[0];
        videoUrl = videoInfo.url;
        searchQuery = videoInfo.title || q;
      }

      const title = videoInfo.title || videoInfo.name || (Buffer.from("VW5rbm93biBUaXRsZQ==","base64").toString());
      const duration = videoInfo.timestamp || videoInfo.duration || "Unknown";
      const thumbnail = videoInfo.thumbnail || videoInfo.image || botPic;

      await react("🔍");

      const audioApis = getAudioApis(videoUrl, searchQuery);
      const result = await queryAPI(videoUrl, audioApis);

      if (!result.success) {
        await react("❌");
        return reply((Buffer.from("4p2MIEFsbCBkb3dubG9hZCBzZXJ2aWNlcyBhcmUgY3VycmVudGx5IHVuYXZhaWxhYmxlLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLg==","base64").toString()));
      }

      let buffer = await gmdBuffer(result.download_url);

      if (!isValidBuffer(buffer)) {
        await react("❌");
        return reply((Buffer.from("RmFpbGVkIHRvIGRvd25sb2FkIGF1ZGlvLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLg==","base64").toString()));
      }

      // Large file handling (over 60MB)
      if (buffer.length > 0x3C * 0x400 * 0x400) {
        await react("📄");
        const convertedBuffer = await formatAudio(buffer);
        await Gifted.sendMessage(from, {
          document: convertedBuffer,
          mimetype: (Buffer.from("YXVkaW8vbXBlZw==","base64").toString()),
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
          { id: `audio_${buttonId}`, text: (Buffer.from("QXVkaW8g8J+Otg==","base64").toString()) },
          { id: `doc_${buttonId}`, text: (Buffer.from("RG9jdW1lbnQg8J+ThA==","base64").toString()) },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: (Buffer.from("4pa277iPIFdhdGNoIG9uIFlvdVR1YmU=","base64").toString()),
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
                mimetype: (Buffer.from("YXVkaW8vbXBlZw==","base64").toString()),
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
                mimetype: (Buffer.from("YXVkaW8vbXBlZw==","base64").toString()),
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
          console.error((Buffer.from("RXJyb3Igc2VuZGluZyBtZWRpYTo=","base64").toString()), error);
          await react("❌");
          await Gifted.sendMessage(from, { text: (Buffer.from("RmFpbGVkIHRvIHNlbmQgbWVkaWEuIFBsZWFzZSB0cnkgYWdhaW4u","base64").toString()) }, { quoted: messageData });
        }
      };

      Gifted.ev.on((Buffer.from("bWVzc2FnZXMudXBzZXJ0","base64").toString()), handleResponse);

      setTimeout(() => {
        Gifted.ev.off((Buffer.from("bWVzc2FnZXMudXBzZXJ0","base64").toString()), handleResponse);
      }, 0x493E0);

    } catch (error) {
      console.error((Buffer.from("RXJyb3IgZHVyaW5nIGRvd25sb2FkIHByb2Nlc3M6","base64").toString()), error);
      await react("❌");
      return reply((Buffer.from("4p2MIE9vcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlxuXG5FcnJvcjog","base64").toString()) + error.message);
    }
  },
);

gmd(
  {
    pattern: "video",
    aliases: ["ytmp4doc", "mp4", "ytmp4", "dlmp4"],
    category: "downloader",
    react: "🎥",
    description: (Buffer.from("RG93bmxvYWQgVmlkZW8gZnJvbSBZb3V0dWJl","base64").toString()),
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
      return reply((Buffer.from("UGxlYXNlIHByb3ZpZGUgYSB2aWRlbyBuYW1lIG9yIFlvdVR1YmUgbGluaw==","base64").toString()));
    }

    try {
      let videoUrl;
      let videoInfo;

      if (q.includes((Buffer.from("eW91dHViZS5jb20vd2F0Y2g=","base64").toString())) || q.includes((Buffer.from("eW91dHUuYmUv","base64").toString()))) {
        videoUrl = q;
        let videoId;
        if (q.includes((Buffer.from("eW91dHViZS5jb20vd2F0Y2g=","base64").toString()))) {
          videoId = q.split('v=')[1]?.split('&')[0];
        } else {
          videoId = q.split('/').pop();
        }
        const searchResponse = await yts({ videoId });
        videoInfo = searchResponse;
      } else {
        const searchResponse = await yts(q);
        if (!searchResponse.videos.length) {
          return reply((Buffer.from("4p2MIE5vIHZpZGVvIGZvdW5kIGZvciB5b3VyIHF1ZXJ5Lg==","base64").toString()));
        }
        videoInfo = searchResponse.videos[0];
        videoUrl = videoInfo.url;
      }

      const title = videoInfo.title || videoInfo.name || (Buffer.from("VW5rbm93biBUaXRsZQ==","base64").toString());
      const duration = videoInfo.timestamp || videoInfo.duration || "Unknown";
      const thumbnail = videoInfo.thumbnail || videoInfo.image || botPic;

      await react("🔍");

      const videoApis = getVideoApis(videoUrl);
      const result = await queryAPI(videoUrl, videoApis);

      if (!result.success) {
        await react("❌");
        return reply((Buffer.from("4p2MIEFsbCBkb3dubG9hZCBzZXJ2aWNlcyBhcmUgY3VycmVudGx5IHVuYXZhaWxhYmxlLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLg==","base64").toString()));
      }

      let buffer = await gmdBuffer(result.download_url);

      if (!isValidBuffer(buffer)) {
        await react("❌");
        return reply((Buffer.from("RmFpbGVkIHRvIGRvd25sb2FkIHZpZGVvLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLg==","base64").toString()));
      }

      const sizeMB = buffer.length / (0x400 * 0x400);

      // Large file handling (over 100MB)
      if (sizeMB > 0x64) {
        await react("📄");
        await Gifted.sendMessage(from, {
          document: buffer,
          mimetype: (Buffer.from("dmlkZW8vbXA0","base64").toString()),
          fileName: `${title}.mp4`.replace(/[^\w\s.-]/gi, ""),
          caption: `🎥 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n📦 *Size:* ${sizeMB.toFixed(2)} MB\n\n_File too large - sent as document_`,
        });
        await react("✅");
        return;
      }

      if (sizeMB > 0x14) {
        await reply((Buffer.from("4o+zIEZpbGUgaXMgbGFyZ2UsIHByb2Nlc3NpbmcgbWlnaHQgdGFrZSBhIHdoaWxlLi4u","base64").toString()));
      }

      const dateNow = Date.now();
      const buttonId = `video_${dateNow}`;

      await sendButtons(Gifted, from, {
        title: `${botName} 🎥 VIDEO DOWNLOADER`,
        text: `🎬 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n📦 *Size:* ${sizeMB.toFixed(2)} MB\n\n*Select download format:*`,
        footer: botFooter,
        image: { url: thumbnail },
        buttons: [
          { id: `vid_${buttonId}`, text: (Buffer.from("VmlkZW8g8J+OpQ==","base64").toString()) },
          { id: `doc_${buttonId}`, text: (Buffer.from("RG9jdW1lbnQg8J+ThA==","base64").toString()) },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: (Buffer.from("4pa277iPIFdhdGNoIG9uIFlvdVR1YmU=","base64").toString()),
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
                mimetype: (Buffer.from("dmlkZW8vbXA0","base64").toString()),
                caption: `🎬 ${title}`,
              },
              { quoted: messageData }
            );
          } else if (selectedButtonId.startsWith('doc_')) {
            await Gifted.sendMessage(
              from,
              {
                document: buffer,
                mimetype: (Buffer.from("dmlkZW8vbXA0","base64").toString()),
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
          console.error((Buffer.from("RXJyb3Igc2VuZGluZyBtZWRpYTo=","base64").toString()), error);
          await react("❌");
          await Gifted.sendMessage(from, { text: (Buffer.from("RmFpbGVkIHRvIHNlbmQgbWVkaWEuIFBsZWFzZSB0cnkgYWdhaW4u","base64").toString()) }, { quoted: messageData });
        }
      };

      Gifted.ev.on((Buffer.from("bWVzc2FnZXMudXBzZXJ0","base64").toString()), handleResponse);

      setTimeout(() => {
        Gifted.ev.off((Buffer.from("bWVzc2FnZXMudXBzZXJ0","base64").toString()), handleResponse);
      }, 0x493E0);

    } catch (error) {
      console.error((Buffer.from("RXJyb3IgZHVyaW5nIGRvd25sb2FkIHByb2Nlc3M6","base64").toString()), error);
      await react("❌");
      return reply((Buffer.from("4p2MIE9vcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlxuXG5FcnJvcjog","base64").toString()) + error.message);
    }
  },
);
