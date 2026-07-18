
const { gmd } = require("../guru"),
  axios = require("axios"),
  {
    generateWAMessageContent,
    generateWAMessageFromContent,
  } = require("@whiskeysockets/baileys"),
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
    pattern: "ggleimage",
    aliases: ["googleimage", "gimage", "ggleimagesearch", "googleimagesearch"],
    category: "search",
    react: "🖼️",
    description: "Search Google Images and send first 10 images",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a search query for images");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/googleimage?apikey=${GuruApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        res.data.results.length === 0
      ) {
        await react("❌");
        return reply("No images found. Please try a different query.");
      }

      const images = res.data.results.slice(0, 10);

      await reply(`Found ${images.length} images for: *${q}*\nSending...`);

      for (let i = 0; i < images.length; i++) {
        try {
          await Guru.sendMessage(
            from,
            {
              image: { url: images[i] },
              caption: `🖼️ Image ${i + 1}/${images.length}\n\n> *${botFooter}*`,
            },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (imgErr) {
          console.error("Error sending image:", imgErr.message);
        }
      }

      await react("✅");
    } catch (error) {
      console.error("Google image search error:", error);
      await react("❌");
      return reply("Failed to search images. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "unsplash",
    aliases: ["unsplashphotos", "unsplashsearch"],
    category: "search",
    react: "📷",
    description: "Search Unsplash and send first 10 photos",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a search query for photos");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/unsplash?apikey=${GuruApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        res.data.results.length === 0
      ) {
        await react("❌");
        return reply("No photos found. Please try a different query.");
      }

      const photos = res.data.results.slice(0, 10);

      await reply(
        `Found ${photos.length} Unsplash photos for: *${q}*\nSending...`,
      );

      for (let i = 0; i < photos.length; i++) {
        try {
          await Guru.sendMessage(
            from,
            {
              image: { url: photos[i] },
              caption: `📷 Unsplash Photo ${i + 1}/${photos.length}\n\n> *${botFooter}*`,
            },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (imgErr) {
          console.error("Error sending Unsplash photo:", imgErr.message);
        }
      }

      await react("✅");
    } catch (error) {
      console.error("Unsplash search error:", error);
      await react("❌");
      return reply("Failed to search Unsplash. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "wallpapers",
    aliases: [
      "wallpaper",
      "hdwallpaper",
      "hdwallpapers",
      "getwallpapers",
      "randomwallpapers",
    ],
    category: "search",
    react: "🖼️",
    description: "Search HD wallpapers by category",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a wallpaper category or search query");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/wallpaper?apikey=${GuruApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        res.data.results.length === 0
      ) {
        await react("❌");
        return reply("No wallpapers found. Please try a different query.");
      }

      const wallpapers = res.data.results.slice(0, 10);

      await reply(
        `Found ${wallpapers.length} wallpapers for: *${q}*\nSending...`,
      );

      for (let i = 0; i < wallpapers.length; i++) {
        try {
          const wp = wallpapers[i];
          const imageUrl = Array.isArray(wp.image) ? wp.image[0] : wp.image;

          await Guru.sendMessage(
            from,
            {
              image: { url: imageUrl },
              caption: `🖼️ *Wallpaper ${i + 1}/${wallpapers.length}*\n📂 Category: ${wp.type || "Unknown"}\n\n> *${botFooter}*`,
            },
            { quoted: mek },
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (wpErr) {
          console.error("Error sending wallpaper:", wpErr.message);
        }
      }

      await react("✅");
    } catch (error) {
      console.error("Wallpaper search error:", error);
      await react("❌");
      return reply("Failed to search wallpapers. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "weather",
    aliases: ["getweather", "clima"],
    category: "search",
    react: "🌤️",
    description: "Get weather information for a location",
  },
  async (from, Guru, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      GuruTechApi,
      GuruApiKey,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a location name");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/weather?apikey=${GuruApiKey}&location=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply(
          "Could not get weather for that location. Please try a different location.",
        );
      }

      const w = res.data.result;
      const weatherIcons = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Drizzle: "🌦️",
        Thunderstorm: "⛈️",
        Snow: "❄️",
        Mist: "🌫️",
        Fog: "🌫️",
        Haze: "🌫️",
      };

      const icon = weatherIcons[w.weather?.main] || "🌡️";

      let txt = `*${botName} 𝐖𝐄𝐀𝐓𝐇𝐄𝐑*\n\n`;
      txt += `${icon} *Location:* ${w.location}, ${w.sys?.country || ""}\n\n`;
      txt += `🌡️ *Temperature:* ${w.main?.temp}°C\n`;
      txt += `🤒 *Feels Like:* ${w.main?.feels_like}°C\n`;
      txt += `📉 *Min Temp:* ${w.main?.temp_min}°C\n`;
      txt += `📈 *Max Temp:* ${w.main?.temp_max}°C\n\n`;
      txt += `☁️ *Weather:* ${w.weather?.main} (${w.weather?.description})\n`;
      txt += `💧 *Humidity:* ${w.main?.humidity}%\n`;
      txt += `🌬️ *Wind Speed:* ${w.wind?.speed} m/s\n`;
      txt += `👁️ *Visibility:* ${w.visibility / 1000} km\n`;
      txt += `🔘 *Pressure:* ${w.main?.pressure} hPa\n\n`;
      txt += `> *${botFooter}*`;

      await reply(txt);
      await react("✅");
    } catch (error) {
      console.error("Weather search error:", error);
      await react("❌");
      return reply("Failed to get weather data. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "npm",
    aliases: ["npmsearch", "npmpack", "npmpackage"],
    category: "search",
    react: "📦",
    description: "Search NPM packages",
  },
  async (from, Guru, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      GuruTechApi,
      GuruApiKey,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a package name");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/npmsearch?apikey=${GuruApiKey}&packagename=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply("Package not found. Please check the package name.");
      }

      const pkg = res.data.result;

      let txt = `*${botName} 𝐍𝐏𝐌 𝐏𝐀𝐂𝐊𝐀𝐆𝐄*\n\n`;
      txt += `📦 *Name:* ${pkg.name}\n`;
      txt += `📝 *Description:* ${pkg.description || "No description"}\n`;
      txt += `🏷️ *Version:* ${pkg.version}\n`;
      txt += `📜 *License:* ${pkg.license || "N/A"}\n`;
      txt += `👤 *Owner:* ${pkg.owner || "N/A"}\n`;
      txt += `📅 *Published:* ${pkg.publishedDate || "N/A"}\n`;
      txt += `📅 *Created:* ${pkg.createdDate || "N/A"}\n`;
      txt += `🔗 *Package:* ${pkg.packageLink}\n`;
      if (pkg.homepage) txt += `🏠 *Homepage:* ${pkg.homepage}\n`;
      txt += `\n> *${botFooter}*`;

      if (pkg.downloadLink) {
        const dateNow = Date.now();
        await sendButtons(Guru, from, {
          title: "",
          text: txt,
          footer: botFooter,
          buttons: [
            {
              id: `npm_dl_${dateNow}`,
              text: "📥 Download Package",
            },
          ],
        });

        const handleResponse = async (event) => {
          const messageData = event.messages[0];
          if (!messageData?.message) return;

          const selectedButtonId = extractButtonId(messageData.message);
          if (!selectedButtonId) return;
          if (!selectedButtonId?.includes(`npm_dl_${dateNow}`)) return;

          const isFromSameChat = messageData.key?.remoteJid === from;
          if (!isFromSameChat) return;

          try {
            await Guru.sendMessage(
              from,
              {
                document: { url: pkg.downloadLink },
                fileName: `${pkg.name}-${pkg.version}.tgz`,
                mimetype: "application/gzip",
              },
              { quoted: messageData },
            );
            await react("✅");
          } catch (dlErr) {
            await reply("Failed to download package: " + dlErr.message);
          }

        };

        Guru.ev.on("messages.upsert", handleResponse);
        setTimeout(
          () => Guru.ev.off("messages.upsert", handleResponse),
          300000,
        );
      } else {
        await reply(txt);
      }

      await react("✅");
    } catch (error) {
      console.error("NPM search error:", error);
      await react("❌");
      return reply("Failed to search NPM. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "wattpad",
    aliases: ["watt", "wattsearch", "wattpadsearch"],
    category: "search",
    react: "📚",
    description: "Search Wattpad stories",
  },
  async (from, Guru, conText) => {
    const { q, mek, reply, react, botFooter, GuruTechApi, GuruApiKey } =
      conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a search query");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/wattpad?apikey=${GuruApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        res.data.results.length === 0
      ) {
        await react("❌");
        return reply("No stories found. Please try a different query.");
      }

      const stories = res.data.results.slice(0, 5);

      const cards = await Promise.all(
        stories.map(async (story) => ({
          header: {
            title: `📚 *${story.tittle}*`,
            hasMediaAttachment: true,
            imageMessage: (
              await generateWAMessageContent(
                { image: { url: story.thumbnail } },
                {
                  upload: Guru.waUploadToServer,
                },
              )
            ).imageMessage,
          },
          body: {
            text: `👁️ Reads: ${story.reads}\n❤️ Likes: ${story.likes}`,
          },
          footer: { text: `> *${botFooter}*` },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Read Story",
                  url: story.link,
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
                body: { text: `📚 Wattpad Results for: *${q}*` },
                footer: {
                  text: `📂 Displaying first *${stories.length}* stories`,
                },
                carouselMessage: { cards },
              },
            },
          },
        },
        { quoted: mek },
      );

      await Guru.relayMessage(from, message.message, {
        messageId: message.key.id,
      });
      await react("✅");
    } catch (error) {
      console.error("Wattpad search error:", error);
      await react("❌");
      return reply("Failed to search Wattpad. Please try again.");
    }
  },
);

