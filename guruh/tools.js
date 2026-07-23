
const { gmd, getExtensionFromMime, isTextContent } = require("../guru");
const axios = require("axios");
const fs = require("fs").promises;
const crypto = require("crypto");
const { sendButtons } = require("gifted-btns");

gmd(
  {
    pattern: "fetch",
    react: "🌐",
    aliases: ["get", "testapi", "curl"],
    category: "tools",
    description: "Fetch and display content from a URL",
  },
  async (from, Guru, conText) => {
    const { reply, mek, q, quotedMsg, formatAudio, formatVideo } = conText;

    const extractUrl = (text) => {
      if (!text) return null;
      const match = text.match(/https?:\/\/[^\s]+/i);
      return match ? match[0] : null;
    };

    const getMsgText = (msg) => {
      if (!msg) return "";
      return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||
        msg.buttonsMessage?.contentText ||
        msg.listMessage?.description ||
        ""
      );
    };

    let url = q?.trim() || extractUrl(getMsgText(quotedMsg));

    if (!url) return reply("❌ Provide a URL or quote a message containing a link.");
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        validateStatus: () => true,
        timeout: 60000,
        maxContentLength: 100 * 1024 * 1024,
      });

      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      const buffer = Buffer.from(response.data);

      const urlParts = url.split("?")[0].split("/");
      let filename = urlParts.pop() || "file";
      if (filename.length > 100) filename = filename.substring(0, 100);

      if (!filename.includes(".") || filename.startsWith(".")) {
        const ext = getExtensionFromMime(contentType);
        filename = filename.replace(/^\.+/, "") || "file";
        filename += ext;
      }

      if (contentType.includes("image/")) {
        return Guru.sendMessage(
          from,
          { image: buffer, caption: url },
          { quoted: mek },
        );
      }

      if (contentType.includes("video/")) {
        const formattedVideo = await formatVideo(buffer);
        return Guru.sendMessage(
          from,
          { video: formattedVideo, caption: url },
          { quoted: mek },
        );
      }

      if (contentType.includes("audio/")) {
        try {
          const formattedAudio = await formatAudio(buffer);
          return Guru.sendMessage(
            from,
            {
              audio: formattedAudio,
              mimetype: "audio/mpeg",
              fileName: filename,
            },
            { quoted: mek },
          );
        } catch {
          return Guru.sendMessage(
            from,
            {
              audio: buffer,
              mimetype: contentType.split(";")[0],
              fileName: filename,
            },
            { quoted: mek },
          );
        }
      }

      if (isTextContent(contentType)) {
        const textContent = buffer.toString("utf-8");

        if (contentType.includes("json")) {
          try {
            const json = JSON.parse(textContent);
            const formatted = JSON.stringify(json, null, 2);
            return reply("```json\n" + formatted + "\n```");
          } catch {
            return reply(textContent);
          }
        }

        const lang = contentType.includes("javascript")
          ? "javascript"
          : contentType.includes("css")
            ? "css"
            : contentType.includes("xml")
              ? "xml"
              : contentType.includes("sql")
                ? "sql"
                : contentType.includes("yaml")
                  ? "yaml"
                  : "";
        if (lang) {
          return reply("```" + lang + "\n" + textContent + "\n```");
        }
        return reply(textContent);
      }

      return Guru.sendMessage(
        from,
        {
          document: buffer,
          mimetype: contentType.split(";")[0] || "application/octet-stream",
          fileName: filename,
        },
        { quoted: mek },
      );
    } catch (err) {
      console.error("fetch error:", err);
      return reply("❌ Failed to fetch: " + (err.message || "Unknown error"));
    }
  },
);

