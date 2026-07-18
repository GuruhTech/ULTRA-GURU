// ════════════════════════════════════════════════════════════════════════════
//  GURU PAIRING — Generate a new SESSION_ID via WhatsApp pairing code
// ════════════════════════════════════════════════════════════════════════════

"use strict";

const {
    default: makeWASocket,
    fetchLatestWaWebVersion,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const path  = require("path");
const fs    = require("fs-extra");
const zlib  = require("zlib");
const pino  = require("pino");

const TEMP_DIR = path.join(__dirname, "pairing_temp");

// ─── Module state ────────────────────────────────────────────────────────────
let _socket      = null;
let _code        = null;        // "ABCD-EFGH" formatted pairing code
let _sessionId   = null;        // Final "GURU~..." string
let _status      = "idle";      // idle | requesting | ready | success | error
let _error       = null;

function getStatus() {
    return { status: _status, code: _code, sessionId: _sessionId, error: _error };
}

function _cleanup() {
    if (_socket) {
        try { _socket.end(undefined); } catch (_) {}
        _socket = null;
    }
    try { fs.removeSync(TEMP_DIR); } catch (_) {}
}

function _reset() {
    _cleanup();
    _code      = null;
    _sessionId = null;
    _error     = null;
    _status    = "idle";
}

async function startPairing(rawPhone) {
    _reset();

    const phone = rawPhone.replace(/\D/g, "");
    if (!phone || phone.length < 7) {
        _status = "error";
        _error  = "Invalid phone number.";
        return;
    }

    _status = "requesting";
    fs.ensureDirSync(TEMP_DIR);

    try {
        const { version }             = await fetchLatestWaWebVersion();
        const { state, saveCreds }    = await useMultiFileAuthState(TEMP_DIR);
        const silentLogger            = pino({ level: "silent" });

        _socket = makeWASocket({
            version,
            auth:                state,
            logger:              silentLogger,
            browser:             ["Ubuntu", "Chrome", "22.04.4"],
            printQRInTerminal:   false,
            connectTimeoutMs:    60_000,
            defaultQueryTimeoutMs: 30_000,
        });

        // Save creds whenever they update
        _socket.ev.on("creds.update", saveCreds);

        // Wait briefly for socket to register, then request pairing code
        await _delay(3_000);
        const raw = await _socket.requestPairingCode(phone);
        _code    = raw?.match(/.{1,4}/g)?.join("-") || raw;
        _status  = "ready";

        // Watch for connection success
        _socket.ev.on("connection.update", async (update) => {
            const { connection } = update;

            if (connection === "open") {
                try {
                    await saveCreds();
                    const credsPath = path.join(TEMP_DIR, "creds.json");
                    const credsJson = fs.readFileSync(credsPath, "utf8");
                    const compressed = zlib.gzipSync(Buffer.from(credsJson, "utf8"));
                    _sessionId = "GURU~" + compressed.toString("base64");
                    _status    = "success";
                    // Leave socket open briefly so creds finalise, then close
                    setTimeout(() => _cleanup(), 5_000);
                } catch (err) {
                    _status = "error";
                    _error  = "Session encode failed: " + err.message;
                }
            } else if (connection === "close" && _status !== "success") {
                _status = "error";
                _error  = "Connection closed before pairing completed.";
            }
        });

    } catch (err) {
        _status = "error";
        _error  = err.message;
        _cleanup();
    }
}

function cancelPairing() {
    _reset();
}

function _delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

module.exports = { startPairing, cancelPairing, getStatus };
