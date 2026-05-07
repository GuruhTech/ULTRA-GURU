
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const ffmpegPath = (() => {
    try { return require('@ffmpeg-installer/ffmpeg').path; } catch (e) { return 'ffmpeg'; }
})();

const fluent = require('fluent-ffmpeg');
fluent.setFfmpegPath(ffmpegPath);

const { gmd, commands } = require('./gmdCmds');
const { getSetting, setSetting, getAllSettings, initializeSettings, DEFAULT_SETTINGS } = require('./database/settings');
const { initializeGroupSettings, getGroupSetting, setGroupSetting, getAllGroupSettings } = require('./database/groupSettings');
const { setSudo, delSudo, getSudoNumbers, isSuperUser } = require('./database/sudo');
const { setCommitHash, getCommitHash } = require('./database/autoUpdate');
const { saveAntiDelete, findAntiDelete, removeAntiDelete, startCleanup, SQLiteStore } = require('./database/messageStore');
const { getGroupMetadata, getLidMapping, cachedGroupMetadata, updateGroupCache } = require('./connection/groupCache');
const { standardizeJid, serializeMessage, downloadMediaMessage: _dlMedia } = require('./connection/serializer');
const { safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler, setupGroupEventsListeners } = require('./connection/connectionHandler');
const { loadPersistedLidMappings } = require('./database/lidMapping');

const GURU_SESSION_DIR = path.join(process.cwd(), 'guru', 'session');
const GURU_TEMP_DIR = path.join(process.cwd(), 'guru', 'temp');

[GURU_SESSION_DIR, GURU_TEMP_DIR].forEach(d => { try { fs.mkdirSync(d, { recursive: true }); } catch (e) {} });

const evt = {};
const logger = {
    info: (...a) => console.log('[INFO]', ...a),
    warn: (...a) => console.warn('[WARN]', ...a),
    error: (...a) => console.error('[ERROR]', ...a),
    debug: (...a) => {},
    trace: (...a) => {},
    child: () => logger,
    level: 'silent',
};

const emojis = ['🎖️', '✨', '🔥', '💯', '⚡', '🌟', '💎', '🚀', '🎯', '🏆'];

const GiftedTechApi = 'https://gifted-apis.onrender.com';
const GiftedApiKey = process.env.GIFTED_API_KEY || '';

const GiftedAutoReact = {};
const GiftedAntiLink = {};
const GiftedAntibad = {};
const GiftedAntiGroupMention = {};
const GiftedAutoBio = {};
const GiftedChatBot = {};
const GiftedAnticall = {};
const GiftedPresence = {};
const GiftedAntiDelete = {};
const GiftedAntiEdit = {};

async function handleGameMessage(Gifted, message, conText) {}

async function loadSession(sessionId) {
    const { useMultiFileAuthState } = require('gifted-baileys');
    const sessionPath = path.join(GURU_SESSION_DIR, sessionId || 'default');
    fs.mkdirSync(sessionPath, { recursive: true });
    return useMultiFileAuthState(sessionPath);
}

async function useSQLiteAuthState(sessionPath) {
    const { useMultiFileAuthState } = require('gifted-baileys');
    fs.mkdirSync(sessionPath, { recursive: true });
    return useMultiFileAuthState(sessionPath);
}

async function getMediaBuffer(message, type) {
    try {
        const { downloadMediaMessage } = require('gifted-baileys');
        return await downloadMediaMessage(message, 'buffer', {});
    } catch (e) {
        console.error('[getMediaBuffer]', e.message);
        return null;
    }
}

function getFileContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const map = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
        webp: 'image/webp', mp4: 'video/mp4', mp3: 'audio/mpeg', ogg: 'audio/ogg',
        opus: 'audio/ogg', pdf: 'application/pdf', txt: 'text/plain',
        webm: 'video/webm', aac: 'audio/aac', m4a: 'audio/mp4',
    };
    return map[ext] || 'application/octet-stream';
}

