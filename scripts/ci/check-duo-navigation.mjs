import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const start = html.indexOf('const sideNavigationQuery =');
const end = html.indexOf('\nif (navLogo) {', start);
assert(start > 0 && end > start);
const source = html.slice(start, end);
const query = source.match(/window\.matchMedia\('([^']+)'\)/)?.[1];
assert(query);

function matchesQuery(device) {
  return query.split(' and ').every((condition) => {
    const [, feature, value] = condition.match(/^\(([^:]+):\s*([^)]*)\)$/) || [];
    if (feature === 'device-width') return device.screenWidth === Number.parseInt(value);
    if (feature === 'device-height') return device.screenHeight === Number.parseInt(value);
    if (feature === 'min-width') return device.width >= Number.parseInt(value);
    if (feature === 'max-width') return device.width <= Number.parseInt(value);
    if (feature === 'orientation') return value === (device.width < device.height ? 'portrait' : 'landscape');
    if (feature === 'pointer') return value === device.pointer;
    throw new Error(`Unexpected feature: ${feature}`);
  });
}

const outer = { screenWidth: 466, screenHeight: 678, width: 382, height: 580, pointer: 'coarse' };
assert(matchesQuery(outer));
assert(matchesQuery({ ...outer, height: 618 }));
assert(matchesQuery({ ...outer, height: 280 }) === false);
for (const device of [
  { ...outer, width: 669, height: 867 },
  { ...outer, width: 951, height: 585 },
  { ...outer, width: 385, height: 571 },
  { ...outer, width: 594, height: 368 },
  { ...outer, width: 393, height: 852, screenWidth: 393, screenHeight: 852 },
  { ...outer, width: 382, height: 580, screenWidth: 390, screenHeight: 844 },
  { ...outer, pointer: 'fine' }
]) assert(!matchesQuery(device), `Unexpected side menu for ${JSON.stringify(device)}`);

const originalNav = {};
const originalNext = {};
const button = {
  parentNode: originalNav,
  nextSibling: originalNext,
  focus(options) { assert.equal(options.preventScroll, true); }
};
originalNav.insertBefore = (node, next) => {
  assert.equal(node, button);
  assert.equal(next, originalNext);
  button.parentNode = originalNav;
};
let currentClass = false;
let measurements = 0;
let changeListener;
const media = {
  matches: true,
  addEventListener(type, handler) { assert.equal(type, 'change'); changeListener = handler; }
};
const body = { appendChild(node) { assert.equal(node, button); button.parentNode = body; } };
vm.runInNewContext(source, {
  navMenuButton: button,
  document: { body, activeElement: button, documentElement: { classList: { toggle(name, value) { assert.equal(name, 'has-side-navigation'); currentClass = value; } } } },
  window: { matchMedia(value) { assert.equal(value, query); return media; } },
  syncHomeNavHeight() { measurements += 1; }
});
assert.equal(button.parentNode, body);
assert.equal(currentClass, true);
media.matches = false;
changeListener();
assert.equal(button.parentNode, originalNav);
assert.equal(currentClass, false);
media.matches = true;
changeListener();
assert.equal(button.parentNode, body);
assert.equal(measurements, 3);

assert(html.includes('aria-controls="mobileDrawer"'));
assert(html.includes('html.has-side-navigation .mobile-drawer.is-open .mobile-drawer-panel{transform:translateX(0);}'));
console.log('PASS Duo outer portrait targeting and navigation round trip');
