
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const util = require("util");
const zlib = require("zlib");
const sharp = require('sharp');
const config = require('../config');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { Readable } = require('stream');
ffmpeg.setFfmpegPath(ffmpegPath);

const sessionDir = path.join(__dirname, "session");
const sessionPath = path.join(sessionDir, "creds.json");


async function stickerToImage(webpData, options = {}) {
    try {
        const {
            upscale = true,
            targetSize = 512, 
            framesToProcess = 200
        } = options;

        if (Buffer.isBuffer(webpData)) {
            const sharpInstance = sharp(webpData, {
                sequentialRead: true,
                animated: true,
                limitInputPixels: false,
                pages: framesToProcess 
            });

            const metadata = await sharpInstance.metadata();
            const isAnimated = metadata.pages > 1 || metadata.hasAlpha;

            if (isAnimated) {
                return await sharpInstance
                    .gif({
                        compressionLevel: 0,
                        quality: 100,
                        effort: 1, 
                        loop: 0 
                    })
                    .resize({
                        width: upscale ? targetSize : metadata.width,
                        height: upscale ? targetSize : metadata.height,
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                        kernel: 'lanczos3' 
                    })
                    .toBuffer();
            } else {
                return await sharpInstance
                    .ensureAlpha()
                    .resize({
                        width: upscale ? targetSize : metadata.width,
                        height: upscale ? targetSize : metadata.height,
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                        kernel: 'lanczos3'
                    })
                    .png({
                        compressionLevel: 0,
                        quality: 100,
                        progressive: false,
                        palette: true
                    })
                    .toBuffer();
            }
        }
        else if (typeof webpData === 'string') {
            const outputPath = webpData.replace(/\.webp$/, isAnimated ? '.gif' : '.png');
            const sharpInstance = sharp(webpData, {
                sequentialRead: true,
                animated: true,
                limitInputPixels: false,
                pages: framesToProcess
            });

            const metadata = await sharpInstance.metadata();
            const isAnimated = metadata.pages > 1 || metadata.hasAlpha;

            if (isAnimated) {
                await sharpInstance
                    .gif({
                        compressionLevel: 0,
                        quality: 100,
                        effort: 1,
                        loop: 0
                    })
                    .resize({
                        width: upscale ? targetSize : metadata.width,
                        height: upscale ? targetSize : metadata.height,
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                        kernel: 'lanczos3'
                    })
                    .toFile(outputPath);
            } else {
                await sharpInstance
                    .ensureAlpha()
                    .resize({
                        width: upscale ? targetSize : metadata.width,
                        height: upscale ? targetSize : metadata.height,
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                        kernel: 'lanczos3'
                    })
                    .png({
                        compressionLevel: 0,
                        quality: 100,
                        progressive: false,
                        palette: true
                    })
                    .toFile(outputPath);
            }

            const imageBuffer = await fs.promises.readFile(outputPath);
            await fs.promises.unlink(outputPath);
            await fs.promises.unlink(webpData); 
            return imageBuffer;
        }
        else {
            throw new Error('Invalid input type for stickerToImage');
        }
    } catch (error) {
        console.error('Error in stickerToImage:', error);
        throw error;
    }
}

async function withTempFiles(inputBuffer, extension, processFn) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const tempInput = path.join(tempDir, `input_${uniqueId}.tmp`);
  const tempOutput = path.join(tempDir, `output_${uniqueId}.${extension}`);
  
  try {
    fs.writeFileSync(tempInput, inputBuffer);
    await processFn(tempInput, tempOutput);
    const outputBuffer = fs.readFileSync(tempOutput);
    return outputBuffer;
  } finally {
    try { if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput); } catch (e) {}
    try { if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput); } catch (e) {}
  }
}


