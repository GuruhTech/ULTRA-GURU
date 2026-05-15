
const { gmd } = require("../guru");

const MORSE = {
  A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....",
  I:"..", J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.",
  Q:"--.-", R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-",
  Y:"-.--", Z:"--..", "1":".----", "2":"..---", "3":"...--", "4":"....-",
  "5":".....", "6":"-....", "7":"--...", "8":"---..", "9":"----.", "0":"-----",
  ".":".-.-.-", ",":"--..--", "?":"..--..", "!":"-.-.--", " ": " / ",
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

const ROMAN_VALS = [
  [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
  [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]
];

function toRoman(n) {
  let r = "";
  for (const [val, sym] of ROMAN_VALS) { while (n >= val) { r += sym; n -= val; } }
  return r;
}

function fromRoman(s) {
  const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]], next = map[s[i+1]];
    result += (next && cur < next) ? -cur : cur;
  }
  return result;
}

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false;
  return true;
}

function factorial(n) {
  if (n > 20) return "Too large (max 20)";
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r.toString();
}

gmd({
  pattern: "morse",
  aliases: ["texttomorse", "encode morse"],
  react: "📡",
  category: "tools",
  description: "Convert text to Morse code. Usage: .morse Hello",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}morse <text>`);
  const encoded = q.toUpperCase().split("").map(c => MORSE[c] || c).join(" ");
  await react("✅");
  await reply(`📡 *Morse Code*\n\n📝 Input: ${q}\n\n⚡ Output:\n\`\`\`${encoded}\`\`\`\n\n> _${botFooter}_`);
});

