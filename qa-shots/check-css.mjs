import fs from 'node:fs';

const css = fs.readFileSync('app/globals.css', 'utf8');
let depth = 0;
let inComment = false;
let inString = false;
let stringChar = '';
const lines = css.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    const next = line[j + 1];
    if (inComment) {
      if (c === '*' && next === '/') {
        inComment = false;
        j++;
      }
      continue;
    }
    if (inString) {
      if (c === '\\') { j++; continue; }
      if (c === stringChar) { inString = false; }
      continue;
    }
    if (c === '/' && next === '*') {
      inComment = true;
      j++;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      stringChar = c;
      continue;
    }
    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth < 0) {
        console.log('Unmatched closing brace at line', i + 1, 'col', j + 1);
        process.exit(1);
      }
    }
  }
}
console.log('Finished. Final depth:', depth);
