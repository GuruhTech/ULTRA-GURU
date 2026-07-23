# ULTRA GURU MD

A powerful multi-device WhatsApp bot built with Node.js and the [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) library.

## Stack

- **Runtime**: Node.js 22
- **WhatsApp library**: @whiskeysockets/baileys
- **Database**: PostgreSQL (Replit-managed) with SQLite fallback
- **Web server**: Express (serves pair/QR pages)
- **Media tools**: ffmpeg, sharp, jimp

## How to run

The workflow `Start application` runs `npm start` which executes `node --max-old-space-size=512 index.js`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `SESSION_ID` | ✅ | WhatsApp session token. Generate at https://ultra-guru-pair-1.onrender.com/pair |
| `TIME_ZONE` | ✅ | e.g. `Africa/Lagos`, `America/New_York` |
| `MODE` | ✅ | `public` (anyone) or `private` (owner only) |
| `AUTO_READ_STATUS` | ❌ | Auto-view statuses (`true`/`false`) |
| `AUTO_LIKE_STATUS` | ❌ | Auto-like statuses (`true`/`false`) |
| `DATABASE_URL` | ❌ | Replit auto-provides PostgreSQL. Leave unset. |

## Notes

- The project's obfuscated files used a wrong base64 alphabet (lowercase-first vs standard). All 90 affected files were fixed with the correct `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=` alphabet.
- `guru/gmdFunctions2.js` was replaced with the open-source version provided by the user.
- Native addons (`sqlite3`, `better-sqlite3`) installed with `--ignore-scripts`; `sqlite3` prebuilt binary fetched via `prebuild-install`.
- `tar` dependency overridden to `^7.5.21` to bypass Replit security policy block on `tar@6.2.1`.

## User preferences

- Wants the bot running on Replit and open to making specific code changes.
