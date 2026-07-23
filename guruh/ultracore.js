/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          U L T R A   C O R E   —   A D V A N C E D          ║
 * ║   Robotic Intelligence · Surveillance · Group Warfare        ║
 * ║   Network Tools · Auto-Operations · AI Brain · Mass Control  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { gmd } = require("../guru");
const axios = require("axios");
const crypto = require("crypto");
const os = require("os");

// ══════════════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ══════════════════════════════════════════════════════════════════

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fmt = (n) => String(n).padStart(2, "0");

const uptime = () => {
  const s = Math.floor(process.uptime());
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${fmt(h)}h ${fmt(m)}m ${fmt(sec)}s`;
};

const memUsage = () => {
  const m = process.memoryUsage();
  const mb = (b) => (b / 1024 / 1024).toFixed(1) + " MB";
  return { heap: mb(m.heapUsed), rss: mb(m.rss), ext: mb(m.external) };
};

const sysInfo = () => {
  const cpu = os.cpus()[0];
  const freeMem = (os.freemem() / 1024 / 1024).toFixed(1);
  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(1);
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpuModel: cpu?.model || "Unknown",
    cpus: os.cpus().length,
    freeMem,
    totalMem,
    hostname: os.hostname(),
    nodeVersion: process.version,
  };
};

const hashText = (text, algo) => crypto.createHash(algo).update(text).digest("hex");

// Active timers/intervals store (in-memory, cleared on restart)
const activeTimers = new Map();
const spamGuard = new Map();   // jid -> { count, ts }
const groupLockdown = new Set(); // group jids in lockdown
const userSilence = new Map();  // jid -> expiry timestamp
const broadcastLog = [];

// ══════════════════════════════════════════════════════════════════
//  1. SYSTEM DASHBOARD — real-time bot diagnostics
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "sysboard",
    aliases: ["dashboard", "sysinfo", "botdash", "cpuinfo"],
    react: "🖥️",
    category: "ultracore",
    description: "Real-time bot system diagnostics dashboard",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, botName, botFooter } = conText;
    await react("⚙️");

    const mem  = memUsage();
    const sys  = sysInfo();
    const up   = uptime();
    const load = os.loadavg().map((l) => l.toFixed(2)).join(" | ");
    const cmds = require("../guru").commands?.length || 0;
    const ping = Date.now();

    const dash =
`╔══════[ 🤖 *ULTRA SYSTEM BOARD* ]══════╗

🖥️ *PROCESS*
   ⏱ Uptime     : ${up}
   🧠 Heap Used  : ${mem.heap}
   📦 RSS Memory : ${mem.rss}
   🔗 External   : ${mem.ext}

⚙️ *HARDWARE*
   🏗 Platform   : ${sys.platform} (${sys.arch})
   🔧 CPU Model  : ${sys.cpuModel}
   🔩 CPU Cores  : ${sys.cpus}
   💾 Free RAM   : ${sys.freeMem} / ${sys.totalMem} MB
   📡 Hostname   : ${sys.hostname}

📊 *RUNTIME*
   🟢 Node.js    : ${sys.nodeVersion}
   ⚡ Load Avg   : ${load}
   🔌 Commands   : ${cmds} loaded
   🏓 Ping       : ${Date.now() - ping}ms

╚══════[ ✨ _${botFooter}_ ]══════╝`;

    await react("✅");
    await Guru.sendMessage(from, { text: dash }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  2. NETWORK SCANNER — IP/domain intelligence
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "iplookup",
    aliases: ["ipinfo", "ipcheck", "geoip", "whoisip"],
    react: "🌍",
    category: "ultracore",
    description: "Detailed geo-intelligence on any IP address or domain",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react, botFooter } = conText;
    if (!q) return reply("❌ Usage: .iplookup <ip/domain>");
    await react("🔍");

    try {
      const res = await axios.get(`http://ip-api.com/json/${q.trim()}?fields=66846719`, { timeout: 8000 });
      const d = res.data;
      if (d.status === "fail") return reply(`❌ Lookup failed: ${d.message}`);

      const text =
`🌍 *IP INTELLIGENCE REPORT*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🔎 *Query*      : ${d.query}
🏳️ *Country*   : ${d.country} (${d.countryCode})
🗺 *Region*    : ${d.regionName} — ${d.city}
📮 *ZIP*       : ${d.zip || "N/A"}
📍 *Coords*    : ${d.lat}, ${d.lon}
🕰 *Timezone*  : ${d.timezone}
🌐 *ISP*       : ${d.isp}
🏢 *Org*       : ${d.org}
🔗 *AS*        : ${d.as}
📡 *ASName*    : ${d.asname}
📶 *Mobile*    : ${d.mobile ? "Yes" : "No"}
🛡 *Proxy/VPN*: ${d.proxy ? "⚠️ YES" : "✅ No"}
🤖 *Hosting*   : ${d.hosting ? "⚠️ YES" : "✅ No"}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
> _${botFooter}_`;

      await react("✅");
      await Guru.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Network error: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  3. DNS RESOLVER — live DNS record lookup
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "dnslookup",
    aliases: ["dns", "dnscheck", "nslookup"],
    react: "📡",
    category: "ultracore",
    description: "Resolve DNS records for any domain",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    if (!q) return reply("❌ Usage: .dnslookup <domain>");
    await react("🔍");

    try {
      const domain = q.trim().replace(/^https?:\/\//, "").split("/")[0];
      const [a, aaaa, mx, ns, txt] = await Promise.allSettled([
        axios.get(`https://dns.google/resolve?name=${domain}&type=A`),
        axios.get(`https://dns.google/resolve?name=${domain}&type=AAAA`),
        axios.get(`https://dns.google/resolve?name=${domain}&type=MX`),
        axios.get(`https://dns.google/resolve?name=${domain}&type=NS`),
        axios.get(`https://dns.google/resolve?name=${domain}&type=TXT`),
      ]);

      const fmt2 = (r, field = "data") =>
        r.status === "fulfilled" && r.value.data.Answer
          ? r.value.data.Answer.map((x) => x[field]).join(", ")
          : "None";

      const text =
`📡 *DNS INTELLIGENCE — ${domain}*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🔹 *A (IPv4)*  : ${fmt2(a)}
🔹 *AAAA (v6)* : ${fmt2(aaaa)}
📧 *MX*        : ${fmt2(mx)}
🌐 *NS*        : ${fmt2(ns)}
📝 *TXT*       : ${fmt2(txt)}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

      await react("✅");
      await Guru.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ DNS error: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  4. HASH ENGINE — multi-algorithm cryptographic hashing
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "hash",
    aliases: ["hashtext", "encrypt", "checksum"],
    react: "🔐",
    category: "ultracore",
    description: "Generate cryptographic hashes — MD5, SHA1, SHA256, SHA512",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    if (!q) return reply("❌ Usage: .hash <text>");
    await react("⚙️");

    const t = q.trim();
    const text =
`🔐 *CRYPTO HASH ENGINE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
📝 *Input* : ${t.length > 50 ? t.slice(0, 50) + "…" : t}

🔑 *MD5*     : ${hashText(t, "md5")}
🔑 *SHA-1*   : ${hashText(t, "sha1")}
🔑 *SHA-256* :
\`${hashText(t, "sha256")}\`
🔑 *SHA-512* :
\`${hashText(t, "sha512")}\`
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

    await react("✅");
    await Guru.sendMessage(from, { text }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  5. PASSWORD VAULT — ultra-strong password generator
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "genpass",
    aliases: ["passgen", "password", "generatepassword", "strongpass"],
    react: "🔑",
    category: "ultracore",
    description: "Generate ultra-strong random passwords",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    await react("⚙️");

    const len = parseInt(q?.trim()) || 20;
    if (len < 6 || len > 128) return reply("❌ Length must be 6–128");

    const sets = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      digits: "0123456789",
      symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
    };
    const all = Object.values(sets).join("");

    const gen = (charset, n) =>
      Array.from({ length: n }, () => charset[crypto.randomInt(charset.length)]).join("");

    const pass1 = gen(all, len);
    const pass2 = gen(all, len);
    const pass3 = gen(sets.lower + sets.digits + "-_.", Math.floor(len * 0.8));
    const pin   = gen(sets.digits, 6);
    const pin12 = gen(sets.digits, 12);

    const strength = (p) => {
      let s = 0;
      if (/[A-Z]/.test(p)) s++;
      if (/[a-z]/.test(p)) s++;
      if (/[0-9]/.test(p)) s++;
      if (/[^A-Za-z0-9]/.test(p)) s++;
      return ["Weak", "Fair", "Good", "Strong", "Ultra"][s];
    };

    const text =
`🔑 *PASSWORD GENERATOR*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🛡 *Ultra-Strong (${len} chars)*
\`${pass1}\`
Strength: ${strength(pass1)} ⚡

🔐 *Ultra-Strong #2*
\`${pass2}\`
Strength: ${strength(pass2)} ⚡

🌐 *URL-Safe Pass*
\`${pass3}\`

🔢 *6-digit PIN*  : \`${pin}\`
🔢 *12-digit PIN* : \`${pin12}\`
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
> ⚠️ _Store safely. Never share._`;

    await react("✅");
    await Guru.sendMessage(from, { text }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  6. SPAM DETECTOR — real-time message flood analysis
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "spamcheck",
    aliases: ["floodcheck", "spamstat", "ratelimit"],
    react: "🚨",
    category: "ultracore",
    description: "Check spam/flood status of a user or the current group",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, sender, pushName, isGroup } = conText;
    await react("🔍");

    const now = Date.now();
    const key = sender;
    const record = spamGuard.get(key) || { count: 0, ts: now, history: [] };

    record.history = (record.history || []).filter((t) => now - t < 60000);
    record.history.push(now);
    record.count = record.history.length;
    spamGuard.set(key, record);

    const rate = record.count;
    const risk = rate < 3 ? "✅ Clean" : rate < 8 ? "⚠️ Moderate" : "🚨 HIGH RISK";
    const bar  = "█".repeat(Math.min(rate, 20)) + "░".repeat(Math.max(0, 20 - rate));

    const text =
`🚨 *SPAM ANALYSIS REPORT*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
👤 *User*      : ${pushName}
🔢 *JID*       : ${sender}
📊 *Rate/min*  : ${rate} messages
📉 *Risk Level*: ${risk}

📈 *Activity Bar*
[${bar}]

🕐 *Window*    : Last 60 seconds
🧮 *Total seen*: ${record.count} events
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

    await react("✅");
    await Guru.sendMessage(from, { text }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  7. GROUP LOCKDOWN — instant freeze all non-admins
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "lockdown",
    aliases: ["freeze", "groupfreeze", "grplockdown"],
    react: "🔒",
    category: "ultracore",
    description: "Instantly freeze group — only admins can send messages",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isAdmin, isSuperAdmin, isBotAdmin, botName } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admins only!");

    await react("🔒");
    groupLockdown.add(from);

    try {
      await Guru.groupSettingUpdate(from, "announcement");
      await Guru.sendMessage(from, {
        text:
`🔒 *GROUP LOCKDOWN ACTIVATED*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
⚠️ This group has been locked down by *${botName}*.
Only admins may send messages.

🛡 Reason   : Security Protocol
⏰ Status   : 🔴 LOCKED
📡 Mode     : Admins Only
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
> Use *.unlockdown* to restore access.`
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      await react("❌");
      reply("❌ Lockdown failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  8. UNLOCKDOWN
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "unlockdown",
    aliases: ["unfreeze", "groupunfreeze", "grpunlock"],
    react: "🔓",
    category: "ultracore",
    description: "Lift lockdown — restore all members' send access",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isAdmin, isSuperAdmin, isBotAdmin, botName } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admins only!");

    await react("🔓");
    groupLockdown.delete(from);

    try {
      await Guru.groupSettingUpdate(from, "not_announcement");
      await Guru.sendMessage(from, {
        text:
`🔓 *LOCKDOWN LIFTED*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
✅ Group access has been restored by *${botName}*.
All members can send messages again.

📡 Mode    : Open
⏰ Status  : 🟢 UNLOCKED
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`
      }, { quoted: mek });
      await react("✅");
    } catch (e) {
      await react("❌");
      reply("❌ Unlock failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  9. SILENCE USER — mute a specific member for X minutes
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "silence",
    aliases: ["mutemember", "tempban", "quietuser"],
    react: "🔇",
    category: "ultracore",
    description: "Silently remove a tagged user for N minutes then readd",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isAdmin, isSuperAdmin, isBotAdmin,
            mentionedJid, args, botName, sender } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admins only!");

    const target = mentionedJid?.[0];
    const minutes = parseInt(args?.[1]) || 5;
    if (!target) return reply("❌ Tag a user: .silence @user 5");
    if (minutes < 1 || minutes > 1440) return reply("❌ Minutes must be 1–1440");

    await react("🔇");
    const expiry = Date.now() + minutes * 60 * 1000;
    userSilence.set(target, expiry);

    try {
      await Guru.groupParticipantsUpdate(from, [target], "remove");
      const num = target.replace("@s.whatsapp.net", "");

      await Guru.sendMessage(from, {
        text:
`🔇 *USER SILENCED*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
👤 Target  : @${num}
⏱ Duration: ${minutes} minute(s)
🤖 Action  : Removed temporarily
📡 Bot     : ${botName}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
> Will attempt re-add after timeout.`,
        mentions: [target],
      }, { quoted: mek });

      // Schedule re-add
      setTimeout(async () => {
        try {
          userSilence.delete(target);
          await Guru.groupParticipantsUpdate(from, [target], "add");
          await Guru.sendMessage(from, {
            text: `✅ @${num} silence expired — re-added to group.`,
            mentions: [target],
          });
        } catch (_) {}
      }, minutes * 60 * 1000);

      await react("✅");
    } catch (e) {
      await react("❌");
      reply("❌ Silence failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  10. MASS PROMOTE — promote all members to admin
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "masspromote",
    aliases: ["promoteall", "adminall", "allmakeadmin"],
    react: "👑",
    category: "ultracore",
    description: "Promote ALL group members to admin (Owner only)",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isSuperAdmin, isBotAdmin, isSuperUser, botName } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isSuperAdmin && !isSuperUser) return reply("❌ Super admin / Owner only!");

    await react("⏳");

    try {
      const meta = await Guru.groupMetadata(from);
      const members = meta.participants.filter((p) => !p.admin).map((p) => p.id);

      if (!members.length) return reply("✅ All members are already admins!");

      let done = 0;
      for (const jid of members) {
        try {
          await Guru.groupParticipantsUpdate(from, [jid], "promote");
          done++;
          await sleep(400);
        } catch (_) {}
      }

      await react("✅");
      await Guru.sendMessage(from, {
        text:
`👑 *MASS PROMOTE COMPLETE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🤖 Bot     : ${botName}
✅ Promoted : ${done} members
📊 Total   : ${meta.participants.length}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`,
      }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Mass promote failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  11. MASS DEMOTE — strip all admins at once
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "massdemote",
    aliases: ["demoteall", "stripall", "removeadmins"],
    react: "🔽",
    category: "ultracore",
    description: "Demote ALL admins to members (Owner/SuperAdmin only)",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isSuperAdmin, isBotAdmin, isSuperUser, botName, sender } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isSuperAdmin && !isSuperUser) return reply("❌ Super admin / Owner only!");

    await react("⏳");

    try {
      const meta = await Guru.groupMetadata(from);
      const botJid = Guru.user?.id?.replace(/:.*@/, "@") || "";
      const admins = meta.participants
        .filter((p) => p.admin === "admin" && p.id !== sender && p.id !== botJid)
        .map((p) => p.id);

      if (!admins.length) return reply("✅ No admins to demote (excluding you and bot).");

      let done = 0;
      for (const jid of admins) {
        try {
          await Guru.groupParticipantsUpdate(from, [jid], "demote");
          done++;
          await sleep(400);
        } catch (_) {}
      }

      await react("✅");
      await Guru.sendMessage(from, {
        text:
`🔽 *MASS DEMOTE COMPLETE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🤖 Bot    : ${botName}
✅ Demoted: ${done} admins
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`,
      }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Mass demote failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  12. NUKE — kick ALL non-admin members
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "nuke",
    aliases: ["kickall", "massremove", "clearsquad"],
    react: "💣",
    category: "ultracore",
    description: "Remove ALL non-admin members from group (Owner only)",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isSuperAdmin, isBotAdmin, isSuperUser, botName } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isSuperAdmin && !isSuperUser) return reply("❌ Owner / Super admin only!");

    await react("💣");

    await Guru.sendMessage(from, {
      text: "☢️ *NUKE INITIATED — Removing all non-admin members...*",
    }, { quoted: mek });

    try {
      const meta = await Guru.groupMetadata(from);
      const targets = meta.participants.filter((p) => !p.admin).map((p) => p.id);

      let done = 0;
      for (const jid of targets) {
        try {
          await Guru.groupParticipantsUpdate(from, [jid], "remove");
          done++;
          await sleep(300);
        } catch (_) {}
      }

      await react("✅");
      await Guru.sendMessage(from, {
        text:
`💣 *NUKE COMPLETE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🤖 Bot      : ${botName}
💥 Removed  : ${done} members
👥 Remaining: ${meta.participants.length - done}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`,
      }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Nuke failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  13. AUTO-PING — scheduled keep-alive message to a chat
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "autopingstart",
    aliases: ["startping", "schedping", "keepalive"],
    react: "📡",
    category: "ultracore",
    description: "Start sending an auto-ping message every N minutes",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react, isSuperUser, botName } = conText;
    if (!isSuperUser) return reply("❌ Owner only!");

    const minutes = parseInt(q?.trim()) || 10;
    if (minutes < 1 || minutes > 60) return reply("❌ Interval: 1–60 minutes");

    if (activeTimers.has(`ping_${from}`)) {
      clearInterval(activeTimers.get(`ping_${from}`));
    }

    let count = 0;
    const id = setInterval(async () => {
      count++;
      try {
        await Guru.sendMessage(from, {
          text: `📡 *AUTO-PING #${count}* — ${botName} is alive ✅\n⏱ Interval: ${minutes}min | 🕐 ${new Date().toLocaleTimeString()}`,
        });
      } catch (_) {
        clearInterval(id);
        activeTimers.delete(`ping_${from}`);
      }
    }, minutes * 60 * 1000);

    activeTimers.set(`ping_${from}`, id);
    await react("✅");
    reply(`📡 Auto-ping started every *${minutes} minutes*. Use *.autopingstop* to cancel.`);
  }
);