async function toAudio(buffer) {
  return withTempFiles(buffer, 'mp3', (input, output) => {
    return new Promise((resolve, reject) => {
      const { execFile } = require('child_process');
      
      // First check if video has audio stream
      execFile(ffmpegPath, ['-i', input, '-hide_banner'], { timeout: 30000 }, (probeErr, probeOut, probeStderr) => {
        const hasAudio = probeStderr && (probeStderr.includes('Audio:') || probeStderr.includes('audio'));
        
        if (!hasAudio) {
          return reject(new Error('This video has no audio track to extract'));
        }
        
        execFile(ffmpegPath, [
          '-i', input,
          '-vn',
          '-acodec', 'libmp3lame',
          '-ab', '128k',
          '-ac', '2',
          '-y',
          output
        ], { timeout: 120000 }, (error, stdout, stderr) => {
          if (error) {
            console.error('FFmpeg toAudio error:', stderr || error.message);
            reject(error);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

async function toVideo(buffer) {
  return withTempFiles(buffer, 'mp4', (input, output) => {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input('color=black:s=640x360:r=1') 
        .inputOptions([
          '-f lavfi'
        ])
        .input(input)
        .outputOptions([
          '-shortest',
          '-preset ultrafast',
          '-movflags faststart',
          '-pix_fmt yuv420p'
        ])
        .videoCodec('libx264')
        .audioCodec('aac')
        .toFormat('mp4')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('end', resolve)
        .save(output);
    });
  });
}


async function toPtt(buffer) {
  const { execFile } = require('child_process');
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const inputPath = path.join(tempDir, `ptt_in_${timestamp}.tmp`);
  const outputPath = path.join(tempDir, `ptt_out_${timestamp}.ogg`);

  fs.writeFileSync(inputPath, buffer);

  const cleanup = () => {
    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  };

  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, [
      '-y', '-i', inputPath,
      '-c:a', 'libopus',
      '-b:a', '64k',
      '-ar', '48000',
      '-ac', '1',
      '-f', 'ogg',
      outputPath
    ], { timeout: 120000 }, (err) => {
      if (err) {
        cleanup();
        return reject(err);
      }
      try {
        const out = fs.readFileSync(outputPath);
        cleanup();
        resolve(out);
      } catch (e) { cleanup(); reject(e); }
    });
  });
}

async function waitForFileToStabilize(filePath, timeout = 500000) {
  let lastSize = -1;
  let stableCount = 0;
  const interval = 200;

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(async () => {
      try {
        const { size } = await fs.promises.stat(filePath);
        if (size === lastSize) {
          stableCount++;
          if (stableCount >= 3) {
            clearInterval(timer);
            return resolve();
          }
        } else {
          stableCount = 0;
          lastSize = size;
        }

        if (Date.now() - start > timeout) {
          clearInterval(timer);
          return reject(new Error("File stabilization timed out."));
        }
      } catch (err) {
        
      }
    }, interval);
  });
}

async function formatAudio(buffer) {
  const { execFile } = require('child_process');
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const timestamp = Date.now();
  const inputPath = path.join(tempDir, `aud_in${timestamp}.tmp`);
  const outputPath = path.join(tempDir, `aud_out${timestamp}.mp3`);

  fs.writeFileSync(inputPath, buffer);

  const cleanup = () => {
    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  };

  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, ['-y', '-i', inputPath, '-vn', '-c:a', 'copy', outputPath],
      { timeout: 30000 }, (err) => {
        if (!err) {
          try {
            const out = fs.readFileSync(outputPath);
            cleanup();
            return resolve(out);
          } catch (e) { cleanup(); return reject(e); }
        }
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        execFile(ffmpegPath, [
          '-y', '-i', inputPath, '-vn',
          '-c:a', 'libmp3lame', '-b:a', '128k', '-ac', '2', outputPath
        ], { timeout: 180000 }, (err2) => {
          if (err2) { cleanup(); return reject(err2); }
          try {
            const out = fs.readFileSync(outputPath);
            cleanup();
            resolve(out);
          } catch (e) { cleanup(); reject(e); }
        });
      });
  });
}


