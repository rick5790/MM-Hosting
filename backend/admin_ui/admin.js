(function () {
  const root = document.getElementById("adminApp");
  if (!root) return;

  const COLLECTION_IMAGE_BASE = "https://api.makkiemua.com/uploads/collection";
  const COLLECTION_IMAGE_VERSION = "20260619";
  const COLLECTION_LIBRARY = [
    {
      group: "巴斯克蛋糕",
      items: [
        ["伯爵茶桂花冻巴斯克", "Earl Grey Osmanthus Jelly Basque", "collection-02.jpg"],
        ["斑斓芭乐巴斯克", "Pandan Guava Basque", "collection-12.jpg"],
        ["桂花芋泥巴斯克", "Osmanthus Taro Basque", "collection-16.jpg"],
        ["法葱巴斯克", "Scallion Basque", "collection-17.jpg"],
        ["泰式咸法酪巴斯克", "Thai Savory Fromage Basque", "collection-18.jpg"],
        ["海盐榴莲流心巴斯克", "Sea Salt Durian Lava Basque", "collection-19.jpg"],
        ["黑松露流心巴斯克", "Black Truffle Lava Basque", "collection-36.jpg"],
        ["绢豆腐慕斯巴斯克", "Silken Tofu Mousse Basque", "collection-27.jpg"],
        ["酒酿姜撞奶巴斯克", "Fermented Rice Ginger Milk Basque", "collection-31.jpg"]
      ]
    },
    {
      group: "Makkie 胖曲奇",
      items: [
        ["咸奶茶炒米胖曲奇", "Salted Milk Tea Toasted Rice Makkie", "collection-04.jpg"],
        ["朗姆酒提子胖曲奇", "Rum Raisin Makkie", "collection-13.jpg"],
        ["玄米茶蜜瓜胖曲奇", "Genmaicha Melon Makkie", "collection-22.jpg"],
        ["芋泥椰椰胖曲奇", "Taro Coconut Makkie", "collection-28.jpg"],
        ["迪拜巧克力胖曲奇", "Dubai Chocolate Makkie", "collection-29.jpg"],
        ["金沙双黄胖曲奇", "Salted Egg Yolk Makkie", "collection-32.jpg"],
        ["黄油柿饼胖曲奇", "Butter Dried Persimmon Makkie", "collection-34.jpg"]
      ]
    },
    {
      group: "戚风夹心",
      items: [
        ["伯爵红茶草莓布丁戚风三明治", "Earl Grey Strawberry Pudding Chiffon Sandwich", "collection-01.jpg"],
        ["稻香米麻薯四重奏戚风三明治", "Rice Aroma Mochi Quartet Chiffon Sandwich", "collection-08.jpg"],
        ["斑斓芒果糯米戚风三明治", "Pandan Mango Sticky Rice Chiffon Sandwich", "collection-11.jpg"],
        ["杨枝甘露奶皮子戚风三明治", "Mango Pomelo Milk Skin Chiffon Sandwich", "collection-14.jpg"],
        ["焙茶流心柿子", "Hojicha Lava Persimmon", "collection-20.jpg"],
        ["玄米茶茉莉玫珑蜜瓜戚风三明治", "Genmaicha Jasmine Melon Chiffon Sandwich", "collection-21.jpg"],
        ["紫苏白桃芭乐戚风三明治", "Shiso White Peach Guava Chiffon Sandwich", "collection-26.jpg"],
        ["黑芝麻豆乳戚风三明治", "Black Sesame Soy Milk Chiffon Sandwich", "collection-35.jpg"]
      ]
    },
    {
      group: "米布丁",
      items: [
        ["大红袍奶冻无花果米布丁", "Da Hong Pao Panna Cotta Fig Rice Pudding", "collection-05.jpg"],
        ["巧克力香蕉米布丁", "Chocolate Banana Rice Pudding", "collection-06.jpg"],
        ["玫瑰奶冻清酒草莓米布丁", "Rose Panna Cotta Sake Strawberry Rice Pudding", "collection-23.jpg"],
        ["香芋葡萄奶皮子米布丁", "Taro Grape Milk Skin Rice Pudding", "collection-33.jpg"]
      ]
    },
    {
      group: "布丁奶糕",
      items: [
        ["桂花柿子酒酿布丁奶糕", "Osmanthus Persimmon Fermented Rice Milk Cake", "collection-15.jpg"],
        ["甜玉米爆米花布丁奶糕", "Sweet Corn Popcorn Pudding Milk Cake", "collection-25.jpg"]
      ]
    },
    {
      group: "酥皮与挞挞",
      items: [
        ["伯爵茶米麻薯挞挞", "Earl Grey Rice Mochi Tart", "collection-03.jpg"],
        ["抹茶米麻薯挞挞", "Matcha Rice Mochi Tart", "collection-09.jpg"],
        ["开心莓满拿破仑酥", "Pistachio Berry Napoleon", "collection-07.jpg"],
        ["玫瑰荔枝拿破仑酥", "Rose Lychee Napoleon", "collection-24.jpg"]
      ]
    },
    {
      group: "创意甜品",
      items: [
        ["迪拜糯曲奇", "Dubai Mochi Cookie", "collection-30.jpg"]
      ]
    }
  ].map((group) => ({
    ...group,
    items: group.items.map(([zh, en, file]) => ({
      id: file,
      zh,
      en,
      file,
      image_url: `${COLLECTION_IMAGE_BASE}/${file}?v=${COLLECTION_IMAGE_VERSION}`
    }))
  }));

  const state = {
    token: loadToken(),
    activeView: "current_orders",
    orders: [],
    pickups: [],
    products: [],
    members: [],
    weeklyOrder: null,
    stats: null,
    selectedOrderId: null,
    selectedUserId: null,
    selectedProductId: null,
    flash: null,
    filters: {
      q: "",
      status: "",
      payment_status: ""
    }
  };

  function loadToken() {
    try {
      return localStorage.getItem("makkie.web.admin.token") || "";
    } catch (error) {
      return "";
    }
  }

  function saveToken(token) {
    state.token = token || "";
    try {
      if (token) localStorage.setItem("makkie.web.admin.token", token);
      else localStorage.removeItem("makkie.web.admin.token");
    } catch (error) {}
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMoney(value) {
    const amount = Number(value) || 0;
    return `$${amount.toFixed(2)}`;
  }

  function formatDate(value) {
    if (!value) return "未记录";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function readOptionalNumber(value) {
    const text = String(value == null ? "" : value).trim();
    if (!text) return null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function api(path, options = {}) {
    const headers = {
      ...(state.token ? { authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    };

    let body = options.body;
    if (!(body instanceof FormData)) {
      headers["content-type"] = "application/json";
      body = body ? JSON.stringify(body) : undefined;
    }

    const response = await fetch(path, {
      method: options.method || "GET",
      headers,
      body
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      const error = new Error(payload.message || payload.detail || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return payload.data || payload || {};
  }

  function setFlash(type, text) {
    state.flash = text ? { type, text } : null;
    render();
  }

  function currentGroupId() {
    return String(
      (state.weeklyOrder && (state.weeklyOrder.active_group_id || state.weeklyOrder.group_no)) || ""
    );
  }

  function matchesFilters(order) {
    if (state.filters.q) {
      const haystack = JSON.stringify([
        order.id,
        order.groupOrderNumberText,
        order.orderNumber,
        order.userNickname
      ]).toLowerCase();
      if (!haystack.includes(state.filters.q.toLowerCase())) return false;
    }
    if (state.filters.status && order.status !== state.filters.status) return false;
    if (state.filters.payment_status && order.payment_status !== state.filters.payment_status) return false;
    return true;
  }

  function getCurrentOrders() {
    const groupId = currentGroupId();
    return state.orders.filter((order) => String(order.group_id || order.groupId || "") === groupId && matchesFilters(order));
  }

  function getHistoryOrders() {
    const groupId = currentGroupId();
    return state.orders.filter((order) => String(order.group_id || order.groupId || "") !== groupId && matchesFilters(order));
  }

  function getVisibleOrders() {
    if (state.activeView === "history_orders") return getHistoryOrders();
    return getCurrentOrders();
  }

  function getSelectedOrder() {
    const orders = getVisibleOrders();
    return orders.find((order) => Number(order.id) === Number(state.selectedOrderId)) || orders[0] || null;
  }

  function getSelectedUser() {
    return state.members.find((member) => Number(member.id) === Number(state.selectedUserId)) || state.members[0] || null;
  }

  function getSelectedProduct() {
    return state.products.find((product) => Number(product.id) === Number(state.selectedProductId)) || state.products[0] || null;
  }

  function getUserOrders(userId) {
    return state.orders.filter((order) => Number(order.user_id) === Number(userId));
  }

  function getProductMetrics(productId) {
    return state.orders.reduce((acc, order) => {
      (order.items || []).forEach((item) => {
        if (Number(item.product_id) !== Number(productId)) return;
        acc.quantity += Number(item.quantity) || 0;
        acc.revenue += Number(item.subtotal) || 0;
      });
      return acc;
    }, { quantity: 0, revenue: 0 });
  }

  function renderFlash() {
    if (!state.flash) return "";
    return `<div class="flash ${escapeHtml(state.flash.type)}">${escapeHtml(state.flash.text)}</div>`;
  }

  function renderLogin() {
    root.innerHTML = `
      <div class="admin-login-shell">
        <div class="admin-login-card">
          <p class="eyebrow">Makkie Admin</p>
          <h1 class="title">登录后台</h1>
          <p class="sub">这里管理网页订单、前端甜品、自提设置和用户数据。</p>
          <form class="form-stack" id="loginForm">
            <label class="field">
              <span>用户名</span>
              <input class="input" type="text" name="username" autocomplete="username" required>
            </label>
            <label class="field">
              <span>密码</span>
              <input class="input" type="password" name="password" autocomplete="current-password" required>
            </label>
            <button class="button" type="submit">进入后台</button>
          </form>
          ${renderFlash()}
        </div>
      </div>
    `;
  }

  function renderStats() {
    const stats = state.stats || {};
    return `
      <div class="stats-grid">
        <section class="stat-card">
          <span>订单数</span>
          <strong>${escapeHtml(stats.order_count || 0)}</strong>
        </section>
        <section class="stat-card">
          <span>总收入</span>
          <strong>${escapeHtml(stats.total_revenue_text || "$0")}</strong>
        </section>
        <section class="stat-card">
          <span>用户数</span>
          <strong>${escapeHtml(stats.user_count || 0)}</strong>
        </section>
        <section class="stat-card">
          <span>上架甜品</span>
          <strong>${escapeHtml(state.products.filter((item) => Number(item.is_active) === 1).length)}</strong>
        </section>
      </div>
    `;
  }

  function renderViewTabs() {
    const tabs = [
      ["current_orders", "本周订单"],
      ["history_orders", "历史订单"],
      ["users", "用户"],
      ["products", "产品"]
    ];

    return `
      <section class="view-tabs-card">
        <div class="view-tabs">
          ${tabs.map(([key, label]) => `
            <button class="view-tab ${state.activeView === key ? "active" : ""}" type="button" data-view-tab="${escapeHtml(key)}">${escapeHtml(label)}</button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderPickupSettings() {
    if (!state.pickups.length) {
      return `
        <section class="pickup-settings-card">
          <p class="eyebrow">Pickup Settings</p>
          <div class="empty">还没有自提点数据。</div>
        </section>
      `;
    }

    return `
      <section class="pickup-settings-card">
        <div class="settings-head">
          <div>
            <p class="eyebrow">Pickup Settings</p>
            <h2 class="section-heading">自提时间设置</h2>
            <p class="sub">这里可以改 Irvine / LA 的地址、默认自提时间和具体指引。</p>
          </div>
        </div>
        <div class="pickup-settings-grid">
          ${state.pickups.map((pickup) => `
            <form class="pickup-setting-form" data-pickup-id="${escapeHtml(pickup.id)}">
              <div class="pickup-setting-card">
                <p class="section-title pickup-setting-title">${escapeHtml(pickup.name || "自提点")}</p>
                <label class="field">
                  <span>名称</span>
                  <input class="input" type="text" name="name" value="${escapeHtml(pickup.name || "")}" required>
                </label>
                <label class="field">
                  <span>地址</span>
                  <textarea class="textarea textarea-compact" name="address" required>${escapeHtml(pickup.address || "")}</textarea>
                </label>
                <label class="field">
                  <span>自提时间</span>
                  <input class="input" type="text" name="pickup_time" value="${escapeHtml(pickup.pickup_time || pickup.time || "")}" placeholder="例如：周六 12:30 - 13:00">
                </label>
                <label class="field">
                  <span>具体指引</span>
                  <textarea class="textarea textarea-compact" name="note" placeholder="例如：Heritage Plaza, Chase 银行停车场靠近ATM机，Tesla充电桩对面">${escapeHtml(pickup.note || pickup.instruction || "")}</textarea>
                </label>
                <div class="actions-row">
                  <button class="button-secondary" type="submit">保存自提设置</button>
                </div>
              </div>
            </form>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderOrderList(orders, emptyText) {
    if (!orders.length) {
      return `<div class="empty">${escapeHtml(emptyText)}</div>`;
    }

    return orders.map((order) => `
      <button class="order-row ${Number(order.id) === Number(state.selectedOrderId) ? "active" : ""}" type="button" data-order-select="${escapeHtml(order.id)}">
        <div class="row-line row-main">
          <span>${escapeHtml(order.groupOrderNumberText || order.orderNumber || order.id)}</span>
          <span>${escapeHtml(formatMoney(order.total_amount))}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(order.userNickname || "微信用户")}</span>
          <span>${escapeHtml(order.status || "pending")} · ${escapeHtml(order.payment_status || "non_paid")}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(order.pickup && order.pickup.name ? order.pickup.name : "")}</span>
          <span>${escapeHtml(formatDate(order.created_at))}</span>
        </div>
      </button>
    `).join("");
  }

  function renderUserList() {
    if (!state.members.length) return `<div class="empty">还没有用户数据。</div>`;
    return state.members.map((member) => `
      <button class="list-row ${Number(member.id) === Number(state.selectedUserId) ? "active" : ""}" type="button" data-user-select="${escapeHtml(member.id)}">
        <div class="row-line row-main">
          <span>${escapeHtml(member.nickname || "微信用户")}</span>
          <span>${escapeHtml(member.total_spent_text || "$0")}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(member.order_count || 0)} 单</span>
          <span>${escapeHtml(formatDate(member.last_order_at))}</span>
        </div>
      </button>
    `).join("");
  }

  function renderProductList() {
    if (!state.products.length) return `<div class="empty">还没有甜品数据。</div>`;
    return state.products.map((product) => `
      <button class="list-row ${Number(product.id) === Number(state.selectedProductId) ? "active" : ""}" type="button" data-product-select="${escapeHtml(product.id)}">
        <div class="row-line row-main">
          <span>${escapeHtml(product.name || "未命名甜品")}</span>
          <span>${escapeHtml(formatMoney(product.price || 0))}</span>
        </div>
        <div class="row-line row-sub">
          <span>库存 ${escapeHtml(product.stock || 0)}</span>
          <span>${Number(product.is_active) === 1 ? "上架中" : "已隐藏"}</span>
        </div>
      </button>
    `).join("");
  }

  function renderOrderDetail() {
    const order = getSelectedOrder();
    if (!order) return `<div class="empty">选择左边订单后，这里会显示详情。</div>`;

    return `
      <div class="detail-head">
        <div>
          <p class="eyebrow">Order Detail</p>
          <h2 class="title detail-title">${escapeHtml(order.groupOrderNumberText || order.orderNumber || order.id)}</h2>
          <p class="sub">${escapeHtml(order.userNickname || "微信用户")}</p>
        </div>
        <span class="pill">${escapeHtml(formatMoney(order.total_amount))}</span>
      </div>

      <div class="detail-grid">
        <div class="detail-meta">
          <span>自提点</span>
          <strong>${escapeHtml(order.pickup && order.pickup.name ? order.pickup.name : "未填写")}</strong>
        </div>
        <div class="detail-meta">
          <span>订单状态</span>
          <strong>${escapeHtml(order.status || "pending")}</strong>
        </div>
        <div class="detail-meta">
          <span>付款状态</span>
          <strong>${escapeHtml(order.payment_status || "non_paid")}</strong>
        </div>
        <div class="detail-meta">
          <span>付款方式</span>
          <strong>${escapeHtml(order.payment_method || "未记录")}</strong>
        </div>
      </div>

      <div class="section-block">
        <p class="section-title">订单内容</p>
        <div class="item-list">
          ${(order.items || []).map((item) => `
            <div class="item-row">
              <span>${escapeHtml(item.title || "")} × ${escapeHtml(item.quantity || 0)}</span>
              <span>${escapeHtml(item.subtotalText || formatMoney(item.subtotal || 0))}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="section-block">
        <p class="section-title">顾客备注</p>
        <div>${escapeHtml(order.notes || "无")}</div>
      </div>

      <form class="section-block form-stack" id="commentForm" data-order-id="${escapeHtml(order.id)}">
        <p class="section-title">管理员备注</p>
        <textarea class="textarea" name="admin_comment" placeholder="比如：已确认付款、客户稍后自提。">${escapeHtml(order.admin_comment || "")}</textarea>
        <div class="actions-row">
          <button class="button-secondary" type="submit">保存备注</button>
        </div>
      </form>

      <form class="section-block form-stack" id="paymentForm" data-order-id="${escapeHtml(order.id)}">
        <p class="section-title">付款信息</p>
        <label class="field">
          <span>付款状态</span>
          <select class="select" name="payment_status">
            ${renderOptions(["non_paid", "paid", "refunded"], order.payment_status || "non_paid")}
          </select>
        </label>
        <label class="field">
          <span>付款方式</span>
          <select class="select" name="payment_method">
            ${renderPaymentMethodOptions(order.payment_method || "")}
          </select>
        </label>
        <label class="field">
          <span>付款说明</span>
          <textarea class="textarea" name="payment_note" placeholder="比如：已收定金 / Venmo 尾号确认。">${escapeHtml(order.payment_note || "")}</textarea>
        </label>
        <div class="actions-row">
          <button class="button-secondary" type="submit">保存付款信息</button>
        </div>
      </form>

      <form class="section-block form-stack" id="statusForm" data-order-id="${escapeHtml(order.id)}">
        <p class="section-title">订单状态</p>
        <label class="field">
          <span>状态</span>
          <select class="select" name="status">
            ${renderOptions(["pending", "paid", "making", "ready", "completed", "cancelled"], order.status || "pending")}
          </select>
        </label>
        <div class="actions-row">
          <button class="button-secondary" type="submit">保存订单状态</button>
        </div>
      </form>
    `;
  }

  function renderUserDetail() {
    const user = getSelectedUser();
    if (!user) return `<div class="empty">选择左边用户后，这里会显示详情。</div>`;
    const orders = getUserOrders(user.id);

    return `
      <div class="detail-head">
        <div>
          <p class="eyebrow">User Detail</p>
          <h2 class="title detail-title">${escapeHtml(user.nickname || "微信用户")}</h2>
          <p class="sub">最近下单：${escapeHtml(formatDate(user.last_order_at))}</p>
        </div>
        <span class="pill">${escapeHtml(user.total_spent_text || "$0")}</span>
      </div>

      <div class="detail-grid">
        <div class="detail-meta">
          <span>用户 ID</span>
          <strong>${escapeHtml(user.id)}</strong>
        </div>
        <div class="detail-meta">
          <span>总订单数</span>
          <strong>${escapeHtml(user.order_count || 0)}</strong>
        </div>
        <div class="detail-meta">
          <span>累计消费</span>
          <strong>${escapeHtml(user.total_spent_text || "$0")}</strong>
        </div>
        <div class="detail-meta">
          <span>最近下单时间</span>
          <strong>${escapeHtml(formatDate(user.last_order_at))}</strong>
        </div>
      </div>

      <div class="section-block">
        <p class="section-title">该用户订单</p>
        <div class="item-list">
          ${orders.length ? orders.map((order) => `
            <button class="mini-order-row" type="button" data-view-tab="current_orders" data-order-jump="${escapeHtml(order.id)}">
              <span>${escapeHtml(order.groupOrderNumberText || order.orderNumber || order.id)} · ${escapeHtml(formatMoney(order.total_amount))}</span>
              <span>${escapeHtml(formatDate(order.created_at))}</span>
            </button>
          `).join("") : `<div class="empty compact">这个用户还没有订单。</div>`}
        </div>
      </div>
    `;
  }

  function renderCollectionOptions() {
    return COLLECTION_LIBRARY.map((group) => `
      <optgroup label="${escapeHtml(group.group)}">
        ${group.items.map((item) => `
          <option value="${escapeHtml(item.id)}">${escapeHtml(item.zh)} / ${escapeHtml(item.en)}</option>
        `).join("")}
      </optgroup>
    `).join("");
  }

  function findCollectionPreset(id) {
    for (const group of COLLECTION_LIBRARY) {
      const found = group.items.find((item) => item.id === id);
      if (found) return { ...found, group: group.group };
    }
    return null;
  }

  function renderProductDetail() {
    const product = getSelectedProduct();
    const metrics = product ? getProductMetrics(product.id) : { quantity: 0, revenue: 0 };

    return `
      <div class="product-manager-grid">
        <section class="section-block product-create-block">
          <p class="eyebrow">Create Product</p>
          <h2 class="section-heading">从图鉴创建甜品</h2>
          <form class="form-stack" id="collectionCreateForm">
            <label class="field">
              <span>图鉴甜品</span>
              <select class="select" name="preset_id" required>
                <option value="">请选择图鉴甜品</option>
                ${renderCollectionOptions()}
              </select>
            </label>
            <label class="field">
              <span>价格</span>
              <input class="input" type="number" name="price" step="0.01" min="0" required>
            </label>
            <label class="field">
              <span>库存</span>
              <input class="input" type="number" name="stock" min="0" required>
            </label>
            <label class="field">
              <span>限购</span>
              <input class="input" type="number" name="limit_per_order" min="0" placeholder="留空表示不限购">
            </label>
            <label class="field">
              <span>描述</span>
              <textarea class="textarea textarea-compact" name="description" placeholder="可选，默认沿用图鉴图作为商品图。"></textarea>
            </label>
            <div class="actions-row">
              <button class="button" type="submit">从图鉴创建</button>
            </div>
          </form>
        </section>

        <section class="section-block product-create-block">
          <p class="eyebrow">Upload New</p>
          <h2 class="section-heading">上传图片创建新甜品</h2>
          <form class="form-stack" id="customCreateForm">
            <label class="field">
              <span>商品名</span>
              <input class="input" type="text" name="name" required>
            </label>
            <label class="field">
              <span>价格</span>
              <input class="input" type="number" name="price" step="0.01" min="0" required>
            </label>
            <label class="field">
              <span>库存</span>
              <input class="input" type="number" name="stock" min="0" required>
            </label>
            <label class="field">
              <span>限购</span>
              <input class="input" type="number" name="limit_per_order" min="0" placeholder="留空表示不限购">
            </label>
            <label class="field">
              <span>描述</span>
              <textarea class="textarea textarea-compact" name="description"></textarea>
            </label>
            <label class="field">
              <span>商品图片</span>
              <input class="input" type="file" name="image" accept="image/*" required>
            </label>
            <div class="actions-row">
              <button class="button" type="submit">上传并创建</button>
            </div>
          </form>
        </section>
      </div>
      ${product ? `
        <section class="section-block product-edit-block">
          <div class="detail-head">
            <div>
              <p class="eyebrow">Product Detail</p>
              <h2 class="title detail-title">${escapeHtml(product.name || "未命名甜品")}</h2>
              <p class="sub">销量 ${escapeHtml(metrics.quantity)} · 收入 ${escapeHtml(formatMoney(metrics.revenue))}</p>
            </div>
            <span class="pill">${Number(product.is_active) === 1 ? "上架中" : "已隐藏"}</span>
          </div>
          <form class="form-stack" id="productEditForm" data-product-id="${escapeHtml(product.id)}">
            <div class="product-detail-grid">
              <div class="product-preview-card">
                ${product.image_url ? `<img class="product-preview-image" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name || "")}">` : `<div class="product-preview-empty">暂无商品图</div>`}
              </div>
              <div class="form-stack">
                <label class="field">
                  <span>商品名</span>
                  <input class="input" type="text" name="name" value="${escapeHtml(product.name || "")}" required>
                </label>
                <label class="field">
                  <span>价格</span>
                  <input class="input" type="number" name="price" step="0.01" min="0" value="${escapeHtml(product.price || 0)}" required>
                </label>
                <label class="field">
                  <span>库存</span>
                  <input class="input" type="number" name="stock" min="0" value="${escapeHtml(product.stock || 0)}" required>
                </label>
                <label class="field">
                  <span>限购</span>
                  <input class="input" type="number" name="limit_per_order" min="0" value="${escapeHtml(product.limit_per_order == null ? "" : product.limit_per_order)}">
                </label>
                <label class="field">
                  <span>状态</span>
                  <select class="select" name="is_active">
                    <option value="1" ${Number(product.is_active) === 1 ? "selected" : ""}>上架中</option>
                    <option value="0" ${Number(product.is_active) === 0 ? "selected" : ""}>隐藏</option>
                  </select>
                </label>
              </div>
            </div>
            <label class="field">
              <span>描述</span>
              <textarea class="textarea" name="description">${escapeHtml(product.description || "")}</textarea>
            </label>
            <label class="field">
              <span>更新商品图</span>
              <input class="input" type="file" name="image" accept="image/*">
            </label>
            <div class="actions-row">
              <button class="button-secondary" type="submit">保存甜品信息</button>
              <button class="button-danger" type="button" data-product-delete="${escapeHtml(product.id)}">删除甜品</button>
            </div>
          </form>
        </section>
      ` : `<div class="empty">左边选一个甜品后，这里可以编辑。</div>`}
    `;
  }

  function renderOptions(values, current) {
    return values.map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(value)}</option>
    `).join("");
  }

  function renderPaymentMethodOptions(current) {
    const values = [
      ["", "未记录"],
      ["cash", "cash"],
      ["venmo", "venmo"],
      ["zelle", "zelle"],
      ["alipay", "alipay"]
    ];
    return values.map(([value, label]) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function renderSidebarContent() {
    if (state.activeView === "users") {
      return `
        <section class="admin-sidebar-card">
          <p class="eyebrow">Users</p>
          <div class="order-list">${renderUserList()}</div>
        </section>
      `;
    }

    if (state.activeView === "products") {
      return `
        <section class="admin-sidebar-card">
          <p class="eyebrow">Products</p>
          <div class="order-list">${renderProductList()}</div>
        </section>
      `;
    }

    return `
      <section class="admin-sidebar-card">
        <p class="eyebrow">${state.activeView === "history_orders" ? "History Orders" : "Current Week Orders"}</p>
        <div class="filter-grid">
          <input class="input" id="searchInput" placeholder="搜索昵称 / 订单号" value="${escapeHtml(state.filters.q)}">
          <select class="select" id="statusFilter">
            <option value="">全部订单状态</option>
            ${renderOptions(["pending", "paid", "making", "ready", "completed", "cancelled"], state.filters.status)}
          </select>
          <select class="select" id="paymentFilter">
            <option value="">全部付款状态</option>
            ${renderOptions(["non_paid", "paid", "refunded"], state.filters.payment_status)}
          </select>
          <button class="button-secondary" type="button" id="filterButton">应用筛选</button>
        </div>
        <div class="order-list">${renderOrderList(getVisibleOrders(), state.activeView === "history_orders" ? "还没有历史订单。" : "本周还没有订单。")}</div>
      </section>
    `;
  }

  function renderMainContent() {
    if (state.activeView === "users") {
      return `<section class="admin-detail-card">${renderUserDetail()}</section>`;
    }
    if (state.activeView === "products") {
      return `<section class="admin-detail-card">${renderProductDetail()}</section>`;
    }
    return `<section class="admin-detail-card">${renderOrderDetail()}</section>`;
  }

  function renderDashboard() {
    root.innerHTML = `
      <div class="admin-shell">
        <section class="admin-topbar">
          <div>
            <p class="eyebrow">Makkie Web Admin</p>
            <h1 class="title" style="font-size:38px;">网页后台</h1>
            <p class="sub">管理前端甜品、本周订单、历史订单、用户数据与自提设置。</p>
          </div>
          <div class="admin-topbar-actions">
            <button class="button-secondary" type="button" id="refreshButton">刷新</button>
            <button class="button-secondary" type="button" id="logoutButton">退出登录</button>
          </div>
        </section>
        ${renderStats()}
        ${renderFlash()}
        ${renderViewTabs()}
        ${renderPickupSettings()}
        <div class="admin-layout">
          ${renderSidebarContent()}
          ${renderMainContent()}
        </div>
      </div>
    `;
  }

  function ensureSelections() {
    const visibleOrders = getVisibleOrders();
    if (!visibleOrders.some((order) => Number(order.id) === Number(state.selectedOrderId))) {
      state.selectedOrderId = visibleOrders[0] ? visibleOrders[0].id : null;
    }
    if (!state.members.some((member) => Number(member.id) === Number(state.selectedUserId))) {
      state.selectedUserId = state.members[0] ? state.members[0].id : null;
    }
    if (!state.products.some((product) => Number(product.id) === Number(state.selectedProductId))) {
      state.selectedProductId = state.products[0] ? state.products[0].id : null;
    }
  }

  function render() {
    if (!state.token) {
      renderLogin();
      return;
    }
    ensureSelections();
    renderDashboard();
  }

  async function loadDashboard() {
    try {
      const [statsData, ordersData, pickupsData, weeklyOrderData, productsData, membersData] = await Promise.all([
        api("/api/admin/stats"),
        api("/api/admin/orders"),
        api("/api/admin/pickup-locations"),
        api("/api/admin/weekly-order"),
        api("/api/admin/products"),
        api("/api/admin/analytics/members?sort=total_spent&limit=500")
      ]);

      state.stats = statsData.stats || null;
      state.orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
      state.pickups = Array.isArray(pickupsData.pickup_locations) ? pickupsData.pickup_locations : [];
      state.weeklyOrder = weeklyOrderData.weekly_order || null;
      state.products = Array.isArray(productsData.products) ? productsData.products : [];
      state.members = Array.isArray(membersData.members) ? membersData.members : [];

      ensureSelections();
      render();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        saveToken("");
        state.orders = [];
        state.pickups = [];
        state.products = [];
        state.members = [];
        state.stats = null;
        state.weeklyOrder = null;
        state.selectedOrderId = null;
        state.selectedUserId = null;
        state.selectedProductId = null;
        setFlash("error", "登录已失效，请重新登录。");
        return;
      }
      setFlash("error", error.message || "后台读取失败");
    }
  }

  async function handleLogin(form) {
    const formData = new FormData(form);
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: {
          username: formData.get("username"),
          password: formData.get("password")
        }
      });
      saveToken(data.token || "");
      setFlash("success", "登录成功。");
      await loadDashboard();
    } catch (error) {
      setFlash("error", error.message || "登录失败");
    }
  }

  async function uploadProductImage(productId, file) {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await api(`/api/admin/products/${productId}/image`, {
      method: "POST",
      body: formData
    });
  }

  async function createProductFromCollection(form) {
    const data = new FormData(form);
    const preset = findCollectionPreset(String(data.get("preset_id") || ""));
    if (!preset) {
      setFlash("error", "请先选择一个图鉴甜品。");
      return;
    }

    await api("/api/admin/products", {
      method: "POST",
      body: {
        weekly_order_id: state.weeklyOrder && state.weeklyOrder.id ? Number(state.weeklyOrder.id) : null,
        category: preset.group || "Collection",
        name: preset.zh,
        description: data.get("description") || "",
        image_url: preset.image_url,
        price: data.get("price") || 0,
        stock: data.get("stock") || 0,
        limit_per_order: readOptionalNumber(data.get("limit_per_order")),
        is_active: 1
      }
    });

    setFlash("success", "图鉴甜品已创建。");
    await loadDashboard();
  }

  async function createCustomProduct(form) {
    const data = new FormData(form);
    const productData = await api("/api/admin/products", {
      method: "POST",
      body: {
        weekly_order_id: state.weeklyOrder && state.weeklyOrder.id ? Number(state.weeklyOrder.id) : null,
        category: "Custom Upload",
        name: data.get("name") || "",
        description: data.get("description") || "",
        price: data.get("price") || 0,
        stock: data.get("stock") || 0,
        limit_per_order: readOptionalNumber(data.get("limit_per_order")),
        is_active: 1
      }
    });

    const product = productData.product;
    const file = data.get("image");
    if (product && file && typeof file === "object" && file.name) {
      await uploadProductImage(product.id, file);
    }

    setFlash("success", "新甜品已创建。");
    await loadDashboard();
  }

  async function saveProduct(form) {
    const productId = Number(form.dataset.productId);
    const data = new FormData(form);
    await api(`/api/admin/products/${productId}`, {
      method: "PATCH",
      body: {
        name: data.get("name") || "",
        description: data.get("description") || "",
        price: data.get("price") || 0,
        stock: data.get("stock") || 0,
        limit_per_order: readOptionalNumber(data.get("limit_per_order")),
        is_active: Number(data.get("is_active") || 0)
      }
    });

    const file = data.get("image");
    if (file && typeof file === "object" && file.name) {
      await uploadProductImage(productId, file);
    }

    setFlash("success", "甜品信息已保存。");
    await loadDashboard();
    state.selectedProductId = productId;
    render();
  }

  async function deleteProduct(productId) {
    if (!window.confirm("确定删除这个甜品吗？如果已有订单记录，系统会阻止删除。")) return;
    try {
      await api(`/api/admin/products/${productId}`, {
        method: "DELETE"
      });
      setFlash("success", "甜品已删除。");
      await loadDashboard();
    } catch (error) {
      setFlash("error", error.message || "删除失败");
    }
  }

  async function saveOrderPatch(orderId, path, body, successText) {
    try {
      await api(path, {
        method: "PATCH",
        body
      });
      setFlash("success", successText);
      await loadDashboard();
      state.selectedOrderId = Number(orderId);
      render();
    } catch (error) {
      setFlash("error", error.message || "保存失败");
    }
  }

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.id === "loginForm") {
      event.preventDefault();
      handleLogin(form);
      return;
    }

    if (form.id === "commentForm") {
      event.preventDefault();
      const data = new FormData(form);
      saveOrderPatch(
        form.dataset.orderId,
        `/api/admin/orders/${form.dataset.orderId}/comment`,
        { admin_comment: data.get("admin_comment") || "" },
        "管理员备注已保存。"
      );
      return;
    }

    if (form.id === "paymentForm") {
      event.preventDefault();
      const data = new FormData(form);
      saveOrderPatch(
        form.dataset.orderId,
        `/api/admin/orders/${form.dataset.orderId}/payment`,
        {
          payment_status: data.get("payment_status") || "non_paid",
          payment_method: data.get("payment_method") || "",
          payment_note: data.get("payment_note") || ""
        },
        "付款信息已保存。"
      );
      return;
    }

    if (form.id === "statusForm") {
      event.preventDefault();
      const data = new FormData(form);
      saveOrderPatch(
        form.dataset.orderId,
        `/api/admin/orders/${form.dataset.orderId}/status`,
        { status: data.get("status") || "pending" },
        "订单状态已保存。"
      );
      return;
    }

    if (form.matches(".pickup-setting-form")) {
      event.preventDefault();
      const data = new FormData(form);
      api(`/api/admin/pickup-locations/${form.dataset.pickupId}`, {
        method: "PATCH",
        body: {
          name: data.get("name") || "",
          address: data.get("address") || "",
          pickup_time: data.get("pickup_time") || "",
          note: data.get("note") || ""
        }
      })
        .then(async () => {
          setFlash("success", "自提设置已保存。");
          await loadDashboard();
        })
        .catch((error) => {
          setFlash("error", error.message || "保存失败");
        });
      return;
    }

    if (form.id === "collectionCreateForm") {
      event.preventDefault();
      createProductFromCollection(form).catch((error) => setFlash("error", error.message || "创建失败"));
      return;
    }

    if (form.id === "customCreateForm") {
      event.preventDefault();
      createCustomProduct(form).catch((error) => setFlash("error", error.message || "创建失败"));
      return;
    }

    if (form.id === "productEditForm") {
      event.preventDefault();
      saveProduct(form).catch((error) => setFlash("error", error.message || "保存失败"));
    }
  });

  document.addEventListener("click", (event) => {
    const orderButton = event.target.closest("[data-order-select]");
    const userButton = event.target.closest("[data-user-select]");
    const productButton = event.target.closest("[data-product-select]");
    const tabButton = event.target.closest("[data-view-tab]");
    const jumpButton = event.target.closest("[data-order-jump]");
    const deleteButton = event.target.closest("[data-product-delete]");

    if (orderButton) {
      state.selectedOrderId = Number(orderButton.dataset.orderSelect);
      render();
      return;
    }

    if (userButton) {
      state.selectedUserId = Number(userButton.dataset.userSelect);
      render();
      return;
    }

    if (productButton) {
      state.selectedProductId = Number(productButton.dataset.productSelect);
      render();
      return;
    }

    if (tabButton) {
      const nextView = String(tabButton.dataset.viewTab || "");
      state.activeView = nextView || "current_orders";
      ensureSelections();
      render();
      return;
    }

    if (jumpButton) {
      const nextOrderId = Number(jumpButton.dataset.orderJump);
      const targetOrder = state.orders.find((order) => Number(order.id) === nextOrderId);
      state.activeView = targetOrder && String(targetOrder.group_id || targetOrder.groupId || "") === currentGroupId()
        ? "current_orders"
        : "history_orders";
      state.selectedOrderId = nextOrderId;
      render();
      return;
    }

    if (deleteButton) {
      deleteProduct(Number(deleteButton.dataset.productDelete));
      return;
    }

    if (event.target.id === "refreshButton") {
      loadDashboard();
      return;
    }

    if (event.target.id === "logoutButton") {
      saveToken("");
      state.orders = [];
      state.pickups = [];
      state.products = [];
      state.members = [];
      state.stats = null;
      state.weeklyOrder = null;
      state.selectedOrderId = null;
      state.selectedUserId = null;
      state.selectedProductId = null;
      setFlash("success", "已退出登录。");
      return;
    }

    if (event.target.id === "filterButton") {
      const searchInput = document.getElementById("searchInput");
      const statusFilter = document.getElementById("statusFilter");
      const paymentFilter = document.getElementById("paymentFilter");
      state.filters.q = searchInput ? searchInput.value.trim() : "";
      state.filters.status = statusFilter ? statusFilter.value : "";
      state.filters.payment_status = paymentFilter ? paymentFilter.value : "";
      render();
    }
  });

  render();
  if (state.token) {
    loadDashboard();
  }
})();
