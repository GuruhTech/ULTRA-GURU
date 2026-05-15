var _0xca4075=(function(_0xd71ae9,_0xfa9cb6){return !![]}());var _0x389fce=function(){return ![]};
const _0x713d1a = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const _0x44e4ae = path.join(process.cwd(), '\x67\x75\x72\x75\x2f\x73\x65\x73\x73\x69\x6f\x6e', '\x73\x74\x6f\x72\x65\x2e\x64\x62');
function safeStringify(obj) {
    return JSON.stringify(obj, (_, v) => {
        if (v instanceof Uint8Array || Buffer.isBuffer(v)) {
            return { __type: '\x42\x75\x66\x66\x65\x72', data: Buffer.from(v).toString('\x62\x61\x73\x65\x36\x34') };
        }
        return v;
    });
}
function safeParse(str) {
    return JSON.parse(str, (_, v) => {
        if (v && typeof v === '\x6f\x62\x6a\x65\x63\x74' && v.__type === '\x42\x75\x66\x66\x65\x72' && v.data) {
            return Buffer.from(v.data, '\x62\x61\x73\x65\x36\x34');
        }
        return v;
    });
}
let _0xa8bf19 = null;
let _0x9eb5f5 = {};
function getDb() {
    if (_0xa8bf19) return _0xa8bf19;
    fs.mkdirSync(path.dirname(_0x44e4ae), { recursive: true });
    _0xa8bf19 = new _0x713d1a(_0x44e4ae);
    _0xa8bf19.pragma('\x6a\x6f\x75\x72\x6e\x61\x6c\x5f\x6d\x6f\x64\x65\x20\x3d\x20\x57\x41\x4c');
    _0xa8bf19.pragma('\x73\x79\x6e\x63\x68\x72\x6f\x6e\x6f\x75\x73\x20\x3d\x20\x4e\x4f\x52\x4d\x41\x4c');
    _0xa8bf19.pragma('\x63\x61\x63\x68\x65\x5f\x73\x69\x7a\x65\x20\x3d\x20\x2d\x31\x30\x30\x30\x30');
    _0xa8bf19.pragma('\x74\x65\x6d\x70\x5f\x73\x74\x6f\x72\x65\x20\x3d\x20\x6d\x65\x6d\x6f\x72\x79');
    _0xa8bf19.exec(`
        CREATE TABLE IF NOT EXISTS msg_store (
            id      TEXT NOT NULL,
            jid     TEXT NOT NULL,
            data    TEXT NOT NULL,
            ts      INTEGER NOT NULL DEFAULT (unixepoch()),
            PRIMARY KEY (jid, id)
        );
        CREATE INDEX IF NOT EXISTS idx_msg_ts ON msg_store(ts);
        CREATE TABLE IF NOT EXISTS antidelete_store (
            id          TEXT NOT NULL,
            jid         TEXT NOT NULL,
            sender      TEXT,
            push_name   TEXT,
            data        TEXT NOT NULL,
            ts          INTEGER NOT NULL DEFAULT (unixepoch()),
            PRIMARY KEY (jid, id)
        );
        CREATE INDEX IF NOT EXISTS idx_ad_jid_ts ON antidelete_store(jid, ts);
        CREATE TRIGGER IF NOT EXISTS trim_msg_store AFTER INSERT ON msg_store
        BEGIN
            DELETE FROM msg_store WHERE jid = NEW.jid AND id NOT IN (
                SELECT id FROM msg_store WHERE jid = NEW.jid ORDER BY ts DESC LIMIT 0xC8
            );
        END;
        CREATE TRIGGER IF NOT EXISTS trim_antidelete AFTER INSERT ON antidelete_store
        BEGIN
            DELETE FROM antidelete_store WHERE jid = NEW.jid AND id NOT IN (
                SELECT id FROM antidelete_store WHERE jid = NEW.jid ORDER BY ts DESC LIMIT 0x64
            );
        END;
    `);
    _0x9eb5f5.saveMsg    = _0xa8bf19.prepare('\x49\x4e\x53\x45\x52\x54\x20\x4f\x52\x20\x52\x45\x50\x4c\x41\x43\x45\x20\x49\x4e\x54\x4f\x20\x6d\x73\x67\x5f\x73\x74\x6f\x72\x65\x20\x28\x69\x64\x2c\x20\x6a\x69\x64\x2c\x20\x64\x61\x74\x61\x2c\x20\x74\x73\x29\x20\x56\x41\x4c\x55\x45\x53\x20\x28\x3f\x2c\x20\x3f\x2c\x20\x3f\x2c\x20\x75\x6e\x69\x78\x65\x70\x6f\x63\x68\x28\x29\x29');
    _0x9eb5f5.loadMsg    = _0xa8bf19.prepare('\x53\x45\x4c\x45\x43\x54\x20\x64\x61\x74\x61\x20\x46\x52\x4f\x4d\x20\x6d\x73\x67\x5f\x73\x74\x6f\x72\x65\x20\x57\x48\x45\x52\x45\x20\x6a\x69\x64\x20\x3d\x20\x3f\x20\x41\x4e\x44\x20\x69\x64\x20\x3d\x20\x3f');
    _0x9eb5f5.saveAD     = _0xa8bf19.prepare('\x49\x4e\x53\x45\x52\x54\x20\x4f\x52\x20\x52\x45\x50\x4c\x41\x43\x45\x20\x49\x4e\x54\x4f\x20\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65\x5f\x73\x74\x6f\x72\x65\x20\x28\x69\x64\x2c\x20\x6a\x69\x64\x2c\x20\x73\x65\x6e\x64\x65\x72\x2c\x20\x70\x75\x73\x68\x5f\x6e\x61\x6d\x65\x2c\x20\x64\x61\x74\x61\x2c\x20\x74\x73\x29\x20\x56\x41\x4c\x55\x45\x53\x20\x28\x3f\x2c\x20\x3f\x2c\x20\x3f\x2c\x20\x3f\x2c\x20\x3f\x2c\x20\x75\x6e\x69\x78\x65\x70\x6f\x63\x68\x28\x29\x29');
    _0x9eb5f5.findAD     = _0xa8bf19.prepare('\x53\x45\x4c\x45\x43\x54\x20\x64\x61\x74\x61\x20\x46\x52\x4f\x4d\x20\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65\x5f\x73\x74\x6f\x72\x65\x20\x57\x48\x45\x52\x45\x20\x6a\x69\x64\x20\x3d\x20\x3f\x20\x41\x4e\x44\x20\x69\x64\x20\x3d\x20\x3f');
    _0x9eb5f5.delAD      = _0xa8bf19.prepare('\x44\x45\x4c\x45\x54\x45\x20\x46\x52\x4f\x4d\x20\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65\x5f\x73\x74\x6f\x72\x65\x20\x57\x48\x45\x52\x45\x20\x6a\x69\x64\x20\x3d\x20\x3f\x20\x41\x4e\x44\x20\x69\x64\x20\x3d\x20\x3f');
    _0x9eb5f5.cleanAD    = _0xa8bf19.prepare('\x44\x45\x4c\x45\x54\x45\x20\x46\x52\x4f\x4d\x20\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65\x5f\x73\x74\x6f\x72\x65\x20\x57\x48\x45\x52\x45\x20\x74\x73\x20\x3c\x20\x75\x6e\x69\x78\x65\x70\x6f\x63\x68\x28\x29\x20\x2d\x20\x38\x36\x34\x30\x30');
    _0x9eb5f5.cleanMsg   = _0xa8bf19.prepare('\x44\x45\x4c\x45\x54\x45\x20\x46\x52\x4f\x4d\x20\x6d\x73\x67\x5f\x73\x74\x6f\x72\x65\x20\x57\x48\x45\x52\x45\x20\x74\x73\x20\x3c\x20\x75\x6e\x69\x78\x65\x70\x6f\x63\x68\x28\x29\x20\x2d\x20\x36\x30\x34\x38\x30\x30');
    return _0xa8bf19;
}
function s(sql) {
    if (!_0x9eb5f5[sql]) _0x9eb5f5[sql] = getDb().prepare(sql);
    return _0x9eb5f5[sql];
}
function saveMsg(jid, message) {
    try {
        getDb();
        _0x9eb5f5.saveMsg.run(message.key.id, jid, safeStringify(message));
    } catch (e) {
        console.error('\x5b\x6d\x73\x67\x53\x74\x6f\x72\x65\x5d\x20\x73\x61\x76\x65\x3a', e.message);
    }
}
function loadMsg(jid, id) {
    try {
        getDb();
        const _0xd630db = _0x9eb5f5.loadMsg.get(jid, id);
        return _0xd630db ? safeParse(_0xd630db.data) : null;
    } catch (e) {
        return null;
    }
}
function saveAntiDelete(jid, message) {
    try {
        getDb();
        _0x9eb5f5.saveAD.run(
            message.key.id,
            jid,
            message.originalSender || null,
            message.originalPushName || null,
            safeStringify(message)
        );
    } catch (e) {
        console.error('\x5b\x61\x6e\x74\x69\x44\x65\x6c\x65\x74\x65\x53\x74\x6f\x72\x65\x5d\x20\x73\x61\x76\x65\x3a', e.message);
    }
}
function findAntiDelete(jid, id) {
    try {
        getDb();
        const _0xd630db = _0x9eb5f5.findAD.get(jid, id);
        return _0xd630db ? safeParse(_0xd630db.data) : null;
    } catch (e) {
        return null;
    }
}
function removeAntiDelete(jid, id) {
    try {
        getDb();
        _0x9eb5f5.delAD.run(jid, id);
    } catch (e) {}
}
function startCleanup() {
    setInterval(() => {
        try {
            getDb();
            _0x9eb5f5.cleanAD.run();
            _0x9eb5f5.cleanMsg.run();
        } catch (e) {}
    }, 0x493E0);
}
class SQLiteStore {
    constructor() {
        getDb();
    }
    loadMessage(jid, id) {
        return loadMsg(jid, id);
    }
    saveMessage(jid, message) {
        saveMsg(jid, message);
    }
    bind(ev) {
        this._handler = ({ messages }) => {
            setImmediate(() => {
                for (const msg of messages) {
                    if (msg.key?.remoteJid && msg.key?.id) {
                        this.saveMessage(msg.key.remoteJid, msg);
                    }
                }
            });
        };
        ev.on('\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74', this._handler);
    }
    destroy() {
    }
}
module.exports = {
    saveMsg,
    loadMsg,
    saveAntiDelete,
    findAntiDelete,
    removeAntiDelete,
    startCleanup,
    SQLiteStore,
};
