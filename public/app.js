// const API = '';                 // kosong = origin yang sama (server Express)
// const REFRESH_MS = 5000;
// const OFFLINE_AFTER_S = 30;
// const HOT_THRESHOLD = 35;
// const DEMO_MODE = false;        // true = pakai data palsu untuk preview tanpa backend
 
// const $ = (id) => document.getElementById(id);
 
// // SQLite CURRENT_TIMESTAMP = UTC "YYYY-MM-DD HH:MM:SS" -> jadikan Date yang benar
// function parseDbTime(str) {
//   if (!str) return null;
//   const iso = str.includes('T') ? str : str.replace(' ', 'T') + 'Z';
//   const d = new Date(iso);
//   return isNaN(d) ? null : d;
// }
// const fmtTime = (d) => d ? d.toLocaleTimeString('id-ID', { hour12: false }) : '--:--:--';
// const fmtNum = (v, n = 1) => (typeof v === 'number' ? v.toFixed(n) : '--');
 
// // ---------- Chart ----------
// const chart = new Chart($('readingsChart'), {
//   type: 'line',
//   data: {
//     labels: [],
//     datasets: [
//       {
//         label: 'Suhu (°C)',
//         data: [],
//         borderColor: '#f97316',
//         backgroundColor: 'rgba(249,115,22,.15)',
//         tension: 0.4, fill: true, pointRadius: 3, yAxisID: 'y',
//       },
//       {
//         label: 'Kelembapan (%)',
//         data: [],
//         borderColor: '#38bdf8',
//         backgroundColor: 'rgba(56,189,248,.12)',
//         tension: 0.4, fill: true, pointRadius: 3, yAxisID: 'y1',
//       },
//     ],
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: { mode: 'index', intersect: false },
//     plugins: { legend: { labels: { color: '#c3cce0', usePointStyle: true } } },
//     scales: {
//       x:  { ticks: { color: '#8b97ad', maxRotation: 0 }, grid: { color: 'rgba(255,255,255,.05)' } },
//       y:  { position: 'left',  title: { display: true, text: '°C', color: '#f97316' },
//             ticks: { color: '#8b97ad' }, grid: { color: 'rgba(255,255,255,.05)' } },
//       y1: { position: 'right', title: { display: true, text: '%', color: '#38bdf8' },
//             ticks: { color: '#8b97ad' }, grid: { drawOnChartArea: false } },
//     },
//   },
// });
 
// // ---------- Data ----------
// async function getJSON(url) {
//   const res = await fetch(API + url);
//   if (!res.ok) throw new Error(url + ' -> ' + res.status);
//   return res.json();
// }
 
// function demoReading(i = 0) {
//   return {
//     id: Date.now() + i,
//     device_id: 'GH-01',
//     suhu: +(25 + Math.random() * 12).toFixed(1),
//     kelembapan: +(60 + Math.random() * 25).toFixed(1),
//     created_at: new Date(Date.now() - i * 5000).toISOString().slice(0, 19).replace('T', ' '),
//   };
// }
 
// // ---------- Render ----------
// function renderLatest(r) {
//   if (!r) return;
//   const t = parseDbTime(r.created_at);
 
//   $('suhuValue').textContent = fmtNum(r.suhu);
//   $('humValue').textContent = fmtNum(r.kelembapan);
//   $('suhuTime').textContent = fmtTime(t);
//   $('humTime').textContent = fmtTime(t);
//   $('deviceId').textContent = r.device_id || '-';
//   $('humBar').style.width = Math.max(0, Math.min(100, r.kelembapan)) + '%';
 
//   const hot = r.suhu > HOT_THRESHOLD;
//   const card = $('cardSuhu');
//   card.classList.toggle('panas', hot);
//   card.classList.toggle('normal', !hot);
//   $('suhuBadge').textContent = hot ? 'Panas' : 'Normal';
 
//   // Status perangkat
//   const online = t && (Date.now() - t.getTime()) / 1000 < OFFLINE_AFTER_S;
//   setStatus(!!online);
// }
 
// function setStatus(online) {
//   const el = $('deviceStatus');
//   el.classList.toggle('online', online);
//   el.classList.toggle('offline', !online);
//   $('deviceStatusText').textContent = online ? 'Online' : 'Offline';
// }
 
// function renderChart(rows) {
//   chart.data.labels = rows.map((r) => fmtTime(parseDbTime(r.created_at)));
//   chart.data.datasets[0].data = rows.map((r) => r.suhu);
//   chart.data.datasets[1].data = rows.map((r) => r.kelembapan);
//   chart.update();
// }
 
// function renderTable(rows) {
//   const last10 = rows.slice(-10).reverse(); // terbaru di atas
//   if (!last10.length) {
//     $('historyBody').innerHTML = '<tr><td colspan="5" class="empty">Belum ada data</td></tr>';
//     return;
//   }
//   $('historyBody').innerHTML = last10.map((r) => `
//     <tr>
//       <td>${r.id}</td>
//       <td>${r.device_id}</td>
//       <td class="${r.suhu > HOT_THRESHOLD ? 'hot' : ''}">${fmtNum(r.suhu)}</td>
//       <td>${fmtNum(r.kelembapan)}</td>
//       <td>${fmtTime(parseDbTime(r.created_at))}</td>
//     </tr>`).join('');
// }
 
