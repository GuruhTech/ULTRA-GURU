
const { getSetting, setSetting } = require("./database/settings");
const { getAllGreetingsChats, addGreetingsChat, initGreetingsDB } = require("./database/greetings");

// ─── COUNTRY CODE → TIMEZONE MAP ─────────────────────────────────────────────
const COUNTRY_TZ = {
    '254': 'Africa/Nairobi',        '255': 'Africa/Dar_es_Salaam',
    '256': 'Africa/Kampala',        '250': 'Africa/Kigali',
    '234': 'Africa/Lagos',          '233': 'Africa/Accra',
    '27':  'Africa/Johannesburg',   '260': 'Africa/Lusaka',
    '263': 'Africa/Harare',         '265': 'Africa/Blantyre',
    '251': 'Africa/Addis_Ababa',    '252': 'Africa/Mogadishu',
    '237': 'Africa/Douala',         '216': 'Africa/Tunis',
    '212': 'Africa/Casablanca',     '20':  'Africa/Cairo',
    '249': 'Africa/Khartoum',       '243': 'Africa/Kinshasa',
    '244': 'Africa/Luanda',         '221': 'Africa/Dakar',
    '225': 'Africa/Abidjan',        '258': 'Africa/Maputo',
    '264': 'Africa/Windhoek',       '267': 'Africa/Gaborone',
    '971': 'Asia/Dubai',            '966': 'Asia/Riyadh',
    '965': 'Asia/Kuwait',           '974': 'Asia/Qatar',
    '968': 'Asia/Muscat',           '962': 'Asia/Amman',
    '961': 'Asia/Beirut',           '91':  'Asia/Kolkata',
    '92':  'Asia/Karachi',          '62':  'Asia/Jakarta',
    '60':  'Asia/Kuala_Lumpur',     '65':  'Asia/Singapore',
    '63':  'Asia/Manila',           '66':  'Asia/Bangkok',
    '84':  'Asia/Ho_Chi_Minh',      '81':  'Asia/Tokyo',
    '82':  'Asia/Seoul',            '86':  'Asia/Shanghai',
    '1':   'America/New_York',      '44':  'Europe/London',
    '49':  'Europe/Berlin',         '33':  'Europe/Paris',
    '39':  'Europe/Rome',           '34':  'Europe/Madrid',
    '31':  'Europe/Amsterdam',      '55':  'America/Sao_Paulo',
    '52':  'America/Mexico_City',   '57':  'America/Bogota',
    '54':  'America/Argentina/Buenos_Aires',
    '61':  'Australia/Sydney',      '64':  'Pacific/Auckland',
    '7':   'Europe/Moscow',
};

function getTimezoneFromPhone(phoneNum) {
    // Try longest match first (e.g. 254 before 25)
    for (const len of [3, 2, 1]) {
        const prefix = String(phoneNum).slice(0, len);
        if (COUNTRY_TZ[prefix]) return COUNTRY_TZ[prefix];
    }
    return null;
}

// ─── PER-USER GREETING TRACKER (in-memory, resets each bot start) ─────────────
// Structure: Map<jid, { date: 'YYYY-MM-DD', gm: bool, gn: bool, noon: bool }>
const _userGreeted = new Map();

function _todayKey(tz) {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: tz || 'UTC' }));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function _localHour(tz) {
    return new Date(new Date().toLocaleString('en-US', { timeZone: tz || 'UTC' })).getHours();
}

const PERSONAL_GM = [
    (name) => `🌅 *Good morning, ${name}!* ☀️\n\nA brand new day is here — full of energy, opportunity and blessings! Start strong, stay focused. You've got this! 💪\n\n🙏 Thank you for choosing *ULTRA GURU MD*. We're here for you all day! 🤖`,
    (name) => `☀️ *Rise and shine, ${name}!*\n\nToday is a fresh canvas — paint it with purpose and passion. Drink some water, take a deep breath, and conquer the day! 🌟\n\n💙 *ULTRA GURU MD* says GM! Thanks for using us 🤖`,
    (name) => `🌄 *Good morning, ${name}!*\n\nYou made it to another beautiful day! ✨ Make the most of every moment — greatness is just one decision away.\n\n🤖 *ULTRA GURU MD* — always by your side. Thank you for your loyalty! 💜`,
    (name) => `🌞 *Hey ${name}, good morning!*\n\nWishing you a day filled with success, smiles and good vibes! 🔥 Go out there and show the world what you're made of!\n\n> 🤖 _Powered by ULTRA GURU MD — your #1 WhatsApp assistant_`,
    (name) => `☕ *Morning, ${name}!*\n\nHope you slept well and woke up refreshed! Today is loaded with possibilities — grab them! 🚀\n\n✨ *Thank you for using ULTRA GURU MD!* We appreciate you every single day 💙`,
];