gmd(
  {
    pattern: "autopingstop",
    aliases: ["stopping", "cancelpinger"],
    react: "🛑",
    category: "ultracore",
    description: "Stop the auto-ping for this chat",
  },
  async (from, Guru, conText) => {
    const { reply, react, isSuperUser } = conText;
    if (!isSuperUser) return reply("❌ Owner only!");

    const key = `ping_${from}`;
    if (!activeTimers.has(key)) return reply("⚠️ No active ping for this chat.");
    clearInterval(activeTimers.get(key));
    activeTimers.delete(key);
    await react("🛑");
    reply("🛑 Auto-ping stopped.");
  }
);

// ══════════════════════════════════════════════════════════════════
//  14. PHONE NUMBER INTELLIGENCE
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "numinfo",
    aliases: ["phoneinfo", "numberlookup", "numcheck"],
    react: "📱",
    category: "ultracore",
    description: "Decode carrier + country from any phone number",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    if (!q) return reply("❌ Usage: .numinfo <+2547xxxxxxxx>");
    await react("🔍");

    const raw = q.trim().replace(/\s/g, "");
    const num = raw.replace(/[^0-9]/g, "");

    // Country code mapping (top 60 countries)
    const ccMap = {
      "1": "🇺🇸 USA/Canada", "7": "🇷🇺 Russia/Kazakhstan", "20": "🇪🇬 Egypt",
      "27": "🇿🇦 South Africa", "30": "🇬🇷 Greece", "31": "🇳🇱 Netherlands",
      "32": "🇧🇪 Belgium", "33": "🇫🇷 France", "34": "🇪🇸 Spain",
      "36": "🇭🇺 Hungary", "39": "🇮🇹 Italy", "40": "🇷🇴 Romania",
      "41": "🇨🇭 Switzerland", "43": "🇦🇹 Austria", "44": "🇬🇧 UK",
      "45": "🇩🇰 Denmark", "46": "🇸🇪 Sweden", "47": "🇳🇴 Norway",
      "48": "🇵🇱 Poland", "49": "🇩🇪 Germany", "51": "🇵🇪 Peru",
      "52": "🇲🇽 Mexico", "54": "🇦🇷 Argentina", "55": "🇧🇷 Brazil",
      "56": "🇨🇱 Chile", "57": "🇨🇴 Colombia", "58": "🇻🇪 Venezuela",
      "60": "🇲🇾 Malaysia", "61": "🇦🇺 Australia", "62": "🇮🇩 Indonesia",
      "63": "🇵🇭 Philippines", "64": "🇳🇿 New Zealand", "65": "🇸🇬 Singapore",
      "66": "🇹🇭 Thailand", "81": "🇯🇵 Japan", "82": "🇰🇷 South Korea",
      "84": "🇻🇳 Vietnam", "86": "🇨🇳 China", "90": "🇹🇷 Turkey",
      "91": "🇮🇳 India", "92": "🇵🇰 Pakistan", "93": "🇦🇫 Afghanistan",
      "94": "🇱🇰 Sri Lanka", "95": "🇲🇲 Myanmar", "98": "🇮🇷 Iran",
      "212": "🇲🇦 Morocco", "213": "🇩🇿 Algeria", "216": "🇹🇳 Tunisia",
      "218": "🇱🇾 Libya", "220": "🇬🇲 Gambia", "221": "🇸🇳 Senegal",
      "223": "🇲🇱 Mali", "224": "🇬🇳 Guinea", "225": "🇨🇮 Ivory Coast",
      "226": "🇧🇫 Burkina Faso", "227": "🇳🇪 Niger", "228": "🇹🇬 Togo",
      "229": "🇧🇯 Benin", "230": "🇲🇺 Mauritius", "231": "🇱🇷 Liberia",
      "232": "🇸🇱 Sierra Leone", "233": "🇬🇭 Ghana", "234": "🇳🇬 Nigeria",
      "235": "🇹🇩 Chad", "236": "🇨🇫 Central African Republic",
      "237": "🇨🇲 Cameroon", "238": "🇨🇻 Cape Verde", "239": "🇸🇹 São Tomé",
      "240": "🇬🇶 Equatorial Guinea", "241": "🇬🇦 Gabon",
      "242": "🇨🇬 Congo", "243": "🇨🇩 DR Congo",
      "244": "🇦🇴 Angola", "245": "🇬🇼 Guinea-Bissau",
      "246": "🇮🇴 British Indian Ocean", "247": "🇦🇨 Ascension Island",
      "248": "🇸🇨 Seychelles", "249": "🇸🇩 Sudan", "250": "🇷🇼 Rwanda",
      "251": "🇪🇹 Ethiopia", "252": "🇸🇴 Somalia", "253": "🇩🇯 Djibouti",
      "254": "🇰🇪 Kenya", "255": "🇹🇿 Tanzania", "256": "🇺🇬 Uganda",
      "257": "🇧🇮 Burundi", "258": "🇲🇿 Mozambique", "260": "🇿🇲 Zambia",
      "261": "🇲🇬 Madagascar", "262": "🇷🇪 Réunion", "263": "🇿🇼 Zimbabwe",
      "264": "🇳🇦 Namibia", "265": "🇲🇼 Malawi", "266": "🇱🇸 Lesotho",
      "267": "🇧🇼 Botswana", "268": "🇸🇿 Eswatini", "269": "🇰🇲 Comoros",
    };

    // Find matching country code (3 → 2 → 1 digit)
    let country = "🌍 Unknown";
    for (const cc of [3, 2, 1]) {
      const prefix = num.slice(0, cc);
      if (ccMap[prefix]) { country = ccMap[prefix]; break; }
    }

    const isRegistered = await Guru.onWhatsApp(num + "@s.whatsapp.net")
      .then((r) => r?.[0]?.exists ? "✅ Yes" : "❌ No")
      .catch(() => "⚠️ Check failed");

    const text =
