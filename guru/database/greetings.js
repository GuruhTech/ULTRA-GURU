
const { DATABASE } = require("./database");
const { DataTypes } = require("sequelize");

const GreetingsChatsDB = DATABASE.define(
    "GreetingsChats",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        jid: { type: DataTypes.STRING, allowNull: false, unique: true },
        type: { type: DataTypes.STRING, defaultValue: "dm" },
    },
    { tableName: "greetings_chats", timestamps: true }
);

let dbReady = false;

async function initGreetingsDB() {
    if (dbReady) return;
    await GreetingsChatsDB.sync();
    dbReady = true;
}

async function addGreetingsChat(jid) {
    await initGreetingsDB();
    const type = jid.endsWith("@g.us") ? "group" : "dm";
    await GreetingsChatsDB.findOrCreate({ where: { jid }, defaults: { jid, type } });
}

async function removeGreetingsChat(jid) {
    await initGreetingsDB();
    await GreetingsChatsDB.destroy({ where: { jid } });
}

async function getAllGreetingsChats() {
    await initGreetingsDB();
    const rows = await GreetingsChatsDB.findAll();
    return rows.map(r => ({ jid: r.jid, type: r.type }));
}

async function hasGreetingsChat(jid) {
    await initGreetingsDB();
    const r = await GreetingsChatsDB.findOne({ where: { jid } });
    return !!r;
}

async function countGreetingsChats() {
    await initGreetingsDB();
    return await GreetingsChatsDB.count();
}

module.exports = {
    initGreetingsDB,
    addGreetingsChat,
    removeGreetingsChat,
    getAllGreetingsChats,
    hasGreetingsChat,
    countGreetingsChats,
};