gmd({
  pattern: "unmorse",
  aliases: ["morsetotext", "decodemorse"],
  react: "📡",
  category: "tools",
  description: "Convert Morse code to text. Usage: .unmorse .... . .-.. .-.. ---",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}unmorse <morse code>`);
  const decoded = q.split(" / ").map(word =>
    word.split(" ").map(sym => MORSE_REV[sym] || sym).join("")
  ).join(" ");
  await react("✅");
  await reply(`📡 *Morse Decoder*\n\n⚡ Input: ${q.slice(0,80)}\n\n📝 Output:\n${decoded}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "caesar",
  aliases: ["caesarcipher", "shiftcipher"],
  react: "🔐",
  category: "tools",
  description: "Caesar cipher encode. Usage: .caesar <shift> <text>",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}caesar <shift> <text>\nExample: ${botPrefix}caesar 3 hello`);
  const parts = q.split(" ");
  const shift = parseInt(parts[0]);
  if (isNaN(shift)) return reply("❌ First argument must be a number (shift amount)");
  const text = parts.slice(1).join(" ");
  if (!text) return reply("❌ Provide text to encode after the shift number");
  const encoded = text.replace(/[a-z]/gi, c => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift % 26 + 26) % 26) + base);
  });
  await react("✅");
  await reply(`🔐 *Caesar Cipher*\n\n📝 Input: ${text}\n🔢 Shift: ${shift}\n\n✨ Encoded:\n${encoded}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "rot13",
  aliases: ["rot", "rot13encode"],
  react: "🔄",
  category: "tools",
  description: "ROT13 encode/decode text. Usage: .rot13 hello",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}rot13 <text>`);
  const result = q.replace(/[a-z]/gi, c => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
  await react("✅");
  await reply(`🔄 *ROT13*\n\n📝 Input: ${q}\n\n✨ Output:\n${result}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "reversetext",
  aliases: ["revtext", "fliptext", "textreverse"],
  react: "🔃",
  category: "tools",
  description: "Reverse a text string. Usage: .reversetext Hello World",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}reversetext <text>`);
  const rev = q.split("").reverse().join("");
  await react("✅");
  await reply(`🔃 *Reversed Text*\n\n📝 Input: ${q}\n\n✨ Output:\n${rev}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "lowercase",
  aliases: ["tolower", "locase", "smallcase"],
  react: "🔡",
  category: "tools",
  description: "Convert text to lowercase. Usage: .lowercase HELLO",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}lowercase <text>`);
  await react("✅");
  await reply(`🔡 *Lowercase*\n\n${q.toLowerCase()}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "titlecase",
  aliases: ["totitle", "titletext", "propercase"],
  react: "🔤",
  category: "tools",
  description: "Convert text to Title Case. Usage: .titlecase hello world",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}titlecase <text>`);
  const titled = q.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  await react("✅");
  await reply(`🔤 *Title Case*\n\n${titled}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "camelcase",
  aliases: ["tocamel", "camel"],
  react: "🐪",
  category: "tools",
  description: "Convert text to camelCase. Usage: .camelcase hello world",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}camelcase <text>`);
  const result = q.toLowerCase().replace(/\s+(\w)/g, (_, c) => c.toUpperCase());
  await react("✅");
  await reply(`🐪 *camelCase*\n\n${result}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "snakecase",
  aliases: ["tosnake", "snake"],
  react: "🐍",
  category: "tools",
  description: "Convert text to snake_case. Usage: .snakecase hello world",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}snakecase <text>`);
  const result = q.trim().toLowerCase().replace(/\s+/g, "_");
  await react("✅");
  await reply(`🐍 *snake_case*\n\n${result}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "palindrome",
  aliases: ["ispalindrome", "checkpalindrome"],
  react: "🔁",
  category: "tools",
  description: "Check if a word/phrase is a palindrome. Usage: .palindrome racecar",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}palindrome <text>`);
  const clean = q.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isP = clean === clean.split("").reverse().join("");
  await react("✅");
  await reply(`🔁 *Palindrome Check*\n\n📝 Text: ${q}\n\n${isP ? "✅ *Yes, it IS a palindrome!*" : "❌ *No, it is NOT a palindrome.*"}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "charcount",
  aliases: ["countchar", "textlen", "charlen"],
  react: "📊",
  category: "tools",
  description: "Count characters, words and lines in text. Usage: .charcount <text>",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}charcount <text>`);
  const chars = q.length;
  const noSpaces = q.replace(/\s/g, "").length;
  const words = q.trim().split(/\s+/).length;
  const lines = q.split("\n").length;
  await react("✅");
  await reply(`📊 *Text Analysis*\n\n📝 Text: ${q.slice(0,50)}${q.length>50?"...":""}\n\n◈ Characters (total)  ›  ${chars}\n◈ Characters (no spaces)  ›  ${noSpaces}\n◈ Words  ›  ${words}\n◈ Lines  ›  ${lines}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "vowelcount",
  aliases: ["countvowels", "vowels"],
  react: "🔤",
  category: "tools",
  description: "Count vowels and consonants in text. Usage: .vowelcount Hello World",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}vowelcount <text>`);
  const vowels = (q.match(/[aeiouAEIOU]/g) || []).length;
  const consonants = (q.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
  await react("✅");
  await reply(`🔤 *Vowel Count*\n\n📝 Text: ${q}\n\n◈ Vowels  ›  ${vowels}\n◈ Consonants  ›  ${consonants}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "longestword",
  aliases: ["findlongest", "biggestword"],
  react: "📏",
  category: "tools",
  description: "Find the longest word in a sentence. Usage: .longestword <sentence>",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}longestword <sentence>`);
  const words = q.split(/\s+/).filter(Boolean);
  const longest = words.reduce((a, b) => a.length >= b.length ? a : b, "");
  await react("✅");
  await reply(`📏 *Longest Word*\n\n📝 Sentence: ${q}\n\n✨ Longest: *${longest}* (${longest.length} chars)\n\n> _${botFooter}_`);
});

gmd({
  pattern: "shuffletext",
  aliases: ["shufflewords", "mixtext"],
  react: "🔀",
  category: "tools",
  description: "Shuffle the words in a sentence. Usage: .shuffletext hello world today",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}shuffletext <sentence>`);
  const words = q.split(/\s+/);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  await react("✅");
  await reply(`🔀 *Shuffled Text*\n\n📝 Original: ${q}\n\n✨ Shuffled: ${words.join(" ")}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "repeattext",
  aliases: ["repeat", "looptext"],
  react: "🔁",
  category: "tools",
  description: "Repeat a text N times. Usage: .repeattext 3 Hello",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}repeattext <times> <text>\nExample: ${botPrefix}repeattext 3 Hello`);
  const parts = q.split(" ");
  const times = Math.min(parseInt(parts[0]) || 1, 20);
  const text = parts.slice(1).join(" ");
  if (!text) return reply("❌ Provide text to repeat after the number");
  await react("✅");
  await reply(`🔁 *Repeated Text* (×${times})\n\n${Array(times).fill(text).join("\n")}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "isprime",
  aliases: ["primecheck", "checkprime"],
  react: "🔢",
  category: "tools",
  description: "Check if a number is prime. Usage: .isprime 17",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  const n = parseInt(q);
  if (!q || isNaN(n)) return reply(`Usage: ${botPrefix}isprime <number>`);
  const result = isPrime(n);
  await react("✅");
  await reply(`🔢 *Prime Check*\n\nNumber: *${n}*\n\n${result ? "✅ *Yes, it IS a prime number!*" : "❌ *No, it is NOT a prime number.*"}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "fibonacci",
  aliases: ["fib", "fibseq"],
  react: "🌀",
  category: "tools",
  description: "Get Fibonacci sequence up to N terms. Usage: .fibonacci 10",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  const n = Math.min(parseInt(q) || 10, 30);
  if (isNaN(n) || n < 1) return reply(`Usage: ${botPrefix}fibonacci <terms> (max 30)`);
  const seq = [0, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  await react("✅");
  await reply(`🌀 *Fibonacci Sequence* (${n} terms)\n\n${seq.slice(0,n).join(", ")}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "factorial",
  aliases: ["fact", "factcalc"],
  react: "🔢",
  category: "tools",
  description: "Calculate factorial of a number. Usage: .factorial 10",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  const n = parseInt(q);
  if (!q || isNaN(n) || n < 0) return reply(`Usage: ${botPrefix}factorial <number> (0–20)`);
  const result = factorial(n);
  await react("✅");
  await reply(`🔢 *Factorial*\n\n${n}! = *${result}*\n\n> _${botFooter}_`);
});

gmd({
  pattern: "roman",
  aliases: ["toroman", "toromannum"],
  react: "🏛️",
  category: "tools",
  description: "Convert number to Roman numerals. Usage: .roman 2026",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  const n = parseInt(q);
  if (!q || isNaN(n) || n < 1 || n > 3999) return reply(`Usage: ${botPrefix}roman <number> (1–3999)`);
  await react("✅");
  await reply(`🏛️ *Roman Numerals*\n\n${n} → *${toRoman(n)}*\n\n> _${botFooter}_`);
});

gmd({
  pattern: "unroman",
  aliases: ["fromroman", "decoderoman"],
  react: "🏛️",
  category: "tools",
  description: "Convert Roman numerals to number. Usage: .unroman MMXXVI",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}unroman <roman>`);
  const result = fromRoman(q.toUpperCase());
  await react("✅");
  await reply(`🏛️ *Roman to Number*\n\n${q.toUpperCase()} → *${result}*\n\n> _${botFooter}_`);
});

