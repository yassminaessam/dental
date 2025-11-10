// Simple WCAG contrast audit for CardIcon variants
// Computes contrast on composited backgrounds (over white for light; over dark slate for dark)

function hexToRgb(hex){
  const v = hex.replace('#','');
  const bigint = parseInt(v,16);
  return {r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255};
}
function srgbToLinear(c){ c/=255; return c<=0.04045? c/12.92: Math.pow((c+0.055)/1.055,2.4); }
function luminance({r,g,b}){ const R=srgbToLinear(r),G=srgbToLinear(g),B=srgbToLinear(b); return 0.2126*R+0.7152*G+0.0722*B; }
function contrast(c1,c2){ const L1=luminance(c1), L2=luminance(c2); const [a,b] = L1>L2? [L1,L2]: [L2,L1]; return (a+0.05)/(b+0.05); }
function clamp(x, min=0, max=255){ return Math.max(min, Math.min(max, x)); }
function compositeRGBAover(rgbBg, rgba, base){
  const a = rgba.a; const inv = 1-a;
  const r = Math.round(a*rgba.r + inv*base.r);
  const g = Math.round(a*rgba.g + inv*base.g);
  const b = Math.round(a*rgba.b + inv*base.b);
  return {r:clamp(r), g:clamp(g), b:clamp(b)};
}

// Variants from CardIcon
const variants = {
  blue:   { bg:{r:173,g:216,b:230,a:0.20}, fg:'#0D5E7A', darkBg:{r:173,g:216,b:230,a:0.15}, darkFg:'#7fd3ec' },
  pink:   { bg:{r:255,g:182,b:193,a:0.20}, fg:'#A81842', darkBg:{r:255,g:182,b:193,a:0.15}, darkFg:'#f9b7c4' },
  green:  { bg:{r:144,g:238,b:144,a:0.20}, fg:'#2E7D32', darkBg:{r:144,g:238,b:144,a:0.15}, darkFg:'#6fe57a' },
  orange: { bg:{r:255,g:200,b:150,a:0.20}, fg:'#9a3412', darkBg:{r:255,g:200,b:150,a:0.15}, darkFg:'#fdba74' },
  purple: { bg:{r:216,g:191,b:216,a:0.20}, fg:'#6b21a8', darkBg:{r:216,g:191,b:216,a:0.15}, darkFg:'#d8b4fe' },
  red:    { bg:{r:255,g:153,b:153,a:0.20}, fg:'#991b1b', darkBg:{r:255,g:153,b:153,a:0.15}, darkFg:'#fecaca' },
  neutral:{ bg:{r:107,g:114,b:128,a:0.15}, fg:'#374151', darkBg:{r:107,g:114,b:128,a:0.12}, darkFg:'#d1d5db' },
};

const lightBase = {r:255,g:255,b:255};
const darkBase = {r:15,g:23,b:42}; // Tailwind slate-900 proxy

console.log('Contrast audit (icons vs icon-wrapper backgrounds)');
console.log('Threshold guideline: 3.0:1 for non-text icons');

for(const [name,v] of Object.entries(variants)){
  const bgLight = compositeRGBAover(null, v.bg, lightBase);
  const fgLight = hexToRgb(v.fg);
  const crLight = contrast(fgLight, bgLight).toFixed(2);

  const bgDark = compositeRGBAover(null, v.darkBg, darkBase);
  const fgDark = hexToRgb(v.darkFg);
  const crDark = contrast(fgDark, bgDark).toFixed(2);

  const warnL = Number(crLight) < 3 ? '⚠' : '✓';
  const warnD = Number(crDark) < 3 ? '⚠' : '✓';

  console.log(`${name.padEnd(7)} | light: ${crLight} ${warnL} | dark: ${crDark} ${warnD}`);
}
