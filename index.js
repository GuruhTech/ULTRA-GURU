// ════════════════════════════════════════════════════════════════════════════
//  ULTRA GURU MD — Bot Entry Point
//  by GuruTech | github.com/GuruhTech
// ════════════════════════════════════════════════════════════════════════════

"use strict";

// ─── Polyfills (must be first) ───────────────────────────────────────────────
require("events").EventEmitter.defaultMaxListeners = 960;
if (!globalThis.crypto) globalThis.crypto = require("crypto").webcrypto;
try { if (typeof File === "undefined") globalThis.File = require("buffer").File; } catch (_) {}

// ─── Node & Third-Party ──────────────────────────────────────────────────────
const path    = require("path");
const http    = require("http");
const express = require("express");

const {
    default: makeWASocket,
    jidNormalizedUser,
    fetchLatestWaWebVersion,
} = require("@whiskeysockets/baileys");

// ─── Guru Core ───────────────────────────────────────────────────────────────
require("./guru/gmdHelpers");

const {
    logger, commands,
    loadSession, useSQLiteAuthState,
    safeNewsletterFollow, safeGroupAcceptInvite,
    setupConnectionHandler, setupGroupEventsListeners,
    initializeLidStore, getAllSettings, DEFAULT_SETTINGS,
    createSocketConfig, createContext,
    syncDatabase, initializeSettings, initializeGroupSettings,
    loadPlugins,
} = require("./guru");

const { startCleanup, SQLiteStore }      = require("./guru/database/messageStore");
const { setupCommandHandler }            = require("./guru/messageHandler");
const {
    setupAutoReact, setupAntiDelete, setupAutoBio,
    setupAntiCall, setupPresence, setupChatBotAndAntiLink,
    setupAntiEdit, setupStatusHandlers,
} = require("./guru/eventHandlers");

// ─── Constants ───────────────────────────────────────────────────────────────
const PORT            = process.env.PORT || 5000;
const SESSION_DIR     = path.join(__dirname, "guru", "session");
const PLUGINS_DIR     = path.join(__dirname, "guruh");
const MEMORY_LIMIT    = 400 * 1024 * 1024; // 400 MB
const AUTO_RESTART_MS = 24 * 60 * 60 * 1000; // 24 hours

logger.level = "silent";

// ─── Mutable State ───────────────────────────────────────────────────────────
let GuruSocket = null;
let store      = null;
let botSettings = {};

// ════════════════════════════════════════════════════════════════════════════
//  WEB SERVER
// ════════════════════════════════════════════════════════════════════════════

function startWebServer() {
    const app = express();

    app.use(express.json());
    app.use(express.static("guru"));
    app.get("/",       (_req, res) => res.sendFile(path.join(__dirname, "guru", "guru.html")));
    app.get("/pair",   (_req, res) => res.sendFile(path.join(__dirname, "guru", "pair.html")));
    app.get("/health", (_req, res) => res.status(200).json({ status: "alive", uptime: process.uptime() }));

    // ── Pairing API ───────────────────────────────────────────────────────────
    const pairing = require("./guru/pairing");

    app.post("/api/pair", async (req, res) => {
        const phone = (req.body?.phone || "").replace(/\D/g, "");
        if (!phone || phone.length < 7) {
            return res.json({ ok: false, error: "Invalid phone number." });
        }
        pairing.startPairing(phone).catch(() => {});
        res.json({ ok: true });
    });

    app.get("/api/pair/status", (_req, res) => {
        res.json(pairing.getStatus());
    });

    app.get("/api/pair/cancel", (_req, res) => {
        pairing.cancelPairing();
        res.json({ ok: true });
    });

    const server = app.listen(PORT, "0.0.0.0", () =>
        console.log(`✅ Server Running on Port: ${PORT}`)
    );

    server.on("error", (err) => {
        if (err.code !== "EADDRINUSE") return console.error("Server error:", err.message);
        console.warn(`⚠️ Port ${PORT} in use — retrying in 3s...`);
        setTimeout(() => {
            server.close(() => {
                const retry = app.listen(PORT, "0.0.0.0", () =>
                    console.log(`✅ Server Running on Port: ${PORT}`)
                );
                retry.on("error", (e) => console.error("Retry failed:", e.message));
            });
        }, 3000);
    });
}

