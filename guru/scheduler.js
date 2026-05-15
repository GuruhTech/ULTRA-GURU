
const { getSetting } = require("./database/settings");
const { getAllGreetingsChats, addGreetingsChat, initGreetingsDB } = require("./database/greetings");

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

let schedulerInterval = null;
let lastGmSent = null;
let lastGnSent = null;

function parseTime(timeStr) {
    const [h, m] = (timeStr || "06:00").split(":").map(Number);
    return { hour: isNaN(h) ? 6 : h, minute: isNaN(m) ? 0 : m };
}

async function sendGreeting(Gifted, type) {
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
                    await Gifted.sendMessage(jid, {
                        image: { url: botPic },
                        caption: fullText,
                    });
                } else {
                    await Gifted.sendMessage(jid, { text: fullText });
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

async function startScheduler(Gifted) {
    await initGreetingsDB();

    if (schedulerInterval) clearInterval(schedulerInterval);

    Gifted.ev.on("messages.upsert", async ({ messages, type }) => {
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
            const enabled = await getSetting("GREETINGS_ENABLED");
            if (enabled !== "true") return;

            const tz = (await getSetting("TIME_ZONE")) || "Africa/Nairobi";
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
            const hour = now.getHours();
            const minute = now.getMinutes();
            const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

            const gmTimeStr = (await getSetting("GREETINGS_GM_TIME")) || "06:00";
            const gnTimeStr = (await getSetting("GREETINGS_GN_TIME")) || "22:00";
            const { hour: gmH, minute: gmM } = parseTime(gmTimeStr);
            const { hour: gnH, minute: gnM } = parseTime(gnTimeStr);

            if (hour === gmH && minute === gmM && lastGmSent !== `gm_${dateKey}`) {
                lastGmSent = `gm_${dateKey}`;
                console.log("⏰ [Greeter] Sending Good Morning...");
                await sendGreeting(Gifted, "morning");
            }

            if (hour === gnH && minute === gnM && lastGnSent !== `gn_${dateKey}`) {
                lastGnSent = `gn_${dateKey}`;
                console.log("⏰ [Greeter] Sending Good Night...");
                await sendGreeting(Gifted, "night");
            }
        } catch (e) {
            console.error("⏰ [Greeter] Scheduler tick error:", e.message);
        }
    }, 60000);

    console.log("⏰ Greeting scheduler started (checks every 60s)");
}

function stopScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log("⏰ Greeting scheduler stopped");
    }
}

module.exports = { startScheduler, stopScheduler, sendGreeting };