gmd(
  {
    pattern: "photoeditor",
    aliases: ["photoedit", "editpic", "editphoto", "phototedit"],
    react: "🎨",
    category: "tools",
    description: "Edit photos with AI using a prompt",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      q,
      quoted,
      quotedMsg,
      botFooter,
      botName,
      GuruTechApi,
      GuruApiKey,
      uploadToImgBB,
      botPrefix,
    } = conText;

    let imageUrl = null;
    let prompt = q?.trim() || "";

    if (quotedMsg) {
      const quotedImage = quoted?.imageMessage || quoted?.message?.imageMessage;
      if (quotedImage) {
        try {
          const tempPath = await Guru.downloadAndSaveMediaMessage(
            quotedImage,
            "temp_photo",
          );
          const buffer = await fs.readFile(tempPath);
          const upload = await uploadToImgBB(buffer, "image.jpg");
          imageUrl = upload.url;
          await fs.unlink(tempPath).catch(() => {});
        } catch (e) {
          await react("❌");
          return reply("Failed to process the quoted image");
        }
      }
    }

    if (!imageUrl && q) {
      const parts = q.split(" ");
      if (parts[0]?.startsWith("http")) {
        imageUrl = parts[0];
        prompt = parts.slice(1).join(" ");
      }
    }

    if (!imageUrl) {
      await react("❌");
      return reply(
        `Please provide an image URL or quote an image with a prompt\n\nUsage: ${botPrefix}photoeditor <url> <prompt>\nOr quote an image with: ${botPrefix}photoeditor <prompt>`,
      );
    }

    if (!prompt) {
      await react("❌");
      return reply(
        "Please provide an editing prompt\n\nExample: .photoeditor <url> Change his shirt color to blue",
      );
    }

    await react("⏳");

    try {
      const res = await axios.get(`${GuruTechApi}/api/tools/photoeditor`, {
        params: { apikey: GuruApiKey, url: imageUrl, prompt: prompt },
      });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply("Failed to edit the photo");
      }

      await Guru.sendMessage(
        from,
        {
          image: { url: res.data.result },
          caption: `*${botName} PHOTO EDITOR*\n\n✨ Prompt: ${prompt}\n\n> *${botFooter}*`,
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (e) {
      console.error("Photo editor error:", e);
      await react("❌");
      return reply("Failed to edit the photo: " + e.message);
    }
  },
);

gmd(
  {
    pattern: "createpdf",
    aliases: ["topdf", "makepdf", "pdf"],
    react: "📄",
    category: "tools",
    description: "Create a PDF from text or image",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      q,
      quoted,
      quotedMsg,
      botFooter,
      botName,
      GuruTechApi,
      GuruApiKey,
      uploadToImgBB,
      botPrefix,
    } = conText;

    const input = q?.trim() || "";
    const parts = input.split(/\s+/);
    const pdfName = parts[0] || "";
    const restContent = parts.slice(1).join(" ");

    let content = restContent;

    if (!content && quotedMsg) {
      if (quoted?.conversation || quoted?.extendedTextMessage?.text) {
        content = quoted?.conversation || quoted?.extendedTextMessage?.text;
      } else {
        const quotedImage =
          quoted?.imageMessage || quoted?.message?.imageMessage;
        if (quotedImage) {
          try {
            const tempPath = await Guru.downloadAndSaveMediaMessage(
              quotedImage,
              "temp_img",
            );
            const buffer = await fs.readFile(tempPath);
            const upload = await uploadToImgBB(buffer, "image.jpg");
            content = upload.url;
            await fs.unlink(tempPath).catch(() => {});
          } catch (e) {
            await react("❌");
            return reply("Failed to process the quoted image");
          }
        }
      }
    }

    if (!pdfName) {
      await react("❌");
      return reply(
        `Please provide a PDF name and content\n\n*Usage:*\n${botPrefix}pdf <name> <text>\n${botPrefix}pdf <name> <image_url>\n${botPrefix}pdf <name> (quote a message/image)`,
      );
    }

    if (!content) {
      await react("❌");
      return reply(
        `Please provide content for the PDF\n\n*Usage:*\n${botPrefix}pdf <name> <text>\n${botPrefix}pdf <name> <image_url>\n${botPrefix}pdf <name> (quote a message/image)`,
      );
    }

    await react("⏳");

    try {
      const res = await axios.get(`${GuruTechApi}/api/tools/topdf`, {
        params: { apikey: GuruApiKey, query: content },
        responseType: "arraybuffer",
      });

      const fileName = pdfName.endsWith(".pdf") ? pdfName : `${pdfName}.pdf`;

      await Guru.sendMessage(
        from,
        {
          document: Buffer.from(res.data),
          mimetype: "application/pdf",
          fileName: fileName,
          caption: `> *${botFooter}*`,
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (e) {
      console.error("Create PDF error:", e);
      await react("❌");
      return reply("Failed to create PDF: " + e.message);
    }
  },
);

gmd(
  {
    pattern: "domaincheck",
    aliases: ["domainstatus", "domain"],
    react: "🌐",
    category: "tools",
    description: "Check domain WHOIS information",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter, botName, botPrefix, GuruTechApi, GuruApiKey } =
      conText;

    const domain = q?.trim();
    if (!domain) {
      await react("❌");
      return reply(
        `Please provide a domain\n\nUsage: ${botPrefix}domaincheck example.com`,
      );
    }

    await react("⏳");

    try {
      const res = await axios.get(`${GuruTechApi}/api/tools/whois`, {
        params: { apikey: GuruApiKey, domain: domain },
      });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply("Failed to fetch domain info");
      }

      const r = res.data.result;
      let txt = `*${botName} DOMAIN CHECK*\n\n`;
      txt += `🌐 *Domain:* ${r.domainName || domain}\n`;
      txt += `📅 *Created:* ${r.creationDate ? new Date(r.creationDate * 1000).toLocaleDateString() : "N/A"}\n`;
      txt += `📅 *Expires:* ${r.expirationDate ? new Date(r.expirationDate * 1000).toLocaleDateString() : "N/A"}\n`;
      txt += `📅 *Updated:* ${r.updatedDate ? new Date(r.updatedDate * 1000).toLocaleDateString() : "N/A"}\n`;
      txt += `🏢 *Registrar:* ${r.registrar || "N/A"}\n`;
      txt += `🔒 *DNSSEC:* ${r.dnssec || "N/A"}\n`;
      if (r.nameServers?.length)
        txt += `🖥️ *Nameservers:* ${r.nameServers.join(", ")}\n`;
      if (r.states?.length) txt += `📊 *States:* ${r.states.join(", ")}\n`;
      txt += `\n> *${botFooter}*`;

      await reply(txt);
      await react("✅");
    } catch (e) {
      console.error("Domain check error:", e);
      await react("❌");
      return reply("Failed to check domain: " + e.message);
    }
  },
);

gmd(
  {
    pattern: "remini",
    aliases: ["enhance", "restorephoto", "photoenhance", "enhancephoto"],
    react: "✨",
    category: "tools",
    description: "Enhance and restore photos with AI",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      q,
      quoted,
      quotedMsg,
      botFooter,
      botName,
      GuruTechApi,
      GuruApiKey,
      uploadToImgBB,
      botPrefix,
    } = conText;

    let imageUrl = q?.trim();

    if (!imageUrl && quotedMsg) {
      const quotedImage = quoted?.imageMessage || quoted?.message?.imageMessage;
      if (quotedImage) {
        try {
          const tempPath = await Guru.downloadAndSaveMediaMessage(
            quotedImage,
            "temp_enhance",
          );
          const buffer = await fs.readFile(tempPath);
          const upload = await uploadToImgBB(buffer, "image.jpg");
          imageUrl = upload.url;
          await fs.unlink(tempPath).catch(() => {});
        } catch (e) {
          await react("❌");
          return reply("Failed to process the quoted image");
        }
      }
    }

    if (!imageUrl) {
      await react("❌");
      return reply(
        `Please provide an image URL or quote an image\n\nUsage: ${botPrefix}remini <url>\nOr quote an image`,
      );
    }

    await react("⏳");

    try {
      const res = await axios.get(`${GuruTechApi}/api/tools/remini`, {
        params: { apikey: GuruApiKey, url: imageUrl },
      });

      if (!res.data?.success || !res.data?.result) {
        await react("❌");
        return reply("Failed to enhance the photo");
      }

      await Guru.sendMessage(
        from,
        {
          image: { url: res.data.result },
          caption: `*${botName} PHOTO ENHANCER*\n\n✨ Enhanced with AI\n\n> *${botFooter}*`,
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (e) {
      console.error("Remini error:", e);
      await react("❌");
      return reply("Failed to enhance the photo: " + e.message);
    }
  },
);

gmd(
  {
    pattern: "ebinary",
    aliases: ["tobinary", "textbinary"],
    react: "🔢",
    category: "tools",
    description: "Encrypt text to binary",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter, botName, botPrefix } = conText;

    const text = q?.trim();
    if (!text) {
      await react("❌");
      return reply(`Please provide text to convert\n\nUsage: ${botPrefix}ebinary Hello`);
    }

    const binary = text
      .split("")
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");

    await sendButtons(Guru, from, {
      title: `${botName} BINARY ENCODER`,
      text: `📝 *Input:* ${text}\n\n🔢 *Binary:*\n${binary}`,
      footer: botFooter,
      buttons: [
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📋 Copy Binary",
            copy_code: binary,
          }),
        },
      ],
    });

    await react("✅");
  },
);

