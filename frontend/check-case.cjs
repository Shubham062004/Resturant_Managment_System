const fs = require('fs');
const path = require('path');

function checkDir(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach((f) => {
    const p = path.join(d, f.name);
    if (f.isDirectory()) {
      checkDir(p);
    } else if (f.name.match(/\.(ts|tsx)$/)) {
      const c = fs.readFileSync(p, 'utf8');
      const m = [...c.matchAll(/from\s+['"](\.[^'"]+)['"]/g)];
      m.forEach((match) => {
        const imp = match[1];
        const resolved = path.resolve(d, imp);
        const dir = path.dirname(resolved);
        if (fs.existsSync(dir)) {
          const items = fs.readdirSync(dir);
          const base = path.basename(resolved);
          const found = items.find(
            (i) =>
              i === base ||
              i === base + '.ts' ||
              i === base + '.tsx' ||
              i === base + '.js' ||
              i === base + '.css' ||
              i === base + '/index.ts' ||
              i === base + '/index.tsx',
          );
          if (!found) {
            console.log('Case Sensitivity or Missing File Error in', p, '->', imp);
          }
        } else {
          console.log('Dir missing for', p, '->', imp);
        }
      });
    }
  });
}

checkDir('src');
