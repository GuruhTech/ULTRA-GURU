
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'guru', 'session', 'games.db');

let _db = null;

function getDb() {
    if (_db) return _db;
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    return _db;
}

function initGamesDB() {
    const db = getDb();
    db.exec(`
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jid TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'waiting',
            players TEXT NOT NULL DEFAULT '[]',
            board TEXT,
            current_player TEXT,
            winner TEXT,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS idx_games_jid ON games(jid);
        CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    `);
}

function parseGame(row) {
    if (!row) return null;
    return {
        ...row,
        players: JSON.parse(row.players || '[]'),
        board: row.board ? JSON.parse(row.board) : null,
    };
}

async function createGame(jid, type, creatorJid) {
    const db = getDb();
    const players = JSON.stringify([creatorJid]);
    const stmt = db.prepare('INSERT INTO games (jid, type, status, players) VALUES (?, ?, ?, ?)');
    const result = stmt.run(jid, type, 'waiting', players);
    return parseGame(db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid));
}

async function joinGame(gameId, playerJid) {
    const db = getDb();
    const game = parseGame(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId));
    if (!game) return null;
    if (!game.players.includes(playerJid)) game.players.push(playerJid);
    db.prepare('UPDATE games SET players = ?, updated_at = unixepoch() WHERE id = ?').run(JSON.stringify(game.players), gameId);
    return parseGame(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId));
}

async function getActiveGame(jid, type) {
    const db = getDb();
    return parseGame(db.prepare("SELECT * FROM games WHERE jid = ? AND type = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(jid, type));
}

async function getWaitingGame(jid, type) {
    const db = getDb();
    return parseGame(db.prepare("SELECT * FROM games WHERE jid = ? AND type = ? AND status = 'waiting' ORDER BY created_at DESC LIMIT 1").get(jid, type));
}

async function makeMove(gameId, playerJid, move) {
    const db = getDb();
    const game = parseGame(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId));
    if (!game) return null;
    if (game.board === null) game.board = [];
    game.board.push({ player: playerJid, move });
    const nextIdx = (game.players.indexOf(playerJid) + 1) % game.players.length;
    const nextPlayer = game.players[nextIdx];
    db.prepare('UPDATE games SET board = ?, current_player = ?, updated_at = unixepoch() WHERE id = ?')
        .run(JSON.stringify(game.board), nextPlayer, gameId);
    return parseGame(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId));
}

async function endGame(gameId, winner) {
    const db = getDb();
    db.prepare("UPDATE games SET status = 'ended', winner = ?, updated_at = unixepoch() WHERE id = ?").run(winner || null, gameId);
    return parseGame(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId));
}

const GamesDB = { getDb };

module.exports = {
    initGamesDB,
    createGame,
    joinGame,
    getActiveGame,
    getWaitingGame,
    makeMove,
    endGame,
    GamesDB,
};
