import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const start = html.indexOf('const CAKE_CATALOG =');
const end = html.indexOf('// —— 事件绑定 ——', start);
assert(start > 0 && end > start);
const inputs = new Map();
const panel = { scrollTop: 120 };
const closeButton = { tagName: 'BUTTON', setAttribute(name, value) { this[name] = value; } };
const overlayBody = {
  innerHTML: '',
  querySelector(selector) { return inputs.get(selector) || null; },
  contains(element) { return Array.from(inputs.values()).includes(element); }
};
const overlay = { hidden: false, querySelector() { return panel; } };
const document = {
  body: { dataset: { lang: 'en' } },
  activeElement: null,
  getElementById(id) {
    if (id === 'cakeOverlay') return overlay;
    if (id === 'cakeOverlayBody') return overlayBody;
    return inputs.get(`#${id}`) || null;
  },
  querySelector() { return null; },
  querySelectorAll(selector) { return selector === '[data-cake-close]' ? [closeButton] : []; }
};
const requests = [];
const alerts = [];
const confirmations = [];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const context = vm.createContext({
  document,
  window: {},
  getUiLang: () => document.body.dataset.lang,
  escapeHtml,
  formatOrderDate: () => '2026/11/18',
  formatMoney: (amount) => `$${amount}`,
  siteState: { auth: { user: { id: 1, nickname: 'Test customer' } } },
  siteApiRequest: async (url, options) => { requests.push({ url, options }); return { unavailable_dates: [] }; },
  loadMyOrders() {},
  openOverlay() { overlay.hidden = false; },
  closeOverlay() { overlay.hidden = true; },
  renderProfileOverlay() {},
  alert: (message) => alerts.push(message),
  confirm: (message) => { confirmations.push(message); return true; }
});
vm.runInContext(html.slice(start, end), context);
vm.runInContext("cakeLaToday = () => '2026-11-18';", context);
const catalog = vm.runInContext('CAKE_CATALOG', context);
const flow = vm.runInContext('cakeFlow', context);
const copies = vm.runInContext('CAKE_COPY', context);
const flavorTranslations = vm.runInContext('CAKE_FLAVOR_EN', context);
const hasHan = (value) => /[\u3400-\u9fff]/.test(value);
const visibleText = (markup) => markup.replace(/<[^>]+>/g, '');
const expectEnglish = (markup) => assert(!hasHan(visibleText(markup)), `Untranslated English cake UI: ${visibleText(markup)}`);
assert.equal(catalog.length, 2);
assert.equal(catalog[0].price, 88);
assert.equal(catalog[1].price, 68);
assert.equal(catalog[1].flavors.length, 17);
assert.equal(Object.keys(flavorTranslations).length, 17);
assert.equal(vm.runInContext('CAKE_MIN_LEAD_DAYS', context), 14);
assert.deepEqual(Object.keys(copies.zh).sort(), Object.keys(copies.en).sort());
for (const value of Object.values(copies.en)) {
  if (typeof value === 'string') assert(!hasHan(value));
}
for (const cake of catalog) {
  assert(cake.nameEn && cake.metaEn);
  assert(!hasHan(cake.nameEn + cake.metaEn));
}
context.renderCakePick();
expectEnglish(overlayBody.innerHTML);
assert(overlayBody.innerHTML.includes('Whole Cake Inquiry'));
assert(overlayBody.innerHTML.includes('Rice Cream Quartet'));
assert(overlayBody.innerHTML.includes('6-inch · 17 flavors'));
assert(overlayBody.innerHTML.includes('assets/images/cakes/quartet.jpg'));
assert(overlayBody.innerHTML.includes('assets/images/cakes/basque.jpg'));
assert.equal((overlayBody.innerHTML.match(/data-cake-pick=/g) || []).length, 2);
flow.cakeId = 'quartet';
context.renderCakeFlavor();
expectEnglish(overlayBody.innerHTML);
assert(overlayBody.innerHTML.includes('Rice chiffon'));
assert(overlayBody.innerHTML.includes('Rice cream'));
flow.cakeId = 'basque';
for (const flavor of catalog[1].flavors) {
  assert(flavorTranslations[flavor]);
  flow.flavor = flavor;
  context.renderCakeFlavor();
  expectEnglish(overlayBody.innerHTML);
  assert(overlayBody.innerHTML.includes(`data-cake-flavor="${flavor}"`), 'Translated labels must not replace canonical flavor values');
  assert(overlayBody.innerHTML.includes(`is-active" type="button" data-cake-flavor="${flavor}"`));
}
console.log('PASS cake copy: two styles, 17 canonical flavors and complete English labels');

