var _0xdce936=(function(_0xae9196,_0xdf16aa){return !![]}());var _0x08dcd4=function(){return ![]};
const { DATABASE } = require("./database");
const { DataTypes } = require("sequelize");
const _0x48a28c = new Map();
const _0xff4b4d = DATABASE.define(
    "\x4c\x69\x64\x4d\x61\x70\x70\x69\x6e\x67",
    {
        lid: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        jid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "\x6c\x69\x64\x5f\x6d\x61\x70\x70\x69\x6e\x67",
        timestamps: true,
    },
);
async function syncLidMappingTable() {
    await _0xff4b4d.sync();
}
async function loadPersistedLidMappings() {
    try {
        await syncLidMappingTable();
        const _0xa051e1 = await _0xff4b4d.findAll();
        let _0x6956f4 = 0;
        for (const _0x093e73 of _0xa051e1) {
            _0x48a28c.set(_0x093e73.lid, _0x093e73.jid);
            _0x6956f4++;
        }
        if (_0x6956f4 > 0) {
            console.log(`✅ Loaded ${_0x6956f4} persisted LID mappings into globalLidMapping`);
        }
    } catch (err) {
        console.error("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x6c\x6f\x61\x64\x20\x70\x65\x72\x73\x69\x73\x74\x65\x64\x20\x4c\x49\x44\x20\x6d\x61\x70\x70\x69\x6e\x67\x73\x3a", err.message);
    }
}
async function persistLidMapping(lid, jid) {
    try {
        if (!lid || !jid) return;
        if (!lid.endsWith("@lid") || !jid.endsWith("@s.whatsapp.net")) return;
        await _0xff4b4d.upsert({ lid, jid });
    } catch (err) {
    }
}
async function getLidMappingFromDb(lid) {
    try {
        if (!lid || !lid.endsWith("@lid")) return null;
        await syncLidMappingTable();
        const _0x093e73 = await _0xff4b4d.findOne({ where: { lid } });
        return _0x093e73 ? _0x093e73.jid : null;
    } catch (err) {
        return null;
    }
}
module.exports = { loadPersistedLidMappings, persistLidMapping, getLidMappingFromDb };
