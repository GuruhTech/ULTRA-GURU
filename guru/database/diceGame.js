var _0xd11a56=(function(_0x511011,_0x82a141){return !![]}());var _0x174602=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');
const _0x77a6ab = DATABASE.define('\x44\x69\x63\x65\x47\x61\x6d\x65', {
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
    player1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    player2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    player1Roll: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    player2Roll: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    currentTurn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rounds: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
    },
    currentRound: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    player1Score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    player2Score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('\x77\x61\x69\x74\x69\x6e\x67', '\x61\x63\x74\x69\x76\x65', '\x72\x6f\x6c\x6c\x69\x6e\x67', '\x66\x69\x6e\x69\x73\x68\x65\x64'),
        defaultValue: '\x77\x61\x69\x74\x69\x6e\x67',
    },
    isAiGame: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: '\x64\x69\x63\x65\x5f\x67\x61\x6d\x65\x73',
    timestamps: true,
});
let _0x321f4b = false;
async function initDiceDB() {
    if (_0x321f4b) return;
    try {
        await _0x77a6ab.sync();
        _0x321f4b = true;
    } catch (error) {
        console.error('\x44\x69\x63\x65\x44\x42\x20\x73\x79\x6e\x63\x20\x65\x72\x72\x6f\x72\x3a', error.message);
    }
}
async function createDiceGame(chatJid, player1, rounds = 3) {
    await initDiceDB();
    await _0x77a6ab.destroy({ where: { chatJid } });
    const _0x0822d4 = await _0x77a6ab.create({
        chatJid,
        player1,
        player2: null,
        player1Roll: null,
        player2Roll: null,
        currentTurn: null,
        rounds: Math.min(Math.max(rounds, 1), 0xA),
        currentRound: 1,
        player1Score: 0,
        player2Score: 0,
        status: '\x77\x61\x69\x74\x69\x6e\x67',
    });
    return _0x0822d4;
}
async function joinDiceGame(chatJid, player2) {
    await initDiceDB();
    const _0x0822d4 = await _0x77a6ab.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
    if (!_0x0822d4) return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    if (_0x0822d4.player1 === player2) return { error: '\x73\x61\x6d\x65\x5f\x70\x6c\x61\x79\x65\x72' };
    _0x0822d4.player2 = player2;
    _0x0822d4.status = '\x61\x63\x74\x69\x76\x65';
    _0x0822d4.currentTurn = _0x0822d4.player1;
    await _0x0822d4.save();
    return {
        player1: _0x0822d4.player1,
        player2: _0x0822d4.player2,
        rounds: _0x0822d4.rounds,
        _0x0822d4
    };
}
async function getDiceGame(chatJid) {
    await initDiceDB();
    return await _0x77a6ab.findOne({ where: { chatJid } });
}
async function getActiveDiceGame(chatJid) {
    await initDiceDB();
    return await _0x77a6ab.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
}
async function getWaitingDiceGame(chatJid) {
    await initDiceDB();
    return await _0x77a6ab.findOne({
        where: { chatJid, status: '\x77\x61\x69\x74\x69\x6e\x67' }
    });
}
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}
async function playerRoll(chatJid, player) {
    await initDiceDB();
    const _0x0822d4 = await _0x77a6ab.findOne({
        where: { chatJid, status: '\x61\x63\x74\x69\x76\x65' }
    });
    if (!_0x0822d4) return { error: '\x6e\x6f\x5f\x67\x61\x6d\x65' };
    if (_0x0822d4.currentTurn !== player) return { error: '\x6e\x6f\x74\x5f\x79\x6f\x75\x72\x5f\x74\x75\x72\x6e' };
    const _0xbb406f = rollDice();
    const _0xcaff0d = player === _0x0822d4.player1;
    if (_0xcaff0d) {
        _0x0822d4.player1Roll = _0xbb406f;
        _0x0822d4.currentTurn = _0x0822d4.player2;
    } else {
        _0x0822d4.player2Roll = _0xbb406f;
    }
    await _0x0822d4.save();
    if (_0x0822d4.player1Roll !== null && _0x0822d4.player2Roll !== null) {
        let _0xf5f4e9 = null;
        if (_0x0822d4.player1Roll > _0x0822d4.player2Roll) {
            _0x0822d4.player1Score += 1;
            _0xf5f4e9 = _0x0822d4.player1;
        } else if (_0x0822d4.player2Roll > _0x0822d4.player1Roll) {
            _0x0822d4.player2Score += 1;
            _0xf5f4e9 = _0x0822d4.player2;
        }
        const _0x4540de = {
            _0xbb406f,
            player1Roll: _0x0822d4.player1Roll,
            player2Roll: _0x0822d4.player2Roll,
            _0xf5f4e9,
            player1Score: _0x0822d4.player1Score,
            player2Score: _0x0822d4.player2Score,
            currentRound: _0x0822d4.currentRound,
            player1: _0x0822d4.player1,
            player2: _0x0822d4.player2,
        };
        if (_0x0822d4.currentRound >= _0x0822d4.rounds) {
            _0x0822d4.status = '\x66\x69\x6e\x69\x73\x68\x65\x64';
            await _0x0822d4.save();
            let _0xc24154 = null;
            if (_0x0822d4.player1Score > _0x0822d4.player2Score) {
                _0xc24154 = _0x0822d4.player1;
            } else if (_0x0822d4.player2Score > _0x0822d4.player1Score) {
                _0xc24154 = _0x0822d4.player2;
            }
            return {
                ...roundResult,
                gameFinished: true,
                _0xc24154,
                finalScore: {
                    [_0x0822d4.player1]: _0x0822d4.player1Score,
                    [_0x0822d4.player2]: _0x0822d4.player2Score,
                }
            };
        }
        _0x0822d4.currentRound += 1;
        _0x0822d4.player1Roll = null;
        _0x0822d4.player2Roll = null;
        _0x0822d4.currentTurn = _0x0822d4.player1;
        await _0x0822d4.save();
        return {
            ...roundResult,
            nextRound: _0x0822d4.currentRound,
            roundComplete: true,
        };
    }
    return {
        _0xbb406f,
        waitingFor: _0x0822d4.currentTurn,
        player1: _0x0822d4.player1,
        player2: _0x0822d4.player2,
    };
}
async function endDiceGame(chatJid) {
    await initDiceDB();
    await _0x77a6ab.destroy({ where: { chatJid } });
}
module.exports = {
    initDiceDB,
    createDiceGame,
    joinDiceGame,
    getDiceGame,
    getActiveDiceGame,
    getWaitingDiceGame,
    playerRoll,
    endDiceGame,
    rollDice,
    _0x77a6ab,
};
