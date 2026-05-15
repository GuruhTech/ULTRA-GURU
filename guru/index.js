
const { evt, gmd, commands } = require('./gmdCmds');
const config = require('../config');

const { DATABASE, syncDatabase } = require('./database/database');
const { loadPersistedLidMappings, persistLidMapping } = require('./database/lidMapping');
const { UpdateDB, setCommitHash, getCommitHash } = require('./database/autoUpdate');
const { SudoDB, getSudoNumbers, setSudo, delSudo } = require('./database/sudo');
const { SettingsDB, initializeSettings, getSetting, setSetting, getAllSettings, resetSetting, resetAllSettings, DEFAULT_SETTINGS } = require('./database/settings');
const { GroupSettingsDB, initializeGroupSettings, getGroupSetting, setGroupSetting, getAllGroupSettings, resetGroupSetting, GROUP_SETTING_DEFAULTS } = require('./database/groupSettings');
const { createContext, createContext2 } = require('./gmdHelpers');
const { getMediaBuffer, getFileContentType, bufferToStream, uploadToGiftedCdn, uploadToGithubCdn, uploadToPixhost, uploadToImgBB, uploadToCatbox } = require('./gmdFunctions3');
const { logger, emojis, GiftedAutoReact, GiftedTechApi, GiftedApiKey, GiftedAntiLink, GiftedAntibad, GiftedAntiGroupMention, GiftedAutoBio, GiftedChatBot, GiftedPresence, GiftedAntiDelete, GiftedAnticall, GiftedAntiViewOnce, GiftedAntiEdit, setupVVTracker } = require('./gmdFunctions2');
const { handleGameMessage } = require('./gameHandler');
const { toAudio, toVideo, toPtt, formatVideo, formatAudio, monospace, runtime, sleep, gmdFancy, GiftedUploader, stickerToImage, formatBytes, gmdBuffer, webp2mp4File, gmdJson, latestWaVersion, gmdRandom, isUrl, gmdStore, isNumber, loadSession, useSQLiteAuthState, verifyJidState, runFFmpeg, getVideoDuration, gmdSticker, copyFolderSync, gitRepoRegex, MAX_MEDIA_SIZE, getFileSize, getMimeCategory, getMimeFromUrl, MIME_EXTENSIONS, getExtensionFromMime, isTextContent } = require('./gmdFunctions');

const { 
    groupCache, getGroupMetadata, updateGroupCache, deleteGroupCache, clearGroupCache, 
    setupGroupCacheListeners, cachedGroupMetadata, initializeLidStore, createSocketConfig, getLidMapping,
    safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler,
    standardizeJid, serializeMessage, downloadMediaMessage,
    loadPlugins, findCommand, findBodyCommand, createHelpers, getGroupInfo, buildSuperUsers,
    setupGroupEventsListeners, getProfilePic, getDisplayNumber
} = require('./connection');

module.exports = { 
    evt, gmd, config, emojis, commands, syncDatabase,
    toAudio, toVideo, toPtt, formatVideo, formatAudio,
    gitRepoRegex, MAX_MEDIA_SIZE, getFileSize, getMimeCategory, getMimeFromUrl, MIME_EXTENSIONS, getExtensionFromMime, isTextContent,
    uploadToGiftedCdn, uploadToGithubCdn, 
    UpdateDB, setCommitHash, getCommitHash, 
    runtime, sleep, gmdFancy, GiftedUploader, stickerToImage, monospace, formatBytes, 
    createContext, createContext2, 
    SudoDB, getSudoNumbers, setSudo, delSudo, 
    SettingsDB, initializeSettings, getSetting, setSetting, getAllSettings, resetSetting, resetAllSettings, DEFAULT_SETTINGS,
    GroupSettingsDB, initializeGroupSettings, getGroupSetting, setGroupSetting, getAllGroupSettings, resetGroupSetting, GROUP_SETTING_DEFAULTS, 
    GiftedTechApi, GiftedApiKey, 
    getMediaBuffer, getFileContentType, bufferToStream, uploadToPixhost, uploadToImgBB, uploadToCatbox, 
    GiftedAutoReact, GiftedChatBot, GiftedAntiLink, GiftedAntibad, GiftedAntiGroupMention, GiftedAntiDelete, GiftedAnticall, GiftedPresence, GiftedAutoBio, GiftedAntiViewOnce, GiftedAntiEdit, setupVVTracker, handleGameMessage, 
    logger, gmdBuffer, webp2mp4File, gmdJson, latestWaVersion, gmdRandom, isUrl, gmdStore, isNumber, loadSession, useSQLiteAuthState, verifyJidState,
    standardizeJid, serializeMessage, downloadMediaMessage,
    loadPlugins, findCommand, findBodyCommand, createHelpers, getGroupInfo, buildSuperUsers,
    groupCache, getGroupMetadata, updateGroupCache, deleteGroupCache, clearGroupCache, 
    setupGroupCacheListeners, cachedGroupMetadata, initializeLidStore, createSocketConfig, getLidMapping,
    safeNewsletterFollow, safeGroupAcceptInvite, setupConnectionHandler,
    setupGroupEventsListeners, getProfilePic, getDisplayNumber,
    runFFmpeg, getVideoDuration, gmdSticker, copyFolderSync,
    loadPersistedLidMappings, persistLidMapping
};
