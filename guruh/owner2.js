
const { gmd, commands, getSetting } = require("../guru");
const fs = require("fs").promises;
const fsA = require("node:fs");
const { S_WHATSAPP_NET } = require("@whiskeysockets/baileys");
const path = require("path");
const moment = require("moment-timezone");
const {
  groupCache,
  getGroupMetadata,
  cachedGroupMetadata,
} = require("../guru/connection/groupCache");

const { exec: _shellExec } = require("child_process");

gmd(
  {
    pattern: "$",
    on: "body",
    react: "🖥️",
    category: "owner",
    dontAddCommandList: true,
    description: "Run a shell command. Usage: $ <command>",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, body } = conText;
    if (!body.startsWith("$")) return;
    if (!isSuperUser) return;

    const shellCmd = body.slice(1).trim();
    if (!shellCmd) return reply("Usage: $ <command>");

    await react("⏳");
    _shellExec(shellCmd, { timeout: 30000, maxBuffer: 1024 * 1024 * 5 }, async (err, stdout, stderr) => {
      const output = (stdout || "") + (stderr ? `\n[stderr]\n${stderr}` : "");
      const result = err && !output.trim()
        ? `❌ Error: ${err.message}`
        : output.trim() || "(no output)";
      await react("✅");
      await reply("```\n" + result.slice(0, 4000) + "\n```");
    });
  }
);

gmd(
  {
    pattern: ">",
    on: "body",
    react: "⚡",
    category: "owner",
    dontAddCommandList: true,
    description: "Evaluate a JavaScript expression. Usage: > <code>",
  },
  async (from, Guru, conText) => {
    const { mek, reply, react, isSuperUser, body } = conText;
    if (!body.startsWith(">")) return;
    if (!isSuperUser) return reply("❌ Owner only");

    const code = body.slice(1).trim();
    if (!code) return reply("Usage: > <js expression>");

    await react("⏳");
    try {
      const gift = require("../guru");
      const _rawDb = require("../guru/database/database").DATABASE;
      const settings = await gift.getAllSettings();
      const { getSetting, setSetting, getAllSettings, commands } = gift;
      const prefix = settings.PREFIX;
      const botPrefix = settings.PREFIX;
      const db = new Proxy({ raw: _rawDb }, {
        get(target, key) {
          if (key === 'raw') return _rawDb;
          if (key === 'toJSON') return () => settings;
          if (key === 'toString') return () => JSON.stringify(settings, null, 2);
          const upper = String(key).toUpperCase();
          if (upper in settings) return settings[upper];
          return target[key];
        }
      });
      const bot = Guru;
      const m = mek;
      const {
        sender, isGroup, groupInfo, groupName, participants,
        isSuperAdmin, isAdmin, isBotAdmin, superUser,
        botName, ownerNumber, ownerName,
        q, args, quotedMsg, quotedUser, quotedKey,
        pushName, tagged, mentionedJid, repliedMessage,
        botFooter, botCaption, botVersion, botPic,
        timeZone, newsletterJid, newsletterUrl,
        groupAdmins, isSuperUser, authorMessage,
      } = conText;

      let result;
      try {
        result = await eval(`(async () => { return (${code}) })()`);
      } catch (e1) {
        result = await eval(`(async () => { ${code} })()`);
      }
      if (result === undefined) result = "(undefined)";
      let output;
      if (typeof result === "object" && result !== null) {
        try {
          output = JSON.stringify(result, null, 2);
        } catch (_) {
          output = String(result);
        }
      } else {
        output = String(result);
      }
      await react("✅");
      await reply("```\n" + output.slice(0, 4000) + "\n```");
    } catch (err) {
      await react("❌");
      await reply(`❌ Error: ${err.message}`);
    }
  }
);

