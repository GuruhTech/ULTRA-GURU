var _0x997173=(function(_0xdfe0ce,_0xc87d71){return !![]}());var _0xbef10f=function(){return ![]};
const _0x3d6a0d = require("node-cache");
const _0x5e3c0c = new _0x3d6a0d({
    stdTTL: 5 * 0x3C,
    useClones: false,
    checkperiod: 0x3C,
});
const _0xaa4186 = new _0x3d6a0d({
    stdTTL: 0x18 * 0x3C * 0x3C,
    useClones: false,
    checkperiod: 0x12C,
});
const _0xd5381a = (_0x8fb6c9, _0xaeb9e6) => {
    if (_0x8fb6c9 && _0xaeb9e6 && _0x8fb6c9.endsWith("@lid") && _0xaeb9e6.endsWith("@s.whatsapp.net")) {
        _0xaa4186.set(_0x8fb6c9, _0xaeb9e6);
    }
};
const _0x05c5c3 = (_0x8fb6c9) => {
    return _0xaa4186.get(_0x8fb6c9);
};
const _0x5aef8b = (_0xe81785) => {
    if (!_0xe81785?.participants) return;
    for (const p of _0xe81785.participants) {
        const _0x8fb6c9 = p.lid || p.id;
        const _0xaeb9e6 = p.pn || p.jid;
        if (_0x8fb6c9 && _0xaeb9e6) {
            _0xd5381a(_0x8fb6c9, _0xaeb9e6);
        }
    }
};
const _0x7e56e4 = (errorMsg) => {
    const _0x953d4a = [
        "\x66\x6f\x72\x62\x69\x64\x64\x65\x6e",
        "\x69\x74\x65\x6d\x2d\x6e\x6f\x74\x2d\x66\x6f\x75\x6e\x64",
        "\x6e\x6f\x74\x2d\x61\x75\x74\x68\x6f\x72\x69\x7a\x65\x64",
        "\x67\x6f\x6e\x65",
    ];
    return _0x953d4a.some((e) => errorMsg?.toLowerCase().includes(e));
};
const _0xd1154e = async (Gifted, _0xaeb9e6) => {
    if (!_0xaeb9e6 || !_0xaeb9e6.endsWith("@g.us")) return null;
    try {
        const _0x7878d7 = _0x5e3c0c.get(_0xaeb9e6);
        if (_0x7878d7) {
            _0x5aef8b(_0x7878d7);
            return _0x7878d7;
        }
        const _0xe81785 = await Gifted.groupMetadata(_0xaeb9e6);
        if (_0xe81785) {
            _0x5e3c0c.set(_0xaeb9e6, _0xe81785);
            _0x5aef8b(_0xe81785);
        }
        return _0xe81785;
    } catch (error) {
        if (!_0x7e56e4(error.message)) {
            console.error(
                `Failed to get group _0xe81785 for ${_0xaeb9e6}:`,
                error.message,
            );
        }
        return null;
    }
};
const _0x1e16d3 = (_0xaeb9e6, _0xe81785) => {
    if (_0xaeb9e6 && _0xe81785) {
        _0x5e3c0c.set(_0xaeb9e6, _0xe81785);
        _0x5aef8b(_0xe81785);
    }
};
const _0x883ed4 = (_0xaeb9e6) => {
    _0x5e3c0c.del(_0xaeb9e6);
};
const _0xb934eb = () => {
    _0x5e3c0c.flushAll();
};
const _0x5fde64 = (Gifted) => {
    Gifted.ev.on("\x67\x72\x6f\x75\x70\x73\x2e\x75\x70\x64\x61\x74\x65", async ([event]) => {
        try {
            if (event?.id) {
                const _0xe81785 = await Gifted.groupMetadata(event.id);
                _0x1e16d3(event.id, _0xe81785);
            }
        } catch (error) {
            _0x883ed4(event?.id);
            if (!_0x7e56e4(error.message)) {
                console.error("\x47\x72\x6f\x75\x70\x20\x63\x61\x63\x68\x65\x20\x75\x70\x64\x61\x74\x65\x20\x66\x61\x69\x6c\x65\x64\x3a", error.message);
            }
        }
    });
    Gifted.ev.on("\x67\x72\x6f\x75\x70\x2d\x70\x61\x72\x74\x69\x63\x69\x70\x61\x6e\x74\x73\x2e\x75\x70\x64\x61\x74\x65", async (event) => {
        try {
            if (event?.id) {
                const _0x415136 = _0x5e3c0c.get(event.id);
                if (_0x415136) {
                    _0x5aef8b(_0x415136);
                }
                const _0xe81785 = await Gifted.groupMetadata(event.id);
                _0x1e16d3(event.id, _0xe81785);
            }
        } catch (error) {
            _0x883ed4(event?.id);
            if (!_0x7e56e4(error.message)) {
                console.error(
                    "\x50\x61\x72\x74\x69\x63\x69\x70\x61\x6e\x74\x20\x63\x61\x63\x68\x65\x20\x75\x70\x64\x61\x74\x65\x20\x66\x61\x69\x6c\x65\x64\x3a",
                    error.message,
                );
            }
        }
    });
};
const _0x71d62e = async (_0xaeb9e6) => {
    return _0x5e3c0c.get(_0xaeb9e6);
};
const _0x8c83ba = async (Gifted) => {
    try {
        const _0xc6f4ce = await Gifted.groupFetchAllParticipating();
        if (_0xc6f4ce) {
            for (const groupJid of Object.keys(_0xc6f4ce)) {
                const _0x90b2be = _0xc6f4ce[groupJid];
                if (_0x90b2be?.participants) {
                    _0x5aef8b(_0x90b2be);
                    _0x5e3c0c.set(groupJid, _0x90b2be);
                }
            }
            console.log(
                `✅ LID store initialized => ${_0xaa4186.keys().length} Mappings from ${Object.keys(_0xc6f4ce).length} Groups`,
            );
        }
    } catch (error) {
        console.error("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x69\x6e\x69\x74\x69\x61\x6c\x69\x7a\x65\x20\x4c\x49\x44\x20\x73\x74\x6f\x72\x65\x3a", error.message);
    }
};
module.exports = {
    _0x5e3c0c,
    _0xd1154e,
    _0x1e16d3,
    _0x883ed4,
    _0xb934eb,
    _0x5fde64,
    _0x71d62e,
    _0x05c5c3,
    _0xd5381a,
    _0x5aef8b,
    _0x8c83ba,
};
