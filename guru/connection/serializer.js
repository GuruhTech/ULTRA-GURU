var _0x89f2f7=(function(_0xe64f18,_0x5d5bd6){return !![]}());var _0x4ae933=function(){return ![]};
const { getContentType, downloadContentFromMessage, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { getLidMapping } = require('./groupCache');
const _0x4aadbd = (jid) => {
    if (!jid) return '';
    try {
        jid = typeof jid === '\x73\x74\x72\x69\x6e\x67' ? jid : 
            (jid.decodeJid ? jid.decodeJid() : String(jid));
        jid = jid.split(':')[0].split('/')[0];
        if (!jid.includes('@')) {
            jid += '@s.whatsapp.net';
        } else if (jid.endsWith('@lid')) {
            return jid.toLowerCase();
        }
        return jid.toLowerCase();
    } catch (e) {
        console.error('\x4a\x49\x44\x20\x73\x74\x61\x6e\x64\x61\x72\x64\x69\x7a\x61\x74\x69\x6f\x6e\x20\x65\x72\x72\x6f\x72\x3a', e);
        return '';
    }
};
const _0x1077b6 = (lid) => {
    if (!lid) return '';
    if (!lid.endsWith('@lid')) return lid;
    const _0xffdfa5 = getLidMapping(lid);
    if (_0xffdfa5) return _0xffdfa5;
    return lid;
};
const _0x10261e = async (ms, Gifted, settings = {}) => {
    if (!ms?.message || !ms?.key) return null;
    const _0x2262c9 = _0x4aadbd(Gifted.user?.id);
    const _0x0d0625 = getContentType(ms.message);
    const _0x76f158 = 
        ms.message?.extendedTextMessage?.contextInfo?.entryPointConversionApp === '\x77\x68\x61\x74\x73\x61\x70\x70' ||
        ms.message?.imageMessage?.contextInfo?.entryPointConversionApp === '\x77\x68\x61\x74\x73\x61\x70\x70' ||
        ms.message?.videoMessage?.contextInfo?.entryPointConversionApp === '\x77\x68\x61\x74\x73\x61\x70\x70' ||
        ms.message?.documentMessage?.contextInfo?.entryPointConversionApp === '\x77\x68\x61\x74\x73\x61\x70\x70' ||
        ms.message?.audioMessage?.contextInfo?.entryPointConversionApp === '\x77\x68\x61\x74\x73\x61\x70\x70';
    const _0xe71ac7 = _0x76f158 && ms.key.remoteJid.endsWith('@lid') && ms.key.fromMe;
    const _0x067773 = _0xe71ac7 ? _0x2262c9 : _0x4aadbd(ms.key.remoteJid);
    const _0xc46194 = _0x067773.endsWith('@g.us');
    const _0xcd6381 = ms.key.fromMe 
        ? (Gifted.user.id.split(':')[0] + '@s.whatsapp.net' || Gifted.user.id) 
        : (ms.key.senderPn || ms.key.participantPn || ms.key.participantAlt || ms.key.remoteJidAlt || ms.key.remoteJid || ms.key.participant);
    let _0x2660dd = '';
    let _0x5fb6b0 = false;
    let _0x546284 = null;
    if (ms.message?.interactiveResponseMessage) {
        _0x5fb6b0 = true;
        try {
            const _0xabb699 = ms.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
            if (_0xabb699) {
                _0x546284 = JSON.parse(_0xabb699)?.id || null;
            }
        } catch (e) {
            _0x546284 = null;
        }
        if (!_0x546284) {
            _0x546284 = ms.message.interactiveResponseMessage.buttonId || null;
        }
        _0x2660dd = _0x546284 || ms.message.interactiveResponseMessage?.body?.text || '';
    } else if (ms.message?.buttonsResponseMessage?.selectedButtonId) {
        _0x5fb6b0 = true;
        _0x546284 = ms.message.buttonsResponseMessage.selectedButtonId;
        _0x2660dd = _0x546284;
    } else if (ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
        _0x5fb6b0 = true;
        _0x546284 = ms.message.listResponseMessage.singleSelectReply.selectedRowId;
        _0x2660dd = _0x546284;
    } else if (ms.message?.templateButtonReplyMessage?.selectedId) {
        _0x5fb6b0 = true;
        _0x546284 = ms.message.templateButtonReplyMessage.selectedId;
        _0x2660dd = _0x546284;
    } else if (_0x0d0625 === '\x63\x6f\x6e\x76\x65\x72\x73\x61\x74\x69\x6f\x6e') {
        _0x2660dd = ms.message.conversation;
    } else if (_0x0d0625 === '\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65') {
        _0x2660dd = ms.message.extendedTextMessage.text;
    } else if (_0x0d0625 === '\x69\x6d\x61\x67\x65\x4d\x65\x73\x73\x61\x67\x65' && ms.message.imageMessage.caption) {
        _0x2660dd = ms.message.imageMessage.caption;
    } else if (_0x0d0625 === '\x76\x69\x64\x65\x6f\x4d\x65\x73\x73\x61\x67\x65' && ms.message.videoMessage.caption) {
        _0x2660dd = ms.message.videoMessage.caption;
    }
    const _0x0737ae = settings.PREFIX || '.';
    const _0x9cdab9 = _0x2660dd.startsWith(_0x0737ae);
    const _0xf5832f = _0x9cdab9 ? _0x2660dd.slice(_0x0737ae.length).trim().split(' ').shift().toLowerCase() : '';
    const _0x9e7796 = typeof _0x2660dd === '\x73\x74\x72\x69\x6e\x67' ? _0x2660dd.trim().split(/\s+/).slice(1) : [];
    const _0x04a238 = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    const _0x7cf153 = _0x0d0625 == '\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65' && 
        ms.message.extendedTextMessage.contextInfo != null 
        ? ms.message.extendedTextMessage.contextInfo.quotedMessage || [] 
        : [];
    const _0x9bdfc8 = (ms.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).map(_0x4aadbd);
    const _0x67bbd5 = ms.mtype === '\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65' && ms.message.extendedTextMessage.contextInfo != null
        ? ms.message.extendedTextMessage.contextInfo.mentionedJid
        : [];
    const _0x0ec392 = ms.message?.extendedTextMessage?.contextInfo || 
        ms.message?.imageMessage?.contextInfo ||
        ms.message?.videoMessage?.contextInfo ||
        ms.message?.audioMessage?.contextInfo ||
        ms.message?.documentMessage?.contextInfo ||
        ms.message?.stickerMessage?.contextInfo || null;
    const _0x6f8d40 = _0x0ec392?.quotedMessage || null;
    const _0xb0fa42 = _0x0ec392?.participant || _0x0ec392?.remoteJid;
    const _0x353365 = _0x1077b6(_0x4aadbd(_0xb0fa42));
    const _0x3ea777 = _0x1077b6(_0x4aadbd(_0x0ec392?.participant));
    const _0x249cf7 = _0x0ec392?.stanzaId || null;
    const _0x6e1791 = _0x249cf7 ? {
        remoteJid: _0x067773,
        fromMe: _0xb0fa42 === _0x2262c9 || _0x0ec392?.participant === _0x2262c9,
        id: _0x249cf7,
        participant: _0xc46194 ? _0xb0fa42 : undefined
    } : null;
    let _0xf61898 = _0xc46194 
        ? _0x4aadbd(ms.key.participant || ms.participant || _0x067773)
        : _0x067773;
    if (ms.key.fromMe) _0xf61898 = _0x2262c9;
    const _0xeaed0e = _0x9bdfc8.length > 0 
        ? _0x9bdfc8[0] 
        : _0x04a238 
            ? _0x3ea777 
            : '';
    return {
        ms,
        mek: ms,
        _0x0d0625,
        _0x067773,
        _0xc46194,
        sender: _0xcd6381,
        _0x2262c9,
        _0x2660dd,
        _0x9cdab9,
        _0xf5832f,
        _0x9e7796,
        q: _0x9e7796.join(' '),
        pushName: ms.pushName || (ms.key.fromMe ? Gifted.user?.name : null) || '𝐀𝐓𝐀𝐒𝐒𝐀\x2d𝐌𝐃\x20\x55\x73\x65\x72',
        _0x7cf153,
        _0x04a238,
        _0x9bdfc8,
        _0x67bbd5,
        _0x6f8d40,
        _0x6e1791,
        _0x353365,
        _0x3ea777,
        _0xf61898,
        _0xeaed0e,
        prefix: _0x0737ae,
        _0x5fb6b0,
        _0x546284
    };
};
module.exports = {
    _0x4aadbd,
    _0x1077b6,
    _0x10261e,
    downloadMediaMessage
};
