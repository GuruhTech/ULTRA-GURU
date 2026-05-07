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
        jid: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
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

const GroupWarningsDB = DATABASE.define(
    "GroupWarnings",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        jid: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        sender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "group_warnings",
        timestamps: true,
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
        jid: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        word: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "bad_words",
        timestamps: true,
    },
);

const GROUP_SETTING_DEFAULTS = {
    WELCOME_MESSAGE: "false",
    WELCOME_MESSAGE_TEXT: "",
    GOODBYE_MESSAGE: "false",
    GOODBYE_MESSAGE_TEXT: "",
    GROUP_EVENTS: "false",
    ANTILINK: "false",
    ANTILINK_WARN_COUNT: "3",
    ANTIBAD: "false",
    ANTIBAD_WARN_COUNT: "3",
    ANTIGROUPMENTION: "false",
    ANTIGROUPMENTION_WARN_COUNT: "3",
    ANTIPROMOTE: "false",
    ANTIDEMOTE: "false",
    LOCK_TEXT: "false",
    LOCK_MEDIA: "false",
    LOCK_STICKERS: "false",
    LOCK_GIF: "false",
    LOCK_VIDEO: "false",
    LOCK_VOICE: "false",
    LOCK_AUDIO: "false",
    LOCK_DOCS: "false",
    LOCK_POLLS: "false",
    LOCK_VIEWONCE: "false",
    LOCK_CONTACTS: "false",
    LOCK_LOCATION: "false",
    SLOWMODE: "0",
    ANTISPAM: "false",
};

let initialized = false;

async function initializeGroupSettings() {
    if (initialized) return;
    try {
        await GroupSettingsDB.sync({ alter: true });
        await GroupWarningsDB.sync({ alter: true });
        await BadWordsDB.sync({ alter: true });
    } catch (_) {
        await GroupSettingsDB.sync({ force: true });
        await GroupWarningsDB.sync({ force: true });
        await BadWordsDB.sync({ force: true });
    }
    initialized = true;
    console.log("✅ Group Settings Initialized.");
}

async function getGroupSetting(jid, key) {
    if (!initialized) await initializeGroupSettings();
    const record = await GroupSettingsDB.findOne({ where: { jid, key } });
    if (record) return record.value;
    return GROUP_SETTING_DEFAULTS[key] !== undefined ? GROUP_SETTING_DEFAULTS[key] : null;
}

async function setGroupSetting(jid, key, value) {
    if (!initialized) await initializeGroupSettings();
    const [record, created] = await GroupSettingsDB.findOrCreate({
        where: { jid, key },
        defaults: { jid, key, value },
    });
    if (!created) {
        record.value = value;
        await record.save();
    }
    return true;
}

async function getAllGroupSettings(jid) {
    if (!initialized) await initializeGroupSettings();
    const records = await GroupSettingsDB.findAll({ where: { jid } });
    const settings = { ...GROUP_SETTING_DEFAULTS };
    for (const record of records) {
        settings[record.key] = record.value;
    }
    return settings;
}

async function resetGroupSetting(jid, key) {
    if (!initialized) await initializeGroupSettings();
    const defaultValue = GROUP_SETTING_DEFAULTS[key];
    if (defaultValue !== undefined) {
        await setGroupSetting(jid, key, defaultValue);
        return defaultValue;
    }
    return null;
}

async function addAntilinkWarning(jid, sender) {
    if (!initialized) await initializeGroupSettings();
    const [record] = await GroupWarningsDB.findOrCreate({
        where: { jid, sender, type: "antilink" },
        defaults: { jid, sender, type: "antilink", count: 0 },
    });
    record.count += 1;
    await record.save();
    return record.count;
}

async function resetAntilinkWarnings(jid, sender) {
    if (!initialized) await initializeGroupSettings();
    await GroupWarningsDB.destroy({ where: { jid, sender, type: "antilink" } });
    return true;
}

async function addAntibadWarning(jid, sender) {
    if (!initialized) await initializeGroupSettings();
    const [record] = await GroupWarningsDB.findOrCreate({
        where: { jid, sender, type: "antibad" },
        defaults: { jid, sender, type: "antibad", count: 0 },
    });
    record.count += 1;
    await record.save();
    return record.count;
}

async function resetAntibadWarnings(jid, sender) {
    if (!initialized) await initializeGroupSettings();
    await GroupWarningsDB.destroy({ where: { jid, sender, type: "antibad" } });
    return true;
}

async function addAntiGroupMentionWarning(jid, sender) {
    if (!initialized) await initializeGroupSettings();
    const [record] = await GroupWarningsDB.findOrCreate({
        where: { jid, sender, type: "antigroupmention" },
        defaults: { jid, sender, type: "antigroupmention", count: 0 },
    });
    record.count += 1;
    await record.save();
    return record.count;
}

async function resetAntiGroupMentionWarnings(jid, sender) {
    if (!initialized) await initializeGroupSettings();
    await GroupWarningsDB.destroy({ where: { jid, sender, type: "antigroupmention" } });
    return true;
}

async function getBadWords(jid) {
    if (!initialized) await initializeGroupSettings();
    const records = await BadWordsDB.findAll({ where: { jid } });
    return records.map((r) => r.word);
}

async function addBadWord(jid, word) {
    if (!initialized) await initializeGroupSettings();
    const [, created] = await BadWordsDB.findOrCreate({
        where: { jid, word: word.toLowerCase() },
        defaults: { jid, word: word.toLowerCase() },
    });
    return created;
}

async function removeBadWord(jid, word) {
    if (!initialized) await initializeGroupSettings();
    const deleted = await BadWordsDB.destroy({ where: { jid, word: word.toLowerCase() } });
    return deleted > 0;
}

module.exports = {
    GroupSettingsDB,
    GROUP_SETTING_DEFAULTS,
    initializeGroupSettings,
    getGroupSetting,
    setGroupSetting,
    getAllGroupSettings,
    resetGroupSetting,
    addAntilinkWarning,
    resetAntilinkWarnings,
    addAntibadWarning,
    resetAntibadWarnings,
    addAntiGroupMentionWarning,
    resetAntiGroupMentionWarnings,
    getBadWords,
    addBadWord,
    removeBadWord,
};
