const { gmd, gmdSticker } = require("../guru"),
  fs = require("fs").promises,
  fss = require("fs"),
  os = require("os"),
  path = require("path"),
  ffmpeg = require("fluent-ffmpeg"),
  ffmpegPath = require("ffmpeg-static"),
  axios = require("axios"),
  stream = require("stream"),
  { promisify } = require("util"),
  pipeline = promisify(stream.pipeline),
  {
    generateWAMessageContent,
    generateWAMessageFromContent,
  } = require("@whiskeysockets/baileys"),
  { sendButtons } = require("gifted-btns"),
  { StickerTypes } = require("wa-sticker-formatter");

gmd(
  {
    pattern: "yts",
    aliases: ["yt-search"],
    category: "search",
    react: "🔍",
    description: "perform youtube search",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, sender, botFooter, gmdBuffer } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a search query");
    }

    try {
      const apiUrl = `https://files.catbox.moe/5evber.jpg/?q=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 100000 });
      const results = res.data?.videos;

      if (!Array.isArray(results) || results.length === 0) return;

      const videos = results.slice(0, 5);
      const cards = await Promise.all(
        videos.map(async (vid, i) => ({
          header: {
            title: `🎬 *${vid.name}*`,
            hasMediaAttachment: true,
            imageMessage: (
              await generateWAMessageContent(
                { image: { url: vid.thumbnail } },
                {
                  upload: Gifted.waUploadToServer,
                },
              )
            ).imageMessage,
          },
          body: {
            text: `📺 Duration: ${vid.duration}\n👁️ Views: ${vid.views}${vid.published ? `\n📅 Published: ${vid.published}` : ""}`,
          },
          footer: { text: `> *${botFooter}*` },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "Copy Link",
                  copy_code: vid.url,
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Watch on YouTube",
                  url: vid.url,
                }),
              },
            ],
          },
        })),
      );

      const message = generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: {
                body: { text: `🔍 YouTube Results for: *${q}*` },
                footer: {
                  text: `📂 Displaying first *${videos.length}* videos`,
                },
                carouselMessage: { cards },
              },
            },
          },
        },
        { quoted: mek },
      );

      await Gifted.relayMessage(from, message.message, {
        messageId: message.key.id,
      });

      await react("✅");
    } catch (error) {
      console.error("Error during search process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "shazam",
    aliases: ["whatmusic", "whatsong", "identify", "accr"],
    category: "search",
    react: "🙄",
    description: "Identify music from audio or video messages",
  },
  async (from, Gifted, conText) => {
    const {
      mek,
      q,
      reply,
      react,
      botPic,
      botPrefix,
      quoted,
      quotedMsg,
      sender,
      botName,
      botFooter,
      newsletterJid,
      GiftedTechApi,
      GiftedApiKey,
      getMediaBuffer,
      uploadToCatbox,
    } = conText;

    const isUrl = (s) => /^https?:\/\//i.test(s?.trim());

    if (!q?.trim() && !quotedMsg) {
      await react("❌");
      return reply(
        `Please reply to an audio/video message or provide a URL\n\nUsage: ${botPrefix}shazam <audio/video url>`,
      );
    }

    const quotedAudio = quoted?.audioMessage || quoted?.message?.audioMessage;
    const quotedVideo = quoted?.videoMessage || quoted?.message?.videoMessage;

    if (!isUrl(q) && !quotedAudio && !quotedVideo) {
      await react("❌");
      return reply("The quoted message doesn't contain any audio or video");
    }

    try {
      let fileUrl;

      if (isUrl(q)) {
        fileUrl = q.trim();
      } else {
        const mediaMsg = quotedAudio || quotedVideo;
        const isAudio = !!quotedAudio;
        const durationSecs = mediaMsg?.seconds || mediaMsg?.duration || 0;
        let buffer = await getMediaBuffer(mediaMsg, isAudio ? "audio" : "video");
        const ext = isAudio ? "mp3" : "mp4";

        if (durationSecs > 20) {
          const tmpIn  = path.join(os.tmpdir(), `shazam_in_${Date.now()}.${ext}`);
          const tmpOut = path.join(os.tmpdir(), `shazam_out_${Date.now()}.${ext}`);
          fss.writeFileSync(tmpIn, buffer);
          await new Promise((resolve, reject) => {
            ffmpeg.setFfmpegPath(ffmpegPath);
            ffmpeg(tmpIn)
              .outputOptions(["-t", "20", "-c", "copy"])
              .on("end", resolve)
              .on("error", reject)
              .save(tmpOut);
          });
          buffer = fss.readFileSync(tmpOut);
          fss.unlinkSync(tmpIn);
          fss.unlinkSync(tmpOut);
        }

        ({ url: fileUrl } = await uploadToCatbox(buffer, `audio.${ext}`));
      }

      const apiUrl = `${GiftedTechApi}/api/search/shazam?apikey=${GiftedApiKey}&url=${encodeURIComponent(fileUrl)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply("❌ Could not identify the music. Please try a clearer audio clip.");
      }

      const r = res.data.result;
      const title     = r.title     || r.track?.title      || "Unknown";
      const artist    = r.artist    || r.track?.subtitle   || r.artists || "";
      const album     = r.album     || r.track?.sections?.find(s => s.type === "SONG")?.metadata?.find(m => m.title === "Album")?.text || "";
      const genres    = r.genres    || r.track?.genres?.primary || "";
      const label     = r.label     || "";
      const releaseDate = r.releasedate || r.release_date  || "";
      const coverart  = r.coverart  || r.track?.images?.coverarthq || r.track?.images?.coverart || botPic;
      const spotifyUrl  = r.spotify || r.spotify_url  || r.track?.hub?.options?.find(o => o.caption === "OPEN IN SPOTIFY")?.actions?.[0]?.uri || "";
      const youtubeUrl  = r.youtube || r.youtube_url  || "";

      let txt = `*${botName} 𝐒𝐇𝐀𝐙𝐀𝐌*\n\n`;
      txt += `🎵 *Title:* ${title}\n`;
      if (artist)      txt += `🎤 *Artist:* ${artist}\n`;
      if (album)       txt += `💿 *Album:* ${album}\n`;
      if (genres)      txt += `🎼 *Genre:* ${genres}\n`;
      if (label)       txt += `🏷️ *Label:* ${label}\n`;
      if (releaseDate) txt += `📅 *Released:* ${releaseDate}\n`;
      if (spotifyUrl)  txt += `\n🟢 *Spotify:* ${spotifyUrl}\n`;
      if (youtubeUrl)  txt += `🔴 *YouTube:* ${youtubeUrl}\n`;
      txt += `\n> *${botFooter}*`;

      await Gifted.sendMessage(
        from,
        {
          image: { url: coverart },
          caption: txt,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 5,
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
    } catch (e) {
      console.error("Error in shazam command:", e);
      await react("❌");
      if (e.message?.includes("empty media key")) {
        await reply("The media keys have expired — please send a fresh audio/video message.");
      } else {
        await reply(`❌ Error identifying music: ${e.message}`);
      }
    }
  },
);