`📱 *NUMBER INTELLIGENCE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🔢 *Number*     : +${num}
🌍 *Country*    : ${country}
📏 *Length*     : ${num.length} digits
📲 *On WhatsApp*: ${isRegistered}
🔗 *WA Link*    : https://wa.me/${num}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

    await react("✅");
    await Guru.sendMessage(from, { text }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  15. MEMBER SCANNER — full participant audit
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "memberscan",
    aliases: ["scangroup", "auditmembers", "memberaudit"],
    react: "🔬",
    category: "ultracore",
    description: "Deep-scan all group members — admins, numbers, stats",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isAdmin, isSuperAdmin } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admins only!");

    await react("⏳");
    try {
      const meta = await Guru.groupMetadata(from);
      const p = meta.participants;
      const superAdmins = p.filter((x) => x.admin === "superadmin");
      const admins = p.filter((x) => x.admin === "admin");
      const members = p.filter((x) => !x.admin);

      const listNums = (arr) =>
        arr.map((x) => `  ▸ +${(x.id || "").replace("@s.whatsapp.net", "")}`).join("\n") || "  None";

      const text =
`🔬 *GROUP MEMBER SCAN*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
📌 *Group* : ${meta.subject}
📅 *Created*: ${meta.creation ? new Date(meta.creation * 1000).toDateString() : "Unknown"}

