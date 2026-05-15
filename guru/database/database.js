const config = require("../../config");
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

class DatabaseManager {
    static instance = null;

    static getInstance() {
        if (!DatabaseManager.instance) {
            const DATABASE_URL = config.DATABASE_URL;
            const DEFAULT_SQLITE_PATH = path.join(__dirname, "database.db");

            if (!DATABASE_URL) {
                console.log("ℹ️  DATABASE_URL Empty, Using SQLite");
                const dbDir = path.dirname(DEFAULT_SQLITE_PATH);
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                DatabaseManager.instance = new Sequelize({
                    dialect: "sqlite",
                    storage: DEFAULT_SQLITE_PATH,
                    logging: false,
                    pool: {
                        max: 1,
                        min: 0,
                        acquire: 30000,
                        idle: 10000,
                    },
                    retry: {
                        max: 5,
                    },
                    dialectOptions: {
                        busyTimeout: 30000,
                    },
                });
            } else {
                console.log("📦 Using PostgreSQL Database");
                DatabaseManager.instance = new Sequelize(DATABASE_URL, {
                    dialect: "postgres",
                    protocol: "postgres",
                    dialectOptions: {
                        ssl: { require: true, rejectUnauthorized: false },
                    },
                    logging: false,
                    pool: {
                        max: 5,
                        min: 0,
                        acquire: 30000,
                        idle: 10000,
                    },
                });
            }
        }
        return DatabaseManager.instance;
    }
}

const DATABASE = DatabaseManager.getInstance();

async function syncDatabase(force = false) {
    try {
        // If force is true, drop all tables first
        if (force) {
            console.log("⚠️  Force sync enabled - dropping all tables...");
            await DATABASE.query(`
                DROP TABLE IF EXISTS "bad_words" CASCADE;
                DROP TABLE IF EXISTS "settings" CASCADE;
                DROP TABLE IF EXISTS "group_settings" CASCADE;
                DROP TABLE IF EXISTS "sudo" CASCADE;
                DROP TABLE IF EXISTS "games" CASCADE;
                DROP TABLE IF EXISTS "notes" CASCADE;
            `).catch(() => {});
            console.log("✅ Old tables dropped");
        }
        
        await DATABASE.sync({ alter: !force, force: force });
        console.log("✅ Database Synchronized.");
        return true;
    } catch (error) {
        console.error("Error synchronizing the database:", error.message);
        
        // Try to fix common column issues
        if (error.message.includes('column "groupJid" does not exist')) {
            console.log("🔧 Attempting to fix missing column...");
            try {
                await DATABASE.query(`ALTER TABLE "bad_words" ADD COLUMN "groupJid" VARCHAR(255);`).catch(() => {});
                await DATABASE.query(`ALTER TABLE "bad_words" ADD COLUMN "word" VARCHAR(255);`).catch(() => {});
                console.log("✅ Fixed missing columns");
                await DATABASE.sync({ alter: true });
                return true;
            } catch (fixError) {
                console.error("❌ Could not fix automatically:", fixError.message);
            }
        }
        throw error;
    }
}

// Add a function to check database connection
async function checkDatabase() {
    try {
        await DATABASE.authenticate();
        console.log("✅ Database connection established");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        return false;
    }
}

module.exports = { DATABASE, syncDatabase, checkDatabase };
