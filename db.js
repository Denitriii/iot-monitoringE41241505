const Database = require('better-sqlite3');

// Membuka/membuat database SQLite
const db = new Database('monitoringSuhudanKelembapan.db');

// Mengaktifkan WAL mode untuk performa yang lebih baik (opsional)
db.pragma('journal_mode = WAL');

// Membuat tabel readings jika belum ada
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    status TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableQuery);

console.log('Database dan tabel readings berhasil disiapkan.');

module.exports = db;