function bufferToStream(buffer) {
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

async function uploadToPixhost(buffer, ext = 'jpg') {
    try {
        const axios = require('axios');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('content', buffer, { filename: `file.${ext}`, contentType: getFileContentType(`file.${ext}`) });
        form.append('content_type', '0');
        const res = await axios.post('https://api.pixhost.to/images', form, { headers: form.getHeaders() });
        return res.data?.show_url || null;
    } catch (e) {
        return null;
    }
}

async function uploadToImgBB(buffer) {
    try {
        const axios = require('axios');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('image', buffer.toString('base64'));
        const apiKey = process.env.IMGBB_API_KEY || '';
        const res = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, form, { headers: form.getHeaders() });
        return res.data?.data?.url || null;
    } catch (e) {
        return null;
    }
}

async function uploadToGithubCdn(buffer, filename) {
    return null;
}

async function uploadToGiftedCdn(buffer, ext = 'bin') {
    try {
        const axios = require('axios');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', buffer, { filename: `upload.${ext}` });
        const res = await axios.post(`${GiftedTechApi}/api/upload`, form, { headers: form.getHeaders() });
        return res.data?.url || null;
    } catch (e) {
        return null;
    }
}

async function uploadToCatbox(buffer, ext = 'bin') {
    try {
        const axios = require('axios');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: `upload.${ext}`, contentType: getFileContentType(`upload.${ext}`) });
        const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        return typeof res.data === 'string' ? res.data.trim() : null;
    } catch (e) {
        return null;
    }
}

function gmdBuffer(ext = '.tmp') {
    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    return path.join(GURU_TEMP_DIR, name);
}

function gmdRandom(ext = '.tmp') {
    return gmdBuffer(ext);
}

function gmdJson(obj) {
    return JSON.stringify(obj, null, 2);
}

function gmdFancy(text) {
    return text;
}

