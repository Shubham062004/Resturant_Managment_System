import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(f => {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(p);
    } else if (f.name.match(/\.(ts|tsx)$/)) {
      const c = fs.readFileSync(p, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(c)) !== null) {
        const imp = match[1];
        if (!imp.startsWith('.') && !imp.startsWith('@/') && imp.toLowerCase() !== imp) {
          console.log('UPPERCASE IMPORT:', p, imp);
        }
      }
    }
  });
}

walk('src');
