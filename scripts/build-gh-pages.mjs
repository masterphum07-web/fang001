import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'app', 'api');
const tempApiDir = path.join(rootDir, '.api-backup');
const outDir = path.join(rootDir, 'out');

try {
  // 1. Backup app/api
  if (fs.existsSync(apiDir)) {
    console.log('Temporarily isolating server API routes for client static export...');
    fs.cpSync(apiDir, tempApiDir, { recursive: true });
    fs.rmSync(apiDir, { recursive: true, force: true });
  }

  // 2. Run next build with EXPORT_STATIC=true
  console.log('Building static export for GitHub Pages...');
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env, EXPORT_STATIC: 'true' },
  });

  // 3. Add .nojekyll and 404.html fallback to out
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    const indexHtml = path.join(outDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      fs.copyFileSync(indexHtml, path.join(outDir, '404.html'));
    }
  }

  console.log('Static export built successfully in /out!');

  // 4. Push to gh-pages branch
  console.log('Pushing out to GitHub Pages (gh-pages branch)...');
  const deployTemp = path.join(process.env.TEMP || 'C:\\Temp', 'gh-pages-deploy-' + Date.now());
  fs.cpSync(outDir, deployTemp, { recursive: true });
  try {
    execSync('git init && git config user.name "masterphum07-web" && git config user.email "masterphum07-web@users.noreply.github.com" && git remote add origin https://github.com/masterphum07-web/fang001.git && git checkout -b gh-pages && git add -A && git commit -m "deploy: update GitHub Pages with LINE ID and period persistence" && git push origin gh-pages --force', {
      cwd: deployTemp,
      stdio: 'inherit',
      shell: true,
    });
    console.log('Successfully deployed to GitHub Pages (gh-pages)!');
  } finally {
    fs.rmSync(deployTemp, { recursive: true, force: true });
  }
} catch (err) {
  console.error('Build error:', err);
  throw err;
} finally {
  // 4. Restore app/api always
  if (fs.existsSync(tempApiDir)) {
    fs.cpSync(tempApiDir, apiDir, { recursive: true });
    fs.rmSync(tempApiDir, { recursive: true, force: true });
    console.log('Restored app/api successfully.');
  }
}
