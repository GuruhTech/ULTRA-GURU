
const { DATABASE } = require("./database");
const { DataTypes } = require("sequelize");

const GroupSettingsDB = DATABASE.define(
    "GroupSettings",
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
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "group_settings",
        timestamps: true,
    },
);

const GROUP_SETTING_DEFAULTS = {
    WELCOME_MESSAGE: "false",
    GOODBYE_MESSAGE: "false",
    GROUP_EVENTS: "false",
    ANTILINK: "false",
    ANTILINK_WARN_COUNT: "5",
    WELCOME_MESSAGE_TEXT: "",
    GOODBYE_MESSAGE_TEXT: "",
    ANTIBAD: "false",
    ANTIBAD_WARN_COUNT: "5",
    ANTIGROUPMENTION: "false",
    ANTIGROUPMENTION_WARN_COUNT: "3",
    ANTIPROMOTE: "false",
    ANTIDEMOTE: "false",
};

const AntilinkWarningsDB = DATABASE.define(
    "AntilinkWarnings",
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
            defaultValue: 0,
        },
    },
    {
        tableName: "antilink_warnings",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["groupJid", "userJid"],
            },
        ],
    },
);

async function getAntilinkWarnings(groupJid, userJid) {
    const record = await AntilinkWarningsDB.findOne({
        where: { groupJid, userJid },
    });
    return record ? record.warnCount : 0;
}

async function addAntilinkWarning(groupJid, userJid) {
    const [record, created] = await AntilinkWarningsDB.findOrCreate({
        where: { groupJid, userJid },
        defaults: { groupJid, userJid, warnCount: 1 },
    });

    if (!created) {
        record.warnCount += 1;
        await record.save();
    }

    return record.warnCount;
}

async function resetAntilinkWarnings(groupJid, userJid) {
    await AntilinkWarningsDB.destroy({
        where: { groupJid, userJid },
    });
}

const AntibadWarningsDB = DATABASE.define(
    "AntibadWarnings",
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
            defaultValue: 0,
        },
    },
    {
        tableName: "antibad_warnings",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["groupJid", "userJid"],
            },
        ],
    },
);

const BadWordsDB = DATABASE.define(
    "BadWords",
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
        tableName: "bad_words",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["groupJid", "word"],
            },
        ],
    },
);

async function getAntibadWarnings(groupJid, userJid) {
    const record = await AntibadWarningsDB.findOne({
        where: { groupJid, userJid },
    });
    return record ? record.warnCount : 0;
}

async function addAntibadWarning(groupJid, userJid) {
    const [record, created] = await AntibadWarningsDB.findOrCreate({
        where: { groupJid, userJid },
        defaults: { groupJid, userJid, warnCount: 1 },
    });

    if (!created) {
        record.warnCount += 1;
        await record.save();
    }

    return record.warnCount;
}

async function resetAntibadWarnings(groupJid, userJid) {
    await AntibadWarningsDB.destroy({
        where: { groupJid, userJid },
    });
}

const AntiGroupMentionWarningsDB = DATABASE.define(
    "AntiGroupMentionWarnings",
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
            defaultValue: 0,
        },
    },
    {
        tableName: "antigroupmention_warnings",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["groupJid", "userJid"],
            },
        ],
    },
);

async function getAntiGroupMentionWarnings(groupJid, userJid) {
    const record = await AntiGroupMentionWarningsDB.findOne({
        where: { groupJid, userJid },
    });
    return record ? record.warnCount : 0;
}

async function addAntiGroupMentionWarning(groupJid, userJid) {
    const [record, created] = await AntiGroupMentionWarningsDB.findOrCreate({
        where: { groupJid, userJid },
        defaults: { groupJid, userJid, warnCount: 1 },
    });

    if (!created) {
        record.warnCount += 1;
        await record.save();
    }

    return record.warnCount;
}

async function resetAntiGroupMentionWarnings(groupJid, userJid) {
    await AntiGroupMentionWarningsDB.destroy({
        where: { groupJid, userJid },
    });
}

const DEFAULT_BAD_WORDS = [
    'fuck', 'shit', 'bitch', 'ass', 'asshole', 'bastard', 'damn', 'dick', 'pussy', 
    'cunt', 'whore', 'slut', 'fag', 'nigga', 'nigger', 'retard', 'motherfucker',
    'cock', 'prick', 'bullshit', 'jackass', 'dumbass', 'idiot', 'stupid',
    'malaya', 'mkundu', 'matako', 'kumamako', 'kuma', 'fala', 'mjinga', 'pumbavu'
];

async function getBadWords(groupJid) {
    const records = await BadWordsDB.findAll({
        where: { groupJid },
    });
    return records.map(r => r.word.toLowerCase());
}

async function initializeDefaultBadWords(groupJid) {
    let added = 0;
    for (const word of DEFAULT_BAD_WORDS) {
        try {
            const [record, created] = await BadWordsDB.findOrCreate({
                where: { groupJid, word: word.toLowerCase() },
                defaults: { groupJid, word: word.toLowerCase() },
            });
            if (created) added++;
        } catch (e) {}
    }
    return added;
}