async function formatVideo(buffer) {
  const { execFile } = require('child_process');
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const timestamp = Date.now();
  const inputPath = path.join(tempDir, `vid_in${timestamp}.tmp`);
  const outputPath = path.join(tempDir, `vid_out${timestamp}.mp4`);

  fs.writeFileSync(inputPath, buffer);

  const cleanup = () => {
    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  };

  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, ['-y', '-i', inputPath, '-c', 'copy', '-movflags', '+faststart', outputPath],
      { timeout: 60000 }, (err) => {
        if (!err) {
          try {
            const out = fs.readFileSync(outputPath);
            cleanup();
            return resolve(out);
          } catch (e) { cleanup(); return reject(e); }
        }
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        execFile(ffmpegPath, [
          '-y', '-i', inputPath,
          '-map', '0:v:0',          // primary video stream only
          '-map', '0:a:0?',         // primary audio stream (optional — skip if broken)
          '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23',
          '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '44100',
          '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
          outputPath
        ], { timeout: 600000 }, (err2) => {
          if (err2) { cleanup(); return reject(err2); }
          try {
            const out = fs.readFileSync(outputPath);
            cleanup();
            resolve(out);
          } catch (e) { cleanup(); reject(e); }
        });
      });
  });
}


function monospace(input) {
    const boldz = {
         'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶',
        'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽',
        'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄',
        'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔',
        '7': '𝟕', '8': '𝟖', '9': '𝟗',
        ' ': ' ' 
    };
    return input.split('').map(char => boldz[char] || char).join('');
}

const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) {
    return (bytes * byteToGB).toFixed(2) + ' GB';
  } else if (bytes >= Math.pow(1024, 2)) {
    return (bytes * byteToMB).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes * byteToKB).toFixed(2) + ' KB';
  } else {
    return bytes.toFixed(2) + ' bytes';
  }
    }

async function loadSession() {
    try {
        if (fs.existsSync(sessionDir)) {
            const allFiles = fs.readdirSync(sessionDir);
            allFiles.forEach(f => {
                try { fs.unlinkSync(path.join(sessionDir, f)); } catch (e) {}
            });
        }

        if (!config.SESSION_ID || typeof config.SESSION_ID !== 'string') {
            throw new Error("❌ SESSION_ID is missing or invalid");
        }

        let sessionId = config.SESSION_ID;
        const [headerCheck, b64Check] = sessionId.split('~');

        if (headerCheck !== "Gifted" || !b64Check) {
            throw new Error("❌ Invalid session format. Expected 'Gifted~.....'");
        }

        if (!b64Check.startsWith('H4sI')) {
            const serverUrl = `https://session.giftedtech.co.ke/session/${b64Check}`;
            const res = await axios.get(serverUrl, { timeout: 15000 });
            const fetched = (res.data || '').toString().trim();
            if (!fetched.startsWith('Gifted~H4sI')) {
                throw new Error("❌ Session server returned invalid data");
            }
            sessionId = fetched;
        }

        const [header, b64data] = sessionId.split('~');

        if (header !== "Gifted" || !b64data) {
            throw new Error("❌ Invalid session format. Expected 'Gifted~.....'");
        }

        const cleanB64 = b64data.replace('...', '');
        const compressedData = Buffer.from(cleanB64, 'base64');
        const decompressedData = zlib.gunzipSync(compressedData);

        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        fs.writeFileSync(sessionPath, decompressedData, "utf8");
        console.log("✅ Session File Loaded");

    } catch (e) {
        console.error("❌ Session Error:", e.message);
        throw e;
    }
}

