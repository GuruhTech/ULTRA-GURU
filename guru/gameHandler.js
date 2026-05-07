
const gameTimeouts = new Map();
const diceTimeouts = new Map();
const wcgTimeouts = new Map();

function clearGameTimeout(jid) {
    if (gameTimeouts.has(jid)) {
        clearTimeout(gameTimeouts.get(jid));
        gameTimeouts.delete(jid);
    }
}

function clearDiceTimeout(jid) {
    if (diceTimeouts.has(jid)) {
        clearTimeout(diceTimeouts.get(jid));
        diceTimeouts.delete(jid);
    }
}

function setMoveTimeout(jid, callback, ms = 60000) {
    clearGameTimeout(jid);
    const t = setTimeout(() => {
        gameTimeouts.delete(jid);
        callback();
    }, ms);
    gameTimeouts.set(jid, t);
}

function setWcgTurnTimeout(jid, callback, ms = 60000) {
    if (wcgTimeouts.has(jid)) {
        clearTimeout(wcgTimeouts.get(jid));
    }
    const t = setTimeout(() => {
        wcgTimeouts.delete(jid);
        callback();
    }, ms);
    wcgTimeouts.set(jid, t);
}

function setDiceTurnTimeout(jid, callback, ms = 60000) {
    clearDiceTimeout(jid);
    const t = setTimeout(() => {
        diceTimeouts.delete(jid);
        callback();
    }, ms);
    diceTimeouts.set(jid, t);
}

function renderBoard(board) {
    if (!board || !Array.isArray(board)) {
        return '❌|❌|❌\n➖➖➖\n❌|❌|❌\n➖➖➖\n❌|❌|❌';
    }
    const symbols = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const cells = board.map((cell, i) => {
        if (cell === 'X') return '❌';
        if (cell === 'O') return '⭕';
        return symbols[i];
    });
    return `${cells[0]}|${cells[1]}|${cells[2]}\n➖➖➖\n${cells[3]}|${cells[4]}|${cells[5]}\n➖➖➖\n${cells[6]}|${cells[7]}|${cells[8]}`;
}

function getPlayerName(jid) {
    if (!jid) return 'Unknown';
    return jid.split('@')[0];
}

async function handleAiTttMove(game, board) {
    const { findBestTttMove } = require('./gameAI');
    const move = findBestTttMove(board);
    return move;
}

module.exports = {
    clearGameTimeout,
    clearDiceTimeout,
    setMoveTimeout,
    setWcgTurnTimeout,
    setDiceTurnTimeout,
    renderBoard,
    getPlayerName,
    handleAiTttMove,
    gameTimeouts,
    diceTimeouts,
    wcgTimeouts,
};
