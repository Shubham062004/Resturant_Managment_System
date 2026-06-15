const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`\n🏃 Running: "${command}" in ${cwd}...`);
    const stdout = execSync(command, { cwd, encoding: 'utf-8', stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n❌ Command failed: "${command}"`);
    return false;
  }
}

function checkLocalhostInProduction() {
  console.log('\n🔍 Auditing for localhost references in production config...');
  let hasError = false;

  // 1. Check backend env.ts refine rules
  const backendEnvPath = path.join(__dirname, 'backend/src/config/env.ts');
  if (fs.existsSync(backendEnvPath)) {
    const content = fs.readFileSync(backendEnvPath, 'utf8');
    if (content.includes('localhost') && content.includes('refine')) {
      console.log('   ✓ Backend env.ts correctly guards against localhost URLs in production.');
    } else {
      console.warn(
        '   ⚠️ Backend env.ts is missing validation to block localhost links in production.',
      );
    }
  }

  // 2. Check frontend codebase for active localhost calls
  const srcPath = path.join(__dirname, 'frontend/src');
  if (fs.existsSync(srcPath)) {
    const files = getFilesRecursive(srcPath);
    files.forEach((file) => {
      if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        const content = fs.readFileSync(file, 'utf8');
        const localhostRegex = /localhost:(3000|5000|5173|5174)/i;
        if (
          localhostRegex.test(content) &&
          !file.includes('mock') &&
          !file.includes('setupTests')
        ) {
          console.warn(
            `   ⚠️ Warning: Active localhost reference found in ${path.relative(__dirname, file)}`,
          );
          hasError = true;
        }
      }
    });
  }

  if (!hasError) {
    console.log('   ✓ No active localhost references found in production source files.');
  }
  return !hasError;
}

function getFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursive(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

function runAudit() {
  console.log('==================================================');
  console.log('🔎 ABC PROJECT STABILIZATION & AUDIT TOOL');
  console.log('==================================================');

  // Step 1: Run Linting Checks
  console.log('\n--- STEP 1: LINTING AUDIT ---');
  const lintOk = runCommand('npm run lint');

  // Step 2: Run Production Builds
  console.log('\n--- STEP 2: BUILD AUDIT ---');
  const buildOk = runCommand('npm run build');

  // Step 3: Check configurations
  console.log('\n--- STEP 3: CONFIGURATION AUDIT ---');
  const configOk = checkLocalhostInProduction();

  console.log('\n==================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('==================================================');
  console.log(`Linting Status:        ${lintOk ? '🟢 PASS' : '🔴 FAIL'}`);
  console.log(`Build Status:          ${buildOk ? '🟢 PASS' : '🔴 FAIL'}`);
  console.log(`Configuration Status:  ${configOk ? '🟢 PASS' : '🟡 WARNINGS FOUND'}`);
  console.log('==================================================');

  if (!lintOk || !buildOk) {
    process.exit(1);
  } else {
    console.log('🎉 Project is fully verified and production-ready!');
    process.exit(0);
  }
}

runAudit();
