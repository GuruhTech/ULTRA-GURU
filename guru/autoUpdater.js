
const path = require("path");
const fs = require("fs-extra");

const { getCommitHash, setCommitHash } = require("./database/autoUpdate");
const { getSetting } = require("./database/settings");

let updateCheckedThisSession = false;

const resetUpdateFlag = () => {
    updateCheckedThisSession = false;
};

const fetchLatestCommit = async (axios, repo) => {
    const { data } = await axios.get(
        `https://api.github.com/repos/${repo}/commits/main`,
        {
            timeout: 20000,
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Cache-Control": "no-cache",
                "User-Agent": "ULTRA-GURU-Bot",
            },
        }
    );

    if (!data || typeof data.sha !== "string" || data.sha.length < 10) {
        const msg = data?.message || JSON.stringify(data).slice(0, 200);
        throw new Error(`GitHub API returned invalid response: ${msg}`);
    }

    return data;
};

const runUpdate = async (repo, Gifted, ownerJid) => {
    const axios = require("axios");
    const AdmZip = require("adm-zip");
    const { execSync } = require("child_process");
    const { copyFolderSync } = require("./gmdFunctions");

    const commitData = await fetchLatestCommit(axios, repo);
    const latestHash = commitData.sha;
    const currentHash = await getCommitHash();

    if (latestHash === currentHash) {
        console.log("✅ [AutoUpdate] Bot is already up to date.");
        return false;
    }

    const authorName = commitData.commit.author.name;
    const commitMessage = commitData.commit.message;
    const commitDate = new Date(commitData.commit.author.date).toLocaleString();

    console.log(`🔄 [AutoUpdate] New update detected!\n   ↳ Author: ${authorName}\n   ↳ Date: ${commitDate}\n   ↳ Message: ${commitMessage}`);


    const repoName = repo.split("/")[1];
    const zipPath = path.join(__dirname, "..", `${repoName}-main.zip`);
    const extractPath = path.join(__dirname, "..", "latest");

    const { data: zipData } = await axios.get(
        `https://github.com/${repo}/archive/main.zip`,
        { responseType: "arraybuffer", timeout: 120000 }
    );
    fs.writeFileSync(zipPath, zipData);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    const sourcePath = path.join(extractPath, `${repoName}-main`);
    const destinationPath = path.join(__dirname, "..");

    const excludeList = [
        ".env",
        "guru/database/database.db",
        "guru/session/session.db",
        "guru/session",
        ".replit",
        "replit.nix",
        ".local",
        ".git",
        "node_modules",
        "latest",
    ];

    copyFolderSync(sourcePath, destinationPath, excludeList);
    await setCommitHash(latestHash);

    try { fs.unlinkSync(zipPath); } catch (_) {}
    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (_) {}

    try {
        console.log("📦 [AutoUpdate] Installing dependencies...");
        execSync("npm install --legacy-peer-deps", {
            cwd: destinationPath,
            stdio: "pipe",
            timeout: 120000,
        });
        console.log("✅ [AutoUpdate] Dependencies installed.");
    } catch (npmErr) {
        console.warn("⚠️ [AutoUpdate] npm install warning:", npmErr.message);
    }

    return true;
};

const checkAndAutoUpdate = async (Gifted) => {
    if (updateCheckedThisSession) return;
    updateCheckedThisSession = true;

    try {
        const autoUpdateEnabled = await getSetting("AUTO_UPDATE");
        if (autoUpdateEnabled === "false") {
            console.log("ℹ️ [AutoUpdate] Disabled via settings. Skipping.");
            return;
        }

        const repo = (await getSetting("BOT_REPO")) || "GuruhTech/ULTRA-GURU";

        let ownerJid = null;
        try {
            const ownerNum = await getSetting("OWNER_NUMBER");
            if (ownerNum) {
                ownerJid = ownerNum.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            }
        } catch (_) {}

        console.log(`🔍 [AutoUpdate] Checking for updates on ${repo}...`);
        const updated = await runUpdate(repo, Gifted, ownerJid);

        if (updated) {
            console.log("✅ [AutoUpdate] Update applied! Restarting in 3 seconds...");
            setTimeout(() => process.exit(0), 3000);
        }
    } catch (err) {
        console.error("❌ [AutoUpdate] Check failed:", err.message);
        updateCheckedThisSession = false;
    }
};

module.exports = { checkAndAutoUpdate, runUpdate, resetUpdateFlag };