// ════════════════════════════════════════════════════════════════════════════
//  SYSTEM TASKS
// ════════════════════════════════════════════════════════════════════════════

function startSystemTasks() {
    // Memory watchdog — GC when heap exceeds limit
    setInterval(() => {
        if (process.memoryUsage().heapUsed > MEMORY_LIMIT && global.gc) global.gc();
    }, 60_000);

    // Health ping — keeps the server warm
    setInterval(() => {
        http.get(`http://localhost:${PORT}/health`, () => {}).on("error", () => {});
    }, 240_000);

    // Scheduled 24-hour auto-restart
    setTimeout(() => {
        console.log("🔄 [AUTO-RESTART] 24-hour restart triggered.");
        process.exit(0);
    }, AUTO_RESTART_MS);

    console.log(`✅ Auto-restart scheduled in 24 hours (${new Date(Date.now() + AUTO_RESTART_MS).toLocaleTimeString()})`);
}

// ════════════════════════════════════════════════════════════════════════════
//  EXPIRY WATCHDOG
// ════════════════════════════════════════════════════════════════════════════

function startExpiryWatchdog() {
    try {
        const { startExpiryWatchdog: watch } = require("./guru/expiry");

        const notifyOwner = async (text) => {
            const ownerNum = (process.env.OWNER_NUMBER || "").replace(/[^0-9]/g, "");
            const ownerJid = `${ownerNum}@s.whatsapp.net`;
            if (global._botSocket && ownerJid.length > 10) {
                await global._botSocket.sendMessage(ownerJid, { text }).catch(() => {});
            }
        };

        watch(
            async (msg) => {
                global._licenceExpired = true;
                console.warn("[EXPIRY] ⛔ Licence expired — commands locked.");
                await notifyOwner(`⛔ *ULTRA GURU MD — LICENCE EXPIRED*\n\n${msg}\n\n_Commands are locked. Renew your licence to continue._`);
            },
            async (warnMsg) => notifyOwner(warnMsg),
        );
    } catch (e) {
        console.warn("[EXPIRY] Watchdog not started:", e.message);
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  DATABASE INIT
// ════════════════════════════════════════════════════════════════════════════

async function initDatabase() {
    await syncDatabase();
    await initializeSettings();
    await initializeGroupSettings();
    botSettings = await getAllSettings();
}

// ════════════════════════════════════════════════════════════════════════════
//  BOT BOOT
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
//  WA VERSION FETCH — with timeout
// ════════════════════════════════════════════════════════════════════════════
// fetchLatestWaWebVersion() has no built-in timeout. If the network call
// stalls (blocked egress, DNS issue, slow endpoint), the whole startGuru()
// chain hangs silently forever — no error, no log, no retry. This wraps it
// in a timeout so a stall instead throws and falls into the existing
// catch-and-retry logic below.
const WA_VERSION_FETCH_TIMEOUT_MS = 15_000;

async function fetchWaVersionWithTimeout() {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`WA version fetch timed out after ${WA_VERSION_FETCH_TIMEOUT_MS / 1000}s`)), WA_VERSION_FETCH_TIMEOUT_MS)
    );
    const { version } = await Promise.race([fetchLatestWaWebVersion(), timeout]);
    return version;
}

