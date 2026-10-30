const Database = require('better-sqlite3');

const db = new Database('database.db');
db.pragma('journal_mode = WAL');

// Membuat tabel readings sesuai spesifikasi 3.1
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    suhu REAL NOT NULL,
    kelembapan REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableQuery);

console.log('Database dan tabel readings berhasil disiapkan.');

module.exports = db;