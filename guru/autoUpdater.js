var _0xd383d2=(function(_0xbcad55,_0xec7bc7){return !![]}());var _0x7f052c=function(){return ![]};
const path = require("path");
const fs = require("fs-extra");
const { getCommitHash, setCommitHash } = require("./database/autoUpdate");
const { getSetting } = require("./database/settings");
let _0x7cd4e3 = false;
const _0x415eef = () => {
    _0x7cd4e3 = false;
};
const _0xa99d64 = async (axios, _0xbb7ece) => {
    const { data } = await axios.get(
        `https:
        {
            timeout: 0x4E20,
            headers: {
                "\x41\x63\x63\x65\x70\x74": "\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e\x2f\x76\x6e\x64\x2e\x67\x69\x74\x68\x75\x62\x2e\x76\x33\x2b\x6a\x73\x6f\x6e",
                "\x43\x61\x63\x68\x65\x2d\x43\x6f\x6e\x74\x72\x6f\x6c": "\x6e\x6f\x2d\x63\x61\x63\x68\x65",
                "\x55\x73\x65\x72\x2d\x41\x67\x65\x6e\x74": "\x55\x4c\x54\x52\x41\x2d\x47\x55\x52\x55\x2d\x42\x6f\x74",
            },
        }
    );
    if (!data || typeof data.sha !== "\x73\x74\x72\x69\x6e\x67" || data.sha.length < 0xA) {
        const _0xd4b139 = data?.message || JSON.stringify(data).slice(0, 0xC8);
        throw new Error(`GitHub API returned invalid response: ${_0xd4b139}`);
    }
    return data;
};
const _0xf30b79 = async (_0xbb7ece, Gifted, _0x7cd010) => {
    const axios = require("axios");
    const _0xffb8c0 = require("adm-zip");
    const { execSync } = require("child_process");
    const { copyFolderSync } = require("./gmdFunctions");
    const _0x783d62 = await _0xa99d64(axios, _0xbb7ece);
    const _0x9c2c67 = _0x783d62.sha;
    const _0xba43fb = await getCommitHash();
    if (_0x9c2c67 === _0xba43fb) {
        console.log("✅\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x42\x6f\x74\x20\x69\x73\x20\x61\x6c\x72\x65\x61\x64\x79\x20\x75\x70\x20\x74\x6f\x20\x64\x61\x74\x65\x2e");
        return false;
    }
    const _0x2cd44d = _0x783d62.commit.author.name;
    const _0x07beb6 = _0x783d62.commit.message;
    const _0x961519 = new Date(_0x783d62.commit.author.date).toLocaleString();
    console.log(`🔄 [AutoUpdate] New update detected!\n   ↳ Author: ${_0x2cd44d}\n   ↳ Date: ${_0x961519}\n   ↳ Message: ${_0x07beb6}`);
    const _0x59c424 = _0xbb7ece.split("/")[1];
    const _0xb709f6 = path.join(__dirname, "..", `${_0x59c424}-main.zip`);
    const _0xce978c = path.join(__dirname, "..", "\x6c\x61\x74\x65\x73\x74");
    const { data: zipData } = await axios.get(
        `https:
        { responseType: "\x61\x72\x72\x61\x79\x62\x75\x66\x66\x65\x72", timeout: 0x1D4C0 }
    );
    fs.writeFileSync(_0xb709f6, zipData);
    const _0xe9075e = new _0xffb8c0(_0xb709f6);
    _0xe9075e.extractAllTo(_0xce978c, true);
    const _0x834ef1 = path.join(_0xce978c, `${_0x59c424}-main`);
    const _0xe513e8 = path.join(__dirname, "..");
    const _0x1d53a8 = [
        ".env",
        "\x67\x75\x72\x75\x2f\x64\x61\x74\x61\x62\x61\x73\x65\x2f\x64\x61\x74\x61\x62\x61\x73\x65\x2e\x64\x62",
        "\x67\x75\x72\x75\x2f\x73\x65\x73\x73\x69\x6f\x6e\x2f\x73\x65\x73\x73\x69\x6f\x6e\x2e\x64\x62",
        "\x67\x75\x72\x75\x2f\x73\x65\x73\x73\x69\x6f\x6e",
        ".replit",
        "\x72\x65\x70\x6c\x69\x74\x2e\x6e\x69\x78",
        ".local",
        ".git",
        "\x6e\x6f\x64\x65\x5f\x6d\x6f\x64\x75\x6c\x65\x73",
        "\x6c\x61\x74\x65\x73\x74",
    ];
    copyFolderSync(_0x834ef1, _0xe513e8, _0x1d53a8);
    await setCommitHash(_0x9c2c67);
    try { fs.unlinkSync(_0xb709f6); } catch (_) {}
    try { fs.rmSync(_0xce978c, { recursive: true, force: true }); } catch (_) {}
    try {
        console.log("📦\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x49\x6e\x73\x74\x61\x6c\x6c\x69\x6e\x67\x20\x64\x65\x70\x65\x6e\x64\x65\x6e\x63\x69\x65\x73\x2e\x2e\x2e");
        execSync("\x6e\x70\x6d\x20\x69\x6e\x73\x74\x61\x6c\x6c\x20\x2d\x2d\x6c\x65\x67\x61\x63\x79\x2d\x70\x65\x65\x72\x2d\x64\x65\x70\x73", {
            cwd: _0xe513e8,
            stdio: "\x70\x69\x70\x65",
            timeout: 0x1D4C0,
        });
        console.log("✅\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x44\x65\x70\x65\x6e\x64\x65\x6e\x63\x69\x65\x73\x20\x69\x6e\x73\x74\x61\x6c\x6c\x65\x64\x2e");
    } catch (npmErr) {
        console.warn("⚠️\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x6e\x70\x6d\x20\x69\x6e\x73\x74\x61\x6c\x6c\x20\x77\x61\x72\x6e\x69\x6e\x67\x3a", npmErr.message);
    }
    return true;
};
const _0x992acf = async (Gifted) => {
    if (_0x7cd4e3) return;
    _0x7cd4e3 = true;
    try {
        const _0xfe95d3 = await getSetting("\x41\x55\x54\x4f\x5f\x55\x50\x44\x41\x54\x45");
        if (_0xfe95d3 === "\x66\x61\x6c\x73\x65") {
            console.log("ℹ️\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x44\x69\x73\x61\x62\x6c\x65\x64\x20\x76\x69\x61\x20\x73\x65\x74\x74\x69\x6e\x67\x73\x2e\x20\x53\x6b\x69\x70\x70\x69\x6e\x67\x2e");
            return;
        }
        const _0xbb7ece = (await getSetting("\x42\x4f\x54\x5f\x52\x45\x50\x4f")) || "\x47\x75\x72\x75\x68\x54\x65\x63\x68\x2f\x55\x4c\x54\x52\x41\x2d\x47\x55\x52\x55";
        let _0x7cd010 = null;
        try {
            const _0x351282 = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x4e\x55\x4d\x42\x45\x52");
            if (_0x351282) {
                _0x7cd010 = _0x351282.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            }
        } catch (_) {}
        console.log(`🔍 [AutoUpdate] Checking for updates on ${_0xbb7ece}...`);
        const _0x826255 = await _0xf30b79(_0xbb7ece, Gifted, _0x7cd010);
        if (_0x826255) {
            console.log("✅\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x55\x70\x64\x61\x74\x65\x20\x61\x70\x70\x6c\x69\x65\x64\x21\x20\x52\x65\x73\x74\x61\x72\x74\x69\x6e\x67\x20\x69\x6e\x20\x33\x20\x73\x65\x63\x6f\x6e\x64\x73\x2e\x2e\x2e");
            setTimeout(() => process.exit(0), 0xBB8);
        }
    } catch (err) {
        console.error("❌\x20\x5b\x41\x75\x74\x6f\x55\x70\x64\x61\x74\x65\x5d\x20\x43\x68\x65\x63\x6b\x20\x66\x61\x69\x6c\x65\x64\x3a", err.message);
        _0x7cd4e3 = false;
    }
};
module.exports = { _0x992acf, _0xf30b79, _0x415eef };
