const { execSync } = require('child_process');
const path = require('path');

const targetDir = process.argv[2];
const files = process.argv.slice(3);

if (!targetDir || files.length === 0) {
  process.exit(0);
}

try {
  const cmd = `npx eslint --fix ${files.join(' ')}`;
  console.log(`Running in ${targetDir}: ${cmd}`);
  execSync(cmd, {
    cwd: path.resolve(process.cwd(), targetDir),
    stdio: 'inherit',
  });
} catch (error) {
  process.exit(1);
}
