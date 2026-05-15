
const { gmd } = require("../guru");
const { getSetting } = require("../guru/database/settings");
const axios = require("axios");
const crypto = require("crypto");

function mathCalc(expr) {
  const safe = expr.replace(/[^0-9+\-*/%.() \t]/g, "");
  if (!safe.trim()) throw new Error("Invalid expression");
  return Function('"use strict"; return (' + safe + ")")();
}

gmd(
  {
    pattern: "calc",
    aliases: ["calculator", "math", "calculate"],
    react: "🧮",
    category: "tools",
    description: "Calculate math expressions. Usage: .calc 2+2*5",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide a math expression!\nExample: `.calc 2+2*5`");
    try {
      const result = mathCalc(q);
      await react("✅");
      await reply(
        `🧮 *Calculator*\n\n` +
        `*Expression:* \`${q}\`\n` +
        `*Result:* \`${result}\`\n\n` +
        `> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Invalid expression: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "flip",
    aliases: ["coin", "coinflip", "toss"],
    react: "🪙",
    category: "fun",
    description: "Flip a coin — Heads or Tails!",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    const result = Math.random() < 0.5 ? "🟡 *HEADS*" : "⚪ *TAILS*";
    await react("✅");
    await reply(`🪙 *Coin Flip Result*\n\n${result}\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "roll",
    aliases: ["dice", "rolldice"],
    react: "🎲",
    category: "fun",
    description: "Roll a dice. Usage: .roll or .roll 20 (custom sides)",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    const sides = parseInt(q) || 6;
    if (sides < 2 || sides > 1000) return reply("❌ Dice must have between 2 and 1000 sides.");
    const result = Math.floor(Math.random() * sides) + 1;
    await react("✅");
    await reply(`🎲 *Dice Roll (d${sides})*\n\nYou rolled: *${result}*\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "choose",
    aliases: ["pick", "decide", "random"],
    react: "🤔",
    category: "fun",
    description: "Pick from options. Usage: .choose apple | orange | banana",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide options separated by `|`\nExample: `.choose yes | no | maybe`");
    const options = q.split("|").map((s) => s.trim()).filter(Boolean);
    if (options.length < 2) return reply("❌ Provide at least 2 options separated by `|`");
    const chosen = options[Math.floor(Math.random() * options.length)];
    await react("✅");
    await reply(
      `🤔 *Random Choice*\n\n` +
      `*Options:* ${options.map((o, i) => `\n  ${i + 1}. ${o}`).join("")}\n\n` +
      `✨ *I choose:* *${chosen}*\n\n> _${botFooter}_`
    );
  }
);

gmd(
  {
    pattern: "reverse",
    aliases: ["rev", "mirror"],
    react: "🔄",
    category: "fun",
    description: "Reverse any text. Usage: .reverse hello world",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text to reverse!\nExample: `.reverse hello`");
    const reversed = q.split("").reverse().join("");
    await react("✅");
    await reply(`🔄 *Reversed Text*\n\n\`${reversed}\`\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "mock",
    aliases: ["spongebob", "mocking"],
    react: "🧽",
    category: "fun",
    description: "SpongeBob mocking text. Usage: .mock your text here",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text to mock!\nExample: `.mock hello world`");
    const mocked = q
      .split("")
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join("");
    await react("✅");
    await reply(`🧽 *Mocking Text*\n\n\`${mocked}\`\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "upper",
    aliases: ["uppercase", "caps"],
    react: "🔠",
    category: "tools",
    description: "Convert text to UPPERCASE. Usage: .upper hello world",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text!\nExample: `.upper hello world`");
    await react("✅");
    await reply(`🔠 *Uppercase*\n\n\`${q.toUpperCase()}\`\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "lower",
    aliases: ["lowercase", "small"],
    react: "🔡",
    category: "tools",
    description: "Convert text to lowercase. Usage: .lower HELLO WORLD",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text!\nExample: `.lower HELLO WORLD`");
    await react("✅");
    await reply(`🔡 *Lowercase*\n\n\`${q.toLowerCase()}\`\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "binary",
    aliases: ["bin", "tobinary"],
    react: "💻",
    category: "tools",
    description: "Convert text to binary or binary to text. Usage: .binary hello OR .binary decode 01101000",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text!\nExample: `.binary hello` or `.binary decode 01101000`");
    try {
      if (q.toLowerCase().startsWith("decode ")) {
        const binStr = q.slice(7).trim();
        const decoded = binStr
          .split(" ")
          .map((b) => String.fromCharCode(parseInt(b, 2)))
          .join("");
        await react("✅");
        await reply(`💻 *Binary → Text*\n\nInput: \`${binStr}\`\nOutput: \`${decoded}\`\n\n> _${botFooter}_`);
      } else {
        const encoded = q
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ");
        await react("✅");
        await reply(`💻 *Text → Binary*\n\nInput: \`${q}\`\nOutput:\n\`${encoded}\`\n\n> _${botFooter}_`);
      }
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "morse",
    aliases: ["morsecode"],
    react: "📡",
    category: "tools",
    description: "Convert text to Morse code or decode. Usage: .morse hello OR .morse decode ... . .-.  .-.  ---",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text or morse code!\nExample: `.morse hello` or `.morse decode ... --- ...`");

    const MORSE = {
      A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....", I:"..",
      J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.", Q:"--.-",
      R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-", Y:"-.--",
      Z:"--..", "1":".----","2":"..---","3":"...--","4":"....-","5":".....",
      "6":"-....","7":"--...","8":"---..", "9":"----.","0":"-----",
      " ":"/", ".":".-.-.-",",":"--..--","?":"..--..","!":"-.-.--"
    };
    const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

    try {
      if (q.toLowerCase().startsWith("decode ")) {
        const codes = q.slice(7).trim();
        const decoded = codes.split(" ")
          .map(c => c === "/" ? " " : (REVERSE_MORSE[c] || "?"))
          .join("");
        await react("✅");
        await reply(`📡 *Morse → Text*\n\nInput: \`${codes}\`\nOutput: \`${decoded}\`\n\n> _${botFooter}_`);
      } else {
        const encoded = q.toUpperCase().split("")
          .map(c => MORSE[c] || "")
          .filter(Boolean)
          .join(" ");
        await react("✅");
        await reply(`📡 *Text → Morse*\n\nInput: \`${q}\`\nOutput: \`${encoded}\`\n\n> _${botFooter}_`);
      }
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "base64",
    aliases: ["b64"],
    react: "🔐",
    category: "tools",
    description: "Encode/decode Base64. Usage: .base64 encode hello OR .base64 decode aGVsbG8=",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply(
      "❌ Usage:\n• `.base64 encode your text`\n• `.base64 decode aGVsbG8=`"
    );
    try {
      const parts = q.split(" ");
      const action = parts[0].toLowerCase();
      const text = parts.slice(1).join(" ");
      if (!text) return reply("❌ Provide text after encode/decode!");
      if (action === "encode") {
        const encoded = Buffer.from(text).toString("base64");
        await react("✅");
        await reply(`🔐 *Base64 Encode*\n\nInput: \`${text}\`\nOutput: \`${encoded}\`\n\n> _${botFooter}_`);
      } else if (action === "decode") {
        const decoded = Buffer.from(text, "base64").toString("utf-8");
        await react("✅");
        await reply(`🔐 *Base64 Decode*\n\nInput: \`${text}\`\nOutput: \`${decoded}\`\n\n> _${botFooter}_`);
      } else {
        await reply("❌ Use `encode` or `decode`!\n• `.base64 encode hello`\n• `.base64 decode aGVsbG8=`");
      }
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "password",
    aliases: ["genpass", "generatepassword", "passgen"],
    react: "🔑",
    category: "tools",
    description: "Generate a secure random password. Usage: .password 16",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    const length = Math.min(Math.max(parseInt(q) || 12, 6), 64);
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    await react("✅");
    await reply(
      `🔑 *Generated Password (${length} chars)*\n\n` +
      `\`${password}\`\n\n` +
      `⚠️ _Save this password securely!_\n\n> _${botFooter}_`
    );
  }
);

gmd(
  {
    pattern: "wordcount",
    aliases: ["wc", "charcount", "countwords"],
    react: "📊",
    category: "tools",
    description: "Count words and characters in text. Usage: .wordcount your text here",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text to count!\nExample: `.wordcount hello world`");
    const words = q.trim().split(/\s+/).filter(Boolean).length;
    const chars = q.length;
    const charsNoSpace = q.replace(/\s/g, "").length;
    const sentences = q.split(/[.!?]+/).filter(Boolean).length;
    const lines = q.split("\n").length;
    await react("✅");
    await reply(
      `📊 *Word Count Analysis*\n\n` +
      `• *Words:* ${words}\n` +
      `• *Characters (with spaces):* ${chars}\n` +
      `• *Characters (no spaces):* ${charsNoSpace}\n` +
      `• *Sentences:* ${sentences}\n` +
      `• *Lines:* ${lines}\n\n` +
      `> _${botFooter}_`
    );
  }
);

gmd(
  {
    pattern: "age",
    aliases: ["myage", "calcage", "howold"],
    react: "🎂",
    category: "tools",
    description: "Calculate age from birthdate. Usage: .age 2000-06-15",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide your birthdate!\nExample: `.age 2000-06-15`");
    try {
      const birth = new Date(q);
      if (isNaN(birth.getTime())) return reply("❌ Invalid date format! Use: YYYY-MM-DD");
      const now = new Date();
      if (birth > now) return reply("❌ Birthdate cannot be in the future!");
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }
      const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
      const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
      const daysUntilBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
      await react("✅");
      await reply(
        `🎂 *Age Calculator*\n\n` +
        `• *Age:* ${years} years, ${months} months, ${days} days\n` +
        `• *Total Days Lived:* ${totalDays.toLocaleString()}\n` +
        `• *Next Birthday:* In ${daysUntilBday} day(s)\n` +
        `• *Birthdate:* ${birth.toDateString()}\n\n` +
        `> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "countdown",
    aliases: ["daysuntil", "daysto", "timeleft"],
    react: "⏳",
    category: "tools",
    description: "Count days until a date. Usage: .countdown 2025-12-31",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide a target date!\nExample: `.countdown 2025-12-31`");
    try {
      const target = new Date(q);
      if (isNaN(target.getTime())) return reply("❌ Invalid date format! Use: YYYY-MM-DD");
      const now = new Date();
      const diff = target - now;
      if (diff < 0) {
        const pastDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
        await react("✅");
        return reply(`⏳ *Countdown*\n\n📅 *${target.toDateString()}* has already passed!\nThat was *${pastDays}* days ago.\n\n> _${botFooter}_`);
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      await react("✅");
      await reply(
        `⏳ *Countdown to ${target.toDateString()}*\n\n` +
        `• *Days:* ${days}\n` +
        `• *Hours:* ${hours}\n` +
        `• *Minutes:* ${minutes}\n\n` +
        `> _${botFooter}_`
      );
    } catch (e) {
      await react("❌");
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

gmd(
  {
    pattern: "joke",
    aliases: ["jokes", "funfact", "funny"],
    react: "😂",
    category: "fun",
    description: "Get a random joke",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    try {
      const res = await axios.get("https://official-joke-api.appspot.com/random_joke", { timeout: 10000 });
      const { setup, punchline } = res.data;
      await react("✅");
      await reply(`😂 *Random Joke*\n\n${setup}\n\n||${punchline}||\n\n> _${botFooter}_`);
    } catch {
      const jokes = [
        { q: "Why don't scientists trust atoms?", a: "Because they make up everything!" },
        { q: "Why did the scarecrow win an award?", a: "Because he was outstanding in his field!" },
        { q: "What do you call a fish without eyes?", a: "A fsh!" },
        { q: "Why can't you give Elsa a balloon?", a: "Because she'll let it go!" },
        { q: "What do you call cheese that isn't yours?", a: "Nacho cheese!" },
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      await react("✅");
      await reply(`😂 *Random Joke*\n\n${joke.q}\n\n||${joke.a}||\n\n> _${botFooter}_`);
    }
  }
);

gmd(
  {
    pattern: "fact",
    aliases: ["facts", "funfacts", "randomfact"],
    react: "🧠",
    category: "fun",
    description: "Get a random interesting fact",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    try {
      const res = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en", { timeout: 10000 });
      const fact = res.data.text;
      await react("✅");
      await reply(`🧠 *Random Fact*\n\n${fact}\n\n> _${botFooter}_`);
    } catch {
      const facts = [
        "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
        "A group of flamingos is called a flamboyance.",
        "Octopuses have three hearts and blue blood.",
        "Bananas are technically berries, but strawberries are not.",
        "The Eiffel Tower can grow by about 15 cm in summer due to thermal expansion.",
        "A day on Venus is longer than a year on Venus.",
        "Sharks are older than trees. They have existed for around 400 million years.",
        "The human brain generates about 20 watts of power — enough to light a small LED bulb.",
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      await react("✅");
      await reply(`🧠 *Random Fact*\n\n${fact}\n\n> _${botFooter}_`);
    }
  }
);

gmd(
  {
    pattern: "quote",
    aliases: ["quotes", "inspire", "inspiration", "motivate"],
    react: "✨",
    category: "fun",
    description: "Get a random inspirational quote",
  },
  async (from, Gifted, conText) => {
    const { reply, react, botFooter } = conText;
    try {
      const res = await axios.get("https://zenquotes.io/api/random", { timeout: 10000 });
      const { q, a } = res.data[0];
      await react("✅");
      await reply(`✨ *Daily Quote*\n\n_"${q}"_\n\n— *${a}*\n\n> _${botFooter}_`);
    } catch {
      const quotes = [
        { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
        { q: "In the middle of every difficulty lies opportunity.", a: "Albert Einstein" },
        { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
        { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
        { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
        { q: "Success is not final, failure is not fatal: It is the courage to continue that counts.", a: "Winston Churchill" },
      ];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      await react("✅");
      await reply(`✨ *Daily Quote*\n\n_"${quote.q}"_\n\n— *${quote.a}*\n\n> _${botFooter}_`);
    }
  }
);

gmd(
  {
    pattern: "repeat",
    aliases: ["rep", "echo"],
    react: "🔁",
    category: "fun",
    description: "Repeat text N times. Usage: .repeat 3 hello world",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Usage: `.repeat 3 hello world`");
    const parts = q.split(" ");
    const times = parseInt(parts[0]);
    if (isNaN(times) || times < 1 || times > 20)
      return reply("❌ First argument must be a number between 1 and 20!");
    const text = parts.slice(1).join(" ");
    if (!text) return reply("❌ Provide text after the number!");
    await react("✅");
    await reply(`🔁 *Repeated x${times}*\n\n${Array(times).fill(text).join("\n")}\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "number",
    aliases: ["numinfo", "numberinfo", "numberology"],
    react: "🔢",
    category: "fun",
    description: "Get fun facts about a number. Usage: .number 42",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q || isNaN(q)) return reply("❌ Provide a valid number!\nExample: `.number 42`");
    const num = parseInt(q);
    try {
      const res = await axios.get(`http://numbersapi.com/${num}/trivia`, { timeout: 8000 });
      const mathRes = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 8000 });
      await react("✅");
      await reply(
        `🔢 *Number Facts: ${num}*\n\n` +
        `📌 *Trivia:* ${res.data}\n\n` +
        `➗ *Math:* ${mathRes.data}\n\n` +
        `• *Even/Odd:* ${num % 2 === 0 ? "Even" : "Odd"}\n` +
        `• *Prime:* ${isPrime(num) ? "Yes" : "No"}\n` +
        `• *Square Root:* ${Math.sqrt(num).toFixed(4)}\n\n` +
        `> _${botFooter}_`
      );
    } catch {
      await react("✅");
      await reply(
        `🔢 *Number: ${num}*\n\n` +
        `• *Even/Odd:* ${num % 2 === 0 ? "Even" : "Odd"}\n` +
        `• *Prime:* ${isPrime(num) ? "Yes" : "No"}\n` +
        `• *Square Root:* ${Math.sqrt(num).toFixed(4)}\n` +
        `• *Square:* ${num * num}\n` +
        `• *Cube:* ${num * num * num}\n\n` +
        `> _${botFooter}_`
      );
    }
  }
);

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

gmd(
  {
    pattern: "acronym",
    aliases: ["makeacronym", "abbrv"],
    react: "📝",
    category: "fun",
    description: "Create an acronym from text. Usage: .acronym As Soon As Possible",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide words!\nExample: `.acronym As Soon As Possible`");
    const acronym = q.split(/\s+/).map(w => w[0]?.toUpperCase() || "").join("");
    await react("✅");
    await reply(`📝 *Acronym*\n\n*Input:* ${q}\n*Acronym:* \`${acronym}\`\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "currency",
    aliases: ["convert", "exchange", "forex"],
    react: "💱",
    category: "tools",
    description: "Convert currency. Usage: .currency 100 USD KES",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Usage: `.currency 100 USD KES`\nExample: `.currency 50 EUR USD`");
    const parts = q.split(/\s+/);
    if (parts.length < 3) return reply("❌ Usage: `.currency amount FROM TO`\nExample: `.currency 100 USD KES`");
    const [amount, from_currency, to_currency] = [parseFloat(parts[0]), parts[1].toUpperCase(), parts[2].toUpperCase()];
    if (isNaN(amount)) return reply("❌ Invalid amount!");
    try {
      const res = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${from_currency}`,
        { timeout: 10000 }
      );
      const rate = res.data.rates[to_currency];
      if (!rate) return reply(`❌ Currency *${to_currency}* not found!`);
      const converted = (amount * rate).toFixed(2);
      await react("✅");
      await reply(
        `💱 *Currency Conversion*\n\n` +
        `• *Amount:* ${amount} ${from_currency}\n` +
        `• *Result:* ${converted} ${to_currency}\n` +
        `• *Rate:* 1 ${from_currency} = ${rate} ${to_currency}\n\n` +
        `> _${botFooter}_`
      );
    } catch {
      await react("❌");
      await reply(`❌ Failed to fetch exchange rates. Check currency codes and try again.`);
    }
  }
);

