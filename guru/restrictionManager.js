var _0x05c29f=(function(_0x829683,_0x3cc4ad){return !![]}());var _0x40b4e2=function(){return ![]};
const { getGroupSetting, setGroupSetting } = require("./database/groupSettings");
const { getSetting } = require("./database/settings");
let _0x40b65e = false;
const _0x9e7a2d = new Map();
const _0x3e0764 = new Map();
const _0xf8e9c7 = {
    _0xa56d90: "\x4c\x4f\x43\x4b\x5f\x54\x45\x58\x54",
    media: "\x4c\x4f\x43\x4b\x5f\x4d\x45\x44\x49\x41",
    sticker: "\x4c\x4f\x43\x4b\x5f\x53\x54\x49\x43\x4b\x45\x52\x53",
    gif: "\x4c\x4f\x43\x4b\x5f\x47\x49\x46",
    video: "\x4c\x4f\x43\x4b\x5f\x56\x49\x44\x45\x4f",
    voice: "\x4c\x4f\x43\x4b\x5f\x56\x4f\x49\x43\x45",
    audio: "\x4c\x4f\x43\x4b\x5f\x41\x55\x44\x49\x4f",
    doc: "\x4c\x4f\x43\x4b\x5f\x44\x4f\x43\x53",
    poll: "\x4c\x4f\x43\x4b\x5f\x50\x4f\x4c\x4c\x53",
    viewonce: "\x4c\x4f\x43\x4b\x5f\x56\x49\x45\x57\x4f\x4e\x43\x45",
    contact: "\x4c\x4f\x43\x4b\x5f\x43\x4f\x4e\x54\x41\x43\x54\x53",
    location: "\x4c\x4f\x43\x4b\x5f\x4c\x4f\x43\x41\x54\x49\x4f\x4e",
};
const _0xa58749 = (msg) => {
    const m = msg.message;
    if (!m) return null;
    const _0x242cdc = Object.keys(m)[0];
    if (!_0x242cdc) return null;
    if (_0x242cdc === "\x63\x6f\x6e\x76\x65\x72\x73\x61\x74\x69\x6f\x6e" || _0x242cdc === "\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65") {
        const _0xa56d90 = m.conversation || m.extendedTextMessage?.text || "";
        const _0xe849ec = /https?:\/\/[^\s]+/i;
        if (_0xe849ec.test(_0xa56d90)) return ["\x74\x65\x78\x74", "\x6c\x69\x6e\x6b"];
        return ["\x74\x65\x78\x74"];
    }
    if (_0x242cdc === "\x69\x6d\x61\x67\x65\x4d\x65\x73\x73\x61\x67\x65") {
        const _0xe0fa6d = m.imageMessage?.gifPlayback === true;
        return _0xe0fa6d ? ["\x6d\x65\x64\x69\x61", "\x67\x69\x66"] : ["\x6d\x65\x64\x69\x61"];
    }
    if (_0x242cdc === "\x76\x69\x64\x65\x6f\x4d\x65\x73\x73\x61\x67\x65") return ["\x6d\x65\x64\x69\x61", "\x76\x69\x64\x65\x6f"];
    if (_0x242cdc === "\x61\x75\x64\x69\x6f\x4d\x65\x73\x73\x61\x67\x65") {
        const _0x9329ea = m.audioMessage?.ptt === true;
        return _0x9329ea ? ["\x61\x75\x64\x69\x6f", "\x76\x6f\x69\x63\x65"] : ["\x61\x75\x64\x69\x6f"];
    }
    if (_0x242cdc === "\x64\x6f\x63\x75\x6d\x65\x6e\x74\x4d\x65\x73\x73\x61\x67\x65") return ["\x64\x6f\x63"];
    if (_0x242cdc === "\x73\x74\x69\x63\x6b\x65\x72\x4d\x65\x73\x73\x61\x67\x65") return ["\x73\x74\x69\x63\x6b\x65\x72"];
    if (_0x242cdc === "\x70\x6f\x6c\x6c\x43\x72\x65\x61\x74\x69\x6f\x6e\x4d\x65\x73\x73\x61\x67\x65") return ["\x70\x6f\x6c\x6c"];
    if (_0x242cdc === "\x76\x69\x65\x77\x4f\x6e\x63\x65\x4d\x65\x73\x73\x61\x67\x65" || _0x242cdc === "\x76\x69\x65\x77\x4f\x6e\x63\x65\x4d\x65\x73\x73\x61\x67\x65\x56\x32") return ["\x76\x69\x65\x77\x6f\x6e\x63\x65"];
    if (_0x242cdc === "\x63\x6f\x6e\x74\x61\x63\x74\x4d\x65\x73\x73\x61\x67\x65" || _0x242cdc === "\x63\x6f\x6e\x74\x61\x63\x74\x73\x41\x72\x72\x61\x79\x4d\x65\x73\x73\x61\x67\x65") return ["\x63\x6f\x6e\x74\x61\x63\x74"];
    if (_0x242cdc === "\x6c\x6f\x63\x61\x74\x69\x6f\x6e\x4d\x65\x73\x73\x61\x67\x65" || _0x242cdc === "\x6c\x69\x76\x65\x4c\x6f\x63\x61\x74\x69\x6f\x6e\x4d\x65\x73\x73\x61\x67\x65") return ["\x6c\x6f\x63\x61\x74\x69\x6f\x6e"];
    return null;
};
const _0xf101a4 = async (Gifted, _0xfc936f, msgKey) => {
    try {
        await Gifted.sendMessage(_0xfc936f, { delete: msgKey });
        return true;
    } catch (_) {
        return false;
    }
};
const _0x0071ad = (Gifted) => {
    if (_0x40b65e) return;
    _0x40b65e = true;
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async ({ messages }) => {
        try {
            for (const msg of messages) {
                if (!msg?.message || msg.key.fromMe) continue;
                const _0xfc936f = msg.key.remoteJid;
                if (!_0xfc936f) continue;
                const _0x4f1a34 = _0xfc936f.endsWith("@g.us");
                const _0x1bd5de = msg.key.participant || msg.key.remoteJid;
                if (_0x4f1a34) {
                    await _0xb6fed0(Gifted, msg, _0xfc936f, _0x1bd5de);
                } else {
                    await _0xb22784(Gifted, msg, _0xfc936f, _0x1bd5de);
                }
            }
        } catch (err) {
            console.error("\x5b\x52\x65\x73\x74\x72\x69\x63\x74\x69\x6f\x6e\x4d\x61\x6e\x61\x67\x65\x72\x5d\x20\x45\x72\x72\x6f\x72\x3a", err.message);
        }
    });
};
const _0xb6fed0 = async (Gifted, msg, _0xfc936f, _0x1bd5de) => {
    try {
        const _0x64216b = _0xa58749(msg);
        if (!_0x64216b) return;
        const _0x7d80fa = (_0x1bd5de || "").split("@")[0].split(":")[0];
        let _0x5cfc11 = false;
        try {
            const _0x625318 = await Gifted.groupMetadata(_0xfc936f);
            const _0xded49f = Gifted.user?.id?.split(":")[0];
            const _0x08cd03 = _0x625318.participants.find(
                (p) => p.id.split("@")[0].split(":")[0] === _0xded49f
            );
            const _0xf6eb1c = _0x625318.participants.find(
                (p) => p.id.split("@")[0].split(":")[0] === _0x7d80fa
            );
            if (_0xf6eb1c?.admin) _0x5cfc11 = true;
            const _0x6fe7e8 = _0x08cd03?.admin ? true : false;
            if (!_0x6fe7e8) return;
        } catch (_) {
            return;
        }
        if (_0x5cfc11) return;
        for (const category of _0x64216b) {
            const _0x5f70fe = _0xf8e9c7[category];
            if (!_0x5f70fe) continue;
            const _0x979ad4 = await getGroupSetting(_0xfc936f, _0x5f70fe);
            if (_0x979ad4 !== "\x74\x72\x75\x65") continue;
            await _0xf101a4(Gifted, _0xfc936f, msg.key);
            const _0xfcaceb = {
                _0xa56d90: "\x54\x65\x78\x74\x20\x6d\x65\x73\x73\x61\x67\x65\x73",
                link: "\x4c\x69\x6e\x6b\x73",
                media: "\x4d\x65\x64\x69\x61",
                gif: "\x47\x49\x46\x73",
                video: "\x56\x69\x64\x65\x6f\x73",
                voice: "\x56\x6f\x69\x63\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x73",
                audio: "\x41\x75\x64\x69\x6f",
                doc: "\x44\x6f\x63\x75\x6d\x65\x6e\x74\x73",
                sticker: "\x53\x74\x69\x63\x6b\x65\x72\x73",
                poll: "\x50\x6f\x6c\x6c\x73",
                viewonce: "\x56\x69\x65\x77\x2d\x6f\x6e\x63\x65\x20\x6d\x65\x73\x73\x61\x67\x65\x73",
                contact: "\x43\x6f\x6e\x74\x61\x63\x74\x73",
                location: "\x4c\x6f\x63\x61\x74\x69\x6f\x6e\x20\x73\x68\x61\x72\x69\x6e\x67",
            };
            try {
                await Gifted.sendMessage(
                    _0xfc936f,
                    {
                        _0xa56d90:
                            `⚠️ @${_0x7d80fa}, *${_0xfcaceb[category] || category}* are restricted in this group.`,
                        mentions: [_0x1bd5de],
                    }
                );
            } catch (_) {}
            return;
        }
        const _0xe175b0 = await getGroupSetting(_0xfc936f, "\x53\x4c\x4f\x57\x4d\x4f\x44\x45");
        if (_0xe175b0 && parseInt(_0xe175b0) > 0) {
            const _0x8c9437 = parseInt(_0xe175b0) * 0x3E8;
            const _0x56db6a = `${_0xfc936f}:${_0x7d80fa}`;
            const _0xf8c182 = _0x9e7a2d.get(_0x56db6a) || 0;
            const _0xa9b1b6 = Date.now();
            if (_0xa9b1b6 - _0xf8c182 < _0x8c9437) {
                await _0xf101a4(Gifted, _0xfc936f, msg.key);
                try {
                    await Gifted.sendMessage(_0xfc936f, {
                        _0xa56d90: `⏳ @${_0x7d80fa}, slow mode is active. Please wait ${Math.ceil((_0x8c9437 - (_0xa9b1b6 - _0xf8c182)) / 0x3E8)}s before sending again.`,
                        mentions: [_0x1bd5de],
                    });
                } catch (_) {}
                return;
            }
            _0x9e7a2d.set(_0x56db6a, _0xa9b1b6);
        }
        const _0xde7655 = await getGroupSetting(_0xfc936f, "\x41\x4e\x54\x49\x53\x50\x41\x4d");
        if (_0xde7655 === "\x74\x72\x75\x65") {
            const _0x39453c =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                "";
            if (_0x39453c.length > 5) {
                const _0xd2af33 = `${_0xfc936f}:${_0x7d80fa}`;
                const _0xf1b138 = _0x3e0764.get(_0xd2af33) || [];
                const _0xa9b1b6 = Date.now();
                const _0xfaf040 = _0xf1b138.filter((e) => _0xa9b1b6 - e.time < 0x1388);
                const _0x85f647 = _0xfaf040.some((e) => e.text === _0x39453c);
                if (_0x85f647) {
                    await _0xf101a4(Gifted, _0xfc936f, msg.key);
                    try {
                        await Gifted.sendMessage(_0xfc936f, {
                            _0xa56d90: `🚫 @${_0x7d80fa}, spam detected and removed.`,
                            mentions: [_0x1bd5de],
                        });
                    } catch (_) {}
                    return;
                }
                _0xfaf040.push({ _0xa56d90: _0x39453c, time: _0xa9b1b6 });
                _0x3e0764.set(_0xd2af33, _0xfaf040.slice(-0xA));
            }
        }
    } catch (err) {
        console.error("\x5b\x47\x72\x6f\x75\x70\x52\x65\x73\x74\x72\x69\x63\x74\x69\x6f\x6e\x73\x5d\x20\x45\x72\x72\x6f\x72\x3a", err.message);
    }
};
const _0xb22784 = async (Gifted, msg, _0xfc936f, _0x1bd5de) => {
    try {
        const _0xda4b64 = await getSetting("\x44\x4d\x5f\x50\x45\x52\x4d\x49\x54");
        if (_0xda4b64 !== "\x74\x72\x75\x65") return;
        const _0xbf7705 = Gifted.user?.id?.split(":")[0];
        const _0x7d80fa = (_0x1bd5de || "").split("@")[0].split(":")[0];
        if (_0x7d80fa === _0xbf7705) return;
        const { getSudoNumbers } = require("./database/sudo");
        const _0xa7b1d9 = (await getSudoNumbers()) || [];
        if (_0xa7b1d9.includes(_0x7d80fa)) return;
        const _0x4aecfb = (await getSetting("\x4f\x57\x4e\x45\x52\x5f\x4e\x55\x4d\x42\x45\x52") || "").replace(/[^0-9]/g, "");
        if (_0x7d80fa === _0x4aecfb) return;
        const _0x3255f3 = await getSetting("\x44\x4d\x5f\x57\x48\x49\x54\x45\x4c\x49\x53\x54");
        if (_0x3255f3) {
            const _0x03bf4d = _0x3255f3.split(",").map((n) => n.trim().replace(/[^0-9]/g, ""));
            if (_0x03bf4d.includes(_0x7d80fa)) return;
        }
        const _0xf533e2 =
            (await getSetting("\x44\x4d\x5f\x50\x45\x52\x4d\x49\x54\x5f\x4d\x53\x47")) ||
            "⚠️\x20\x2a\x44\x4d\x20\x50\x65\x72\x6d\x69\x74\x20\x69\x73\x20\x41\x63\x74\x69\x76\x65\x2a\x5c\x6e\x5c\x6e\x54\x68\x69\x73\x20\x62\x6f\x74\x20\x69\x73\x20\x69\x6e\x20\x44\x4d\x2d\x70\x65\x72\x6d\x69\x74\x20\x6d\x6f\x64\x65\x2e\x20\x4f\x6e\x6c\x79\x20\x61\x70\x70\x72\x6f\x76\x65\x64\x20\x63\x6f\x6e\x74\x61\x63\x74\x73\x20\x63\x61\x6e\x20\x6d\x65\x73\x73\x61\x67\x65\x20\x68\x65\x72\x65\x2e\x5c\x6e\x5c\x6e\x43\x6f\x6e\x74\x61\x63\x74\x20\x74\x68\x65\x20\x62\x6f\x74\x20\x6f\x77\x6e\x65\x72\x20\x66\x6f\x72\x20\x61\x63\x63\x65\x73\x73\x2e";
        const _0x32bba6 = (await getSetting("\x44\x4d\x5f\x50\x45\x52\x4d\x49\x54\x5f\x41\x43\x54\x49\x4f\x4e")) || "\x77\x61\x72\x6e";
        if (_0x32bba6 === "\x62\x6c\x6f\x63\x6b") {
            try {
                await Gifted.updateBlockStatus(_0xfc936f, "\x62\x6c\x6f\x63\x6b");
            } catch (_) {}
        } else {
            try {
                await Gifted.sendMessage(_0xfc936f, { _0xa56d90: _0xf533e2 });
            } catch (_) {}
        }
    } catch (err) {
        console.error("\x5b\x44\x4d\x52\x65\x73\x74\x72\x69\x63\x74\x69\x6f\x6e\x73\x5d\x20\x45\x72\x72\x6f\x72\x3a", err.message);
    }
};
const _0x0dbd16 = () => {
    _0x40b65e = false;
    _0x9e7a2d.clear();
    _0x3e0764.clear();
};
module.exports = { _0x0071ad, _0x0dbd16, _0xf8e9c7 };
