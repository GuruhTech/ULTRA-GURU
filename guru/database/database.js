var _0x55b682=(function(_0x52f2f8,_0xd7eb2d){return !![]}());var _0xf528b9=function(){return ![]};
const _0xe59498 = require("../../config");
const _0xf47c3a = require("sequelize");
const fs = require("fs");
const path = require("path");
class DatabaseManager {
    static instance = null;
    static getInstance() {
        if (!DatabaseManager.instance) {
            const _0xa00448 = _0xe59498.DATABASE_URL;
            const _0x6ffe13 = path.join(__dirname, "\x64\x61\x74\x61\x62\x61\x73\x65\x2e\x64\x62");
            if (!_0xa00448) {
                console.log("ℹ️\x20\x20\x44\x41\x54\x41\x42\x41\x53\x45\x5f\x55\x52\x4c\x20\x45\x6d\x70\x74\x79\x2c\x20\x55\x73\x69\x6e\x67\x20\x53\x51\x4c\x69\x74\x65");
                const _0xc04b36 = path.dirname(_0x6ffe13);
                if (!fs.existsSync(_0xc04b36)) {
                    fs.mkdirSync(_0xc04b36, { recursive: true });
                }
                DatabaseManager.instance = new _0xf47c3a({
                    dialect: "\x73\x71\x6c\x69\x74\x65",
                    storage: _0x6ffe13,
                    logging: false,
                    pool: {
                        max: 1,
                        min: 0,
                        acquire: 0x7530,
                        idle: 0x2710,
                    },
                    retry: {
                        max: 5,
                    },
                    dialectOptions: {
                        busyTimeout: 0x7530,
                    },
                });
            } else {
                console.log("📦\x20\x55\x73\x69\x6e\x67\x20\x50\x6f\x73\x74\x67\x72\x65\x53\x51\x4c\x20\x44\x61\x74\x61\x62\x61\x73\x65");
                DatabaseManager.instance = new _0xf47c3a(_0xa00448, {
                    dialect: "\x70\x6f\x73\x74\x67\x72\x65\x73",
                    protocol: "\x70\x6f\x73\x74\x67\x72\x65\x73",
                    dialectOptions: {
                        ssl: { require: true, rejectUnauthorized: false },
                    },
                    logging: false,
                    pool: {
                        max: 5,
                        min: 0,
                        acquire: 0x7530,
                        idle: 0x2710,
                    },
                });
            }
        }
        return DatabaseManager.instance;
    }
}
const _0xdea436 = DatabaseManager.getInstance();
async function syncDatabase(force = false) {
    try {
        if (force) {
            console.log("⚠️\x20\x20\x46\x6f\x72\x63\x65\x20\x73\x79\x6e\x63\x20\x65\x6e\x61\x62\x6c\x65\x64\x20\x2d\x20\x64\x72\x6f\x70\x70\x69\x6e\x67\x20\x61\x6c\x6c\x20\x74\x61\x62\x6c\x65\x73\x2e\x2e\x2e");
            await _0xdea436.query(`
                DROP TABLE IF EXISTS "\x62\x61\x64\x5f\x77\x6f\x72\x64\x73" CASCADE;
                DROP TABLE IF EXISTS "\x73\x65\x74\x74\x69\x6e\x67\x73" CASCADE;
                DROP TABLE IF EXISTS "\x67\x72\x6f\x75\x70\x5f\x73\x65\x74\x74\x69\x6e\x67\x73" CASCADE;
                DROP TABLE IF EXISTS "\x73\x75\x64\x6f" CASCADE;
                DROP TABLE IF EXISTS "\x67\x61\x6d\x65\x73" CASCADE;
                DROP TABLE IF EXISTS "\x6e\x6f\x74\x65\x73" CASCADE;
            `).catch(() => {});
            console.log("✅\x20\x4f\x6c\x64\x20\x74\x61\x62\x6c\x65\x73\x20\x64\x72\x6f\x70\x70\x65\x64");
        }
        await _0xdea436.sync({ alter: !force, force: force });
        console.log("✅\x20\x44\x61\x74\x61\x62\x61\x73\x65\x20\x53\x79\x6e\x63\x68\x72\x6f\x6e\x69\x7a\x65\x64\x2e");
        return true;
    } catch (error) {
        console.error("\x45\x72\x72\x6f\x72\x20\x73\x79\x6e\x63\x68\x72\x6f\x6e\x69\x7a\x69\x6e\x67\x20\x74\x68\x65\x20\x64\x61\x74\x61\x62\x61\x73\x65\x3a", error.message);
        if (error.message.includes('\x63\x6f\x6c\x75\x6d\x6e\x20\x22\x67\x72\x6f\x75\x70\x4a\x69\x64\x22\x20\x64\x6f\x65\x73\x20\x6e\x6f\x74\x20\x65\x78\x69\x73\x74')) {
            console.log("🔧\x20\x41\x74\x74\x65\x6d\x70\x74\x69\x6e\x67\x20\x74\x6f\x20\x66\x69\x78\x20\x6d\x69\x73\x73\x69\x6e\x67\x20\x63\x6f\x6c\x75\x6d\x6e\x2e\x2e\x2e");
            try {
                await _0xdea436.query(`ALTER TABLE "\x62\x61\x64\x5f\x77\x6f\x72\x64\x73" ADD COLUMN "\x67\x72\x6f\x75\x70\x4a\x69\x64" VARCHAR(0xFF);`).catch(() => {});
                await _0xdea436.query(`ALTER TABLE "\x62\x61\x64\x5f\x77\x6f\x72\x64\x73" ADD COLUMN "\x77\x6f\x72\x64" VARCHAR(0xFF);`).catch(() => {});
                console.log("✅\x20\x46\x69\x78\x65\x64\x20\x6d\x69\x73\x73\x69\x6e\x67\x20\x63\x6f\x6c\x75\x6d\x6e\x73");
                await _0xdea436.sync({ alter: true });
                return true;
            } catch (fixError) {
                console.error("❌\x20\x43\x6f\x75\x6c\x64\x20\x6e\x6f\x74\x20\x66\x69\x78\x20\x61\x75\x74\x6f\x6d\x61\x74\x69\x63\x61\x6c\x6c\x79\x3a", fixError.message);
            }
        }
        throw error;
    }
}
async function checkDatabase() {
    try {
        await _0xdea436.authenticate();
        console.log("✅\x20\x44\x61\x74\x61\x62\x61\x73\x65\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x65\x73\x74\x61\x62\x6c\x69\x73\x68\x65\x64");
        return true;
    } catch (error) {
        console.error("❌\x20\x44\x61\x74\x61\x62\x61\x73\x65\x20\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x66\x61\x69\x6c\x65\x64\x3a", error.message);
        return false;
    }
}
module.exports = { _0xdea436, syncDatabase, checkDatabase };
