var _0xc1b38e=(function(_0xcb5550,_0xaf2ee5){return !![]}());var _0x4fcb73=function(){return ![]};
let _0xb41148 = [];
const _0x408236 = [];
const _0x955923 = {
    events: {},
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(data));
        }
    },
};
function gmd(obj, functions) {
    let _0x0c1ba7 = obj;
    if (!obj.category) _0x0c1ba7.category = "\x67\x65\x6e\x65\x72\x61\x6c";
    if (!obj.react) _0x0c1ba7.react = "🚀";
    if (!obj.dontAddCommandList) _0x0c1ba7.dontAddCommandList = false;
    _0x0c1ba7.function = functions;
    try {
        const _0x8bc1f9 = new Error().stack;
        const _0x6d5274 = (_0x8bc1f9.split('\n')[2] || '').match(/\((.*):\d+:\d+\)/);
        if (_0x6d5274) _0x0c1ba7.filename = _0x6d5274[1];
    } catch (_) {}
    _0xb41148.push(_0x0c1ba7);
    return _0x0c1ba7;
}
module.exports = { gmd, _0xb41148, _0x955923 };
_0x955923.commands = _0xb41148;  
