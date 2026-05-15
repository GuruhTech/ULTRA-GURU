var _0x37d468=(function(_0x7c3f6a,_0xf3559d){return !![]}());var _0x34a477=function(){return ![]};
const { gmd, toAudio, toVideo, toPtt, stickerToImage, gmdFancy, gmdRandom, getSetting, runFFmpeg, getVideoDuration, gmdSticker } = require("../guru");
const fs = require("fs").promises;
const { StickerTypes } = require("wa-sticker-formatter");
gmd({
    pattern: "\x73\x74\x69\x63\x6b\x65\x72",
    aliases: ["st", "\x74\x61\x6b\x65"],
    category: "\x63\x6f\x6e\x76\x65\x72\x74\x65\x72",
    react: "🔄️",
    description: "\x43\x6f\x6e\x76\x65\x72\x74\x20\x69\x6d\x61\x67\x65\x2f\x76\x69\x64\x65\x6f\x2f\x73\x74\x69\x63\x6b\x65\x72\x20\x74\x6f\x20\x73\x74\x69\x63\x6b\x65\x72\x2e",
}, async (from, Gifted, conText) => {
    const { q, mek, reply, react, quoted, packName, packAuthor } = conText;
    try {
        if (!quoted) {
            await react("❌");
            return reply("\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x70\x6c\x79\x20\x74\x6f\x2f\x71\x75\x6f\x74\x65\x20\x61\x6e\x20\x69\x6d\x61\x67\x65\x2c\x20\x76\x69\x64\x65\x6f\x20\x6f\x72\x20\x73\x74\x69\x63\x6b\x65\x72");
        }
        const _0x508440 = quoted?.imageMessage || quoted?.message?.imageMessage;
        const _0xf29601 = quoted?.stickerMessage || quoted?.message?.stickerMessage;
        const _0x8749aa = quoted?.videoMessage || quoted?.message?.videoMessage;
        if (!_0x508440 && !_0xf29601 && !_0x8749aa) {
            await react("❌");
            return reply("\x54\x68\x61\x74\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x69\x73\x20\x6e\x6f\x74\x20\x61\x6e\x20\x69\x6d\x61\x67\x65\x2c\x20\x76\x69\x64\x65\x6f\x20\x6f\x72\x20\x73\x74\x69\x63\x6b\x65\x72");
        }
        let tempFilePath;
        try {
            if (_0x508440 || _0x8749aa) {
                tempFilePath = await Gifted.downloadAndSaveMediaMessage(
                    _0x508440 || _0x8749aa,
                    "\x74\x65\x6d\x70\x5f\x6d\x65\x64\x69\x61"
                );
                let _0xf2d1f1 = _0x508440 ? ".jpg" : ".mp4";
                let _0x548876 = gmdRandom(_0xf2d1f1);
                const _0x595481 = await fs.readFile(tempFilePath);
                await fs.writeFile(_0x548876, _0x595481);
                if (_0x8749aa) {
                    const _0x1df51c = gmdRandom(".webp");
                    let _0x6d1d2d = 8; 
                    try {
                        _0x6d1d2d = await getVideoDuration(_0x548876);
                        if (_0x6d1d2d > 0xA) _0x6d1d2d = 0xA; 
                    } catch (e) {
                        console.error("\x55\x73\x69\x6e\x67\x20\x64\x65\x66\x61\x75\x6c\x74\x20\x64\x75\x72\x61\x74\x69\x6f\x6e\x20\x64\x75\x65\x20\x74\x6f\x20\x65\x72\x72\x6f\x72\x3a", e);
                    }
                    await runFFmpeg(_0x548876, _0x1df51c, 0x140, 0xF, _0x6d1d2d);
                    await fs.unlink(_0x548876).catch(() => {});
                    _0x548876 = _0x1df51c;
                }
                const _0x0cb833 = await gmdSticker(_0x548876, {
                    pack: packName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55", 
                    author: packAuthor || "\x47\x55\x52\x55\x2d\x54\x45\x43\x48",
                    type: q.includes("\x2d\x2d\x63\x72\x6f\x70") || q.includes("-c") ? StickerTypes.CROPPED : StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: "\x31\x32\x33\x34\x35",
                    quality: 0x4B,
                    background: "\x74\x72\x61\x6e\x73\x70\x61\x72\x65\x6e\x74"
                });
                await fs.unlink(_0x548876).catch(() => {});
                await react("✅");
                return Gifted.sendMessage(from, { sticker: _0x0cb833 }, { quoted: mek });
            } else if (_0xf29601) {
                tempFilePath = await Gifted.downloadAndSaveMediaMessage(_0xf29601, "\x74\x65\x6d\x70\x5f\x6d\x65\x64\x69\x61");
                const _0xb44827 = await fs.readFile(tempFilePath);
                const _0xb66836 = gmdRandom(".webp");
                await fs.writeFile(_0xb66836, _0xb44827);
                const _0x9552d9 = await gmdSticker(_0xb66836, {
                    pack: packName || "\x55\x4c\x54\x52\x41\x20\x47\x55\x52\x55", 
                    author: packAuthor || "\x47\x55\x52\x55\x2d\x54\x45\x43\x48",
                    type: q.includes("\x2d\x2d\x63\x72\x6f\x70") || q.includes("-c") ? StickerTypes.CROPPED : StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: "\x31\x32\x33\x34\x35",
                    quality: 0x4B,
                    background: "\x74\x72\x61\x6e\x73\x70\x61\x72\x65\x6e\x74"
                });
                await fs.unlink(_0xb66836).catch(() => {});
                await react("✅");
                return Gifted.sendMessage(from, { sticker: _0x9552d9 }, { quoted: mek });
            }
        } finally {
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
        }
    } catch (e) {
        console.error("\x45\x72\x72\x6f\x72\x20\x69\x6e\x20\x73\x74\x69\x63\x6b\x65\x72\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x3a", e);
        await react("❌");
        await reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x63\x6f\x6e\x76\x65\x72\x74\x20\x74\x6f\x20\x73\x74\x69\x63\x6b\x65\x72");
    }
});
gmd({
    pattern: "\x74\x6f\x69\x6d\x67",
    aliases: ["\x73\x32\x69\x6d\x67"],
    category: "\x63\x6f\x6e\x76\x65\x72\x74\x65\x72",
    react: "🔄️",
    description: "\x43\x6f\x6e\x76\x65\x72\x74\x20\x53\x74\x69\x63\x6b\x65\x72\x20\x74\x6f\x20\x49\x6d\x61\x67\x65\x2e",
}, async (from, Gifted, conText) => {
    const { mek, reply, sender, botName, react, quoted, botFooter, quotedMsg, newsletterJid } = conText;
    try {
        if (!quotedMsg) {
            await react("❌");
            return reply("\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x70\x6c\x79\x20\x74\x6f\x2f\x71\x75\x6f\x74\x65\x20\x61\x20\x73\x74\x69\x63\x6b\x65\x72");
        }
        const _0xf29601 = quoted?.stickerMessage || quoted?.message?.stickerMessage;
        if (!_0xf29601) {
            await react("❌");
            return reply("\x54\x68\x61\x74\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x69\x73\x20\x6e\x6f\x74\x20\x61\x20\x73\x74\x69\x63\x6b\x65\x72");
        }
        let tempFilePath;
        try {
            tempFilePath = await Gifted.downloadAndSaveMediaMessage(_0xf29601, '\x74\x65\x6d\x70\x5f\x6d\x65\x64\x69\x61');
            const _0x0cb833 = await fs.readFile(tempFilePath);
            const _0xac35c5 = await stickerToImage(_0x0cb833);  
        await Gifted.sendMessage(
        from,
        {
          image: _0xac35c5,
          caption: `*Here is your image*\n\n> *${botFooter}*`,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 0x8F
            },
          },
        },
        { quoted: mek }
      );
            await react("✅");
        } finally {
            if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
        }
    } catch (e) {
        console.error("\x45\x72\x72\x6f\x72\x20\x69\x6e\x20\x74\x6f\x69\x6d\x67\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x3a", e);
        await react("❌");
        await reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x63\x6f\x6e\x76\x65\x72\x74\x20\x73\x74\x69\x63\x6b\x65\x72\x20\x74\x6f\x20\x69\x6d\x61\x67\x65");
    }
});
gmd({
    pattern: "\x74\x6f\x61\x75\x64\x69\x6f",
    aliases: ['\x74\x6f\x6d\x70\x33'],
    category: "\x63\x6f\x6e\x76\x65\x72\x74\x65\x72",
    react: "🔄️",
    description: "\x43\x6f\x6e\x76\x65\x72\x74\x20\x76\x69\x64\x65\x6f\x20\x74\x6f\x20\x61\x75\x64\x69\x6f"
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botPic, quoted, quotedMsg, newsletterUrl } = conText;
    if (!quotedMsg) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x70\x6c\x79\x20\x74\x6f\x20\x61\x20\x76\x69\x64\x65\x6f\x20\x6d\x65\x73\x73\x61\x67\x65");
    }
    const _0x8749aa = quoted?.videoMessage || quoted?.message?.videoMessage || quoted?.pvtMessage || quoted?.message?.pvtMessage;
    if (!_0x8749aa) {
      await react("❌");
      return reply("\x54\x68\x65\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x64\x6f\x65\x73\x6e\x27\x74\x20\x63\x6f\x6e\x74\x61\x69\x6e\x20\x61\x6e\x79\x20\x76\x69\x64\x65\x6f");
    }
    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(_0x8749aa, '\x74\x65\x6d\x70\x5f\x6d\x65\x64\x69\x61');
      const _0xd16d00 = await fs.readFile(tempFilePath);
      const _0x29404b = await toAudio(_0xd16d00);
      await Gifted.sendMessage(from, {
        audio: _0x29404b,
        mimetype: "\x61\x75\x64\x69\x6f\x2f\x6d\x70\x65\x67",
        externalAdReply: {
          title: '\x43\x6f\x6e\x76\x65\x72\x74\x65\x64\x20\x41\x75\x64\x69\x6f',
          body: '\x56\x69\x64\x65\x6f\x20\x74\x6f\x20\x41\x75\x64\x69\x6f',
          mediaType: 1,
          thumbnailUrl: botPic,
          sourceUrl: newsletterUrl,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        }
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      console.error("\x45\x72\x72\x6f\x72\x20\x69\x6e\x20\x74\x6f\x61\x75\x64\x69\x6f\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x3a", e);
      await react("❌");
      const _0x4f5434 = e.message || String(e);
      if (_0x4f5434.includes('\x6e\x6f\x20\x61\x75\x64\x69\x6f')) {
        await reply("\x54\x68\x69\x73\x20\x76\x69\x64\x65\x6f\x20\x68\x61\x73\x20\x6e\x6f\x20\x61\x75\x64\x69\x6f\x20\x74\x72\x61\x63\x6b\x20\x74\x6f\x20\x65\x78\x74\x72\x61\x63\x74\x2e");
      } else {
        await reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x63\x6f\x6e\x76\x65\x72\x74\x20\x76\x69\x64\x65\x6f\x20\x74\x6f\x20\x61\x75\x64\x69\x6f");
      }
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);
gmd({
    pattern: "\x74\x6f\x70\x74\x74",
    aliases: ['\x74\x6f\x76\x6f\x69\x63\x65', '\x74\x6f\x76\x6e', '\x74\x6f\x76\x6f\x69\x63\x65\x6e\x6f\x74\x65'],
    category: "\x63\x6f\x6e\x76\x65\x72\x74\x65\x72",
    react: "🎙️",
    description: "\x43\x6f\x6e\x76\x65\x72\x74\x20\x61\x75\x64\x69\x6f\x20\x74\x6f\x20\x57\x68\x61\x74\x73\x41\x70\x70\x20\x76\x6f\x69\x63\x65\x20\x6e\x6f\x74\x65"
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botPic, quoted, quotedMsg } = conText;
    if (!quotedMsg) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x70\x6c\x79\x20\x74\x6f\x20\x61\x6e\x20\x61\x75\x64\x69\x6f\x20\x6d\x65\x73\x73\x61\x67\x65");
    }
    const _0x983581 = quoted?.audioMessage || quoted?.message?.audioMessage;
    if (!_0x983581) {
      await react("❌");
      return reply("\x54\x68\x65\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x64\x6f\x65\x73\x6e\x27\x74\x20\x63\x6f\x6e\x74\x61\x69\x6e\x20\x61\x6e\x79\x20\x61\x75\x64\x69\x6f");
    }
    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(_0x983581, '\x74\x65\x6d\x70\x5f\x6d\x65\x64\x69\x61');
      const _0xd16d00 = await fs.readFile(tempFilePath);
      const _0x29404b = await toPtt(_0xd16d00);
      await Gifted.sendMessage(from, {
        audio: _0x29404b,
        mimetype: "\x61\x75\x64\x69\x6f\x2f\x6f\x67\x67\x3b\x20\x63\x6f\x64\x65\x63\x73\x3d\x6f\x70\x75\x73",
        ptt: true,
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      console.error("\x45\x72\x72\x6f\x72\x20\x69\x6e\x20\x74\x6f\x70\x74\x74\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x3a", e);
      await react("❌");
      await reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x63\x6f\x6e\x76\x65\x72\x74\x20\x74\x6f\x20\x76\x6f\x69\x63\x65\x20\x6e\x6f\x74\x65");
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);
gmd({
    pattern: "\x74\x6f\x76\x69\x64\x65\x6f",
    aliases: ['\x74\x6f\x6d\x70\x34', '\x74\x6f\x76\x69\x64', '\x74\x6f\x62\x6c\x61\x63\x6b\x73\x63\x72\x65\x65\x6e', '\x62\x6c\x61\x63\x6b\x73\x63\x72\x65\x65\x6e'],
    category: "\x63\x6f\x6e\x76\x65\x72\x74\x65\x72",
    react: "🎥",
    description: "\x43\x6f\x6e\x76\x65\x72\x74\x20\x61\x75\x64\x69\x6f\x20\x74\x6f\x20\x76\x69\x64\x65\x6f\x20\x77\x69\x74\x68\x20\x62\x6c\x61\x63\x6b\x20\x73\x63\x72\x65\x65\x6e"
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botPic, quoted, quotedMsg } = conText;
    if (!quotedMsg) {
      await react("❌");
      return reply("\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x70\x6c\x79\x20\x74\x6f\x20\x61\x6e\x20\x61\x75\x64\x69\x6f\x20\x6d\x65\x73\x73\x61\x67\x65");
    }
    const _0x983581 = quoted?.audioMessage || quoted?.message?.audioMessage;
    if (!_0x983581) {
      await react("❌");
      return reply("\x54\x68\x65\x20\x71\x75\x6f\x74\x65\x64\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x64\x6f\x65\x73\x6e\x27\x74\x20\x63\x6f\x6e\x74\x61\x69\x6e\x20\x61\x6e\x79\x20\x61\x75\x64\x69\x6f");
    }
    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(_0x983581, '\x74\x65\x6d\x70\x5f\x6d\x65\x64\x69\x61');
      const _0xd16d00 = await fs.readFile(tempFilePath);
      const _0x29404b = await toVideo(_0xd16d00);
      await Gifted.sendMessage(from, {
        video: _0x29404b,
        mimetype: "\x76\x69\x64\x65\x6f\x2f\x6d\x70\x34",
        caption: '\x43\x6f\x6e\x76\x65\x72\x74\x65\x64\x20\x56\x69\x64\x65\x6f',
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      console.error("\x45\x72\x72\x6f\x72\x20\x69\x6e\x20\x74\x6f\x76\x69\x64\x65\x6f\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x3a", e);
      await react("❌");
      await reply("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x63\x6f\x6e\x76\x65\x72\x74\x20\x61\x75\x64\x69\x6f\x20\x74\x6f\x20\x76\x69\x64\x65\x6f");
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);
