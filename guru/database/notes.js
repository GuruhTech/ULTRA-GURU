var _0x423028=(function(_0x0449fb,_0xd4a4f5){return !![]}());var _0xfd15e1=function(){return ![]};
const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');
const _0xedfe44 = DATABASE.define('\x55\x73\x65\x72\x4e\x6f\x74\x65', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userJid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    _0x158081: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: '\x75\x73\x65\x72\x5f\x6e\x6f\x74\x65\x73',
    timestamps: true,
    indexes: [
        { fields: ['\x75\x73\x65\x72\x4a\x69\x64', '\x6e\x6f\x74\x65\x4e\x75\x6d\x62\x65\x72'], unique: true }
    ]
});
async function initNotesDB() {
    await _0xedfe44.sync();
}
async function addNote(userJid, content) {
    await initNotesDB();
    const _0xf151db = await _0xedfe44.findOne({
        where: { userJid },
        order: [['\x6e\x6f\x74\x65\x4e\x75\x6d\x62\x65\x72', '\x44\x45\x53\x43']]
    });
    const _0x158081 = _0xf151db ? _0xf151db.noteNumber + 1 : 1;
    const _0x02a094 = await _0xedfe44.create({
        userJid,
        _0x158081,
        content
    });
    return _0x02a094;
}
async function getNote(userJid, _0x158081) {
    await initNotesDB();
    return await _0xedfe44.findOne({
        where: { userJid, _0x158081 }
    });
}
async function getAllNotes(userJid) {
    await initNotesDB();
    return await _0xedfe44.findAll({
        where: { userJid },
        order: [['\x6e\x6f\x74\x65\x4e\x75\x6d\x62\x65\x72', '\x41\x53\x43']]
    });
}
async function updateNote(userJid, _0x158081, newContent) {
    await initNotesDB();
    const _0x02a094 = await _0xedfe44.findOne({
        where: { userJid, _0x158081 }
    });
    if (!_0x02a094) return null;
    _0x02a094.content = newContent;
    await _0x02a094.save();
    return _0x02a094;
}
async function deleteNote(userJid, _0x158081) {
    await initNotesDB();
    const _0x89bcec = await _0xedfe44.destroy({
        where: { userJid, _0x158081 }
    });
    if (_0x89bcec > 0) {
        await renumberNotes(userJid);
    }
    return _0x89bcec > 0;
}
async function renumberNotes(userJid) {
    await initNotesDB();
    const _0x06fa15 = await _0xedfe44.findAll({
        where: { userJid },
        order: [['\x6e\x6f\x74\x65\x4e\x75\x6d\x62\x65\x72', '\x41\x53\x43']]
    });
    for (let i = 0; i < _0x06fa15.length; i++) {
        const _0x0f8bd7 = i + 1;
        if (_0x06fa15[i].noteNumber !== _0x0f8bd7) {
            _0x06fa15[i].noteNumber = _0x0f8bd7;
            await _0x06fa15[i].save();
        }
    }
}
async function deleteAllNotes(userJid) {
    await initNotesDB();
    const _0x89bcec = await _0xedfe44.destroy({
        where: { userJid }
    });
    return _0x89bcec;
}
async function getAllUsersNotes() {
    await initNotesDB();
    return await _0xedfe44.findAll({
        order: [['\x75\x73\x65\x72\x4a\x69\x64', '\x41\x53\x43'], ['\x6e\x6f\x74\x65\x4e\x75\x6d\x62\x65\x72', '\x41\x53\x43']]
    });
}
async function deleteNoteById(id) {
    await initNotesDB();
    const _0x89bcec = await _0xedfe44.destroy({
        where: { id }
    });
    return _0x89bcec > 0;
}
async function updateNoteById(id, newContent) {
    await initNotesDB();
    const _0x02a094 = await _0xedfe44.findByPk(id);
    if (!_0x02a094) return null;
    _0x02a094.content = newContent;
    await _0x02a094.save();
    return _0x02a094;
}
module.exports = {
    initNotesDB,
    addNote,
    getNote,
    getAllNotes,
    updateNote,
    deleteNote,
    deleteAllNotes,
    getAllUsersNotes,
    deleteNoteById,
    updateNoteById,
    _0xedfe44,
};
