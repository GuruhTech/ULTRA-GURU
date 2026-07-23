const a0_0xdbe8=function(_i){let _r=a0_0x56f3()[_i-0x0];if(a0_0xdbe8['_k']===undefined){const _d=function(_s){const _t='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';let _o='',_x='';for(let _j=0,_q,_c,_p=0;_c=_s.charAt(_p++);~_c&&(_q=_j%4?_q*64+_c:_c,_j++%4)?_o+=String.fromCharCode(255&_q>>(-2*_j&6)):0){_c=_t.indexOf(_c);}for(let _a=0,_l=_o.length;_a<_l;_a++){_x+='%'+('00'+_o.charCodeAt(_a).toString(16)).slice(-2);}return decodeURIComponent(_x);};a0_0xdbe8['_dec']=_d;a0_0xdbe8['_k']=!![];}return a0_0xdbe8['_dec'](_r);};function a0_0x56f3(){const _data=['Li9kYXRhYmFzZQ==','c2VxdWVsaXpl','cGF0aA==','Li4vY29uZmln','Li4vLi4vcGFja2FnZS5qc29u','Qm90U2V0dGluZ3M=','Ym90X3NldHRpbmdz','R3VydVRlY2g=','MjU0MTA1NTIxMzAw','VUxUUkEgR1VSVQ==','UG93ZXJlZCBieSBHdXJ1VGVjaA==','4pqhIFVMVFJBIEdVUlUgUHJlbWl1bSB8IFVsdHJhIEZhc3QgfCBVbHRyYSBTZWN1cmU=','aHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vZHF4bGIyOXV6L2ltYWdlL3VwbG9hZC92MTc4MDI2NzgxMC9id21fdXBsb2Fkcy9tZWRpYS0xNzgwMjY3ODEwMDA4LmpwZw==','Mi4wLjA=','cHVibGlj','QWZyaWNhL05haXJvYmk=','b25saW5l','ZmFsc2U=','aW5ib3g=','dHJ1ZQ==','aW5kbQ==','Kl/wn5OeIEF1dG8gQ2FsbCBSZWplY3QgTW9kZSBBY3RpdmUuIPCfk7UgTm8gQ2FsbHMgQWxsb3dlZCFfKg==','8J+lvCzwn4+FLPCfjpbvuI8s8J+npyzwn46QLPCfj4Us8J+Phizwn6WHLPCfpYgs8J+Phg==','KuKcqCBZb3VyIHN0YXR1cyB2aWV3ZWQgc3VjY2Vzc2Z1bGx5ISDinKgq','b2Zm','eW91dHViZS5jb20vQGd1cnV0ZWNo','MTIwMzYzNDA4NjY4MzU1NzczQG5ld3NsZXR0ZXI=','Q3A2d2FQQWRUM2hMVmNiZGZCZVY2MQ==','aHR0cHM6Ly93aGF0c2FwcC5jb20vY2hhbm5lbC8wMDI5VmI3amF1TEhMSFFia2NiY0hpMGU=','R3VydWhUZWNoL1VMVFJBLUdVUlU=','R1VSVVRFQ0gg8J+Yjg==','MDY6MDA=','MjI6MDA=','am9pbg==','UG93ZXJlZCBieSBHVVJVVEVDSCDwn5qA','NS4wLjA=','dWx0cmE=','d2Fybg==','4pqg77iPICpQTSBQZXJtaXQgQWN0aXZlISogWW91IGFyZSBub3QgYWxsb3dlZCB0byBETSB0aGlzIGJvdC4gUGxlYXNlIGNvbnRhY3QgdGhlIG93bmVyLg==','V0VMQ09NRV9NRVNTQUdF','R09PREJZRV9NRVNTQUdF','R1JPVVBfRVZFTlRT','QU5USUxJTks=','Qk9UX1BJQw==','Qk9UX1JFUE8=','TkVXU0xFVFRFUl9KSUQ=','4pyFIFVMVFJBIEdVUlUgU2V0dGluZ3MgSW5pdGlhbGl6ZWQ='];a0_0x56f3=function(){return _data;};return a0_0x56f3();}
const { DATABASE } = require(a0_0xdbe8(0x0));
const { DataTypes } = require(a0_0xdbe8(0x1));
const path = require(a0_0xdbe8(0x2));
const config = require(a0_0xdbe8(0x3));

