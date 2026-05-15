var _0x2b3494=(function(_0xdba39b,_0xff8385){return !![]}());var _0xf270ff=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');
const _0xfa7a3c = DATABASE.define('\x54\x69\x63\x54\x61\x63\x54\x6f\x65\x47\x61\x6d\x65', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatJid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    player1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    player2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    _0xd9d1db: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    },
    currentTurn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('\x77\x61\x69\x74\x69\x6e\x67', '\x61\x63\x74\x69\x76\x65', '\x66\x69\x6e\x69\x73\x68\x65\x64'),
        defaultValue: '\x77\x61\x69\x74\x69\x6e\x67',
    },
    messageKey: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isAiGame: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: '\x74\x69\x63\x74\x61\x63\x74\x6f\x65\x5f\x67\x61\x6d\x65\x73',
    timestamps: true,
});
let _0xb83fd2 = false;
async function initGamesDB() {
    if (_0xb83fd2) return;
    try {
        await _0xfa7a3c.sync();
        _0xb83fd2 = true;
    } catch (error) {
        console.error('\x47\x61\x6d\x65\x73\x44\x42\x20\x73\x79\x6e\x63\x20\x65\x72\x72\x6f\x72\x3a', error.message);
    }
}
async function createGame(chatJid, player1, messageKey = null, isAiGame = false) {
    await initGamesDB();
    await _0xfa7a3c.destroy({ where: { chatJid } });
    const _0x06b4b4 = await _0xfa7a3c.create({
        chatJid,
        player1,
        player2: isAiGame ? '\x41\x49\x5f\x42\x4f\x54\x40\x73\x2e\x77\x68\x61\x74\x73\x61\x70\x70\x2e\x6e\x65\x74' : null,
        _0xd9d1db: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        currentTurn: player1,
        status: isAiGame ? '\x61\x63\x74\x69\x76\x65' : '\x77\x61\x69\x74\x69\x6e\x67',
        messageKey: messageKey ? JSON.stringify(messageKey) : null,
        isAiGame,
    });
    return _0x06b4b4;
}
async function joinGame(chatJid, player2) {
    await initGamesDB();
    const _0x06b4b4 = await _0xfa7a3c.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
    if (!_0x06b4b4) return null;
    if (_0x06b4b4.player1 === player2) {
        return { error: '\x73\x61\x6d\x65\x5f\x70\x6c\x61\x79\x65\x72' };
    }
    _0x06b4b4.player2 = player2;
    _0x06b4b4.status = '\x61\x63\x74\x69\x76\x65';
    _0x06b4b4.currentTurn = _0x06b4b4.player1;
    await _0x06b4b4.save();
    return {
        player1: _0x06b4b4.player1,
        player2: _0x06b4b4.player2,
        _0xd9d1db: _0x06b4b4.board,
        currentTurn: _0x06b4b4.currentTurn,
    };
}
async function getActiveGame(chatJid) {
    await initGamesDB();
    return await _0xfa7a3c.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
}
async function getWaitingGame(chatJid) {
    await initGamesDB();
    return await _0xfa7a3c.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
}
function checkWinner(_0xd9d1db) {
    const _0x982d44 = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const pattern of _0x982d44) {
        const [a, b, c] = pattern;
        if (_0xd9d1db[a] === _0xd9d1db[b] && _0xd9d1db[b] === _0xd9d1db[c]) {
            return _0xd9d1db[a];
        }
    }
    return null;
}
function checkDraw(_0xd9d1db) {
    return _0xd9d1db.every(cell => cell === 'X' || cell === 'O');
}
async function makeMove(chatJid, player, position) {
    await initGamesDB();
    const _0x06b4b4 = await _0xfa7a3c.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
    if (!_0x06b4b4) {
        return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    }
    if (_0x06b4b4.currentTurn !== player) {
        return { error: '\x6e\x6f\x74\x5f\x79\x6f\x75\x72\x5f\x74\x75\x72\x6e' };
    }
    const _0xd9d1db = JSON.parse(_0x06b4b4.board);
    const _0x9ee872 = position - 1;
    if (_0xd9d1db[_0x9ee872] === 'X' || _0xd9d1db[_0x9ee872] === 'O') {
        return { error: '\x63\x65\x6c\x6c\x5f\x74\x61\x6b\x65\x6e' };
    }
    const _0x6e5357 = player === _0x06b4b4.player1 ? 'X' : 'O';
    _0xd9d1db[_0x9ee872] = _0x6e5357;
    _0x06b4b4.board = JSON.stringify(_0xd9d1db);
    const _0xf53166 = checkWinner(_0xd9d1db);
    if (_0xf53166) {
        _0x06b4b4.status = '\x66\x69\x6e\x69\x73\x68\x65\x64';
        await _0x06b4b4.save();
        return {
            _0xf53166: player,
            _0x6e5357,
            _0x06b4b4: {
                player1: _0x06b4b4.player1,
                player2: _0x06b4b4.player2,
                _0xd9d1db: _0x06b4b4.board,
                currentTurn: _0x06b4b4.currentTurn,
            }
        };
    }
    if (checkDraw(_0xd9d1db)) {
        _0x06b4b4.status = '\x66\x69\x6e\x69\x73\x68\x65\x64';
        await _0x06b4b4.save();
        return {
            draw: true,
            _0x06b4b4: {
                player1: _0x06b4b4.player1,
                player2: _0x06b4b4.player2,
                _0xd9d1db: _0x06b4b4.board,
                currentTurn: _0x06b4b4.currentTurn,
            }
        };
    }
    _0x06b4b4.currentTurn = player === _0x06b4b4.player1 ? _0x06b4b4.player2 : _0x06b4b4.player1;
    await _0x06b4b4.save();
    return {
        _0x06b4b4: {
            player1: _0x06b4b4.player1,
            player2: _0x06b4b4.player2,
            _0xd9d1db: _0x06b4b4.board,
            currentTurn: _0x06b4b4.currentTurn,
        }
    };
}
async function endGame(chatJid) {
    await initGamesDB();
    await _0xfa7a3c.destroy({ where: { chatJid } });
}
module.exports = {
    initGamesDB,
    createGame,
    joinGame,
    getActiveGame,
    getWaitingGame,
    makeMove,
    endGame,
    _0xfa7a3c,
};