const PERSONAL_GN = [
    (name) => `🌙 *Good night, ${name}!* 😴\n\nYou made it through another day — well done! Rest well tonight, recharge and come back stronger tomorrow.\n\n🙏 *ULTRA GURU MD* thanks you for being part of our family. Sleep tight! 🤖`,
    (name) => `✨ *Goodnight, ${name}!*\n\nSweet dreams! You worked hard today and you deserve all the rest. Tomorrow is a fresh start waiting for you. 🌙\n\n💙 *Thank you for using ULTRA GURU MD!* We'll be here when you wake up 🤖`,
    (name) => `🌛 *Time to rest, ${name}!*\n\nAs the stars come out tonight, let all worries fade. Sleep deeply and wake up refreshed and ready! 💤\n\n> 🤖 _ULTRA GURU MD — grateful for every day you choose us!_`,
    (name) => `😴 *Good night, ${name}!*\n\nHope your day was amazing! Your body and mind need rest now — go recharge. Greatness awaits tomorrow! 🌺\n\n✨ *Thank you for using ULTRA GURU MD* — See you in the morning! 💜`,
    (name) => `🌙 *Goodnight, ${name}!* 💫\n\nLay your head down and let go of everything. Tomorrow is a brand new chance to shine even brighter!\n\n🙏 *ULTRA GURU MD* night mode: ON — Thank you for being amazing! 🤖`,
];

const PERSONAL_NOON = [
    (name) => `🌤️ *Good afternoon, ${name}!*\n\nHope your morning was productive! Keep the momentum going — the day is still yours! 💪\n\n🤖 *ULTRA GURU MD* checking in. Thank you for choosing us! ✨`,
    (name) => `☀️ *Afternoon, ${name}!*\n\nMidday energy check! Take a short break, grab something to eat, and then go finish the day strong! 🍽️\n\n💙 *Thank you for using ULTRA GURU MD!* 🤖`,
];

async function getUserTimezone(jid) {
    // Priority: user-set preference → country code from phone → server timezone → UTC
    try {
        const phone = jid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
        const userPref = await getSetting(`USER_TZ_${phone}`).catch(() => null);
        if (userPref && userPref.trim()) return userPref.trim();
        const fromPhone = getTimezoneFromPhone(phone);
        if (fromPhone) return fromPhone;
    } catch {}
    return (await getSetting('TIME_ZONE').catch(() => null)) || 'Africa/Nairobi';
}

async function checkAndGreetUser(Guru, jid, pushName, settings) {
    try {
        // Only greet DMs, skip groups, status, newsletters
        if (!jid || jid.endsWith('@g.us') || jid.endsWith('@newsletter') || jid === 'status@broadcast') return;

        const enabled = settings?.GREETINGS_ENABLED || await getSetting('GREETINGS_ENABLED').catch(() => 'false');
        if (enabled !== 'true') return;

        const tz     = await getUserTimezone(jid);
        const hour   = _localHour(tz);
        const today  = _todayKey(tz);
        const name   = (pushName || 'Friend').split(' ')[0];

        const state  = _userGreeted.get(jid) || { date: null, gm: false, gn: false, noon: false };
        // Reset if it's a new day
        if (state.date !== today) {
            state.date = today;
            state.gm   = false;
            state.gn   = false;
            state.noon = false;
        }

        let type = null;
        // Morning: 5am – 11:59am
        if (hour >= 5 && hour < 12 && !state.gm) { type = 'gm'; state.gm = true; }
        // Afternoon: 12pm – 4:59pm
        else if (hour >= 12 && hour < 17 && !state.noon) { type = 'noon'; state.noon = true; }
        // Night: 8pm – 11:59pm
        else if (hour >= 20 && hour < 24 && !state.gn) { type = 'gn'; state.gn = true; }

        if (!type) return; // Not a greeting window, or already greeted

        _userGreeted.set(jid, state);

        let pool, msg;
        if (type === 'gm')   pool = PERSONAL_GM;
        else if (type === 'gn') pool = PERSONAL_GN;
        else pool = PERSONAL_NOON;

        msg = pool[Math.floor(Math.random() * pool.length)](name);

        const botPic = settings?.BOT_PIC || await getSetting('BOT_PIC').catch(() => null);
        if (botPic && botPic.startsWith('http')) {
            await Guru.sendMessage(jid, { image: { url: botPic }, caption: msg });
        } else {
            await Guru.sendMessage(jid, { text: msg });
        }
    } catch (e) {
        // Silent fail — greetings are non-critical
    }
}