gmd(
  {
    pattern: "google",
    aliases: ["ggle", "gglesearch", "googlesearch"],
    category: "search",
    react: "🔍",
    description: "Search Google and display first 5 results",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a search query");
    }

    try {
      const apiUrl = `${GiftedTechApi}/api/search/google?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        !Array.isArray(res.data.results) ||
        res.data.results.length === 0
      ) {
        await react("❌");
        return reply("No results found. Please try a different query.");
      }

      const results = res.data.results.slice(0, 5);

      const defaultImg =
        "https://files.catbox.moe/5evber.jpg";

      const cards = await Promise.all(
        results.map(async (result) => ({
          header: {
            title: `🔍 *${result.title}*`,
            hasMediaAttachment: true,
            imageMessage: (
              await generateWAMessageContent(
                { image: { url: defaultImg } },
                { upload: Gifted.waUploadToServer },
              )
            ).imageMessage,
          },
          body: {
            text: `📝 ${result.description || "No description"}`,
          },
          footer: { text: `> *${botFooter}*` },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "Copy Link",
                  copy_code: result.link,
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Open Link",
                  url: result.link,
                }),
              },
            ],
          },
        })),
      );

      const message = generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: {
                body: { text: `🔍 Google Results for: *${q}*` },
                footer: {
                  text: `📂 Displaying first *${results.length}* results`,
                },
                carouselMessage: { cards },
              },
            },
          },
        },
        { quoted: mek },
      );

      await Gifted.relayMessage(from, message.message, {
        messageId: message.key.id,
      });
      await react("✅");
    } catch (error) {
      console.error("Google search error:", error);
      await react("❌");
      return reply("Failed to perform Google search. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "lyrics",
    aliases: ["songlyrics", "getlyrics"],
    category: "search",
    react: "🎵",
    description: "Get song lyrics with copy button",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      GiftedTechApi,
      GiftedApiKey,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a song name");
    }

    try {
      const apiUrl = `${GiftedTechApi}/api/search/lyricsv2?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply("No lyrics found. Please try a different song.");
      }

      const { artist, title, lyrics } = res.data.result;

      let txt = `*${botName} 𝐋𝐘𝐑𝐈𝐂𝐒*\n\n`;
      txt += `🎤 *Artist:* ${artist || "Unknown"}\n`;
      txt += `🎵 *Title:* ${title || "Unknown"}\n\n`;
      txt += `${lyrics}\n\n`;

      await sendButtons(Gifted, from, {
        title: "",
        text: txt,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Lyrics",
              copy_code: lyrics,
            }),
          },
        ],
      });

      await react("✅");
    } catch (error) {
      console.error("Lyrics search error:", error);
      await react("❌");
      return reply("Failed to get lyrics. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "happymod",
    aliases: ["modapks", "apkmod"],
    category: "search",
    react: "📱",
    description: "Search HappyMod for modded APKs",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide an app name to search");
    }

    try {
      const apiUrl = `${GiftedTechApi}/api/search/happymod?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.success || !res.data?.results?.data) {
        await react("❌");
        return reply("No results found. Please try a different query.");
      }

      const results = res.data.results.data.slice(0, 5);

      const cards = await Promise.all(
        results.map(async (app) => ({
          header: {
            title: `📱 *${app.name}*`,
            hasMediaAttachment: true,
            imageMessage: (
              await generateWAMessageContent(
                { image: { url: app.icon } },
                {
                  upload: Gifted.waUploadToServer,
                },
              )
            ).imageMessage,
          },
          body: {
            text: `📝 ${app.summary || "No description"}\n📦 Source: ${app.source || "Unknown"}`,
          },
          footer: { text: `> *${botFooter}*` },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Download",
                  url: app.url,
                }),
              },
            ],
          },
        })),
      );

      const message = generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: {
                body: { text: `📱 HappyMod Results for: *${q}*` },
                footer: {
                  text: `📂 Displaying first *${results.length}* apps`,
                },
                carouselMessage: { cards },
              },
            },
          },
        },
        { quoted: mek },
      );

      await Gifted.relayMessage(from, message.message, {
        messageId: message.key.id,
      });
      await react("✅");
    } catch (error) {
      console.error("HappyMod search error:", error);
      await react("❌");
      return reply("Failed to search HappyMod. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "apkmirror",
    aliases: ["apkmirrorsearch"],
    category: "search",
    react: "📦",
    description: "Search APK Mirror for apps",
  },
  async (from, Gifted, conText) => {
    const { q, mek, reply, react, botFooter, GiftedTechApi, GiftedApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide an app name to search");
    }

    try {
      const apiUrl = `${GiftedTechApi}/api/search/apkmirror?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.success || !res.data?.results?.data) {
        await react("❌");
        return reply("No results found. Please try a different query.");
      }

      const results = res.data.results.data.slice(0, 5);

      const cards = await Promise.all(
        results.map(async (app) => ({
          header: {
            title: `📦 *${app.name}*`,
            hasMediaAttachment: true,
            imageMessage: (
              await generateWAMessageContent(
                { image: { url: app.icon } },
                {
                  upload: Gifted.waUploadToServer,
                },
              )
            ).imageMessage,
          },
          body: {
            text: `📦 Source: ${app.source || "APK Mirror"}`,
          },
          footer: { text: `> *${botFooter}*` },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Download",
                  url: app.url,
                }),
              },
            ],
          },
        })),
      );

      const message = generateWAMessageFromContent(
        from,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: {
                body: { text: `📦 APK Mirror Results for: *${q}*` },
                footer: {
                  text: `📂 Displaying first *${results.length}* apps`,
                },
                carouselMessage: { cards },
              },
            },
          },
        },
        { quoted: mek },
      );

      await Gifted.relayMessage(from, message.message, {
        messageId: message.key.id,
      });
      await react("✅");
    } catch (error) {
      console.error("APK Mirror search error:", error);
      await react("❌");
      return reply("Failed to search APK Mirror. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "stickersearch",
    aliases: ["searchsticker", "findsticker"],
    category: "search",
    react: "🎨",
    description: "Search and send stickers",
  },
  async (from, Gifted, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      packName,
      packAuthor,
      GiftedTechApi,
      GiftedApiKey,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a search query for stickers");
    }

    try {
      const apiUrl = `${GiftedTechApi}/api/search/stickersearch?apikey=${GiftedApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        res.data.results.length === 0
      ) {
        await react("❌");
        return reply("No stickers found. Please try a different query.");
      }

      const stickers = res.data.results.slice(0, 10);

      for (const stickerUrl of stickers) {
        try {
          const response = await axios.get(stickerUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
          });
          const stickerBuffer = Buffer.from(response.data);

          const processedSticker = await gmdSticker(stickerBuffer, {
            pack: packName || "𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃",
            author: packAuthor || "GIFTED-TECH",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            quality: 75,
          });

          await Gifted.sendMessage(
            from,
            { sticker: processedSticker },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (stickerErr) {
          console.error("Error sending sticker:", stickerErr.message);
        }
      }

      await react("✅");
    } catch (error) {
      console.error("Sticker search error:", error);
      await react("❌");
      return reply("Failed to search stickers. Please try again.");
    }
  },
);

// ─── URBAN DICTIONARY ─────────────────────────────────────────────────────────

gmd({
  pattern: "urban",
  aliases: ["ud", "slang", "urbandict"],
  react: "📖",
  category: "search",
  description: "Look up any word on Urban Dictionary. Usage: .urban slay",
}, async (from, Gifted, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q) return reply("❌ Provide a word!\nExample: `.urban no cap`");
  try {
    await react("🔍");
    const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(q)}`, { timeout: 15000 });
    const entry = res.data?.list?.[0];
    if (!entry) return reply(`❌ No definition found for *"${q}"*`);
    const def = entry.definition.replace(/\[|\]/g, "").slice(0, 600);
    const ex  = (entry.example || "").replace(/\[|\]/g, "").slice(0, 250);
    const up  = entry.thumbs_up || 0;
    const dn  = entry.thumbs_down || 0;
    await react("✅");
    await Gifted.sendMessage(from, {
      text: `📖 *Urban Dictionary*\n\n🔤 *Word:* ${q}\n\n*Definition:*\n${def}\n${ex ? `\n*Example:*\n_${ex}_\n` : ""}\n👍 ${up}  👎 ${dn}\n\n> _${botFooter}_`,
    }, { quoted: mek });
  } catch {
    await react("❌");
    reply("❌ Failed to fetch definition. Try again.");
  }
});
