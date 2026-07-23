const fs = require('fs-extra');
const path = require('path');
const { evt, commands } = require('../gmdCmds');
const { standardizeJid } = require('./serializer');
const { getGroupMetadata, getLidMapping } = require('./groupCache');

const _compileAsJs = function (module, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    module._compile(content, filename);
};
require.extensions['.gmd']     = _compileAsJs;
require.extensions['.kasongo'] = _compileAsJs;
require.extensions['.amd']     = _compileAsJs;
require.extensions['.ultra']   = _compileAsJs;
require.extensions['.guru']    = _compileAsJs;

const _pluginExts = new Set(['.js', '.gmd', '.kasongo', '.amd', '.ultra', '.guru']);

const loadPlugins = (pluginsPath) => {
    try {
        fs.readdirSync(pluginsPath).forEach((fileName) => {
            const ext = path.extname(fileName).toLowerCase();
            if (_pluginExts.has(ext)) {
                console.log(`  … loading plugin: ${fileName}`);
                try {
                    require(path.join(pluginsPath, fileName));
                } catch (e) {
                    console.error(`Failed to load ${fileName}: ${e.message}`);
                }
            }
        });
    } catch (error) {
        console.error('Error reading plugins folder:', error.message);
    }
};

const findCommand = (cmd) => {
    if (!Array.isArray(evt.commands)) return null;
    return evt.commands.find((c) => (
        c?.pattern === cmd || 
        (Array.isArray(c?.aliases) && c.aliases.includes(cmd))
    ));
};

const findBodyCommand = (body) => {
    if (!Array.isArray(evt.commands) || !body) return null;
    return evt.commands.find((c) => {
        if (c?.on === 'body') {
            if (typeof c.pattern === 'string') {
                return body.toLowerCase().includes(c.pattern.toLowerCase());
            }
            if (c.pattern instanceof RegExp) {
                return c.pattern.test(body);
            }
        }
        return false;
    });
};

const createHelpers = (Guru, ms, from, botName, senderJid, senderName) => {
    const _botName  = botName   || 'ULTRA GURU MD';
    const _phone    = (senderJid || '').replace(/@s\.whatsapp\.net|@c\.us/g, '').replace(/\D/g, '');
    const _name     = senderName || (_phone ? `+${_phone}` : _botName);

    const _vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${_name}`,
        `ORG:${_botName};`,
        ...(_phone ? [`TEL;type=CELL;type=VOICE;waid=${_phone}:+${_phone}`] : []),
        'END:VCARD',
    ].join('\n');

    const _fkontak = {
        key: {
            participant: '0@s.whatsapp.net',
            remoteJid: from,
            fromMe: false,
            id: `WA_${Date.now()}`,
        },
        messageTimestamp: Math.floor(Date.now() / 1000),
        pushName: 'WhatsApp Business',
        message: {
            contactMessage: {
                displayName: _name,
                vcard: _vcard,
            },
        },
        participant: '0@s.whatsapp.net',
    };

    const reply = (text) => {
        Guru.sendMessage(from, { text }, { quoted: _fkontak });
    };

    const react = async (emoji) => {
        if (typeof emoji !== 'string') return;
        try {
            await Guru.sendMessage(from, {
                react: { key: ms.key, text: emoji }
            });
        } catch (err) {
            console.error('Reaction error:', err);
        }
    };

    const edit = async (text, message) => {
        if (typeof text !== 'string') return;
        try {
            await Guru.sendMessage(from, {
                text: text,
                edit: message.key
            }, { quoted: _fkontak });
        } catch (err) {
            console.error('Edit error:', err);
        }
    };

    const del = async (message) => {
        if (!message?.key) return;
        try {
            await Guru.sendMessage(from, {
                delete: message.key
            }, { quoted: ms });
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    return { reply, react, edit, del };
};

const getGroupInfo = async (Guru, from, botId, sender) => {
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) {
        return {
            groupInfo: null,
            groupName: '',
            participants: [],
            groupAdmins: [],
            groupSuperAdmins: [],
            isBotAdmin: false,
            isAdmin: false,
            isSuperAdmin: false,
            sender
        };
    }

    const groupInfo = await getGroupMetadata(Guru, from);
    if (!groupInfo || !groupInfo.participants) {
        return {
            groupInfo: null,
            groupName: '',
            participants: [],
            groupAdmins: [],
            groupSuperAdmins: [],
            isBotAdmin: false,
            isAdmin: false,
            isSuperAdmin: false,
            sender
        };
    }

    const participants = groupInfo.participants.map(p => p.pn || p.phoneNumber || p.id);
    const groupAdmins = groupInfo.participants.filter(p => p.admin === 'admin').map(p => p.pn || p.phoneNumber || p.id);
    const groupSuperAdmins = groupInfo.participants.filter(p => p.admin === 'superadmin').map(p => p.pn || p.phoneNumber || p.id);
    
    const senderLid = standardizeJid(sender);
    const found = groupInfo.participants.find(p => p.id === senderLid || p.pn === senderLid || p.phoneNumber === senderLid);
    let resolvedSender = found?.pn || found?.phoneNumber || found?.id || sender;
    if (resolvedSender.endsWith('@lid')) {
        const mapped = getLidMapping(resolvedSender);
        if (mapped) resolvedSender = mapped;
    }
    
    const isBotAdmin = groupAdmins.includes(standardizeJid(botId)) || groupSuperAdmins.includes(standardizeJid(botId));
    const isAdmin = groupAdmins.includes(resolvedSender);
    const isSuperAdmin = groupSuperAdmins.includes(resolvedSender);

    return {
        groupInfo,
        groupName: groupInfo.subject || '',
        participants,
        groupAdmins,
        groupSuperAdmins,
        isBotAdmin,
        isAdmin,
        isSuperAdmin,
        sender: resolvedSender
    };
};

const buildSuperUsers = async (settings, getSudoNumbers, botId, ownerNumber) => {
    const devNumbers = ('254762025340,254763986398,254116284050,254105521300,254707525158')
        .split(',')
        .map(num => num.trim().replace(/\D/g, ''))
        .filter(num => num.length > 5);

    const sudoNumbersFromFile = await getSudoNumbers() || [];
    const sudoNumbersSetting = settings.SUDO_NUMBERS || '';
    const sudoNumbers = (sudoNumbersSetting ? sudoNumbersSetting.split(',') : [])
        .map(num => num.trim().replace(/\D/g, ''))
        .filter(num => num.length > 5);

    const botJid = standardizeJid(botId);
    const ownerJid = standardizeJid(ownerNumber.replace(/\D/g, ''));
    
    const superUser = [
        ownerJid,
        botJid,
        ...(sudoNumbers || []).map(num => `${num}@s.whatsapp.net`),
        ...(devNumbers || []).map(num => `${num}@s.whatsapp.net`),
        ...(sudoNumbersFromFile || []).map(num => `${num}@s.whatsapp.net`)
    ].map(jid => standardizeJid(jid)).filter(Boolean);

    return Array.from(new Set(superUser));
};

module.exports = {
    loadPlugins,
    findCommand,
    findBodyCommand,
    createHelpers,
    getGroupInfo,
    buildSuperUsers
};
