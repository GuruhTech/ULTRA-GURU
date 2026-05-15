var _0xe84c36=(function(_0xc2b3da,_0xd8167e){return !![]}());var _0xa8ff71=function(){return ![]};
const { Boom } = require("@hapi/boom");
const { DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");
const { setupGroupCacheListeners } = require("./groupCache");
const { resetUpdateFlag } = require("../autoUpdater");
const { setupRestrictionManager, resetRestrictionListeners } = require("../restrictionManager");
const { setupVVTracker } = require("../gmdFunctions2");
const _0x2a04db = 0x1388;
const _0xb9db26 = 0x32;
const _0xd84b65 = 0x1D4C0;
const _0x04b334 = 0xAFC8;
let _0x751c05 = 0;
let _0xede12e = false;
let _0x3fd69a = null;
let _0x5c30b5 = false;
let _0x8c025d = false;
const _0x7a0659 = (ms) => ms + Math.floor(Math.random() * ms * 0.3);
const _0xb7c0ff = () => {
    if (_0x3fd69a) {
        clearInterval(_0x3fd69a);
        _0x3fd69a = null;
    }
};
const _0x8f85d0 = (Gifted, startGifted) => {
    _0xb7c0ff();
    _0x3fd69a = setInterval(async () => {
        if (_0x5c30b5) return;
        try {
            const _0x22c6f1 = await Promise.race([
                Gifted.query("\x70\x69\x6e\x67"),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("\x77\x61\x74\x63\x68\x64\x6f\x67\x20\x74\x69\x6d\x65\x6f\x75\x74")), _0x04b334)
                ),
            ]);
        } catch (err) {
            if (_0x5c30b5) return;
            console.warn(`⚠️ Watchdog: socket unresponsive (${err.message}), forcing reconnect...`);
            _0xb7c0ff();
            _0x5c30b5 = true;
            _0x8c025d = true;
            try { Gifted.end(new Error("\x77\x61\x74\x63\x68\x64\x6f\x67\x20\x66\x6f\x72\x63\x65\x64\x20\x72\x65\x63\x6f\x6e\x6e\x65\x63\x74")); } catch (_) {}
            setTimeout(() => {
                _0x5c30b5 = false;
                _0x8c025d = false;
                startGifted();
            }, _0x7a0659(_0x2a04db));
        }
    }, _0xd84b65);
};
const _0xb8cd3f = [
    "🧑‍🏫", "👨‍🏫", "👩‍🏫", "🎓", "📚", "🔬", "🧪",
    "🏫", "📝", "💡", "🖊️", "📖", "🎯", "🏆", "✏️",
    "🧑‍🔬", "👨‍🔬", "🧠", "📜", "🔭", "🌍", "📐", "📏",
    "🔢", "🧮", "⚗️", "🎒", "📓", "📔", "📕", "🖋️"
];
const _0x5e38e4 = () =>
    _0xb8cd3f[Math.floor(Math.random() * _0xb8cd3f.length)];