async function useSQLiteAuthState(databasePath) {
    const Database = require('better-sqlite3');
    const { proto, initAuthCreds, BufferJSON } = require('gifted-baileys');

    const dbPath = databasePath.endsWith('.db') ? databasePath : `${databasePath}/session.db`;
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const credsPath = path.join(path.dirname(dbPath), 'creds.json');
    let initialCreds = null;
    if (fs.existsSync(credsPath)) {
        try {
            const credsData = fs.readFileSync(credsPath, 'utf8');
            initialCreds = JSON.parse(credsData, BufferJSON.reviver);
        } catch (e) {
            console.error('Failed to read creds.json:', e.message);
        }
    }

    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
        CREATE TABLE IF NOT EXISTS session (
            id TEXT PRIMARY KEY,
            value TEXT
        )
    `);

    const readData = (id) => {
        const row = db.prepare('SELECT value FROM session WHERE id = ?').get(id);
        if (row) {
            return JSON.parse(row.value, BufferJSON.reviver);
        }
        return null;
    };

    const writeData = (id, value) => {
        db.prepare('INSERT OR REPLACE INTO session (id, value) VALUES (?, ?)').run(id, JSON.stringify(value, BufferJSON.replacer));
    };

    const removeData = (id) => {
        db.prepare('DELETE FROM session WHERE id = ?').run(id);
    };

    if (initialCreds) {
        writeData('creds', initialCreds);
        try {
            fs.unlinkSync(credsPath);
        } catch (e) {}
    }

    const creds = readData('creds') || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        const value = readData(`${type}-${id}`);
                        if (value) {
                            data[id] = value;
                        }
                    }
                    return data;
                },
                set: async (data) => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                writeData(key, value);
                            } else {
                                removeData(key);
                            }
                        }
                    }
                }
            }
        },
        saveCreds: () => {
            writeData('creds', creds);
        }
    };
}

const runtime = (seconds) => {
        seconds = Number(seconds)
        var d = Math.floor(seconds / (3600 * 24))
        var h = Math.floor(seconds % (3600 * 24) / 3600)
        var m = Math.floor(seconds % 3600 / 60)
        var s = Math.floor(seconds % 60)
        var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
        var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
        var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
        var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
        return dDisplay + hDisplay + mDisplay + sDisplay;
}

const sleep = async(ms) => {
        return new Promise(resolve => setTimeout(resolve, ms))
}

function gmdRandom(ext) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return path.join(tempDir, `${timestamp}_${random}${ext}`);
}

async function gmdFancy(text) {
    return new Promise((resolve, reject) => {
        axios.get('http://qaz.wtf/u/convert.cgi?text='+text)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = []
            $('table > tbody > tr').each(function (a, b) {
                hasil.push({ name: $(b).find('td:nth-child(1) > h6 > a').text(), result: $(b).find('td:nth-child(2)').text().trim() })
            }),
            resolve(hasil)
        })
    })
}

const gmdBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "GET",
            url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36",
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer',
            timeout: 2400000 // 24 mins😂
        });
        
        if (!res.data || res.data.length === 0) {
            throw new Error("Empty response data");
        }
        
        return res.data;
    } catch (err) {
        console.error("gmdBuffer Error:", err);
        return err;
    }
};

const gmdJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'Accept': 'application/json'
            },
            ...options,
            timeout: 2400000 // 24 mins😂
        });
        
        if (!res.data) {
            throw new Error("Empty response data");
        }
        
        return res.data;
    } catch (err) {
        console.error("gmdJson Error:", err);
        return err;
    }
};

const latestWaVersion = async () => {
    const get = await gmdJson("https://web.whatsapp.com/check-update?version=1&platform=web");
    const version = [get.currentVersion.replace(/[.]/g, ", ")];
    return version;
};

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi'));
};

const isNumber = (number) => {
    const int = parseInt(number);
    return typeof int === 'number' && !isNaN(int);
};

function verifyJidState(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Your verified', jid);
        return false;
    }
    console.log('Welcome to Gifted Md', jid);
    return true;
}

async function eBase(str = '') {
  return Buffer.from(str).toString('base64');
}

async function dBase(base64Str) {
  return Buffer.from(base64Str, 'base64').toString('utf-8');
}

async function eBinary(str = '') {
  return str.split('').map(char => char.charCodeAt(0).toString(2)).join(' ');
}

async function dBinary(str) {
  let newBin = str.split(" ");
  let binCode = [];
  for (let i = 0; i < newBin.length; i++) {
    binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
  }
  return binCode.join("");
}

class gmdStore {
    constructor() {
        this.messages = new Map();
        this.contacts = new Map();
        this.chats = new Map();
        this.maxMessages = 10000;
        this.maxChats = 5000;
        this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
    }

    loadMessage(jid, id) {
        const chatMessages = this.messages.get(jid);
        return chatMessages?.get(id) || null;
    }

    saveMessage(jid, message) {
        if (!this.messages.has(jid)) {
            this.messages.set(jid, new Map());
        }
        
        const chatMessages = this.messages.get(jid);
        chatMessages.set(message.key.id, message);
        
        if (chatMessages.size > this.maxMessages) {
            const firstKey = chatMessages.keys().next().value;
            chatMessages.delete(firstKey);
        }
    }

    cleanup() {
        try {
            if (this.messages.size > this.maxChats) {
                const chatsToDelete = this.messages.size - this.maxChats;
                const oldestChats = Array.from(this.messages.keys()).slice(0, chatsToDelete);
                oldestChats.forEach(jid => this.messages.delete(jid));
            }
            
         //   console.log(`🧹 Store cleanup: ${this.messages.size} chats in memory`);
        } catch (error) {
            console.error('Store cleanup error:', error);
        }
    }

    bind(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key?.remoteJid && msg.key?.id) {
                    this.saveMessage(msg.key.remoteJid, msg);
                }
            });
        });

        ev.on('chats.set', ({ chats }) => {
            chats.forEach(chat => {
                this.chats.set(chat.id, chat);
            });
        });

        ev.on('contacts.set', ({ contacts }) => {
            contacts.forEach(contact => {
                this.contacts.set(contact.id, contact);
            });
        });
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.messages.clear();
        this.contacts.clear();
        this.chats.clear();
    }
}

const { Sticker } = require("wa-sticker-formatter");
const { exec } = require("child_process");

function runFFmpeg(input, output, scale = 320, fps = 15, duration = 8) {
    return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -i "${input}" -vf "scale=${scale}:-1:force_original_aspect_ratio=decrease,fps=${fps}" -t ${duration} -an -vcodec libwebp -loop 0 -preset default -vsync 0 "${output}" -y`;
        exec(cmd, (err) => {
            if (err) reject(err);
            else resolve(output);
        });
    });
}

