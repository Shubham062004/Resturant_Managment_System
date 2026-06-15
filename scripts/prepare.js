const { execSync } = require('child_process');

// Determine if we are in a CI/CD environment or explicitly disabling Husky
const isCi =
  process.env.CI ||
  process.env.VERCEL ||
  process.env.RENDER ||
  process.env.GITHUB_ACTIONS ||
  process.env.HUSKY === '0';

if (isCi) {
  console.log('[Husky] CI/CD environment detected or HUSKY=0. Skipping Husky installation to prevent build failures.');
  process.exit(0);
}

try {
  // Execute Husky installation
  console.log('[Husky] Local development environment detected. Installing Git hooks...');
  execSync('npx husky', { stdio: 'inherit' });
} catch (error) {
  // Only fail silently if husky itself isn't found, which happens during production installs
  console.log('[Husky] Failed to install husky. This is expected in production builds where devDependencies are skipped.');
}
