import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({ Intl, Date, decodeURIComponent });
vm.runInContext(readFileSync('assets/mascot-schedule.js', 'utf8'), context);
const schedule = context.MakkieMascotSchedule;

const cases = [
  ['2026-09-14', 'default'],
  ['2026-09-15', 'mid-autumn'],
  ['2026-09-25', 'mid-autumn'],
  ['2026-09-27', 'mid-autumn'],
  ['2026-09-28', 'default'],
  ['2026-10-20', 'default'],
  ['2026-10-21', 'halloween'],
  ['2028-10-31', 'halloween'],
  ['2028-11-01', 'default'],
  ['2026-12-14', 'default'],
  ['2026-12-15', 'christmas'],
  ['2026-12-22', 'christmas'],
  ['2028-12-25', 'christmas'],
  ['2026-12-26', 'new-year'],
  ['2027-01-01', 'new-year'],
  ['2027-01-02', 'default'],
  ['2027-01-26', 'default'],
  ['2027-01-27', 'cny'],
  ['2027-02-05', 'cny'],
  ['2027-02-11', 'cny'],
  ['2027-02-12', 'default']
];

const failures = [];
for (const [date, expected] of cases) {
  const actual = schedule.selectEdition(date);
  if (actual !== expected) failures.push(`${date}: expected ${expected}, got ${actual}`);
}

if (schedule.requestedEdition('?mascot=christmas', '2026-06-01') !== 'christmas') {
  failures.push('valid mascot preview override was ignored');
}
if (schedule.requestedEdition('?mascot=unknown', '2026-09-25') !== 'mid-autumn') {
  failures.push('invalid mascot preview override did not fall back to the date schedule');
}

const beforeMidnight = schedule.losAngelesDateKey(new Date('2026-09-25T06:30:00Z'));
const afterMidnight = schedule.losAngelesDateKey(new Date('2026-09-25T07:30:00Z'));
if (beforeMidnight !== '2026-09-24' || afterMidnight !== '2026-09-25') {
  failures.push(`Los Angeles midnight boundary is wrong (${beforeMidnight} → ${afterMidnight})`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`✗ ${failure}`));
  process.exit(1);
}

console.log(`✓ ${cases.length} holiday display boundaries, preview overrides, and Los Angeles timezone passed`);