const GM_MESSAGES = [
    `🌅 *Good Morning!* ☀️\n\nRise and shine, fam! A brand new day is here — full of possibilities. Start strong, stay focused, and make every moment count! 💪\n\n_ULTRA GURU is with you all day_ 🤖`,
    `☀️ *Good Morning, Beautiful People!*\n\nToday is a fresh canvas — paint it with purpose, positivity and passion! Don't waste a single second 🌟\n\n_Your favourite bot, ULTRA GURU, says GM!_ 🤖`,
    `🌄 *Wakey wakey!* It's morning time!\n\nThe early bird catches the worm 🐦 Get up, drink some water, and go conquer the day!\n\n_ULTRA GURU wishes you a productive morning_ ⚡`,
    `🌞 *Good Morning!*\n\nEvery morning is a new beginning — a chance to do better than yesterday. Believe in yourself and make it happen! 🙏✨\n\n_Stay blessed — ULTRA GURU_ 🤖`,
    `☕ *GM fam!*\n\nHope you slept well! Today is going to be amazing — just go out there and own it. You've got this! 🔥\n\n_ULTRA GURU checking in on you_ 💙`,
    `🌻 *Good Morning!*\n\nGreat things never come from comfort zones. Push yourself today and be the best version of you! 🚀\n\n_Starting your day right — ULTRA GURU_ ⚡`,
];

const GN_MESSAGES = [
    `🌙 *Good Night!* 😴\n\nAnother day done and dusted! Rest well tonight — your body and mind need it. Tomorrow is a new chance to shine! 🌟\n\n_ULTRA GURU says sleep tight_ 🤖`,
    `✨ *Good Night, fam!*\n\nSweet dreams to everyone! You worked hard today — now let your body recharge. See you on the other side! 😊🌙\n\n_ULTRA GURU going to sleep mode_ 🤖`,
    `🌙 *Goodnight everyone!*\n\nAs the stars come out tonight, let all your worries fade away. Rest deeply and wake up refreshed and ready! 💤\n\n_Signed off — ULTRA GURU_ ⚡`,
    `😴 *Time to rest!*\n\nHope your day was as amazing as you are! Go recharge — greatness is waiting for you tomorrow morning! 🙏\n\n_ULTRA GURU bids you goodnight_ 💙`,
    `🌛 *Good Night!*\n\nThe day is over, let go of everything that didn't go your way. Tomorrow is a fresh start. Sleep well! 🌺\n\n_ULTRA GURU night mode: ON_ 🤖`,
    `💤 *Goodnight fam!*\n\nLay your head down, close your eyes, and let the magic of sleep work on you. Wishing you peaceful rest tonight! 🌙✨\n\n_From ULTRA GURU with love_ 🤖`,
];