async function getVideoDuration(input) {
    return new Promise((resolve) => {
        ffmpeg.ffprobe(input, (err, metadata) => {
            if (!err && metadata?.format?.duration) {
                return resolve(parseFloat(metadata.format.duration));
            }
            exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                if (err || !stdout) {
                    return resolve(8);
                }
                resolve(parseFloat(stdout));
            });
        });
    });
}

async function gmdSticker(file, options) {
    let stickerBuffer;
    let attempts = 0;
    let scale = 320, fps = 15, quality = options.quality || 75;

    while (attempts < 15) { 
        const sticker = new Sticker(file, {
            ...options,
            quality
        });
        stickerBuffer = await sticker.toBuffer();
        if (stickerBuffer.length <= 512 * 1024) break;
        attempts++;
        quality = Math.max(40, quality - 15);
        fps = Math.max(8, fps - 2);
        scale = Math.max(180, scale - 60);
    }
    return stickerBuffer;
}

function copyFolderSync(source, target, excludeList = ['.env']) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);
        let shouldExclude = false;
        for (const excludePattern of excludeList) {
            if (item === excludePattern) {
                shouldExclude = true;
                break;
            }
            const relativePath = path.relative(source, srcPath);
            if (relativePath === excludePattern || relativePath.startsWith(excludePattern + path.sep)) {
                shouldExclude = true;
                break;
            }
        }
        if (shouldExclude) continue;
        const stat = fs.lstatSync(srcPath);
        if (stat.isDirectory()) {
            copyFolderSync(srcPath, destPath, excludeList);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const gitRepoRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\s\/]+)/i;

