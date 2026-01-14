const fs = require('fs');
const path = require('path');

const possibleSrc = [
  path.resolve(__dirname, '..', '.next', 'output', 'public'),
  path.resolve(__dirname, '..', '.next', 'output', 'export'),
  path.resolve(__dirname, '..', '.next', 'output', 'static'),
  path.resolve(__dirname, '..', '.next', 'export'),
  path.resolve(__dirname, '..', 'out'),
];
const dest = path.resolve(__dirname, '..', 'out');

let src = null;
for (const p of possibleSrc) {
  if (fs.existsSync(p)) {
    src = p;
    break;
  }
}

if (!src) {
  console.error('Source not found. Checked locations:');
  for (const p of possibleSrc) console.error(' -', p);
  process.exit(1);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.error(`Source not found: ${srcDir}`);
    process.exit(1);
  }
  fs.mkdirSync(destDir, { recursive: true });
  for (const item of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, item);
    const d = path.join(destDir, item);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

try {
  copyDir(src, dest);
  console.log('Export copied to out/');
} catch (err) {
  console.error('Failed to copy export:', err);
  process.exit(1);
}
