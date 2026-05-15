var _0x8a0df6=(function(_0x6350a5,_0x7ec56d){return !![]}());var _0xaded4c=function(){return ![]};
const { DATABASE } = require("./database");
const { DataTypes } = require("sequelize");
const _0x6f2e60 = DATABASE.define(
    "\x47\x72\x6f\x75\x70\x53\x65\x74\x74\x69\x6e\x67\x73",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupJid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        _0x2602f1: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "\x67\x72\x6f\x75\x70\x5f\x73\x65\x74\x74\x69\x6e\x67\x73",
        timestamps: true,
    },
);
const _0x5523af = {
    WELCOME_MESSAGE: "\x66\x61\x6c\x73\x65",
    GOODBYE_MESSAGE: "\x66\x61\x6c\x73\x65",
    GROUP_EVENTS: "\x66\x61\x6c\x73\x65",
    ANTILINK: "\x66\x61\x6c\x73\x65",
    ANTILINK_WARN_COUNT: "5",
    WELCOME_MESSAGE_TEXT: "",
    GOODBYE_MESSAGE_TEXT: "",
    ANTIBAD: "\x66\x61\x6c\x73\x65",
    ANTIBAD_WARN_COUNT: "5",
    ANTIGROUPMENTION: "\x66\x61\x6c\x73\x65",
    ANTIGROUPMENTION_WARN_COUNT: "3",
    ANTIPROMOTE: "\x66\x61\x6c\x73\x65",
    ANTIDEMOTE: "\x66\x61\x6c\x73\x65",
};
const _0xe7b771 = DATABASE.define(
    "\x41\x6e\x74\x69\x6c\x69\x6e\x6b\x57\x61\x72\x6e\x69\x6e\x67\x73",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        warnCount: {
            type: DataTypes.INTEGER,
            _0xeab8ed: 0,
        },
    },
    {
        tableName: "\x61\x6e\x74\x69\x6c\x69\x6e\x6b\x5f\x77\x61\x72\x6e\x69\x6e\x67\x73",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["\x67\x72\x6f\x75\x70\x4a\x69\x64", "\x75\x73\x65\x72\x4a\x69\x64"],
            },
        ],
    },
);
async function getAntilinkWarnings(groupJid, userJid) {
    const _0xcb9057 = await _0xe7b771.findOne({
        where: { groupJid, userJid },
    });
    return _0xcb9057 ? _0xcb9057.warnCount : 0;
}
async function addAntilinkWarning(groupJid, userJid) {
    const [_0xcb9057, created] = await _0xe7b771.findOrCreate({
        where: { groupJid, userJid },
        defaults: { groupJid, userJid, warnCount: 1 },
    });
    if (!created) {
        _0xcb9057.warnCount += 1;
        await _0xcb9057.save();
    }
    return _0xcb9057.warnCount;
}
async function resetAntilinkWarnings(groupJid, userJid) {
    await _0xe7b771.destroy({
        where: { groupJid, userJid },
    });
}
const _0x36c3d5 = DATABASE.define(
    "\x41\x6e\x74\x69\x62\x61\x64\x57\x61\x72\x6e\x69\x6e\x67\x73",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        warnCount: {
            type: DataTypes.INTEGER,
            _0xeab8ed: 0,
        },
    },
    {
        tableName: "\x61\x6e\x74\x69\x62\x61\x64\x5f\x77\x61\x72\x6e\x69\x6e\x67\x73",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["\x67\x72\x6f\x75\x70\x4a\x69\x64", "\x75\x73\x65\x72\x4a\x69\x64"],
            },
        ],
    },
);
const _0x4bcae5 = DATABASE.define(
    "\x42\x61\x64\x57\x6f\x72\x64\x73",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        word: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "\x62\x61\x64\x5f\x77\x6f\x72\x64\x73",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["\x67\x72\x6f\x75\x70\x4a\x69\x64", "\x77\x6f\x72\x64"],
            },
        ],
    },
);
async function getAntibadWarnings(groupJid, userJid) {
    const _0xcb9057 = await _0x36c3d5.findOne({
        where: { groupJid, userJid },
    });
    return _0xcb9057 ? _0xcb9057.warnCount : 0;
}
async function addAntibadWarning(groupJid, userJid) {
    const [_0xcb9057, created] = await _0x36c3d5.findOrCreate({
        where: { groupJid, userJid },
        defaults: { groupJid, userJid, warnCount: 1 },
    });
    if (!created) {
        _0xcb9057.warnCount += 1;
        await _0xcb9057.save();
    }
    return _0xcb9057.warnCount;
}
async function resetAntibadWarnings(groupJid, userJid) {
    await _0x36c3d5.destroy({
        where: { groupJid, userJid },
    });
}
const _0xebef2e = DATABASE.define(
    "\x41\x6e\x74\x69\x47\x72\x6f\x75\x70\x4d\x65\x6e\x74\x69\x6f\x6e\x57\x61\x72\x6e\x69\x6e\x67\x73",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userJid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        warnCount: {
            type: DataTypes.INTEGER,
            _0xeab8ed: 0,
        },
    },
    {
        tableName: "\x61\x6e\x74\x69\x67\x72\x6f\x75\x70\x6d\x65\x6e\x74\x69\x6f\x6e\x5f\x77\x61\x72\x6e\x69\x6e\x67\x73",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["\x67\x72\x6f\x75\x70\x4a\x69\x64", "\x75\x73\x65\x72\x4a\x69\x64"],
            },
        ],
    },
);
async function getAntiGroupMentionWarnings(groupJid, userJid) {
    const _0xcb9057 = await _0xebef2e.findOne({
        where: { groupJid, userJid },
    });
    return _0xcb9057 ? _0xcb9057.warnCount : 0;
}
async function addAntiGroupMentionWarning(groupJid, userJid) {
    const [_0xcb9057, created] = await _0xebef2e.findOrCreate({
        where: { groupJid, userJid },
        defaults: { groupJid, userJid, warnCount: 1 },
    });
    if (!created) {
        _0xcb9057.warnCount += 1;
        await _0xcb9057.save();
    }
    return _0xcb9057.warnCount;
}
async function resetAntiGroupMentionWarnings(groupJid, userJid) {
    await _0xebef2e.destroy({
        where: { groupJid, userJid },
    });
}
const _0x7d9fe0 = [
    '\x66\x75\x63\x6b', '\x73\x68\x69\x74', '\x62\x69\x74\x63\x68', '\x61\x73\x73', '\x61\x73\x73\x68\x6f\x6c\x65', '\x62\x61\x73\x74\x61\x72\x64', '\x64\x61\x6d\x6e', '\x64\x69\x63\x6b', '\x70\x75\x73\x73\x79', 
    '\x63\x75\x6e\x74', '\x77\x68\x6f\x72\x65', '\x73\x6c\x75\x74', '\x66\x61\x67', '\x6e\x69\x67\x67\x61', '\x6e\x69\x67\x67\x65\x72', '\x72\x65\x74\x61\x72\x64', '\x6d\x6f\x74\x68\x65\x72\x66\x75\x63\x6b\x65\x72',
    '\x63\x6f\x63\x6b', '\x70\x72\x69\x63\x6b', '\x62\x75\x6c\x6c\x73\x68\x69\x74', '\x6a\x61\x63\x6b\x61\x73\x73', '\x64\x75\x6d\x62\x61\x73\x73', '\x69\x64\x69\x6f\x74', '\x73\x74\x75\x70\x69\x64',
    '\x6d\x61\x6c\x61\x79\x61', '\x6d\x6b\x75\x6e\x64\x75', '\x6d\x61\x74\x61\x6b\x6f', '\x6b\x75\x6d\x61\x6d\x61\x6b\x6f', '\x6b\x75\x6d\x61', '\x66\x61\x6c\x61', '\x6d\x6a\x69\x6e\x67\x61', '\x70\x75\x6d\x62\x61\x76\x75'
];
async function getBadWords(groupJid) {
    const _0xb86be7 = await _0x4bcae5.findAll({
        where: { groupJid },
    });
    return _0xb86be7.map(r => r.word.toLowerCase());
}
async function initializeDefaultBadWords(groupJid) {
    let _0x8d0604 = 0;
    for (const word of _0x7d9fe0) {
        try {
            const [_0xcb9057, created] = await _0x4bcae5.findOrCreate({
                where: { groupJid, word: word.toLowerCase() },
                defaults: { groupJid, word: word.toLowerCase() },
            });
            if (created) _0x8d0604++;
        } catch (e) {}
    }
    return _0x8d0604;
}
async function addBadWord(groupJid, word) {
    const _0x8c1046 = word.toLowerCase().trim();
    try {
        await _0x4bcae5.findOrCreate({
            where: { groupJid, word: _0x8c1046 },
            defaults: { groupJid, word: _0x8c1046 },
        });
        return true;
    } catch (e) {
        return false;
    }
}
async function removeBadWord(groupJid, word) {
    const _0x8c1046 = word.toLowerCase().trim();
    const _0x61075c = await _0x4bcae5.destroy({
        where: { groupJid, word: _0x8c1046 },
    });
    return _0x61075c > 0;
}
async function clearBadWords(groupJid) {
    await _0x4bcae5.destroy({
        where: { groupJid },
    });
}
async function initializeGroupSettings() {
    try {
        await _0x6f2e60.sync({ alter: true });
        await _0xe7b771.sync({ alter: true });
        await _0x36c3d5.sync({ alter: true });
        await _0xebef2e.sync({ alter: true });
        await _0x4bcae5.sync({ alter: true });
        console.log("✅\x20\x47\x72\x6f\x75\x70\x20\x53\x65\x74\x74\x69\x6e\x67\x73\x20\x49\x6e\x69\x74\x69\x61\x6c\x69\x7a\x65\x64\x2e");
    } catch (error) {
        if (error.original?.code === '\x53\x51\x4c\x49\x54\x45\x5f\x45\x52\x52\x4f\x52' && error.original?.message?.includes('\x61\x6c\x72\x65\x61\x64\x79\x20\x65\x78\x69\x73\x74\x73')) {
            console.log("✅\x20\x47\x72\x6f\x75\x70\x20\x53\x65\x74\x74\x69\x6e\x67\x73\x20\x49\x6e\x69\x74\x69\x61\x6c\x69\x7a\x65\x64\x2e");
        } else {
            throw error;
        }
    }
}
const _0x861de3 = 0x7530;
const _0xf7da66 = new Map();
function _groupCacheKey(groupJid, key) {
    return `${groupJid}::${key}`;
}
function invalidateGroupSettingCache(groupJid, key) {
    _0xf7da66.delete(_groupCacheKey(groupJid, key));
}
async function getGroupSetting(groupJid, key) {
    const _0xe7a20e = _groupCacheKey(groupJid, key);
    const _0x086d98 = _0xf7da66.get(_0xe7a20e);
    if (_0x086d98 && (Date.now() - _0x086d98.ts) < _0x861de3) {
        return _0x086d98.value;
    }
    const _0xcb9057 = await _0x6f2e60.findOne({
        where: { groupJid, key },
    });
    const _0x2602f1 = _0xcb9057 ? _0xcb9057.value : (_0x5523af[key] || "\x66\x61\x6c\x73\x65");
    _0xf7da66.set(_0xe7a20e, { _0x2602f1, ts: Date.now() });
    return _0x2602f1;
}
async function setGroupSetting(groupJid, key, _0x2602f1) {
    try {
        const _0xdb8a14 = await _0x6f2e60.findOne({ where: { groupJid, key } });
        if (_0xdb8a14) {
            _0xdb8a14.value = _0x2602f1;
            await _0xdb8a14.save();
        } else {
            await _0x6f2e60.create({ groupJid, key, _0x2602f1 });
        }
        invalidateGroupSettingCache(groupJid, key);
        return true;
    } catch (error) {
        console.error(`[setGroupSetting] Error: ${error.message}`);
        throw error;
    }
}
async function getAllGroupSettings(groupJid) {
    const _0xb86be7 = await _0x6f2e60.findAll({
        where: { groupJid },
    });
    const _0x566fb2 = { ...GROUP_SETTING_DEFAULTS };
    for (const _0xcb9057 of _0xb86be7) {
        _0x566fb2[_0xcb9057.key] = _0xcb9057.value;
    }
    return _0x566fb2;
}
async function resetGroupSetting(groupJid, key) {
    const _0xeab8ed = _0x5523af[key];
    if (_0xeab8ed !== undefined) {
        await setGroupSetting(groupJid, key, _0xeab8ed);
        return _0xeab8ed;
    }
    return null;
}
async function getGroupsWithSettingEnabled(key) {
    const _0xb86be7 = await _0x6f2e60.findAll({
        where: { key, _0x2602f1: "\x74\x72\x75\x65" },
    });
    return _0xb86be7.map((_0xcb9057) => _0xcb9057.groupJid);
}
async function getEnabledGroupSettings() {
    const _0x8ecf12 = {
        WELCOME_MESSAGE: [],
        GOODBYE_MESSAGE: [],
        GROUP_EVENTS: [],
        ANTILINK: [],
        ANTIBAD: [],
        ANTIGROUPMENTION: [],
        ANTIPROMOTE: [],
        ANTIDEMOTE: [],
    };
    const _0xb86be7 = await _0x6f2e60.findAll();
    for (const _0xcb9057 of _0xb86be7) {
        if (_0x8ecf12[_0xcb9057.key] !== undefined) {
            if (_0xcb9057.value && _0xcb9057.value !== '\x66\x61\x6c\x73\x65' && _0xcb9057.value !== '\x6f\x66\x66') {
                _0x8ecf12[_0xcb9057.key].push(`${_0xcb9057.groupJid} (${_0xcb9057.value})`);
            }
        }
    }
    return _0x8ecf12;
}
async function resetAllGroupSettings(groupJid) {
    try {
        await _0x6f2e60.destroy({ where: { groupJid } });
        await _0xe7b771.destroy({ where: { groupJid } });
        await _0x36c3d5.destroy({ where: { groupJid } });
        await _0xebef2e.destroy({ where: { groupJid } });
        await _0x4bcae5.destroy({ where: { groupJid } });
        return true;
    } catch (error) {
        console.error("\x5b\x47\x52\x4f\x55\x50\x5f\x53\x45\x54\x54\x49\x4e\x47\x53\x5d\x5b\x52\x45\x53\x45\x54\x5f\x41\x4c\x4c\x5f\x45\x52\x52\x4f\x52\x5d\x3a", error);
        return false;
    }
}
module.exports = {
    _0x6f2e60,
    _0xe7b771,
    _0x36c3d5,
    _0xebef2e,
    _0x4bcae5,
    _0x5523af,
    initializeGroupSettings,
    getGroupSetting,
    setGroupSetting,
    getAllGroupSettings,
    resetGroupSetting,
    getGroupsWithSettingEnabled,
    getEnabledGroupSettings,
    getAntilinkWarnings,
    addAntilinkWarning,
    resetAntilinkWarnings,
    getAntibadWarnings,
    addAntibadWarning,
    resetAntibadWarnings,
    getAntiGroupMentionWarnings,
    addAntiGroupMentionWarning,
    resetAntiGroupMentionWarnings,
    getBadWords,
    addBadWord,
    removeBadWord,
    clearBadWords,
    initializeDefaultBadWords,
    _0x7d9fe0,
    resetAllGroupSettings,
};
