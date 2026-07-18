// ════════════════════════════════════════════════════════════════════════════
//  GURU CONFIG — Environment Variable Loader
// ════════════════════════════════════════════════════════════════════════════

"use strict";

const fs   = require("fs-extra");
const path = require("path");

// Load .env if present
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) require("dotenv").config({ path: envPath, quiet: true });

// ─── Exported Config ──────────────────────────────────────────────────────────
module.exports = {
    MODE:             process.env.MODE,
    SESSION_ID:       process.env.SESSION_ID,
    TIME_ZONE:        process.env.TIME_ZONE,
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS,
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS,
    DATABASE_URL:     process.env.DATABASE_URL,
};

// ─── Hot Reload (dev convenience) ────────────────────────────────────────────
const self = require.resolve(__filename);
fs.watchFile(self, () => {
    fs.unwatchFile(self);
    delete require.cache[self];
    require(self);
});