async function startGuru() {
    try {
        console.log("🕗 Fetching WhatsApp Web version...");
        const version = await fetchWaVersionWithTimeout();
        console.log(`✅ Using WA Web version: ${version.join(".")}`);
        const sessionDbPath      = path.join(SESSION_DIR, "session.db");
        const { state, saveCreds } = await useSQLiteAuthState(sessionDbPath);

        if (store) store.destroy();
        store = new SQLiteStore();

        // Build socket
        const socketConfig = createSocketConfig(version, state, logger);
        socketConfig.getMessage = async (key) => {
            if (!store) return { conversation: "Error occurred" };
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message ?? undefined;
        };

        GuruSocket            = makeWASocket(socketConfig);
        global._botSocket     = GuruSocket;
        store.bind(GuruSocket.ev);

        // Persist credentials on update
        GuruSocket.ev.process(async (events) => {
            if (events["creds.update"]) await saveCreds();
        });

        // Attach event handlers
        setupAutoReact(GuruSocket);
        setupAntiDelete(GuruSocket);
        setupAutoBio(GuruSocket);
        setupAntiCall(GuruSocket);
        setupPresence(GuruSocket);
        setupChatBotAndAntiLink(GuruSocket);
        setupAntiEdit(GuruSocket);
        setupStatusHandlers(GuruSocket);
        setupGroupEventsListeners(GuruSocket);

        // Load plugins & commands
        loadPlugins(PLUGINS_DIR);
        setupCommandHandler(GuruSocket);

        // Connection lifecycle
        setupConnectionHandler(GuruSocket, SESSION_DIR, startGuru, {
            onOpen: (socket) => onBotConnected(socket),
        });

        // Cleanup on exit
        process.on("SIGINT",  () => store?.destroy());
        process.on("SIGTERM", () => store?.destroy());

    } catch (err) {
        console.error("❌ Socket init error:", err.message);
        setTimeout(startGuru, 5_000);
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  ON CONNECTED
// ════════════════════════════════════════════════════════════════════════════

async function onBotConnected(socket) {
    const s = await getAllSettings();

    // Follow channel & join group
    await safeNewsletterFollow(socket, s.NEWSLETTER_JID);
    await safeGroupAcceptInvite(socket, s.GC_JID);
    await initializeLidStore(socket);

    // Start scheduler
    try {
        const { startScheduler } = require("./guru/scheduler");
        startScheduler(socket);
    } catch (e) {
        console.error("[Scheduler] start error:", e.message);
    }

    // Post-connect message
    setTimeout(() => sendStartupMessage(socket, s), 5_000);
}

async function sendStartupMessage(socket, s) {
    try {
        const d             = DEFAULT_SETTINGS;
        const totalCommands = commands.filter((c) => c.pattern && !c.dontAddCommandList).length;
        const botName       = (s.BOT_NAME || d.BOT_NAME).toUpperCase();
        const modeLabel     = s.MODE === "public" ? "🌐 PUBLIC" : "🔒 PRIVATE";

        console.log("💜 Connected to WhatsApp — Active!");

        if (s.STARTING_MESSAGE !== "true") return;

        const { expiryLine } = require("./guru/expiry");
        const expLine        = await expiryLine().catch(() => "✅ Active");

        const msg = [
            `*✅ ${botName} — ONLINE*`,
            ``,
            `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
            `📊 *Plugins*  : ${totalCommands}`,
            `⚡ *Prefix*   : ${s.PREFIX || d.PREFIX}`,
            `⚙️ *Mode*     : ${modeLabel}`,
            `🔒 *Licence*  : ${expLine}`,
            `📲 *Telegram* : t.me/GURU_TECHLAB`,
            `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
            `> ✨ _${s.CAPTION || d.CAPTION}_`,
            `> _Allow a few seconds to sync._`,
        ].join("\n");

        const destJid = jidNormalizedUser(socket.user.id);
        let ctx = {};
        try { ctx = await createContext(botName, { title: "BOT INTEGRATED", body: "Status: Ready for Use" }); } catch (_) {}

        await socket.sendMessage(destJid, { text: msg, ...ctx }, {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 300,
        });
    } catch (err) {
        console.error("Post-connection error:", err.message);
    }
}

// ════════════════════════════════════════════════════════════════════════════
//  BOOTSTRAP
// ════════════════════════════════════════════════════════════════════════════

(async () => {
    startWebServer();
    startSystemTasks();
    startExpiryWatchdog();
    startCleanup();

    await loadSession();
    await initDatabase();

    startGuru();
})();
