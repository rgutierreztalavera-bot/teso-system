const fs = require('fs');

function escape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readFile(path) {
  try { return fs.readFileSync(path, 'utf8'); }
  catch(e) { return '// FILE NOT FOUND: ' + path; }
}

const files = [
  { num: 1,  label: 'src/constants.ts', path: 'src/constants.ts' },
  { num: 2,  label: 'src/contexts/SettingsContext.tsx', path: 'src/contexts/SettingsContext.tsx' },
  { num: 3,  label: 'src/data/tesoDemo.ts', path: 'src/data/tesoDemo.ts' },
  { num: 4,  label: 'src/components/TesoButton.tsx', path: 'src/components/TesoButton.tsx' },
  { num: 5,  label: 'src/components/TesoHosting.tsx', path: 'src/components/TesoHosting.tsx' },
  { num: 6,  label: 'src/components/TengoPage.tsx', path: 'src/components/TengoPage.tsx' },
  { num: 7,  label: 'src/components/QuieroPage.tsx', path: 'src/components/QuieroPage.tsx' },
  { num: 8,  label: 'src/components/CompartirPage.tsx', path: 'src/components/CompartirPage.tsx' },
  { num: 9,  label: 'src/components/LandingPage.tsx', path: 'src/components/LandingPage.tsx' },
  { num: 10, label: 'src/components/ZonasPage.tsx', path: 'src/components/ZonasPage.tsx' },
  { num: 11, label: 'src/components/MapHostingButtons.tsx', path: 'src/components/MapHostingButtons.tsx' },
  { num: 12, label: 'src/components/PlanoEmpresaPage.tsx', path: 'src/components/PlanoEmpresaPage.tsx' },
  { num: 13, label: 'src/App.tsx', path: 'src/App.tsx' },
];

const index = files.map(f => '  ' + f.num + '. ' + f.label).join('\n');

const blocks = files.map(f => {
  const code = readFile(f.path);
  return [
    '================================================================================',
    'FILE ' + f.num + ': ' + f.label,
    '================================================================================',
    code,
  ].join('\n');
}).join('\n\n');

const fullText = [
  '================================================================================',
  'TESO SYSTEM — CODE EXPORT V3',
  'Fecha: 2026-04-06',
  'Archivos incluidos: ' + files.length + ' archivos',
  '================================================================================',
  '',
  'ÍNDICE:',
  index,
  '',
  blocks,
].join('\n');

const textareaContent = escape(fullText);

const copyIconPath = 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10';
const checkIconPath = 'M5 13l4 4L19 7';

const copyIcon = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${copyIconPath}"/></svg>`;
const checkIcon = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${checkIconPath}"/></svg>`;

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TESO CODE EXPORT V3</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #e5e5e5; font-family: 'Courier New', monospace; padding: 20px; display: flex; flex-direction: column; height: 100vh; gap: 14px; }
  h1 { color: #D4AF37; font-size: 18px; letter-spacing: 3px; }
  .sub { color: #555; font-size: 11px; margin-top: 3px; }
  .top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .badge { background: #1a1a1a; border: 1px solid #333; color: #D4AF37; font-size: 11px; padding: 3px 10px; border-radius: 4px; letter-spacing: 1px; }
  .copy-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #D4AF37; color: #000; border: none; padding: 12px 24px;
    font-family: 'Courier New', monospace; font-size: 13px; font-weight: 900;
    letter-spacing: 2px; cursor: pointer; border-radius: 8px; transition: all 0.2s;
  }
  .copy-btn:hover { background: #f0cc55; }
  .copy-btn:active { transform: scale(0.97); }
  .copy-btn.copied { background: #228B22; color: #fff; }
  textarea {
    flex: 1; width: 100%;
    background: #111; color: #d4d4d4;
    border: 1px solid #222; border-radius: 8px;
    padding: 16px; font-family: 'Courier New', monospace;
    font-size: 11.5px; line-height: 1.6; resize: none; outline: none;
  }
  textarea:focus { border-color: #D4AF37; }
</style>
</head>
<body>

<div class="top">
  <div>
    <h1>TESO SYSTEM — CODE EXPORT V3</h1>
    <p class="sub">Pulsa el botón para copiar todo, o selecciona y copia manualmente</p>
  </div>
  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
    <span class="badge">${files.length} ARCHIVOS</span>
    <button class="copy-btn" id="copyBtn" onclick="copyAll()">
      ${copyIcon} COPIAR TODO
    </button>
  </div>
</div>

<textarea id="codeArea" readonly spellcheck="false">${textareaContent}</textarea>

<script>
var copyIcon = '${copyIcon.replace(/'/g, "\\'")} COPIAR TODO';
var checkIcon = '${checkIcon.replace(/'/g, "\\'")} COPIADO ✓';
function copyAll() {
  var ta = document.getElementById('codeArea');
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  var btn = document.getElementById('copyBtn');
  function markDone() {
    btn.classList.add('copied');
    btn.innerHTML = checkIcon;
    setTimeout(function() {
      btn.classList.remove('copied');
      btn.innerHTML = copyIcon;
    }, 3000);
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(ta.value).then(markDone).catch(function() {
      document.execCommand('copy'); markDone();
    });
  } else {
    document.execCommand('copy'); markDone();
  }
}
</script>
</body>
</html>`;

fs.writeFileSync('public/teso-export.html', html);
console.log('Done. Size:', html.length, 'chars, lines:', html.split('\n').length);
