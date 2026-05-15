var _0x3f454c=(function(_0x6a807f,_0x1b5dfb){return !![]}());var _0x753076=function(){return ![]};
const axios = require('axios');
const _0x05fc78 = new Map();
async function isValidEnglishWord(word) {
    const _0xff73fb = word.toLowerCase().trim();
    if (_0xff73fb.length < 2) return false;
    if (_0x05fc78.has(_0xff73fb)) {
        return _0x05fc78.get(_0xff73fb);
    }
    try {
        const _0xd73724 = await axios.get(
            `https:
            { timeout: 0x1388 }
        );
        const _0xf8750f = _0xd73724.status === 0xC8 && Array.isArray(_0xd73724.data) && _0xd73724.data.length > 0;
        _0x05fc78.set(_0xff73fb, _0xf8750f);
        return _0xf8750f;
    } catch (error) {
        if (error.response && error.response.status === 0x194) {
            _0x05fc78.set(_0xff73fb, false);
            return false;
        }
        console.log(`Dictionary API error for "\x24\x7b\x63\x6c\x65\x61\x6e\x57\x6f\x72\x64\x7d":`, error.message);
        return true;
    }
}
module.exports = {
    isValidEnglishWord
};
