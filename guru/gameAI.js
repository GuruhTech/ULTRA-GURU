
const BOT_JID = process.env.BOT_JID || 'bot@s.whatsapp.net';

function findBestTttMove(board) {
    if (!board || !Array.isArray(board)) return -1;

    function checkWinner(b) {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const [a, b2, c] of lines) {
            if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
        }
        return null;
    }

    function minimax(b, isMaximizing) {
        const winner = checkWinner(b);
        if (winner === 'O') return 10;
        if (winner === 'X') return -10;
        if (b.every(c => c !== null && c !== undefined && c !== '')) return 0;

        if (isMaximizing) {
            let best = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!b[i] || b[i] === '') {
                    b[i] = 'O';
                    best = Math.max(best, minimax(b, false));
                    b[i] = '';
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!b[i] || b[i] === '') {
                    b[i] = 'X';
                    best = Math.min(best, minimax(b, true));
                    b[i] = '';
                }
            }
            return best;
        }
    }

    let bestVal = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (!board[i] || board[i] === '') {
            board[i] = 'O';
            const moveVal = minimax(board, false);
            board[i] = '';
            if (moveVal > bestVal) {
                bestVal = moveVal;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

const WORD_LIST = ['apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'garden', 'happy',
    'island', 'jungle', 'knight', 'lemon', 'mango', 'nature', 'ocean', 'python',
    'queen', 'river', 'sunset', 'tiger', 'unique', 'violet', 'water', 'xenon',
    'yellow', 'zebra', 'amazing', 'beautiful', 'creative', 'dynamic'];

function findWcgWord(lastLetter, usedWords = []) {
    const candidates = WORD_LIST.filter(w =>
        (!lastLetter || w.startsWith(lastLetter.toLowerCase())) &&
        !usedWords.includes(w)
    );
    if (candidates.length === 0) {
        return WORD_LIST.find(w => !usedWords.includes(w)) || 'word';
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
}

module.exports = {
    findBestTttMove,
    rollDice,
    findWcgWord,
    BOT_JID,
};
