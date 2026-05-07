# ULTRA GURU MD

A WhatsApp multi-device bot built with gifted-baileys, featuring plugins for AI, downloaders, games, group management, and more.

## Run & Operate

- **Start**: `node --max-old-space-size=256 index.js`
- **Port**: 5000
- **Required env vars**: `SESSION_ID` (WhatsApp session), `MODE` (public/private), `TIME_ZONE`, `DATABASE_URL` (optional, falls back to SQLite), `OWNER_NUMBER`

## Stack

- Node.js 18, Express 4
- gifted-baileys (WhatsApp Web API)
- Sequelize + SQLite (better-sqlite3) — dual DB strategy
- fluent-ffmpeg, wa-sticker-formatter, jimp for media
- gifted-btns, gifted-dls for WhatsApp buttons and downloads

## Where things live

- `index.js` — obfuscated main entry; requires `./guru/gmdHelpers`
- `config.js` — reads `.env` for SESSION_ID, MODE, DATABASE_URL
- `guru/` — core helper modules (all created during import)
  - `guru/gmdHelpers.js` — central aggregator re-exporting all helpers
  - `guru/gmdCmds.js` — command registry (`gmd`, `commands`)
  - `guru/index.js` — re-exports gmdHelpers (so `require('../guru')` works)
  - `guru/database/` — Sequelize + SQLite models (settings, sudo, groups, notes, games, etc.)
  - `guru/connection/` — connectionHandler, groupCache, serializer
  - `guru/contextInfo.js`, `guru/gameHandler.js`, `guru/wcg.js`, `guru/gameAI.js`
- `guruh/` — plugin files (general, downloader, converter, games, etc.)
- `guru/session/` — auth state and SQLite DBs (runtime, gitignored)
- `guru/temp/` — temp media files (runtime)

## Architecture decisions

- The main `index.js` is heavily obfuscated; all missing helpers were reverse-engineered from usage patterns in guruh plugins and obfuscated call signatures
- `useSQLiteAuthState(path)` wraps `useMultiFileAuthState` — takes a directory path, returns `{ state, saveCreds }`
- `createSocketConfig(version, state, logger)` — takes three positional args as called by obfuscated code
- `setupConnectionHandler(Gifted, sessionDir, restartFn, options)` — handles reconnect loop
- Database uses Sequelize for settings/sudo/groups, better-sqlite3 for message store and game DBs
- `guru/index.js` re-exports `gmdHelpers` so both `require('../guru')` and `require('../guru/gmdHelpers')` work

## Product

- WhatsApp bot responding to commands with prefix (default `.`)
- Plugins: AI chat, media downloaders, converters, stickers, games (TicTacToe, WCG, Dice), group management, notes, temp mail, logo generation, religion, sports, tools
- Settings configurable via WhatsApp commands by owner/sudo users
- Anti-spam features: antilink, antibad, anti-delete, anti-edit, anticall

## User preferences

_Populate as you build_

## Gotchas

- `wa-sticker-formatter` has its own bundled `sharp` — run `npm rebuild sharp` if it fails after redeployment
- Session stored in `guru/session/` — delete to force re-scan QR
- Bot needs a valid `SESSION_ID` env var to authenticate without QR scan
- The obfuscated `index.js` expects `loadSession()` to be called once (no-op init), then `useSQLiteAuthState(path)` inside `startGifted()`

## Pointers

- gifted-baileys: `node_modules/gifted-baileys/` — fork of @whiskeysockets/baileys
- Plugin structure: each `guruh/*.js` file calls `gmd({pattern, ...}, handler)` to register commands
