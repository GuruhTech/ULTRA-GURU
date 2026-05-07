const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const rootDir = path.join(__dirname, "..");
const sharpDir = path.join(rootDir, "node_modules", "sharp");
const imgDir = path.join(rootDir, "node_modules", "@img");

try {
    if (fs.existsSync(sharpDir)) {
        console.log("✅ Sharp is already installed.");
    } else {
        console.log("⚙️ Sharp not found, skipping fix.");
    }
} catch (err) {
    console.warn("⚠️ fix-sharp warning:", err.message);
}
