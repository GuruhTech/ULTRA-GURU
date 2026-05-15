var _0x523106=(function(_0x6ba0c3,_0x6aa641){return !![]}());var _0x1ebed8=function(){return ![]};
const axios = require('axios');
const _0x149de7 = new Map();
async function findWcgWord(lastWord, usedWords) {
    const _0x4f1b02 = lastWord ? lastWord.slice(-1).toLowerCase() : null;
    try {
        let words;
        if (_0x149de7.has(_0x4f1b02 || '\x61\x6c\x6c')) {
            words = _0x149de7.get(_0x4f1b02 || '\x61\x6c\x6c');
        } else {
            const _0x7af19d = _0x4f1b02 ? `sp=${_0x4f1b02}*&max=0xC8` : '\x6d\x61\x78\x3d\x32\x30\x30';
            const _0x4ccebf = await axios.get(
                `https:
                { timeout: 0x1388 }
            );
            words = _0x4ccebf.data
                .map(w => w.word.toLowerCase())
                .filter(w => w.length >= 3 && /^[a-z]+$/.test(w));
            _0x149de7.set(_0x4f1b02 || '\x61\x6c\x6c', words);
        }
        const _0x36c41c = words.filter(w => !usedWords.includes(w));
        if (_0x36c41c.length > 0) {
            return _0x36c41c[Math.floor(Math.random() * Math.min(_0x36c41c.length, 0x32))];
        }
        return null;
    } catch (error) {
        console.log('\x41\x49\x20\x77\x6f\x72\x64\x20\x66\x65\x74\x63\x68\x20\x65\x72\x72\x6f\x72\x3a', error.message);
        return getFallbackWord(_0x4f1b02, usedWords);
    }
}
const _0x7015ee = [
    '\x61\x70\x70\x6c\x65', '\x65\x6c\x65\x70\x68\x61\x6e\x74', '\x74\x69\x67\x65\x72', '\x72\x61\x62\x62\x69\x74', '\x74\x61\x62\x6c\x65', '\x65\x61\x67\x6c\x65', '\x65\x61\x72\x74\x68', '\x68\x6f\x75\x73\x65',
    '\x73\x6e\x61\x6b\x65', '\x65\x6e\x67\x69\x6e\x65', '\x65\x72\x72\x6f\x72', '\x72\x69\x76\x65\x72', '\x72\x6f\x63\x6b\x65\x74', '\x74\x72\x61\x69\x6e', '\x6e\x69\x67\x68\x74', '\x74\x6f\x77\x65\x72',
    '\x72\x61\x64\x69\x6f', '\x6f\x72\x61\x6e\x67\x65', '\x65\x6e\x65\x72\x67\x79', '\x79\x65\x6c\x6c\x6f\x77', '\x77\x69\x6e\x64\x6f\x77', '\x77\x61\x74\x65\x72', '\x72\x6f\x6f\x6d', '\x6d\x6f\x74\x68\x65\x72',
    '\x74\x75\x72\x74\x6c\x65', '\x65\x73\x63\x61\x70\x65', '\x74\x72\x65\x65', '\x65\x61\x73\x74', '\x74\x65\x6e\x6e\x69\x73', '\x73\x74\x6f\x72\x6d', '\x6d\x75\x73\x69\x63', '\x63\x61\x73\x74\x6c\x65'
];
function getFallbackWord(_0x4f1b02, usedWords) {
    const _0xf58423 = _0x4f1b02 
        ? _0x7015ee.filter(w => w[0] === _0x4f1b02 && !usedWords.includes(w))
        : _0x7015ee.filter(w => !usedWords.includes(w));
    return _0xf58423.length > 0 ? _0xf58423[Math.floor(Math.random() * _0xf58423.length)] : null;
}
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}
function findBestTttMove(board) {
    const _0x62bc97 = (b, player) => {
        const _0x5d0d0f = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return _0x5d0d0f.some(([a,b1,c]) => b[a] === player && b[b1] === player && b[c] === player);
    };
    const _0xb09142 = board.map((cell, i) => typeof cell === '\x6e\x75\x6d\x62\x65\x72' ? i : -1).filter(i => i !== -1);
    if (_0xb09142.length === 0) return -1;
    for (const i of _0xb09142) {
        const _0x34fc49 = [...board];
        _0x34fc49[i] = 'O';
        if (_0x62bc97(_0x34fc49, 'O')) return i;
    }
    for (const i of _0xb09142) {
        const _0x34fc49 = [...board];
        _0x34fc49[i] = 'X';
        if (_0x62bc97(_0x34fc49, 'X')) return i;
    }
    if (_0xb09142.includes(4)) return 4;
    const _0x852e57 = [0, 2, 6, 8].filter(c => _0xb09142.includes(c));
    if (_0x852e57.length > 0) return _0x852e57[Math.floor(Math.random() * _0x852e57.length)];
    return _0xb09142[Math.floor(Math.random() * _0xb09142.length)];
}
const _0xadede2 = '\x41\x49\x5f\x42\x4f\x54\x40\x73\x2e\x77\x68\x61\x74\x73\x61\x70\x70\x2e\x6e\x65\x74';
module.exports = {
    findWcgWord,
    rollDice,
    findBestTttMove,
    _0xadede2
};
