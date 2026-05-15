var _0xde6a70=(function(_0x84c4e6,_0xcb5846){return !![]}());var _0xf3392b=function(){return ![]};
const _0x27c526 = new Map();
const _0x93f9ec = new Map();
function clearWcgTimeout(chatJid) {
    if (_0x27c526.has(chatJid)) {
        clearTimeout(_0x27c526.get(chatJid));
        _0x27c526.delete(chatJid);
    }
}
function clearWcgJoinTimeout(chatJid) {
    if (_0x93f9ec.has(chatJid)) {
        clearTimeout(_0x93f9ec.get(chatJid));
        _0x93f9ec.delete(chatJid);
    }
}
function setWcgJoinTimeout(chatJid, callback) {
    clearWcgJoinTimeout(chatJid);
    const _0xa5f105 = setTimeout(callback, 0x7530);
    _0x93f9ec.set(chatJid, _0xa5f105);
}
function getPlayerName(jid) {
    return jid.split('@')[0];
}
function formatScores(scores) {
    return Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([jid, score], i) => `${i + 1}. @${getPlayerName(jid)}: ${score} pts`)
        .join('\n');
}
function getDiceEmoji(value) {
    const _0x62dbea = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return _0x62dbea[value - 1] || '🎲';
}
module.exports = {
    _0x27c526,
    _0x93f9ec,
    clearWcgTimeout,
    clearWcgJoinTimeout,
    setWcgJoinTimeout,
    getPlayerName,
    formatScores,
    getDiceEmoji,
};