// // Bentuk respons /api/stats yang diharapkan (sesuaikan dengan punya temanmu):
// // { avg_suhu, min_suhu, max_suhu, avg_kelembapan, min_kelembapan, max_kelembapan }
// function renderStats(s) {
//   if (!s || !$('sAvgSuhu')) return; // card statistik opsional
//   $('sAvgSuhu').textContent = fmtNum(s.avg_suhu);
//   $('sMinSuhu').textContent = fmtNum(s.min_suhu);
//   $('sMaxSuhu').textContent = fmtNum(s.max_suhu);
//   $('sAvgHum').textContent  = fmtNum(s.avg_kelembapan);
//   $('sMinHum').textContent  = fmtNum(s.min_kelembapan);
//   $('sMaxHum').textContent  = fmtNum(s.max_kelembapan);
// }
 
// // ---------- Loop utama ----------
// async function refresh() {
//   try {
//     let latest, rows, stats = null;
 
//     if (DEMO_MODE) {
//       rows = Array.from({ length: 20 }, (_, i) => demoReading(19 - i));
//       latest = rows[rows.length - 1];
//     } else {
//       [latest, rows] = await Promise.all([
//         getJSON('/api/readings/latest').catch(() => null), // 404 = belum ada data
//         getJSON('/api/readings?limit=20'),
//       ]);
//       if (!latest) setStatus(false);
//       try { stats = await getJSON('/api/stats'); } catch (_) { /* opsional */ }
//     }
 
//     // urutkan lama -> baru (berapa pun urutan dari server)
//     rows.sort((a, b) => a.id - b.id);
 
//     renderLatest(latest);
//     renderChart(rows);
//     renderTable(rows);
//     renderStats(stats);
//   } catch (err) {
//     console.error('Gagal mengambil data:', err);
//     setStatus(false);
//   }
// }
 
// refresh();
// setInterval(refresh, REFRESH_MS);


// public/app.js — logika dashboard (fetch + Chart.js + polling 5 detik)
 
const API = '';                 // kosong = origin yang sama (server Express)
const REFRESH_MS = 5000;
const OFFLINE_AFTER_S = 30;
const HOT_THRESHOLD = 35;
const DEMO_MODE = false;        // true = pakai data palsu untuk preview tanpa backend
 
const $ = (id) => document.getElementById(id);
 
// SQLite CURRENT_TIMESTAMP = UTC "YYYY-MM-DD HH:MM:SS" -> jadikan Date yang benar
function parseDbTime(str) {
  if (!str) return null;
  const iso = str.includes('T') ? str : str.replace(' ', 'T') + 'Z';
  const d = new Date(iso);
  return isNaN(d) ? null : d;
}
const fmtTime = (d) => d ? d.toLocaleTimeString('id-ID', { hour12: false }) : '--:--:--';
const fmtNum = (v, n = 1) => (typeof v === 'number' ? v.toFixed(n) : '--');
 
// ---------- Chart ----------
const chart = new Chart($('readingsChart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Suhu (°C)',
        data: [],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,.15)',
        tension: 0.4, fill: true, pointRadius: 3, yAxisID: 'y',
      },
      {
        label: 'Kelembapan (%)',
        data: [],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,.12)',
        tension: 0.4, fill: true, pointRadius: 3, yAxisID: 'y1',
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#c3cce0', usePointStyle: true } } },
    scales: {
      x:  { ticks: { color: '#8b97ad', maxRotation: 0 }, grid: { color: 'rgba(255,255,255,.05)' } },
      y:  { position: 'left',  title: { display: true, text: '°C', color: '#f97316' },
            ticks: { color: '#8b97ad' }, grid: { color: 'rgba(255,255,255,.05)' } },
      y1: { position: 'right', title: { display: true, text: '%', color: '#38bdf8' },
            ticks: { color: '#8b97ad' }, grid: { drawOnChartArea: false } },
    },
  },
});
 
// ---------- Data ----------
async function getJSON(url) {
  const res = await fetch(API + url);
  if (!res.ok) throw new Error(url + ' -> ' + res.status);
  return res.json();
}
 
function demoReading(i = 0) {
  return {
    id: Date.now() + i,
    device_id: 'GH-01',
    suhu: +(25 + Math.random() * 12).toFixed(1),
    kelembapan: +(60 + Math.random() * 25).toFixed(1),
    created_at: new Date(Date.now() - i * 5000).toISOString().slice(0, 19).replace('T', ' '),
  };
}
 