gmd(
  {
    pattern: "spotifysearch",
    aliases: ["spotisearch"],
    category: "search",
    react: "🎵",
    description: "Search Spotify for tracks",
  },
  async (from, Guru, conText) => {
    const {
      q,
      mek,
      reply,
      react,
      botName,
      botFooter,
      botPrefix,
      GuruTechApi,
      GuruApiKey,
    } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a song or artist name to search");
    }

    try {
      const apiUrl = `${GuruTechApi}/api/search/spotifysearch?apikey=${GuruApiKey}&query=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (
        !res.data?.success ||
        !res.data?.results ||
        !Array.isArray(res.data.results) ||
        res.data.results.length === 0
      ) {
        await react("❌");
        const errorMsg =
          res.data?.results?.msg ||
          "No tracks found. Please try a different query.";
        return reply(errorMsg);
      }

      const tracks = res.data.results.slice(0, 5);
      const dateNow = Date.now();

      let txt = `*${botName} 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐒𝐄𝐀𝐑𝐂𝐇*\n\n`;
      txt += `🔍 *Query:* ${q}\n\n`;

      tracks.forEach((track, i) => {
        txt += `*${i + 1}. ${track.title}*\n`;
        txt += `🎤 Artist: ${track.artist}\n`;
        txt += `⏱️ Duration: ${track.duration}\n\n`;
      });

      const buttons = tracks.map((track, i) => ({
        id: `${botPrefix}spotify ${track.url}`,
        text: `${i + 1}. ${track.title.substring(0, 30)}`,
      }));

      await sendButtons(Guru, from, {
        title: "",
        text: txt,
        footer: botFooter,
        buttons: buttons,
      });

      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData?.message) return;

        const selectedButtonId = extractButtonId(messageData.message);
        if (!selectedButtonId) return;
        if (!selectedButtonId?.includes(`spotify_dl_${dateNow}`)) return;

        const isFromSameChat = messageData.key?.remoteJid === from;
        if (!isFromSameChat) return;

        const trackIndex = parseInt(selectedButtonId.split("_").pop());
        const selectedTrack = tracks[trackIndex];

        if (selectedTrack) {
          await Guru.sendMessage(
            from,
            { text: `${botPrefix}spotify ${selectedTrack.url}` },
            { quoted: messageData },
          );
        }
      };

      Guru.ev.on("messages.upsert", handleResponse);
      setTimeout(
        () => Guru.ev.off("messages.upsert", handleResponse),
        300000,
      );
      await react("✅");
    } catch (error) {
      console.error("Spotify search error:", error);
      await react("❌");
      return reply("Failed to search Spotify. Please try again.");
    }
  },
);

// ─── MOVIE / SERIES SEARCH ───────────────────────────────────────────────────

function buildFooterS2(botFooter, botName) {
    if (botFooter && botName) return `\n\n> _${botName}_`;
    if (botName) return `\n\n> _${botName}_`;
    return '';
}

gmd(
    {
        pattern: "movie",
        aliases: ["film", "imdb", "movieinfo", "findmovie"],
        react: "🎬",
        description: "Search for a movie or series on IMDB. Usage: .movie <title>",
        category: "search",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName } = conText;
        const footer = buildFooterS2(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎬  *MOVIE / SERIES SEARCH*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  *Usage:*
┃  .movie <title>
┃
┃  *Examples:*
┃  .movie Avengers
┃  .movie Breaking Bad
┃  .movie The Batman 2022
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`
            );
        }

        try {
            if (react) await react("🔍");

            // Use free imdbot workers proxy — no API key needed
            const searchUrl = `https://search.imdbot.workers.dev/?q=${encodeURIComponent(q.trim())}`;
            const res = await axios.get(searchUrl, { timeout: 20000 });
            const data = res.data;

            if (!data || !data.ok || !data.description || !data.description.length) {
                if (react) await react("❌");
                return reply(`❌ No results found for *${q.trim()}*.\n\nTry a different title.${footer}`);
            }

            const results = data.description.slice(0, 5);
            let msg =
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎬  *IMDB SEARCH RESULTS*
┃  Query: _${q.trim()}_
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;

            results.forEach((item, i) => {
                const title  = item['#TITLE']    || 'Unknown';
                const year   = item['#YEAR']     || '';
                const type   = item['#TYPE']     || '';
                const imdbId = item['#IMDB_ID']  || '';
                const rank   = item['#RANK']     || '';
                const actors = item['#ACTORS']   || '';
                const typeEmoji = type === 'movie' ? '🎬' : type === 'tvSeries' ? '📺' : type === 'tvMovie' ? '📽️' : '🎥';
                msg += `*${i + 1}. ${title}* ${year ? `(${year})` : ''} ${typeEmoji}\n`;
                if (actors) msg += `   👥 _${actors.split(',').slice(0, 2).join(', ')}_\n`;
                if (rank)   msg += `   ⭐ IMDB Rank: ${rank}\n`;
                if (imdbId) msg += `   🔗 .movieinfo ${imdbId}\n`;
                msg += '\n';
            });

            msg += `_Use *.movieinfo <imdb-id>* for full details_${footer}`;

            if (react) await react("✅");
            await reply(msg);

        } catch (err) {
            if (react) await react("❌");
            await reply(`❌ Search failed: ${err.message}\n\nTry again shortly.${footer}`);
        }
    }
);