gmd(
  {
    pattern: "emojify",
    aliases: ["emoji", "addemoji"],
    react: "🎭",
    category: "fun",
    description: "Add random emojis to your text. Usage: .emojify hello world",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide text!\nExample: `.emojify hello world`");
    const emojis = ["😂","🔥","💯","✨","🎉","💪","🌟","😎","🚀","💫","🎯","🌈","❤️","🙌","👑","🎊","⚡","🌙","💥","🦁"];
    const emojified = q.split(" ").map(word => `${word} ${emojis[Math.floor(Math.random() * emojis.length)]}`).join(" ");
    await react("✅");
    await reply(`🎭 *Emojified*\n\n${emojified}\n\n> _${botFooter}_`);
  }
);

gmd(
  {
    pattern: "color",
    aliases: ["colorinfo", "hex", "hexcolor"],
    react: "🎨",
    category: "tools",
    description: "Get info about a hex color. Usage: .color #ff5733 or .color ff5733",
  },
  async (from, Gifted, conText) => {
    const { reply, react, q, botFooter } = conText;
    if (!q) return reply("❌ Provide a hex color!\nExample: `.color #ff5733`");
    const hex = q.replace(/^#/, "").toLowerCase();
    if (!/^[0-9a-f]{6}$/i.test(hex)) return reply("❌ Invalid hex color! Use 6-character hex like `#ff5733`");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const brightness = luminance > 0.5 ? "Light" : "Dark";
    const h = Math.round(Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI);
    const hue = h < 0 ? h + 360 : h;
    await react("✅");
    await reply(
      `🎨 *Color Info: #${hex.toUpperCase()}*\n\n` +
      `• *HEX:* #${hex.toUpperCase()}\n` +
      `• *RGB:* rgb(${r}, ${g}, ${b})\n` +
      `• *Red:* ${r}\n` +
      `• *Green:* ${g}\n` +
      `• *Blue:* ${b}\n` +
      `• *Brightness:* ${brightness}\n` +
      `• *Hue:* ${hue}°\n\n` +
      `> _${botFooter}_`
    );
  }
);

// ─── SHIP ─────────────────────────────────────────────────────────────────────

gmd({
  pattern: "ship",
  aliases: ["lovemeter", "match", "compatibility"],
  react: "💘",
  category: "fun",
  description: "Check love compatibility between two names. Usage: .ship Name1 | Name2",
}, async (from, Gifted, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q || !q.includes("|")) return reply("❌ Usage: `.ship Name1 | Name2`\nExample: `.ship Romeo | Juliet`");
  const [n1, n2] = q.split("|").map(s => s.trim());
  if (!n1 || !n2) return reply("❌ Both names are required.");
  const combined = (n1 + n2).toLowerCase().split("").sort().join("");
  let pct = 0;
  for (let i = 0; i < combined.length; i++) pct += combined.charCodeAt(i);
  pct = (pct % 71) + 30;
  const bar = Math.round(pct / 10);
  const filled = "❤️".repeat(bar);
  const empty  = "🤍".repeat(10 - bar);
  const verdict = pct >= 85 ? "💞 *SOULMATES!*" : pct >= 70 ? "💕 *Great Match!*" : pct >= 50 ? "💛 *It Could Work*" : "💔 *Not Really*";
  await react("💘");
  await Gifted.sendMessage(from, {
    text: `💘 *SHIP METER*\n\n👤 *${n1}*\n💕 meets 💕\n👤 *${n2}*\n\n${filled}${empty}\n\n❤️ *Compatibility: ${pct}%*\n${verdict}\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── TRUTH ────────────────────────────────────────────────────────────────────

gmd({
  pattern: "truth",
  aliases: ["truthq", "truthquestion"],
  react: "🎯",
  category: "fun",
  description: "Get a random truth question for truth or dare",
}, async (from, Gifted, conText) => {
  const { react, mek, botFooter } = conText;
  const pool = [
    "What's the most embarrassing thing you've done in public?",
    "Have you ever lied to your best friend about something important?",
    "What's the last thing you deleted from your phone before handing it to someone?",
    "Who in this chat do you have a secret crush on?",
    "What's the worst thing you've ever done and never told anyone?",
    "Have you ever cheated in an exam? Be specific.",
    "What's a habit you have that you're ashamed of?",
    "What's the pettiest reason you've ever blocked someone?",
    "What's the most childish thing you still do when no one is watching?",
    "Have you ever stolen something, even if small?",
    "What's your biggest insecurity?",
    "What's the most embarrassing text you've sent to the wrong person?",
    "Who was your first love and what happened?",
    "What's a lie you've told that you still haven't corrected?",
    "What's the strangest thing you've Googled this month?",
    "Have you ever pretended to be sick to avoid someone?",
    "Who in your contacts would you never want to see your screen time?",
  ];
  const q = pool[Math.floor(Math.random() * pool.length)];
  await react("🎯");
  await Gifted.sendMessage(from, {
    text: `🎯 *TRUTH QUESTION*\n\n❓ _${q}_\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── DARE ─────────────────────────────────────────────────────────────────────

gmd({
  pattern: "dare",
  aliases: ["dareq", "darechallenge"],
  react: "🔥",
  category: "fun",
  description: "Get a random dare challenge",
}, async (from, Gifted, conText) => {
  const { react, mek, botFooter } = conText;
  const pool = [
    "Send a voice note singing the chorus of your favourite song right now.",
    "Change your WhatsApp status to 'I talk to myself daily' for 30 minutes.",
    "Tag someone and tell them they are your hero — no explanation.",
    "Send a message to the last person you texted using only food emojis.",
    "Post a selfie with the funniest face you can make in this group.",
    "Call someone from this group and say 'I know what you did last summer' then hang up.",
    "Write a 3-sentence love letter to someone in this chat (you pick who).",
    "Send a voice note of you imitating your favourite celebrity for at least 15 seconds.",
    "Reply to the last 5 messages in this chat with only one emoji each.",
    "Set your profile picture to a potato for 1 hour.",
    "Send a text to your mum saying 'I have a confession' and screenshot the reply.",
    "Let the group rename your WhatsApp name for the next 10 minutes.",
    "Do 15 push-ups and send a voice note counting them out loud.",
    "Record a voice note of you reciting the alphabet backwards.",
    "Type a paragraph using only your nose and send it.",
    "Send a voice note saying 'I love Mondays' as convincingly as possible.",
    "Put your phone down for the next 5 minutes — no cheating.",
  ];
  const d = pool[Math.floor(Math.random() * pool.length)];
  await react("🔥");
  await Gifted.sendMessage(from, {
    text: `🔥 *DARE CHALLENGE*\n\n💪 _${d}_\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── RIZZ ─────────────────────────────────────────────────────────────────────

gmd({
  pattern: "rizz",
  aliases: ["pickup", "flirt", "pickupline"],
  react: "😏",
  category: "fun",
  description: "Generate a pickup line. Usage: .rizz or .rizz @name",
}, async (from, Gifted, conText) => {
  const { react, q, mek, mentioned, botFooter } = conText;
  const lines = [
    "Are you a magician? Whenever I look at you, everyone else disappears.",
    "Is your name Wi-Fi? Because I'm feeling a serious connection.",
    "Are you a bank loan? Because you've got my full interest.",
    "Do you believe in love at first text, or should I message again?",
    "Are you a charger? Because I literally die without you.",
    "Are you a keyboard? Because you're exactly my type.",
    "Is your name Google? Because you have everything I've been searching for.",
    "Are you a time traveller? I see you in every version of my future.",
    "Do you have a map? I keep getting lost in your eyes.",
    "If you were a vegetable you'd be a *cute*-cumber.",
    "I must be a snowflake because I've fallen for you.",
    "Are you Australian? Because you meet all of my koala-fications.",
    "Do you like science? Because we have great chemistry.",
    "You must be a star — I can't stop staring at you from a distance.",
  ];
  const line = lines[Math.floor(Math.random() * lines.length)];
  const target = mentioned?.[0] ? `@${mentioned[0].split("@")[0]}` : (q?.trim() || null);
  const mentions = mentioned?.[0] ? [mentioned[0]] : [];
  const header = target ? `😏 *Rizz for ${target}*` : `😏 *Pickup Line*`;
  await react("😏");
  await Gifted.sendMessage(from, {
    text: `${header}\n\n"${line}"\n\n> _${botFooter}_`,
    mentions,
  }, { quoted: mek });
});

// ─── ROAST ────────────────────────────────────────────────────────────────────

gmd({
  pattern: "roast",
  aliases: ["clap", "diss", "burn"],
  react: "🔥",
  category: "fun",
  description: "Roast someone. Usage: .roast @user or .roast name",
}, async (from, Gifted, conText) => {
  const { react, q, mek, mentioned, pushName, botFooter } = conText;
  const roasts = [
    "Your Wi-Fi password is probably the only secret you can keep.",
    "You bring everyone so much joy — especially when you leave.",
    "I'd agree with you but then we'd both be wrong.",
    "You're not completely useless — you can always serve as a bad example.",
    "You're the reason shampoo has instructions on the bottle.",
    "Even Google can't find a good reason to take you seriously.",
    "I've seen better comebacks in a broken mirror.",
    "You're proof that evolution can occasionally go in reverse.",
    "Your village called — they still want their idiot back.",
    "I'd call you a clown, but clowns are actually funny.",
    "If brains were petrol, you wouldn't have enough to power an ant's scooter.",
    "You have your whole life to be an idiot — why not take today off?",
    "I'd roast you harder but my mum said I'm not allowed to burn trash.",
    "You're like a cloud — when you disappear, it's a beautiful day.",
    "Calling you an idiot would be an insult to all the idiots out there.",
    "I've met parking tickets with more charm than you.",
    "You're the human equivalent of a participation trophy.",
  ];
  const roast = roasts[Math.floor(Math.random() * roasts.length)];
  const target = mentioned?.[0] ? `@${mentioned[0].split("@")[0]}` : (q?.trim() || pushName);
  const mentions = mentioned?.[0] ? [mentioned[0]] : [];
  await react("🔥");
  await Gifted.sendMessage(from, {
    text: `🔥 *Roasting ${target}*\n\n"${roast}"\n\n💀 _Don't take it personally_ 😂\n\n> _${botFooter}_`,
    mentions,
  }, { quoted: mek });
});

// ─── COMPLIMENT ───────────────────────────────────────────────────────────────

gmd({
  pattern: "compliment",
  aliases: ["praise", "admire", "appreciate"],
  react: "💐",
  category: "fun",
  description: "Send a sweet compliment. Usage: .compliment @user",
}, async (from, Gifted, conText) => {
  const { react, q, mek, mentioned, pushName, botFooter } = conText;
  const compliments = [
    "You light up every room you walk into. 🌟",
    "You have an incredible ability to make everyone feel genuinely seen. 💫",
    "Your positivity is contagious in the best possible way. ☀️",
    "You are far more extraordinary than you give yourself credit for. ✨",
    "Everything you do carries a quiet touch of brilliance. 🧠",
    "Your kindness makes the world measurably better. 💛",
    "You inspire people around you without even trying. 🎯",
    "The way you handle things is genuinely impressive. 💪",
    "You have a heart of pure gold and it shows. 👑",
    "The world is legitimately better because you're in it. 🌎",
    "Your smile could fix a bad day for anyone who sees it. 😊",
    "You have an energy that draws people to you naturally. ⚡",
    "Your strength — seen and unseen — is remarkable. 🏆",
    "You make difficult things look effortless, and that's a gift. 🎁",
  ];
  const line = compliments[Math.floor(Math.random() * compliments.length)];
  const target = mentioned?.[0] ? `@${mentioned[0].split("@")[0]}` : (q?.trim() || "you");
  const mentions = mentioned?.[0] ? [mentioned[0]] : [];
  await react("💐");
  await Gifted.sendMessage(from, {
    text: `💐 *Compliment for ${target}*\n\n${line}\n\n_Sent with love by ${pushName}_ 💌\n\n> _${botFooter}_`,
    mentions,
  }, { quoted: mek });
});

// ─── CONFESSION ───────────────────────────────────────────────────────────────

gmd({
  pattern: "confession",
  aliases: ["confess", "anonymous", "anon"],
  react: "🤫",
  category: "fun",
  description: "Post an anonymous confession to the group. Usage: .confession <text>",
}, async (from, Gifted, conText) => {
  const { reply, react, q, isGroup, mek, botName, botFooter } = conText;
  if (!isGroup) return reply("❌ This command only works inside groups.");
  if (!q) return reply("❌ Provide your confession!\nExample: `.confession I still sleep with the lights on`");
  await react("🤫");
  await reply("✅ Your confession has been posted anonymously.");
  await Gifted.sendMessage(from, {
    text: `🤫 *ANONYMOUS CONFESSION*\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n"${q.trim()}"\n\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n> _Identity protected by ${botName}_`,
  });
});

// ─── ZODIAC ───────────────────────────────────────────────────────────────────

gmd({
  pattern: "zodiac",
  aliases: ["horoscope", "starsign", "star"],
  react: "⭐",
  category: "fun",
  description: "Get your zodiac sign info. Usage: .zodiac leo",
}, async (from, Gifted, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q) return reply("❌ Provide your star sign!\n\nSigns: Aries Taurus Gemini Cancer Leo Virgo Libra Scorpio Sagittarius Capricorn Aquarius Pisces\n\nExample: `.zodiac leo`");
  const signs = {
    aries:       { e:"♈", d:"Mar 21 – Apr 19", el:"🔥 Fire", p:"Mars",    t:"Courageous, energetic, impulsive, pioneering",    l:"Red · Tuesday · 9" },
    taurus:      { e:"♉", d:"Apr 20 – May 20", el:"🌍 Earth",p:"Venus",   t:"Reliable, patient, stubborn, sensual",             l:"Green · Friday · 6" },
    gemini:      { e:"♊", d:"May 21 – Jun 20", el:"💨 Air",  p:"Mercury", t:"Curious, adaptable, witty, indecisive",            l:"Yellow · Wednesday · 5" },
    cancer:      { e:"♋", d:"Jun 21 – Jul 22", el:"💧 Water",p:"Moon",    t:"Nurturing, intuitive, loyal, moody",               l:"Silver · Monday · 2" },
    leo:         { e:"♌", d:"Jul 23 – Aug 22", el:"🔥 Fire", p:"Sun",     t:"Confident, generous, dramatic, warm-hearted",      l:"Gold · Sunday · 1" },
    virgo:       { e:"♍", d:"Aug 23 – Sep 22", el:"🌍 Earth",p:"Mercury", t:"Analytical, helpful, meticulous, caring",          l:"Navy · Wednesday · 5" },
    libra:       { e:"♎", d:"Sep 23 – Oct 22", el:"💨 Air",  p:"Venus",   t:"Diplomatic, charming, fair, indecisive",           l:"Pink · Friday · 6" },
    scorpio:     { e:"♏", d:"Oct 23 – Nov 21", el:"💧 Water",p:"Pluto",   t:"Intense, passionate, secretive, determined",       l:"Crimson · Tuesday · 8" },
    sagittarius: { e:"♐", d:"Nov 22 – Dec 21", el:"🔥 Fire", p:"Jupiter", t:"Adventurous, optimistic, blunt, free-spirited",    l:"Purple · Thursday · 3" },
    capricorn:   { e:"♑", d:"Dec 22 – Jan 19", el:"🌍 Earth",p:"Saturn",  t:"Disciplined, ambitious, reserved, practical",      l:"Brown · Saturday · 10" },
    aquarius:    { e:"♒", d:"Jan 20 – Feb 18", el:"💨 Air",  p:"Uranus",  t:"Independent, innovative, eccentric, humanitarian", l:"Sky blue · Saturday · 11" },
    pisces:      { e:"♓", d:"Feb 19 – Mar 20", el:"💧 Water",p:"Neptune", t:"Compassionate, artistic, dreamy, empathetic",      l:"Sea green · Thursday · 7" },
  };
  const key = q.trim().toLowerCase();
  const sign = signs[key];
  if (!sign) return reply("❌ Unknown sign. Use: aries taurus gemini cancer leo virgo libra scorpio sagittarius capricorn aquarius pisces");
  const name = key.charAt(0).toUpperCase() + key.slice(1);
  await react("⭐");
  await Gifted.sendMessage(from, {
    text: `${sign.e} *${name}*\n\n📅 *Dates:* ${sign.d}\n🌊 *Element:* ${sign.el}\n🪐 *Ruling Planet:* ${sign.p}\n\n✨ *Traits:*\n${sign.t}\n\n🍀 *Lucky (Color · Day · Number):*\n${sign.l}\n\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── FAKEID ───────────────────────────────────────────────────────────────────

gmd({
  pattern: "fakeid",
  aliases: ["fakeprofile", "randomperson", "fakeidentity"],
  react: "🪪",
  category: "fun",
  description: "Generate a random fake identity for fun",
}, async (from, Gifted, conText) => {
  const { react, mek, botFooter } = conText;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const first  = ["James","Emma","Oliver","Sophia","Lucas","Ava","Noah","Mia","Liam","Isabella","Ethan","Charlotte","Aiden","Amelia","Mason","Zara","Caleb","Layla","Jayden","Nadia"];
  const last   = ["Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Taylor","Anderson","Thomas","White","Martin","Lee","Thompson","Osei","Nkosi","Kamau","Diallo","Mensah"];
  const jobs   = ["Software Engineer","Chef","Doctor","Pilot","Graphic Designer","Nurse","Teacher","Lawyer","Architect","Journalist","Mechanic","Entrepreneur","Photographer","Accountant","Data Scientist"];
  const cities = ["New York","London","Nairobi","Paris","Tokyo","Sydney","Dubai","Toronto","Lagos","Berlin","Cape Town","Mumbai","Singapore","Accra","Cairo","Kampala","Casablanca"];
  const hobbies = ["Reading","Gaming","Cooking","Hiking","Photography","Music Production","Painting","Swimming","Cycling","Content Creation","Travelling","Dancing","Coding","Gardening","Podcasting"];
  const bloods  = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
  const name   = `${pick(first)} ${pick(last)}`;
  const age    = Math.floor(Math.random() * 38) + 18;
  const gender = Math.random() < 0.5 ? "Male 👨" : "Female 👩";
  const id     = Math.floor(Math.random() * 90000000 + 10000000);
  const phone  = `+${Math.floor(Math.random() * 9) + 1}${Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("")}`;
  const height = `${Math.floor(Math.random() * 40) + 155} cm`;
  await react("🪪");
  await Gifted.sendMessage(from, {
    text: `🪪 *FAKE IDENTITY*\n_For entertainment only_\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n👤 *Name:*    ${name}\n🎂 *Age:*     ${age} years\n🚻 *Gender:*  ${gender}\n💼 *Job:*     ${pick(jobs)}\n🌍 *City:*    ${pick(cities)}\n🎯 *Hobby:*   ${pick(hobbies)}\n🩸 *Blood:*   ${pick(bloods)}\n📏 *Height:*  ${height}\n📱 *Phone:*   ${phone}\n🪪 *ID:*      #${id}\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n> _${botFooter}_`,
  }, { quoted: mek });
});

// ─── FAKECHAT ─────────────────────────────────────────────────────────────────

gmd({
  pattern: "fakechat",
  aliases: ["fakemsg", "fakedm", "fakemessage"],
  react: "💬",
  category: "fun",
  description: "Generate a fake WhatsApp-style chat bubble. Usage: .fakechat Name | Message",
}, async (from, Gifted, conText) => {
  const { reply, react, q, mek, botFooter } = conText;
  if (!q || !q.includes("|")) return reply("❌ Usage: `.fakechat Name | Message`\nExample: `.fakechat Elon Musk | I'm buying WhatsApp next`");
  const [rawName, ...msgParts] = q.split("|");
  const name = rawName.trim();
  const msg  = msgParts.join("|").trim();
  if (!name || !msg) return reply("❌ Both name and message are required.");
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const wrap = (str, maxLen) => {
    const words = str.split(" "), lines = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > maxLen) { lines.push(cur.trim()); cur = w; }
      else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const msgLines = wrap(msg, 28);
  const width    = Math.max(name.length + 2, ...msgLines.map(l => l.length), 20);
  const border   = "─".repeat(width + 2);
  const pad      = str => str + " ".repeat(width - str.length);
  const body     = msgLines.map(l => `│ ${pad(l)} │`).join("\n");
  const ts       = `${" ".repeat(width - time.length - 3)}${time} ✓✓`;
  await react("💬");
  await Gifted.sendMessage(from, {
    text: `┌${border}┐\n│ 💬 *${pad(name)}* │\n├${border}┤\n${body}\n│ ${ts} │\n└${border}┘\n\n> _${botFooter}_`,
  }, { quoted: mek });
});
