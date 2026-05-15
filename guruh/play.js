var _0xf2ba54=(function(_0x0928d2,_0xd65e00){return !![]}());var _0x90ef95=function(){return ![]};
const { gmd, toPtt } = require("../guru");
const _0xd754e9 = require("yt-search");
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
} = require("@whiskeysockets/baileys");
const { sendButtons } = require("gifted-btns");
const _0x42419b = (url) => [
    `https:
    `https:
    `https:
    `https:
];
const _0xfd5e1c = (url) => [
    `https:
    `https:
    `https:
    `https:
];
const _0x2ad0cc = (buf) => Buffer.isBuffer(buf) && buf.length > 0x2800;
async function queryAPI(url, endpoints, timeout = 0x7530) {
    const _0x81edff = [];
    for (const endpoint of endpoints) {
        try {
            const _0xe50529 = endpoint;
            console.log(`🔄 Trying API: ${_0xe50529}`);
            const _0x70a475 = await axios.get(_0xe50529, { timeout });
            let _0xcaea4b = null;
            let _0x73fc28 = null;
            let _0xe0fcd3 = null;
            if (_0x70a475.data.status === true && _0x70a475.data.result) {
                _0xcaea4b = _0x70a475.data.result;
                _0x73fc28 = _0x70a475.data.title;
                _0xe0fcd3 = _0x70a475.data.duration;
                console.log(`✅ apiskeith.top API working!`);
            }
            else if (_0x70a475.data.download_url) {
                _0xcaea4b = _0x70a475.data.download_url;
                _0x73fc28 = _0x70a475.data.title;
                _0xe0fcd3 = _0x70a475.data.duration;
            } else if (_0x70a475.data.result?.download_url) {
                _0xcaea4b = _0x70a475.data.result.download_url;
                _0x73fc28 = _0x70a475.data.result.title;
                _0xe0fcd3 = _0x70a475.data.result.duration;
            } else if (_0x70a475.data.url) {
                _0xcaea4b = _0x70a475.data.url;
                _0x73fc28 = _0x70a475.data.title;
            } else if (_0x70a475.data.link) {
                _0xcaea4b = _0x70a475.data.link;
                _0x73fc28 = _0x70a475.data.title;
            } else if (_0x70a475.data.data?.url) {
                _0xcaea4b = _0x70a475.data.data.url;
                _0x73fc28 = _0x70a475.data.data.title;
            }
            if (_0xcaea4b) {
                console.log(`✅ API working: ${endpoint}`);
                return { success: true, download_url: _0xcaea4b, _0x73fc28, _0xe0fcd3, usedApi: endpoint };
            }
        } catch (error) {
            console.log(`❌ API failed: ${error.message}`);
            _0x81edff.push(`${endpoint}: ${error.message}`);
        }
    }
    return { success: false, error: `All APIs failed: ${_0x81edff.join(', ')}` };
}
gmd(
  {
    pattern: "\x70\x6c\x61\x79",
    aliases: ["\x79\x74\x6d\x70\x33", "\x79\x74\x6d\x70\x33\x64\x6f\x63", "\x61\x75\x64\x69\x6f\x64\x6f\x63", "\x79\x74\x61"],
    category: "\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x65\x72",
    react: "🎶",
    description: "\x44\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x41\x75\x64\x69\x6f\x20\x66\x72\x6f\x6d\x20\x59\x6f\x75\x74\x75\x62\x65",
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
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x73\x6f\x6e\x67\x20\x6e\x61\x6d\x65\x20\x6f\x72\x20\x59\x6f\x75\x54\x75\x62\x65\x20\x6c\x69\x6e\x6b");
    }
    try {
      let videoUrl;
      let videoInfo;
      if (q.includes('\x79\x6f\x75\x74\x75\x62\x65\x2e\x63\x6f\x6d\x2f\x77\x61\x74\x63\x68') || q.includes('\x79\x6f\x75\x74\x75\x2e\x62\x65\x2f')) {
        videoUrl = q;
        let videoId;
        if (q.includes('\x79\x6f\x75\x74\x75\x62\x65\x2e\x63\x6f\x6d\x2f\x77\x61\x74\x63\x68')) {
          videoId = q.split('v=')[1]?.split('&')[0];
        } else {
          videoId = q.split('/').pop();
        }
        const _0xd77c08 = await _0xd754e9({ videoId });
        videoInfo = _0xd77c08;
      } else {
        const _0xd77c08 = await _0xd754e9(q);
        if (!_0xd77c08.videos.length) {
          return reply("❌\x20\x4e\x6f\x20\x76\x69\x64\x65\x6f\x20\x66\x6f\x75\x6e\x64\x20\x66\x6f\x72\x20\x79\x6f\x75\x72\x20\x71\x75\x65\x72\x79\x2e");
        }
        videoInfo = _0xd77c08.videos[0];
        videoUrl = videoInfo.url;
      }
      const _0x73fc28 = videoInfo.title || videoInfo.name || "\x55\x6e\x6b\x6e\x6f\x77\x6e\x20\x54\x69\x74\x6c\x65";
      const _0xe0fcd3 = videoInfo.timestamp || videoInfo.duration || "\x55\x6e\x6b\x6e\x6f\x77\x6e";
      const _0x4a17f8 = videoInfo.thumbnail || videoInfo.image || botPic;
      await react("🔍");
      const _0xde7e8b = _0x42419b(videoUrl);
      const _0x8cbeed = await queryAPI(videoUrl, _0xde7e8b, 0x7530);
      if (!_0x8cbeed.success) {
        await react("❌");
        return reply("❌\x20\x41\x6c\x6c\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x73\x65\x72\x76\x69\x63\x65\x73\x20\x61\x72\x65\x20\x63\x75\x72\x72\x65\x6e\x74\x6c\x79\x20\x75\x6e\x61\x76\x61\x69\x6c\x61\x62\x6c\x65\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x20\x6c\x61\x74\x65\x72\x2e");
      }
      let _0x136760 = await gmdBuffer(_0x8cbeed.download_url);
      if (!_0x2ad0cc(_0x136760)) {
        await react("❌");
        return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x61\x75\x64\x69\x6f\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x20\x6c\x61\x74\x65\x72\x2e");
      }
      if (_0x136760.length > 0x3C * 0x400 * 0x400) {
        await react("📄");
        const _0x9620f8 = await formatAudio(_0x136760);
        await Gifted.sendMessage(from, {
          document: _0x9620f8,
          mimetype: "\x61\x75\x64\x69\x6f\x2f\x6d\x70\x65\x67",
          fileName: `${_0x73fc28}.mp3`.replace(/[^\w\s.-]/gi, ""),
          caption: `🎵 *Title:* ${_0x73fc28}\n⏱️ *Duration:* ${_0xe0fcd3}\n\n_File too large - sent as document_`,
        });
        await react("✅");
        return;
      }
      const _0xf6d7c5 = Date.now();
      const _0x408e4a = `play_${_0xf6d7c5}`;
      await sendButtons(Gifted, from, {
        _0x73fc28: `${botName} 🎵 SONG DOWNLOADER`,
        text: `🎶 *Title:* ${_0x73fc28}\n⏱️ *Duration:* ${_0xe0fcd3}\n\n*Select download format:*`,
        footer: botFooter,
        image: { url: _0x4a17f8 },
        buttons: [
          { id: `audio_${_0x408e4a}`, text: "\x41\x75\x64\x69\x6f\x20🎶" },
          { id: `doc_${_0x408e4a}`, text: "\x44\x6f\x63\x75\x6d\x65\x6e\x74\x20📄" },
          {
            name: "\x63\x74\x61\x5f\x75\x72\x6c",
            buttonParamsJson: JSON.stringify({
              display_text: "▶️\x20\x57\x61\x74\x63\x68\x20\x6f\x6e\x20\x59\x6f\x75\x54\x75\x62\x65",
              url: videoUrl,
            }),
          },
        ],
      });
      const _0x20ca2b = async (event) => {
        const _0x2a1489 = event.messages[0];
        if (!_0x2a1489.message) return;
        const _0xb974bd = extractButtonId(_0x2a1489.message);
        if (!_0xb974bd) return;
        const _0xb337ff = _0x2a1489.key?.remoteJid === from;
        if (!_0xb337ff || !_0xb974bd.includes(_0xf6d7c5.toString())) return;
        await react("⬇️");
        try {
          if (_0xb974bd.startsWith('\x61\x75\x64\x69\x6f\x5f')) {
            const _0x9620f8 = await formatAudio(_0x136760);
            await Gifted.sendMessage(
              from,
              {
                audio: _0x9620f8,
                mimetype: "\x61\x75\x64\x69\x6f\x2f\x6d\x70\x65\x67",
                ptt: false,
              },
              { quoted: _0x2a1489 }
            );
          } else if (_0xb974bd.startsWith('\x64\x6f\x63\x5f')) {
            const _0x9620f8 = await formatAudio(_0x136760);
            await Gifted.sendMessage(
              from,
              {
                document: _0x9620f8,
                mimetype: "\x61\x75\x64\x69\x6f\x2f\x6d\x70\x65\x67",
                fileName: `${_0x73fc28}.mp3`.replace(/[^\w\s.-]/gi, ""),
                caption: `🎵 ${_0x73fc28}`,
              },
              { quoted: _0x2a1489 }
            );
          } else {
            return;
          }
          await react("✅");
        } catch (error) {
          console.error("\x45\x72\x72\x6f\x72\x20\x73\x65\x6e\x64\x69\x6e\x67\x20\x6d\x65\x64\x69\x61\x3a", error);
          await react("❌");
          await Gifted.sendMessage(from, { text: "\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x6e\x64\x20\x6d\x65\x64\x69\x61\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e" }, { quoted: _0x2a1489 });
        }
      };
      Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x20ca2b);
      setTimeout(() => {
        Gifted.ev.off("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x20ca2b);
      }, 0x493E0);
    } catch (error) {
      console.error("\x45\x72\x72\x6f\x72\x20\x64\x75\x72\x69\x6e\x67\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x70\x72\x6f\x63\x65\x73\x73\x3a", error);
      await react("❌");
      return reply("❌\x20\x4f\x6f\x70\x73\x21\x20\x53\x6f\x6d\x65\x74\x68\x69\x6e\x67\x20\x77\x65\x6e\x74\x20\x77\x72\x6f\x6e\x67\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e\x5c\x6e\x5c\x6e\x45\x72\x72\x6f\x72\x3a\x20" + error.message);
    }
  },
);
gmd(
  {
    pattern: "\x76\x69\x64\x65\x6f",
    aliases: ["\x79\x74\x6d\x70\x34\x64\x6f\x63", "\x6d\x70\x34", "\x79\x74\x6d\x70\x34", "\x64\x6c\x6d\x70\x34"],
    category: "\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x65\x72",
    react: "🎥",
    description: "\x44\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x56\x69\x64\x65\x6f\x20\x66\x72\x6f\x6d\x20\x59\x6f\x75\x74\x75\x62\x65",
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
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x76\x69\x64\x65\x6f\x20\x6e\x61\x6d\x65\x20\x6f\x72\x20\x59\x6f\x75\x54\x75\x62\x65\x20\x6c\x69\x6e\x6b");
    }
    try {
      let videoUrl;
      let videoInfo;
      if (q.includes('\x79\x6f\x75\x74\x75\x62\x65\x2e\x63\x6f\x6d\x2f\x77\x61\x74\x63\x68') || q.includes('\x79\x6f\x75\x74\x75\x2e\x62\x65\x2f')) {
        videoUrl = q;
        let videoId;
        if (q.includes('\x79\x6f\x75\x74\x75\x62\x65\x2e\x63\x6f\x6d\x2f\x77\x61\x74\x63\x68')) {
          videoId = q.split('v=')[1]?.split('&')[0];
        } else {
          videoId = q.split('/').pop();
        }
        const _0xd77c08 = await _0xd754e9({ videoId });
        videoInfo = _0xd77c08;
      } else {
        const _0xd77c08 = await _0xd754e9(q);
        if (!_0xd77c08.videos.length) {
          return reply("❌\x20\x4e\x6f\x20\x76\x69\x64\x65\x6f\x20\x66\x6f\x75\x6e\x64\x20\x66\x6f\x72\x20\x79\x6f\x75\x72\x20\x71\x75\x65\x72\x79\x2e");
        }
        videoInfo = _0xd77c08.videos[0];
        videoUrl = videoInfo.url;
      }
      const _0x73fc28 = videoInfo.title || videoInfo.name || "\x55\x6e\x6b\x6e\x6f\x77\x6e\x20\x54\x69\x74\x6c\x65";
      const _0xe0fcd3 = videoInfo.timestamp || videoInfo.duration || "\x55\x6e\x6b\x6e\x6f\x77\x6e";
      const _0x4a17f8 = videoInfo.thumbnail || videoInfo.image || botPic;
      await react("🔍");
      const _0xe76782 = _0xfd5e1c(videoUrl);
      const _0x8cbeed = await queryAPI(videoUrl, _0xe76782, 0x7530);
      if (!_0x8cbeed.success) {
        await react("❌");
        return reply("❌\x20\x41\x6c\x6c\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x73\x65\x72\x76\x69\x63\x65\x73\x20\x61\x72\x65\x20\x63\x75\x72\x72\x65\x6e\x74\x6c\x79\x20\x75\x6e\x61\x76\x61\x69\x6c\x61\x62\x6c\x65\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x20\x6c\x61\x74\x65\x72\x2e");
      }
      let _0x136760 = await gmdBuffer(_0x8cbeed.download_url);
      if (!_0x2ad0cc(_0x136760)) {
        await react("❌");
        return reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x76\x69\x64\x65\x6f\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x20\x6c\x61\x74\x65\x72\x2e");
      }
      const _0xa33de8 = _0x136760.length / (0x400 * 0x400);
      if (_0xa33de8 > 0x64) {
        await react("📄");
        await Gifted.sendMessage(from, {
          document: _0x136760,
          mimetype: "\x76\x69\x64\x65\x6f\x2f\x6d\x70\x34",
          fileName: `${_0x73fc28}.mp4`.replace(/[^\w\s.-]/gi, ""),
          caption: `🎥 *Title:* ${_0x73fc28}\n⏱️ *Duration:* ${_0xe0fcd3}\n📦 *Size:* ${_0xa33de8.toFixed(2)} MB\n\n_File too large - sent as document_`,
        });
        await react("✅");
        return;
      }
      if (_0xa33de8 > 0x14) {
        await reply("⏳\x20\x46\x69\x6c\x65\x20\x69\x73\x20\x6c\x61\x72\x67\x65\x2c\x20\x70\x72\x6f\x63\x65\x73\x73\x69\x6e\x67\x20\x6d\x69\x67\x68\x74\x20\x74\x61\x6b\x65\x20\x61\x20\x77\x68\x69\x6c\x65\x2e\x2e\x2e");
      }
      const _0xf6d7c5 = Date.now();
      const _0x408e4a = `video_${_0xf6d7c5}`;
      await sendButtons(Gifted, from, {
        _0x73fc28: `${botName} 🎥 VIDEO DOWNLOADER`,
        text: `🎬 *Title:* ${_0x73fc28}\n⏱️ *Duration:* ${_0xe0fcd3}\n📦 *Size:* ${_0xa33de8.toFixed(2)} MB\n\n*Select download format:*`,
        footer: botFooter,
        image: { url: _0x4a17f8 },
        buttons: [
          { id: `vid_${_0x408e4a}`, text: "\x56\x69\x64\x65\x6f\x20🎥" },
          { id: `doc_${_0x408e4a}`, text: "\x44\x6f\x63\x75\x6d\x65\x6e\x74\x20📄" },
          {
            name: "\x63\x74\x61\x5f\x75\x72\x6c",
            buttonParamsJson: JSON.stringify({
              display_text: "▶️\x20\x57\x61\x74\x63\x68\x20\x6f\x6e\x20\x59\x6f\x75\x54\x75\x62\x65",
              url: videoUrl,
            }),
          },
        ],
      });
      const _0x20ca2b = async (event) => {
        const _0x2a1489 = event.messages[0];
        if (!_0x2a1489.message) return;
        const _0xb974bd = extractButtonId(_0x2a1489.message);
        if (!_0xb974bd) return;
        const _0xb337ff = _0x2a1489.key?.remoteJid === from;
        if (!_0xb337ff || !_0xb974bd.includes(_0xf6d7c5.toString())) return;
        await react("⬇️");
        try {
          if (_0xb974bd.startsWith('\x76\x69\x64\x5f')) {
            const _0x1dd136 = await formatVideo(_0x136760);
            await Gifted.sendMessage(
              from,
              {
                video: _0x1dd136,
                mimetype: "\x76\x69\x64\x65\x6f\x2f\x6d\x70\x34",
                caption: `🎬 ${_0x73fc28}`,
              },
              { quoted: _0x2a1489 }
            );
          } else if (_0xb974bd.startsWith('\x64\x6f\x63\x5f')) {
            await Gifted.sendMessage(
              from,
              {
                document: _0x136760,
                mimetype: "\x76\x69\x64\x65\x6f\x2f\x6d\x70\x34",
                fileName: `${_0x73fc28}.mp4`.replace(/[^\w\s.-]/gi, ""),
                caption: `📄 ${_0x73fc28}`,
              },
              { quoted: _0x2a1489 }
            );
          } else {
            return;
          }
          await react("✅");
        } catch (error) {
          console.error("\x45\x72\x72\x6f\x72\x20\x73\x65\x6e\x64\x69\x6e\x67\x20\x6d\x65\x64\x69\x61\x3a", error);
          await react("❌");
          await Gifted.sendMessage(from, { text: "\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x73\x65\x6e\x64\x20\x6d\x65\x64\x69\x61\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e" }, { quoted: _0x2a1489 });
        }
      };
      Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x20ca2b);
      setTimeout(() => {
        Gifted.ev.off("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", _0x20ca2b);
      }, 0x493E0);
    } catch (error) {
      console.error("\x45\x72\x72\x6f\x72\x20\x64\x75\x72\x69\x6e\x67\x20\x64\x6f\x77\x6e\x6c\x6f\x61\x64\x20\x70\x72\x6f\x63\x65\x73\x73\x3a", error);
      await react("❌");
      return reply("❌\x20\x4f\x6f\x70\x73\x21\x20\x53\x6f\x6d\x65\x74\x68\x69\x6e\x67\x20\x77\x65\x6e\x74\x20\x77\x72\x6f\x6e\x67\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x74\x72\x79\x20\x61\x67\x61\x69\x6e\x2e\x5c\x6e\x5c\x6e\x45\x72\x72\x6f\x72\x3a\x20" + error.message);
    }
  },
);