// ---------- Render ----------
function renderLatest(r) {
  if (!r) return;
  const t = parseDbTime(r.created_at);
 
  $('suhuValue').textContent = fmtNum(r.suhu);
  $('humValue').textContent = fmtNum(r.kelembapan);
  $('suhuTime').textContent = fmtTime(t);
  $('humTime').textContent = fmtTime(t);
  $('deviceId').textContent = r.device_id || '-';
  $('humBar').style.width = Math.max(0, Math.min(100, r.kelembapan)) + '%';
 
  const hot = r.suhu > HOT_THRESHOLD;
  const card = $('cardSuhu');
  card.classList.toggle('panas', hot);
  card.classList.toggle('normal', !hot);
  $('suhuBadge').textContent = hot ? 'Panas' : 'Normal';
 
  // Status perangkat
  const online = t && (Date.now() - t.getTime()) / 1000 < OFFLINE_AFTER_S;
  lastDataTime = t;
  setStatus(!!online, 'device');
}
 
let lastDataTime = null; // waktu data terakhir yang pernah diterima
 
function timeAgo(d) {
  const s = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return s + ' detik lalu';
  if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
  return Math.floor(s / 86400) + ' hari lalu';
}
 
const OFFLINE_MSG = {
  device: ['Perangkat offline',
           'Tidak ada data masuk lebih dari 30 detik. Simulasi Wokwi kemungkinan tidak berjalan: buka Wokwi lalu klik tombol Start (hijau).'],
  empty:  ['Belum ada data',
           'Database masih kosong. Jalankan simulasi Wokwi agar data pertama masuk.'],
  server: ['Tidak dapat terhubung ke server',
           'Pastikan node server.js (dan ngrok jika memakai Wokwi) masih berjalan.'],
};
 
function updateLastSeen() {
  $('lastSeen').textContent = lastDataTime
    ? `${fmtTime(lastDataTime)} (${timeAgo(lastDataTime)})`
    : 'Belum ada';
}
 
function setStatus(online, reason = 'device') {
  const el = $('deviceStatus');
  el.classList.toggle('online', online);
  el.classList.toggle('offline', !online);
  $('deviceStatusText').textContent = online ? 'Online' : 'Offline';
 
  document.body.classList.toggle('is-offline', !online);
  $('offlineBanner').hidden = online;
  if (!online) {
    const [title, desc] = OFFLINE_MSG[reason] || OFFLINE_MSG.device;
    $('offlineTitle').textContent = title;
    $('offlineDesc').textContent = desc;
    updateLastSeen();
  }
}
 
function renderChart(rows) {
  chart.data.labels = rows.map((r) => fmtTime(parseDbTime(r.created_at)));
  chart.data.datasets[0].data = rows.map((r) => r.suhu);
  chart.data.datasets[1].data = rows.map((r) => r.kelembapan);
  chart.update();
}
 
function renderTable(rows) {
  const last10 = rows.slice(-10).reverse(); // terbaru di atas
  if (!last10.length) {
    $('historyBody').innerHTML = '<tr><td colspan="5" class="empty">Belum ada data</td></tr>';
    return;
  }
  $('historyBody').innerHTML = last10.map((r) => `
    <tr>
      <td>${r.id}</td>
      <td>${r.device_id}</td>
      <td class="${r.suhu > HOT_THRESHOLD ? 'hot' : ''}">${fmtNum(r.suhu)}</td>
      <td>${fmtNum(r.kelembapan)}</td>
      <td>${fmtTime(parseDbTime(r.created_at))}</td>
    </tr>`).join('');
}
 
// Bentuk respons /api/stats yang diharapkan (sesuaikan dengan punya temanmu):
// { avg_suhu, min_suhu, max_suhu, avg_kelembapan, min_kelembapan, max_kelembapan }
function renderStats(s) {
  if (!s || !$('sAvgSuhu')) return; // card statistik opsional
  $('sAvgSuhu').textContent = fmtNum(s.avg_suhu);
  $('sMinSuhu').textContent = fmtNum(s.min_suhu);
  $('sMaxSuhu').textContent = fmtNum(s.max_suhu);
  $('sAvgHum').textContent  = fmtNum(s.avg_kelembapan);
  $('sMinHum').textContent  = fmtNum(s.min_kelembapan);
  $('sMaxHum').textContent  = fmtNum(s.max_kelembapan);
}
 
// ---------- Loop utama ----------
async function refresh() {
  try {
    let latest, rows, stats = null;
 
    if (DEMO_MODE) {
      rows = Array.from({ length: 20 }, (_, i) => demoReading(19 - i));
      latest = rows[rows.length - 1];
    } else {
      [latest, rows] = await Promise.all([
        getJSON('/api/readings/latest').catch(() => null), // 404 = belum ada data
        getJSON('/api/readings?limit=20'),
      ]);
      if (!latest) setStatus(false, 'empty');
      try { stats = await getJSON('/api/stats'); } catch (_) { /* opsional */ }
    }
 
    // urutkan lama -> baru (berapa pun urutan dari server)
    rows.sort((a, b) => a.id - b.id);
 
    renderLatest(latest);
    renderChart(rows);
    renderTable(rows);
    renderStats(stats);
  } catch (err) {
    console.error('Gagal mengambil data:', err);
    setStatus(false, 'server');
  }
}
 
refresh();
setInterval(refresh, REFRESH_MS);
 
// Perbarui keterangan "x detik lalu" tiap detik saat offline
setInterval(() => {
  if (document.body.classList.contains('is-offline')) updateLastSeen();
}, 1000);
 