📊 *STATISTICS*
  Total    : ${p.length}
  👑 Super : ${superAdmins.length}
  🛡 Admin : ${admins.length}
  🙋 Member: ${members.length}

👑 *SUPER ADMINS* (${superAdmins.length})
${listNums(superAdmins)}

🛡 *ADMINS* (${admins.length})
${listNums(admins)}

╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
> Members list omitted (${members.length} total). Use *.vcf* to export.`;

      await react("✅");
      await Guru.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Scan failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  16. ROBOT STATUS — send bot status to WhatsApp status
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "robotstatus",
    aliases: ["botstatus", "statusbroadcast", "broadcaststatus"],
    react: "📢",
    category: "ultracore",
    description: "Post bot's current stats as a WhatsApp status",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isSuperUser, botName, botFooter } = conText;
    if (!isSuperUser) return reply("❌ Owner only!");
    await react("📡");

    const mem = memUsage();
    const up  = uptime();
    const cmds = require("../guru").commands?.length || 0;

    const statusText =
`🤖 *${botName}* — ONLINE
⏱ Uptime  : ${up}
🧠 Memory  : ${mem.heap}
⚡ Commands: ${cmds} loaded
📅 ${new Date().toLocaleString()}
_${botFooter}_`;

    try {
      await Guru.sendMessage("status@broadcast", { text: statusText });
      await react("✅");
      reply("📢 Status posted to WhatsApp Story!");
    } catch (e) {
      await react("❌");
      reply("❌ Failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  17. COUNTDOWN BOMB — send a public countdown timer in group
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "bomb",
    aliases: ["countdownbomb", "timerbomb", "publiccountdown"],
    react: "💥",
    category: "ultracore",
    description: "Send a dramatic countdown in chat (5 to 1 then BOOM)",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react, isAdmin, isSuperAdmin, isSuperUser } = conText;
    if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply("❌ Admins only!");

    const seconds = Math.min(parseInt(q?.trim()) || 5, 10);
    if (seconds < 2) return reply("❌ Minimum 2 seconds");

    await react("💣");

    const frames = ["💣", "⏳", "⌛", "🔴", "🟠", "🟡", "🟢"];
    for (let i = seconds; i > 0; i--) {
      const bar = "🔴".repeat(i) + "⚪".repeat(seconds - i);
      await Guru.sendMessage(from, {
        text: `${frames[i % frames.length]} *COUNTDOWN: ${i}*\n${bar}`,
      });
      await sleep(1000);
    }

    await Guru.sendMessage(from, { text: "💥 *B O O M !* 💥\n> _Detonation complete._" });
    await react("💥");
  }
);

// ══════════════════════════════════════════════════════════════════
//  18. UUID v4 BULK — generate multiple UUIDs at once
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "uuidbulk",
    aliases: ["getuuids", "bulkuuid", "generateuuids"],
    react: "🆔",
    category: "ultracore",
    description: "Generate up to 20 UUID v4 identifiers at once",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    const count = Math.min(parseInt(q?.trim()) || 5, 20);
    if (count < 1) return reply("❌ Count: 1–20");
    await react("⚙️");

    const ids = Array.from({ length: count }, () => crypto.randomUUID()).join("\n");

    await react("✅");
    await Guru.sendMessage(from, {
      text: `🆔 *${count} UUID v4 Generated*\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\`\`\`\n${ids}\n\`\`\``,
    }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  19. WEATHER PRO — detailed weather with forecast
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "weatherpro",
    aliases: ["forecast", "weatherdetail", "fullweather"],
    react: "🌦️",
    category: "ultracore",
    description: "Detailed weather + 3-day forecast for any city",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    if (!q) return reply("❌ Usage: .weatherpro <city>");
    await react("🌍");

    try {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=1`,
        { timeout: 8000 }
      );
      const loc = geoRes.data.results?.[0];
      if (!loc) return reply(`❌ Location not found: ${q}`);

      const wRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode,apparent_temperature,precipitation` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto&forecast_days=3`,
        { timeout: 8000 }
      );
      const w = wRes.data;
      const c = w.current;
      const d = w.daily;

      const wCode = (code) => {
        const map = {
          0:"☀️ Clear", 1:"🌤 Mostly Clear", 2:"⛅ Partly Cloudy", 3:"☁️ Overcast",
          45:"🌫 Fog", 48:"🌫 Icy Fog", 51:"🌦 Light Drizzle", 53:"🌦 Drizzle",
          55:"🌧 Heavy Drizzle", 61:"🌧 Light Rain", 63:"🌧 Rain", 65:"🌧 Heavy Rain",
          71:"🌨 Light Snow", 73:"🌨 Snow", 75:"❄️ Heavy Snow", 80:"🌦 Showers",
          81:"🌧 Heavy Showers", 82:"⛈ Violent Rain", 95:"⛈ Thunderstorm",
          96:"⛈ Hail Storm", 99:"⛈ Heavy Hail",
        };
        return map[code] || `Code ${code}`;
      };

      const days = d.time.map((t, i) =>
        `  📅 *${t}*\n  ┣ ${wCode(d.weathercode[i])}\n  ┣ 🌡 ${d.temperature_2m_min[i]}°C – ${d.temperature_2m_max[i]}°C\n  ┗ 🌧 Rain: ${d.precipitation_sum[i]}mm`
      ).join("\n\n");

      const text =
`🌦️ *WEATHER PRO — ${loc.name}, ${loc.country}*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
📍 Coords   : ${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}
🗺 Region   : ${loc.admin1 || "N/A"}

⚡ *CURRENT CONDITIONS*
  ${wCode(c.weathercode)}
  🌡 Temp     : ${c.temperature_2m}°C (feels ${c.apparent_temperature}°C)
  💧 Humidity : ${c.relative_humidity_2m}%
  💨 Wind     : ${c.wind_speed_10m} km/h
  🌧 Precip   : ${c.precipitation}mm

📅 *3-DAY FORECAST*
${days}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

      await react("✅");
      await Guru.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Weather error: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  20. ROBOT BROADCAST — send a message to ALL known groups
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "robotbroadcast",
    aliases: ["megabroadcast", "allgroups", "broadcastgroups"],
    react: "📡",
    category: "ultracore",
    description: "Broadcast a message to ALL groups bot is in (Owner only)",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react, isSuperUser, botName } = conText;
    if (!isSuperUser) return reply("❌ Owner only!");
    if (!q) return reply("❌ Usage: .robotbroadcast <message>");

    await react("📡");
    reply("📡 Initiating group broadcast...");

    try {
      const groups = await Guru.groupFetchAllParticipating();
      const gids = Object.keys(groups);
      let sent = 0, failed = 0;

      broadcastLog.push({ time: new Date().toISOString(), msg: q.slice(0, 100), groups: gids.length });
      if (broadcastLog.length > 20) broadcastLog.shift();

      for (const gid of gids) {
        try {
          await Guru.sendMessage(gid, {
            text: `📡 *[${botName} BROADCAST]*\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n${q}\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`,
          });
          sent++;
          await sleep(500);
        } catch (_) {
          failed++;
        }
      }

      await react("✅");
      await Guru.sendMessage(from, {
        text:
`📡 *BROADCAST COMPLETE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
✅ Delivered : ${sent}
❌ Failed    : ${failed}
📊 Total     : ${gids.length} groups
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`,
      }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Broadcast failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  21. MENTION BOMB — tag every member one-by-one
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "mentionbomb",
    aliases: ["tagbomb", "mentionall2", "massmention"],
    react: "💥",
    category: "ultracore",
    description: "Tag every member individually with a custom message",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react, isGroup, isAdmin, isSuperAdmin, isBotAdmin, botName } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admins only!");

    await react("⏳");

    try {
      const meta = await Guru.groupMetadata(from);
      const members = meta.participants.map((p) => p.id);
      const msg = q?.trim() || "You have been mentioned!";

      let done = 0;
      for (const jid of members) {
        const num = jid.replace("@s.whatsapp.net", "");
        try {
          await Guru.sendMessage(from, {
            text: `📌 @${num}\n${msg}`,
            mentions: [jid],
          });
          done++;
          await sleep(300);
        } catch (_) {}
      }

      await react("✅");
      await Guru.sendMessage(from, {
        text: `💥 *MENTION BOMB DONE* — Tagged ${done}/${members.length} members`,
      }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Error: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  22. TOKEN GENERATOR — generate API keys / secrets
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "tokengen",
    aliases: ["apikey", "secretkey", "generatetoken"],
    react: "🗝️",
    category: "ultracore",
    description: "Generate random tokens/API keys in multiple formats",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    await react("⚙️");

    const len = Math.min(parseInt(q?.trim()) || 32, 64);

    const hex   = crypto.randomBytes(len).toString("hex");
    const b64   = crypto.randomBytes(len).toString("base64url");
    const alphanum = Array.from({ length: len }, () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return chars[crypto.randomInt(chars.length)];
    }).join("");
    const apiKey = `sk-${crypto.randomBytes(24).toString("base64url")}`;
    const jwt = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${crypto.randomBytes(32).toString("base64url")}.${crypto.randomBytes(24).toString("base64url")}`;

    const text =
`🗝️ *TOKEN GENERATOR*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
🔢 *HEX Token*
\`${hex}\`

🔡 *Base64URL*
\`${b64}\`

🔤 *Alphanumeric*
\`${alphanum}\`

🔑 *API Key Format*
\`${apiKey}\`

🎫 *Mock JWT Token*
\`${jwt}\`
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

    await react("✅");
    await Guru.sendMessage(from, { text }, { quoted: mek });
  }
);

// ══════════════════════════════════════════════════════════════════
//  23. REGEX TESTER — test regex against input
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "regextest",
    aliases: ["regex", "testregex", "regexmatch"],
    react: "🔣",
    category: "ultracore",
    description: "Test a regex pattern against a string",
  },
  async (from, Guru, conText) => {
    const { reply, q, mek, react } = conText;
    if (!q || !q.includes("|")) return reply("❌ Usage: .regextest <pattern>|<test string>");

    const [pattern, ...rest] = q.split("|");
    const testStr = rest.join("|");

    await react("⚙️");

    try {
      const re = new RegExp(pattern.trim(), "gim");
      const matches = [...testStr.matchAll(re)];
      const matched = re.test(testStr);
      const result = matches.map((m, i) =>
        `  #${i + 1}: \`${m[0]}\` @ index ${m.index}`
      ).join("\n") || "  No matches";

      const text =
`🔣 *REGEX ENGINE*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
📝 *Pattern* : /${pattern.trim()}/gim
📄 *Input*   : ${testStr.slice(0, 80)}

${matched ? "✅ *MATCH FOUND*" : "❌ *NO MATCH*"}

🎯 *Matches* (${matches.length}):
${result}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

      await react("✅");
      await Guru.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Invalid regex: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  24. GROUP CLONE — copy group description/name to another
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "groupclone",
    aliases: ["clonegroup", "copygroup", "clonegc"],
    react: "📋",
    category: "ultracore",
    description: "Copy current group's name + description to bot's display",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, isGroup, isAdmin, isSuperAdmin, isBotAdmin } = conText;
    if (!isGroup) return reply("❌ Groups only!");
    if (!isBotAdmin) return reply("❌ Bot must be admin!");
    if (!isAdmin && !isSuperAdmin) return reply("❌ Admins only!");

    await react("⏳");

    try {
      const meta = await Guru.groupMetadata(from);
      const text =
`📋 *GROUP CLONE SNAPSHOT*
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍
📌 *Name* :
${meta.subject}

📝 *Description* :
${meta.desc || "No description set."}

🔗 *Group JID* : ${from}
👥 *Members*   : ${meta.participants.length}
📅 *Created*   : ${meta.creation ? new Date(meta.creation * 1000).toDateString() : "Unknown"}
╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍`;

      await react("✅");
      await Guru.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      await react("❌");
      reply("❌ Clone failed: " + e.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════
//  25. ULTRACORE HELP — list all ultra features
// ══════════════════════════════════════════════════════════════════

gmd(
  {
    pattern: "ultrahelp",
    aliases: ["uchelp", "coremenu", "ultracore", "robotmenu"],
    react: "🤖",
    category: "ultracore",
    description: "Show all ULTRA CORE robotic features",
  },
  async (from, Guru, conText) => {
    const { reply, mek, react, botPrefix, botFooter, botName, newsletterJid } = conText;
    const p = botPrefix || ".";
    await react("🤖");

    const text =
`╔══════[ 🤖 *ULTRA CORE FEATURES* ]══════╗

🖥️ *SYSTEM & NETWORK*
  ${p}sysboard       — Live system dashboard
  ${p}iplookup       — IP/domain geo-intel
  ${p}dnslookup      — DNS record scanner
  ${p}numinfo        — Phone number intel

🔐 *CRYPTO & SECURITY*
  ${p}hash           — Multi-algo hash engine
  ${p}genpass        — Ultra-strong passwords
  ${p}tokengen       — API key/token generator
  ${p}regextest      — Regex pattern tester
  ${p}uuidbulk       — Bulk UUID v4 generator

💣 *GROUP WARFARE*
  ${p}lockdown       — Freeze group instantly
  ${p}unlockdown     — Lift the freeze
  ${p}nuke           — Remove all non-admins
  ${p}masspromote    — Promote all to admin
  ${p}massdemote     — Demote all admins
  ${p}silence @user  — Temp-remove user
  ${p}mentionbomb    — Tag every member
  ${p}bomb <secs>    — Countdown detonator

🌦️ *INTELLIGENCE*
  ${p}weatherpro     — Full weather + forecast
  ${p}memberscan     — Deep group member audit
  ${p}groupclone     — Group snapshot
  ${p}spamcheck      — Flood/spam analysis

📡 *BROADCASTING*
  ${p}robotbroadcast — Msg all groups
  ${p}robotstatus    — Post status to story
  ${p}autopingstart  — Auto keep-alive pings
  ${p}autopingstop   — Stop auto pings

╚══════[ ✨ _${botFooter}_ ]══════╝`;

    await Guru.sendMessage(from, {
      text,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName: botName,
          serverMessageId: 999,
        },
      },
    }, { quoted: mek });

    await react("✅");
  }
);
