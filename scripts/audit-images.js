const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else {
      results.push({ path: full, size: stat.size });
    }
  });
  return results;
}

const pubFiles = getFiles('public');
const imgFiles = pubFiles.filter(f => f.path.match(/\.(png|jpg|jpeg|webp|svg|gif|avif)$/i));

console.log('Total images in public/:', imgFiles.length);
let totalBytes = 0;
const byFolder = {};

imgFiles.forEach(f => {
  totalBytes += f.size;
  const rel = path.relative('public', f.path);
  const topFolder = rel.split(path.sep)[0];
  byFolder[topFolder] = (byFolder[topFolder] || 0) + f.size;
});

console.log('Total image payload in public/:', (totalBytes / (1024 * 1024)).toFixed(2), 'MB');
console.log('\nSize by folder:');
Object.entries(byFolder).forEach(([folder, size]) => {
  console.log(` - ${folder}: ${(size / (1024 * 1024)).toFixed(2)} MB`);
});

console.log('\nTop 20 largest images:');
imgFiles.sort((a, b) => b.size - a.size).slice(0, 20).forEach(f => {
  console.log(` - ${(f.size / (1024 * 1024)).toFixed(2)} MB : ${f.path}`);
});