gmd(
  {
    pattern: "debinary",
    aliases: ["dbinary", "binarytext", "frombinary"],
    react: "🔢",
    category: "tools",
    description: "Decrypt binary to text",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter, botName, botPrefix } = conText;

    const binary = q?.trim();
    if (!binary) {
      await react("❌");
      return reply(
        `Please provide binary to convert\n\nUsage: ${botPrefix}debinary 01001000 01100101 01101100 01101100 01101111`,
      );
    }

    try {
      const text = binary
        .split(" ")
        .map((b) => String.fromCharCode(parseInt(b, 2)))
        .join("");

      await sendButtons(Guru, from, {
        title: `${botName} BINARY DECODER`,
        text: `🔢 *Binary:* ${binary.substring(0, 100)}${binary.length > 100 ? "..." : ""}\n\n📝 *Text:*\n${text}`,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Text",
              copy_code: text,
            }),
          },
        ],
      });

      await react("✅");
    } catch (e) {
      await react("❌");
      return reply("Invalid binary format");
    }
  },
);

gmd(
  {
    pattern: "ebase",
    aliases: ["tobase64", "base64encode", "ebase64"],
    react: "🔐",
    category: "tools",
    description: "Encrypt text to Base64",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter, botName, botPrefix } = conText;

    const text = q?.trim();
    if (!text) {
      await react("❌");
      return reply(
        `Please provide text to convert\n\nUsage: ${botPrefix}ebase Hello World`,
      );
    }

    const base64 = Buffer.from(text).toString("base64");

    await sendButtons(Guru, from, {
      title: `${botName} BASE64 ENCODER`,
      text: `📝 *Input:* ${text}\n\n🔐 *Base64:*\n${base64}`,
      footer: botFooter,
      buttons: [
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📋 Copy Base64",
            copy_code: base64,
          }),
        },
      ],
    });

    await react("✅");
  },
);

