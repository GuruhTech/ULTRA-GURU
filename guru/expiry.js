'use strict';
// ╔══════════════════════════════════════════════════════════════╗
//  ULTRA GURU MD  —  expiry.js
//  Licence / deployment expiry gate
//  Reads from: process.env.BOT_EXPIRY_DATE or EXPIRY_DATE (primary)
//              BOT_EXPIRY_DATE in DB via .setexpiry (fallback)
//  Format: YYYY-MM-DD | DD/MM/YYYY | DD-MM-YYYY | DD.MM.YYYY
// ╚══════════════════════════════════════════════════════════════╝

const FORMATS = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
];

function parseExpiryDate(raw) {
    if (!raw || !raw.trim()) return null;
    const s = raw.trim();

    const iso = FORMATS[0].exec(s);
    if (iso) {
        const d = new Date(`${iso[1]}-${iso[2].padStart(2,'0')}-${iso[3].padStart(2,'0')}T00:00:00.000Z`);
        if (!isNaN(d)) return d;
    }
    for (let i = 1; i <= 3; i++) {
        const m = FORMATS[i].exec(s);
        if (m) {
            const [, dd, mm, yyyy] = m;
            const d = new Date(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T00:00:00.000Z`);
            if (!isNaN(d)) return d;
        }
    }
    return null;
}

async function getRawExpiry() {
    const fromEnv = process.env.BOT_EXPIRY_DATE || process.env.EXPIRY_DATE;
    if (fromEnv && fromEnv.trim()) return fromEnv.trim();
    try {
        const { getSetting } = require('./database/settings');
        const fromDb = await getSetting('BOT_EXPIRY_DATE');
        if (fromDb && fromDb.trim()) return fromDb.trim();
    } catch {}
    return null;
}

function daysUntil(expiryDate) {
    return Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function hoursUntil(expiryDate) {
    return (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);
}

function fmtDate(d) {
    return d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
    });
}

function fmtCountdown(ms) {
    if (ms <= 0) return 'EXPIRED';
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function expiryBar(daysLeft, totalDays = 30, width = 16) {
    if (!totalDays || totalDays <= 0) totalDays = 30;
    const used   = Math.max(0, totalDays - daysLeft);
    const pct    = Math.min(100, Math.round((used / totalDays) * 100));
    const filled = Math.round((pct / 100) * width);
    const bar    = '█'.repeat(filled) + '░'.repeat(width - filled);
    return `[${bar}] ${pct}%`;
}

async function expiryLine(totalDays = 30) {
    try {
        const raw = await getRawExpiry();
        if (!raw) return '✅ No expiry set';
        const exp = parseExpiryDate(raw);
        if (!exp)  return '✅ No expiry set';
        const days = daysUntil(exp);
        const ms   = exp.getTime() - Date.now();
        const bar  = expiryBar(days, totalDays);

        if (days <= 0)  return `🔴 *EXPIRED* ${Math.abs(days)} day(s) ago · ${fmtDate(exp)}`;
        if (days === 1) return `🆘 *EXPIRES TODAY* in ${fmtCountdown(ms)} ${bar} · ${fmtDate(exp)}`;
        if (days <= 3)  return `🔴 *${days} days left!* ${bar} · ${fmtDate(exp)}`;
        if (days <= 7)  return `🟠 *${days} days left* ${bar} · ${fmtDate(exp)}`;
        if (days <= 14) return `🟡 ${days} days left ${bar} · ${fmtDate(exp)}`;
        return `🟢 Active · ${days}d left ${bar} · ${fmtDate(exp)}`;
    } catch { return '✅ No expiry'; }
}

async function getExpiryStatus() {
    try {
        const raw = await getRawExpiry();
        if (!raw) return { line: '✅ No expiry set', urgent: false, active: true, daysLeft: null };
        const exp = parseExpiryDate(raw);
        if (!exp)  return { line: '✅ No expiry set', urgent: false, active: true, daysLeft: null };
        const days = daysUntil(exp);
        const ms   = exp.getTime() - Date.now();
        const bar  = expiryBar(days, 30, 14);

        if (ms <= 0) return {
            line: `🔴 *EXPIRED* ${Math.abs(days)}d ago · Contact owner!`,
            urgent: true, active: false, daysLeft: days,
        };
        if (days === 1) return {
            line: `🆘 *TODAY!* ${fmtCountdown(ms)} left\n     ${bar}`,
            urgent: true, active: true, daysLeft: days,
        };
        if (days <= 3) return {
            line: `🔴 *${days}d left!* ${fmtCountdown(ms)}\n     ${bar} · ${fmtDate(exp)}`,
            urgent: true, active: true, daysLeft: days,
        };
        if (days <= 7) return {
            line: `🟠 ${days}d left · ${bar} · ${fmtDate(exp)}`,
            urgent: false, active: true, daysLeft: days,
        };
        return {
            line: `🟢 Active · ${days}d remaining · ${fmtDate(exp)}`,
            urgent: false, active: true, daysLeft: days,
        };
    } catch { return { line: '✅ No expiry', urgent: false, active: true, daysLeft: null }; }
}

const ALERT_DAYS  = [14, 7, 5, 3, 2, 1];
const alertsSent  = new Set();

async function checkExpiry({ onExpire, onWarn, exitOnExpiry = true } = {}) {
    const raw = await getRawExpiry();
    if (!raw) return { active: true, daysLeft: null, hoursLeft: null, expiryDate: null };

    const expiryDate = parseExpiryDate(raw);
    if (!expiryDate) return { active: true, daysLeft: null, hoursLeft: null, expiryDate: null };

    const days  = daysUntil(expiryDate);
    const hours = hoursUntil(expiryDate);
    const ms    = expiryDate.getTime() - Date.now();

    if (ms <= 0) {
        const expiredAgo = Math.abs(days);
        const msg =
            `\n╔${'═'.repeat(54)}╗\n` +
            `║  ⛔  ULTRA GURU MD — LICENCE EXPIRED\n` +
            `╠${'═'.repeat(54)}╣\n` +
            `║  📅  Expiry Date : ${fmtDate(expiryDate)}\n` +
            `║  ⏱️   Expired     : ${expiredAgo} day(s) ago\n` +
            `║  🔒  All commands have been locked.\n` +
            `║  📞  Contact owner to renew your licence.\n` +
            `╚${'═'.repeat(54)}╝\n`;

        console.error(msg);
        if (typeof onExpire === 'function') {
            try { await onExpire(msg, expiryDate); } catch {}
        }
        if (exitOnExpiry) {
            await new Promise(r => setTimeout(r, 5000));
            process.exit(0);
        }
        return { active: false, daysLeft: days, hoursLeft: hours, expiryDate };
    }

    for (const threshold of ALERT_DAYS) {
        if (days <= threshold && !alertsSent.has(threshold)) {
            alertsSent.add(threshold);
            const urgency  = days <= 1 ? '🆘' : days <= 3 ? '🔴' : days <= 7 ? '🟠' : '🟡';
            const countdown = fmtCountdown(ms);
            const warnMsg =
                `${urgency} *LICENCE EXPIRY WARNING*\n\n` +
                `📅 *Expires on:* ${fmtDate(expiryDate)}\n` +
                `⏳ *Time left:*  ${countdown}\n` +
                `${expiryBar(days, 30)}\n\n` +
                `📞 *Contact your owner to renew!*`;
            console.warn(`[EXPIRY] ⚠️ Licence expires in ${days} day(s) on ${fmtDate(expiryDate)}`);
            if (typeof onWarn === 'function') {
                try { await onWarn(warnMsg, days, expiryDate); } catch {}
            }
        }
    }

    return { active: true, daysLeft: days, hoursLeft: hours, expiryDate };
}

function startExpiryWatchdog(onExpire, onWarn) {
    const THIRTY_MINS = 30 * 60 * 1000;
    // exitOnExpiry is always false — we lock commands via global._licenceExpired
    // and notify the owner, but we NEVER kill the process here.
    const run = () => checkExpiry({ onExpire, onWarn, exitOnExpiry: false });
    run();
    const timer = setInterval(run, THIRTY_MINS);
    if (timer.unref) timer.unref();
    console.log('🔒 [EXPIRY] Licence watchdog started (checks every 30 min, no process.exit)');
}

function gmdProgress(filled, total = 10) {
    const f   = Math.max(0, Math.min(total, Math.round((filled / total) * total)));
    const bar = '▰'.repeat(f) + '▱'.repeat(total - f);
    return `${bar} ${Math.round((filled / total) * 100)}%`;
}

function gmdTable(title, rows = [], footer = '') {
    const W   = 38;
    const DIV = `┃${'━'.repeat(W)}┃`;
    const TOP = `┏${'━'.repeat(W)}┓`;
    const BOT = `┗${'━'.repeat(W)}┛`;
    const row = (l, v) => {
        const label = String(l).padEnd(14);
        const value = String(v).slice(0, 22);
        return `┃  ${label}: ${value}`;
    };
    let out = `${TOP}\n┃  🔷  *${title}*\n${DIV}\n`;
    for (const [l, v] of rows) out += row(l, v) + '\n';
    if (footer) out += `${DIV}\n┃  _${footer}_\n`;
    out += BOT;
    return out;
}

function gmdBanner(title, lines = [], footer = '') {
    const W   = 38;
    const TOP = `╔${'═'.repeat(W)}╗`;
    const MID = `╠${'═'.repeat(W)}╣`;
    const BOT = `╚${'═'.repeat(W)}╝`;
    const pad = (s) => `║  ${s}`;
    let out = `${TOP}\n${pad(`*${title}*`)}\n`;
    if (lines.length) { out += `${MID}\n`; for (const l of lines) out += pad(l) + '\n'; }
    if (footer) { out += `${MID}\n${pad(`_${footer}_`)}\n`; }
    out += BOT;
    return out;
}

module.exports = {
    parseExpiryDate, daysUntil, hoursUntil, fmtDate, fmtCountdown,
    expiryBar, expiryLine, getExpiryStatus, checkExpiry, startExpiryWatchdog,
    gmdProgress, gmdTable, gmdBanner,
};
