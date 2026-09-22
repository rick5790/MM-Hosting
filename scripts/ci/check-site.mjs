import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve, sep } from 'node:path';

const root = process.cwd();
const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);
const read = (file) => readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
const htmlFiles = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

function stripCommentsAndStrings(source) {
  let output = '';
  let quote = '';
  let inComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (inComment) {
      if (char === '*' && next === '/') {
        inComment = false;
        output += '  ';
        index += 1;
      } else output += char === '\n' ? '\n' : ' ';
      continue;
    }
    if (!quote && char === '/' && next === '*') {
      inComment = true;
      output += '  ';
      index += 1;
      continue;
    }
    if (quote) {
      if (char === '\\') {
        output += '  ';
        index += 1;
      } else if (char === quote) {
        quote = '';
        output += ' ';
      } else output += char === '\n' ? '\n' : ' ';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      output += ' ';
    } else output += char;
  }
  return output;
}

function validateBalancedCss(file, source) {
  const clean = stripCommentsAndStrings(source);
  let depth = 0;
  for (const char of clean) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth < 0) {
      fail(file, 'contains a closing brace without a matching opening brace');
      return;
    }
  }
  if (depth !== 0) fail(file, `has ${depth} unmatched CSS opening brace(s)`);
}

function localPath(ownerFile, rawReference) {
  if (!rawReference) return null;
  const value = rawReference.trim();
  if (!value || value.startsWith('#') || value.startsWith('//')) return null;
  if (/^(?:https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(value)) return null;
  if (/[${}]/.test(value)) return null;

  const withoutFragment = value.split('#', 1)[0].split('?', 1)[0];
  if (!withoutFragment) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    fail(ownerFile, `has an invalid URL escape in "${value}"`);
    return null;
  }

  const candidate = decoded.startsWith('/')
    ? resolve(root, `.${decoded}`)
    : resolve(root, dirname(ownerFile), decoded);
  const relativeCandidate = relative(root, candidate);
  if (relativeCandidate.startsWith(`..${sep}`) || relativeCandidate === '..') {
    fail(ownerFile, `local reference escapes the repository: "${value}"`);
    return null;
  }
  return relativeCandidate || 'index.html';
}

function validateReference(ownerFile, reference) {
  const target = localPath(ownerFile, reference);
  if (!target) return;
  if (!existsSync(target)) {
    fail(ownerFile, `references missing local file "${reference}"`);
    return;
  }
  if (statSync(target).isDirectory() && !existsSync(join(target, 'index.html'))) {
    fail(ownerFile, `references directory without index.html: "${reference}"`);
  }
}

function validateJavaScript(file, source) {
  try {
    // Parsing only: constructing the function does not execute browser code.
    Function(source);
  } catch (error) {
    fail(file, `JavaScript syntax error: ${error.message}`);
  }
}

const reachableLinks = new Map();
for (const htmlFile of htmlFiles) {
  const source = read(htmlFile);
  const staticMarkup = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const titleMatches = [...source.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  if (titleMatches.length !== 1 || !titleMatches[0][1].trim()) fail(htmlFile, 'must have one non-empty title');

  const canonicalMatches = [...source.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)];
  if (canonicalMatches.length !== 1) fail(htmlFile, 'must have exactly one canonical link');

  const ids = new Map();
  for (const match of staticMarkup.matchAll(/\sid=["']([^"']+)["']/gi)) {
    const id = match[1];
    ids.set(id, (ids.get(id) || 0) + 1);
  }
  for (const [id, count] of ids) {
    if (count > 1) fail(htmlFile, `contains duplicate id "${id}" (${count} times)`);
  }

  const links = [];
  for (const match of source.matchAll(/\s(?:src|href|poster)=["']([^"']+)["']/gi)) {
    validateReference(htmlFile, match[1]);
    const target = localPath(htmlFile, match[1]);
    if (target?.endsWith('.html')) links.push(target);
  }
  for (const match of source.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) validateReference(htmlFile, candidate.trim().split(/\s+/, 1)[0]);
  }
  reachableLinks.set(htmlFile, links);

  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1];
    const body = match[2];
    if (/\ssrc\s*=/i.test(attributes)) continue;
    if (/\stype=["']application\/ld\+json["']/i.test(attributes)) {
      try {
        JSON.parse(body);
      } catch (error) {
        fail(htmlFile, `invalid JSON-LD: ${error.message}`);
      }
      continue;
    }
    if (!/\stype=["'](?:application\/json|importmap)["']/i.test(attributes)) {
      validateJavaScript(`${htmlFile} inline script`, body);
    }
  }
}

const visited = new Set();
const queue = ['index.html'];
while (queue.length) {
  const page = normalize(queue.shift());
  if (visited.has(page) || !reachableLinks.has(page)) continue;
  visited.add(page);
  queue.push(...reachableLinks.get(page));
}
for (const htmlFile of htmlFiles) {
  if (!visited.has(htmlFile)) fail(htmlFile, 'is not reachable through local links from index.html');
}

for (const assetDir of ['assets']) {
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && extname(file) === '.js') validateJavaScript(file, read(file));
      else if (entry.isFile() && extname(file) === '.css') {
        const source = read(file);
        validateBalancedCss(file, source);
        for (const match of source.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) validateReference(file, match[2]);
      }
    }
  };
  walk(assetDir);
}

if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(`\n${failures.length} static-site check(s) failed.`);
  process.exit(1);
}

console.log(`✓ ${htmlFiles.length} pages: syntax, metadata, local assets, IDs, and navigation graph passed`);
