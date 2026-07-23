// ════════════════════════════════════════════════════════════════════════════
//  GURU CORE — Central Export Hub
// ════════════════════════════════════════════════════════════════════════════

"use strict";

// ─── Command Bus ─────────────────────────────────────────────────────────────
const { evt, gmd, commands } = require("./gmdCmds");

// ─── Config ──────────────────────────────────────────────────────────────────
const config = require("./config");

// ─── Database Modules ────────────────────────────────────────────────────────
const { DATABASE, syncDatabase }                        = require("./database/database");
const { loadPersistedLidMappings, persistLidMapping }   = require("./database/lidMapping");
const { UpdateDB, setCommitHash, getCommitHash }        = require("./database/autoUpdate");
const { SudoDB, getSudoNumbers, setSudo, delSudo }      = require("./database/sudo");

const {
    SettingsDB, initializeSettings, getSetting, setSetting,
    getAllSettings, resetSetting, resetAllSettings, DEFAULT_SETTINGS,
} = require("./database/settings");

const {
    GroupSettingsDB, initializeGroupSettings, getGroupSetting,
    setGroupSetting, getAllGroupSettings, resetGroupSetting, GROUP_SETTING_DEFAULTS,
} = require("./database/groupSettings");

// ─── Helpers & Context ───────────────────────────────────────────────────────
const { createContext, createContext2, createFakeContact } = require("./gmdHelpers");

// ─── Media & Upload Utilities ────────────────────────────────────────────────
const {
    getMediaBuffer, getFileContentType, bufferToStream,
    uploadToGuruCdn, uploadToGithubCdn,
    uploadToPixhost, uploadToImgBB, uploadToCatbox,
} = require("./gmdFunctions3");

// ─── Core Functions & Event Handlers ─────────────────────────────────────────
const {
    logger, emojis,
    GuruAutoReact, GuruTechApi, GuruApiKey,
    GuruAntiLink, GuruAntibad, GuruAntiBot, GuruAntiGroupMention,
    GuruAutoBio, GuruChatBot, GuruPresence,
    GuruAntiDelete, GuruAnticall, GuruAntiViewOnce, GuruAntiEdit,
    setupVVTracker, GuruAntiSticker,
} = require("./gmdFunctions2");

const { handleGameMessage } = require("./gameHandler");

const {
    toAudio, toVideo, toPtt, formatVideo, formatAudio,
    monospace, runtime, sleep, gmdFancy,
    GuruUploader, stickerToImage, formatBytes,
    gmdBuffer, webp2mp4File, gmdJson, latestWaVersion,
    gmdRandom, isUrl, gmdStore, isNumber,
    loadSession, useSQLiteAuthState, verifyJidState,
    runFFmpeg, getVideoDuration, gmdSticker, copyFolderSync,
    gitRepoRegex, MAX_MEDIA_SIZE, getFileSize,
    getMimeCategory, getMimeFromUrl, MIME_EXTENSIONS,
    getExtensionFromMime, isTextContent,
} = require("./gmdFunctions");

// ─── Connection Layer ─────────────────────────────────────────────────────────
const {
    groupCache, getGroupMetadata, updateGroupCache, deleteGroupCache, clearGroupCache,
    setupGroupCacheListeners, cachedGroupMetadata,
    initializeLidStore, createSocketConfig, getLidMapping,
    safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler,
    standardizeJid, serializeMessage, downloadMediaMessage,
    loadPlugins, findCommand, findBodyCommand, createHelpers,
    getGroupInfo, buildSuperUsers,
    setupGroupEventsListeners, getProfilePic, getDisplayNumber,
} = require("./connection");

// ════════════════════════════════════════════════════════════════════════════
//  EXPORTS
// ════════════════════════════════════════════════════════════════════════════

module.exports = {

    // Command bus
    evt, gmd, commands,

    // Config
    config,

    // Database — core
    DATABASE, syncDatabase,
    loadPersistedLidMappings, persistLidMapping,
    UpdateDB, setCommitHash, getCommitHash,

    // Database — sudo
    SudoDB, getSudoNumbers, setSudo, delSudo,

    // Database — settings
    SettingsDB, initializeSettings, getSetting, setSetting,
    getAllSettings, resetSetting, resetAllSettings, DEFAULT_SETTINGS,

    // Database — group settings
    GroupSettingsDB, initializeGroupSettings, getGroupSetting,
    setGroupSetting, getAllGroupSettings, resetGroupSetting, GROUP_SETTING_DEFAULTS,

    // Context / helpers
    createContext, createContext2, createFakeContact,
    emojis, logger,

    // Media utilities
    getMediaBuffer, getFileContentType, bufferToStream,
    uploadToGuruCdn, uploadToGithubCdn,
    uploadToPixhost, uploadToImgBB, uploadToCatbox,

    // API keys
    GuruTechApi, GuruApiKey,

    // Bot event functions
    GuruAutoReact, GuruAntiLink, GuruAntibad, GuruAntiBot,
    GuruAntiGroupMention, GuruAutoBio, GuruChatBot, GuruPresence,
    GuruAntiDelete, GuruAnticall, GuruAntiViewOnce, GuruAntiEdit,
    setupVVTracker, GuruAntiSticker,

    // Games
    handleGameMessage,

    // Format / transform
    toAudio, toVideo, toPtt, formatVideo, formatAudio,
    monospace, runtime, sleep, gmdFancy,
    GuruUploader, stickerToImage, formatBytes,
    gmdBuffer, webp2mp4File, gmdJson, gmdRandom, gmdStore, gmdSticker,
    latestWaVersion, isUrl, isNumber,
    loadSession, useSQLiteAuthState, verifyJidState,
    runFFmpeg, getVideoDuration, copyFolderSync,
    gitRepoRegex, MAX_MEDIA_SIZE, getFileSize,
    getMimeCategory, getMimeFromUrl, MIME_EXTENSIONS,
    getExtensionFromMime, isTextContent,

    // Connection
    groupCache, getGroupMetadata, updateGroupCache,
    deleteGroupCache, clearGroupCache,
    setupGroupCacheListeners, cachedGroupMetadata,
    initializeLidStore, createSocketConfig, getLidMapping,
    safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler,
    standardizeJid, serializeMessage, downloadMediaMessage,
    loadPlugins, findCommand, findBodyCommand,
    createHelpers, getGroupInfo, buildSuperUsers,
    setupGroupEventsListeners, getProfilePic, getDisplayNumber,
};
