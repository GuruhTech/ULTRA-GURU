'use strict';

const { gmd, evt } = require('../guru/gmdCmds');
const { getSetting, setSetting } = require('../guru/database/settings');

const KEYWORDS = ['price', 'buy', 'cost', 'how much', 'available', 'sell', 'order', 'purchase', 'cheap', 'discount'];
const floodMap = new Map();
const dmCooldown = new Map();
const voStore = new Map(); // msgId → { voMessage, key, from, sender, ts }

function ownerJid(ownerNumber) {
    if (!ownerNumber) return null;
    const clean = ownerNumber.replace(/\D/g, '');
    return clean + '@s.whatsapp.net';
}

function isGroup(jid) {
    return jid && jid.endsWith('@g.us');
}

function isStatus(jid) {
    return jid && jid === 'status@broadcast';
}

function getMsgText(m) {
    const msg = m.message;
    if (!msg) return '';
    return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.buttonsResponseMessage?.selectedDisplayText ||
        msg.listResponseMessage?.title ||
        ''
    );
}

function getBotJid(sock) {
    try {
        return sock?.user?.id || sock?.authState?.creds?.me?.id || '';
    } catch (_) { return ''; }
}

async function sendOwnerDm(sock, text, settings) {
    try {
        const ownerNum = settings?.OWNER_NUMBER || await getSetting('OWNER_NUMBER');
        const jid = ownerJid(ownerNum);
        if (!jid) return;
        await sock.sendMessage(jid, { text });
    } catch (e) {
        console.error('[AutoPlug] sendOwnerDm error:', e.message);
    }
}