// ── Daily Wellness Messages ───────────────────────────────────────────────────
const WELLNESS_MESSAGES = [
    `🌟 *Daily Check-In — ULTRA GURU MD*\n${"═".repeat(32)}\n\n` +
    `👋 Hey fam! Hope you're having an amazing day!\n\n` +
    `📋 *Quick Check-In:*\n` +
    `✅ How are you doing today?\n` +
    `🔄 Have you updated your bot lately?\n` +
    `💡 Any features you'd love to see added?\n\n` +
    `${"─".repeat(32)}\n` +
    `💙 *ULTRA GURU MD* appreciates every single one of you!\n` +
    `Keep thriving — you're doing great! 🚀\n\n` +
    `> _Reply anytime — we're always listening!_`,

    `💫 *Morning Pulse — ULTRA GURU MD*\n${"═".repeat(32)}\n\n` +
    `🌤️ Good day, legend!\n\n` +
    `We hope you're well-rested and fired up! 🔥\n\n` +
    `📌 *Today's Reminders:*\n` +
    `🤖 Your bot is running and protecting your chats\n` +
    `🔄 Check for bot updates: *.update* command\n` +
    `💬 Invite friends to use ULTRA GURU MD!\n\n` +
    `${"─".repeat(32)}\n` +
    `Stay healthy, stay blessed! 🙏\n` +
    `> _ULTRA GURU MD — Built with love, just for you_`,

    `🎯 *Daily Update Check — ULTRA GURU MD*\n${"═".repeat(32)}\n\n` +
    `Hi there! 👋\n\n` +
    `*A gentle reminder:*\n` +
    `🔄 Have you checked for bot updates today?\n` +
    `   → Use *.update* to see the latest version\n\n` +
    `🛡️ Your groups are protected by ULTRA GURU MD\n` +
    `⚡ All systems are running smoothly!\n\n` +
    `${"─".repeat(32)}\n` +
    `We hope your day is going wonderfully! 😊\n` +
    `Thank you for being part of the GURU family! 💜`,

    `☀️ *ULTRA GURU MD — Daily Wellness*\n${"═".repeat(32)}\n\n` +
    `Hello beautiful people! 🌺\n\n` +
    `*How's your bot doing today?*\n\n` +
    `📊 Quick tips to keep your bot healthy:\n` +
    `• Run *.ping* to check response speed\n` +
    `• Run *.update* to stay on latest version\n` +
    `• Run *.status* for system overview\n\n` +
    `${"─".repeat(32)}\n` +
    `Most importantly — how are *YOU* doing? 💙\n` +
    `Wishing you nothing but great vibes today! ✨`,
];

let schedulerInterval = null;
let lastGmSent       = null;
let lastGnSent       = null;
let lastWellnessSent = null;

function parseTime(timeStr) {
    const [h, m] = (timeStr || "06:00").split(":").map(Number);
    return { hour: isNaN(h) ? 6 : h, minute: isNaN(m) ? 0 : m };
}

async function sendGreeting(Guru, type) {
    try {
        const chats = await getAllGreetingsChats();
        if (!chats.length) {
            console.log(`⏰ [Greeter] No chats registered — skipping ${type} greeting`);
            return 0;
        }

        const botName = (await getSetting("BOT_NAME")) || "ULTRA GURU";
        const botFooter = (await getSetting("FOOTER")) || "Powered by GURUTECH";

        const customMsgKey = type === "morning" ? "GREETINGS_GM_MSG" : "GREETINGS_GN_MSG";
        const customMsg = await getSetting(customMsgKey);
        const pool = type === "morning" ? GM_MESSAGES : GN_MESSAGES;
        const baseMsg = customMsg || pool[Math.floor(Math.random() * pool.length)];

        const botPic = await getSetting("BOT_PIC");
        const fullText = `${baseMsg}\n\n> _${botFooter}_`;

        let sent = 0;
        for (const { jid } of chats) {
            try {
                if (botPic) {
                    await Guru.sendMessage(jid, {
                        image: { url: botPic },
                        caption: fullText,
                    });
                } else {
                    await Guru.sendMessage(jid, { text: fullText });
                }
                sent++;
                await new Promise(r => setTimeout(r, 1200));
            } catch (e) {
                console.error(`⏰ [Greeter] Failed to send to ${jid}: ${e.message}`);
            }
        }

        console.log(`⏰ [Greeter] Sent ${type} greeting to ${sent}/${chats.length} chat(s)`);
        return sent;
    } catch (e) {
        console.error("⏰ [Greeter] sendGreeting error:", e.message);
        return 0;
    }
}

