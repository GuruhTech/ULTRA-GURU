
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'guru', 'session', 'wcg.db');

let _db = null;

function getDb() {
    if (_db) return _db;
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    return _db;
}

function initWcgDB() {
    const db = getDb();
    db.exec(`
        CREATE TABLE IF NOT EXISTS wcg_games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jid TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'waiting',
            players TEXT NOT NULL DEFAULT '[]',
            eliminated TEXT NOT NULL DEFAULT '[]',
            words TEXT NOT NULL DEFAULT '[]',
            current_player TEXT,
            last_word TEXT,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
    `);
}

function parseGame(row) {
    if (!row) return null;
    return {
        ...row,
        players: JSON.parse(row.players || '[]'),
        eliminated: JSON.parse(row.eliminated || '[]'),
        words: JSON.parse(row.words || '[]'),
    };
}

async function createWcgGame(jid, creatorJid) {
    const db = getDb();
    const result = db.prepare('INSERT INTO wcg_games (jid, players) VALUES (?, ?)').run(jid, JSON.stringify([creatorJid]));
    return parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(result.lastInsertRowid));
}

async function joinWcgGame(gameId, playerJid) {
    const db = getDb();
    const game = parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
    if (!game) return null;
    if (!game.players.includes(playerJid)) game.players.push(playerJid);
    db.prepare('UPDATE wcg_games SET players = ?, updated_at = unixepoch() WHERE id = ?').run(JSON.stringify(game.players), gameId);
    return parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
}

async function startWcgGame(gameId) {
    const db = getDb();
    const game = parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
    if (!game) return null;
    const firstPlayer = game.players[0];
    db.prepare("UPDATE wcg_games SET status = 'active', current_player = ?, updated_at = unixepoch() WHERE id = ?").run(firstPlayer, gameId);
    return parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
}

async function getActiveWcgGame(jid) {
    const db = getDb();
    return parseGame(db.prepare("SELECT * FROM wcg_games WHERE jid = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(jid));
}

async function getWaitingWcgGame(jid) {
    const db = getDb();
    return parseGame(db.prepare("SELECT * FROM wcg_games WHERE jid = ? AND status = 'waiting' ORDER BY created_at DESC LIMIT 1").get(jid));
}

async function submitWord(gameId, playerJid, word) {
    const db = getDb();
    const game = parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
    if (!game) return null;
    game.words.push({ player: playerJid, word });
    const activePlayers = game.players.filter(p => !game.eliminated.includes(p));
    const idx = activePlayers.indexOf(playerJid);
    const nextPlayer = activePlayers[(idx + 1) % activePlayers.length];
    db.prepare('UPDATE wcg_games SET words = ?, current_player = ?, last_word = ?, updated_at = unixepoch() WHERE id = ?')
        .run(JSON.stringify(game.words), nextPlayer, word, gameId);
    return parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
}

async function eliminatePlayer(gameId, playerJid) {
    const db = getDb();
    const game = parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
    if (!game) return null;
    if (!game.eliminated.includes(playerJid)) game.eliminated.push(playerJid);
    db.prepare('UPDATE wcg_games SET eliminated = ?, updated_at = unixepoch() WHERE id = ?').run(JSON.stringify(game.eliminated), gameId);
    return parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
}

async function endWcgGame(gameId) {
    const db = getDb();
    db.prepare("UPDATE wcg_games SET status = 'ended', updated_at = unixepoch() WHERE id = ?").run(gameId);
    return parseGame(db.prepare('SELECT * FROM wcg_games WHERE id = ?').get(gameId));
}

const WcgDB = { getDb };

module.exports = {
    initWcgDB,
    createWcgGame,
    joinWcgGame,
    startWcgGame,
    getActiveWcgGame,
    getWaitingWcgGame,
    submitWord,
    eliminatePlayer,
    endWcgGame,
    WcgDB,
};
