
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'guru', 'session', 'tempmail.db');
const EXPIRY_MINUTES = 60;

let _db = null;

function getDb() {
    if (_db) return _db;
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    return _db;
}

function initTempMailDB() {
    const db = getDb();
    db.exec(`
        CREATE TABLE IF NOT EXISTS tempmail (
            jid TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            expires_at INTEGER NOT NULL
        );
    `);
}

async function setUserEmail(jid, email) {
    const db = getDb();
    const expiresAt = Math.floor(Date.now() / 1000) + (EXPIRY_MINUTES * 60);
    db.prepare('INSERT OR REPLACE INTO tempmail (jid, email, expires_at) VALUES (?, ?, ?)').run(jid, email, expiresAt);
    return true;
}

async function getUserEmail(jid) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM tempmail WHERE jid = ? AND expires_at > unixepoch()').get(jid);
    return row ? row.email : null;
}

async function getUserEmailWithExpiry(jid) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM tempmail WHERE jid = ? AND expires_at > unixepoch()').get(jid);
    if (!row) return null;
    const remaining = Math.max(0, row.expires_at - Math.floor(Date.now() / 1000));
    return { email: row.email, remaining, expiresAt: row.expires_at };
}

async function deleteUserEmail(jid) {
    const db = getDb();
    const result = db.prepare('DELETE FROM tempmail WHERE jid = ?').run(jid);
    return result.changes > 0;
}

module.exports = {
    initTempMailDB,
    setUserEmail,
    getUserEmail,
    getUserEmailWithExpiry,
    deleteUserEmail,
    EXPIRY_MINUTES,
};
