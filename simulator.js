// simulator.js -> jalankan: node simulator.js
const URL = 'http://localhost:3000/api/readings';

async function kirimData() {
  const data = {
    device_id: 'GH-01',
    suhu: +(25 + Math.random() * 12).toFixed(1), // 25-37 °C
    kelembapan: +(60 + Math.random() * 25).toFixed(1), // 60-85 %
  };

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    console.log(`[${new Date().toLocaleString('id-ID')}] ${res.status} ${JSON.stringify(body)}`);
  } catch (err) {
    console.error(`[${new Date().toLocaleString('id-ID')}] Gagal mengirim: ${err.message}`);
  }
}

kirimData();
setInterval(kirimData, 5000);