flow.month = { y: 2026, m: 12 };
flow.selected = '2026-12-03';
flow.unavailableDates.add('2026-12-04');
flow.availabilityLoaded = false;
context.renderCakeDate();
expectEnglish(overlayBody.innerHTML);
assert(overlayBody.innerHTML.includes('Loading available dates'));
assert(!overlayBody.innerHTML.includes('data-cake-date='));
flow.availabilityLoaded = true;
context.renderCakeDate();
expectEnglish(overlayBody.innerHTML);
assert(overlayBody.innerHTML.includes('December 2026'));
assert(overlayBody.innerHTML.includes('Wed, December 2, 2026'));
assert(overlayBody.innerHTML.includes('data-cake-date="2026-12-03"'));
assert(!overlayBody.innerHTML.includes('data-cake-date="2026-12-01"'), '14-day minimum must remain enforced');
assert(!overlayBody.innerHTML.includes('data-cake-date="2026-12-04"'), 'Booked dates must remain locked');
assert(!overlayBody.innerHTML.includes('data-cake-date="2026-12-05"'), 'Saturdays must remain locked');
assert(!overlayBody.innerHTML.includes('data-cake-date="2026-12-25"'), 'Federal holidays must remain locked');
context.renderCakeReview();
expectEnglish(overlayBody.innerHTML);
assert(overlayBody.innerHTML.includes('This is an inquiry, not a confirmed order'));
assert(overlayBody.innerHTML.includes('pay after confirmation'));
assert(overlayBody.innerHTML.includes('WeChat Pay / Alipay'));
assert(overlayBody.innerHTML.includes('data-cake-copy="makkiemua@gmail.com"'));
assert(overlayBody.innerHTML.includes('data-cake-copy="makkiemua"'));
assert(overlayBody.innerHTML.includes('id="cakeOverlayTitle"'));
console.log('PASS cake calendar/review: localized dates, availability, inquiry warning and unchanged booking restrictions');

let focused = false;
let selection;
const draft = {
  id: 'cakeNotes', value: '请写 Happy birthday <3', selectionStart: 3, selectionEnd: 8,
  focus(options) { assert.equal(options.preventScroll, true); focused = true; },
  setSelectionRange(startOffset, endOffset) { selection = [startOffset, endOffset]; }
};
inputs.set('#cakeNotes', draft);
document.activeElement = draft;
flow.step = 'review';
const canonicalFlavor = flow.flavor;
document.body.dataset.lang = 'zh';
context.refreshCakeLanguage();
assert.equal(flow.notes, draft.value);
assert.equal(flow.flavor, canonicalFlavor);
assert.equal(flow.selected, '2026-12-03');
assert.equal(flow.step, 'review');
assert(overlayBody.innerHTML.includes('确认询单'));
assert(overlayBody.innerHTML.includes('&lt;3'));
assert.equal(closeButton['aria-label'], '关闭蛋糕询单');
assert.equal(panel.scrollTop, 120);
assert(focused);
assert.deepEqual(selection, [3, 8]);
document.body.dataset.lang = 'en';
context.refreshCakeLanguage();
assert(overlayBody.innerHTML.includes('Review your inquiry'));
assert.equal(flow.notes, draft.value, 'Customer notes must never be machine-translated');
assert.equal(closeButton['aria-label'], 'Close cake inquiry');
inputs.clear();
document.activeElement = null;
flow.notes = '';
context.renderCakeSuccess();
document.body.dataset.lang = 'zh';
context.refreshCakeLanguage();
assert.equal(flow.step, 'success');
assert(overlayBody.innerHTML.includes('询单已提交！'));
document.body.dataset.lang = 'en';
context.refreshCakeLanguage();
expectEnglish(overlayBody.innerHTML);
assert(overlayBody.innerHTML.includes('Inquiry submitted!'));
console.log('PASS live language round trip: draft, canonical selection, date, scroll, focus and success step retained');

