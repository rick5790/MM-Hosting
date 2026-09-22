import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
};

const releaseVersion = readFileSync('VERSION', 'utf8').trim();
if (!/^\d+\.\d+(?:\.\d+)?$/.test(releaseVersion)) {
  fail(`VERSION must be a numeric release such as 7.0 or 7.0.1; got "${releaseVersion}"`);
}

let currentBranch = process.env.GITHUB_REF_NAME || '';
if (!currentBranch) {
  try {
    currentBranch = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    currentBranch = '';
  }
}

const candidateBranches = new Set([
  process.env.GITHUB_HEAD_REF,
  process.env.GITHUB_BASE_REF,
  currentBranch,
].filter(Boolean));
for (const branch of candidateBranches) {
  if (/^\d+\.\d+(?:\.\d+)?$/.test(branch) && branch !== releaseVersion) {
    fail(`release branch "${branch}" must match VERSION "${releaseVersion}"`);
  }
}

const htmlFiles = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

const assetVersions = new Map();
for (const htmlFile of htmlFiles) {
  const source = readFileSync(htmlFile, 'utf8').replace(/^\uFEFF/, '');
  const siteVersions = [...source.matchAll(/<meta\s+name=["']site-version["']\s+content=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1]);

  if (siteVersions.length !== 1) {
    fail(`${htmlFile} must contain exactly one site-version meta tag`);
  } else if (siteVersions[0] !== releaseVersion) {
    fail(`${htmlFile} declares site-version ${siteVersions[0]}, expected ${releaseVersion}`);
  }

  for (const match of source.matchAll(/(?:src|href)=["'](assets\/[^"'?#]+\.(?:css|js))\?v=([^"'&#\s]+)["']/gi)) {
    const [, asset, version] = match;
    if (!/^\d{8}-[a-z0-9][a-z0-9-]*$/i.test(version)) {
      fail(`${htmlFile} uses malformed cache version "${version}" for ${asset}`);
    }
    if (!assetVersions.has(asset)) assetVersions.set(asset, new Map());
    const uses = assetVersions.get(asset);
    if (!uses.has(version)) uses.set(version, []);
    uses.get(version).push(htmlFile);
  }
}

for (const [asset, versions] of assetVersions) {
  if (versions.size > 1) {
    const details = [...versions].map(([version, files]) => `${version}: ${files.join(', ')}`).join(' | ');
    fail(`${asset} has multiple active cache versions (${details})`);
  }
}

const requiredVersionedAssets = ['assets/analytics.js', 'assets/subpages.css', 'assets/subpages.js'];
for (const asset of requiredVersionedAssets) {
  if (!assetVersions.has(asset)) fail(`${asset} is missing a versioned reference`);
}

// Local and remote tracking refs describe the same logical branch, so de-duplicate
// them before checking for ambiguous spellings such as both "7.0" and "v7.0".
try {
  const refs = execFileSync(
    'git',
    ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes/origin'],
    { encoding: 'utf8' },
  ).split(/\r?\n/).filter(Boolean);
  const logicalBranches = new Set(refs
    .filter((ref) => ref !== 'origin/HEAD')
    .map((ref) => ref.replace(/^origin\//, '')));
  const normalized = new Map();
  for (const ref of logicalBranches) {
    const match = ref.match(/^v?(\d+\.\d+(?:\.\d+)?)$/i);
    if (!match) continue;
    const key = match[1];
    if (!normalized.has(key)) normalized.set(key, []);
    normalized.get(key).push(ref);
  }
  for (const [version, refsForVersion] of normalized) {
    if (refsForVersion.length > 1) {
      fail(`release version ${version} has ambiguous branch names: ${refsForVersion.join(', ')}`);
    }
  }
} catch (error) {
  fail(`could not inspect release branches: ${error.message}`);
}

if (!process.exitCode) {
  console.log(`✓ release ${releaseVersion}: ${htmlFiles.length} pages and ${assetVersions.size} versioned assets agree`);
}