async function addBadWord(groupJid, word) {
    const normalizedWord = word.toLowerCase().trim();
    try {
        await BadWordsDB.findOrCreate({
            where: { groupJid, word: normalizedWord },
            defaults: { groupJid, word: normalizedWord },
        });
        return true;
    } catch (e) {
        return false;
    }
}

async function removeBadWord(groupJid, word) {
    const normalizedWord = word.toLowerCase().trim();
    const deleted = await BadWordsDB.destroy({
        where: { groupJid, word: normalizedWord },
    });
    return deleted > 0;
}

async function clearBadWords(groupJid) {
    await BadWordsDB.destroy({
        where: { groupJid },
    });
}

async function initializeGroupSettings() {
    try {
        await GroupSettingsDB.sync({ alter: true });
        await AntilinkWarningsDB.sync({ alter: true });
        await AntibadWarningsDB.sync({ alter: true });
        await AntiGroupMentionWarningsDB.sync({ alter: true });
        await BadWordsDB.sync({ alter: true });
        console.log("✅ Group Settings Initialized.");
    } catch (error) {
        if (error.original?.code === 'SQLITE_ERROR' && error.original?.message?.includes('already exists')) {
            console.log("✅ Group Settings Initialized.");
        } else {
            throw error;
        }
    }
}

const GROUP_SETTINGS_CACHE_TTL = 30000;
const _groupSettingsCache = new Map();

function _groupCacheKey(groupJid, key) {
    return `${groupJid}::${key}`;
}

function invalidateGroupSettingCache(groupJid, key) {
    _groupSettingsCache.delete(_groupCacheKey(groupJid, key));
}

async function getGroupSetting(groupJid, key) {
    const cacheKey = _groupCacheKey(groupJid, key);
    const cached = _groupSettingsCache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < GROUP_SETTINGS_CACHE_TTL) {
        return cached.value;
    }

    const record = await GroupSettingsDB.findOne({
        where: { groupJid, key },
    });

    const value = record ? record.value : (GROUP_SETTING_DEFAULTS[key] || "false");
    _groupSettingsCache.set(cacheKey, { value, ts: Date.now() });
    return value;
}

async function setGroupSetting(groupJid, key, value) {
    try {
        const existing = await GroupSettingsDB.findOne({ where: { groupJid, key } });

        if (existing) {
            existing.value = value;
            await existing.save();
        } else {
            await GroupSettingsDB.create({ groupJid, key, value });
        }

        invalidateGroupSettingCache(groupJid, key);
        return true;
    } catch (error) {
        console.error(`[setGroupSetting] Error: ${error.message}`);
        throw error;
    }
}

async function getAllGroupSettings(groupJid) {
    const records = await GroupSettingsDB.findAll({
        where: { groupJid },
    });

    const settings = { ...GROUP_SETTING_DEFAULTS };
    for (const record of records) {
        settings[record.key] = record.value;
    }
    return settings;
}

async function resetGroupSetting(groupJid, key) {
    const defaultValue = GROUP_SETTING_DEFAULTS[key];
    if (defaultValue !== undefined) {
        await setGroupSetting(groupJid, key, defaultValue);
        return defaultValue;
    }
    return null;
}

async function getGroupsWithSettingEnabled(key) {
    const records = await GroupSettingsDB.findAll({
        where: { key, value: "true" },
    });
    return records.map((record) => record.groupJid);
}

async function getEnabledGroupSettings() {
    const result = {
        WELCOME_MESSAGE: [],
        GOODBYE_MESSAGE: [],
        GROUP_EVENTS: [],
        ANTILINK: [],
        ANTIBAD: [],
        ANTIGROUPMENTION: [],
        ANTIPROMOTE: [],
        ANTIDEMOTE: [],
    };

    const records = await GroupSettingsDB.findAll();

    for (const record of records) {
        if (result[record.key] !== undefined) {
            if (record.value && record.value !== 'false' && record.value !== 'off') {
                result[record.key].push(`${record.groupJid} (${record.value})`);
            }
        }
    }

    return result;
}

async function resetAllGroupSettings(groupJid) {
    try {
        await GroupSettingsDB.destroy({ where: { groupJid } });
        await AntilinkWarningsDB.destroy({ where: { groupJid } });
        await AntibadWarningsDB.destroy({ where: { groupJid } });
        await AntiGroupMentionWarningsDB.destroy({ where: { groupJid } });
        await BadWordsDB.destroy({ where: { groupJid } });
        return true;
    } catch (error) {
        console.error("[GROUP_SETTINGS][RESET_ALL_ERROR]:", error);
        return false;
    }
}

module.exports = {
    GroupSettingsDB,
    AntilinkWarningsDB,
    AntibadWarningsDB,
    AntiGroupMentionWarningsDB,
    BadWordsDB,
    GROUP_SETTING_DEFAULTS,
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
    DEFAULT_BAD_WORDS,
    resetAllGroupSettings,
};
