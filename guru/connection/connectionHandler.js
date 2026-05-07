
const OWNER_CHANNELS = [
    '0029VbCl2UX3rZZilMSvxN1e@newsletter',
];

const PROFESSOR_EMOJIS = ['🎖️', '✨', '🔥', '💯', '⚡'];

async function safeNewsletterFollow(Gifted, jid) {
    try {
        await Gifted.newsletterFollow(jid);
        return true;
    } catch (e) {
        return false;
    }
}

async function safeGroupAcceptInvite(Gifted, code) {
    try {
        await Gifted.groupAcceptInvite(code);
        return true;
    } catch (e) {
        return false;
    }
}

async function setupConnectionHandler(Gifted, sessionDir, restartFn, options = {}) {
    const ev = Gifted.ev;
    if (!ev) return;

    ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            if (options.onQR) options.onQR(qr);
        }

        if (connection === 'close') {
            const { DisconnectReason } = require('gifted-baileys');
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log('[Connection] Closed. Status:', statusCode, 'Reconnect:', shouldReconnect);

            if (options.onClose) {
                try { await options.onClose(lastDisconnect); } catch (e) {}
            }

            if (shouldReconnect) {
                setTimeout(() => {
                    try { restartFn(); } catch (e) { console.error('[reconnect error]', e.message); }
                }, 3000);
            }
        }

        if (connection === 'open') {
            console.log('✅ WhatsApp Connected!');
            if (options.onOpen) {
                try { await options.onOpen(Gifted); } catch (e) {}
            }
        }
    });

    ev.on('creds.update', async () => {
        try {
            if (Gifted._saveCreds) await Gifted._saveCreds();
        } catch (e) {}
    });
}

async function setupGroupEventsListeners(Gifted) {
    const ev = Gifted.ev;
    if (!ev) return;

    ev.on('groups.update', async (updates) => {
        const { updateGroupCache } = require('./groupCache');
        for (const update of updates) {
            if (update.id) {
                try {
                    const meta = await Gifted.groupMetadata(update.id).catch(() => null);
                    if (meta) updateGroupCache(update.id, meta);
                } catch (e) {}
            }
        }
    });

    ev.on('group-participants.update', async ({ id }) => {
        if (!id) return;
        const { updateGroupCache } = require('./groupCache');
        try {
            const meta = await Gifted.groupMetadata(id).catch(() => null);
            if (meta) updateGroupCache(id, meta);
        } catch (e) {}
    });

    try {
        const { setupVvTracker } = require('../vvTracker');
        setupVvTracker(Gifted);
    } catch (e) {
        console.error('[VvTracker] setup error:', e.message);
    }
}

module.exports = {
    OWNER_CHANNELS,
    PROFESSOR_EMOJIS,
    safeNewsletterFollow,
    safeGroupAcceptInvite,
    setupConnectionHandler,
    setupGroupEventsListeners,
};
