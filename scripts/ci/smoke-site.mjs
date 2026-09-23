import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';

const host = '127.0.0.1';
const port = 4179;
const origin = `http://${host}:${port}`;
const server = spawn(process.execPath, ['scripts/local-server.js'], {
  env: { ...process.env, HOST: host, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
server.stdout.on('data', (chunk) => { output += chunk; });
server.stderr.on('data', (chunk) => { output += chunk; });

const waitForServer = async () => {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`local server exited early:\n${output}`);
    try {
      const response = await fetch(`${origin}/`);
      if (response.ok) return;
    } catch {
      // Server has not started listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`local server did not become ready:\n${output}`);
};

const expectRoute = async (route, expectedType) => {
  const response = await fetch(`${origin}${route}`, { redirect: 'manual' });
  if (response.status !== 200) throw new Error(`${route} returned HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes(expectedType)) {
    throw new Error(`${route} returned content-type "${contentType}", expected ${expectedType}`);
  }
  const body = await response.arrayBuffer();
  if (body.byteLength === 0) throw new Error(`${route} returned an empty body`);
};

try {
  await waitForServer();
  const pages = readdirSync('.', { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => `/${entry.name}`)
    .sort();

  await expectRoute('/', 'text/html');
  for (const page of pages) await expectRoute(page, 'text/html');
  await expectRoute('/assets/subpages.css', 'text/css');
  await expectRoute('/assets/subpages.js', 'application/javascript');
  await expectRoute('/assets/analytics.js', 'application/javascript');
  await expectRoute('/assets/videos/backgrounds/bakery-hero-horizontal.mp4', 'video/mp4');
  await expectRoute('/assets/videos/backgrounds/bakery-hero-vertical.mp4', 'video/mp4');
  await expectRoute('/assets/videos/mascots/default/makkie-waving-fixed.webm', 'video/webm');
  await expectRoute('/assets/videos/mascots/seasonal/makkie-mid-autumn-2026.webm', 'video/webm');
  await expectRoute('/assets/videos/mascots/seasonal/makkie-halloween.webm', 'video/webm');
  await expectRoute('/assets/videos/mascots/seasonal/makkie-christmas.webm', 'video/webm');
  await expectRoute('/assets/videos/mascots/seasonal/makkie-new-year.webm', 'video/webm');
  await expectRoute('/assets/videos/mascots/seasonal/makkie-cny-2027.webm', 'video/webm');
  await expectRoute('/assets/images/holidays/mid-autumn-2026/rabbit-1.png', 'image/png');
  await expectRoute('/assets/images/holidays/mid-autumn-2026/rabbit-3.png', 'image/png');
  await expectRoute('/robots.txt', 'text/plain');
  await expectRoute('/sitemap.xml', 'application/xml');

  const missing = await fetch(`${origin}/__ci_missing_file__.html`);
  if (missing.status !== 404) throw new Error(`missing route returned HTTP ${missing.status}, expected 404`);

  console.log(`✓ local server returned valid responses for ${pages.length} pages and core public assets`);
} finally {
  if (server.exitCode === null) server.kill('SIGTERM');
}
