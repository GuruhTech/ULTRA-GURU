var _0x98d99c=(function(_0x87abf5,_0xfe028c){return !![]}());var _0xa36592=function(){return ![]};
const { DATABASE } = require("./database");
const { DataTypes } = require("sequelize");
const _0x3472ce = DATABASE.define(
    "\x47\x72\x65\x65\x74\x69\x6e\x67\x73\x43\x68\x61\x74\x73",
    {
        id: { _0xfaa5ca: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        jid: { _0xfaa5ca: DataTypes.STRING, allowNull: false, unique: true },
        _0xfaa5ca: { _0xfaa5ca: DataTypes.STRING, defaultValue: "dm" },
    },
    { tableName: "\x67\x72\x65\x65\x74\x69\x6e\x67\x73\x5f\x63\x68\x61\x74\x73", timestamps: true }
);
let _0x1d3bdf = false;
async function initGreetingsDB() {
    if (_0x1d3bdf) return;
    await _0x3472ce.sync();
    _0x1d3bdf = true;
}
async function addGreetingsChat(jid) {
    await initGreetingsDB();
    const _0xfaa5ca = jid.endsWith("@g.us") ? "\x67\x72\x6f\x75\x70" : "dm";
    await _0x3472ce.findOrCreate({ where: { jid }, defaults: { jid, _0xfaa5ca } });
}
async function removeGreetingsChat(jid) {
    await initGreetingsDB();
    await _0x3472ce.destroy({ where: { jid } });
}
async function getAllGreetingsChats() {
    await initGreetingsDB();
    const _0xd9d6bb = await _0x3472ce.findAll();
    return _0xd9d6bb.map(r => ({ jid: r.jid, _0xfaa5ca: r.type }));
}
async function hasGreetingsChat(jid) {
    await initGreetingsDB();
    const r = await _0x3472ce.findOne({ where: { jid } });
    return !!r;
}
async function countGreetingsChats() {
    await initGreetingsDB();
    return await _0x3472ce.count();
}
module.exports = {
    initGreetingsDB,
    addGreetingsChat,
    removeGreetingsChat,
    getAllGreetingsChats,
    hasGreetingsChat,
    countGreetingsChats,
};