gmd(
    {
        pattern: "movieinfo",
        aliases: ["filminfo", "imdbinfo", "seriesinfo"],
        react: "🎬",
        description: "Get full IMDB details for a movie/series. Usage: .movieinfo <imdb-id>",
        category: "search",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName } = conText;
        const footer = buildFooterS2(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(`❌ Provide an IMDB ID!\n\nExample: *.movieinfo tt4154796*\n\n_Get IDs from *.movie <title>*_${footer}`);
        }

        try {
            if (react) await react("🔍");

            const imdbId  = q.trim().replace(/[^a-zA-Z0-9]/g, '');
            const infoUrl = `https://search.imdbot.workers.dev/?tt=${imdbId}`;
            const res  = await axios.get(infoUrl, { timeout: 25000 });
            const data = res.data;

            if (!data || !data.ok || !data.short) {
                if (react) await react("❌");
                return reply(`❌ No details found for *${imdbId}*.\n\nMake sure the IMDB ID is correct.${footer}`);
            }

            const s        = data.short;
            const title    = s.name          || 'Unknown';
            const year     = s.datePublished ? s.datePublished.slice(0, 4) : '';
            const genre    = Array.isArray(s.genre) ? s.genre.join(', ') : (s.genre || '');
            const rating   = s.aggregateRating?.ratingValue || 'N/A';
            const rCount   = s.aggregateRating?.ratingCount ? `(${Number(s.aggregateRating.ratingCount).toLocaleString()} votes)` : '';
            const duration = s.duration?.replace('PT','').replace('H',' hr ').replace('M',' min') || '';
            const lang     = s.inLanguage    || '';
            const country  = Array.isArray(s.countryOfOrigin) ? s.countryOfOrigin.join(', ') : (s.countryOfOrigin || '');
            const desc     = s.description   ? s.description.slice(0, 250) + (s.description.length > 250 ? '…' : '') : '';
            const actors   = Array.isArray(s.actor) ? s.actor.slice(0, 4).map(a => a.name).join(', ') : '';
            const director = Array.isArray(s.director) ? s.director.slice(0, 2).map(d => d.name).join(', ') : (s.director?.name || '');
            const trailer  = data.trailer?.embedUrl || data.trailer?.url || '';
            const imdbLink = `https://www.imdb.com/title/${imdbId}/`;
            const poster   = s.image || '';

            let info =
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎬  *${title}* ${year ? `(${year})` : ''}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
`;
            if (genre)    info += `┃  🎭 Genre    : ${genre}\n`;
            if (duration) info += `┃  ⏱️  Duration : ${duration}\n`;
            if (rating !== 'N/A') info += `┃  ⭐ Rating   : ${rating}/10 ${rCount}\n`;
            if (lang)     info += `┃  🌐 Language : ${lang}\n`;
            if (country)  info += `┃  🗺️  Country  : ${country}\n`;
            if (director) info += `┃  🎥 Director : ${director}\n`;
            if (actors)   info += `┃  👥 Cast     : ${actors}\n`;
            info += `┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃\n`;
            if (desc)     info += `┃  📝 _${desc}_\n┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃\n`;
            if (trailer)  info += `┃  🎞️ Trailer  : ${trailer}\n`;
            info += `┃  🔗 IMDB     : ${imdbLink}\n`;
            info += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`;

            if (react) await react("✅");

            if (poster && poster.startsWith('http')) {
                try {
                    const imgBuf = await axios.get(poster, { responseType: 'arraybuffer', timeout: 15000 });
                    await Guru.sendMessage(from, {
                        image: Buffer.from(imgBuf.data),
                        caption: info,
                    }, { quoted: mek });
                    return;
                } catch {}
            }
            await reply(info);

        } catch (err) {
            if (react) await react("❌");
            await reply(`❌ Failed to fetch info: ${err.message}${footer}`);
        }
    }
);

