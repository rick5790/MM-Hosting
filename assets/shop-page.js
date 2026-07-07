(function () {
  const shopRoot = document.getElementById('shopRoot');
  const shopEntryStatus = document.getElementById('shopEntryStatus');
  const orderConfirmOverlay = document.getElementById('orderConfirmOverlay');
  const orderConfirmBody = document.getElementById('orderConfirmBody');
  const orderSuccessOverlay = document.getElementById('orderSuccessOverlay');
  const orderSuccessBody = document.getElementById('orderSuccessBody');
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
      nicknamePlaceholder: '请输入昵称或者通过 Google 登录自动提取，方便订单追踪',
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
      emptyNickname: '请输入昵称',
      submitSuccess: '订单已提交',
      saveSuccess: '已保存',
      successTitle: '订单已提交！',
      successMessage: '请付款后截图跟 Makkie 确认哦，请在「我的订单」里查看最新状态。',
      viewMyOrders: '查看我的订单',
      successClose: '知道了',
      myOrders: '我的订单',
      thisWeekOrders: '本周订单',
      historyOrders: '历史订单',
      noOrders: '还没有订单',
      noThisWeekOrders: '本周还没有订单',
      historyEmpty: '还没有历史订单',
      viewHistory: '查看历史订单',
      backToOrders: '返回',
      orderDateLabel: '下单日期',
      idLabel: 'ID',
      cancelOrder: '取消订单',
      cancelWarn: '取消后会释放该订单占用的库存，确定要取消吗？',
      cancelConfirmYes: '确认取消',
      cancelKeep: '暂不取消',
      cancelSuccess: '订单已取消，库存已释放。',
      cancelFailed: '取消失败，请稍后再试。',
      ordersLoading: '正在读取订单...',
      ordersFailed: '订单读取失败，请稍后再试。',
      editNickname: '修改昵称',
      loggedInAs: '当前昵称',
      orderNumberLabel: '订单号',
      pickupSelect: '选择自提',
      pickupChange: '更改自提地点',
      pickupIntroTitle: '请选择本周自提地点',
      pickupIntroSub: '',
      pickupConfirm: '进入预定',
      category: '本期甜品',
      stock: '库存',
      limit: '限购',
      statusLabels: { pending: '待付款', paid: '已付款', making: '制作中', ready: '待取货', completed: '已完成', cancelled: '已取消' },
      paymentPaid: '已确认收款',
      paymentUnpaid: '待确认付款',
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
      nicknamePlaceholder: 'Enter a nickname, or sign in with Google to auto-fill — helps track your orders',
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
      emptyNickname: 'Please enter a nickname',
      submitSuccess: 'Order submitted',
      saveSuccess: 'Saved',
      successTitle: 'Order submitted!',
      successMessage: 'After payment, send Makkie a screenshot to confirm. Track the latest status under "My Orders".',
      viewMyOrders: 'View My Orders',
      successClose: 'Got it',
      myOrders: 'My Orders',
      thisWeekOrders: 'This Week',
      historyOrders: 'Order History',
      noOrders: 'No orders yet',
      noThisWeekOrders: 'No orders this week yet',
      historyEmpty: 'No past orders yet',
      viewHistory: 'View Order History',
      backToOrders: 'Back',
      orderDateLabel: 'Ordered',
      idLabel: 'ID',
      cancelOrder: 'Cancel Order',
      cancelWarn: 'Cancelling will release the stock reserved for this order. Are you sure?',
      cancelConfirmYes: 'Yes, cancel',
      cancelKeep: 'Keep order',
      cancelSuccess: 'Order cancelled. The stock has been released.',
      cancelFailed: 'Failed to cancel. Please try again later.',
      ordersLoading: 'Loading orders...',
      ordersFailed: 'Failed to load orders. Please try again later.',
      editNickname: 'Edit Nickname',
      loggedInAs: 'Nickname',
      orderNumberLabel: 'Order',
      pickupSelect: 'Choose Pickup',
      pickupChange: 'Change Pickup',
      pickupIntroTitle: 'Choose your pickup location first',
      pickupIntroSub: 'Before entering preorder, choose where you would like to pick up your desserts.',
      pickupConfirm: 'Enter Preorder',
      category: 'Weekly Desserts',
      stock: 'Stock',
      limit: 'Limit',
      statusLabels: { pending: 'Pending', paid: 'Paid', making: 'Making', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' },
      paymentPaid: 'Payment confirmed',
      paymentUnpaid: 'Awaiting payment',
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
    loading: true,
    pendingSubmit: false,
    profileEditMode: false,
    profileView: 'main',
    cancelPromptId: null,
    cancelBusyId: null,
    myOrders: null,
    myOrdersLoading: false,
    myOrdersError: ''
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

  // 英文模式下把后台存的中文星期翻成英文（如“周六 12:30 - 13:00” → “Saturday 12:30 - 13:00”）。
  const PICKUP_WEEKDAY_EN = {
    '星期一': 'Monday', '星期二': 'Tuesday', '星期三': 'Wednesday', '星期四': 'Thursday',
    '星期五': 'Friday', '星期六': 'Saturday', '星期日': 'Sunday', '星期天': 'Sunday',
    '周一': 'Monday', '周二': 'Tuesday', '周三': 'Wednesday', '周四': 'Thursday',
    '周五': 'Friday', '周六': 'Saturday', '周日': 'Sunday', '周天': 'Sunday'
  };
  function localizePickupTime(value) {
    let text = String(value || '');
    if (getLang() !== 'en') return text;
    Object.keys(PICKUP_WEEKDAY_EN).forEach((zh) => {
      if (text.indexOf(zh) !== -1) text = text.split(zh).join(PICKUP_WEEKDAY_EN[zh]);
    });
    return text;
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
    const raw = cleanPickupText(localizePickupTime(localizePickupText(String(pickup.time || pickup.pickup_time || ''))));
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
    // 只更新受影响的步进器和结算栏，避免重建整个列表导致图片重新加载（手机端会闪）。
    updateCartUI();
  }

  function updateCartUI() {
    const c = copy();
    shopRoot.querySelectorAll('.shop-stepper').forEach((stepper) => {
      const inc = stepper.querySelector('[data-shop-action="increase"]');
      const dec = stepper.querySelector('[data-shop-action="decrease"]');
      const qtyEl = stepper.querySelector('.shop-qty');
      if (!inc || !dec) return;
      const pid = inc.dataset.id;
      const product = state.products.find((item) => String(item.id) === String(pid));
      if (!product) return;
      const quantity = state.cartQuantities[pid] || 0;
      const cap = Math.min(product.stock || Infinity, product.limit || Infinity);
      if (qtyEl) qtyEl.textContent = quantity;
      dec.disabled = quantity <= 0;
      inc.disabled = quantity >= cap;
    });
    const summary = shopRoot.querySelector('.shop-submit-summary');
    if (summary) {
      const totalQuantity = getCartTotalQuantity();
      const totalPrice = getSelectedItems().reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
      summary.innerHTML = `<strong>${escapeHtml(c.selected)} ${totalQuantity} ${escapeHtml(c.pieces)}</strong><span>${escapeHtml(c.totalLabel)} ${escapeHtml(formatMoney(totalPrice))}</span>`;
    }
  }

  function openOverlay(overlay) {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay(overlay, body) {
    if (!overlay) return;
    overlay.hidden = true;
    if (body) body.innerHTML = '';
    document.body.style.overflow = '';
  }

  function renderProfileOverlay() {
    const nickname = getSavedNickname();
    // 每次打开都从主界面开始，清掉未完成的取消确认。
    state.profileView = 'main';
    state.cancelPromptId = null;
    state.cancelBusyId = null;
    // 已登录（有昵称）且不在改昵称模式：显示“我的订单”；否则显示登录/昵称表单。
    if (nickname && !state.profileEditMode) {
      renderProfileLoggedIn();
      openOverlay(profileOverlay);
      loadMyOrders();
      return;
    }
    renderProfileLoginForm();
    openOverlay(profileOverlay);
    renderGoogleButton();
  }

  function renderProfileLoginForm() {
    const c = copy();
    const nickname = getSavedNickname();
    profileOverlayBody.innerHTML = `
      <div class="portal-title">${escapeHtml(c.profileTitle)}</div>
      <div class="portal-sub">${escapeHtml(c.profileSub)}</div>
      <div class="portal-google-block" id="googleSignInButton"></div>
      <div class="portal-form">
        <label class="portal-field portal-field--center">
          <span class="portal-label">${escapeHtml(c.nickname)}</span>
          <input id="profileNicknameInput" class="portal-input" type="text" value="${escapeHtml(nickname)}" placeholder="${escapeHtml(c.nicknamePlaceholder)}">
        </label>
        <div class="portal-actions">
          <button class="shop-secondary-button" type="button" data-profile-close>${escapeHtml(c.close)}</button>
          <button class="shop-submit-button" type="button" data-profile-action="save">${escapeHtml(c.saveProfile)}</button>
        </div>
      </div>
    `;
  }

  function renderProfileLoggedIn() {
    const c = copy();
    const nickname = getSavedNickname();

    // 历史订单单独 view：从主界面点「查看历史订单」进入，可返回。
    if (state.profileView === 'history') {
      profileOverlayBody.innerHTML = `
        <div class="profile-history-head">
          <button class="shop-secondary-button shop-secondary-button--compact" type="button" data-profile-view="main">‹ ${escapeHtml(c.backToOrders)}</button>
          <div class="profile-history-title">${escapeHtml(c.historyOrders)}</div>
        </div>
        <div class="portal-divider"></div>
        <div id="myOrdersSection">${renderMyOrdersSection()}</div>
      `;
      return;
    }

    // 上下结构：昵称 → 查看历史订单 → 本周订单列表（从上到下堆叠）。
    profileOverlayBody.innerHTML = `
      <div class="profile-stack">
        <div class="profile-head">
          <div>
            <div class="profile-head-label">${escapeHtml(c.loggedInAs)}</div>
            <div class="profile-head-name">${escapeHtml(nickname)}</div>
          </div>
          <button class="shop-secondary-button shop-secondary-button--compact" type="button" data-profile-action="edit">${escapeHtml(c.editNickname)}</button>
        </div>
        <button class="profile-history-entry" type="button" data-profile-view="history">
          <span>${escapeHtml(c.viewHistory)}</span>
          <span class="profile-history-arrow">›</span>
        </button>
        <div class="portal-divider"></div>
        <div class="profile-main-title">${escapeHtml(c.myOrders)} · ${escapeHtml(c.thisWeekOrders)}</div>
        <div id="myOrdersSection">${renderMyOrdersSection()}</div>
      </div>
    `;
  }

  function getOrderStatusInfo(order) {
    const c = copy();
    const status = String(order.status || 'pending');
    const label = (c.statusLabels && c.statusLabels[status]) || status;
    return { status, label };
  }

  function formatOrderDate(value) {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return String(value);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }

  // 学习图1（小程序订单卡）：下单日期、单号/状态、昵称+ID、逐项金额、自提点、合计。
  function renderOrderCard(order, allowCancel) {
    const c = copy();
    const info = getOrderStatusInfo(order);
    const paid = String(order.payment_status || order.paymentStatus || 'non_paid') === 'paid';
    const num = order.groupOrderNumberText || (order.orderNumber ? `${order.orderNumber}` : `${order.id}`);
    const dateText = formatOrderDate(order.created_at || order.createdAt);
    const nickname = order.userNickname || order.customer_name || getSavedNickname();
    const idText = order.userUuid || '';
    const pickup = order.pickup || {};
    const totalText = (order.total && order.total.text) || formatMoney(order.total_amount || 0);
    const cancellable = allowCancel && String(order.status || '') === 'pending';
    const prompting = cancellable && Number(state.cancelPromptId) === Number(order.id);
    const busy = Number(state.cancelBusyId) === Number(order.id);

    const itemsHtml = (order.items || []).map((it) => `
      <div class="my-order-line">
        <span class="my-order-line-name">${escapeHtml(it.title || '')} × ${escapeHtml(it.quantity || 0)}</span>
        <span class="my-order-line-price">${escapeHtml(it.subtotalText || formatMoney(it.subtotal || 0))}</span>
      </div>`).join('');

    const pickupHtml = (pickup.name || pickup.time || pickup.address) ? `
      <div class="my-order-pickup">
        ${pickup.name ? `<div class="my-order-pickup-name">${escapeHtml(pickup.name)}</div>` : ''}
        ${pickup.time ? `<div class="my-order-pickup-line">${escapeHtml(localizePickupTime(pickup.time))}</div>` : ''}
        ${pickup.address ? `<div class="my-order-pickup-line">${escapeHtml(pickup.address)}</div>` : ''}
      </div>` : '';

    const cancelHtml = !cancellable ? '' : (prompting ? `
      <div class="my-order-cancel-confirm">
        <div class="my-order-cancel-warn">${escapeHtml(c.cancelWarn)}</div>
        <div class="my-order-cancel-actions">
          <button class="shop-secondary-button shop-secondary-button--compact" type="button" data-order-cancel-dismiss>${escapeHtml(c.cancelKeep)}</button>
          <button class="my-order-cancel-yes" type="button" data-order-cancel-confirm="${escapeHtml(order.id)}" ${busy ? 'disabled' : ''}>${escapeHtml(busy ? c.ordersLoading : c.cancelConfirmYes)}</button>
        </div>
      </div>` : `
      <div class="my-order-cancel-row">
        <button class="my-order-cancel-btn" type="button" data-order-cancel="${escapeHtml(order.id)}">${escapeHtml(c.cancelOrder)}</button>
      </div>`);

    return `
      <div class="my-order-card my-order-card--rich">
        <div class="my-order-top">
          <div class="my-order-date">
            <span class="my-order-date-label">${escapeHtml(c.orderDateLabel)}</span>
            <strong class="my-order-date-value">${escapeHtml(dateText)}</strong>
          </div>
          <div class="my-order-badges">
            <span class="my-order-num-badge">${escapeHtml(num)}</span>
            <span class="my-order-status my-order-status--${escapeHtml(info.status)}">${escapeHtml(info.label)}</span>
          </div>
        </div>
        <div class="my-order-who">
          <span class="my-order-who-name">${escapeHtml(nickname)}</span>
          ${idText ? `<span class="my-order-who-id">${escapeHtml(c.idLabel)} ${escapeHtml(idText)}</span>` : ''}
        </div>
        <div class="my-order-lines">${itemsHtml}</div>
        ${pickupHtml}
        <div class="my-order-foot">
          <span class="my-order-pay ${paid ? 'is-paid' : ''}">${escapeHtml(paid ? c.paymentPaid : c.paymentUnpaid)}</span>
          <span class="my-order-total">${escapeHtml(totalText)}</span>
        </div>
        ${cancelHtml}
      </div>
    `;
  }

  function renderMyOrdersSection() {
    const c = copy();
    if (state.myOrdersLoading) return `<div class="empty compact">${escapeHtml(c.ordersLoading)}</div>`;
    if (state.myOrdersError) return `<div class="empty compact">${escapeHtml(state.myOrdersError)}</div>`;
    const orders = Array.isArray(state.myOrders) ? state.myOrders : [];

    const activeGroup = String((state.weeklyOrder && (state.weeklyOrder.active_group_id || state.weeklyOrder.group_no)) || '');
    const isThisWeek = (order) => activeGroup && String(order.group_id || order.groupId || '') === activeGroup;

    if (state.profileView === 'history') {
      const history = orders.filter((order) => !isThisWeek(order));
      if (!history.length) return `<div class="empty compact">${escapeHtml(c.historyEmpty)}</div>`;
      return `<div class="my-orders-list">${history.map((order) => renderOrderCard(order, false)).join('')}</div>`;
    }

    const live = orders.filter(isThisWeek);
    if (!live.length) return `<div class="empty compact">${escapeHtml(c.noThisWeekOrders)}</div>`;
    return `<div class="my-orders-list">${live.map((order) => renderOrderCard(order, true)).join('')}</div>`;
  }

  function refreshMyOrdersSection() {
    const el = document.getElementById('myOrdersSection');
    if (el) el.innerHTML = renderMyOrdersSection();
  }

  async function cancelMyOrder(orderId) {
    const c = copy();
    state.cancelBusyId = Number(orderId);
    refreshMyOrdersSection();
    try {
      await siteApiRequest(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
      state.cancelPromptId = null;
      state.cancelBusyId = null;
      await loadMyOrders();
    } catch (error) {
      state.cancelBusyId = null;
      state.cancelPromptId = null;
      refreshMyOrdersSection();
      alert(error.message || c.cancelFailed);
    }
  }

  async function loadMyOrders() {
    if (!state.auth || !state.auth.user) return;
    state.myOrdersLoading = true;
    state.myOrdersError = '';
    const section = document.getElementById('myOrdersSection');
    if (section) section.innerHTML = renderMyOrdersSection();
    try {
      const data = await siteApiRequest(`/api/orders/user/${state.auth.user.id}`);
      state.myOrders = data && Array.isArray(data.orders) ? data.orders : [];
    } catch (error) {
      state.myOrdersError = error.message || copy().ordersFailed;
    } finally {
      state.myOrdersLoading = false;
      const el = document.getElementById('myOrdersSection');
      if (el) el.innerHTML = renderMyOrdersSection();
    }
  }

  function renderOrderSuccessOverlay() {
    const c = copy();
    orderSuccessBody.innerHTML = `
      <div class="order-success-icon">✓</div>
      <div class="portal-title">${escapeHtml(c.successTitle)}</div>
      <div class="portal-sub">${escapeHtml(c.successMessage)}</div>
      <div class="portal-actions" style="justify-content:center;margin-top:1.4rem;">
        <button class="shop-secondary-button" type="button" data-order-success-close>${escapeHtml(c.successClose)}</button>
        <button class="shop-submit-button" type="button" data-order-success-orders>${escapeHtml(c.viewMyOrders)}</button>
      </div>
    `;
    openOverlay(orderSuccessOverlay);
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
      if (state.pendingSubmit) {
        state.pendingSubmit = false;
        closeOverlay(profileOverlay, profileOverlayBody);
        await submitWebOrder().catch((error) => alert(error.message));
        return;
      }
      // Google 登录后让用户确认/调整昵称，再进入“我的订单”。
      state.profileEditMode = true;
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
    const c = copy();
    const input = document.getElementById('profileNicknameInput');
    const nickname = input ? input.value.trim() : '';
    if (!nickname) {
      alert(c.emptyNickname);
      return;
    }
    const auth = await siteApiRequest('/api/auth/local-login', {
      method: 'POST',
      body: { client_id: getSiteClientId(), profile: { nickname } }
    });
    saveSiteAuth(auth);
    renderShop();
    if (state.pendingSubmit) {
      state.pendingSubmit = false;
      state.profileEditMode = false;
      closeOverlay(profileOverlay, profileOverlayBody);
      await submitWebOrder().catch((error) => alert(error.message));
      return;
    }
    state.profileEditMode = false;
    renderProfileOverlay();
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
    const noteInput = document.getElementById('shopOrderNoteInput');
    if (noteInput) state.note = noteInput.value;
    const note = (state.note || '').trim();
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
      <div class="confirm-section">
        <div class="confirm-pickup-head">
          <div class="confirm-heading">${escapeHtml(c.pickupInfo)}</div>
          <button class="confirm-pickup-change" type="button" data-shop-action="pickup-overlay">${escapeHtml(c.pickupChange)}</button>
        </div>
        ${pickup ? `
          <div class="confirm-pickup-line">${escapeHtml(getPickupLabel(pickup))}</div>
          ${pickupMeta ? `<div class="confirm-pickup-meta">${escapeHtml(pickupMeta)}</div>` : ''}
        ` : ''}
        ${note ? `<div class="confirm-note-line"><span class="confirm-note-label">${escapeHtml(c.orderComment)}</span>${escapeHtml(note)}</div>` : ''}
      </div>
      <div class="portal-actions confirm-actions">
        <button class="shop-secondary-button" type="button" data-order-confirm-close>${escapeHtml(c.cancelConfirm)}</button>
        <button class="shop-submit-button" type="button" data-confirm-action="submit">${escapeHtml(c.confirmSubmit)}</button>
      </div>
    `;
    openOverlay(orderConfirmOverlay);
  }

  function getSavedNickname() {
    if (!state.auth || !state.auth.user) return '';
    return state.auth.user.profile?.nickname || state.auth.user.nickname || '';
  }

  async function submitWebOrder() {
    const c = copy();
    const items = getSelectedItems();
    if (!items.length) {
      alert(c.emptyCart);
      return;
    }
    const nickname = getSavedNickname();
    // 没登录 / 没昵称：先记住待提交，跳到登录界面，存好昵称后自动继续下单。
    if (!nickname) {
      state.pendingSubmit = true;
      const noteInput = document.getElementById('shopOrderNoteInput');
      if (noteInput) state.note = noteInput.value;
      renderProfileOverlay();
      return;
    }
    const noteInput = document.getElementById('shopOrderNoteInput');
    if (noteInput) state.note = noteInput.value;
    const pickup = getPickup();
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
    // 重新拉取产品，让库存立即反映刚下的这单（否则显示的是下单前的旧库存）。
    await loadShopData();
    renderOrderSuccessOverlay();
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
      renderOrderConfirmOverlay();
    }
  });

  document.addEventListener('click', async (event) => {
    const pickupLauncher = event.target.closest('[data-shop-action="pickup-overlay"]');
    const profileAction = event.target.closest('[data-profile-action]');
    const pickupAction = event.target.closest('[data-pickup-action]');
    const confirmAction = event.target.closest('[data-confirm-action]');
    const confirmCopy = event.target.closest('[data-confirm-copy]');
    const adminAction = event.target.closest('[data-admin-action]');
    const profileClose = event.target.closest('[data-profile-close]');
    const pickupClose = event.target.closest('[data-pickup-close]');
    const confirmClose = event.target.closest('[data-order-confirm-close]');
    const successClose = event.target.closest('[data-order-success-close]');
    const successOrders = event.target.closest('[data-order-success-orders]');
    const adminClose = event.target.closest('[data-admin-close]');
    const profileView = event.target.closest('[data-profile-view]');
    const orderCancel = event.target.closest('[data-order-cancel]');
    const orderCancelConfirm = event.target.closest('[data-order-cancel-confirm]');
    const orderCancelDismiss = event.target.closest('[data-order-cancel-dismiss]');

    if (profileClose) {
      state.profileEditMode = false;
      state.profileView = 'main';
      closeOverlay(profileOverlay, profileOverlayBody);
    }
    if (pickupClose) closeOverlay(pickupOverlay, pickupOverlayBody);
    if (confirmClose) closeOverlay(orderConfirmOverlay, orderConfirmBody);
    if (successClose) closeOverlay(orderSuccessOverlay, orderSuccessBody);
    if (adminClose) closeOverlay(adminOverlay, adminOverlayBody);

    if (successOrders) {
      closeOverlay(orderSuccessOverlay, orderSuccessBody);
      state.profileEditMode = false;
      renderProfileOverlay();
    }

    if (confirmCopy) {
      copyToClipboard(confirmCopy.dataset.confirmCopy, confirmCopy);
    }

    if (pickupLauncher) {
      renderPickupOverlay();
    }
    if (profileAction) {
      if (profileAction.dataset.profileAction === 'edit') {
        state.profileEditMode = true;
        renderProfileOverlay();
        renderGoogleButton();
      } else {
        await saveProfileFromOverlay().catch((error) => alert(error.message));
      }
    }
    if (profileView) {
      state.profileView = profileView.dataset.profileView === 'history' ? 'history' : 'main';
      state.cancelPromptId = null;
      renderProfileLoggedIn();
    }
    if (orderCancelDismiss) {
      state.cancelPromptId = null;
      refreshMyOrdersSection();
    }
    if (orderCancel) {
      state.cancelPromptId = Number(orderCancel.dataset.orderCancel);
      refreshMyOrdersSection();
    }
    if (orderCancelConfirm) {
      await cancelMyOrder(Number(orderCancelConfirm.dataset.orderCancelConfirm));
    }
    if (pickupAction) {
      if (pickupAction.dataset.pickupAction === 'select') {
        state.pickupIndex = Number(pickupAction.dataset.index) || 0;
        renderPickupOverlay();
        renderShop();
        if (orderConfirmOverlay && !orderConfirmOverlay.hidden) renderOrderConfirmOverlay();
      }
      if (pickupAction.dataset.pickupAction === 'confirm') {
        state.pickupConfirmed = true;
        closeOverlay(pickupOverlay, pickupOverlayBody);
        renderShop();
        if (orderConfirmOverlay && !orderConfirmOverlay.hidden) renderOrderConfirmOverlay();
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
      state.profileEditMode = false;
      closeOverlay(orderConfirmOverlay, orderConfirmBody);
      closeOverlay(orderSuccessOverlay, orderSuccessBody);
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
