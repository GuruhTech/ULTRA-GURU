var _0xad0391=(function(_0xb0649a,_0xe5eed7){return !![]}());var _0x5630b0=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes, Op } = require('sequelize');
const _0x54bb84 = 0xA;
const _0xeca692 = DATABASE.define('\x54\x65\x6d\x70\x4d\x61\x69\x6c', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userJid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    _0x51d05d: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: '\x74\x65\x6d\x70\x5f\x6d\x61\x69\x6c\x73',
    timestamps: true,
});
async function initTempMailDB() {
    await _0xeca692.sync();
    cleanupExpiredEmails();
}
async function cleanupExpiredEmails() {
    try {
        const _0x1868b4 = new Date(Date.now() - _0x54bb84 * 0x3C * 0x3E8);
        const _0x27cb6c = await _0xeca692.destroy({
            where: {
                _0x51d05d: { [Op.lt]: _0x1868b4 }
            }
        });
        if (_0x27cb6c > 0) {
            console.log(`[TempMail] Auto-_0x27cb6c ${_0x27cb6c} expired email(s)`);
        }
    } catch (e) {
        console.error("\x5b\x54\x65\x6d\x70\x4d\x61\x69\x6c\x5d\x20\x43\x6c\x65\x61\x6e\x75\x70\x20\x65\x72\x72\x6f\x72\x3a", e.message);
    }
}
setInterval(cleanupExpiredEmails, 0x3C * 0x3E8);
async function setUserEmail(userJid, email) {
    await initTempMailDB();
    const _0x1dbec6 = await _0xeca692.findOne({ where: { userJid } });
    if (_0x1dbec6) {
        _0x1dbec6.email = email;
        _0x1dbec6.createdAt = new Date();
        await _0x1dbec6.save();
        return _0x1dbec6;
    }
    return await _0xeca692.create({ userJid, email });
}
async function getUserEmailWithExpiry(userJid) {
    await initTempMailDB();
    const _0x7e3dee = await _0xeca692.findOne({ where: { userJid } });
    if (!_0x7e3dee) return null;
    const _0x51d05d = new Date(_0x7e3dee.createdAt);
    const _0xf9007b = new Date(_0x51d05d.getTime() + _0x54bb84 * 0x3C * 0x3E8);
    const _0xc5c8cd = new Date();
    if (_0xc5c8cd >= _0xf9007b) {
        await _0xeca692.destroy({ where: { userJid } });
        return null;
    }
    const _0x2a272d = _0xf9007b - _0xc5c8cd;
    const _0x5963e1 = Math.floor(_0x2a272d / 0xEA60);
    const _0xb39329 = Math.floor((_0x2a272d % 0xEA60) / 0x3E8);
    return {
        email: _0x7e3dee.email,
        _0x51d05d: _0x51d05d,
        _0xf9007b: _0xf9007b,
        _0x2a272d: _0x2a272d,
        _0x5963e1: _0x5963e1,
        _0xb39329: _0xb39329,
        timeRemaining: _0x5963e1 > 0 ? `${_0x5963e1}m ${_0xb39329}s` : `${_0xb39329}s`
    };
}
async function getUserEmail(userJid) {
    const _0x8c70d0 = await getUserEmailWithExpiry(userJid);
    return _0x8c70d0 ? _0x8c70d0.email : null;
}
async function deleteUserEmail(userJid) {
    await initTempMailDB();
    const _0xf13328 = await _0xeca692.destroy({ where: { userJid } });
    return _0xf13328 > 0;
}
module.exports = {
    initTempMailDB,
    setUserEmail,
    getUserEmail,
    getUserEmailWithExpiry,
    deleteUserEmail,
    cleanupExpiredEmails,
    _0xeca692,
    _0x54bb84,
};
