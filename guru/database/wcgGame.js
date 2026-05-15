var _0xe2df5f=(function(_0x6a5744,_0x8415f9){return !![]}());var _0x1d9f1e=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');
const { isValidEnglishWord } = require('../dictionary');
const _0xb0efc1 = DATABASE.define('\x57\x6f\x72\x64\x43\x68\x61\x69\x6e\x47\x61\x6d\x65', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatJid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    _0x3a40d3: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
    },
    currentTurn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastWord: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    _0x416735: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
    },
    _0x9694e2: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '{}',
    },
    status: {
        type: DataTypes.ENUM('\x77\x61\x69\x74\x69\x6e\x67', '\x61\x63\x74\x69\x76\x65', '\x66\x69\x6e\x69\x73\x68\x65\x64'),
        defaultValue: '\x77\x61\x69\x74\x69\x6e\x67',
    },
    minPlayers: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
    },
    turnTimeLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 0x1E,
    },
    isAiGame: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: '\x77\x63\x67\x5f\x67\x61\x6d\x65\x73',
    timestamps: true,
});
let _0xd61ab1 = false;
async function initWcgDB() {
    if (_0xd61ab1) return;
    try {
        await _0xb0efc1.sync();
        _0xd61ab1 = true;
    } catch (error) {
        console.error('\x57\x63\x67\x44\x42\x20\x73\x79\x6e\x63\x20\x65\x72\x72\x6f\x72\x3a', error.message);
    }
}
async function createWcgGame(chatJid, hostPlayer) {
    await initWcgDB();
    await _0xb0efc1.destroy({ where: { chatJid } });
    const _0x9694e2 = {};
    _0x9694e2[hostPlayer] = 0;
    const _0x989f85 = await _0xb0efc1.create({
        chatJid,
        _0x3a40d3: JSON.stringify([hostPlayer]),
        currentTurn: null,
        lastWord: null,
        _0x416735: '[]',
        _0x9694e2: JSON.stringify(_0x9694e2),
        status: '\x77\x61\x69\x74\x69\x6e\x67',
    });
    return _0x989f85;
}
async function joinWcgGame(chatJid, player) {
    await initWcgDB();
    const _0x989f85 = await _0xb0efc1.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
    if (!_0x989f85) return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    const _0x3a40d3 = JSON.parse(_0x989f85.players);
    if (_0x3a40d3[0] === player) {
        return { error: '\x63\x61\x6e\x74\x5f\x6a\x6f\x69\x6e\x5f\x6f\x77\x6e\x5f\x67\x61\x6d\x65' };
    }
    if (_0x3a40d3.includes(player)) {
        return { error: '\x61\x6c\x72\x65\x61\x64\x79\x5f\x6a\x6f\x69\x6e\x65\x64' };
    }
    _0x3a40d3.push(player);
    const _0x9694e2 = JSON.parse(_0x989f85.scores);
    _0x9694e2[player] = 0;
    _0x989f85.players = JSON.stringify(_0x3a40d3);
    _0x989f85.scores = JSON.stringify(_0x9694e2);
    await _0x989f85.save();
    return { _0x3a40d3, _0x989f85 };
}
async function startWcgGame(chatJid) {
    await initWcgDB();
    const _0x989f85 = await _0xb0efc1.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
    if (!_0x989f85) return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    const _0x3a40d3 = JSON.parse(_0x989f85.players);
    if (_0x3a40d3.length < 2) {
        return { error: '\x6e\x6f\x74\x5f\x65\x6e\x6f\x75\x67\x68\x5f\x70\x6c\x61\x79\x65\x72\x73' };
    }
    _0x989f85.status = '\x61\x63\x74\x69\x76\x65';
    _0x989f85.currentTurn = _0x3a40d3[0];
    await _0x989f85.save();
    return {
        _0x3a40d3,
        currentTurn: _0x989f85.currentTurn,
        _0x989f85
    };
}
async function getWcgGame(chatJid) {
    await initWcgDB();
    return await _0xb0efc1.findOne({ where: { chatJid } });
}
async function getActiveWcgGame(chatJid) {
    await initWcgDB();
    return await _0xb0efc1.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
}
async function getWaitingWcgGame(chatJid) {
    await initWcgDB();
    return await _0xb0efc1.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
}
async function submitWord(chatJid, player, word) {
    await initWcgDB();
    const _0x989f85 = await _0xb0efc1.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
    if (!_0x989f85) return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    if (_0x989f85.currentTurn !== player) return { error: '\x6e\x6f\x74\x5f\x79\x6f\x75\x72\x5f\x74\x75\x72\x6e' };
    const _0x3e19e8 = word.toLowerCase().trim();
    const _0x416735 = JSON.parse(_0x989f85.usedWords);
    if (_0x416735.includes(_0x3e19e8)) {
        return { error: '\x77\x6f\x72\x64\x5f\x75\x73\x65\x64' };
    }
    if (_0x989f85.lastWord) {
        const _0x75d86e = _0x989f85.lastWord.slice(-1).toLowerCase();
        if (_0x3e19e8[0] !== _0x75d86e) {
            return { error: '\x77\x72\x6f\x6e\x67\x5f\x6c\x65\x74\x74\x65\x72', expected: _0x75d86e };
        }
    }
    if (_0x3e19e8.length < 2) {
        return { error: '\x74\x6f\x6f\x5f\x73\x68\x6f\x72\x74' };
    }
    const _0xeeb08e = await isValidEnglishWord(_0x3e19e8);
    if (!_0xeeb08e) {
        return { error: '\x69\x6e\x76\x61\x6c\x69\x64\x5f\x77\x6f\x72\x64' };
    }
    _0x416735.push(_0x3e19e8);
    const _0x9694e2 = JSON.parse(_0x989f85.scores);
    _0x9694e2[player] = (_0x9694e2[player] || 0) + _0x3e19e8.length;
    const _0x3a40d3 = JSON.parse(_0x989f85.players);
    const _0x274f0c = _0x3a40d3.indexOf(player);
    const _0x5e4d45 = (_0x274f0c + 1) % _0x3a40d3.length;
    const _0xe56864 = _0x3a40d3[_0x5e4d45];
    _0x989f85.lastWord = _0x3e19e8;
    _0x989f85.usedWords = JSON.stringify(_0x416735);
    _0x989f85.scores = JSON.stringify(_0x9694e2);
    _0x989f85.currentTurn = _0xe56864;
    await _0x989f85.save();
    return {
        word: _0x3e19e8,
        _0x9694e2,
        _0xe56864,
        wordCount: _0x416735.length,
        _0x989f85
    };
}
async function eliminatePlayer(chatJid, player) {
    await initWcgDB();
    const _0x989f85 = await _0xb0efc1.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
    if (!_0x989f85) return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    const _0x3a40d3 = JSON.parse(_0x989f85.players);
    const _0xdb23e4 = _0x3a40d3.indexOf(player);
    if (_0xdb23e4 === -1) return { error: '\x70\x6c\x61\x79\x65\x72\x5f\x6e\x6f\x74\x5f\x66\x6f\x75\x6e\x64' };
    _0x3a40d3.splice(_0xdb23e4, 1);
    const _0x9694e2 = JSON.parse(_0x989f85.scores);
    if (_0x3a40d3.length === 0) {
        _0x989f85.status = '\x66\x69\x6e\x69\x73\x68\x65\x64';
        await _0x989f85.save();
        return { 
            winner: null,
            _0x9694e2,
            finished: true,
            noWinner: true
        };
    }
    if (_0x3a40d3.length === 1) {
        _0x989f85.status = '\x66\x69\x6e\x69\x73\x68\x65\x64';
        await _0x989f85.save();
        return { 
            winner: _0x3a40d3[0],
            _0x9694e2,
            finished: true
        };
    }
    const _0x274f0c = _0x3a40d3.indexOf(_0x989f85.currentTurn);
    const _0xe56864 = _0x274f0c === -1 ? _0x3a40d3[0] : _0x989f85.currentTurn;
    _0x989f85.players = JSON.stringify(_0x3a40d3);
    _0x989f85.currentTurn = _0xe56864;
    await _0x989f85.save();
    return {
        eliminated: player,
        remainingPlayers: _0x3a40d3,
        _0xe56864,
        _0x9694e2
    };
}
async function endWcgGame(chatJid) {
    await initWcgDB();
    const _0x989f85 = await _0xb0efc1.findOne({ where: { chatJid } });
    if (_0x989f85) {
        const _0x9694e2 = JSON.parse(_0x989f85.scores);
        await _0xb0efc1.destroy({ where: { chatJid } });
        return _0x9694e2;
    }
    return null;
}
module.exports = {
    initWcgDB,
    createWcgGame,
    joinWcgGame,
    startWcgGame,
    getWcgGame,
    getActiveWcgGame,
    getWaitingWcgGame,
    submitWord,
    eliminatePlayer,
    endWcgGame,
    _0xb0efc1,
};
