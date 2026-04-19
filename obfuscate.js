const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");

const OBFUSCATOR_OPTIONS = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: "hexadecimal",
  log: false,
  numbersToExpressions: false,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: false,
  stringArray: false,
  stringArrayCallsTransform: false,
  stringArrayEncoding: [],
  stringArrayIndexShift: false,
  stringArrayRotate: false,
  stringArrayShuffle: false,
  stringArrayWrappersCount: 0,
  stringArrayWrappersChainedCalls: false,
  stringArrayWrappersParametersMaxCount: 2,
  stringArrayWrappersType: "variable",
  stringArrayThreshold: 0,
  unicodeEscapeSequence: false,
  transformObjectKeys: false,
};

const SENSITIVE_FILES = [
  "guru/gmdCmds.js",
  "guru/gmdFunctions.js",
  "guru/gmdFunctions2.js",
  "guru/gmdFunctions3.js",
  "guru/gmdHelpers.js",
  "guru/contextInfo.js",
  "guru/autoUpdater.js",
  "guru/restrictionManager.js",
  "guru/gameHandler.js",
  "guru/gameAI.js",
  "guru/tictactoe.js",
  "guru/wcg.js",
  "guru/dictionary.js",
  "guru/index.js",
  "guru/connection/socketConfig.js",
  "guru/connection/commandHandler.js",
  "guru/connection/connectionHandler.js",
  "guru/connection/serializer.js",
  "guru/connection/index.js",
  "guru/connection/groupEvents.js",
  "guru/connection/groupCache.js",
  "guru/database/database.js",
  "guru/database/settings.js",
  "guru/database/sudo.js",
  "guru/database/notes.js",
  "guru/database/games.js",
  "guru/database/wcgGame.js",
  "guru/database/diceGame.js",
  "guru/database/messageStore.js",
  "guru/database/lidMapping.js",
  "guru/database/groupSettings.js",
  "guru/database/tempmail.js",
  "guru/database/autoUpdate.js",
];

let successCount = 0;
let failCount = 0;

for (const filePath of SENSITIVE_FILES) {
  const fullPath = path.resolve(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping (not found): ${filePath}`);
    continue;
  }

  try {
    const originalCode = fs.readFileSync(fullPath, "utf8");

    if (originalCode.includes("_0x") && originalCode.includes("function(")) {
      console.log(`⏭️  Already obfuscated, skipping: ${filePath}`);
      successCount++;
      continue;
    }

    const obfuscated = JavaScriptObfuscator.obfuscate(
      originalCode,
      OBFUSCATOR_OPTIONS
    );

    fs.writeFileSync(fullPath, obfuscated.getObfuscatedCode(), "utf8");
    console.log(`✅ Obfuscated: ${filePath}`);
    successCount++;
  } catch (err) {
    console.error(`❌ Failed to obfuscate ${filePath}: ${err.message}`);
    failCount++;
  }
}

console.log(
  `\n✅ Done. ${successCount} succeeded, ${failCount} failed.`
);
