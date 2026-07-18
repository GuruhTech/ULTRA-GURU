
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

// Accept both "owner/repo" and full GitHub URLs
const normalizeRepo = (raw) => {
    if (!raw) return null;
    const match = String(raw).match(/github\.com\/([^/\s]+\/[^/\s]+)/);
    if (match) return match[1].replace(/\.git$/, "").replace(/\/*$/, "");
    return String(raw).trim();
};

const runUpdate = async (repo, Guru, ownerJid, onProgress) => {
    repo = normalizeRepo(repo) || repo;
    const progress = typeof onProgress === "function" ? onProgress : (msg) => console.log(msg);
    const axios = require("axios");
    const AdmZip = require("adm-zip");
    const { execSync } = require("child_process");
    const { copyFolderSync } = require("./gmdFunctions");

    await progress(`🔍 Fetching commit info from *github.com/${repo}*...`);
    const commitData = await fetchLatestCommit(axios, repo);
    const latestHash = commitData.sha;
    const currentHash = await getCommitHash();

    if (latestHash === currentHash) {
        console.log("✅ [Update] Bot is already up to date.");
        return false;
    }

    const authorName = commitData.commit.author.name;
    const commitMessage = commitData.commit.message;
    const commitDate = new Date(commitData.commit.author.date).toLocaleString();
    console.log(`🔄 [Update] New update: ${authorName} — ${commitMessage}`);

    const repoName = repo.split("/")[1];
    const zipPath = path.join(__dirname, "..", `${repoName}-main.zip`);
    const extractPath = path.join(__dirname, "..", "latest");

    await progress(
        `📥 *Downloading update...*\n\n` +
        `◈ 📦 Repo    ⤳ \`github.com/${repo}\`\n` +
        `◈ 👤 Author  ⤳ ${authorName}\n` +
        `◈ 📅 Date    ⤳ ${commitDate}\n` +
        `◈ 💬 Changes ⤳ ${commitMessage}\n\n` +
        `_This may take 30–60 seconds..._`
    );

    const { data: zipData } = await axios.get(
        `https://github.com/${repo}/archive/main.zip`,
        { responseType: "arraybuffer", timeout: 120000 }
    );
    fs.writeFileSync(zipPath, zipData);

    await progress("📦 *Extracting files...*");
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    await progress("📂 *Applying changes to bot files...*\n_(Your session, database and .env are kept safe)_");
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

    await progress("🔧 *Installing dependencies...*\n_(npm install — may take a moment)_");
    try {
        execSync("npm install --legacy-peer-deps", {
            cwd: destinationPath,
            stdio: "pipe",
            timeout: 120000,
        });
        console.log("✅ [Update] Dependencies installed.");
    } catch (npmErr) {
        console.warn("⚠️ [Update] npm install warning:", npmErr.message);
        await progress(`⚠️ *npm install warning:* ${npmErr.message.slice(0, 200)}\n_Continuing anyway..._`);
    }

    return true;
};

const checkAndAutoUpdate = async (Guru) => {
    if (updateCheckedThisSession) return;
    updateCheckedThisSession = true;

    try {
        const autoUpdateEnabled = await getSetting("AUTO_UPDATE");
        if (autoUpdateEnabled === "false") {
            console.log("ℹ️ [AutoUpdate] Disabled via settings. Skipping.");
            return;
        }

        const repo = normalizeRepo(await getSetting("BOT_REPO")) || "GuruhTech/ULTRA-GURU";

        let ownerJid = null;
        try {
            const ownerNum = await getSetting("OWNER_NUMBER");
            if (ownerNum) {
                ownerJid = ownerNum.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            }
        } catch (_) {}

        console.log(`🔍 [AutoUpdate] Checking for updates on ${repo}...`);
        const updated = await runUpdate(repo, Guru, ownerJid);

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