gmd(
  {
    pattern: "restartbot",
    aliases: ["reboot", "restart", "botrestart"],
    react: "🔄",
    category: "owner",
    description: "Restart the bot. Add 'update' to pull latest code first. Usage: .restartbot | .restartbot update",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, args } = conText;
    if (!isSuperUser) return reply("❌ Owner/Sudo only.");

    const doUpdate = args.join(" ").toLowerCase().includes("update");

    if (doUpdate) {
      await react("🔄");
      await reply("🔄 *Checking for updates before restart...*");

      try {
        const { runUpdate } = require("../guru/autoUpdater");
        const { getSetting } = require("../guru/database/settings");

        const rawRepo = await getSetting("BOT_REPO");
        const match = String(rawRepo || "").match(/github\.com\/([^/\s]+\/[^/\s]+)/);
        const repo = match ? match[1].replace(/\.git$/, "").replace(/\/*$/, "") : (rawRepo || "GuruhTech/ULTRA-GURU");

        const updated = await runUpdate(repo, Guru, null);
        if (updated) {
          await react("✅");
          await reply("✅ *Update applied! Restarting now...*");
        } else {
          await react("✅");
          await reply("✅ *Already up to date. Restarting anyway...*");
        }
      } catch (err) {
        await react("⚠️");
        await reply(`⚠️ Update check failed: ${err.message}\n\n_Restarting without update..._`);
      }

      setTimeout(() => process.exit(0), 3000);
    } else {
      await react("🔄");
      await reply(
        "🔄 *Bot is restarting...*\n\n" +
        "_It will be back online in a few seconds._\n\n" +
        "💡 Tip: use *.restartbot update* to pull latest code before restarting."
      );
      setTimeout(() => process.exit(0), 2000);
    }
  }
);

gmd(
  {
    pattern: "viewscript",
    aliases: ["readscript", "catfile", "script"],
    react: "📄",
    category: "owner",
    description: "View contents of any bot script file. Usage: .viewscript guruh/owner2.js or .viewscript guru/config.js",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, args } = conText;
    if (!isSuperUser) return reply("❌ Owner only.");

    const target = args.join(" ").trim();
    if (!target) {
      return reply(
        "📄 *Script Viewer*\n\n" +
        "Usage: `.viewscript <file>`\n\n" +
        "*Examples:*\n" +
        "• `.viewscript guru/config.js`\n" +
        "• `.viewscript guruh/owner2.js`\n" +
        "• `.viewscript index.js`\n" +
        "• `.viewscript package.json`\n\n" +
        "*Quick list:*\n" +
        "• `.viewscript list` — show all script files"
      );
    }

    const rootDir = path.resolve(__dirname, "..");

    // List mode
    if (target === "list" || target === "ls") {
      _shellExec(
        `find "${rootDir}" -maxdepth 2 -name "*.js" -not -path "*/node_modules/*" | sed 's|${rootDir}/||' | sort`,
        { timeout: 10000 },
        async (err, stdout) => {
          const files = (stdout || "").trim();
          await react("📋");
          await reply(`📋 *Available script files:*\n\`\`\`\n${files.slice(0, 3500)}\n\`\`\``);
        }
      );
      return;
    }

    // Sanitize path — no traversal outside root
    const filePath = path.resolve(rootDir, target);
    if (!filePath.startsWith(rootDir)) {
      await react("❌");
      return reply("❌ Access denied — path is outside the bot directory.");
    }

    fsA.readFile(filePath, "utf8", async (err, data) => {
      if (err) {
        await react("❌");
        if (err.code === "ENOENT") return reply(`❌ File not found: \`${target}\`\n\nTip: use \`.viewscript list\` to see available files.`);
        return reply(`❌ Error reading file: ${err.message}`);
      }

      const lines = data.split("\n");
      const totalLines = lines.length;
      const MAX_CHARS = 3800;

      let content = data;
      let truncated = false;
      if (content.length > MAX_CHARS) {
        content = content.slice(0, MAX_CHARS);
        truncated = true;
      }

      await react("✅");
      await reply(
        `📄 *${target}*  (${totalLines} lines)\n` +
        (truncated ? `⚠️ _Showing first ~${MAX_CHARS} chars — file truncated_\n` : "") +
        `\`\`\`\n${content}\n\`\`\``
      );
    });
  }
);

gmd(
  {
    pattern: "editscript",
    aliases: ["patchscript", "editfile"],
    react: "✏️",
    category: "owner",
    description: "Find & replace text in a bot script file. Usage: .editscript <file>|<find>|<replace>",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, args } = conText;
    if (!isSuperUser) return reply("❌ Sudo/Owner only.");

    const raw = args.join(" ").trim();

    if (!raw || !raw.includes("|")) {
      return reply(
        "✏️ *Script Editor*\n\n" +
        "Usage: `.editscript <file>|<find>|<replace>`\n\n" +
        "*Examples:*\n" +
        "• `.editscript guru/config.js|BOT_NAME = 'OLD'|BOT_NAME = 'NEW'`\n" +
        "• `.editscript guruh/owner2.js|console.log('debug')|`  _(blank replace = delete line)_\n\n" +
        "⚠️ _Case-sensitive. First match only. Always backup before editing._"
      );
    }

    const parts = raw.split("|");
    if (parts.length < 3) {
      return reply("❌ Need exactly 3 parts separated by `|`:\n`<file>|<find text>|<replace text>`");
    }

    const [target, findText, replaceText = ""] = parts;
    const rootDir = path.resolve(__dirname, "..");
    const filePath = path.resolve(rootDir, target.trim());

    if (!filePath.startsWith(rootDir)) {
      await react("❌");
      return reply("❌ Access denied — path is outside the bot directory.");
    }

    fsA.readFile(filePath, "utf8", async (readErr, original) => {
      if (readErr) {
        await react("❌");
        if (readErr.code === "ENOENT") return reply(`❌ File not found: \`${target.trim()}\`\n\nUse \`.viewscript list\` to see available files.`);
        return reply(`❌ Read error: ${readErr.message}`);
      }

      if (!original.includes(findText)) {
        await react("❌");
        return reply(`❌ Text not found in \`${target.trim()}\`:\n\`\`\`\n${findText.slice(0, 300)}\n\`\`\``);
      }

      // Make backup
      const backupPath = filePath + ".bak";
      fsA.writeFileSync(backupPath, original, "utf8");

      // Apply replacement (first occurrence)
      const updated = original.replace(findText, replaceText);

      fsA.writeFile(filePath, updated, "utf8", async (writeErr) => {
        if (writeErr) {
          await react("❌");
          return reply(`❌ Write error: ${writeErr.message}`);
        }

        const oldSnip = findText.slice(0, 200);
        const newSnip = replaceText.slice(0, 200) || "_(deleted)_";

        await react("✅");
        await reply(
          `✅ *File updated:* \`${target.trim()}\`\n\n` +
          `🔴 *Removed:*\n\`\`\`\n${oldSnip}\n\`\`\`\n` +
          `🟢 *Replaced with:*\n\`\`\`\n${newSnip}\n\`\`\`\n\n` +
          `💾 Backup saved as \`${path.basename(backupPath)}\`\n` +
          `⚡ Restart the bot to apply changes if needed.`
        );
      });
    });
  }
);

gmd(
  {
    pattern: "pushgit",
    aliases: ["gitpush", "gitsync"],
    react: "🚀",
    category: "owner",
    description: "Stage, commit and push all bot changes to GitHub. Usage: .pushgit [commit message]",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser, args } = conText;
    if (!isSuperUser) return reply("❌ Owner only.");

    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    if (!token) {
      await react("❌");
      return reply(
        "❌ *GITHUB_PERSONAL_ACCESS_TOKEN* is not set.\n\n" +
        "Add it as a Replit Secret and restart the bot."
      );
    }

    const commitMsg = args.join(" ").trim() || `bot: auto-push ${new Date().toISOString()}`;
    const remoteUrl = `https://x-access-token:${token}@github.com/GuruhTech/ULTRA-GURU`;

    await react("⏳");
    await reply("⏳ Staging and pushing to GitHub...");

    _shellExec(
      `git add -A && git diff --cached --quiet || git -c user.email="bot@ultraguru.md" -c user.name="Ultra Guru MD" commit -m "${commitMsg.replace(/"/g, "'")}" && git push "${remoteUrl}" main 2>&1`,
      { timeout: 60000, maxBuffer: 1024 * 1024 * 2 },
      async (err, stdout, stderr) => {
        const output = (stdout || "").trim();

        if (err && !output) {
          await react("❌");
          return reply(`❌ Push failed:\n\`\`\`\n${(stderr || err.message).slice(0, 1500)}\n\`\`\``);
        }

        // Grab the latest commit hash to confirm
        _shellExec("git log --oneline -3", {}, async (_, log) => {
          await react("✅");
          await reply(
            `✅ *Successfully pushed to GitHub!*\n\n` +
            `📝 Commit: _${commitMsg}_\n\n` +
            `📌 *Latest commits:*\n\`\`\`\n${(log || "").trim()}\n\`\`\`\n\n` +
            `🔗 https://github.com/GuruhTech/ULTRA-GURU`
          );
        });
      }
    );
  }
);