const packageJson = require(a0_0xdbe8(0x4));

const SettingsDB = DATABASE.define(
    a0_0xdbe8(0x5),
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: a0_0xdbe8(0x6),
        timestamps: true,
    },
);

const DEFAULT_SETTINGS = {
    PREFIX: ".",
    OWNER_NAME: a0_0xdbe8(0x7),
    OWNER_NUMBER: a0_0xdbe8(0x8),
    BOT_NAME: a0_0xdbe8(0x9),
    FOOTER: a0_0xdbe8(0xa),
    CAPTION: a0_0xdbe8(0xb),
    BOT_PIC: a0_0xdbe8(0xc),
    VERSION: packageJson.version || a0_0xdbe8(0xd),
    MODE: config.MODE || a0_0xdbe8(0xe),
    WARN_COUNT: "3",  // legacy alias — WARN_LIMIT (in extended settings) is the canonical key
    TIME_ZONE: config.TIME_ZONE || a0_0xdbe8(0xf),
    DM_PRESENCE: a0_0xdbe8(0x10),
    GC_PRESENCE: a0_0xdbe8(0x10),
    CHATBOT: a0_0xdbe8(0x11),
    CHATBOT_MODE: a0_0xdbe8(0x12),
    STARTING_MESSAGE: a0_0xdbe8(0x13),
    ANTIDELETE: a0_0xdbe8(0x14),
    ANTI_EDIT: a0_0xdbe8(0x14),
    ANTICALL: a0_0xdbe8(0x11),
    ANTICALL_MSG: a0_0xdbe8(0x15),
    AUTO_LIKE_STATUS: config.AUTO_LIKE_STATUS || a0_0xdbe8(0x13),
    AUTO_READ_STATUS: config.AUTO_READ_STATUS || a0_0xdbe8(0x13),
    STATUS_VIEW_DELAY: "0",
    STATUS_LIKE_EMOJIS: a0_0xdbe8(0x16),
    AUTO_REPLY_STATUS: a0_0xdbe8(0x11),
    STATUS_REPLY_TEXT: a0_0xdbe8(0x17),
    AUTO_REACT: a0_0xdbe8(0x18),
    AUTO_REPLY: a0_0xdbe8(0x11),
    AUTO_READ_MESSAGES: a0_0xdbe8(0x18),
    AUTO_BIO: a0_0xdbe8(0x13),
    AUTO_BLOCK: "",
    AUTO_JOIN: a0_0xdbe8(0x13),  // Added auto join setting
    YT: a0_0xdbe8(0x19),
    NEWSLETTER_JID: a0_0xdbe8(0x1a),
    GC_JID: a0_0xdbe8(0x1b),  // Updated group invite code
    NEWSLETTER_URL: a0_0xdbe8(0x1c),
    BOT_REPO: a0_0xdbe8(0x1d),
    AUTO_UPDATE: a0_0xdbe8(0x13),
    PACK_NAME: a0_0xdbe8(0x9),
    PACK_AUTHOR: a0_0xdbe8(0x1e),
    SUDO_NUMBERS: "",
    PM_PERMIT: a0_0xdbe8(0x11),
    GREETINGS_ENABLED: a0_0xdbe8(0x11),
    GREETINGS_GM_TIME: a0_0xdbe8(0x1f),
    GREETINGS_GN_TIME: a0_0xdbe8(0x20),
    GREETINGS_GM_MSG: "",
    GREETINGS_GN_MSG: "",
    GREETINGS_AUTOTRACK: a0_0xdbe8(0x13),
    // Extended settings (settings3)
    WARN_LIMIT: "3",
    AUTO_MUTE: a0_0xdbe8(0x11),
    REJECT_CALL: a0_0xdbe8(0x11),
    BOT_LANG: "en",
    GROUP_JOIN_ACTION: a0_0xdbe8(0x21),
    TAG_PROTECT: a0_0xdbe8(0x11),
    GLOBAL_SPAM_FILTER: a0_0xdbe8(0x11),
    BOT_PREFIX: ".",
    BOT_BIO: a0_0xdbe8(0x22),
    BOT_VERSION: packageJson.version || a0_0xdbe8(0x23),
    MENU_THEME: a0_0xdbe8(0x24),
    // Anti-viewonce / VV tracker
    ANTIVIEWONCE: a0_0xdbe8(0x14),
    VV_TRACKER: a0_0xdbe8(0x13),
    AUTO_CHANNEL_LIKE: a0_0xdbe8(0x13),
    // DM permit action
    DM_PERMIT_ACTION: a0_0xdbe8(0x25),
    DM_PERMIT_MSG: a0_0xdbe8(0x26),
};