gmd(
    {
        pattern: "trailer",
        aliases: ["movietrailer", "seriestrailer", "findtrailer"],
        react: "🎞️",
        description: "Find a movie or series trailer. Usage: .trailer <title>",
        category: "search",
    },
    async (from, Guru, conText) => {
        const { reply, react, q, mek, botFooter, botName } = conText;
        const footer = buildFooterS2(botFooter, botName);

        if (!q || !q.trim()) {
            return reply(`❌ Provide a title!\n\nExample: *.trailer Avengers Endgame*${footer}`);
        }

        try {
            if (react) await react("🔍");

            // Search IMDB for the movie to find its trailer
            const searchUrl = `https://search.imdbot.workers.dev/?q=${encodeURIComponent(q.trim() + ' trailer')}`;
            const res  = await axios.get(searchUrl, { timeout: 20000 });
            const data = res.data;

            const first  = data?.description?.[0];
            const imdbId = first?.['#IMDB_ID'];
            const title  = first?.['#TITLE'] || q.trim();
            const year   = first?.['#YEAR']  || '';

            // Build YouTube search link (always works)
            const ytQuery = encodeURIComponent(`${q.trim()} official trailer`);
            const ytLink  = `https://www.youtube.com/results?search_query=${ytQuery}`;

            let trailerUrl = '';
            if (imdbId) {
                try {
                    const infoRes  = await axios.get(`https://search.imdbot.workers.dev/?tt=${imdbId}`, { timeout: 20000 });
                    trailerUrl = infoRes.data?.trailer?.embedUrl || infoRes.data?.trailer?.url || '';
                } catch {}
            }

            if (react) await react("✅");

            const msg =
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🎞️  *TRAILER FINDER*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  🎬 _${title}_ ${year ? `(${year})` : ''}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
${trailerUrl ? `┃  🎥 IMDB Trailer:\n┃  ${trailerUrl}\n┃\n` : ''}┃  ▶️ YouTube Search:\n┃  ${ytLink}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${footer}`;

            await reply(msg);

        } catch (err) {
            if (react) await react("❌");
            const ytQuery = encodeURIComponent(`${q.trim()} official trailer`);
            await reply(`🎞️ *Trailer for:* ${q.trim()}\n\n▶️ https://www.youtube.com/results?search_query=${ytQuery}${footer}`);
        }
    }
);
