var _0xca1cb6=(function(_0x56d037,_0x2f47e3){return !![]}());var _0xb3726f=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');
const _0x2a8a86 = DATABASE.define('\x55\x70\x64\x61\x74\x65\x49\x6e\x66\x6f', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    commitHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: '\x75\x70\x64\x61\x74\x65\x5f\x69\x6e\x66\x6f',
    timestamps: false,
    hooks: {
        beforeCreate: (_0xa4475b) => { _0xa4475b.id = 1; },
        beforeBulkCreate: (records) => {
            records.forEach(_0xa4475b => { _0xa4475b.id = 1; });
        },
    },
});
async function initializeUpdateDB() {
    await _0x2a8a86.sync();
    const [_0xa4475b, created] = await _0x2a8a86.findOrCreate({
        where: { id: 1 },
        defaults: { commitHash: '\x75\x6e\x6b\x6e\x6f\x77\x6e' },
    });
    return _0xa4475b;
}
async function setCommitHash(hash) {
    await initializeUpdateDB();
    const _0xa4475b = await _0x2a8a86.findByPk(1);
    _0xa4475b.commitHash = hash;
    await _0xa4475b.save();
}
async function getCommitHash() {
    await initializeUpdateDB();
    const _0xa4475b = await _0x2a8a86.findByPk(1);
    return _0xa4475b ? _0xa4475b.commitHash : '\x75\x6e\x6b\x6e\x6f\x77\x6e';
}
module.exports = {
    _0x2a8a86,
    setCommitHash,
    getCommitHash,
};
