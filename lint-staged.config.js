const path = require('path');

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const relativeFiles = filenames.map((file) =>
      path.relative(process.cwd(), file)
    );
    const frontendFiles = relativeFiles.filter(
      (file) => file.split(path.sep)[0] === 'frontend'
    );
    const backendFiles = relativeFiles.filter(
      (file) => file.split(path.sep)[0] === 'backend'
    );

    const commands = [];

    if (frontendFiles.length > 0) {
      const feRelative = frontendFiles.map((f) =>
        path.relative('frontend', f).replace(/\\/g, '/')
      );
      commands.push(
        `node scripts/lint-staged-eslint.js frontend ${feRelative.join(' ')}`
      );
    }

    if (backendFiles.length > 0) {
      const beRelative = backendFiles.map((f) =>
        path.relative('backend', f).replace(/\\/g, '/')
      );
      commands.push(
        `node scripts/lint-staged-eslint.js backend ${beRelative.join(' ')}`
      );
    }

    commands.push(
      `prettier --write ${relativeFiles.map((f) => f.replace(/\\/g, '/')).join(' ')}`
    );

    return commands;
  },
  '*.{json,css,md,yml,yaml}': ['prettier --write'],
};