gmd({
  pattern: "bmi",
  aliases: ["calcbmi", "bmicalc"],
  react: "⚖️",
  category: "tools",
  description: "Calculate BMI. Usage: .bmi <weight kg> <height cm>",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}bmi <weight kg> <height cm>\nExample: ${botPrefix}bmi 70 175`);
  const [wStr, hStr] = q.split(/\s+/);
  const w = parseFloat(wStr), h = parseFloat(hStr);
  if (isNaN(w) || isNaN(h) || h <= 0) return reply("❌ Invalid input. Usage: .bmi 70 175");
  const bmi = (w / ((h/100) ** 2)).toFixed(1);
  const cat = bmi < 18.5 ? "🔵 Underweight" : bmi < 25 ? "🟢 Normal weight" : bmi < 30 ? "🟡 Overweight" : "🔴 Obese";
  await react("✅");
  await reply(`⚖️ *BMI Calculator*\n\n◈ Weight  ›  ${w} kg\n◈ Height  ›  ${h} cm\n◈ BMI  ›  *${bmi}*\n◈ Category  ›  ${cat}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "temperature",
  aliases: ["tempconv", "converttemp"],
  react: "🌡️",
  category: "tools",
  description: "Convert temperature. Usage: .temperature 100 c (c/f/k)",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}temperature <value> <unit>\nUnits: c (Celsius), f (Fahrenheit), k (Kelvin)\nExample: ${botPrefix}temperature 100 c`);
  const parts = q.split(/\s+/);
  const val = parseFloat(parts[0]);
  const unit = (parts[1] || "c").toLowerCase();
  if (isNaN(val)) return reply("❌ Invalid number");
  let c, f, k;
  if (unit === "c") { c=val; f=c*9/5+32; k=c+273.15; }
  else if (unit === "f") { f=val; c=(f-32)*5/9; k=c+273.15; }
  else if (unit === "k") { k=val; c=k-273.15; f=c*9/5+32; }
  else return reply("❌ Unknown unit. Use c, f, or k");
  await react("✅");
  await reply(`🌡️ *Temperature Converter*\n\n◈ Celsius  ›  ${c.toFixed(2)}°C\n◈ Fahrenheit  ›  ${f.toFixed(2)}°F\n◈ Kelvin  ›  ${k.toFixed(2)} K\n\n> _${botFooter}_`);
});

gmd({
  pattern: "percentof",
  aliases: ["percent", "calcpercent"],
  react: "💯",
  category: "tools",
  description: "Calculate percentage. Usage: .percentof 20 500 (20% of 500)",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}percentof <percent> <total>\nExample: ${botPrefix}percentof 20 500`);
  const [pStr, tStr] = q.split(/\s+/);
  const p = parseFloat(pStr), t = parseFloat(tStr);
  if (isNaN(p) || isNaN(t)) return reply("❌ Invalid numbers");
  const result = (p / 100 * t).toFixed(2);
  const reverse = ((p/t)*100).toFixed(2);
  await react("✅");
  await reply(`💯 *Percentage*\n\n${p}% of ${t} = *${result}*\n${p} is *${((p/t)*100).toFixed(2)}%* of ${t}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "tip",
  aliases: ["tipcalc", "calctip"],
  react: "💵",
  category: "tools",
  description: "Calculate tip amount. Usage: .tip 50 15 (bill tip%)",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}tip <bill amount> <tip %>\nExample: ${botPrefix}tip 50 15`);
  const [bStr, tStr] = q.split(/\s+/);
  const bill = parseFloat(bStr), tipPct = parseFloat(tStr) || 15;
  if (isNaN(bill)) return reply("❌ Invalid bill amount");
  const tipAmt = (bill * tipPct / 100).toFixed(2);
  const total = (bill + parseFloat(tipAmt)).toFixed(2);
  await react("✅");
  await reply(`💵 *Tip Calculator*\n\n◈ Bill  ›  ${bill.toFixed(2)}\n◈ Tip (${tipPct}%)  ›  ${tipAmt}\n◈ Total  ›  *${total}*\n\n> _${botFooter}_`);
});