for (const status of Object.keys(copies.en.statusLabels)) {
  const markup = context.renderCakeOrderCard({ id: 9, cake_id: 'basque', cake_name: '巴斯克蛋糕', flavor: '黑芝麻豆乳巴斯克', status, pickup_date: '2026-12-03', total_amount: 68, cancel_reason: status === 'cancelled' ? '用户主动取消' : '' }, true);
  expectEnglish(markup);
  assert(markup.includes(copies.en.statusLabels[status]));
  assert(markup.includes('Black Sesame Soy Milk Basque'));
  assert(markup.includes('Basque Cheesecake'));
  assert.equal(markup.includes('data-cake-cancel='), status === 'pending');
  assert.equal(markup.includes('data-pay-toggle='), !['cancelled', 'completed'].includes(status));
  if (status === 'pending') assert(markup.includes('data-pay-label-close="Hide payment options"'));
}
assert.equal(context.cakeErrorMessage({ message: '当前状态不可取消' }, 'Fallback'), 'This inquiry can no longer be cancelled.');
assert.equal(context.cakeErrorMessage({ message: '未翻译的服务器错误' }, 'Fallback'), 'Fallback');
assert.equal(context.cakeFlavorName('Custom customer flavor'), 'Custom customer flavor');
await context.cancelCakeOrder(9);
assert.equal(confirmations[0], 'Cancel this cake inquiry?');
assert.equal(requests.at(-1).url, '/api/cake-orders/9/cancel');

flow.step = 'review';
flow.cakeId = 'basque';
flow.flavor = '黑芝麻豆乳巴斯克';
flow.selected = '2026-12-03';
flow.preferredTime = '2–3 PM';
flow.notes = '保留原文 <please>';
const button = { disabled: false, textContent: '' };
let resolveSubmit;
let submissions = 0;
context.siteApiRequest = (url, options) => {
  requests.push({ url, options });
  submissions += 1;
  return new Promise((resolve) => { resolveSubmit = resolve; });
};
const submitting = context.submitCakeOrder(button);
assert.equal(button.textContent, 'Submitting…');
assert.equal(flow.submitting, true);
const submitted = requests.at(-1).options.body;
assert.equal(submitted.cake_id, 'basque');
assert.equal(submitted.flavor, '黑芝麻豆乳巴斯克');
assert.equal(submitted.pickup_date, '2026-12-03');
assert.equal(submitted.preferred_time, '2–3 PM');
assert.equal(submitted.notes, '保留原文 <please>');
document.body.dataset.lang = 'zh';
context.refreshCakeLanguage();
assert(overlayBody.innerHTML.includes('data-cake-submit disabled>提交中…'));
await context.submitCakeOrder(button);
assert.equal(submissions, 1, 'Language changes must not enable duplicate submissions');
resolveSubmit({});
await submitting;
assert.equal(flow.submitting, false);
assert.equal(flow.step, 'success');
document.body.dataset.lang = 'en';
flow.step = 'review';
context.siteApiRequest = async (url) => {
  if (url.endsWith('/config')) return { unavailable_dates: ['2026-12-03'] };
  throw new Error('该日期已有蛋糕预定，请选择其他日期');
};
await context.submitCakeOrder(button);
assert.equal(flow.step, 'date');
assert.equal(flow.selected, '');
assert.equal(flow.submitting, false);
assert.equal(button.disabled, false);
assert.equal(alerts.at(-1), 'A cake is already booked for this date. Please choose another date.');
const rateLabel = { textContent: '' };
const rmbAmount = { textContent: '', getAttribute: () => '88', parentElement: { querySelector: () => rateLabel } };
document.querySelector = (selector) => selector === '[data-cake-rmb-price]' ? rmbAmount : null;
document.querySelectorAll = (selector) => {
  if (selector === '[data-cake-rmb-price]') return [rmbAmount];
  if (selector === '[data-cake-rmb-rate]') return [rateLabel];
  return selector === '[data-cake-close]' ? [closeButton] : [];
};
context.fetchCakeRmbRate = () => Promise.resolve(7.2);
context.refreshCakeRmb();
await Promise.resolve();
await Promise.resolve();
assert.equal(rmbAmount.textContent, '≈ ¥634 · WeChat Pay / Alipay');
assert.equal(rateLabel.textContent, 'Live rate 1 USD ≈ 7.20 CNY');
context.fetchCakeRmbRate = () => Promise.reject(new Error('fixture rate failure'));
context.refreshCakeRmb();
await Promise.resolve();
await Promise.resolve();
assert.equal(rateLabel.textContent, 'Exchange rate unavailable. Please ask us.');
document.body.dataset.lang = 'zh';
context.refreshCakeRmb();
await Promise.resolve();
await Promise.resolve();
assert.equal(rateLabel.textContent, '汇率获取失败，请询问店家');
assert(html.slice(html.indexOf('function applyBilingualLanguage(')).includes('refreshCakeLanguage();'));
assert(html.includes('badge.textContent = getCakeCopy().copied;'));
console.log('PASS cake orders: localized statuses/cancellation/errors and unchanged canonical API payloads');
