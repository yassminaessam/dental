import fs from 'fs';
import path from 'path';

async function main() {
  const filePath = path.join(process.cwd(), 'public', 'sample-test.png');
  if (!fs.existsSync(filePath)) {
    console.error('Sample file missing at', filePath);
    process.exit(1);
  }
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/png' });
  const form = new FormData();
  form.append('file', blob, 'sample-test.png');
  form.append('category', 'clinical-images');
  form.append('patientId', 'testpatient');
  form.append('imageType', 'xray');

  const res = await fetch('http://localhost:9002/api/uploads', { method: 'POST', body: form });
  const text = await res.text();
  console.log('Raw response:', text);
  let data;
  try { data = JSON.parse(text); } catch { console.error('Failed to parse JSON'); process.exit(1); }
  console.log('Parsed URL:', data.url);
  const localPath = path.join(process.cwd(), 'public', data.url.replace(/^\//, ''));
  console.log('Local path should exist:', localPath, fs.existsSync(localPath));
}

main().catch(e => { console.error(e); process.exit(1); });