gmd({
  pattern: "password",
  aliases: ["genpassword", "passgen", "pwgen"],
  react: "🔑",
  category: "tools",
  description: "Generate a secure random password. Usage: .password 16",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  const len = Math.min(Math.max(parseInt(q) || 16, 8), 64);
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let pwd = "";
  for (let i = 0; i < len; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  await react("✅");
  await reply(`🔑 *Password Generator*\n\n\`\`\`${pwd}\`\`\`\nLength: ${len} characters\n\n⚠️ _Save this somewhere safe — it won't be shown again._\n\n> _${botFooter}_`);
});

gmd({
  pattern: "uuid",
  aliases: ["genid", "generateid", "uniqueid"],
  react: "🆔",
  category: "tools",
  description: "Generate a random UUID v4",
}, async (from, Gifted, conText) => {
  const { reply, react, botFooter } = conText;
  const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
  await react("✅");
  await reply(`🆔 *UUID v4*\n\n\`\`\`${id}\`\`\`\n\n> _${botFooter}_`);
});

gmd({
  pattern: "ascii",
  aliases: ["toascii", "charcode"],
  react: "💻",
  category: "tools",
  description: "Convert text to ASCII codes. Usage: .ascii Hi",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}ascii <text>`);
  const codes = q.split("").map(c => `${c}→${c.charCodeAt(0)}`).join("  ");
  await react("✅");
  await reply(`💻 *ASCII Codes*\n\n📝 Text: ${q}\n\n\`\`\`${codes}\`\`\`\n\n> _${botFooter}_`);
});

gmd({
  pattern: "fromascii",
  aliases: ["asciitotext", "decodeascii"],
  react: "💻",
  category: "tools",
  description: "Convert ASCII codes to text. Usage: .fromascii 72 101 108 108 111",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}fromascii <code1> <code2> ...\nExample: ${botPrefix}fromascii 72 101 108 108 111`);
  const text = q.split(/\s+/).map(n => String.fromCharCode(parseInt(n))).join("");
  await react("✅");
  await reply(`💻 *ASCII to Text*\n\n🔢 Codes: ${q}\n\n📝 Text:\n${text}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "pidigits",
  aliases: ["pi", "getpi"],
  react: "🥧",
  category: "tools",
  description: "Get digits of Pi up to 50 places",
}, async (from, Gifted, conText) => {
  const { reply, react, botFooter } = conText;
  const pi = "3.14159265358979323846264338327950288419716939937510";
  await react("✅");
  await reply(`🥧 *Pi (π)*\n\n\`\`\`${pi}\`\`\`\n\n_50 decimal places_\n\n> _${botFooter}_`);
});