const _0x89a4c1 = [];
const _0xd63662 = async (Gifted, newsletterJid) => {
    if (!newsletterJid) return false;
    try {
        await Gifted.newsletterFollow(newsletterJid);
        return true;
    } catch (error) {
        console.error(
            `❌ Channel follow failed for ${newsletterJid}:`,
            error.message,
        );
        return false;
    }
};
const _0xf7571e = async (Gifted, groupJid) => {
    if (!groupJid) return false;
    try {
        await Gifted.groupAcceptInvite(groupJid);
        return true;
    } catch (error) {
        switch (error.data) {
            case 0x199:
                console.log(`ℹ️ Already in group: ${groupJid}`);
                break;
            case 0x190:
                console.log(`⚠️ Invalid invite code for group: ${groupJid}`);
                break;
            case 0x193:
                console.log(`⚠️ No permission to join group: ${groupJid}`);
                break;
            default:
                console.error(
                    `❌ Group join failed for ${groupJid}:`,
                    error.message,
                );
        }
        return false;
    }
};
const _0xeb3122 = async (Gifted) => {
    let _0xa4c1d4 = [];
    try {
        const { getSetting } = require("../database/settings");
        const _0xcccaaa = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53");
        if (_0xcccaaa) {
            _0xa4c1d4 = _0xcccaaa
                .split(",")
                .map((j) => j.trim())
                .filter((j) => j.endsWith("@newsletter"));
        }
    } catch (_) {}
    const _0x3c5f0a = [
        ...new Set([...OWNER_CHANNELS, ...extraChannels]),
    ];
    for (const _0xfcd291 of _0x3c5f0a) {
        await _0xd63662(Gifted, _0xfcd291);
    }
    if (_0x3c5f0a.length > 0) {
        console.log(`📡 Auto-followed ${_0x3c5f0a.length} channel(s)`);
    }
};
const _0xb43084 = (Gifted) => {
    if (_0xede12e) return;
    _0xede12e = true;
    Gifted.ev.on("\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x75\x70\x73\x65\x72\x74", async ({ messages, type }) => {
        try {
            for (const msg of messages) {
                if (!msg?.key?.remoteJid) continue;
                const _0xfcd291 = msg.key.remoteJid;
                if (!_0xfcd291.endsWith("@newsletter")) continue;
                let _0xa4c1d4 = [];
                try {
                    const { getSetting } = require("../database/settings");
                    const _0xcccaaa = await getSetting("\x4f\x57\x4e\x45\x52\x5f\x43\x48\x41\x4e\x4e\x45\x4c\x53");
                    if (_0xcccaaa) {
                        _0xa4c1d4 = _0xcccaaa
                            .split(",")
                            .map((j) => j.trim())
                            .filter((j) => j.endsWith("@newsletter"));
                    }
                } catch (_) {}
                const _0x3c5f0a = [
                    ...new Set([...OWNER_CHANNELS, ...extraChannels]),
                ];
                if (!_0x3c5f0a.includes(_0xfcd291)) continue;
                const _0x12b0c3 = msg.key.id;
                if (!_0x12b0c3) continue;
                const _0x7c0ed3 = _0x5e38e4();
                try {
                    if (typeof Gifted.newsletterReactMessage === "\x66\x75\x6e\x63\x74\x69\x6f\x6e") {
                        await Gifted.newsletterReactMessage(_0xfcd291, _0x12b0c3, _0x7c0ed3);
                    } else {
                        await Gifted.sendMessage(_0xfcd291, {
                            react: { key: msg.key, text: _0x7c0ed3 },
                        });
                    }
                    console.log(`📡 Auto-reacted to channel post [${_0xfcd291.split("@")[0]}] with ${_0x7c0ed3}`);
                } catch (reactErr) {
                    try {
                        await Gifted.sendMessage(_0xfcd291, {
                            react: { key: msg.key, text: _0x7c0ed3 },
                        });
                    } catch (_) {}
                }
            }
        } catch (err) {
            console.error("\x4e\x65\x77\x73\x6c\x65\x74\x74\x65\x72\x20\x72\x65\x61\x63\x74\x20\x65\x72\x72\x6f\x72\x3a", err.message);
        }
    });
};
const _0x4290be = new Map();
const _0xf2818a = (targetNum, requesterJid, label) => {
    if (!_0x4290be.has(targetNum)) _0x4290be.set(targetNum, []);
    const _0x0ed7d9 = _0x4290be.get(targetNum);
    if (!_0x0ed7d9.find(e => e.requesterJid === requesterJid)) {
        _0x0ed7d9.push({ requesterJid, label });
    }
};
const _0x2f7174 = (targetNum, requesterJid) => {
    if (!_0x4290be.has(targetNum)) return false;
    const _0x58d1b8 = _0x4290be.get(targetNum).filter(e => e.requesterJid !== requesterJid);
    if (_0x58d1b8.length === 0) _0x4290be.delete(targetNum);
    else _0x4290be.set(targetNum, _0x58d1b8);
    return true;
};
const _0x9d3464 = () => _0x4290be;
let _0x4d1e70 = false;
const _0xd4a95f = (Gifted) => {
    if (_0x4d1e70) return;
    _0x4d1e70 = true;
    Gifted.ev.on("\x70\x72\x65\x73\x65\x6e\x63\x65\x2e\x75\x70\x64\x61\x74\x65", ({ id, presences }) => {
        try {
            for (const [participantJid, presenceData] of Object.entries(presences || {})) {
                const _0x8e7a28 = participantJid.split("@")[0].split(":")[0];
                if (!_0x4290be.has(_0x8e7a28)) continue;
                const _0xac62c1 = presenceData?.lastKnownPresence;
                if (_0xac62c1 !== "\x61\x76\x61\x69\x6c\x61\x62\x6c\x65") continue;
                const _0x10d54d = _0x4290be.get(_0x8e7a28);
                const _0xeaa014 = new Date().toLocaleString();
                for (const { requesterJid, label } of _0x10d54d) {
                    Gifted.sendMessage(requesterJid, {
                        text: `👁️ *STALK ALERT* 👁️\n╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n📱 Target: *${label || `+${_0x8e7a28}`}*\n🟢 Status: *Online Now*\n🕐 Time: ${_0xeaa014}\n\n_Use \`.unstalk ${label || `+${_0x8e7a28}`}\` to stop tracking._`,
                    }).catch(() => {});
                }
            }
        } catch (_) {}
    });
};
const _0xe1bcbc = (
    Gifted,
    sessionDir,
    startGifted,
    callbacks = {},
) => {
    setupGroupCacheListeners(Gifted);
    _0xb43084(Gifted);
    setupRestrictionManager(Gifted);
    setupVVTracker(Gifted);
    _0xd4a95f(Gifted);
    Gifted.ev.on("\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x2e\x75\x70\x64\x61\x74\x65", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67") {
            console.log("🕗\x20\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x20\x74\x6f\x20\x57\x68\x61\x74\x73\x41\x70\x70\x2e\x2e\x2e");
        }
        if (connection === "\x6f\x70\x65\x6e") {
            const _0x4db425 = Gifted.user?.id?.split(":")[0]?.split("@")[0] || "\x75\x6e\x6b\x6e\x6f\x77\x6e";
            console.log(`✅ WhatsApp connected — logged in as: ${_0x4db425}`);
            console.log("📶\x20\x42\x6f\x74\x20\x69\x73\x20\x6c\x69\x76\x65\x20\x61\x6e\x64\x20\x6c\x69\x73\x74\x65\x6e\x69\x6e\x67\x20\x66\x6f\x72\x20\x6d\x65\x73\x73\x61\x67\x65\x73\x2e\x2e\x2e");
            _0x751c05 = 0;
            _0x5c30b5 = false;
            _0x8f85d0(Gifted, startGifted);
            if (callbacks.onOpen) {
                await callbacks.onOpen(Gifted);
            }
            setTimeout(async () => {
                await _0xeb3122(Gifted);
            }, 0xBB8);
        }
        if (connection === "\x63\x6c\x6f\x73\x65") {
            _0xb7c0ff();
            _0xede12e = false;
            resetRestrictionListeners();
            const _0x14ec39 = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`⚠️ Connection closed. Reason code: ${_0x14ec39}`);
            const _0x48f7a3 = (extraDelay = 0) => {
                if (_0x5c30b5) return;
                _0x5c30b5 = true;
                if (_0x751c05 >= _0xb9db26) {
                    console.warn(
                        `⚠️ ${_0xb9db26} reconnect attempts exhausted — cooling down for 2 minutes before retrying...`,
                    );
                    _0x751c05 = 0;
                    setTimeout(() => {
                        _0x5c30b5 = false;
                        startGifted();
                    }, _0x7a0659(0x1D4C0));
                    return;
                }
                _0x751c05++;
                const _0x46d09a = Math.min(
                    _0x2a04db * Math.pow(1.5, _0x751c05 - 1),
                    0x1D4C0,
                );
                const _0x6c9aa8 = _0x7a0659(_0x46d09a) + extraDelay;
                console.log(
                    `🔄 Reconnect attempt ${_0x751c05}/${_0xb9db26} in ${Math.round(_0x6c9aa8 / 0x3E8)}s...`,
                );
                setTimeout(() => {
                    _0x5c30b5 = false;
                    startGifted();
                }, _0x6c9aa8);
            };
            switch (_0x14ec39) {
                case DisconnectReason.badSession:
                    if (_0x8c025d) {
                        console.log("⚠️\x20\x57\x61\x74\x63\x68\x64\x6f\x67\x2d\x74\x72\x69\x67\x67\x65\x72\x65\x64\x20\x63\x6c\x6f\x73\x65\x20\x72\x65\x63\x65\x69\x76\x65\x64\x20\x63\x6f\x64\x65\x20\x35\x30\x30\x20—\x20\x72\x65\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x20\x73\x61\x66\x65\x6c\x79\x2e\x2e\x2e");
                        _0x8c025d = false;
                        break;
                    }
                    console.log("❌\x20\x42\x61\x64\x20\x73\x65\x73\x73\x69\x6f\x6e\x20—\x20\x64\x65\x6c\x65\x74\x69\x6e\x67\x20\x73\x65\x73\x73\x69\x6f\x6e\x20\x66\x69\x6c\x65\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x2d\x6c\x69\x6e\x6b\x20\x74\x68\x65\x20\x62\x6f\x74\x2e");
                    try {
                        await fs.remove(sessionDir);
                    } catch (e) {
                        console.error("\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x72\x65\x6d\x6f\x76\x65\x20\x73\x65\x73\x73\x69\x6f\x6e\x3a", e);
                    }
                    process.exit(1);
                    break;
                case DisconnectReason.connectionReplaced:
                    console.log("❌\x20\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x72\x65\x70\x6c\x61\x63\x65\x64\x20\x62\x79\x20\x61\x6e\x6f\x74\x68\x65\x72\x20\x73\x65\x73\x73\x69\x6f\x6e\x2e\x20\x53\x68\x75\x74\x74\x69\x6e\x67\x20\x64\x6f\x77\x6e\x20\x74\x68\x69\x73\x20\x69\x6e\x73\x74\x61\x6e\x63\x65\x2e");
                    process.exit(1);
                    break;
                case DisconnectReason.loggedOut:
                    console.log("❌\x20\x44\x65\x76\x69\x63\x65\x20\x6c\x6f\x67\x67\x65\x64\x20\x6f\x75\x74\x20—\x20\x64\x65\x6c\x65\x74\x69\x6e\x67\x20\x73\x65\x73\x73\x69\x6f\x6e\x2e\x20\x50\x6c\x65\x61\x73\x65\x20\x72\x65\x2d\x6c\x69\x6e\x6b\x20\x74\x68\x65\x20\x62\x6f\x74\x2e");
                    try {
                        await fs.remove(sessionDir);
                    } catch (e) {
                        console.error("❌\x20\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x72\x65\x6d\x6f\x76\x65\x20\x73\x65\x73\x73\x69\x6f\x6e\x3a", e);
                    }
                    process.exit(1);
                    break;
                case DisconnectReason.restartRequired:
                    console.log("🔄\x20\x57\x68\x61\x74\x73\x41\x70\x70\x20\x72\x65\x73\x74\x61\x72\x74\x20\x73\x69\x67\x6e\x61\x6c\x20\x72\x65\x63\x65\x69\x76\x65\x64\x20—\x20\x72\x65\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x20\x71\x75\x69\x63\x6b\x6c\x79\x2e\x2e\x2e");
                    if (!_0x5c30b5) {
                        _0x5c30b5 = true;
                        setTimeout(() => {
                            _0x5c30b5 = false;
                            startGifted();
                        }, 0x5DC);
                    }
                    break;
                case DisconnectReason.connectionClosed:
                case DisconnectReason.connectionLost:
                    console.log("🔄\x20\x54\x72\x61\x6e\x73\x69\x65\x6e\x74\x20\x64\x69\x73\x63\x6f\x6e\x6e\x65\x63\x74\x20—\x20\x72\x65\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x2e\x2e\x2e");
                    _0x48f7a3();
                    break;
                case DisconnectReason.timedOut:
                    console.log("⏱️\x20\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e\x20\x74\x69\x6d\x65\x64\x20\x6f\x75\x74\x20—\x20\x72\x65\x63\x6f\x6e\x6e\x65\x63\x74\x69\x6e\x67\x20\x77\x69\x74\x68\x20\x65\x78\x74\x72\x61\x20\x64\x65\x6c\x61\x79\x2e\x2e\x2e");
                    _0x48f7a3(_0x2a04db);
                    break;
                default:
                    console.log(`⚠️ Unknown disconnect _0x14ec39 (${_0x14ec39}) — attempting reconnect...`);
                    _0x48f7a3();
            }
        }
    });
};
module.exports = {
    _0xd63662,
    _0xf7571e,
    _0xe1bcbc,
    _0x2a04db,
    _0xb9db26,
    _0x89a4c1,
    _0xf2818a,
    _0x2f7174,
    _0x9d3464,
    _0xb8cd3f,
    _0x5e38e4,
};