evt.on('messages.upsert', async (sock, m) => {
    try {
        if (!m || !m.message || !m.key) return;

        const jid = m.key.remoteJid || '';
        const fromMe = m.key.fromMe;
        const senderJid = m.key.participant || m.key.remoteJid || '';
        const botJid = getBotJid(sock);
        const settings = await getSetting('__ALL__').catch(() => null) || {};

        const getAllSetting = async (key, def = 'true') => {
            const v = await getSetting(key).catch(() => null);
            return v !== null && v !== undefined ? v : def;
        };

        // ─── 1. VV REACT SAVE ───────────────────────────────────────────
        if ((await getAllSetting('VV_REACT_SAVE', 'true')) === 'true') {
            try {
                const { downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
                const msg = m.message;

                // Step A — cache every incoming view-once (not fromMe) for 10 min
                if (!fromMe && !isStatus(jid)) {
                    const voMsg = msg?.viewOnceMessage?.message
                        || msg?.viewOnceMessageV2?.message
                        || msg?.viewOnceMessageV2Extension?.message;
                    if (voMsg && m.key?.id) {
                        voStore.set(m.key.id, {
                            voMessage: voMsg,
                            key:       m.key,
                            from:      jid,
                            sender:    senderJid,
                            ts:        Date.now(),
                        });
                        setTimeout(() => voStore.delete(m.key.id), 10 * 60 * 1000);
                    }
                }

                // linker = the session owner (sock.user.id)
                const botNum   = (sock?.user?.id || getBotJid(sock)).split(':')[0].split('@')[0];
                const linkerJid = botNum + '@s.whatsapp.net';
                const reactorNum = (m.key.participant || m.key.remoteJid || '').split('@')[0].split(':')[0];
                const isLinker = fromMe || reactorNum === botNum;

                // Step B — linker reacts to a view-once: look it up in voStore
                if (isLinker && msg?.reactionMessage) {
                    const targetId = msg.reactionMessage.key?.id;
                    if (targetId) {
                        const stored = voStore.get(targetId);
                        if (stored) {
                            const fakeMsg = { key: stored.key, message: stored.voMessage };
                            const buf = await downloadMediaMessage(fakeMsg, 'buffer', {}).catch(() => null);
                            if (buf) {
                                const type = getContentType(stored.voMessage);
                                const sNum = stored.sender?.split('@')[0]?.split(':')[0] || 'unknown';
                                const caption = `📥 *View-Once Saved*\n👤 *From:* @${sNum}\n\n_Saved by ULTRA GURU_`;
                                if (type === 'imageMessage') {
                                    await sock.sendMessage(linkerJid, { image: buf, caption }).catch(() => {});
                                } else if (type === 'videoMessage') {
                                    await sock.sendMessage(linkerJid, { video: buf, caption, mimetype: 'video/mp4' }).catch(() => {});
                                }
                                await sock.sendMessage(jid, {
                                    react: { text: '✅', key: msg.reactionMessage.key },
                                }).catch(() => {});
                            }
                        }
                    }
                }

                // Step C — linker replies to a view-once: build fakeMsg from contextInfo
                if (fromMe && msg?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    const ctx   = msg.extendedTextMessage.contextInfo;
                    const voMsg = ctx.quotedMessage?.viewOnceMessage?.message
                        || ctx.quotedMessage?.viewOnceMessageV2?.message
                        || ctx.quotedMessage?.viewOnceMessageV2Extension?.message;
                    if (voMsg) {
                        const fakeMsg = {
                            key: {
                                id:          ctx.stanzaId,
                                remoteJid:   jid,
                                participant: ctx.participant,
                            },
                            message: voMsg,
                        };
                        const buf = await downloadMediaMessage(fakeMsg, 'buffer', {}).catch(() => null);
                        if (buf) {
                            const type = getContentType(voMsg);
                            const sNum = (ctx.participant || ctx.remoteJid || '').split('@')[0].split(':')[0];
                            const caption = `📥 *View-Once Saved*\n👤 *From:* @${sNum}\n\n_Saved by ULTRA GURU_`;
                            if (type === 'imageMessage') {
                                await sock.sendMessage(linkerJid, { image: buf, caption }).catch(() => {});
                            } else if (type === 'videoMessage') {
                                await sock.sendMessage(linkerJid, { video: buf, caption, mimetype: 'video/mp4' }).catch(() => {});
                            }
                        }
                    }
                }
            } catch (_) {}
        }

        // ─── 2. STATUS SAVER ────────────────────────────────────────────
        if (isStatus(jid) && !fromMe && (await getAllSetting('STATUS_SAVER', 'false')) === 'true') {
            try {
                const msg = m.message;
                const ownerNum = await getSetting('OWNER_NUMBER');
                const ownJid = ownerJid(ownerNum);
                const senderNum = senderJid.split('@')[0];

                if (msg.imageMessage) {
                    const buf = await sock.downloadMediaMessage(m);
                    await sock.sendMessage(ownJid, { image: buf, caption: `📸 *Status from* @${senderNum}` });
                } else if (msg.videoMessage) {
                    const buf = await sock.downloadMediaMessage(m);
                    await sock.sendMessage(ownJid, { video: buf, caption: `🎥 *Status from* @${senderNum}` });
                } else if (msg.conversation || msg.extendedTextMessage) {
                    const text = getMsgText(m);
                    if (text) await sock.sendMessage(ownJid, { text: `📝 *Status from* @${senderNum}:\n\n${text}` });
                }
            } catch (_) {}
        }

        // ─── 3. KEYWORD AUTO-DM ─────────────────────────────────────────
        if (!fromMe && (await getAllSetting('KEYWORD_DM_ENABLED', 'false')) === 'true') {
            try {
                const text = getMsgText(m).toLowerCase();
                const matched = KEYWORDS.find(k => text.includes(k));
                if (matched && senderJid) {
                    const coolKey = `kw_${senderJid}`;
                    const lastSent = dmCooldown.get(coolKey) || 0;
                    if (Date.now() - lastSent > 10 * 60 * 1000) {
                        dmCooldown.set(coolKey, Date.now());
                        const botName = await getSetting('BOT_NAME') || 'ULTRA GURU';
                        await sock.sendMessage(senderJid.split('@')[0] + '@s.whatsapp.net', {
                            text: `👋 Hi! I noticed you mentioned *"${matched}"*. How can I help you? I'm *${botName}* — feel free to ask away! 😊`
                        });
                    }
                }
            } catch (_) {}
        }

        // ─── 4. ANTI-FLOOD ──────────────────────────────────────────────
        if (isGroup(jid) && !fromMe && (await getAllSetting('ANTI_FLOOD', 'false')) === 'true') {
            try {
                const floodKey = `${jid}_${senderJid}`;
                const now = Date.now();
                const history = floodMap.get(floodKey) || [];
                const recent = history.filter(t => now - t < 5000);
                recent.push(now);
                floodMap.set(floodKey, recent);

                const limit = parseInt(await getSetting('FLOOD_LIMIT') || '5', 10);
                if (recent.length >= limit) {
                    floodMap.delete(floodKey);
                    const senderNum = senderJid.split('@')[0].split(':')[0];
                    const action = await getSetting('FLOOD_ACTION') || 'warn';

                    if (action === 'mute') {
                        await sock.groupParticipantsUpdate(jid, [senderJid], 'demote').catch(() => {});
                        await sock.sendMessage(jid, {
                            text: `⚠️ @${senderNum} has been muted for flooding.`,
                            mentions: [senderJid]
                        });
                    } else {
                        await sock.sendMessage(jid, {
                            text: `⚠️ @${senderNum} — please slow down! Flooding is not allowed.`,
                            mentions: [senderJid]
                        });
                    }
                }
            } catch (_) {}
        }

        // ─── 5. POLL TRACKER ────────────────────────────────────────────
        if ((await getAllSetting('POLL_TRACKER', 'false')) === 'true') {
            try {
                const msg = m.message;
                if (msg?.pollUpdateMessage || msg?.pollCreationMessage) {
                    const ownerNum = await getSetting('OWNER_NUMBER');
                    const ownJid = ownerJid(ownerNum);
                    const voter = senderJid.split('@')[0].split(':')[0];
                    const chatName = isGroup(jid) ? jid.split('@')[0] : 'DM';

                    if (msg.pollUpdateMessage) {
                        const votes = msg.pollUpdateMessage.vote?.selectedOptions || [];
                        const voteText = votes.map(v => v.name || `Option ${v.optionIndex + 1}`).join(', ') || 'None';
                        await sock.sendMessage(ownJid, {
                            text: `📊 *Poll Vote Update*\n> Chat: ${chatName}\n> Voter: @${voter}\n> Choice: *${voteText}*`
                        });
                    }
                }
            } catch (_) {}
        }

        // ─── 6. DISAPPEARING MSG LOG ────────────────────────────────────
        if ((await getAllSetting('DISAPPEAR_LOG', 'false')) === 'true') {
            try {
                const isEphemeral = m.message?.ephemeralMessage || (m.messageTimestamp && m.expiration);
                if (isEphemeral && !fromMe) {
                    const ownerNum = await getSetting('OWNER_NUMBER');
                    const ownJid = ownerJid(ownerNum);
                    const inner = m.message?.ephemeralMessage?.message || m.message;
                    const text = inner?.conversation || inner?.extendedTextMessage?.text || '[Media/Non-text message]';
                    const senderNum = senderJid.split('@')[0].split(':')[0];
                    await sock.sendMessage(ownJid, {
                        text: `💨 *Disappearing Msg Logged*\n> From: @${senderNum}\n> Chat: ${isGroup(jid) ? jid.split('@')[0] : 'DM'}\n\n${text}`
                    });
                }
            } catch (_) {}
        }

        // ─── 7. PTT / AUDIO SAVE ────────────────────────────────────────
        if (!fromMe && !isGroup(jid) && (await getAllSetting('PTT_SAVE', 'false')) === 'true') {
            try {
                const msg = m.message;
                const isAudio = msg?.audioMessage || msg?.pttMessage;
                if (isAudio) {
                    const botNum = botJid.split('@')[0].split(':')[0];
                    const senderNum = senderJid.split('@')[0].split(':')[0];
                    if (botNum !== senderNum) {
                        const ownerNum = await getSetting('OWNER_NUMBER');
                        const ownJid = ownerJid(ownerNum);
                        if (ownJid && senderJid !== ownJid) {
                            const buf = await sock.downloadMediaMessage(m);
                            await sock.sendMessage(ownJid, {
                                audio: buf,
                                mimetype: 'audio/ogg; codecs=opus',
                                ptt: true,
                                caption: `🎙️ *Voice note from* @${senderNum}`
                            });
                        }
                    }
                }
            } catch (_) {}
        }

        // ─── 8. MENTION ALERT ───────────────────────────────────────────
        if (!fromMe && (await getAllSetting('MENTION_ALERT', 'true')) === 'true') {
            try {
                const msg = m.message;
                const mentions = msg?.extendedTextMessage?.contextInfo?.mentionedJid ||
                    msg?.imageMessage?.contextInfo?.mentionedJid ||
                    msg?.videoMessage?.contextInfo?.mentionedJid ||
                    msg?.buttonsMessage?.contextInfo?.mentionedJid || [];

                const botNum = botJid.split('@')[0].split(':')[0];
                const isMentioned = mentions.some(jid2 => jid2.split('@')[0].split(':')[0] === botNum);

                if (isMentioned) {
                    const ownerNum = await getSetting('OWNER_NUMBER');
                    const ownJid = ownerJid(ownerNum);
                    const senderNum = senderJid.split('@')[0].split(':')[0];
                    const chatLabel = isGroup(jid) ? `Group: ${jid.split('@')[0]}` : `DM from @${senderNum}`;
                    const text = getMsgText(m) || '[Non-text message]';
                    await sock.sendMessage(ownJid, {
                        text: `🔔 *Bot Mentioned!*\n> ${chatLabel}\n> By: @${senderNum}\n\n"${text}"`
                    });
                }
            } catch (_) {}
        }

    } catch (err) {
        console.error('[AutoPlug] handler error:', err.message);
    }
});

// ═══════════════════════════════════════════════════════════════════
//  SETTINGS TOGGLE COMMANDS
// ═══════════════════════════════════════════════════════════════════

const PLUGIN_TABLE = `
╔══════════════════════════════════╗
║     🔌  AUTO-PLUGINS STATUS      ║
╚══════════════════════════════════╝
Plugin            │ Key              │ Status
──────────────────┼──────────────────┼──────
VV React Save     │ VV_REACT_SAVE    │ {VV_REACT_SAVE}
Status Saver      │ STATUS_SAVER     │ {STATUS_SAVER}
Keyword Auto-DM   │ KEYWORD_DM       │ {KEYWORD_DM_ENABLED}
Anti-Flood        │ ANTI_FLOOD       │ {ANTI_FLOOD}
Poll Tracker      │ POLL_TRACKER     │ {POLL_TRACKER}
Disappear Log     │ DISAPPEAR_LOG    │ {DISAPPEAR_LOG}
PTT/Audio Save    │ PTT_SAVE         │ {PTT_SAVE}
Mention Alert     │ MENTION_ALERT    │ {MENTION_ALERT}

Usage: .autoplugs <key> <on/off>
Example: .autoplugs ANTI_FLOOD on
`.trim();

const MANAGED_KEYS = [
    'VV_REACT_SAVE',
    'STATUS_SAVER',
    'KEYWORD_DM_ENABLED',
    'ANTI_FLOOD',
    'POLL_TRACKER',
    'DISAPPEAR_LOG',
    'PTT_SAVE',
    'MENTION_ALERT',
];

gmd({
    pattern: 'autoplugs',
    aliases: ['autoplug', 'plugins'],
    react: '🔌',
    category: 'settings',
    description: 'View and toggle auto-plugins (VV Save, Status Saver, Flood, etc.)',
}, async (mek, { reply }, m) => {
    const vals = {};
    for (const key of MANAGED_KEYS) {
        const raw = await getSetting(key).catch(() => null);
        const v = raw !== null && raw !== undefined ? raw : (key === 'VV_REACT_SAVE' || key === 'MENTION_ALERT' ? 'true' : 'false');
        vals[key] = v === 'true' ? '✅ ON' : '❌ OFF';
    }

    let table = PLUGIN_TABLE;
    for (const [k, v] of Object.entries(vals)) {
        table = table.replace(`{${k}}`, v);
    }
    await reply(table);
});

gmd({
    pattern: 'vvreact',
    aliases: ['setvvreact', 'vvsave'],
    react: '👁️',
    category: 'settings',
    description: 'Toggle VV React Save — auto-saves view-once messages to owner DM',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('VV_REACT_SAVE').catch(() => 'true');
    const newVal = (cur === 'true' || cur === null || cur === undefined) ? 'false' : 'true';
    await setSetting('VV_REACT_SAVE', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`👁️ *VV React Save* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*`);
});

gmd({
    pattern: 'statussaver',
    aliases: ['setstatus', 'statusdl'],
    react: '📸',
    category: 'settings',
    description: 'Toggle Status Saver — silently saves all statuses to owner DM',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('STATUS_SAVER').catch(() => 'false');
    const newVal = cur === 'true' ? 'false' : 'true';
    await setSetting('STATUS_SAVER', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`📸 *Status Saver* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*`);
});

gmd({
    pattern: 'keyworddm',
    aliases: ['setkeyword', 'kwdm'],
    react: '💬',
    category: 'settings',
    description: 'Toggle Keyword Auto-DM — detects keywords and auto-slides into sender\'s DM',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('KEYWORD_DM_ENABLED').catch(() => 'false');
    const newVal = cur === 'true' ? 'false' : 'true';
    await setSetting('KEYWORD_DM_ENABLED', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`💬 *Keyword Auto-DM* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*\n\nKeywords: ${KEYWORDS.join(', ')}`);
});

gmd({
    pattern: 'antiflood',
    aliases: ['setflood', 'floodcontrol'],
    react: '🌊',
    category: 'settings',
    description: 'Toggle Anti-Flood — detects spam bursts and warns or mutes',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('ANTI_FLOOD').catch(() => 'false');
    const newVal = cur === 'true' ? 'false' : 'true';
    await setSetting('ANTI_FLOOD', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`🌊 *Anti-Flood* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*\n\nAction: warn (use \`.floodaction mute\` to mute instead)\nLimit: 5 messages / 5 seconds`);
});

gmd({
    pattern: 'floodaction',
    aliases: ['setfloodaction'],
    react: '⚙️',
    category: 'settings',
    description: 'Set flood action: warn or mute',
}, async (mek, { reply, react }, m) => {
    const args = mek.body?.split(' ').slice(1) || [];
    const action = (args[0] || '').toLowerCase();
    if (!['warn', 'mute'].includes(action)) {
        return reply('⚙️ Usage: `.floodaction warn` or `.floodaction mute`');
    }
    await setSetting('FLOOD_ACTION', action);
    await react('✅');
    await reply(`⚙️ Flood action set to *${action.toUpperCase()}*`);
});

gmd({
    pattern: 'polltracker',
    aliases: ['setpoll', 'polltrack'],
    react: '📊',
    category: 'settings',
    description: 'Toggle Poll Tracker — sends live vote tallies to owner DM',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('POLL_TRACKER').catch(() => 'false');
    const newVal = cur === 'true' ? 'false' : 'true';
    await setSetting('POLL_TRACKER', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`📊 *Poll Tracker* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*`);
});

gmd({
    pattern: 'disappearlog',
    aliases: ['setdisappear', 'ephemerallog'],
    react: '💨',
    category: 'settings',
    description: 'Toggle Disappearing Msg Log — logs ephemeral messages before they vanish',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('DISAPPEAR_LOG').catch(() => 'false');
    const newVal = cur === 'true' ? 'false' : 'true';
    await setSetting('DISAPPEAR_LOG', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`💨 *Disappear Log* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*`);
});

gmd({
    pattern: 'pttsave',
    aliases: ['setptt', 'audiosave', 'voicesave'],
    react: '🎙️',
    category: 'settings',
    description: 'Toggle PTT/Audio Save — forwards voice notes from DM to owner',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('PTT_SAVE').catch(() => 'false');
    const newVal = cur === 'true' ? 'false' : 'true';
    await setSetting('PTT_SAVE', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`🎙️ *PTT/Audio Save* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*`);
});

gmd({
    pattern: 'mentionalert',
    aliases: ['setmention', 'mentionping'],
    react: '🔔',
    category: 'settings',
    description: 'Toggle Mention Alert — pings owner DM whenever bot is @mentioned',
}, async (mek, { reply, react }, m) => {
    const cur = await getSetting('MENTION_ALERT').catch(() => 'true');
    const newVal = (cur === 'true' || cur === null || cur === undefined) ? 'false' : 'true';
    await setSetting('MENTION_ALERT', newVal);
    await react(newVal === 'true' ? '✅' : '❌');
    await reply(`🔔 *Mention Alert* is now *${newVal === 'true' ? 'ON ✅' : 'OFF ❌'}*`);
});