gmd({
  pattern: "anagram",
  aliases: ["isanagram", "checkanagram"],
  react: "🔡",
  category: "tools",
  description: "Check if two words are anagrams. Usage: .anagram listen|silent",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q || !q.includes("|")) return reply(`Usage: ${botPrefix}anagram <word1>|<word2>\nExample: ${botPrefix}anagram listen|silent`);
  const [a, b] = q.split("|").map(w => w.trim().toLowerCase().replace(/\s/g,"").split("").sort().join(""));
  const original = q.split("|").map(w => w.trim());
  const isAna = a === b;
  await react("✅");
  await reply(`🔡 *Anagram Check*\n\n📝 Word 1: ${original[0]}\n📝 Word 2: ${original[1]}\n\n${isAna ? "✅ *Yes, they ARE anagrams!*" : "❌ *No, they are NOT anagrams.*"}\n\n> _${botFooter}_`);
});

gmd({
  pattern: "splittext",
  aliases: ["textsplit", "splitby"],
  react: "✂️",
  category: "tools",
  description: "Split text by a delimiter. Usage: .splittext , one,two,three",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}splittext <delimiter> <text>\nExample: ${botPrefix}splittext , apple,banana,mango`);
  const parts = q.split(" ");
  const delim = parts[0];
  const text = parts.slice(1).join(" ");
  if (!text) return reply("❌ Provide text to split after the delimiter");
  const chunks = text.split(delim);
  await react("✅");
  let result = `✂️ *Split Text*\n\n🔪 Delimiter: \`${delim}\`\n📦 Parts: ${chunks.length}\n\n`;
  chunks.forEach((c, i) => { result += `${i+1}. ${c.trim()}\n`; });
  result += `\n> _${botFooter}_`;
  await reply(result);
});

gmd({
  pattern: "scorecard",
  aliases: ["scores", "tallyscore"],
  react: "🏆",
  category: "fun",
  description: "Generate a fun scorecard for players. Usage: .scorecard Alice:95 Bob:87 Charlie:91",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  if (!q) return reply(`Usage: ${botPrefix}scorecard <name>:<score> <name>:<score>...\nExample: ${botPrefix}scorecard Alice:95 Bob:87`);
  const entries = q.split(/\s+/).map(e => { const [n,s] = e.split(":"); return { name: n, score: parseInt(s)||0 }; });
  entries.sort((a,b) => b.score - a.score);
  const medals = ["🥇","🥈","🥉"];
  let txt = `🏆 *Scorecard*\n\n`;
  entries.forEach((e, i) => { txt += `${medals[i]||`${i+1}.`} *${e.name}*  ›  ${e.score} pts\n`; });
  txt += `\n> _${botFooter}_`;
  await react("✅");
  await reply(txt);
});

gmd({
  pattern: "numberfact",
  aliases: ["funfact", "numfact"],
  react: "💡",
  category: "fun",
  description: "Get an interesting fact about a number. Usage: .numberfact 42",
}, async (from, Gifted, conText) => {
  const { q, reply, react, botFooter, botPrefix } = conText;
  const n = parseInt(q) || Math.floor(Math.random() * 1000);
  try {
    await react("⏳");
    const axios = require("axios");
    const res = await axios.get(`http://numbersapi.com/${n}`, { timeout: 8000 });
    await react("✅");
    await reply(`💡 *Number Fact*\n\n*${n}:* ${res.data}\n\n> _${botFooter}_`);
  } catch {
    await react("❌");
    await reply(`❌ Could not fetch fact for ${n}. Try again!`);
  }
});

gmd({
  pattern: "datefact",
  aliases: ["historyfact", "daytrivia"],
  react: "📅",
  category: "fun",
  description: "Get a historical fact for today's date",
}, async (from, Gifted, conText) => {
  const { reply, react, botFooter } = conText;
  try {
    await react("⏳");
    const axios = require("axios");
    const now = new Date();
    const m = now.getMonth()+1, d = now.getDate();
    const res = await axios.get(`http://numbersapi.com/${m}/${d}/date`, { timeout: 8000 });
    await react("✅");
    await reply(`📅 *Today in History*\n\n${res.data}\n\n> _${botFooter}_`);
  } catch {
    await react("❌");
    await reply("❌ Could not fetch history fact. Try again!");
  }
});
