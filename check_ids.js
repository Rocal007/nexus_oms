import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('partners.js', 'utf8');

const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
while ((match = regex.exec(js)) !== null) {
  const id = match[1];
  if (!html.includes('id="' + id + '"')) {
    console.log('MISSING ID IN HTML:', id);
  }
}
console.log('Check finished.');