async function startScheduler(Guru) {
    await initGreetingsDB();

    if (schedulerInterval) clearInterval(schedulerInterval);

    Guru.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        try {
            const enabled = await getSetting("GREETINGS_ENABLED");
            if (enabled !== "true") return;
            const autoTrack = await getSetting("GREETINGS_AUTOTRACK");
            if (autoTrack === "false") return;

            for (const msg of messages) {
                const jid = msg.key?.remoteJid;
                if (!jid || jid.endsWith("@newsletter") || jid === "status@broadcast") continue;
                if (msg.key.fromMe) continue;
                await addGreetingsChat(jid).catch(() => {});
            }
        } catch (_) {}
    });

    schedulerInterval = setInterval(async () => {
        try {
            const tz  = (await getSetting("TIME_ZONE")) || "Africa/Nairobi";
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
            const hour    = now.getHours();
            const minute  = now.getMinutes();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
            const nowMin  = hour * 60 + minute; // current time as total minutes

            // ── Good Morning ───────────────────────────────────────────────
            const greetEnabled = await getSetting("GREETINGS_ENABLED");
            if (greetEnabled === "true") {
                const gmTimeStr = (await getSetting("GREETINGS_GM_TIME")) || "06:00";
                const gnTimeStr = (await getSetting("GREETINGS_GN_TIME")) || "22:00";
                const { hour: gmH, minute: gmM } = parseTime(gmTimeStr);
                const { hour: gnH, minute: gnM } = parseTime(gnTimeStr);
                const gmMin = gmH * 60 + gmM;
                const gnMin = gnH * 60 + gnM;

                // 10-minute send window — survives bot restarts within 10 min of schedule
                if (nowMin >= gmMin && nowMin <= gmMin + 10 && lastGmSent !== `gm_${dateKey}`) {
                    lastGmSent = `gm_${dateKey}`;
                    console.log("⏰ [Greeter] Sending Good Morning...");
                    await sendGreeting(Guru, "morning");
                }

                if (nowMin >= gnMin && nowMin <= gnMin + 10 && lastGnSent !== `gn_${dateKey}`) {
                    lastGnSent = `gn_${dateKey}`;
                    console.log("⏰ [Greeter] Sending Good Night...");
                    await sendGreeting(Guru, "night");
                }
            }

            // ── Daily Wellness Check-In ────────────────────────────────────
            const wellnessEnabled = await getSetting("DAILY_WELLNESS");
            if (wellnessEnabled === "true") {
                const wellnessTimeStr = (await getSetting("WELLNESS_TIME")) || "10:00";
                const { hour: wH, minute: wM } = parseTime(wellnessTimeStr);
                const wMin = wH * 60 + wM;

                if (nowMin >= wMin && nowMin <= wMin + 10 && lastWellnessSent !== `wellness_${dateKey}`) {
                    lastWellnessSent = `wellness_${dateKey}`;
                    console.log("💙 [Wellness] Sending daily check-in...");
                    await sendWellness(Guru);
                }
            }
        } catch (e) {
            console.error("⏰ [Greeter] Scheduler tick error:", e.message);
        }
    }, 60_000);

    console.log("⏰ Greeting scheduler started (checks every 60s)");
}

async function sendWellness(Guru) {
    try {
        const chats = await getAllGreetingsChats();
        if (!chats.length) return 0;

        const msg      = WELLNESS_MESSAGES[Math.floor(Math.random() * WELLNESS_MESSAGES.length)];
        const botPic   = await getSetting("BOT_PIC").catch(() => null);
        const footer   = (await getSetting("FOOTER").catch(() => null)) || "Powered by GURUTECH";
        const fullText = `${msg}\n\n> _${footer}_`;

        let sent = 0;
        for (const { jid } of chats) {
            try {
                if (botPic && botPic.startsWith("http")) {
                    await Guru.sendMessage(jid, { image: { url: botPic }, caption: fullText });
                } else {
                    await Guru.sendMessage(jid, { text: fullText });
                }
                sent++;
                await new Promise(r => setTimeout(r, 1_200));
            } catch (e) {
                console.error(`💙 [Wellness] Failed to send to ${jid}:`, e.message);
            }
        }
        console.log(`💙 [Wellness] Sent check-in to ${sent}/${chats.length} chats`);
        return sent;
    } catch (e) {
        console.error("💙 [Wellness] sendWellness error:", e.message);
        return 0;
    }
}

function stopScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log("⏰ Greeting scheduler stopped");
    }
}

module.exports = { startScheduler, stopScheduler, sendGreeting, sendWellness, checkAndGreetUser, getUserTimezone };
