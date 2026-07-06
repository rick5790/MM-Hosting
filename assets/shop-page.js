(function () {
  const shopRoot = document.getElementById('shopRoot');
  const shopEntryStatus = document.getElementById('shopEntryStatus');
  const orderReviewOverlay = document.getElementById('orderReviewOverlay');
  const orderReviewBody = document.getElementById('orderReviewBody');
  const orderConfirmOverlay = document.getElementById('orderConfirmOverlay');
  const orderConfirmBody = document.getElementById('orderConfirmBody');
  const profileOverlay = document.getElementById('profileOverlay');
  const profileOverlayBody = document.getElementById('profileOverlayBody');
  const pickupOverlay = document.getElementById('pickupOverlay');
  const pickupOverlayBody = document.getElementById('pickupOverlayBody');
  const adminOverlay = document.getElementById('adminOverlay');
  const adminOverlayBody = document.getElementById('adminOverlayBody');
  const navLogo = document.querySelector('.nav-logo');
  const pageEye = document.getElementById('pageEye');
  const pageSub = document.getElementById('pageSub');

  if (!shopRoot) return;

  document.querySelectorAll('.portal-close').forEach((button) => {
    button.textContent = '×';
  });

  const siteApiBase = 'https://admin.makkiemua.com';
  const pickupApiBase = 'https://admin.makkiemua.com';
  const GOOGLE_CLIENT_ID = '29827506621-bg1rie6ggvn8csfqsos5hd8lsadkv98n.apps.googleusercontent.com';
  const siteStorageKeys = {
    auth: 'makkie.web.auth',
    clientId: 'makkie.web.clientId'
  };

  const orderCopy = {
    zh: {
      syncing: '同步中',
      open: '本周预定开放中',
      closed: '本周暂未开放',
      closedHint: '请关注我们的社交媒体获得最新更新',
      loading: '正在读取本周菜单...',
      loadFailed: '本周菜单读取失败，请稍后再试。',
      weeklyMenu: '本周菜单',
      orderClosedCopy: '本周预定暂未开启，开放后这里会显示最新菜单与下单入口。',
      deadlinePrefix: '截止：',
      expired: '本周预定已截止',
      selected: '已选',
      pieces: '件',
      totalLabel: '总价',
      completeProfile: '先保存昵称',
      nickname: '昵称',
      nicknamePlaceholder: '请输入你的昵称',
      saveProfile: '保存昵称',
      googleLoginFailed: 'Google 登录失败，请重试',
      profileTitle: '请选择登陆方式',
      profileSub: '请尽量保持昵称和微信名一致，方便提货和核对哦～',
      close: '关闭',
      orderNote: '订单备注',
      orderComment: '备注',
      orderCommentEmpty: '暂时没有留言',
      orderNotePlaceholder: '有什么要求可以告诉我们哦～只有Makkie看得到',
      reviewOrder: '确认订单',
      submit: '提交订单',
      confirmSubmitTitle: '确认提交订单',
      cancelConfirm: '取消确认',
      confirmSubmit: '确认提交订单',
      orderItems: '订单内容',
      total: '总额',
      payment: '付款方式',
      currencyWarning: '⚠️ 所有甜品价格均为美元',
      zelle: 'Zelle',
      zelleValue: 'makkiemua@gmail.com',
      venmo: 'Venmo',
      venmoValue: 'makkiemua',
      alipay: '支付宝',
      alipayLine: '实时汇率请询问Makkie微信账号',
      copy: '复制',
      copied: '已复制',
      confirmLine1: '付款后请私信 Makkie Mua 发送付款截图，以便确认订单。',
      rules: '截单规则',
      rulesLine: '🍪 秉承不浪费食物的原则 截单后不接受临时取消订单',
      pickupInfo: '自提信息',
      pickupTime: '自提时间',
      subtotal: '合计',
      emptyCart: '请先选择数量',
      submitSuccess: '订单已提交',
      saveSuccess: '已保存',
      pickupSelect: '选择自提',
      pickupChange: '更改自提地点',
      pickupIntroTitle: '请选择本周自提地点',
      pickupIntroSub: '',
      pickupConfirm: '进入预定',
      category: '本期甜品',
      stock: '库存',
      limit: '限购',
      adminTitle: '隐藏管理员入口',
      adminSub: '这里可以查看当前预定状态，并手动切换开放与关闭。',
      adminOpenLabel: '预定状态',
      adminToggle: '切换开放状态',
      adminRefresh: '重新读取',
      adminLocked: '当前身份还不是管理员，请先保存管理员昵称后再刷新。',
      activeGroup: '当前档期'
    },
    en: {
      syncing: 'Syncing',
      open: 'Weekly preorder is open',
      closed: 'Weekly preorder is closed',
      closedHint: 'Follow our social media for the latest updates',
      loading: 'Loading weekly menu...',
      loadFailed: 'Failed to load the weekly menu. Please try again later.',
      weeklyMenu: 'Weekly Menu',
      orderClosedCopy: 'Preorder is currently closed. When the week opens, the latest menu and ordering entry will appear here.',
      deadlinePrefix: 'Deadline: ',
      expired: 'This week is closed',
      selected: 'Selected',
      pieces: 'items',
      totalLabel: 'Total',
      completeProfile: 'Save nickname first',
      nickname: 'Nickname',
      nicknamePlaceholder: 'Enter your nickname',
      saveProfile: 'Save Nickname',
      googleLoginFailed: 'Google sign-in failed, please try again',
      profileTitle: 'Choose how to sign in',
      profileSub: 'Please use the same name as your WeChat so pickup is easy to verify~',
      close: 'Close',
      orderNote: 'Order Note',
      orderComment: 'Comment',
      orderCommentEmpty: 'No comment yet',
      orderNotePlaceholder: 'Anything we should know? Only Makkie can see this.',
      reviewOrder: 'Review Order',
      submit: 'Submit Order',
      confirmSubmitTitle: 'Confirm Order',
      cancelConfirm: 'Cancel',
      confirmSubmit: 'Confirm Order',
      orderItems: 'Order Items',
      total: 'Total',
      payment: 'Payment',
      currencyWarning: '⚠️ All dessert prices are in USD',
      zelle: 'Zelle',
      zelleValue: 'makkiemua@gmail.com',
      venmo: 'Venmo',
      venmoValue: 'makkiemua',
      alipay: 'Alipay',
      alipayLine: 'Please ask Makkie on WeChat for the live exchange rate.',
      copy: 'Copy',
      copied: 'Copied',
      confirmLine1: 'After payment, message Makkie Mua with your payment screenshot to confirm the order.',
      rules: 'Cancellation Policy',
      rulesLine: '🍪 To avoid food waste, temporary cancellations are not accepted after the deadline.',
      pickupInfo: 'Pickup Info',
      pickupTime: 'Pickup Time',
      subtotal: 'Total',
      emptyCart: 'Select at least one item first',
      submitSuccess: 'Order submitted',
      saveSuccess: 'Saved',
      pickupSelect: 'Choose Pickup',
      pickupChange: 'Change Pickup',
      pickupIntroTitle: 'Choose your pickup location first',
      pickupIntroSub: 'Before entering preorder, choose where you would like to pick up your desserts.',
      pickupConfirm: 'Enter Preorder',
      category: 'Weekly Desserts',
      stock: 'Stock',
      limit: 'Limit',
      adminTitle: 'Hidden Admin Entry',
      adminSub: 'Use this panel to check the preorder state and switch it on or off manually.',
      adminOpenLabel: 'Preorder Status',
      adminToggle: 'Toggle Open State',
      adminRefresh: 'Refresh',
      adminLocked: 'This identity is not marked as an admin yet. Save the admin nickname first, then refresh.',
      activeGroup: 'Active Week'
    }
  };

  const state = {
    auth: loadSiteAuth(),
    weeklyOrder: null,
    pickups: [],
    products: [],
    cartQuantities: {},
    pickupIndex: 0,
    note: '',
    error: '',
    pickupConfirmed: false,
    loading: true
  };

  let countdownTimer = null;
  let adminTapCount = 0;
  let adminTapTimer = null;

  function getLang() {
    return window.MakkieSite && typeof window.MakkieSite.getLang === 'function'
      ? window.MakkieSite.getLang()
      : (document.body.dataset.lang === 'en' ? 'en' : 'zh');
  }

  function copy() {
    return orderCopy[getLang()];
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadSiteAuth() {
    try {
      const stored = localStorage.getItem(siteStorageKeys.auth);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function saveSiteAuth(auth) {
    state.auth = auth;
    localStorage.setItem(siteStorageKeys.auth, JSON.stringify(auth));
  }

  function joinApiUrl(url) {
    if (/^https?:\/\//.test(url)) return url;
    return `${siteApiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  function joinPickupApiUrl(url) {
    if (/^https?:\/\//.test(url)) return url;
    return `${pickupApiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  function getSiteClientId() {
    let clientId = localStorage.getItem(siteStorageKeys.clientId);
    if (!clientId) {
      clientId = `web_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(siteStorageKeys.clientId, clientId);
    }
    return clientId;
  }

  async function siteApiRequest(url, options = {}) {
    const auth = state.auth || loadSiteAuth();
    const response = await fetch(joinApiUrl(url), {
      method: options.method || 'GET',
      headers: {
        'content-type': 'application/json',
        ...(auth && auth.token ? { authorization: `Bearer ${auth.token}` } : {}),
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.message || `Request failed (${response.status})`);
    }
    return payload.data !== undefined ? payload.data : payload;
  }

  async function pickupApiRequest(url, options = {}) {
    const response = await fetch(joinPickupApiUrl(url), {
      method: options.method || 'GET',
      headers: {
        'content-type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.message || `Request failed (${response.status})`);
    }
    return payload.data !== undefined ? payload.data : payload;
  }

  function parseMoney(value) {
    if (typeof value === 'number') return value;
    const match = String(value || '').match(/[\d.]+/);
    return match ? Number(match[0]) || 0 : 0;
  }

  function formatMoney(amount) {
    const value = Math.round((Number(amount) || 0) * 100) / 100;
    return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
  }

  function toCloudUrl(value) {
    if (!value) return '';
    // 老数据里有指向小程序仓库的相对路径（../../orders_asset/...），网页端解析不了，当作没有图片。
    if (value.startsWith('../')) return '';
    if (/^https?:\/\//.test(value)) return value;
    if (value[0] === '/') return `${siteApiBase}${value}`;
    return `${siteApiBase}/${value}`;
  }

  function normalizePickupLocation(location, index) {
    const label = location.name || location.label || (index === 0 ? 'Irvine' : 'Los Angeles');
    return {
      id: location.id || location.key || label,
      label,
      time: location.time || location.pickup_time || location.window || '',
      zipcode: location.zipcode || location.area || '',
      address: location.address || '',
      note: location.note || location.remark || ''
    };
  }

  function normalizeProduct(product) {
    const stock = Number(product.stock);
    const limit = Number(product.per_order_limit || product.limit || product.max_per_order);
    const c = copy();
    return {
      id: String(product.id || product.product_id || product.slug || product.name),
      productId: product.id || product.product_id,
      category: product.category || product.category_name || c.category,
      title: product.name || product.title,
      price: product.price_text || `${formatMoney(product.price)} / item`,
      unitPrice: Number(product.price) || parseMoney(product.price_text),
      stock: Number.isFinite(stock) ? stock : 0,
      limit: Number.isFinite(limit) && limit > 0 ? limit : null,
      desc: product.description || product.desc || '',
      image: toCloudUrl(product.image_url || product.image || product.cover_url)
    };
  }

  function localizePickupText(value) {
    const text = String(value || '');
    if (getLang() !== 'zh') return text;
    return text
      .replace(/Los Angeles/gi, '洛杉矶')
      .replace(/Irvine/gi, '尔湾');
  }

  function getPickupLabel(pickup) {
    if (!pickup) return '';
    return localizePickupText(pickup.label);
  }

  function getPickupAddressPreset(pickup) {
    if (!pickup) return null;
    const haystack = [
      pickup.label,
      pickup.zipcode,
      pickup.address,
      pickup.note
    ].filter(Boolean).join(' ').toLowerCase();

    if (/los angeles|\bla\b|洛杉矶/.test(haystack)) {
      return {
        zh: '509 S Santa Fe Ave, Los Angeles, 90013',
        en: '509 S Santa Fe Ave, Los Angeles, 90013'
      };
    }

    if (/irvine|orange county|\boc\b|尔湾/.test(haystack)) {
      return {
        zh: '14282 Culver Dr, Irvine, 92604',
        en: '14282 Culver Dr, Irvine, 92604'
      };
    }

    return null;
  }

  function getPickupInstructionPreset(pickup) {
    if (!pickup) return null;
    const haystack = [
      pickup.label,
      pickup.zipcode,
      pickup.address,
      pickup.note
    ].filter(Boolean).join(' ').toLowerCase();

    if (/los angeles|\bla\b|洛杉矶/.test(haystack)) {
      return {
        zh: 'Alloy公寓楼下，靠近4th桥底车库门',
        en: 'Under the Alloy apartments, near the garage gate by the 4th St bridge'
      };
    }

    if (/irvine|orange county|\boc\b|尔湾/.test(haystack)) {
      return {
        zh: 'Heritage Plaza, Chase 银行停车场靠近ATM机，Tesla充电桩对面',
        en: 'Heritage Plaza, in the Chase Bank parking lot near the ATM, across from the Tesla chargers'
      };
    }

    return null;
  }

  function cleanPickupText(value) {
    return String(value || '')
      .replace(/^Pickup spot:\s*/i, '')
      .replace(/^自提地点[:：]\s*/i, '')
      .trim();
  }

  function getPickupAddress(pickup) {
    if (!pickup) return '';
    const preset = getPickupAddressPreset(pickup);
    if (preset) {
      return cleanPickupText(getLang() === 'en' ? preset.en : preset.zh);
    }
    const fallback = cleanPickupText(localizePickupText(String(pickup.address || pickup.note || pickup.zipcode || pickup.time || '')));
    if (fallback) return fallback;
    const looseMatch = localizePickupText([pickup.address, pickup.note, pickup.zipcode, pickup.time, pickup.label, pickup.id].filter(Boolean).join(' ')).toLowerCase();
    if (/los angeles|\bla\b|洛杉矶/.test(looseMatch)) return '509 S Santa Fe Ave, Los Angeles, 90013';
    if (/irvine|orange county|\boc\b|尔湾/.test(looseMatch)) return '14282 Culver Dr, Irvine, 92604';
    return '';
  }

  function getPickupInstruction(pickup) {
    if (!pickup) return '';
    const preset = getPickupInstructionPreset(pickup);
    if (preset) {
      return cleanPickupText(getLang() === 'en' ? preset.en : preset.zh);
    }
    return cleanPickupText(localizePickupText(String(pickup.note || '')));
  }

  function isAppleMapsPreferred() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const touchMac = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return /iPhone|iPad|iPod/i.test(ua) || /Mac/i.test(platform) || touchMac;
  }

  function getPickupMapUrl(pickup) {
    if (!pickup) return '';
    const address = getPickupAddress(pickup);
    const label = getPickupLabel(pickup);
    const query = encodeURIComponent([address, label].filter(Boolean).join(' '));
    if (!query) return '';
    if (isAppleMapsPreferred()) {
      return `https://maps.apple.com/?q=${query}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function getPickupTimeText(pickup) {
    if (!pickup) return '';
    const raw = cleanPickupText(localizePickupText(String(pickup.time || pickup.pickup_time || '')));
    if (raw) return raw;
    const haystack = [pickup.label, pickup.address, pickup.note, pickup.zipcode, pickup.id].filter(Boolean).join(' ').toLowerCase();
    if (/irvine|orange county|\boc\b|尔湾/.test(haystack)) {
      return getLang() === 'en' ? 'Saturday 12:30 - 13:00' : '周六 12:30 - 13:00';
    }
    if (/los angeles|\bla\b|洛杉矶/.test(haystack)) {
      return getLang() === 'en' ? 'Saturday 14:00 - 14:30' : '周六 14:00 - 14:30';
    }
    return '';
  }

  function getPickup() {
    return state.pickups[state.pickupIndex] || state.pickups[0] || null;
  }

  function getShopDeadlineText() {
    return state.weeklyOrder && state.weeklyOrder.deadline_text
      ? state.weeklyOrder.deadline_text
      : '';
  }

  function updateShopHeroMeta() {
    if (pageEye) {
      pageEye.textContent = '';
      pageEye.hidden = true;
    }
    if (pageSub) {
      pageSub.textContent = '';
      pageSub.hidden = true;
    }
  }

  function getSelectedItems() {
    return state.products
      .map((product) => ({ ...product, quantity: state.cartQuantities[product.id] || 0 }))
      .filter((product) => product.quantity > 0);
  }

  function getCartTotalQuantity() {
    return getSelectedItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  function isWeeklyOpen() {
    return Boolean(state.weeklyOrder && state.weeklyOrder.is_open && state.products.length);
  }

  function updateEntryStatus() {
    if (!shopEntryStatus) return;
    const c = copy();
    const deadlineText = getShopDeadlineText();
    const statusText = isWeeklyOpen()
      ? `${c.open}${deadlineText ? ` · ${deadlineText}` : ''}`
      : c.closed;
    updateShopHeroMeta();
    shopEntryStatus.innerHTML = `<span class="shop-pill ${isWeeklyOpen() ? 'is-open' : 'is-closed'}">${escapeHtml(statusText)}</span>`;
  }

  function renderCountdown(deadlineIso) {
    const c = copy();
    if (!deadlineIso) return '';
    const remaining = Date.parse(deadlineIso) - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) {
      return `<div class="shop-deadline">${escapeHtml(c.expired)}</div>`;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `
      <div class="shop-deadline">${escapeHtml(c.deadlinePrefix + (state.weeklyOrder.deadline_text || ''))}</div>
      <div class="shop-countdown">
        ${[
          [days, 'days'],
          [hours, 'hours'],
          [minutes, 'mins'],
          [seconds, 'secs']
        ].map(([value, label]) => `
          <div class="shop-countdown-unit">
            <span class="shop-countdown-value">${String(value).padStart(2, '0')}</span>
            <span class="shop-countdown-label">${label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderShop() {
    const c = copy();
    updateEntryStatus();

    if (state.loading) {
      shopRoot.className = 'shop-loading';
      shopRoot.textContent = c.loading;
      return;
    }

    if (state.error) {
      shopRoot.className = 'shop-error';
      shopRoot.textContent = state.error || c.loadFailed;
      return;
    }

    if (!state.products.length) {
      shopRoot.className = 'shop-empty';
      shopRoot.textContent = c.orderClosedCopy;
      return;
    }

    if (!isWeeklyOpen()) {
      shopRoot.className = '';
      shopRoot.innerHTML = `
        <div class="shop-state-card">
          <div class="shop-state-copy">
            <div class="shop-menu-title">${escapeHtml(c.weeklyMenu)}</div>
            <div class="shop-state-sub">${escapeHtml(c.orderClosedCopy)}</div>
          </div>
          <div class="shop-state-badge">${escapeHtml(c.closedHint)}</div>
        </div>
      `;
      return;
    }

    const totalQuantity = getCartTotalQuantity();
    const pickup = getPickup();
    const totalPrice = getSelectedItems().reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
    shopRoot.className = '';
    shopRoot.innerHTML = `
      <div class="shop-menu-shell">
        <div class="shop-grid shop-grid--catalog">
        ${state.products.map((product) => {
          const quantity = state.cartQuantities[product.id] || 0;
          const cap = Math.min(product.stock || Infinity, product.limit || Infinity);
          return `
            <article class="shop-card">
              <div class="shop-card-media">
                ${product.stock ? `<div class="shop-card-stock">${escapeHtml(c.stock)} ${product.stock}</div>` : ''}
                ${product.image
                  ? `<img class="shop-card-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy">`
                  : `<div class="shop-card-placeholder">
                      <div class="shop-card-placeholder-icon">+</div>
                      <div class="shop-card-placeholder-title">${escapeHtml(product.title)}</div>
                    </div>`
                }
              </div>
              <div class="shop-card-body">
                <div class="shop-card-title">${escapeHtml(product.title)}</div>
                ${product.desc ? `<div class="shop-card-desc">${escapeHtml(product.desc)}</div>` : ''}
                ${product.limit ? `<div class="shop-card-meta"><span>${escapeHtml(c.limit)} ${product.limit}</span></div>` : ''}
                <div class="shop-card-bottom">
                  <div class="shop-card-price">
                    <span class="shop-card-price-label">${escapeHtml(getLang() === 'en' ? 'Single item' : '单件预定')}</span>
                    <strong>${escapeHtml(product.price)}</strong>
                  </div>
                  <div class="shop-stepper">
                    <button class="shop-step" type="button" data-shop-action="decrease" data-id="${product.id}" ${quantity <= 0 ? 'disabled' : ''}>−</button>
                    <span class="shop-qty">${quantity}</span>
                    <button class="shop-step" type="button" data-shop-action="increase" data-id="${product.id}" ${quantity < cap ? '' : 'disabled'}>+</button>
                  </div>
                </div>
              </div>
            </article>
          `;
        }).join('')}
        </div>
        <div class="shop-menu-divider"></div>
        <div class="shop-details-row">
          <div class="shop-menu-head">
            <div class="pickup-current">
              <span class="pickup-current-label">${escapeHtml(c.pickupInfo)}</span>
              <span class="pickup-current-value">${escapeHtml((pickup && getPickupLabel(pickup)) || c.pickupSelect)}</span>
              <span class="pickup-current-time">${escapeHtml((pickup && getPickupTimeText(pickup)) || '')}</span>
              ${(pickup && getPickupMapUrl(pickup))
                ? `<a class="pickup-current-address pickup-current-address-link" href="${escapeHtml(getPickupMapUrl(pickup))}" target="_blank" rel="noopener noreferrer">${escapeHtml(getPickupAddress(pickup) || '')}</a>`
                : `<span class="pickup-current-address">${escapeHtml((pickup && getPickupAddress(pickup)) || '')}</span>`
              }
              <span class="pickup-current-meta">${escapeHtml((pickup && getPickupInstruction(pickup)) || '')}</span>
            </div>
            <div class="shop-menu-side">
              <button class="shop-secondary-button shop-secondary-button--compact" type="button" data-shop-action="pickup-overlay">${escapeHtml(c.pickupChange)}</button>
            </div>
          </div>
          <div class="shop-comment-card">
            <label class="shop-comment-field" for="shopOrderNoteInput">
              <span class="shop-comment-label">${escapeHtml(c.orderComment)}</span>
              <textarea id="shopOrderNoteInput" class="shop-comment-textarea" placeholder="${escapeHtml(c.orderNotePlaceholder)}" data-shop-note>${escapeHtml(state.note || '')}</textarea>
            </label>
          </div>
        </div>
      </div>
      <div class="shop-submit-bar">
        <div class="shop-submit-summary">
          <strong>${escapeHtml(c.selected)} ${totalQuantity} ${escapeHtml(c.pieces)}</strong>
          <span>${escapeHtml(c.totalLabel)} ${escapeHtml(formatMoney(totalPrice))}</span>
        </div>
        <button class="shop-submit-button" type="button" data-shop-action="review">${escapeHtml(c.reviewOrder)}</button>
      </div>
    `;
  }

  function setProductQuantity(productId, nextQuantity) {
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    const quantity = Math.max(0, nextQuantity);
    if (quantity <= 0) {
      delete state.cartQuantities[productId];
    } else {
      state.cartQuantities[productId] = quantity;
    }
    renderShop();
  }

  function openOverlay(overlay) {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  async function ensureGuestAuth() {
    if (state.auth && state.auth.user) return state.auth;
    const clientId = getSiteClientId();
    const suffix = clientId.slice(-4).toUpperCase();
    const nickname = getLang() === 'en' ? `Guest ${suffix}` : `网页顾客 ${suffix}`;
    const auth = await siteApiRequest('/api/auth/local-login', {
      method: 'POST',
      body: { client_id: clientId, nickname }
    });
    saveSiteAuth(auth);
    return auth;
  }

  function closeOverlay(overlay, body) {
    if (!overlay) return;
    overlay.hidden = true;
    if (body) body.innerHTML = '';
    document.body.style.overflow = '';
  }

  function renderProfileOverlay() {
    const c = copy();
    const nickname = state.auth && state.auth.user ? (state.auth.user.profile?.nickname || state.auth.user.nickname || '') : '';
    profileOverlayBody.innerHTML = `
      <div class="portal-title">${escapeHtml(c.profileTitle)}</div>
      <div class="portal-sub">${escapeHtml(c.profileSub)}</div>
      <div class="portal-google-block" id="googleSignInButton"></div>
      <div class="portal-form">
        <label class="portal-field">
          <span class="portal-label">${escapeHtml(c.nickname)}</span>
          <input id="profileNicknameInput" class="portal-input" type="text" value="${escapeHtml(nickname)}" placeholder="${escapeHtml(c.nicknamePlaceholder)}">
        </label>
        <div class="portal-actions">
          <button class="shop-secondary-button" type="button" data-profile-close>${escapeHtml(c.close)}</button>
          <button class="shop-submit-button" type="button" data-profile-action="save">${escapeHtml(c.saveProfile)}</button>
        </div>
      </div>
    `;
    openOverlay(profileOverlay);
    renderGoogleButton();
  }

  function renderGoogleButton() {
    const container = document.getElementById('googleSignInButton');
    if (!container || !window.google || !window.google.accounts || !window.google.accounts.id) return;
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 280,
      locale: getLang() === 'zh' ? 'zh_CN' : 'en'
    });
  }

  async function handleGoogleCredential(response) {
    try {
      const auth = await siteApiRequest('/api/auth/google', {
        method: 'POST',
        body: { credential: response.credential }
      });
      saveSiteAuth(auth);
      renderShop();
      renderProfileOverlay();
    } catch (error) {
      alert(error.message || copy().googleLoginFailed);
    }
  }

  function renderPickupOverlay() {
    const c = copy();
    pickupOverlayBody.innerHTML = `
      <div class="portal-title">${escapeHtml(c.pickupIntroTitle)}</div>
      ${c.pickupIntroSub ? `<div class="portal-sub">${escapeHtml(c.pickupIntroSub)}</div>` : ''}
      <div class="portal-pickups">
        ${state.pickups.map((option, index) => `
          <button class="portal-pickup ${index === state.pickupIndex ? 'is-active' : ''}" type="button" data-pickup-action="select" data-index="${index}">
            <div class="portal-pickup-title">${escapeHtml(getPickupLabel(option))}</div>
            <div class="portal-pickup-meta">${escapeHtml([getPickupTimeText(option), getPickupAddress(option)].filter(Boolean).join(" · "))}</div>
          </button>
        `).join('')}
      </div>
      <div class="portal-actions" style="margin-top:1rem;">
        <button class="shop-submit-button" type="button" data-pickup-action="confirm">${escapeHtml(c.pickupConfirm)}</button>
      </div>
    `;
    openOverlay(pickupOverlay);
  }

  async function saveProfileFromOverlay() {
    const input = document.getElementById('profileNicknameInput');
    const nickname = input ? input.value.trim() : '';
    if (!nickname) return;
    const auth = await siteApiRequest('/api/auth/local-login', {
      method: 'POST',
      body: { client_id: getSiteClientId(), nickname }
    });
    saveSiteAuth(auth);
    renderShop();
    closeOverlay(profileOverlay, profileOverlayBody);
    alert(copy().saveSuccess);
  }

  function renderOrderReviewOverlay() {
    const c = copy();
    const items = getSelectedItems();
    if (!items.length) {
      alert(c.emptyCart);
      return;
    }
    const pickup = getPickup();
    orderReviewBody.innerHTML = `
      <div class="portal-title">${escapeHtml(c.reviewOrder)}</div>
      <div class="portal-form">
        <div class="portal-field">
          <span class="portal-label">${escapeHtml(c.orderComment)}</span>
          <div class="portal-note-preview ${state.note && state.note.trim() ? '' : 'is-empty'}">${escapeHtml(state.note && state.note.trim() ? state.note : c.orderCommentEmpty)}</div>
        </div>
      </div>
      <div class="portal-divider"></div>
      <div class="portal-label">${escapeHtml(c.pickupInfo)}</div>
      <div class="portal-pickup is-active">
        <div class="portal-pickup-title">${escapeHtml(pickup ? getPickupLabel(pickup) : '')}</div>
      </div>
      <div class="portal-actions" style="margin-top:.9rem;">
        <button class="shop-secondary-button" type="button" data-shop-action="pickup-overlay">${escapeHtml(c.pickupChange)}</button>
      </div>
      <div class="portal-divider"></div>
      <div class="portal-summary">
        ${items.map((item) => `
          <div class="portal-summary-row">
            <span>${escapeHtml(item.title)} × ${item.quantity}</span>
            <span>${escapeHtml(formatMoney((item.unitPrice || 0) * item.quantity))}</span>
          </div>
        `).join('')}
        <div class="portal-summary-row portal-summary-total">
          <span>${escapeHtml(c.subtotal)}</span>
          <span>${escapeHtml(formatMoney(items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0)))}</span>
        </div>
      </div>
      <div class="portal-actions" style="margin-top:1rem;">
        <button class="shop-secondary-button" type="button" data-order-review-close>${escapeHtml(c.close)}</button>
        <button class="shop-submit-button" type="button" data-review-action="submit">${escapeHtml(c.submit)}</button>
      </div>
    `;
    openOverlay(orderReviewOverlay);
  }

  // 提交前的最终确认页：订单内容、总额、付款方式（Zelle/Venmo/支付宝）、截单规则，
  // 与小程序 order-notice-panel 保持一致。点“确认提交订单”才真正下单。
  function renderOrderConfirmOverlay() {
    const c = copy();
    const items = getSelectedItems();
    if (!items.length) {
      alert(c.emptyCart);
      return;
    }
    const pickup = getPickup();
    const total = items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
    const pickupMeta = pickup ? [getPickupTimeText(pickup), getPickupAddress(pickup)].filter(Boolean).join(' · ') : '';
    orderConfirmBody.innerHTML = `
      <div class="portal-title">${escapeHtml(c.confirmSubmitTitle)}</div>
      <div class="confirm-section">
        <div class="confirm-heading">${escapeHtml(c.orderItems)}</div>
        <div class="portal-summary">
          ${items.map((item) => `
            <div class="portal-summary-row">
              <span>${escapeHtml(item.title)} × ${item.quantity}</span>
              <span>${escapeHtml(formatMoney((item.unitPrice || 0) * item.quantity))}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="confirm-section confirm-total-row">
        <span class="confirm-heading">${escapeHtml(c.total)}</span>
        <span class="confirm-total">${escapeHtml(formatMoney(total))}</span>
      </div>
      <div class="confirm-section">
        <div class="confirm-heading">${escapeHtml(c.payment)}</div>
        <div class="confirm-currency-warning">${escapeHtml(c.currencyWarning)}</div>
        <div class="confirm-pay-card">
          <div class="confirm-pay-info">
            <div class="confirm-pay-name">${escapeHtml(c.zelle)}</div>
            <div class="confirm-pay-value">${escapeHtml(c.zelleValue)}</div>
          </div>
          <button class="confirm-pay-copy" type="button" data-confirm-copy="${escapeHtml(c.zelleValue)}">${escapeHtml(c.copy)}</button>
        </div>
        <div class="confirm-pay-card">
          <div class="confirm-pay-info">
            <div class="confirm-pay-name">${escapeHtml(c.venmo)}</div>
            <div class="confirm-pay-value">${escapeHtml(c.venmoValue)}</div>
          </div>
          <button class="confirm-pay-copy" type="button" data-confirm-copy="${escapeHtml(c.venmoValue)}">${escapeHtml(c.copy)}</button>
        </div>
        <div class="confirm-pay-card">
          <div class="confirm-pay-info">
            <div class="confirm-pay-name">${escapeHtml(c.alipay)}</div>
            <div class="confirm-pay-value">${escapeHtml(c.alipayLine)}</div>
          </div>
        </div>
        <div class="confirm-pay-instruction">${escapeHtml(c.confirmLine1)}</div>
      </div>
      <div class="confirm-section">
        <div class="confirm-heading">${escapeHtml(c.rules)}</div>
        <div class="confirm-rules-line">${escapeHtml(c.rulesLine)}</div>
      </div>
      ${pickup ? `
      <div class="confirm-section">
        <div class="confirm-heading">${escapeHtml(c.pickupInfo)}</div>
        <div class="confirm-pickup-line">${escapeHtml(getPickupLabel(pickup))}</div>
        ${pickupMeta ? `<div class="confirm-pickup-meta">${escapeHtml(pickupMeta)}</div>` : ''}
      </div>` : ''}
      <div class="portal-actions confirm-actions">
        <button class="shop-secondary-button" type="button" data-order-confirm-close>${escapeHtml(c.cancelConfirm)}</button>
        <button class="shop-submit-button" type="button" data-confirm-action="submit">${escapeHtml(c.confirmSubmit)}</button>
      </div>
    `;
    openOverlay(orderConfirmOverlay);
  }

  async function submitWebOrder() {
    const c = copy();
    await ensureGuestAuth();
    const items = getSelectedItems();
    if (!items.length) {
      alert(c.emptyCart);
      return;
    }
    const noteInput = document.getElementById('shopOrderNoteInput');
    if (noteInput) state.note = noteInput.value;
    const pickup = getPickup();
    const nickname = state.auth && state.auth.user ? (state.auth.user.profile?.nickname || state.auth.user.nickname || '') : '';
    await siteApiRequest('/api/orders', {
      method: 'POST',
      body: {
        pickup_location_id: pickup ? pickup.id : '',
        pickup_location_name: pickup ? pickup.label : '',
        pickup_snapshot: pickup || {},
        pickup_time: pickup ? getPickupTimeText(pickup) : "",
        customer_name: nickname,
        notes: state.note,
        cart_items: items.map((item) => ({
          product_id: item.productId || item.id,
          product_name: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice || parseMoney(item.price)
        }))
      }
    });
    state.cartQuantities = {};
    state.note = '';
    closeOverlay(orderConfirmOverlay, orderConfirmBody);
    closeOverlay(orderReviewOverlay, orderReviewBody);
    renderShop();
    alert(c.submitSuccess);
  }

  function copyToClipboard(text, button) {
    if (!text) return;
    const done = () => {
      if (!button) return;
      const original = button.textContent;
      button.textContent = copy().copied;
      button.classList.add('is-copied');
      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove('is-copied');
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (error) {}
    document.body.removeChild(area);
  }

  function renderAdminOverlay() {
    const c = copy();
    const user = state.auth && state.auth.user ? state.auth.user : null;
    const isAdmin = Boolean(user && (user.isAdmin || user.is_admin));
    const isOpen = Boolean(state.weeklyOrder && state.weeklyOrder.is_open);
    const activeGroup = state.weeklyOrder && (state.weeklyOrder.active_group_id || state.weeklyOrder.group_no || '—');
    adminOverlayBody.innerHTML = `
      <div class="portal-title">${escapeHtml(c.adminTitle)}</div>
      <div class="portal-sub">${escapeHtml(c.adminSub)}</div>
      <div class="admin-status-card">
        <div class="admin-status-line">
          <span>${escapeHtml(c.adminOpenLabel)}</span>
          <strong>${escapeHtml(isOpen ? c.open : c.closed)}</strong>
        </div>
        <div class="admin-status-line" style="margin-top:.7rem;">
          <span>${escapeHtml(c.activeGroup)}</span>
          <strong>${escapeHtml(String(activeGroup))}</strong>
        </div>
      </div>
      ${isAdmin ? `
        <div class="portal-actions" style="margin-top:1rem;">
          <button class="shop-secondary-button" type="button" data-admin-action="refresh">${escapeHtml(c.adminRefresh)}</button>
          <button class="shop-submit-button" type="button" data-admin-action="toggle">${escapeHtml(c.adminToggle)}</button>
        </div>
      ` : `
        <div class="admin-gate">${escapeHtml(c.adminLocked)}</div>
        <div class="portal-actions" style="margin-top:1rem;">
          <button class="shop-secondary-button" type="button" data-admin-action="profile">${escapeHtml(c.saveProfile)}</button>
        </div>
      `}
    `;
    openOverlay(adminOverlay);
  }

  async function toggleWeeklyOrderState() {
    const nextOpen = !(state.weeklyOrder && state.weeklyOrder.is_open);
    await siteApiRequest('/api/admin/weekly-order', {
      method: 'PATCH',
      body: { is_open: nextOpen }
    });
    await loadShopData();
    renderAdminOverlay();
  }

  async function loadShopData() {
    state.loading = true;
    state.error = '';
    renderShop();
    try {
      const [weeklyPayload, productsPayload, pickupPayload] = await Promise.all([
        siteApiRequest('/api/weekly-order'),
        siteApiRequest('/api/products'),
        pickupApiRequest('/api/pickup-locations')
      ]);
      const weeklyOrder = weeklyPayload && weeklyPayload.weekly_order ? weeklyPayload.weekly_order : weeklyPayload;
      const products = productsPayload && Array.isArray(productsPayload.products) ? productsPayload.products : [];
      const pickups = pickupPayload && Array.isArray(pickupPayload.pickup_locations)
        ? pickupPayload.pickup_locations
        : (pickupPayload && Array.isArray(pickupPayload.locations) ? pickupPayload.locations : []);
      state.weeklyOrder = weeklyOrder || null;
      state.products = products.map(normalizeProduct);
      state.pickups = pickups.map(normalizePickupLocation);
      if (!state.pickups.length) {
        state.pickups = [{ id: 'pickup', label: 'Pickup', time: '', zipcode: '', address: '', note: '' }];
      }
      if (state.pickupIndex >= state.pickups.length) state.pickupIndex = 0;
    } catch (error) {
      state.error = error.message || copy().loadFailed;
    } finally {
      state.loading = false;
      renderShop();
      resetCountdown();
      if (isWeeklyOpen() && state.pickups.length && !state.pickupConfirmed) {
        renderPickupOverlay();
      }
    }
  }

  async function checkLocalAuth() {
    try {
      const auth = await siteApiRequest('/api/auth/local-check', {
        method: 'POST',
        body: { client_id: getSiteClientId() }
      });
      if (auth && auth.user) saveSiteAuth(auth);
    } catch (error) {}
  }

  function resetCountdown() {
    if (countdownTimer) window.clearInterval(countdownTimer);
    countdownTimer = window.setInterval(() => {
      if (!state.loading && state.weeklyOrder) {
        updateEntryStatus();
        const countdownWrap = document.querySelector('[data-shop-countdown]');
        if (countdownWrap) {
          countdownWrap.innerHTML = renderCountdown(state.weeklyOrder.order_deadline_at || state.weeklyOrder.end_at || state.weeklyOrder.close_at);
        }
      }
    }, 1000);
  }

  shopRoot.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-shop-action]');
    if (!trigger) return;
    const { shopAction, id } = trigger.dataset;
    if (shopAction === 'increase') {
      setProductQuantity(id, (state.cartQuantities[id] || 0) + 1);
      return;
    }
    if (shopAction === 'decrease') {
      setProductQuantity(id, (state.cartQuantities[id] || 0) - 1);
      return;
    }
    if (shopAction === 'profile') {
      renderProfileOverlay();
      return;
    }
    if (shopAction === 'pickup-overlay') {
      renderPickupOverlay();
      return;
    }
    if (shopAction === 'review') {
      if (!state.pickupConfirmed) {
        renderPickupOverlay();
        return;
      }
      renderOrderReviewOverlay();
    }
  });

  document.addEventListener('click', async (event) => {
    const pickupLauncher = event.target.closest('[data-shop-action="pickup-overlay"]');
    const profileAction = event.target.closest('[data-profile-action]');
    const pickupAction = event.target.closest('[data-pickup-action]');
    const reviewAction = event.target.closest('[data-review-action]');
    const confirmAction = event.target.closest('[data-confirm-action]');
    const confirmCopy = event.target.closest('[data-confirm-copy]');
    const adminAction = event.target.closest('[data-admin-action]');
    const profileClose = event.target.closest('[data-profile-close]');
    const pickupClose = event.target.closest('[data-pickup-close]');
    const reviewClose = event.target.closest('[data-order-review-close]');
    const confirmClose = event.target.closest('[data-order-confirm-close]');
    const adminClose = event.target.closest('[data-admin-close]');

    if (profileClose) closeOverlay(profileOverlay, profileOverlayBody);
    if (pickupClose) closeOverlay(pickupOverlay, pickupOverlayBody);
    if (reviewClose) closeOverlay(orderReviewOverlay, orderReviewBody);
    if (confirmClose) closeOverlay(orderConfirmOverlay, orderConfirmBody);
    if (adminClose) closeOverlay(adminOverlay, adminOverlayBody);

    if (confirmCopy) {
      copyToClipboard(confirmCopy.dataset.confirmCopy, confirmCopy);
    }

    if (pickupLauncher) {
      renderPickupOverlay();
    }
    if (profileAction) {
      await saveProfileFromOverlay().catch((error) => alert(error.message));
    }
    if (pickupAction) {
      if (pickupAction.dataset.pickupAction === 'select') {
        state.pickupIndex = Number(pickupAction.dataset.index) || 0;
        renderPickupOverlay();
        renderShop();
        if (orderReviewOverlay && !orderReviewOverlay.hidden) renderOrderReviewOverlay();
      }
      if (pickupAction.dataset.pickupAction === 'confirm') {
        state.pickupConfirmed = true;
        closeOverlay(pickupOverlay, pickupOverlayBody);
        renderShop();
        if (orderReviewOverlay && !orderReviewOverlay.hidden) renderOrderReviewOverlay();
      }
    }
    if (reviewAction) {
      if (reviewAction.dataset.reviewAction === 'submit') {
        renderOrderConfirmOverlay();
      }
    }
    if (confirmAction) {
      if (confirmAction.dataset.confirmAction === 'submit') {
        await submitWebOrder().catch((error) => alert(error.message));
      }
    }
    if (adminAction) {
      if (adminAction.dataset.adminAction === 'profile') renderProfileOverlay();
      if (adminAction.dataset.adminAction === 'refresh') {
        await loadShopData();
        renderAdminOverlay();
      }
      if (adminAction.dataset.adminAction === 'toggle') {
        await toggleWeeklyOrderState().catch((error) => alert(error.message));
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeOverlay(orderReviewOverlay, orderReviewBody);
      closeOverlay(profileOverlay, profileOverlayBody);
      closeOverlay(pickupOverlay, pickupOverlayBody);
      closeOverlay(adminOverlay, adminOverlayBody);
    }
  });

  document.addEventListener('input', (event) => {
    const noteField = event.target.closest('[data-shop-note]');
    if (!noteField) return;
    state.note = noteField.value;
  });

  if (navLogo) {
    navLogo.addEventListener('click', () => {
      adminTapCount += 1;
      window.clearTimeout(adminTapTimer);
      adminTapTimer = window.setTimeout(() => {
        adminTapCount = 0;
      }, 900);
      if (adminTapCount >= 6) {
        adminTapCount = 0;
        renderAdminOverlay();
      }
    });
  }

  document.addEventListener('makkie:languagechange', () => {
    renderShop();
  });

  document.addEventListener('makkie:openprofile', () => {
    renderProfileOverlay();
  });

  checkLocalAuth().finally(loadShopData);
})();
