# ULTRA GURU MD — WhatsApp Bot

A powerful multi-device WhatsApp bot built with Baileys (gifted-baileys), featuring AI, downloaders, group management, games, tools, and many more plugins.

## Architecture

- **Entry Point**: `index.js` — starts the bot and loads session
- **Core Engine**: `guru/` — connection handling, database, command system
- **Plugins**: `guruh/` — all user-facing commands organized by category
- **Config**: `config.js` + `.env` — environment variables

## Key Directories

```
guru/
  connection/     — WhatsApp socket, message handling, group cache
  database/       — SQLite/PostgreSQL via Sequelize (settings, sudo, notes, groups)
  gmdCmds.js      — Command registration system
  gmdFunctions.js — Core utility functions

guruh/
  ai.js           — AI chat (GPT-4, etc.)
  downloader.js   — YouTube, TikTok, Instagram downloaders
  downloader2.js  — Additional download features
  games.js        — Tic-Tac-Toe, word games
  group.js        — Group admin tools
  general.js      — Menu, ping, uptime, repo, save commands
  settings.js     — Bot settings (prefix, mode, welcome, expiry, etc.)
  settings2.js    — Additional group settings
  owner.js        — Owner-only commands (profile pics, reveal, etc.)
  owner2.js       — Extended owner commands
  tools.js        — fetch, sticker, convert tools
  tools2.js       — Additional tool commands
  search.js       — Search commands
  search2.js      — Extended search
  extras.js       — NEW: calc, flip, roll, choose, reverse, morse, base64, joke, fact, quote, password, wordcount, age, countdown, currency, color, emojify, binary, etc.
  converter.js    — Media conversion
  religion.js     — Islamic/religious commands
  sports.js       — Sports info
  tempmail.js     — Temp mail
  shortener.js    — URL shortener
  tourl.js        — Media to URL
  logo.js         — Logo generation
  play.js         — Music/media playback
  notes.js        — Notes system
  whatsapp.js     — WhatsApp-specific tools
  updater.js      — Bot update system
```

## Running the Bot

Start: `node --max-old-space-size=256 index.js`

On first run, you'll be prompted to:
1. Enter phone number (pairing code method), OR
2. Paste an existing SESSION_ID

## Environment Variables

Set in `.env` file or Replit Secrets:
- `SESSION_ID` — Bot WhatsApp session
- `DATABASE_URL` — PostgreSQL URL (optional, falls back to local SQLite)
- `MODE` — public or private
- `TIME_ZONE` — e.g. Africa/Nairobi
- `AUTO_READ_STATUS` — true/false
- `AUTO_LIKE_STATUS` — true/false

## Recent Changes (April 2026)

### New Features Added

**1. `guruh/extras.js` — New Plugin Pack**
- `calc` — Math expression calculator
- `flip` — Coin flip
- `roll` — Dice roll (customizable sides)
- `choose` — Random choice from options
- `reverse` — Reverse any text
- `mock` — SpongeBob mocking text
- `upper` / `lower` — Text case conversion
- `binary` — Text ↔ Binary conversion
- `morse` — Text ↔ Morse code
- `base64` — Encode/Decode Base64
- `password` — Secure random password generator
- `wordcount` — Word/character/sentence counter
- `age` — Age calculator from birthdate
- `countdown` — Days until a future date
- `joke` — Random jokes (with fallback)
- `fact` — Random interesting facts (with fallback)
- `quote` — Inspirational quotes (with fallback)
- `repeat` — Repeat text N times
- `number` — Fun facts about a number
- `acronym` — Create acronym from words
- `currency` — Live currency conversion
- `emojify` — Add random emojis to text
- `color` — Hex color code info

**2. Creative Menu Redesign (all three menu commands)**
- `menus` — Compact overview with ◈ ⤳ style, expiry inline, category counts
- `menu` — Full command vault with ꧁━ header, dashed ╍ section separators, ▸ bullets
- `list` — Numbered command index with matching new style
- Design philosophy: clean editorial/cipher style instead of generic box-drawing
- Expiry shown prominently in all menu commands (color-coded 🟢/🟡/🔴)

**3. Bot Expiry Date System (in `guruh/settings.js`)**
- `setexpiry YYYY-MM-DD` — Set a bot access expiry date
- `checkexpiry` — View expiry status with color-coded alerts (green/yellow/red)
- `clearexpiry` — Remove the expiry date

**4. Auto-Update on Restart (`guru/autoUpdater.js` + `guruh/updater.js`)**
- `AUTO_UPDATE: "true"` setting — enabled by default, persisted in DB
- On every fresh bot start, 8 seconds after connection opens, the bot automatically:
  1. Reads `BOT_REPO` from settings (default `GuruhTech/ULTRA-GURU`)
  2. Fetches the latest GitHub commit hash via API
  3. Compares against the locally stored hash (in `update_info` DB table)
  4. If different: downloads repo zip, extracts, copies files (excluding `.env` and DB files), saves new hash, notifies owner in DM, then restarts
  5. If up to date: logs it and continues normally
- One-check-per-process-lifetime: the flag `updateCheckedThisSession` prevents checking on every reconnect within the same process
- Commands (all owner-only):
  - `.update` — manually force update and restart
  - `.checkupdate` — check status without applying (shows current vs latest commit, auto-update state)
  - `.autoupdate on/off` — enable or disable auto-update on restart

**5. Auto-Follow & Auto-React Newsletter Channels (`guruh/channels.js` + `guru/connection/connectionHandler.js`)**
- Hardcoded channels: `120363406649804510@newsletter`, `120363427012090993@newsletter`
- Auto-follows ALL tracked channels 3 seconds after every successful connection
- Auto-reacts to posts from tracked channels using 30 random professor emojis (🎓👨‍🏫🔬📚💡 etc.)
- Falls back gracefully between `newsletterReactMessage` and `sendMessage` react
- Commands:
  - `channels` — view all tracked channels and react status
  - `addchannel <jid>` — add extra custom channel to track
  - `removechannel <jid>` — remove a custom channel
  - `channelreact on/off` — toggle auto-reactions
  - `followchannels` — manually re-follow all channels
  - `professoremojis` — display all professor react emojis
- Settings stored: `OWNER_CHANNELS` (extra channels), `CHANNEL_AUTOREACT` (toggle)

## Dependencies Notes

Native modules that require compilation:
- `better-sqlite3` — SQLite driver (prebuilt)
- `sharp` — Image processing (needs: `cd node_modules/sharp && npm run install`)
- `wa-sticker-formatter/sharp` — Also needs: `cd node_modules/wa-sticker-formatter/node_modules/sharp && npm run install`

System dependencies needed:
- `python3`, `gnumake`, `gcc` — For native module builds
- `python312Packages.setuptools` — For node-gyp compatibility