function monospace(text) {
    return `\`\`\`${text}\`\`\``;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function ffmpegProcess(inputPath, outputPath, args = []) {
    return new Promise((resolve, reject) => {
        let cmd = fluent(inputPath).outputOptions(args).output(outputPath);
        cmd.on('end', resolve).on('error', reject).run();
    });
}

async function runFFmpeg(inputPath, outputPath, width, fps, duration) {
    return new Promise((resolve, reject) => {
        let cmd = fluent(inputPath);
        if (width) cmd = cmd.size(`${width}x?`);
        if (fps) cmd = cmd.outputFps(fps);
        if (duration) cmd = cmd.duration(duration);
        cmd.output(outputPath).on('end', resolve).on('error', reject).run();
    });
}

async function getVideoDuration(filePath) {
    return new Promise((resolve) => {
        fluent.ffprobe(filePath, (err, meta) => {
            if (err || !meta) return resolve(null);
            resolve(meta.format?.duration || null);
        });
    });
}

async function toAudio(buffer, inputFormat = 'mp4') {
    const inputFile = gmdBuffer(`.${inputFormat}`);
    const outputFile = gmdBuffer('.mp3');
    try {
        fs.writeFileSync(inputFile, buffer);
        await new Promise((resolve, reject) => {
            fluent(inputFile).toFormat('mp3').audioBitrate(128).output(outputFile).on('end', resolve).on('error', reject).run();
        });
        return fs.readFileSync(outputFile);
    } finally {
        [inputFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
    }
}

async function toPtt(buffer, inputFormat = 'mp4') {
    const inputFile = gmdBuffer(`.${inputFormat}`);
    const outputFile = gmdBuffer('.ogg');
    try {
        fs.writeFileSync(inputFile, buffer);
        await new Promise((resolve, reject) => {
            fluent(inputFile).toFormat('ogg').audioCodec('libopus').output(outputFile).on('end', resolve).on('error', reject).run();
        });
        return fs.readFileSync(outputFile);
    } finally {
        [inputFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
    }
}

async function toVideo(buffer, inputFormat = 'mp4') {
    const inputFile = gmdBuffer(`.${inputFormat}`);
    const outputFile = gmdBuffer('.mp4');
    try {
        fs.writeFileSync(inputFile, buffer);
        await new Promise((resolve, reject) => {
            fluent(inputFile).toFormat('mp4').output(outputFile).on('end', resolve).on('error', reject).run();
        });
        return fs.readFileSync(outputFile);
    } finally {
        [inputFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
    }
}

async function formatAudio(buffer) {
    try {
        const inputFile = gmdBuffer('.mp3');
        const outputFile = gmdBuffer('.mp3');
        fs.writeFileSync(inputFile, buffer);
        await new Promise((resolve, reject) => {
            fluent(inputFile).toFormat('mp3').audioBitrate(128).output(outputFile).on('end', resolve).on('error', reject).run();
        });
        const result = fs.readFileSync(outputFile);
        [inputFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
        return result;
    } catch (e) {
        return buffer;
    }
}

async function formatVideo(buffer) {
    try {
        const inputFile = gmdBuffer('.mp4');
        const outputFile = gmdBuffer('.mp4');
        fs.writeFileSync(inputFile, buffer);
        await new Promise((resolve, reject) => {
            fluent(inputFile).toFormat('mp4').output(outputFile).on('end', resolve).on('error', reject).run();
        });
        const result = fs.readFileSync(outputFile);
        [inputFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
        return result;
    } catch (e) {
        return buffer;
    }
}

async function gmdSticker(filePath, options = {}) {
    try {
        const { Sticker, StickerTypes } = require('wa-sticker-formatter');
        const sticker = new Sticker(filePath, {
            pack: options.packname || options.pack || 'ULTRA GURU',
            author: options.author || 'GURUTECH',
            type: options.type || StickerTypes.FULL,
            quality: options.quality || 70,
        });
        return await sticker.toBuffer();
    } catch (e) {
        console.error('[gmdSticker]', e.message);
        return fs.readFileSync(filePath);
    }
}

async function stickerToImage(buffer) {
    const inputFile = gmdBuffer('.webp');
    const outputFile = gmdBuffer('.png');
    try {
        fs.writeFileSync(inputFile, buffer);
        await new Promise((resolve, reject) => {
            fluent(inputFile).toFormat('png').output(outputFile).on('end', resolve).on('error', reject).run();
        });
        return fs.readFileSync(outputFile);
    } finally {
        [inputFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
    }
}

function verifyJidState(jid) {
    if (!jid) return false;
    return jid.includes('@s.whatsapp.net') || jid.includes('@g.us') || jid.includes('@newsletter') || jid.includes('@lid');
}

async function initializeLidStore(Gifted) {
    try {
        await loadPersistedLidMappings();
    } catch (e) {
        console.error('[initializeLidStore]', e.message);
    }
}

async function syncDatabase() {
    try {
        const { DATABASE } = require('./database/database');
        await DATABASE.sync({ alter: true });
        console.log('✅ Database synced');
    } catch (e) {
        console.error('[syncDatabase]', e.message);
    }
}

async function loadPlugins(pluginDir) {
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            require(path.join(pluginDir, file));
        } catch (e) {
            console.error(`[loadPlugins] Failed to load ${file}:`, e.message);
        }
    }
}

function findCommand(text, prefix) {
    if (!text || !prefix) return null;
    if (!text.startsWith(prefix)) return null;
    const body = text.slice(prefix.length).trim();
    const cmdName = body.split(' ')[0].toLowerCase();
    return commands.find(cmd =>
        cmd.pattern === cmdName ||
        (cmd.aliases && cmd.aliases.includes(cmdName))
    ) || null;
}

function findBodyCommand(body) {
    if (!body) return null;
    return commands.find(cmd =>
        cmd.pattern === body ||
        (cmd.aliases && cmd.aliases.includes(body))
    ) || null;
}

function createHelpers(Gifted, message, settings = {}) {
    return { Gifted, message, settings };
}

async function getGroupInfo(Gifted, jid) {
    return getGroupMetadata(jid, Gifted);
}

async function buildSuperUsers() {
    const numbers = await getSudoNumbers();
    return numbers;
}

function createSocketConfig(version, state, loggerInstance) {
    const { Browsers } = require('gifted-baileys');
    return {
        auth: state,
        version,
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        logger: loggerInstance || logger,
    };
}

function createContext(message, Gifted, settings = {}) {
    return { message, Gifted, settings };
}

function createContext2(message, Gifted, settings = {}) {
    return createContext(message, Gifted, settings);
}

const gitRepoRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\s?#]+)/i;
const MAX_MEDIA_SIZE = 100 * 1024 * 1024;

async function getFileSize(url) {
    try {
        const axios = require('axios');
        const res = await axios.head(url, { timeout: 10000 });
        return parseInt(res.headers['content-length'] || '0');
    } catch (e) {
        return 0;
    }
}

function getMimeCategory(mime) {
    if (!mime) return 'unknown';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime === 'application/pdf') return 'document';
    return 'document';
}

async function getMimeFromUrl(url) {
    try {
        const axios = require('axios');
        const res = await axios.head(url, { timeout: 10000 });
        return res.headers['content-type']?.split(';')[0]?.trim() || null;
    } catch (e) {
        return null;
    }
}

function getExtensionFromMime(mime) {
    const map = {
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp',
        'video/mp4': 'mp4', 'video/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg',
        'audio/mp4': 'm4a', 'application/pdf': 'pdf', 'text/plain': 'txt',
    };
    return map[mime] || 'bin';
}

function isTextContent(mime) {
    if (!mime) return false;
    return mime.startsWith('text/') || mime === 'application/json';
}

module.exports = {
    evt,
    logger,
    emojis,
    commands,
    gmd,
    setSudo,
    delSudo,
    GiftedTechApi,
    GiftedApiKey,
    GiftedAutoReact,
    GiftedAntiLink,
    GiftedAntibad,
    GiftedAntiGroupMention,
    GiftedAutoBio,
    handleGameMessage,
    GiftedChatBot,
    loadSession,
    useSQLiteAuthState,
    getMediaBuffer,
    getSudoNumbers,
    getFileContentType,
    bufferToStream,
    uploadToPixhost,
    uploadToImgBB,
    setCommitHash,
    getCommitHash,
    gmdBuffer,
    gmdJson,
    formatAudio,
    formatVideo,
    toAudio,
    uploadToGithubCdn,
    uploadToGiftedCdn,
    uploadToCatbox,
    GiftedAnticall,
    createContext,
    createContext2,
    verifyJidState,
    GiftedPresence,
    GiftedAntiDelete,
    GiftedAntiEdit,
    syncDatabase,
    initializeSettings,
    initializeGroupSettings,
    getAllSettings,
    DEFAULT_SETTINGS,
    standardizeJid,
    serializeMessage,
    loadPlugins,
    findCommand,
    findBodyCommand,
    createHelpers,
    getGroupInfo,
    buildSuperUsers,
    getGroupMetadata,
    createSocketConfig,
    safeNewsletterFollow,
    safeGroupAcceptInvite,
    setupConnectionHandler,
    setupGroupEventsListeners,
    initializeLidStore,
    saveAntiDelete,
    findAntiDelete,
    removeAntiDelete,
    startCleanup,
    SQLiteStore,
    gmdRandom,
    gmdFancy,
    gmdBuffer,
    monospace,
    formatBytes,
    runFFmpeg,
    getVideoDuration,
    toAudio,
    toPtt,
    toVideo,
    gmdSticker,
    stickerToImage,
    formatAudio,
    formatVideo,
    getLidMapping,
    getGroupMetadata,
    getSetting,
    setSetting,
    getExtensionFromMime,
    getMimeFromUrl,
    getMimeCategory,
    getFileSize,
    isTextContent,
    gitRepoRegex,
    MAX_MEDIA_SIZE,
    bufferToStream,
    cachedGroupMetadata,
    updateGroupCache,
    isSuperUser,
    loadPersistedLidMappings,
};
