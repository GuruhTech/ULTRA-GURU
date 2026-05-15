
const { gmd } = require("../guru");
const axios = require("axios");

const RIDDLES = [
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", a: "An echo" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps" },
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?", a: "A map" },
  { q: "What has hands but can't clap?", a: "A clock" },
  { q: "What gets wetter the more it dries?", a: "A towel" },
  { q: "I have a head and a tail, but no body. What am I?", a: "A coin" },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "The letter M" },
  { q: "The more you take away from me, the bigger I get. What am I?", a: "A hole" },
  { q: "I'm always in front of you but can never be seen. What am I?", a: "The future" },
  { q: "What has many keys but can't open a single lock?", a: "A piano" },
  { q: "What runs but never walks, has a mouth but never talks?", a: "A river" },
  { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
];

const ROASTS = [
  "You're like a human version of a participation trophy.",
  "If you were a vegetable, you'd be a turnip — you've turned up nowhere.",
  "I'd roast you, but my mom said I'm not supposed to burn trash.",
  "You're proof that even nature makes mistakes.",
  "I'm not saying you're dumb, but you'd lose a game of wits to a toaster.",
  "You're the reason they put instructions on shampoo bottles.",
  "You have the energy of a dying phone battery.",
  "If brains were petrol, you wouldn't have enough to power an ant's moped.",
  "You're the human equivalent of a 'loading' screen.",
  "Somewhere out there, a tree is working overtime producing the oxygen you waste.",
];

gmd(
  {
    pattern: "dice",
    aliases: ["roll", "d6"],
    description: "Roll a dice (1-6)",
    react: "🎲",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    const result = Math.floor(Math.random() * 6) + 1;
    const faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    await react("✅");
    await reply(`🎲 *Dice Roll*\n\n${faces[result]}  You rolled: *${result}*\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "coin",
    aliases: ["flip", "toss"],
    description: "Flip a coin (Heads or Tails)",
    react: "🪙",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    const flip = Math.random() > 0.5 ? "🟡 Heads" : "⚪ Tails";
    await react("✅");
    await reply(`🪙 *Coin Flip*\n\n${flip}\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "random",
    aliases: ["rnd", "rand"],
    description: "Generate random number in range. Usage: .random 1 100",
    react: "🎰",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { args, reply, react, botFooter } = conText;
    const min = parseInt(args[0]) || 1;
    const max = parseInt(args[1]) || 100;
    if (min >= max) return reply("❌ Min must be less than Max!");
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    await react("✅");
    await reply(`🎰 *Random Number*\n\nRange: ${min} – ${max}\nResult: *${num}*\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "joke",
    aliases: ["jokes", "funny"],
    description: "Get a random joke",
    react: "😂",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    try {
      await react("⏳");
      const res = await axios.get("https://official-joke-api.appspot.com/random_joke", { timeout: 10000 });
      const { setup, punchline } = res.data;
      await react("✅");
      await reply(`😂 *Joke*\n\n${setup}\n\n_${punchline}_\n\n> _${botFooter}_`);
    } catch {
      await react("❌");
      await reply("❌ Could not fetch a joke right now. Try again!");
    }
  }
);

gmd(
  {
    pattern: "meme",
    aliases: ["memes", "funnypic"],
    description: "Get a random meme from Reddit",
    react: "😆",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, mek, botFooter, botName } = conText;
    try {
      await react("⏳");
      const res = await axios.get("https://meme-api.com/gimme", { timeout: 10000 });
      const { url, title, subreddit } = res.data;
      await Gifted.sendMessage(from, {
        image: { url },
        caption: `*${botName} MEME*\n\n😆 ${title}\n📌 r/${subreddit}\n\n> _${botFooter}_`,
      }, { quoted: mek });
      await react("✅");
    } catch {
      await react("❌");
      await reply("❌ Could not fetch meme right now. Try again!");
    }
  }
);

gmd(
  {
    pattern: "riddle",
    aliases: ["puzzle", "brainteaser"],
    description: "Get a random riddle",
    react: "🧩",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    const item = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    await react("✅");
    await reply(`🧩 *Riddle*\n\n${item.q}\n\n||Answer: _${item.a}_||\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "trivia",
    aliases: ["triviaquestion", "knowledge"],
    description: "Get a trivia question",
    react: "🧠",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    try {
      await react("⏳");
      const res = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple", { timeout: 10000 });
      const q = res.data.results[0];
      const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
      let txt = `🧠 *Trivia*\n\n*Category:* ${q.category}\n*Difficulty:* ${q.difficulty}\n\n${q.question}\n\n`;
      answers.forEach((a, i) => { txt += `${["🅰️","🅱️","🆎","🆑"][i]} ${a}\n`; });
      txt += `\n||✅ Answer: _${q.correct_answer}_||\n\n> _${botFooter}_`;
      await react("✅");
      await reply(txt);
    } catch {
      await react("❌");
      await reply("❌ Could not fetch trivia right now. Try again!");
    }
  }
);

gmd(
  {
    pattern: "8ball",
    aliases: ["magic8ball", "ask8ball"],
    description: "Ask the magic 8-ball a yes/no question",
    react: "🎱",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, botFooter } = conText;
    if (!q) return reply("*Usage:* `.8ball <your question>`");
    const responses = [
      "✅ Yes, definitely!", "✅ It is certain.", "✅ Most likely.", "✅ Without a doubt.",
      "❓ Ask again later.", "❓ Cannot predict now.", "❓ Signs point to maybe.",
      "❌ No, definitely not.", "❌ Don't count on it.", "❌ Very unlikely.",
    ];
    const answer = responses[Math.floor(Math.random() * responses.length)];
    await react("✅");
    await reply(`🎱 *Magic 8-Ball*\n\n❓ ${q}\n\n${answer}\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "choose",
    aliases: ["pick", "decide"],
    description: "Make a random choice from options. Usage: .choose pizza|burger|tacos",
    react: "🎯",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, botFooter } = conText;
    if (!q) return reply("*Usage:* `.choose option1|option2|option3`\n_Example: .choose pizza|burger|tacos_");
    const options = q.split("|").map(o => o.trim()).filter(Boolean);
    if (options.length < 2) return reply("❌ Provide at least 2 options separated by `|`");
    const choice = options[Math.floor(Math.random() * options.length)];
    await react("✅");
    await reply(`🎯 *I Choose*\n\nOptions: ${options.join(" · ")}\n\n✨ *${choice}*\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "rate",
    aliases: ["rating", "rateme"],
    description: "Rate something out of 10. Usage: .rate pizza",
    react: "⭐",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { q, reply, react, botFooter } = conText;
    if (!q) return reply("*Usage:* `.rate <something>`\n_Example: .rate pizza_");
    const rating = Math.floor(Math.random() * 11);
    const bar = "⭐".repeat(rating) + "☆".repeat(10 - rating);
    await react("✅");
    await reply(`⭐ *Rating*\n\n${q}: *${rating}/10*\n${bar}\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "roast",
    aliases: ["roasting", "burnme"],
    description: "Get a random roast",
    react: "🔥",
    category: "fun",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    await react("✅");
    await reply(`🔥 *Roast*\n\n${roast}\n\n> _${botFooter}_`);
  }
);
