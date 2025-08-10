const fs = require('fs');
const path = require('path');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function extractLangBody(src, lang) {
  const startIdx = src.indexOf(`${lang}:`);
  if (startIdx === -1) throw new Error(`Language section not found: ${lang}`);
  const braceStart = src.indexOf('{', startIdx);
  if (braceStart === -1) throw new Error(`Opening brace not found for ${lang}`);
  let i = braceStart + 1;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  const body = src.slice(braceStart + 1, i - 1);
  return { body, endIndex: i };
}

function extractKeys(body) {
  const rx = /'([^']+)'\s*:/g;
  const keys = new Set();
  let m;
  while ((m = rx.exec(body))) keys.add(m[1]);
  return keys;
}

(function main() {
  const root = path.resolve(__dirname, '..');
  const srcDir = path.join(root, 'src');
  const ctxFile = path.join(srcDir, 'contexts', 'LanguageContext.tsx');
  const content = read(ctxFile);
  const en = extractLangBody(content, 'en');
  const ar = extractLangBody(content, 'ar');
  const enKeys = extractKeys(en.body);
  const arKeys = extractKeys(ar.body);

  const files = listFiles(srcDir);
  const usedKeys = new Set();
  const useRx = /\bt\(\s*['"]([^'\"]+)['"]/g;
  for (const f of files) {
    const txt = read(f);
    let m;
    while ((m = useRx.exec(txt))) usedKeys.add(m[1]);
  }

  function diff(a, b) {
    return [...a].filter(k => !b.has(k)).sort();
  }

  const missingInEn = diff(usedKeys, enKeys);
  const missingInAr = diff(usedKeys, arKeys);
  const enNotInAr = diff(enKeys, arKeys);
  const arNotInEn = diff(arKeys, enKeys);

  const report = {
    counts: {
      used: usedKeys.size,
      en: enKeys.size,
      ar: arKeys.size,
      missingInEn: missingInEn.length,
      missingInAr: missingInAr.length,
      enNotInAr: enNotInAr.length,
      arNotInEn: arNotInEn.length,
    },
    missingInEn: missingInEn.slice(0, 100),
    missingInAr: missingInAr.slice(0, 100),
    enNotInAr: enNotInAr.slice(0, 100),
    arNotInEn: arNotInEn.slice(0, 100),
  };

  console.log(JSON.stringify(report, null, 2));
})();