const MAX_MEDIA_SIZE = 50 * 1024 * 1024;

async function getFileSize(url) {
    try {
        const response = await axios.head(url, { timeout: 10000 });
        const contentLength = response.headers['content-length'];
        return contentLength ? parseInt(contentLength) : 0;
    } catch {
        return 0;
    }
}

function getMimeCategory(mimetype) {
    if (!mimetype) return 'document';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('image/')) return 'image';
    return 'document';
}

function getMimeFromUrl(url) {
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    const mimeMap = {
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
    };
    return mimeMap[ext] || 'application/octet-stream';
}

const MIME_EXTENSIONS = {
    'application/json': '.json',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/javascript': '.js',
    'text/plain': '.txt',
    'text/xml': '.xml',
    'application/xml': '.xml',
    'text/csv': '.csv',
    'text/markdown': '.md',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/gzip': '.gz',
    'application/x-tar': '.tar',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/x-icon': '.ico',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/flac': '.flac',
    'audio/aac': '.aac',
    'audio/m4a': '.m4a',
    'audio/webm': '.weba',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/avi': '.avi',
    'video/x-msvideo': '.avi',
    'video/quicktime': '.mov',
    'video/x-matroska': '.mkv',
    'video/3gpp': '.3gp',
    'application/octet-stream': '.bin',
    'application/x-executable': '.exe',
    'application/x-sh': '.sh',
    'application/x-python': '.py',
    'text/x-python': '.py',
    'application/x-httpd-php': '.php',
    'text/x-java-source': '.java',
    'text/x-c': '.c',
    'text/x-c++': '.cpp',
    'application/typescript': '.ts',
    'text/typescript': '.ts',
    'application/wasm': '.wasm',
    'font/woff': '.woff',
    'font/woff2': '.woff2',
    'font/ttf': '.ttf',
    'font/otf': '.otf',
    'application/vnd.android.package-archive': '.apk',
    'application/x-apple-diskimage': '.dmg',
    'application/x-debian-package': '.deb',
    'application/x-rpm': '.rpm',
    'application/sql': '.sql',
    'application/x-sqlite3': '.db',
    'application/yaml': '.yaml',
    'text/yaml': '.yaml',
    'application/toml': '.toml',
};

function getExtensionFromMime(contentType) {
    const baseMime = contentType.split(';')[0].trim().toLowerCase();
    if (MIME_EXTENSIONS[baseMime]) return MIME_EXTENSIONS[baseMime];
    
    for (const [mime, ext] of Object.entries(MIME_EXTENSIONS)) {
        if (baseMime.includes(mime.split('/')[1])) return ext;
    }
    
    if (baseMime.startsWith('text/')) return '.txt';
    if (baseMime.startsWith('image/')) return '.bin';
    if (baseMime.startsWith('audio/')) return '.bin';
    if (baseMime.startsWith('video/')) return '.bin';
    
    return '.bin';
}

function isTextContent(contentType) {
    const textTypes = [
        'text/', 'application/json', 'application/javascript', 'application/xml',
        'application/sql', 'application/yaml', 'application/toml', '+json', '+xml'
    ];
    return textTypes.some(t => contentType.includes(t));
}

module.exports = { dBinary, eBinary, dBase, eBase, runtime, sleep, gmdFancy, stickerToImage, toAudio, toVideo, toPtt, formatVideo, formatAudio, monospace, formatBytes, gmdBuffer, gmdJson, latestWaVersion, gmdRandom, isUrl, gmdStore, isNumber, loadSession, useSQLiteAuthState, verifyJidState, runFFmpeg, getVideoDuration, gmdSticker, copyFolderSync, gitRepoRegex, MAX_MEDIA_SIZE, getFileSize, getMimeCategory, getMimeFromUrl, MIME_EXTENSIONS, getExtensionFromMime, isTextContent };
