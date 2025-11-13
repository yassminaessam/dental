const fetch = global.fetch || (await import('node-fetch')).default;

const BASE_URL = process.env.BASE_URL || 'http://localhost:9002';

async function probe(url, { method = 'GET', body, headers } = {}) {
  try {
    const res = await fetch(url, { method, body, headers });
    const text = await res.text();
    console.log(`${url} -> ${res.status}`);
    console.log(text.slice(0, 300));
    return res.ok;
  } catch (e) {
    console.error(`${url} -> ERR ${e.message}`);
    return false;
  }
}

async function retry(fn, { attempts = 5, delayMs = 1000, label = '' } = {}) {
  let lastOk = false;
  for (let i = 1; i <= attempts; i++) {
    if (i > 1) await new Promise(r => setTimeout(r, delayMs));
    lastOk = await fn(i);
    if (lastOk) return true;
    console.log(label ? `${label}: retry ${i}/${attempts}` : `retry ${i}/${attempts}`);
  }
  return false;
}

(async () => {
  const healthUrl = `${BASE_URL}/api/health`;
  await retry(() => probe(healthUrl), { attempts: 10, delayMs: 750, label: 'health' });

  await probe(`${BASE_URL}/api/clinical-images`);
  await probe(`${BASE_URL}/api/medical-records`);
  await probe(`${BASE_URL}/api/dental-charts?patientId=foo`);
})();
