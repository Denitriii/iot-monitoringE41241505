const express = require('express');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

app.post('/api/readings', (req, res) => {
  const device_id = req.body.device_id === undefined ? 'GH-01' : req.body.device_id;
  const { suhu, kelembapan } = req.body;

  if (typeof device_id !== 'string' || device_id.trim() === '') {
    return res.status(400).json({ error: 'device_id harus berupa teks yang tidak kosong' });
  }
  if (!isValidNumber(suhu) || !isValidNumber(kelembapan)) {
    return res.status(400).json({ error: 'suhu dan kelembapan harus berupa angka' });
  }
  if (suhu < -40 || suhu > 80) {
    return res.status(400).json({ error: 'suhu harus berada di antara -40 dan 80 derajat Celsius' });
  }
  if (kelembapan < 0 || kelembapan > 100) {
    return res.status(400).json({ error: 'kelembapan harus berada di antara 0 dan 100 persen' });
  }

  const info = db
    .prepare('INSERT INTO readings (device_id, suhu, kelembapan) VALUES (?, ?, ?)')
    .run(device_id.trim(), suhu, kelembapan);

  const row = db.prepare('SELECT * FROM readings WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json(row);
});

app.get('/api/readings/latest', (req, res) => {
  const row = db.prepare('SELECT * FROM readings ORDER BY id DESC LIMIT 1').get();
  if (!row) {
    return res.status(404).json({ error: 'Belum ada data' });
  }
  return res.json(row);
});

app.get('/api/readings', (req, res) => {
  let limit = parseInt(req.query.limit, 10);
  if (Number.isNaN(limit)) limit = 20;
  limit = Math.max(1, Math.min(100, limit));
  const rows = db.prepare('SELECT * FROM readings ORDER BY id DESC LIMIT ?').all(limit);
  return res.json(rows);
});

app.get('/api/stats', (req, res) => {
  const row = db.prepare(
    `SELECT COUNT(*) AS count,
            AVG(suhu) AS avg_suhu, MIN(suhu) AS min_suhu, MAX(suhu) AS max_suhu,
            AVG(kelembapan) AS avg_kelembapan, MIN(kelembapan) AS min_kelembapan, MAX(kelembapan) AS max_kelembapan
     FROM readings`
  ).get();
  const round1 = (value) => (value === null ? null : Number(value.toFixed(1)));
  return res.json({
    count: row.count,
    avg_suhu: round1(row.avg_suhu),
    min_suhu: row.min_suhu,
    max_suhu: row.max_suhu,
    avg_kelembapan: round1(row.avg_kelembapan),
    min_kelembapan: row.min_kelembapan,
    max_kelembapan: row.max_kelembapan,
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
