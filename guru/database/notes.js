
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'guru', 'session', 'notes.db');

let _db = null;

function getDb() {
    if (_db) return _db;
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    return _db;
}

function initNotesDB() {
    const db = getDb();
    db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jid TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS idx_notes_jid ON notes(jid);
    `);
}

async function addNote(jid, title, content) {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO notes (jid, title, content) VALUES (?, ?, ?)');
    const result = stmt.run(jid, title, content);
    return result.lastInsertRowid;
}

async function getNote(jid, title) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM notes WHERE jid = ? AND title = ? ORDER BY created_at DESC LIMIT 1').get(jid, title);
    return row || null;
}

async function getNoteById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) || null;
}

async function getAllNotes(jid) {
    const db = getDb();
    return db.prepare('SELECT * FROM notes WHERE jid = ? ORDER BY created_at DESC').all(jid);
}

async function getAllUsersNotes() {
    const db = getDb();
    return db.prepare('SELECT * FROM notes ORDER BY jid, created_at DESC').all();
}

async function updateNote(jid, title, content) {
    const db = getDb();
    const result = db.prepare('UPDATE notes SET content = ?, updated_at = unixepoch() WHERE jid = ? AND title = ?').run(content, jid, title);
    return result.changes > 0;
}

async function updateNoteById(id, content) {
    const db = getDb();
    const result = db.prepare('UPDATE notes SET content = ?, updated_at = unixepoch() WHERE id = ?').run(content, id);
    if (result.changes > 0) return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    return null;
}

async function deleteNote(jid, title) {
    const db = getDb();
    const result = db.prepare('DELETE FROM notes WHERE jid = ? AND title = ?').run(jid, title);
    return result.changes > 0;
}

async function deleteNoteById(id) {
    const db = getDb();
    const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return result.changes > 0;
}

async function deleteAllNotes(jid) {
    const db = getDb();
    const result = db.prepare('DELETE FROM notes WHERE jid = ?').run(jid);
    return result.changes;
}

const NotesDB = { initNotesDB, addNote, getNote, getAllNotes, updateNote, deleteNote, getAllUsersNotes };

module.exports = {
    initNotesDB,
    addNote,
    getNote,
    getNoteById,
    getAllNotes,
    getAllUsersNotes,
    updateNote,
    updateNoteById,
    deleteNote,
    deleteNoteById,
    deleteAllNotes,
    NotesDB,
};
