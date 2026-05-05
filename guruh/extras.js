
const { gmd } = require("../guru");
const { getSetting } = require("../guru/database/settings");
const axios = require("axios");

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
