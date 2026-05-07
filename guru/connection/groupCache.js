
const groupCache = new Map();

async function getGroupMetadata(jid, Gifted) {
    if (!jid || !jid.endsWith('@g.us')) return null;
    if (groupCache.has(jid)) return groupCache.get(jid);
    try {
        const meta = await Gifted.groupMetadata(jid);
        if (meta) groupCache.set(jid, meta);
        return meta;
    } catch (e) {
        return null;
    }
}

async function cachedGroupMetadata(jid) {
    return groupCache.get(jid) || null;
}

function getLidMapping(lid) {
    try {
        const { globalLidMapping } = require('gifted-baileys/lib/Utils/lid-mapping');
        return globalLidMapping.get(lid) || null;
    } catch (e) {
        return null;
    }
}

function updateGroupCache(jid, meta) {
    if (jid && meta) groupCache.set(jid, meta);
}

module.exports = {
    groupCache,
    getGroupMetadata,
    cachedGroupMetadata,
    getLidMapping,
    updateGroupCache,
};
