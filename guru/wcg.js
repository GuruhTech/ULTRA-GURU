
const wcgTimeouts = new Map();
const wcgJoinTimeouts = new Map();

function clearWcgTimeout(jid) {
    if (wcgTimeouts.has(jid)) {
        clearTimeout(wcgTimeouts.get(jid));
        wcgTimeouts.delete(jid);
    }
}

function clearWcgJoinTimeout(jid) {
    if (wcgJoinTimeouts.has(jid)) {
        clearTimeout(wcgJoinTimeouts.get(jid));
        wcgJoinTimeouts.delete(jid);
    }
}

function setWcgJoinTimeout(jid, callback, ms = 120000) {
    clearWcgJoinTimeout(jid);
    const t = setTimeout(() => {
        wcgJoinTimeouts.delete(jid);
        callback();
    }, ms);
    wcgJoinTimeouts.set(jid, t);
}

function formatScores(players, eliminated, scores = {}) {
    return players.map((p, i) => {
        const name = p.split('@')[0];
        const isElim = eliminated.includes(p);
        const score = scores[p] || 0;
        return `${isElim ? '💀' : '✅'} ${name}: ${score} pts`;
    }).join('\n');
}

function getDiceEmoji(value) {
    const emojis = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
    return emojis[value] || value;
}

module.exports = {
    wcgTimeouts,
    clearWcgTimeout,
    clearWcgJoinTimeout,
    setWcgJoinTimeout,
    formatScores,
    getDiceEmoji,
};