gmd(
  {
    pattern: "dbase",
    aliases: ["debase", "debase64", "base64decode", "frombase64"],
    react: "🔐",
    category: "tools",
    description: "Decrypt Base64 to text",
  },
  async (from, Guru, conText) => {
    const { reply, react, q, botFooter, botName, botPrefix } = conText;

    const base64 = q?.trim();
    if (!base64) {
      await react("❌");
      return reply(
        `Please provide Base64 to decode\n\nUsage: ${botPrefix}dbase SGVsbG8gV29ybGQ=`,
      );
    }

    try {
      const text = Buffer.from(base64, "base64").toString("utf8");

      await sendButtons(Guru, from, {
        title: `${botName} BASE64 DECODER`,
        text: `🔐 *Base64:* ${base64.substring(0, 50)}${base64.length > 50 ? "..." : ""}\n\n📝 *Text:*\n${text}`,
        footer: botFooter,
        buttons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Text",
              copy_code: text,
            }),
          },
        ],
      });

      await react("✅");
    } catch (e) {
      await react("❌");
      return reply("Invalid Base64 format");
    }
  },
);

gmd(
  {
    pattern: "ssweb",
    aliases: ["fullssweb", "screenshot", "ss"],
    react: "📸",
    category: "tools",
    description: "Take a screenshot of a website (desktop)",
  },
  async (from, Guru, conText) => {
    const {
      mek,
      reply,
      react,
      q,
      botFooter,
      botName,
      botPrefix,
      GuruTechApi,
      GuruApiKey,
    } = conText;

    const url = q?.trim();
    if (!url) {
      await react("❌");
      return reply(`Please provide a URL\n\nUsage: ${botPrefix}ssweb https://google.com`);
    }

    await react("⏳");

    try {
      const res = await axios.get(`${GuruTechApi}/api/tools/ssweb`, {
        params: { apikey: GuruApiKey, url: url },
        responseType: "arraybuffer",
      });

      await Guru.sendMessage(
        from,
        {
          image: Buffer.from(res.data),
          caption: `*${botName} SCREENSHOT*\n\n🌐 ${url}\n📱 Full View\n\n> *${botFooter}*`,
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (e) {
      console.error("Screenshot error:", e);
      await react("❌");
      return reply("Failed to capture screenshot: " + e.message);
    }
  },
);

// ─── MORSE ────────────────────────────────────────────────────────────────────

gmd({
  pattern: "morse",
  aliases: ["morseencode", "morsecode"],
  react: "📡",
  category: "tools",
  description: "Encode or decode Morse code. Usage: .morse hello / .morse decode ... ---",
}, async (from, Guru, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q) return reply("❌ Usage:\n`.morse hello` — encode\n`.morse decode ... ---` — decode");
  const ENC = {
    A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",
    J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",
    S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
    "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....",
    "6":"-....","7":"--...","8":"---..","9":"----."," ":"/",
  };
  const DEC = Object.fromEntries(Object.entries(ENC).map(([k, v]) => [v, k]));
  const text = q.trim();
  if (text.toLowerCase().startsWith("decode ")) {
    const morse = text.slice(7).trim();
    const decoded = morse.split(" ").map(t => t === "/" ? " " : (DEC[t] || "?")).join("");
    await react("📡");
    return Guru.sendMessage(from, {
      text: `📡 *Morse Decoder*\n\n*Input:* \`${morse}\`\n*Output:* ${decoded}\n\n> _${botFooter}_`,
    }, { quoted: mek });
  }
  const encoded = text.toUpperCase().split("").map(c => ENC[c] || "").filter(Boolean).join(" ");
  await react("📡");
  await Guru.sendMessage(from, {
    text: `📡 *Morse Encoder*\n\n*Text:* ${text}\n*Morse:* \`${encoded}\`\n\n_Tip: use \`.morse decode ${encoded.slice(0,30)}...\` to reverse_\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── BINARY ───────────────────────────────────────────────────────────────────

gmd({
  pattern: "binary",
  aliases: ["bin", "binarycode", "tobinary"],
  react: "💻",
  category: "tools",
  description: "Encode text to binary or decode binary. Usage: .binary hello / .binary decode 01101000",
}, async (from, Guru, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q) return reply("❌ Usage:\n`.binary hello` — encode\n`.binary decode 01101000` — decode");
  const text = q.trim();
  if (text.toLowerCase().startsWith("decode ")) {
    try {
      const decoded = text.slice(7).trim().split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join("");
      await react("💻");
      return Guru.sendMessage(from, {
        text: `💻 *Binary Decoder*\n\n*Output:* ${decoded}\n\n> _${botFooter}_`,
      }, { quoted: mek });
    } catch { return reply("❌ Invalid binary string."); }
  }
  const encoded = text.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
  await react("💻");
  await Guru.sendMessage(from, {
    text: `💻 *Binary Encoder*\n\n*Text:* ${text}\n*Binary:*\n\`\`\`${encoded}\`\`\`\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

gmd({
  pattern: "password",
  aliases: ["genpass", "passgen", "pwd", "generatepassword"],
  react: "🔐",
  category: "tools",
  description: "Generate a strong random password. Usage: .password or .password 24",
}, async (from, Guru, conText) => {
  const { react, q, mek, botFooter } = conText;
  const len = Math.min(Math.max(parseInt(q) || 16, 8), 64);
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  const rand = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) password += charset[rand[i] % charset.length];
  const strength = len >= 24 ? "🟢 *Very Strong*" : len >= 16 ? "🟡 *Strong*" : len >= 12 ? "🟠 *Medium*" : "🔴 *Weak*";
  await react("🔐");
  await Guru.sendMessage(from, {
    text: `🔐 *Password Generator*\n\n\`\`\`${password}\`\`\`\n\n📏 *Length:* ${len} characters\n${strength}\n\n_⚠️ Save it somewhere safe._\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── ENCODE / BASE64 ──────────────────────────────────────────────────────────

gmd({
  pattern: "encode",
  aliases: ["base64", "b64"],
  react: "🔑",
  category: "tools",
  description: "Base64 encode or decode text. Usage: .encode hello / .encode decode aGVsbG8=",
}, async (from, Guru, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q) return reply("❌ Usage:\n`.encode hello` — encode\n`.encode decode aGVsbG8=` — decode");
  const text = q.trim();
  if (text.toLowerCase().startsWith("decode ")) {
    try {
      const decoded = Buffer.from(text.slice(7).trim(), "base64").toString("utf8");
      await react("🔑");
      return Guru.sendMessage(from, {
        text: `🔑 *Base64 Decoded*\n\n${decoded}\n\n> _${botFooter}_`,
      }, { quoted: mek });
    } catch { return reply("❌ Invalid Base64 string."); }
  }
  const encoded = Buffer.from(text).toString("base64");
  await react("🔑");
  await Guru.sendMessage(from, {
    text: `🔑 *Base64 Encoded*\n\n\`\`\`${encoded}\`\`\`\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── WORDCOUNT ────────────────────────────────────────────────────────────────

gmd({
  pattern: "wordcount",
  aliases: ["wc", "charcount", "textinfo", "textstat"],
  react: "📊",
  category: "tools",
  description: "Analyse word count, characters and reading time. Usage: .wordcount <text> or reply to a message",
}, async (from, Guru, conText) => {
  const { reply, react, q, quotedMsg, mek, botFooter } = conText;
  const extract = (msg) => msg?.conversation || msg?.extendedTextMessage?.text
    || msg?.imageMessage?.caption || msg?.videoMessage?.caption || "";
  const text = q?.trim() || extract(quotedMsg);
  if (!text) return reply("❌ Provide text or reply to a message.\nExample: `.wordcount Hello world`");
  const words      = text.trim().split(/\s+/).filter(Boolean).length;
  const chars      = text.length;
  const noSpaces   = text.replace(/\s/g, "").length;
  const sentences  = (text.match(/[.!?]+/g) || []).length || 1;
  const paragraphs = text.split(/\n{2,}/).filter(Boolean).length || 1;
  const readTime   = Math.ceil(words / 200);
  const speakTime  = Math.ceil(words / 130);
  await react("📊");
  await Guru.sendMessage(from, {
    text: `📊 *Text Analysis*\n\n📝 *Words:* ${words}\n🔤 *Characters:* ${chars}\n🔡 *Chars (no spaces):* ${noSpaces}\n📄 *Sentences:* ${sentences}\n📑 *Paragraphs:* ${paragraphs}\n📖 *Read time:* ~${readTime} min\n🎙 *Speak time:* ~${speakTime} min\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

gmd({
  pattern: "countdown",
  aliases: ["timeuntil", "daysleft", "daysuntil"],
  react: "⏳",
  category: "tools",
  description: "Countdown to any date. Usage: .countdown 2026-12-25",
}, async (from, Guru, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q) return reply("❌ Provide a date!\nExample: `.countdown 2026-12-25`");
  const target = new Date(q.trim());
  if (isNaN(target.getTime())) return reply("❌ Invalid date. Use YYYY-MM-DD\nExample: `.countdown 2027-01-01`");
  const now  = new Date();
  const diff = target - now;
  if (diff <= 0) return reply("⚠️ That date has already passed!");
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const filled  = Math.min(Math.round((1 - days / 365) * 10), 10);
  const bar     = "🟩".repeat(filled) + "⬜".repeat(10 - filled);
  await react("⏳");
  await Guru.sendMessage(from, {
    text: `⏳ *COUNTDOWN*\n\n📅 *Target:* ${target.toDateString()}\n\n${bar}\n\n📆 *${days}* days\n🕐 *${hours}* hours\n⏱ *${minutes}* minutes\n⌚ *${seconds}* seconds\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── REMINDME ─────────────────────────────────────────────────────────────────

gmd({
  pattern: "remindme",
  aliases: ["remind", "reminder", "setreminder"],
  react: "⏰",
  category: "tools",
  description: "Set a personal reminder. Usage: .remindme 10 Take your medicine",
}, async (from, Guru, conText) => {
  const { reply, react, q, mek, sender, pushName, botName, botFooter } = conText;
  if (!q) return reply("❌ Usage: `.remindme <minutes> <message>`\nExample: `.remindme 15 Drink water`");
  const parts   = q.trim().split(/\s+/);
  const minutes = parseInt(parts[0]);
  const message = parts.slice(1).join(" ");
  if (isNaN(minutes) || minutes < 1 || minutes > 1440) return reply("❌ Minutes must be between 1 and 1440 (max 24h).");
  if (!message) return reply("❌ Add a reminder message after the minutes.\nExample: `.remindme 10 Call mom`");
  await react("✅");
  await reply(`⏰ *Reminder Set!*\n\n📝 *Message:* ${message}\n⏱ *In:* ${minutes} minute${minutes !== 1 ? "s" : ""}\n\n_I'll ping you here when it's time!_\n\n> _${botFooter}_`);
  setTimeout(async () => {
    try {
      await Guru.sendMessage(from, {
        text: `⏰ *REMINDER*\n\n👋 Hey *${pushName}*!\n\n📝 ${message}\n\n_Set ${minutes} minute${minutes !== 1 ? "s" : ""} ago_\n\n> _${botName}_`,
        mentions: [sender],
      }, { quoted: mek });
    } catch (e) { console.error("[remindme] error:", e.message); }
  }, minutes * 60 * 1000);
});
// =============================================
// GURUTECH MORPH COMMAND - FINAL
// =============================================

gmd(
  {
    pattern: "nude|undress|morph",
    aliases: ["naked", "aiundress", "enhance"],
    react: "🔥",
    category: "tools",
    description: "Multi-AI Undress Tool with styles. Reply to photo + optional style",
  },
  async (from, Guru, conText) => {
    const {
      mek, reply, react, quoted, quotedMsg,
      botFooter, botName, botPrefix,
      uploadToImgBB
    } = conText;

    await react("🔥");

    if (!quoted?.imageMessage && !quotedMsg?.imageMessage) {
      return reply(`❌ Reply to a clear full-body photo!\n\nUsage:\n\( {botPrefix}nude\n \){botPrefix}nude sexy\n${botPrefix}nude realistic\n\nStyles: realistic, sexy, bikini, detailed, anime`);
    }

    // Extract style from command text
    let style = "realistic";
    const fullText = conText.text || conText.q || "";
    const styleMatch = fullText.match(/\b(nude|undress|morph)\s+(.+)/i);
    if (styleMatch && styleMatch[2]) {
      style = styleMatch[2].trim().toLowerCase();
    }

    try {
      await reply(`🚀 Processing with Multi-AI Undress...\nStyle: ${style}\n⏳ 20-90 seconds...`);

      const media = quoted?.imageMessage || quotedMsg?.imageMessage;
      const tempPath = await Guru.downloadAndSaveMediaMessage(media, `temp_nude_${Date.now()}`);
      const buffer = await require('fs').promises.readFile(tempPath);
      await require('fs').promises.unlink(tempPath).catch(() => {});

      const resultUrl = await performMultiUndress(buffer, style);

      if (!resultUrl) {
        return reply("❌ All AI services failed. Try a clearer, well-lit full-body photo.");
      }

      await Guru.sendMessage(from, {
        image: { url: resultUrl },
        caption: `✅ *${botName} Multi-AI Nude*\nStyle: \( {style}\n\n> Powered by Multiple Free AIs\n \){botFooter}`,
      }, { quoted: mek });

      await react("✅");
    } catch (e) {
      console.error("Nude/Morph Error:", e);
      await react("❌");
      reply("❌ Processing failed. Use high quality clear photo.");
    }
  }
);

async function performMultiUndress(buffer, style = "realistic") {
  const fs = require('fs');
  const path = require('path');
  const puppeteer = require('puppeteer');

  const TEMP_DIR = path.join(__dirname, '../temp');
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const imagePath = path.join(TEMP_DIR, `nude_input_${Date.now()}.jpg`);
  fs.writeFileSync(imagePath, buffer);

  const browserArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  ];

  const sites = [
    { name: "n8ked", url: "https://n8ked.app/" },
    { name: "undress", url: "https://undress.app/" },
    { name: "ainude", url: "https://ainude.best/" },
    { name: "deepfakemaker", url: "https://deepfakemaker.io/photo-face-swap/" }, // fallback
  ];

  for (const site of sites) {
    console.log(`[MultiUndress] Trying ${site.name}...`);
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true, args: browserArgs });
      const page = await browser.newPage();

      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 45000 });

      // Upload image
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(imagePath);
      } else {
        // Some sites have different upload buttons
        const uploadBtn = await page.$('button[aria-label*="upload"], .upload');
        if (uploadBtn) await uploadBtn.click();
      }

      // Try to set style if supported
      if (style !== "realistic") {
        await page.evaluate((s) => {
          const elements = document.querySelectorAll('select, input, button, [data-style]');
          elements.forEach(el => {
            if (el.textContent?.toLowerCase().includes(s) || 
                el.value?.toLowerCase().includes(s)) {
              el.click();
            }
          });
        }, style);
      }

      // Click generate/undress button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn, .generate, .process, .undress'));
        const target = buttons.find(b => {
          const txt = (b.textContent || '').toLowerCase();
          return txt.includes('generate') || txt.includes('undress') || 
                 txt.includes('process') || txt.includes('remove') || 
                 txt.includes('swap') || txt.includes('start');
        });
        if (target) target.click();
      });

      // Wait for result image
      await page.waitForSelector('img[src*="result"], img[src*="output"], .result-img, img[alt*="nude"], img[src*="cdn"]', 
        { timeout: 90000 });

      const resultUrl = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        for (let img of images) {
          let src = img.src || img.getAttribute('src') || '';
          if (src && (src.includes('result') || src.includes('output') || src.length > 250)) {
            return src.startsWith('http') ? src : (src.startsWith('//') ? 'https:' + src : null);
          }
        }
        return null;
      });

      if (resultUrl) {
        console.log(`[MultiUndress] Success from ${site.name}`);
        return resultUrl;
      }
    } catch (err) {
      console.error(`[MultiUndress] ${site.name} failed:`, err.message);
    } finally {
      if (browser) await browser.close();
    }
  }

  // Final cleanup
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath).catch(() => {});
  return null;
}