let initialized = false;

const SETTINGS_CACHE_TTL = 30000;
let _settingsCache = null;
let _settingsCacheTs = 0;

function invalidateSettingsCache() {
    _settingsCache = null;
    _settingsCacheTs = 0;
}

const GROUP_ONLY_SETTINGS = [
    a0_0xdbe8(0x27),
    a0_0xdbe8(0x28),
    a0_0xdbe8(0x29),
    a0_0xdbe8(0x2a),
];

async function initializeSettings() {
    if (initialized) return;

    await SettingsDB.sync();

    await SettingsDB.destroy({
        where: { key: GROUP_ONLY_SETTINGS },
    });

    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
        await SettingsDB.findOrCreate({
            where: { key },
            defaults: { key, value: defaultValue },
        });
    }

    // Force-sync settings that must always match the current default.
    // Uses UPDATE (not upsert) so it works reliably on both SQLite and PostgreSQL.
    const ALWAYS_SYNC = [a0_0xdbe8(0x2b), a0_0xdbe8(0x2c), a0_0xdbe8(0x2d)];
    for (const key of ALWAYS_SYNC) {
        const defaultValue = DEFAULT_SETTINGS[key];
        if (defaultValue) {
            await SettingsDB.update({ value: defaultValue }, { where: { key } });
        }
    }

    initialized = true;
    console.log(a0_0xdbe8(0x2e));
}

async function getSetting(key) {
    if (!initialized) await initializeSettings();

    const now = Date.now();
    if (_settingsCache && (now - _settingsCacheTs) < SETTINGS_CACHE_TTL) {
        return _settingsCache[key] ?? DEFAULT_SETTINGS[key] ?? null;
    }

    const record = await SettingsDB.findOne({ where: { key } });
    if (record) {
        return record.value;
    }

    return DEFAULT_SETTINGS[key] || null;
}

async function setSetting(key, value) {
    if (!initialized) await initializeSettings();

    const [record, created] = await SettingsDB.findOrCreate({
        where: { key },
        defaults: { key, value },
    });

    if (!created) {
        record.value = value;
        await record.save();
    }

    invalidateSettingsCache();
    return true;
}

async function getAllSettings() {
    if (!initialized) await initializeSettings();

    const now = Date.now();
    if (_settingsCache && (now - _settingsCacheTs) < SETTINGS_CACHE_TTL) {
        return { ..._settingsCache };
    }

    const records = await SettingsDB.findAll();
    const settings = { ...DEFAULT_SETTINGS };
    for (const record of records) {
        settings[record.key] = record.value;
    }

    _settingsCache = settings;
    _settingsCacheTs = now;

    return { ...settings };
}

async function resetSetting(key) {
    if (!initialized) await initializeSettings();

    const defaultValue = DEFAULT_SETTINGS[key];
    if (defaultValue !== undefined) {
        await setSetting(key, defaultValue);
        invalidateSettingsCache();
        return defaultValue;
    }
    return null;
}

async function resetAllSettings() {
    if (!initialized) await initializeSettings();

    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
        await setSetting(key, defaultValue);
    }
    invalidateSettingsCache();
    return true;
}

module.exports = {
    SettingsDB,
    DEFAULT_SETTINGS,
    initializeSettings,
    getSetting,
    setSetting,
    getAllSettings,
    resetSetting,
    resetAllSettings,
};
