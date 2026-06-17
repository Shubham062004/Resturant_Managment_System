import fs from 'fs';
import path from 'path';

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    let i = 0;
    function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    }
    next();
  });
}

function checkImports() {
  walk('./src', (err, files) => {
    if (err) throw err;
    const tsFiles = files.filter((f) => f.match(/\.(ts|tsx)$/));

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(file), importPath);
          const dir = path.dirname(resolvedPath);
          if (fs.existsSync(dir)) {
            const basename = path.basename(resolvedPath);
            const actualFiles = fs.readdirSync(dir);
            const found = actualFiles.find((f) => {
              const fNoExt = f.replace(/\.[^/.]+$/, '');
              return (
                f === basename ||
                fNoExt === basename ||
                f === basename + '/index.ts' ||
                f === basename + '/index.tsx'
              );
            });
            if (!found) {
              console.log(`CASE ERROR: ${file} imports ${importPath}`);
            }
          } else {
            console.log(`DIR ERROR: ${file} imports ${importPath}`);
          }
        }
      }
    }
    console.log('Done checking.');
  });
}

checkImports();
