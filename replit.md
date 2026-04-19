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
  updater.js      — Bot update system (.update, .checkupdate, .autoupdate)
  ai.js           — AI chat with GuruTech identity lock (no ChatGPT/Gemini branding)
  restrictions.js — Group locks, slowmode, antispam, DM permit system
  settings3.js    — Advanced settings (warnlimit, automute, rejectcall, botlang, botinfo, etc.)
  channels.js     — Auto-follow + auto-react newsletter channels (always on)
```

### New Core Files

```
guru/
  autoUpdater.js       — Auto-update on restart (GitHub fetch, extract, notify owner)
  restrictionManager.js — Enforcement engine for group locks, slowmode, antispam, DM permit
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

**2. Menu Header Redesign (all three menu commands — `menus`, `list`, `menu`)**
- New header design: `◢◣◢◣◢◣◢ *BOT NAME* ◢◣◢◣◢◣◢` with `⋄ POWERED BY GURUTECH ⋄` subtitle
- Expiry shown as a **prominent banner** at the very top (between `▔` and `▁` dividers):
  - 🟢 ACTIVE · Xd left · Date
  - 🟡 EXPIRY SOON · Xd left · Date  
  - 🔴 EXPIRED · License ended · Date
  - ✦ Bot is Running Normally (if no expiry set)
- Expiry moved from buried stats row to the banner position in all 3 menus

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

**5. GuruTech AI Identity Lock (`guruh/ai.js`)**
- All AI commands (.gpt, .gemini, .guruai, .chat, .mistral, .letmegpt, etc.) now intercept identity questions
- 20+ patterns detected: "who made you?", "who are you?", "are you ChatGPT?", "what model are you?", etc.
- Response always credits GuruTech as the exclusive creator — never ChatGPT/Gemini/OpenAI
- New `.whois` command — explicitly shows bot identity card
- Identity response formatted as a ◈ info card with creator, platform, purpose info

**6. Group & DM Restriction System**

*`guru/restrictionManager.js` — Enforcement engine (wired into connectionHandler.js)*
- Listens to all messages after connection
- Per-group message type locks: deletes restricted messages and warns sender (bot must be admin)
- Slow mode: tracks per-user message timing; deletes messages sent too fast
- Anti-spam: detects duplicate messages within 5s window per user per group
- DM permit: blocks or warns unapproved DM senders; supports whitelist

*`guruh/restrictions.js` — Commands to manage restrictions*
- Per message type lock/unlock: `.locktext`/`.unlocktext`, `.lockmedia`/`.unlockmedia`, `.lockstickers`/`.unlockstickers`, `.lockgifs`/`.unlockgifs`, `.lockvideos`/`.unlockvideos`, `.lockvoice`/`.unlockvoice`, `.lockaudio`/`.unlockaudio`, `.lockdocs`/`.unlockdocs`, `.lockpolls`/`.unlockpolls`, `.lockviewonce`/`.unlockviewonce`, `.lockcontacts`/`.unlockcontacts`, `.locklocation`/`.unlocklocation`
- `.lockall` / `.unlockall` — bulk lock/unlock all types
- `.slowmode <seconds>` — set slow mode delay (0 to disable)
- `.antispam on/off` — duplicate detection
- `.restrictions` — view current group restriction status
- DM Permit commands (owner-only): `.dmpermit on/off`, `.dmpermitmsg`, `.dmpermitaction warn/block`, `.dmwhitelist add/remove/list`, `.dmstatus`

**7. Advanced Settings (`guruh/settings3.js`)**
- `.setwarnlimit <n>` — set warn threshold before action
- `.setautomute on/off` — auto-mute group responses
- `.setrejectcall on/off` — reject all incoming calls
- `.setbotlang <code>` — set bot language preference (en/fr/ar/sw/pt/es/de/zh/ha/yo/ig)
- `.setwelcomeaction join/ignore/leave` — action when added to group
- `.settagprotect on/off` — block mass-tagging
- `.setspamfilter on/off` — global spam filter toggle
- `.setbotprefix <char>` — change command prefix
- `.setbiotext <text>` — update bot's WhatsApp status/bio
- `.setbotname <name>` — update bot's WhatsApp display name
- `.botinfo` — full system info card (uptime, RAM, version, expiry, repo)
- `.settingsinfo` — overview of all current bot settings

**8. Auto-Follow & Auto-React Newsletter Channels (`guruh/channels.js` + `guru/connection/connectionHandler.js`)**
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
