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
    orderGroupBy: "none",
    editingCollectionId: null,
    orders: [],
    cakeOrders: [],
    cakeCatalog: [],
    pickups: [],
    products: [],
    members: [],
    weeklyOrders: [],
    manualOrderGroups: [],
    collectionGroups: [],
    historicalSales: [],
    weeklyOrder: null,
    stats: null,
    selectedOrderId: null,
    selectedCakeOrderId: null,
    selectedUserId: null,
    selectedProductId: null,
    historyDetailType: "order",
    expandedHistoryGroups: {},
    expandedCurrentOrders: {},
    batchMode: false,
    batchSelected: {},
    batchStatus: "completed",
    weeklyProductsOpen: true,
    weeklyProductCreatorOpen: false,
    unseenCount: 0,
    previousUnseenCount: null,
    soundEnabled: (function () {
      try { return localStorage.getItem("makkie.admin.sound") === "1"; } catch (e) { return false; }
    })(),
    flash: null,
    userSort: "recent",
    filters: {
      q: "",
      status: "",
      payment_status: "",
      pickup_location: "",
      cake_q: "",
      cake_status: "",
      cake_pickup_date: "",
      cake_sort: "newest",
      user_q: "",
      user_tag: "user",
      product_q: "",
      analytics_range: "all",
      analytics_start: "",
      analytics_end: "",
      analytics_categories: []
    }
  };
  let activeDateTimePicker = null;
  let flashTimer = null;
  let magicRingsCleanup = null;
  let weeklyLastSavedAt = null; // 本次会话内「上次保存于」时间（服务端无该字段）
  let unseenPollTimer = null;

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

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(String(value));
    }
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function formatMoney(value) {
    const amount = Number(value) || 0;
    return `$${amount.toFixed(2)}`;
  }

  const USER_TAG_LABELS = { user: "用户", tester: "测试人员" };
  function userTagLabel(tag) {
    return USER_TAG_LABELS[String(tag || "user")] || "用户";
  }

  const ORDER_STATUS_VALUES = ["pending", "activity", "paid", "making", "ready", "completed", "cancelled"];
  const STATUS_LABELS = {
    pending: "待处理",
    activity: "活动单",
    paid: "已付款",
    making: "制作中",
    ready: "待自提",
    completed: "已完成",
    cancelled: "已取消"
  };

  const PAYMENT_STATUS_LABELS = {
    non_paid: "未付款",
    paid: "已付款",
    refunded: "已退款"
  };
  const CAKE_STATUS_LABELS = {
    pending: "待确认",
    confirmed: "已确认",
    making: "制作中",
    ready: "待自提",
    completed: "已完成",
    cancelled: "已取消"
  };

  function statusLabel(value) {
    const key = String(value || "pending");
    return STATUS_LABELS[key] || key;
  }

  function paymentStatusLabel(value) {
    const key = String(value || "non_paid");
    return PAYMENT_STATUS_LABELS[key] || key;
  }

  function cakeStatusLabel(value) {
    const key = String(value || "pending");
    return CAKE_STATUS_LABELS[key] || key;
  }

  function orderGroupKey(order) {
    return String((order && (order.group_id || order.groupId || order.weekly_order_id)) || "");
  }

  function getGroupSequenceNumber(order) {
    if (!order) return null;
    const n = Number(order.group_order_number || order.groupOrderNumber);
    if (Number.isFinite(n) && n > 0) return n;
    // Fallback: rank this order within its group by created_at (then id).
    const gid = orderGroupKey(order);
    const siblings = (state.orders || [])
      .filter((o) => orderGroupKey(o) === gid)
      .sort((a, b) => {
        const at = Date.parse(a.created_at || "") || 0;
        const bt = Date.parse(b.created_at || "") || 0;
        if (at !== bt) return at - bt;
        return Number(a.id) - Number(b.id);
      });
    const idx = siblings.findIndex((o) => Number(o.id) === Number(order.id));
    return idx >= 0 ? idx + 1 : null;
  }

  function orderNumberLabel(order) {
    if (!order) return "";
    const seq = getGroupSequenceNumber(order);
    if (seq) return `${seq}号`;
    return String(order.groupOrderNumberText || order.orderNumber || order.id || "");
  }

  function isCompletedOrder(order) {
    return String(order && order.status) === "completed";
  }

  function getMemberLinkedIds(userId) {
    const member = (state.members || []).find((item) => Number(item.id) === Number(userId));
    const ids = member && Array.isArray(member.linked_user_ids) ? member.linked_user_ids : [userId];
    return new Set(ids.map(Number).filter(Boolean));
  }

  function orderBelongsToMember(order, userId) {
    return getMemberLinkedIds(userId).has(Number(order && order.user_id));
  }

  // Revenue counts only completed orders.
  function getCompletedRevenueTotal() {
    return (state.orders || []).reduce((sum, order) =>
      sum + (isCompletedOrder(order) ? (Number(order.total_amount) || 0) : 0), 0);
  }

  function getUserCompletedRevenue(userId) {
    return (state.orders || []).reduce((sum, order) =>
      sum + (isCompletedOrder(order) && orderBelongsToMember(order, userId)
        ? (Number(order.total_amount) || 0) : 0), 0);
  }

  // 购买次数/最近购买都只看「已完成」订单（口径与金额一致）。
  function getUserCompletedCount(userId) {
    return (state.orders || []).filter((order) =>
      isCompletedOrder(order) && orderBelongsToMember(order, userId)).length;
  }

  function getUserLastCompletedAt(userId) {
    let latest = 0;
    (state.orders || []).forEach((order) => {
      if (!isCompletedOrder(order) || !orderBelongsToMember(order, userId)) return;
      const t = Date.parse(order.created_at || "");
      if (Number.isFinite(t) && t > latest) latest = t;
    });
    return latest;
  }

  function getProductCompletedRevenue(productId) {
    return (state.orders || []).reduce((acc, order) => {
      if (!isCompletedOrder(order)) return acc;
      (order.items || []).forEach((item) => {
        if (Number(item.product_id) !== Number(productId)) return;
        acc.quantity += Number(item.quantity) || 0;
        acc.revenue += Number(item.subtotal) || 0;
      });
      return acc;
    }, { quantity: 0, revenue: 0 });
  }

  function getGroupCompletedRevenue(groupId) {
    return getHistoryEntries().reduce((sum, order) =>
      sum + (isCompletedOrder(order) && getOrderGroupId(order) === String(groupId)
        ? (Number(order.total_amount) || 0) : 0), 0);
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

  function readOptionalDateTime(value) {
    const text = String(value == null ? "" : value).trim();
    return text || null;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function makeDefaultGroupTitle(date = new Date()) {
    return `A${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
  }

  // 团购编辑器里的倒计时：开始前提示开团，开始后提示结束。
  function formatWeeklyCountdown(startValue, deadlineValue) {
    const now = Date.now();
    const start = startValue ? new Date(startValue).getTime() : NaN;
    const deadline = deadlineValue ? new Date(deadlineValue).getTime() : NaN;
    const hasStart = Number.isFinite(start);
    const hasDeadline = Number.isFinite(deadline);

    if (hasStart && now < start) {
      return formatWeeklyCountdownValue("距团购开始还有", start - now);
    }
    if (hasDeadline && now < deadline) {
      return formatWeeklyCountdownValue("距团购结束还有", deadline - now);
    }
    if (hasDeadline) return "团购已结束";
    if (hasStart) return "团购已开始，未设置结束时间";
    return "未设置团购时间";
  }

  function formatWeeklyCountdownValue(label, diff) {
    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${label} ${d > 0 ? d + "天 " : ""}${pad2(h)}时 ${pad2(m)}分 ${pad2(s)}秒`;
  }

  function getWeeklyCountdownParts(startValue, deadlineValue) {
    const now = Date.now();
    const start = Date.parse(startValue || "");
    const deadline = Date.parse(deadlineValue || "");
    let label = "未设置团购时间";
    let diff = 0;
    if (Number.isFinite(start) && now < start) {
      label = "距团购开始还有";
      diff = start - now;
    } else if (Number.isFinite(deadline) && now < deadline) {
      label = "距团购结束还有";
      diff = deadline - now;
    } else if (Number.isFinite(deadline)) {
      label = "团购已结束";
    } else if (Number.isFinite(start)) {
      label = "团购已开始";
    }
    const totalSec = Math.max(0, Math.floor(diff / 1000));
    return {
      label,
      days: Math.floor(totalSec / 86400),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60
    };
  }

  function renderWeeklyCountdownBoxes(startValue, deadlineValue) {
    const parts = getWeeklyCountdownParts(startValue, deadlineValue);
    return `
      <div class="weekly-countdown-panel" data-weekly-countdown data-weekly-start="${escapeHtml(startValue)}" data-weekly-deadline="${escapeHtml(deadlineValue)}">
        <span class="weekly-countdown-label" data-weekly-countdown-label>${escapeHtml(parts.label)}</span>
        <div class="weekly-countdown-boxes">
          ${[["days", "天"], ["hours", "时"], ["minutes", "分"], ["seconds", "秒"]].map(([key, unit]) => `
            <span class="weekly-countdown-box"><strong data-weekly-countdown-value="${key}">${escapeHtml(key === "days" ? parts[key] : pad2(parts[key]))}</strong><small>${unit}</small></span>
          `).join("")}
        </div>
      </div>
    `;
  }

  function tickWeeklyCountdown() {
    document.querySelectorAll("[data-weekly-countdown]").forEach((el) => {
      const parts = getWeeklyCountdownParts(
        el.getAttribute("data-weekly-start"),
        el.getAttribute("data-weekly-deadline")
      );
      const label = el.querySelector("[data-weekly-countdown-label]");
      if (label) label.textContent = parts.label;
      ["days", "hours", "minutes", "seconds"].forEach((key) => {
        const value = el.querySelector(`[data-weekly-countdown-value="${key}"]`);
        if (value) value.textContent = key === "days" ? String(parts[key]) : pad2(parts[key]);
      });
    });
  }

  function toDatetimeInputValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 16);
    }
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }

  function getThisSaturday() {
    const date = new Date();
    const day = date.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function getSaturdayLabel() {
    const saturday = getThisSaturday();
    return `${saturday.getFullYear()}-${pad2(saturday.getMonth() + 1)}-${pad2(saturday.getDate())} 周六`;
  }

  function getPickupWindow(pickup) {
    const text = String((pickup && (pickup.pickup_time || pickup.time)) || "");
    const match = text.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/);
    if (match) return match[0];
    const haystack = JSON.stringify(pickup || {}).toLowerCase();
    if (/los angeles|santa fe|洛杉矶/.test(haystack)) return "14:00 - 14:30";
    return "12:30 - 13:00";
  }

  function getDefaultPickupTime(pickup) {
    const raw = String((pickup && (pickup.pickup_time || pickup.time)) || "");
    if (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(raw)) return raw;
    return `${getSaturdayLabel()} ${getPickupWindow(pickup)}`;
  }

  function dateFromDateValue(value) {
    const parts = String(value || "").split("-").map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function toDateValue(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function weekdayLabel(date) {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
  }

  function parseDateTimeParts(value) {
    const normalized = toDatetimeInputValue(value);
    const fallback = new Date();
    fallback.setSeconds(0, 0);
    const fallbackDateValue = toDateValue(fallback);
    const match = String(normalized || "").match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
    if (!match) {
      return {
        dateValue: fallbackDateValue,
        hour: fallback.getHours(),
        minute: fallback.getMinutes()
      };
    }
    return {
      dateValue: match[1],
      hour: Number(match[2]),
      minute: Number(match[3])
    };
  }

  function buildDateTimeValue(parts) {
    return `${parts.dateValue}T${pad2(parts.hour)}:${pad2(parts.minute)}`;
  }

  function formatDateTimeDisplay(value) {
    if (!value) return "点击选择";
    const parts = parseDateTimeParts(value);
    const date = dateFromDateValue(parts.dateValue);
    if (!date) return String(value);
    return `${parts.dateValue} ${weekdayLabel(date)} ${pad2(parts.hour)}:${pad2(parts.minute)}`;
  }

  function getWheelDateOptions(selectedValue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayValue = toDateValue(today);
    const options = [];

    for (let offset = -3; offset <= 60; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const value = toDateValue(date);
      let label = `${date.getMonth() + 1}/${date.getDate()}`;
      if (value === todayValue) label = "今天";
      options.push({
        value,
        label,
        sub: weekdayLabel(date)
      });
    }

    if (selectedValue && !options.some((option) => option.value === selectedValue)) {
      const date = dateFromDateValue(selectedValue);
      if (date) {
        options.push({
          value: selectedValue,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          sub: weekdayLabel(date)
        });
        options.sort((a, b) => a.value.localeCompare(b.value));
      }
    }

    return options;
  }

  function renderDateTimeWheelField(id, name, label, value, quickFromId, hint, labelExtra) {
    const normalizedValue = toDatetimeInputValue(value);
    // quickFromId：传入「开始时间」字段的 id 时，显示 24/48/72 小时快捷按钮（截单=开始+N小时）。
    const quickRow = quickFromId ? `
        <div class="datetime-quick-row">
          ${[24, 48, 72].map((h) => `<button type="button" class="datetime-quick-btn" data-deadline-quick="${h}" data-quick-start="${escapeHtml(quickFromId)}" data-quick-target="${escapeHtml(id)}">${h} 小时</button>`).join("")}
        </div>` : "";
    return `
      <label class="field datetime-wheel-field">
        <span class="dtw-label"><span>${escapeHtml(label)}</span>${labelExtra || ""}</span>
        <input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(normalizedValue)}" data-datetime-hidden="${escapeHtml(id)}">
        <button class="datetime-wheel-trigger" type="button" data-datetime-open="${escapeHtml(id)}" data-picker-title="${escapeHtml(label)}">
          <span class="datetime-wheel-trigger-value" data-datetime-display="${escapeHtml(id)}">${escapeHtml(formatDateTimeDisplay(normalizedValue))}</span>
        </button>${quickRow}
        ${hint ? `<small class="field-hint">${escapeHtml(hint)}</small>` : ""}
      </label>
    `;
  }

  function ensureDateTimePickerLayer() {
    let layer = document.getElementById("dateTimePickerLayer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "dateTimePickerLayer";
      document.body.appendChild(layer);
    }
    return layer;
  }

  function renderWheelOptions(kind, options, selectedValue) {
    return options.map((option) => `
      <button
        class="datetime-wheel-option ${String(option.value) === String(selectedValue) ? "selected" : ""}"
        type="button"
        data-wheel-option="${escapeHtml(kind)}"
        data-wheel-value="${escapeHtml(option.value)}"
      >
        <span>${escapeHtml(option.label)}</span>
        ${option.sub ? `<small>${escapeHtml(option.sub)}</small>` : ""}
      </button>
    `).join("");
  }

  function renderDateTimePickerOverlay() {
    if (!activeDateTimePicker) return;

    const hourOptions = Array.from({ length: 24 }, (_, hour) => ({ value: String(hour), label: pad2(hour) }));
    const minuteOptions = Array.from({ length: 60 }, (_, minute) => ({ value: String(minute), label: pad2(minute) }));
    const previewValue = buildDateTimeValue(activeDateTimePicker);
    const layer = ensureDateTimePickerLayer();

    layer.innerHTML = `
      <div class="datetime-wheel-overlay" data-datetime-overlay>
        <div class="datetime-wheel-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(activeDateTimePicker.title)}">
          <div class="datetime-wheel-head">
            <button class="datetime-wheel-link" type="button" data-datetime-close>取消</button>
            <div>
              <p class="eyebrow">Scroll Picker</p>
              <h3>${escapeHtml(activeDateTimePicker.title)}</h3>
            </div>
            <button class="datetime-wheel-link strong" type="button" data-datetime-confirm>确定</button>
          </div>
          <div class="datetime-wheel-preview" data-datetime-preview>${escapeHtml(formatDateTimeDisplay(previewValue))}</div>
          <div class="datetime-wheel-grid">
            <div class="datetime-wheel-frame" aria-hidden="true"></div>
            <div class="datetime-wheel-column wide" data-wheel-column="date">
              ${renderWheelOptions("date", activeDateTimePicker.dateOptions, activeDateTimePicker.dateValue)}
            </div>
            <div class="datetime-wheel-column" data-wheel-column="hour">
              ${renderWheelOptions("hour", hourOptions, String(activeDateTimePicker.hour))}
            </div>
            <div class="datetime-wheel-column" data-wheel-column="minute">
              ${renderWheelOptions("minute", minuteOptions, String(activeDateTimePicker.minute))}
            </div>
          </div>
          <div class="datetime-wheel-foot">
            <button class="datetime-wheel-clear" type="button" data-datetime-clear>清空时间</button>
          </div>
        </div>
      </div>
    `;

    layer.querySelectorAll(".datetime-wheel-column").forEach((column) => attachWheelColumnDrag(column));
    requestAnimationFrame(alignWheelColumns);
  }

  function alignWheelColumns() {
    document.querySelectorAll(".datetime-wheel-column").forEach((column) => {
      const selected = column.querySelector(".datetime-wheel-option.selected");
      if (selected) selected.scrollIntoView({ block: "center" });
    });
  }

  function attachWheelColumnDrag(column) {
    if (!column || column.dataset.dragReady === "1") return;
    column.dataset.dragReady = "1";

    let pointerId = null;
    let startY = 0;
    let startScrollTop = 0;
    let dragged = false;

    column.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      startY = event.clientY;
      startScrollTop = column.scrollTop;
      dragged = false;
      column.classList.add("is-dragging");
      if (typeof column.setPointerCapture === "function") {
        column.setPointerCapture(pointerId);
      }
    });

    column.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      const deltaY = event.clientY - startY;
      if (!dragged && Math.abs(deltaY) > 6) dragged = true;
      if (!dragged) return;
      column.scrollTop = startScrollTop - deltaY;
      event.preventDefault();
    });

    function finishPointer(event) {
      if (pointerId !== event.pointerId) return;
      if (typeof column.releasePointerCapture === "function" && column.hasPointerCapture(pointerId)) {
        column.releasePointerCapture(pointerId);
      }
      pointerId = null;
      column.classList.remove("is-dragging");
      if (dragged) {
        column.dataset.suppressClick = "1";
        window.setTimeout(() => {
          delete column.dataset.suppressClick;
        }, 120);
        selectClosestWheelOption(column);
      }
      dragged = false;
    }

    column.addEventListener("pointerup", finishPointer);
    column.addEventListener("pointercancel", finishPointer);
  }

  function syncWheelColumn(kind, value, shouldScroll = true) {
    const column = document.querySelector(`.datetime-wheel-column[data-wheel-column="${kind}"]`);
    if (!column) return;
    column.querySelectorAll(".datetime-wheel-option").forEach((option) => {
      option.classList.toggle("selected", String(option.dataset.wheelValue) === String(value));
    });
    const selected = column.querySelector(".datetime-wheel-option.selected");
    if (selected && shouldScroll) selected.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function updateDateTimePreview() {
    const preview = document.querySelector("[data-datetime-preview]");
    if (!preview || !activeDateTimePicker) return;
    preview.textContent = formatDateTimeDisplay(buildDateTimeValue(activeDateTimePicker));
  }

  function setWheelValue(kind, value, shouldScroll = true) {
    if (!activeDateTimePicker) return;
    if (kind === "date") activeDateTimePicker.dateValue = value;
    if (kind === "hour") activeDateTimePicker.hour = Number(value);
    if (kind === "minute") activeDateTimePicker.minute = Number(value);
    syncWheelColumn(kind, value, shouldScroll);
    updateDateTimePreview();
  }

  function selectClosestWheelOption(column) {
    if (!activeDateTimePicker || !column) return;
    const options = Array.from(column.querySelectorAll(".datetime-wheel-option"));
    if (!options.length) return;
    const columnRect = column.getBoundingClientRect();
    const center = columnRect.top + columnRect.height / 2;
    const closest = options.reduce((best, option) => {
      const rect = option.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      return !best || distance < best.distance ? { option, distance } : best;
    }, null);
    if (closest && closest.option) {
      setWheelValue(column.dataset.wheelColumn, closest.option.dataset.wheelValue, false);
    }
  }

  function openDateTimePicker(trigger) {
    const id = trigger.dataset.datetimeOpen;
    const hidden = document.querySelector(`[data-datetime-hidden="${escapeSelector(id)}"]`);
    if (!hidden) return;
    const parts = parseDateTimeParts(hidden.value);
    activeDateTimePicker = {
      ...parts,
      targetId: id,
      targetInput: hidden,
      title: trigger.dataset.pickerTitle || "选择时间",
      dateOptions: getWheelDateOptions(parts.dateValue)
    };
    renderDateTimePickerOverlay();
  }

  function closeDateTimePicker() {
    activeDateTimePicker = null;
    ensureDateTimePickerLayer().innerHTML = "";
  }

  function confirmDateTimePicker() {
    if (!activeDateTimePicker || !activeDateTimePicker.targetInput) return;
    const value = buildDateTimeValue(activeDateTimePicker);
    const targetId = activeDateTimePicker.targetId;
    activeDateTimePicker.targetInput.value = value;
    const display = document.querySelector(`[data-datetime-display="${escapeSelector(targetId)}"]`);
    if (display) display.textContent = formatDateTimeDisplay(value);
    closeDateTimePicker();
  }

  function clearDateTimePicker() {
    if (!activeDateTimePicker || !activeDateTimePicker.targetInput) return;
    const targetId = activeDateTimePicker.targetId;
    activeDateTimePicker.targetInput.value = "";
    const display = document.querySelector(`[data-datetime-display="${escapeSelector(targetId)}"]`);
    if (display) display.textContent = formatDateTimeDisplay("");
    closeDateTimePicker();
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
    if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
    if (text) {
      // 3.2 秒后自动收起 toast
      flashTimer = setTimeout(() => {
        flashTimer = null;
        if (state.flash) { state.flash = null; render(); }
      }, 3200);
    }
  }

  function currentGroupId() {
    return String(
      (state.weeklyOrder && (state.weeklyOrder.active_group_id || state.weeklyOrder.group_no)) || ""
    );
  }

  function getOrderGroupId(order) {
    return String(order && (order.group_id || order.groupId || order.weekly_order_id || "") || "");
  }

  function getWeeklyOrderForGroup(groupId) {
    return (state.weeklyOrders || []).find((weeklyOrder) => {
      return String(weeklyOrder.id) === String(groupId)
        || String(weeklyOrder.active_group_id || "") === String(groupId)
        || String(weeklyOrder.group_no || "") === String(groupId);
    }) || null;
  }

  function getManualOrderGroup(groupId) {
    return (state.manualOrderGroups || []).find((group) =>
      String(group.group_id || group.groupId || "") === String(groupId || "")) || null;
  }

  function getHistoryGroupLabel(groupId) {
    if (!groupId || groupId === "ungrouped") return "未归档团购";
    if (/^cake-\d{8}$/.test(String(groupId))) {
      const dateCode = String(groupId).slice(5);
      return `蛋糕订单 · ${dateCode.slice(0, 4)}/${dateCode.slice(4, 6)}/${dateCode.slice(6, 8)}`;
    }
    const manualGroup = getManualOrderGroup(groupId);
    if (manualGroup && manualGroup.title) return manualGroup.title;
    const weeklyOrder = getWeeklyOrderForGroup(groupId);
    if (weeklyOrder && weeklyOrder.title) {
      return `${weeklyOrder.title} · ${formatGroupNo(groupId)}`;
    }
    return formatGroupNo(groupId);
  }

  function getHistoryGroupMeta(groupId, orders) {
    const manualGroup = getManualOrderGroup(groupId);
    if (manualGroup) {
      const dates = [];
      if (manualGroup.order_date) dates.push(`成交 ${manualGroup.order_date}`);
      if (manualGroup.pickup_date) dates.push(`自提 ${manualGroup.pickup_date}`);
      if (dates.length) return dates.join(" · ");
    }
    const weeklyOrder = getWeeklyOrderForGroup(groupId);
    if (weeklyOrder && weeklyOrder.created_at) return formatDate(weeklyOrder.created_at);
    const newest = orders[0] && orders[0].created_at;
    return newest ? formatDate(newest) : "未记录";
  }

  function getOrderPickupFilterValue(order) {
    const pickup = (order && order.pickup) || {};
    const pickupId = order && (order.pickup_location_id || order.pickupLocationId || pickup.id);
    if (pickupId !== null && pickupId !== undefined && String(pickupId).trim()) {
      return `id:${String(pickupId).trim()}`;
    }
    const name = String(pickup.name || pickup.label || order && order.pickup_location_name || "").trim();
    return name ? `name:${name.toLowerCase()}` : "";
  }

  function getPickupFilterOptions() {
    const options = new Map();
    (state.pickups || []).forEach((pickup) => {
      const pickupId = pickup && pickup.id;
      const name = String((pickup && (pickup.name || pickup.label || pickup.address)) || "自提点").trim();
      const value = pickupId !== null && pickupId !== undefined && String(pickupId).trim()
        ? `id:${String(pickupId).trim()}`
        : `name:${name.toLowerCase()}`;
      if (value && !options.has(value)) options.set(value, { value, label: name });
    });
    (state.orders || []).forEach((order) => {
      const value = getOrderPickupFilterValue(order);
      if (!value || options.has(value)) return;
      const pickup = order.pickup || {};
      const label = String(pickup.name || pickup.label || order.pickup_location_name || "未命名自提点").trim();
      options.set(value, { value, label });
    });
    return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label, "zh-CN"));
  }

  function renderPickupFilterOptions() {
    const selected = String(state.filters.pickup_location || "");
    return [
      `<option value="" ${selected === "" ? "selected" : ""}>全部取货点</option>`,
      ...getPickupFilterOptions().map((pickup) =>
        `<option value="${escapeHtml(pickup.value)}" ${selected === pickup.value ? "selected" : ""}>${escapeHtml(pickup.label)}</option>`)
    ].join("");
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
    if (state.filters.pickup_location && getOrderPickupFilterValue(order) !== state.filters.pickup_location) return false;
    return true;
  }

  // 「本周订单」= 只属于当前团购编号（active_group_id）的订单；
  // 其它团购编号（含空/旧团购）一律归入历史团购。
  function isCurrentGroup(groupId) {
    const active = currentGroupId();
    if (!active) return false;
    return String(groupId || "") === active;
  }

  // 团购编号：group_id 就是 YYYYMMDD，直接作为编号展示。
  function formatGroupNo(groupId) {
    const gid = String(groupId || "").trim();
    if (!gid || gid === "ungrouped" || gid === "未分组") return "未归档";
    return `团购 ${gid}`;
  }

  function getCurrentOrders() {
    return state.orders.filter((order) => isCurrentGroup(getOrderGroupId(order)) && matchesFilters(order));
  }

  function getHistoryOrders() {
    return state.orders.filter((order) => !isCurrentGroup(getOrderGroupId(order)) && matchesFilters(order));
  }

  function getCakeOrderDateCode(order) {
    const raw = String(order && (order.created_at || order.createdAt) || "");
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}${match[2]}${match[3]}`;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "undated";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(parsed).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
    return `${parts.year}${parts.month}${parts.day}`;
  }

  // 已完成蛋糕询单只在后台历史视图中动态归档，不复制成普通订单，
  // 因此客户侧不会出现重复订单；归档日期使用询单 created_at（订购日期）。
  function getCompletedCakeHistoryOrders(applyOrderFilters = true) {
    const orders = (state.cakeOrders || [])
      .filter((order) => String(order.status || "") === "completed")
      .map((order) => {
        const groupId = `cake-${getCakeOrderDateCode(order)}`;
        const totalAmount = Number(order.total_amount || order.unit_price) || 0;
        return {
          ...order,
          history_entry_type: "cake",
          group_id: groupId,
          groupId,
          groupOrderNumberText: `蛋糕 #${order.id}`,
          orderNumber: `蛋糕 #${order.id}`,
          payment_status: "paid",
          paymentStatus: "paid",
          total_amount: totalAmount,
          pickup: { name: "蛋糕自提", time: order.pickup_date || "" },
          items: [{
            title: `${order.cake_name || order.cakeName || "蛋糕"}${order.flavor ? ` · ${order.flavor}` : ""}`,
            quantity: 1,
            subtotal: totalAmount
          }]
        };
      });
    return applyOrderFilters ? orders.filter(matchesFilters) : orders;
  }

  function getHistoryEntries() {
    return getHistoryOrders().concat(getCompletedCakeHistoryOrders());
  }

  function getHistoryOrderGroups() {
    const groups = new Map();
    getHistoryEntries().forEach((order) => {
      const groupId = getOrderGroupId(order) || "ungrouped";
      if (!groups.has(groupId)) groups.set(groupId, []);
      groups.get(groupId).push(order);
    });

    return Array.from(groups.entries()).map(([groupId, orders]) => ({
      groupId,
      orders,
      label: getHistoryGroupLabel(groupId),
      meta: getHistoryGroupMeta(groupId, orders),
      total: orders.reduce((sum, order) => sum + (String(order.status || "") === "activity" ? 0 : (Number(order.total_amount) || 0)), 0)
    })).sort((a, b) => {
      const aOrder = a.orders[0] && Date.parse(a.orders[0].created_at || "");
      const bOrder = b.orders[0] && Date.parse(b.orders[0].created_at || "");
      return (Number.isFinite(bOrder) ? bOrder : 0) - (Number.isFinite(aOrder) ? aOrder : 0);
    });
  }

  function getVisibleOrders() {
    if (state.activeView === "history_orders") return getHistoryOrders();
    return getCurrentOrders();
  }

  function getCurrentWeeklyProducts() {
    const weeklyId = Number(state.weeklyOrder && state.weeklyOrder.id);
    if (!weeklyId) return [];
    return state.products.filter((product) => Number(product.weekly_order_id) === weeklyId);
  }

  function getAssignableProducts() {
    const weeklyId = Number(state.weeklyOrder && state.weeklyOrder.id);
    return state.products.filter((product) => Number(product.weekly_order_id) !== weeklyId);
  }

  function getSelectedOrder() {
    const orders = getVisibleOrders();
    const selected = orders.find((order) => Number(order.id) === Number(state.selectedOrderId));
    if (selected) return selected;
    return state.activeView === "current_orders" ? (orders[0] || null) : null;
  }

  function getFilteredCakeOrders() {
    const query = String(state.filters.cake_q || "").trim().toLowerCase();
    const status = String(state.filters.cake_status || "");
    const pickupDate = String(state.filters.cake_pickup_date || "");
    const orders = (state.cakeOrders || []).filter((order) => {
      if (query) {
        const haystack = JSON.stringify([
          order.id,
          order.userNickname,
          order.customer_name,
          order.cake_name,
          order.cakeName,
          order.flavor,
          order.pickup_date
        ]).toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (status && String(order.status || "pending") !== status) return false;
      if (pickupDate && String(order.pickup_date || "") !== pickupDate) return false;
      return true;
    });

    return orders.sort((a, b) => {
      if (state.filters.cake_sort === "pickup") {
        const aDate = String(a.pickup_date || "9999-12-31");
        const bDate = String(b.pickup_date || "9999-12-31");
        return aDate.localeCompare(bDate) || Number(b.id || 0) - Number(a.id || 0);
      }
      if (state.filters.cake_sort === "amount") {
        const aAmount = Number(a.total_amount || a.unit_price || 0);
        const bAmount = Number(b.total_amount || b.unit_price || 0);
        return bAmount - aAmount || Number(b.id || 0) - Number(a.id || 0);
      }
      const aCreated = Date.parse(a.created_at || "") || 0;
      const bCreated = Date.parse(b.created_at || "") || 0;
      return bCreated - aCreated || Number(b.id || 0) - Number(a.id || 0);
    });
  }

  function clearSelectedCakeOrder() {
    state.selectedCakeOrderId = null;
  }

  function getSelectedCakeOrder() {
    const orders = getFilteredCakeOrders();
    return orders.find((order) => Number(order.id) === Number(state.selectedCakeOrderId)) || null;
  }

  function getFilteredMembers() {
    const query = String(state.filters.user_q || "").trim().toLowerCase();
    const tagFilter = String(state.filters.user_tag || "");
    const sort = state.userSort || "recent";
    const list = state.members.filter((member) => {
      if (member.is_linked_secondary) return false;
      // 身份筛选：普通客户(user) / 测试人员(tester)
      if (tagFilter) {
        const tag = String(member.tag || "user");
        if (tagFilter === "user" && tag === "tester") return false;
        if (tagFilter === "tester" && tag !== "tester") return false;
      }
      if (!query) return true;
      const linkedSearch = (member.linked_identities || []).flatMap((identity) => [
        identity.nickname,
        identity.uuid,
        identity.email,
        identity.wechat_id
      ]);
      return [member.nickname, member.uuid, member.wechat_id, member.email, member.note, ...linkedSearch]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query));
    });
    // 排序：最近购买 / 购买次数 / 购买金额（均按已完成口径）
    const sorted = list.slice();
    if (sort === "count") {
      sorted.sort((a, b) => getUserCompletedCount(b.id) - getUserCompletedCount(a.id));
    } else if (sort === "spend") {
      sorted.sort((a, b) => getUserCompletedRevenue(b.id) - getUserCompletedRevenue(a.id));
    } else {
      sorted.sort((a, b) => getUserLastCompletedAt(b.id) - getUserLastCompletedAt(a.id));
    }
    return sorted;
  }

  function getSelectedUser() {
    const members = getFilteredMembers();
    return members.find((member) => Number(member.id) === Number(state.selectedUserId)) || members[0] || null;
  }

  function getSelectedProduct() {
    return state.products.find((product) => Number(product.id) === Number(state.selectedProductId)) || state.products[0] || null;
  }

  function getUserOrders(userId) {
    return getHistoryOrders().filter((order) => orderBelongsToMember(order, userId));
  }

  function getProductOrders(productId) {
    return getHistoryOrders().filter((order) =>
      (order.items || []).some((item) => Number(item.product_id) === Number(productId))
    );
  }

  function getProductMetrics(productId) {
    return state.orders.reduce((acc, order) => {
      if (String(order.status || "") === "cancelled") return acc;
      (order.items || []).forEach((item) => {
        if (Number(item.product_id) !== Number(productId)) return;
        acc.quantity += Number(item.quantity) || 0;
        if (String(order.status || "") !== "activity") {
          acc.revenue += Number(item.subtotal) || 0;
        }
      });
      return acc;
    }, { quantity: 0, revenue: 0 });
  }

  function renderFlash() {
    if (!state.flash) return "";
    return `<div class="flash ${escapeHtml(state.flash.type)}">${escapeHtml(state.flash.text)}</div>`;
  }

  function updateDocumentTitle() {
    const count = Number(state.unseenCount) || 0;
    document.title = count > 0 ? `(${count}) New Orders - Makkie Mua` : "Makkie Admin";
  }

  function updateUnseenBadgeDom() {
    const badge = document.querySelector("[data-orders-unseen-badge]");
    const count = Number(state.unseenCount) || 0;
    if (badge) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = count <= 0;
    }
    updateDocumentTitle();
  }

  function getNewOrderAudio() {
    return document.getElementById("newOrderAudio");
  }

  function playNewOrderSound() {
    if (!state.soundEnabled) return;
    const audio = getNewOrderAudio();
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((error) => console.error("[admin] New order sound failed:", error));
      }
    } catch (error) {
      console.error("[admin] New order sound failed:", error);
    }
  }

  async function refreshUnseenCount({ silent = false } = {}) {
    if (!state.token) return;
    try {
      const data = await api("/api/admin/orders/unseen-count");
      const nextCount = Number(data.count) || 0;
      const previous = state.previousUnseenCount;
      state.unseenCount = nextCount;
      state.previousUnseenCount = nextCount;
      updateUnseenBadgeDom();
      if (previous !== null && nextCount > previous) {
        playNewOrderSound();
      }
    } catch (error) {
      if (!silent) console.error("[admin] Failed to refresh unseen order count:", error);
    }
  }

  function startUnseenPolling() {
    if (unseenPollTimer) clearInterval(unseenPollTimer);
    unseenPollTimer = setInterval(() => {
      refreshUnseenCount({ silent: true });
    }, 8000);
  }

  function stopUnseenPolling() {
    if (unseenPollTimer) clearInterval(unseenPollTimer);
    unseenPollTimer = null;
    state.unseenCount = 0;
    state.previousUnseenCount = null;
    updateDocumentTitle();
  }

  function persistSoundPref(enabled) {
    try { localStorage.setItem("makkie.admin.sound", enabled ? "1" : "0"); } catch (e) {}
  }

  // 开启时只在这次开关手势中试听一次。刷新页面不会再次播放。
  async function setSoundEnabled(enabled) {
    if (!enabled) {
      state.soundEnabled = false;
      persistSoundPref(false);
      setFlash("success", "新订单声音已关闭。");
      return;
    }
    const audio = getNewOrderAudio();
    try {
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.6;
        const promise = audio.play();
        if (promise && typeof promise.then === "function") await promise;
      }
      state.soundEnabled = true;
      persistSoundPref(true);
      setFlash("success", "新订单声音已开启。");
    } catch (error) {
      console.error("[admin] Failed to enable new order sound:", error);
      state.soundEnabled = false;
      persistSoundPref(false);
      setFlash("error", "声音开启失败，请再点一次开关试试。");
    }
  }

  async function markAllOrdersSeenInBackground() {
    try {
      const data = await api("/api/admin/orders/mark-all-seen", { method: "POST" });
      state.unseenCount = Number(data.count) || 0;
      state.previousUnseenCount = state.unseenCount;
      updateUnseenBadgeDom();
    } catch (error) {
      console.error("[admin] Failed to mark orders seen:", error);
    }
  }

  async function markOrderSeenInBackground(orderId) {
    try {
      const data = await api(`/api/admin/orders/${orderId}/seen`, { method: "POST" });
      state.unseenCount = Number(data.count) || 0;
      state.previousUnseenCount = state.unseenCount;
      updateUnseenBadgeDom();
    } catch (error) {
      console.error("[admin] Failed to mark order seen:", error);
    }
  }

  function renderLogin() {
    if (typeof magicRingsCleanup === "function") magicRingsCleanup();
    magicRingsCleanup = null;
    root.classList.add("is-login-mode");
    root.innerHTML = `
      <div class="admin-login-shell">
        <section class="admin-login-visual" aria-label="Makkie Admin 品牌区域">
          <div class="admin-login-texture" aria-hidden="true"></div>
          <div class="magic-rings-container" id="magicRingsMount" aria-hidden="true"></div>
          <div class="login-brand-lockup">
            <span class="login-brand-mark"><img src="./images/makkie-logo.png" alt=""></span>
            <span>MAKKIE ADMIN</span>
          </div>
          <div class="login-visual-copy">
            <p>私厨云订单</p>
            <p>管理<span>一站式平台</span></p>
          </div>
          <p class="login-visual-footer">© 2026 Makkie 云订单</p>
        </section>
        <section class="admin-login-form-panel">
          <div class="admin-login-card">
            <p class="eyebrow">Makkie Admin</p>
            <h1 class="title">Makkie 云订单管理平台</h1>
            <a class="admin-service-phone" href="tel:4086468740"><i class="ph ph-phone" aria-hidden="true"></i><span>服务联系电话：</span><strong>408-646-8740</strong></a>
            <div class="login-divider" aria-hidden="true"></div>
            ${renderFlash()}
            <form class="form-stack" id="loginForm">
              <label class="field">
                <span>用户名</span>
                <span class="login-input-wrap">
                  <i class="ph ph-user" aria-hidden="true"></i>
                  <input class="input" type="text" name="username" autocomplete="username" placeholder="makkie-admin" required autofocus>
                </span>
              </label>
              <label class="field">
                <span class="login-password-label"><span>密码</span><a href="tel:4086468740">忘记密码？</a></span>
                <span class="login-input-wrap">
                  <i class="ph ph-lock-key" aria-hidden="true"></i>
                  <input class="input" type="password" name="password" autocomplete="current-password" required>
                  <button class="login-password-toggle" type="button" aria-label="显示密码" data-login-password-toggle><i class="ph ph-eye" aria-hidden="true"></i></button>
                </span>
              </label>
              <label class="login-remember"><input type="checkbox" checked><span>7 天内免登录</span></label>
              <button class="button login-submit" type="submit"><span>进入后台</span><i class="ph ph-arrow-right" aria-hidden="true"></i></button>
            </form>
            <p class="login-powered">Powered by Makkie Technology&nbsp; · &nbsp;© 2026</p>
          </div>
        </section>
      </div>
    `;
    const ringsMount = document.getElementById("magicRingsMount");
    if (ringsMount && typeof window.mountMakkieMagicRings === "function") {
      magicRingsCleanup = window.mountMakkieMagicRings(ringsMount);
    }
    const passwordToggle = root.querySelector("[data-login-password-toggle]");
    if (passwordToggle) {
      passwordToggle.addEventListener("click", function () {
        const input = root.querySelector('input[name="password"]');
        if (!input) return;
        const shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        passwordToggle.setAttribute("aria-label", shouldShow ? "隐藏密码" : "显示密码");
        const icon = passwordToggle.querySelector("i");
        if (icon) icon.className = shouldShow ? "ph ph-eye-slash" : "ph ph-eye";
      });
    }
  }

  // 顶部概览卡：跟随当前选中的 tab 变化（本周订单/历史团购/用户/产品/图鉴/营收），
  // 而不是固定显示全局统计。数据全部来自已加载的 state，切 tab 时 render() 会自动刷新。
  function getDashboardSummary() {
    const view = state.activeView;
    const weekOrders = state.orders.filter((o) => isCurrentGroup(getOrderGroupId(o)));
    const historyOrders = getHistoryEntries();
    const activeProducts = state.products.filter((p) => Number(p.is_active) === 1);
    const distinctUsers = (orders) => new Set(orders.map((o) => Number(o.user_id)).filter(Boolean)).size;
    const completedRevenue = (orders) => orders.reduce((sum, o) => sum + (isCompletedOrder(o) ? Number(o.total_amount) || 0 : 0), 0);
    const soldQty = (orders) => orders.reduce((sum, o) => sum + (isCompletedOrder(o)
      ? (o.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0) : 0), 0);

    if (view === "cake_orders") {
      const active = state.cakeOrders.filter((order) => !["completed", "cancelled"].includes(String(order.status)));
      const completed = state.cakeOrders.filter((order) => String(order.status) === "completed");
      const pending = state.cakeOrders.filter((order) => String(order.status || "pending") === "pending");
      return { eyebrow: "蛋糕询单概览", badge: `${state.cakeOrders.length} 条`, cards: [
        { label: "全部询单", value: state.cakeOrders.length },
        { label: "待确认", value: pending.length },
        { label: "进行中", value: active.length },
        { label: "已完成", value: completed.length }
      ] };
    }

    if (view === "history_orders") {
      const groups = getHistoryOrderGroups();
      return { eyebrow: "历史概览", badge: `${groups.length} 期团购`, cards: [
        { label: "历史订单", value: historyOrders.length },
        { label: "历史收入（已完成）", value: formatMoney(completedRevenue(historyOrders)), accent: "green" },
        { label: "历史下单用户", value: distinctUsers(historyOrders) },
        { label: "历史团购期数", value: groups.length }
      ] };
    }
    if (view === "users") {
      const primaryMembers = state.members.filter((m) => !m.is_linked_secondary);
      const testers = primaryMembers.filter((m) => String(m.tag) === "tester").length;
      const repeat = primaryMembers.filter((m) => getUserCompletedCount(m.id) > 1).length;
      return { eyebrow: "用户概览", badge: `${primaryMembers.length} 位用户`, cards: [
        { label: "用户总数", value: primaryMembers.length },
        { label: "累计消费（已完成）", value: formatMoney(getCompletedRevenueTotal()), accent: "green" },
        { label: "复购用户", value: repeat },
        { label: "测试人员", value: testers }
      ] };
    }
    if (view === "products") {
      return { eyebrow: "产品概览", badge: `${activeProducts.length} 款在售`, cards: [
        { label: "上架甜品", value: activeProducts.length },
        { label: "累计销售额（已完成）", value: formatMoney(getCompletedRevenueTotal()), accent: "green" },
        { label: "累计售出", value: soldQty(state.orders) },
        { label: "甜品种类", value: state.products.length }
      ] };
    }
    if (view === "collection") {
      const groups = Array.isArray(state.collectionGroups) ? state.collectionGroups : [];
      const itemCount = groups.reduce((sum, g) => sum + ((g.items || []).length), 0);
      return { eyebrow: "图鉴概览", badge: `${itemCount} 张`, cards: [
        { label: "图鉴图片", value: itemCount },
        { label: "图鉴分类", value: groups.length },
        { label: "上架甜品", value: activeProducts.length },
        { label: "甜品种类", value: state.products.length }
      ] };
    }
    if (view === "analytics") {
      const allCompleted = state.orders.filter(isCompletedOrder);
      const avg = allCompleted.length ? getCompletedRevenueTotal() / allCompleted.length : 0;
      return { eyebrow: "营收概览", badge: "已完成口径", cards: [
        { label: "累计销售额（已完成）", value: formatMoney(getCompletedRevenueTotal()), accent: "green" },
        { label: "本周销售额（已完成）", value: formatMoney(completedRevenue(weekOrders)), accent: "green" },
        { label: "累计完成订单", value: allCompleted.length },
        { label: "平均每单（已完成）", value: formatMoney(avg) }
      ] };
    }
    // 默认（本周订单 / 本周团购管理）：本周概览
    const gid = currentGroupId();
    return { eyebrow: "本周概览", badge: gid ? formatGroupNo(gid) : "", cards: [
      { label: "本周订单", value: weekOrders.length },
      { label: "本周收入（已完成）", value: formatMoney(completedRevenue(weekOrders)), accent: "green" },
      { label: "本周下单用户", value: distinctUsers(weekOrders) },
      { label: "本周供应甜品", value: getCurrentWeeklyProducts().length }
    ] };
  }

  function renderStats() {
    const d = getDashboardSummary();
    return `
      <div class="stats-block">
        <div class="stats-head">
          <span class="stats-eyebrow">${escapeHtml(d.eyebrow)}</span>
          ${d.badge ? `<span class="stats-badge">${escapeHtml(d.badge)}</span>` : ""}
        </div>
        <div class="stats-grid">
          ${d.cards.map((c) => `
            <section class="stat-card">
              <span>${escapeHtml(c.label)}</span>
              <strong class="${c.accent ? "stat-accent-" + c.accent : ""}">${escapeHtml(c.value)}</strong>
            </section>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderViewTabs() {
    const tabs = [
      ["weekly_manage", "本周团购管理"],
      ["current_orders", "本周订单"],
      ["cake_orders", "蛋糕询单"],
      ["history_orders", "历史团购"],
      ["users", "用户"],
      ["products", "产品"],
      ["collection", "图鉴"],
      ["analytics", "营收分析"]
    ];

    return `
      <section class="view-tabs-card">
        <div class="view-tabs">
          ${tabs.map(([key, label]) => `
            <button class="view-tab ${state.activeView === key ? "active" : ""}" type="button" data-view-tab="${escapeHtml(key)}">
              <span>${escapeHtml(label)}</span>
              ${key === "current_orders" ? `<span class="orders-unseen-badge" data-orders-unseen-badge ${Number(state.unseenCount) > 0 ? "" : "hidden"}>${escapeHtml(Number(state.unseenCount) > 99 ? "99+" : state.unseenCount)}</span>` : ""}
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderPickupSettings() {
    if (!state.pickups.length) {
      return `
        <details class="collapsible-section weekly-manage-tab pickup-settings-card">
          <summary class="collapsible-summary">
            <span class="weekly-tab-title">自提地点与时间设置</span>
          </summary>
        </details>
      `;
    }

    return `
      <details class="collapsible-section weekly-manage-tab pickup-settings-card">
        <summary class="collapsible-summary">
          <span class="weekly-tab-title">自提地点与时间设置</span>
        </summary>
        <div class="pickup-settings-grid">
          ${state.pickups.map((pickup) => `
            <form class="pickup-setting-form" data-pickup-id="${escapeHtml(pickup.id)}">
              <div class="pickup-setting-card">
                <p class="section-title pickup-setting-title">${escapeHtml(pickup.name || "自提点")}</p>
                <label class="toggle-slider ${Number(pickup.is_active) === 1 ? "is-on" : ""}">
                  <span class="toggle-slider-text" data-pickup-active-label>${Number(pickup.is_active) === 1 ? "本周开放（前端可选）" : "本周关闭（前端隐藏）"}</span>
                  <input type="checkbox" name="is_active" value="1" data-pickup-active-input ${Number(pickup.is_active) === 1 ? "checked" : ""}>
                  <span class="toggle-slider-track"><span class="toggle-slider-thumb"></span></span>
                </label>
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
                  <input class="input" type="text" name="pickup_time" value="${escapeHtml(getDefaultPickupTime(pickup))}" placeholder="例如：2026-07-04 周六 12:30 - 13:00">
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
      </details>
    `;
  }

  function renderOrderList(orders, emptyText, expandable) {
    if (!orders.length) {
      return `<div class="empty">${escapeHtml(emptyText)}</div>`;
    }

    return orders.map((order) => {
      if (order.history_entry_type === "cake") {
        const selected = state.historyDetailType === "cake"
          && Number(order.id) === Number(state.selectedCakeOrderId);
        return `
          <button class="order-row ${selected ? "active" : ""}" type="button" data-history-cake-select="${escapeHtml(order.id)}">
            <div class="row-line row-main">
              <span><span class="order-number-badge">蛋糕 #${escapeHtml(order.id)}</span> ${escapeHtml(order.userNickname || order.customer_name || "微信用户")}</span>
              <span>${escapeHtml(formatMoney(order.total_amount))}</span>
            </div>
            <div class="row-line row-sub">
              <span>${escapeHtml(order.cake_name || order.cakeName || "蛋糕询单")}${order.flavor ? ` · ${escapeHtml(order.flavor)}` : ""}</span>
              <span class="status-tag status-completed">${escapeHtml(cakeStatusLabel(order.status))}</span>
            </div>
            <div class="row-line row-sub">
              <span>订购日期 ${escapeHtml(formatDate(order.created_at))}</span>
              <span>自提 ${escapeHtml(order.pickup_date || "未填写")}</span>
            </div>
            <div class="row-line row-sub"><span class="order-group-chip">蛋糕历史</span></div>
          </button>`;
      }
      const isSelected = Number(order.id) === Number(state.selectedOrderId);
      const statusClass = `status-tag status-${escapeHtml(order.status || "pending")}`;
      const picked = Boolean(state.batchSelected[order.id]);
      const batchCls = state.batchMode ? ` batch-pick${picked ? " is-picked" : ""}` : "";
      const batchMark = state.batchMode ? `<span class="batch-check" aria-hidden="true">${picked ? "✓" : ""}</span>` : "";
      const canQuickComplete = !state.batchMode
        && order.payment_status === "paid"
        && order.status !== "completed"
        && order.status !== "activity"
        && order.status !== "cancelled";
      if (!expandable) {
        return `
          <button class="order-row ${isSelected ? "active" : ""}${batchCls}" type="button" data-order-select="${escapeHtml(order.id)}">
            ${batchMark}
            <div class="row-line row-main">
              <span><span class="order-number-badge">${escapeHtml(orderNumberLabel(order))}</span> ${escapeHtml(order.userNickname || "微信用户")}</span>
              <span>${escapeHtml(formatMoney(order.total_amount))}</span>
            </div>
            <div class="row-line row-sub">
              <span class="${statusClass}">${escapeHtml(statusLabel(order.status))}</span>
              <span>${escapeHtml(paymentStatusLabel(order.payment_status))}</span>
            </div>
            <div class="row-line row-sub">
              <span>${escapeHtml(order.pickup && order.pickup.name ? order.pickup.name : "")}</span>
              <span>${escapeHtml(formatDate(order.created_at))}</span>
            </div>
            <div class="row-line row-sub">
              <span class="order-group-chip">${escapeHtml(formatGroupNo(getOrderGroupId(order)))}</span>
            </div>
          </button>
        `;
      }
      const isExpanded = Boolean(state.expandedCurrentOrders[order.id]);
      return `
        <div class="order-accordion-wrap ${isExpanded ? "is-open" : ""}">
          <button class="order-row ${isSelected ? "active" : ""}${batchCls}" type="button" data-order-expand="${escapeHtml(order.id)}">
            ${batchMark}
            <div class="row-line row-main">
              <span><span class="order-number-badge">${escapeHtml(orderNumberLabel(order))}</span> ${escapeHtml(order.userNickname || "微信用户")}</span>
              <span>${escapeHtml(formatMoney(order.total_amount))}</span>
            </div>
            <div class="row-line row-sub">
              <span class="${statusClass}">${escapeHtml(statusLabel(order.status))}</span>
              <span>${escapeHtml(paymentStatusLabel(order.payment_status))}</span>
            </div>
            <div class="row-line row-sub">
              <span>${escapeHtml(order.pickup && order.pickup.name ? order.pickup.name : "")}</span>
              <span>${escapeHtml(formatDate(order.created_at))}</span>
            </div>
            <div class="row-line row-sub">
              <span class="order-group-chip">${escapeHtml(formatGroupNo(getOrderGroupId(order)))}</span>
            </div>
            <div class="order-expand-toggle">${isExpanded ? "收起 ▲" : "展开 ▼"}</div>
          </button>
          ${canQuickComplete ? `
            <div class="order-card-actions">
              <button class="order-quick-complete" type="button" data-order-quick-complete="${escapeHtml(order.id)}">一键标记“已完成”</button>
            </div>` : ""}
          ${isExpanded ? renderInlineOrderExpanded(order) : ""}
        </div>
      `;
    }).join("");
  }

  function renderHistoryOrderGroups() {
    const groups = getHistoryOrderGroups();
    if (!groups.length) return `<div class="empty">还没有历史订单。</div>`;

    return groups.map((group) => {
      // 展开与否完全由 expandedHistoryGroups 控制（选中订单时相关 handler 已置为 true），
      // 不能再用 hasSelectedOrder 强制展开，否则含选中订单的分组永远收不起来。
      const isOpen = Boolean(state.expandedHistoryGroups[group.groupId]);
      return `
        <div class="history-group ${isOpen ? "open" : ""}">
          <div class="history-group-head">
            <button class="history-group-toggle" type="button" data-history-group-toggle="${escapeHtml(group.groupId)}">
              <span class="history-group-title">${escapeHtml(group.label)}</span>
              <span class="history-group-meta">${escapeHtml(group.orders.length)} 单 · 已完成 ${escapeHtml(formatMoney(getGroupCompletedRevenue(group.groupId)))}</span>
              <span class="history-group-date">${escapeHtml(group.meta)}</span>
            </button>
            ${getManualOrderGroup(group.groupId) ? `<button class="history-group-edit" type="button" data-manual-group-edit="${escapeHtml(group.groupId)}" aria-label="编辑团购标题和日期" title="编辑团购标题和日期">✎</button>` : ""}
          </div>
          ${isOpen ? `
            <div class="history-group-orders">
              ${renderOrderList(group.orders, "这个团购下面还没有订单。")}
            </div>
          ` : ""}
        </div>
      `;
    }).join("");
  }

  function renderUserList() {
    const members = getFilteredMembers();
    if (!members.length) return `<div class="empty">没有匹配到用户。</div>`;
    return members.map((member) => `
      <button class="list-row ${Number(member.id) === Number(state.selectedUserId) ? "active" : ""}" type="button" data-user-select="${escapeHtml(member.id)}">
        <div class="row-line row-main">
          <span>${escapeHtml(member.nickname || "微信用户")}${String(member.tag) === "tester" ? ` <span class="user-tag-chip">${escapeHtml(userTagLabel(member.tag))}</span>` : ""}${Number(member.deposit_balance) > 0 ? ` <span class="user-deposit-chip">余额 ${escapeHtml(formatMoney(member.deposit_balance))}</span>` : ""}${member.wechat_id ? ` <span class="user-wechat-chip">微信 ${escapeHtml(member.wechat_id)}</span>` : ""}</span>
          <span>${escapeHtml(formatMoney(getUserCompletedRevenue(member.id)))}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(member.uuid || member.client_id || `ID ${member.id}`)}</span>
          <span>买 ${escapeHtml(getUserCompletedCount(member.id))} 次 · ${escapeHtml(formatDate(member.last_order_at))}</span>
        </div>
        ${member.note ? `<div class="row-line row-sub user-note-line">📝 ${escapeHtml(member.note)}</div>` : ""}
      </button>
    `).join("");
  }

  function renderCakeOrderList() {
    const orders = getFilteredCakeOrders();
    if (!state.cakeOrders.length) return `<div class="empty">还没有蛋糕询单。</div>`;
    if (!orders.length) return `<div class="empty">没有匹配到蛋糕询单。</div>`;
    return orders.map((order) => `
      <button class="list-row ${Number(order.id) === Number(state.selectedCakeOrderId) ? "active" : ""}" type="button" data-cake-order-select="${escapeHtml(order.id)}">
        <div class="row-line row-main">
          <span>#${escapeHtml(order.id)} · ${escapeHtml(order.userNickname || order.customer_name || "微信用户")}</span>
          <span>${escapeHtml(formatMoney(order.total_amount || order.unit_price))}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(order.cake_name || order.cakeName || "蛋糕询单")}${order.flavor ? ` · ${escapeHtml(order.flavor)}` : ""}</span>
          <span>${escapeHtml(cakeStatusLabel(order.status))}</span>
        </div>
        <div class="row-line row-sub">
          <span>自提 ${escapeHtml(order.pickup_date || "未填写")}</span>
          <span>${escapeHtml(formatDate(order.created_at))}</span>
        </div>
      </button>
    `).join("");
  }

  function renderCakeStatusOptions(current) {
    return ["pending", "confirmed", "making", "ready", "completed", "cancelled"].map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(cakeStatusLabel(value))}</option>
    `).join("");
  }

  function renderCakeOrderDetail() {
    const order = getSelectedCakeOrder();
    if (!order) return `<div class="empty">收到蛋糕询单后会显示在这里。</div>`;
    return `
      <div class="detail-head">
        <div>
          <p class="eyebrow">Cake Inquiry</p>
          <h2 class="title detail-title">蛋糕询单 #${escapeHtml(order.id)} · ${escapeHtml(order.userNickname || order.customer_name || "微信用户")}</h2>
          <p class="sub">提交于 ${escapeHtml(formatDate(order.created_at))}</p>
        </div>
        <span class="pill">${escapeHtml(formatMoney(order.total_amount || order.unit_price))}</span>
      </div>
      <div class="detail-grid">
        <div class="detail-meta"><span>蛋糕款式</span><strong>${escapeHtml(order.cake_name || order.cakeName || "未填写")}</strong></div>
        <div class="detail-meta"><span>口味</span><strong>${escapeHtml(order.flavor || "固定口味")}</strong></div>
        <div class="detail-meta"><span>自提日期</span><strong>${escapeHtml(order.pickup_date || "未填写")}</strong></div>
        <div class="detail-meta"><span>偏好时间</span><strong>${escapeHtml(order.preferred_time || "未填写")}</strong></div>
        <div class="detail-meta"><span>状态</span><strong>${escapeHtml(cakeStatusLabel(order.status))}</strong></div>
        <div class="detail-meta"><span>用户 ID</span><strong>${escapeHtml(order.userUuid || `ID ${order.user_id}`)}</strong></div>
      </div>
      <div class="section-block"><p class="section-title">客户备注</p><div>${escapeHtml(order.notes || "无")}</div></div>
      ${order.status === "cancelled" && order.cancel_reason ? `<div class="section-block"><p class="section-title">取消原因</p><div>${escapeHtml(order.cancel_reason)}</div></div>` : ""}
      <form class="section-block form-stack" id="cakeStatusForm" data-cake-order-id="${escapeHtml(order.id)}">
        <p class="section-title">更新询单状态</p>
        <label class="field"><span>状态</span><select class="select" name="status">${renderCakeStatusOptions(order.status || "pending")}</select></label>
        <div class="actions-row"><button class="button-secondary" type="submit">保存蛋糕询单状态</button></div>
      </form>
      <form class="section-block form-stack" id="cakePickupDateForm" data-cake-order-id="${escapeHtml(order.id)}">
        <p class="section-title">调整自提日期</p>
        <label class="field"><span>自提日期</span><input class="input" type="date" name="pickup_date" value="${escapeHtml(order.pickup_date || "")}" required></label>
        <p class="field-hint">保存后，用户前端“我的订单”会同步显示这个日期。</p>
        <div class="actions-row"><button class="button-secondary" type="submit">保存自提日期</button></div>
      </form>
      <p class="field-hint cake-order-safety-note">此专区不修改本周团购订单；蛋糕询单标记为“已完成”后，会按原始下单日期自动加入历史订单和营收分析。</p>
    `;
  }

  function renderProductList() {
    const query = String(state.filters.product_q || "").trim().toLowerCase();
    const products = state.products.filter((product) => {
      if (!query) return true;
      return JSON.stringify([product.name, product.id, product.category]).toLowerCase().includes(query);
    });
    if (!products.length) return `<div class="empty">没有匹配到甜品。</div>`;
    return products.map((product) => `
      <button class="list-row ${Number(product.id) === Number(state.selectedProductId) ? "active" : ""}" type="button" data-product-select="${escapeHtml(product.id)}">
        <div class="row-line row-main">
          <span>${escapeHtml(product.name || "未命名甜品")}</span>
          <span>${escapeHtml(formatMoney(getProductCompletedRevenue(product.id).revenue))}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(product.category || "Dessert")}</span>
          <span>售出 ${escapeHtml(getProductCompletedRevenue(product.id).quantity)} · 单价 ${escapeHtml(formatMoney(product.price || 0))}</span>
        </div>
      </button>
    `).join("");
  }

  function renderInlineOrderExpanded(order) {
    return `
      <div class="order-inline-body">
        <div class="order-inline-items">
          ${(order.items || []).map((item) => `
            <div class="order-inline-item-row">
              <span>${escapeHtml(item.title || "")} × ${escapeHtml(String(item.quantity || 0))}</span>
              <span>${escapeHtml(item.subtotalText || formatMoney(item.subtotal || 0))}</span>
            </div>
          `).join("")}
          <div class="order-inline-item-row order-inline-total">
            <span>合计</span>
            <strong>${escapeHtml(formatMoney(order.total_amount))}</strong>
          </div>
          ${Number(order.deposit_applied) > 0 ? `
            <div class="order-inline-item-row">
              <span>余额抵扣</span>
              <strong>-${escapeHtml(formatMoney(order.deposit_applied))}</strong>
            </div>
            <div class="order-inline-item-row order-inline-total">
              <span>还需支付</span>
              <strong>${escapeHtml(formatMoney(order.amount_due))}</strong>
            </div>` : ""}
        </div>
        ${order.notes ? `
          <div class="order-inline-section">
            <span class="order-inline-label">顾客备注</span>
            <div class="order-inline-note">${escapeHtml(order.notes)}</div>
          </div>
        ` : ""}
        ${order.status === "cancelled" && order.cancel_reason ? `
          <div class="order-inline-section">
            <span class="order-inline-label">取消原因</span>
            <div class="order-inline-note">${escapeHtml(order.cancel_reason)}</div>
          </div>
        ` : ""}
        <form class="order-inline-form" data-inline-form="all" data-order-id="${escapeHtml(order.id)}">
          <div class="order-inline-form-row">
            <select class="select" name="status" style="flex:1;font-size:13px;">
              ${renderStatusOptions(order.status || "pending")}
            </select>
            <select class="select" name="payment_method" style="flex:1;font-size:13px;">
              ${renderPaymentMethodOptions(order.payment_method || "")}
            </select>
          </div>
          <textarea class="textarea" name="admin_comment" rows="2" style="font-size:13px;margin-top:8px;" placeholder="管理员备注（顾客不可见）">${escapeHtml(order.admin_comment || "")}</textarea>
          <div class="order-inline-form-row" style="margin-top:8px;">
            <button class="button-secondary" type="submit" style="font-size:13px;">保存</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderOrderDetail() {
    const order = getSelectedOrder();
    if (!order) return `<div class="empty">选择左边订单后，这里会显示详情。</div>`;
    const manualGroup = getManualOrderGroup(getOrderGroupId(order));

    return `
      <div class="detail-head">
        <div>
          <p class="eyebrow">Order Detail</p>
          <h2 class="title detail-title">${escapeHtml(orderNumberLabel(order))} · ${escapeHtml(order.userNickname || "微信用户")}</h2>
        </div>
        <span class="pill">${escapeHtml(formatMoney(Number(order.deposit_applied) > 0 ? order.amount_due : order.total_amount))}</span>
      </div>

      <div class="detail-grid">
        <div class="detail-meta">
          <span>自提点</span>
          <strong>${escapeHtml(order.pickup && order.pickup.name ? order.pickup.name : "未填写")}</strong>
        </div>
        <div class="detail-meta">
          <span>订单状态</span>
          <strong class="status-tag status-${escapeHtml(order.status || "pending")}">${escapeHtml(statusLabel(order.status))}</strong>
        </div>
        <div class="detail-meta">
          <span>付款状态</span>
          <strong>${escapeHtml(paymentStatusLabel(order.payment_status))}</strong>
        </div>
        <div class="detail-meta">
          <span>付款方式</span>
          <strong>${escapeHtml(order.payment_method || "未记录")}</strong>
        </div>
        ${manualGroup ? `
          <div class="detail-meta">
            <span>商品成交日期</span>
            <strong>${escapeHtml(manualGroup.order_date || "未填写")}</strong>
          </div>
          <div class="detail-meta">
            <span>自提日期</span>
            <strong>${escapeHtml(manualGroup.pickup_date || "未填写")}</strong>
          </div>` : ""}
        ${order.status === "cancelled" && order.cancel_reason ? `
          <div class="detail-meta">
            <span>取消原因</span>
            <strong>${escapeHtml(order.cancel_reason)}</strong>
          </div>` : ""}
        ${Number(order.deposit_applied) > 0 ? `
          <div class="detail-meta">
            <span>订单原价</span>
            <strong>${escapeHtml(formatMoney(order.total_amount))}</strong>
          </div>
          <div class="detail-meta">
            <span>余额抵扣</span>
            <strong>-${escapeHtml(formatMoney(order.deposit_applied))}</strong>
          </div>
          <div class="detail-meta">
            <span>还需支付</span>
            <strong>${escapeHtml(formatMoney(order.amount_due))}</strong>
          </div>` : ""}
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
            ${renderPaymentStatusOptions(order.payment_status || "non_paid")}
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
            ${renderStatusOptions(order.status || "pending")}
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
        <span class="pill">${escapeHtml(formatMoney(getUserCompletedRevenue(user.id)))}</span>
      </div>

      <div class="detail-grid">
        <div class="detail-meta">
          <span>用户标签</span>
          <select class="input user-tag-select" data-user-tag="${escapeHtml(user.id)}">
            <option value="user" ${String(user.tag || "user") === "user" ? "selected" : ""}>用户</option>
            <option value="tester" ${String(user.tag) === "tester" ? "selected" : ""}>测试人员</option>
          </select>
        </div>
        <div class="detail-meta">
          <span>购买次数（已完成）</span>
          <strong>${escapeHtml(getUserCompletedCount(user.id))} 次</strong>
        </div>
        <div class="detail-meta">
          <span>用户 ID</span>
          <strong>${escapeHtml(user.id)}</strong>
        </div>
        <div class="detail-meta">
          <span>UUID</span>
          <strong>${escapeHtml(user.uuid || user.client_id || "未记录")}</strong>
        </div>
        <div class="detail-meta">
          <span>总订单数</span>
          <strong>${escapeHtml(user.order_count || 0)}</strong>
        </div>
        <div class="detail-meta">
          <span>累计消费（已完成）</span>
          <strong>${escapeHtml(formatMoney(getUserCompletedRevenue(user.id)))}</strong>
        </div>
        <div class="detail-meta">
          <span>最近下单时间</span>
          <strong>${escapeHtml(formatDate(user.last_order_at))}</strong>
        </div>
      </div>

      <details class="collapsible-section user-profile-fold">
        <summary class="collapsible-summary">
          <span>余额 / 备注 / 微信号</span>
          <small>当前余额 ${escapeHtml(formatMoney(user.deposit_balance || 0))}</small>
        </summary>
        <div class="user-profile-fold-body">
          <div class="user-balance-card ${Number(user.deposit_balance) > 0 ? "has-balance" : ""}">
            <div>
              <span class="user-balance-label">客户账户余额</span>
              <strong>${escapeHtml(formatMoney(user.deposit_balance || 0))}</strong>
            </div>
            <span>${Number(user.deposit_balance) > 0 ? "前端会提醒当前登录的这个用户" : "当前无余额"}</span>
          </div>
          <form class="form-stack" id="userProfileForm" data-user-id="${escapeHtml(user.id)}">
            <label class="field user-deposit-field">
              <span>客户余额（Deposit）</span>
              <input class="input" type="number" name="deposit_balance" min="0" max="99999999" step="0.01" inputmode="decimal" value="${escapeHtml(Number(user.deposit_balance || 0).toFixed(2))}">
              <small class="field-hint">填写后会在用户列表高亮，并只提醒登录到这个账号的前端用户；不会自动改动或抵扣任何订单。</small>
            </label>
            <label class="field">
              <span>微信号</span>
              <input class="input" type="text" name="wechat_id" placeholder="填写客户微信号，方便核对" value="${escapeHtml(user.wechat_id || "")}">
            </label>
            <label class="field">
              <span>备注</span>
              <textarea class="textarea" name="note" placeholder="给这个客户记点备注（只有管理员看得到）">${escapeHtml(user.note || "")}</textarea>
            </label>
            <div class="actions-row">
              <button class="button-secondary" type="submit">保存用户资料与余额</button>
            </div>
          </form>
        </div>
      </details>

      <details class="collapsible-section user-link-block">
        <summary class="collapsible-summary">
          <span>关联重复登录账号</span>
          <small>${escapeHtml((user.linked_identities || []).length)} 个关联身份</small>
        </summary>
        <div class="user-link-fold-body">
        <p class="field-hint">当前用户会作为主账号。关联后购买次数、消费金额和余额合并显示；历史订单的用户 ID、金额、商品、状态和编号保持原样。</p>
        ${(user.linked_identities || []).length > 1 ? `
          <div class="linked-user-list">
            ${(user.linked_identities || []).map((identity) => {
              const isPrimaryIdentity = Number(identity.id) === Number(user.canonical_user_id || user.id);
              const identityLabel = `${identity.nickname || "微信用户"} · ${identity.uuid || identity.id}`;
              return isPrimaryIdentity
                ? `<span class="user-tag-chip linked-user-chip is-primary">${escapeHtml(identityLabel)} · 主账号</span>`
                : `<button class="user-tag-chip linked-user-chip is-removable" type="button" data-linked-user-remove="${escapeHtml(identity.id)}" data-linked-user-primary="${escapeHtml(user.canonical_user_id || user.id)}" data-linked-user-label="${escapeHtml(identityLabel)}" aria-label="长按移除关联账号 ${escapeHtml(identityLabel)}">${escapeHtml(identityLabel)}<span class="linked-user-remove-mark" aria-hidden="true">×</span></button>`;
            }).join("")}
          </div>
          <p class="field-hint linked-user-remove-hint">长按要解除的账号即可移除；主账号不能移除。</p>` : ""}
        <form class="form-stack" id="userLinkForm" data-user-id="${escapeHtml(user.id)}">
          <label class="field">
            <span>选择要并入的重复账号</span>
            <div class="user-link-search">
              <input class="input" id="userLinkSearchInput" type="search" autocomplete="off" placeholder="搜索昵称 / 用户编号 / 微信号 / 邮箱" aria-controls="userLinkSearchResults" aria-expanded="true">
              <input type="hidden" name="secondary_user_id" value="">
              <div class="user-link-search-results" id="userLinkSearchResults" data-user-link-results>
                ${(state.members || []).filter((candidate) =>
                  !candidate.is_linked_secondary && Number(candidate.id) !== Number(user.id)
                ).map((candidate) => {
                  const candidateLabel = `${candidate.nickname || "微信用户"} · ${candidate.uuid || candidate.id}`;
                  const searchText = [candidate.nickname, candidate.uuid, candidate.id, candidate.wechat_id, candidate.email]
                    .map((value) => String(value || "").toLowerCase()).join(" ");
                  return `
                    <button class="user-link-search-result" type="button" data-user-link-candidate="${escapeHtml(candidate.id)}" data-user-link-label="${escapeHtml(candidateLabel)}" data-user-link-search="${escapeHtml(searchText)}">
                      <span><strong>${escapeHtml(candidate.nickname || "微信用户")}</strong><small>${escapeHtml(candidate.uuid || `ID ${candidate.id}`)}${candidate.wechat_id ? ` · 微信 ${escapeHtml(candidate.wechat_id)}` : ""}${candidate.email ? ` · ${escapeHtml(candidate.email)}` : ""}</small></span>
                      <span class="user-link-result-balance">余额 ${escapeHtml(formatMoney(candidate.deposit_balance || 0))}</span>
                    </button>`;
                }).join("") || `<div class="empty compact">没有其他可合并账号。</div>`}
              </div>
              <p class="field-hint user-link-search-hint" data-user-link-hint>输入关键词筛选，然后点选一个账号。</p>
            </div>
          </label>
          <div class="actions-row"><button class="button-secondary" type="submit">确认关联并合并余额</button></div>
        </form>
        </div>
      </details>

      <div class="section-block">
        <p class="section-title">历史订单</p>
        <div class="item-list">
          ${orders.length ? orders.map((order) => `
            <button class="mini-order-row" type="button" data-view-tab="history_orders" data-order-jump="${escapeHtml(order.id)}">
              <span>${escapeHtml(order.groupOrderNumberText || order.orderNumber || order.id)} · ${escapeHtml(formatMoney(order.total_amount))}</span>
              <span>${escapeHtml(formatDate(order.created_at))}</span>
            </button>
          `).join("") : `<div class="empty compact">这个用户还没有订单。</div>`}
        </div>
      </div>
    `;
  }

  function renderCollectionOptions() {
    return getCollectionLibrary().map((group) => `
      <optgroup label="${escapeHtml(group.group)}">
        ${group.items.map((item) => `
          <option value="${escapeHtml(item.id)}">${escapeHtml(item.zh)} / ${escapeHtml(item.en)}</option>
        `).join("")}
      </optgroup>
    `).join("");
  }

  function getCollectionLibrary() {
    // 数据库图鉴（API）为准；为空时回退到内置数据。
    if (Array.isArray(state.collectionGroups) && state.collectionGroups.length) {
      return state.collectionGroups.map((group) => ({
        group: group.group || group.category || "未分类",
        items: (group.items || []).map((item) => ({
          id: `db-${item.id}`,
          zh: item.name || "未命名甜品",
          en: item.name_en || item.name || "Makkie Dessert",
          file: item.image_file || "",
          image_url: item.image_url || "",
          db_id: item.id,
          is_dynamic: true
        }))
      })).filter((group) => group.items.length);
    }
    return COLLECTION_LIBRARY;
  }

  function renderCollectionManager() {
    const groups = getCollectionLibrary();
    const categories = Array.from(new Set(groups.map((g) => g.group)));
    return `
      <section class="admin-detail-card">
        <div class="detail-head"><div>
          <p class="eyebrow">Collection</p>
          <h2 class="title" style="font-size:30px;">图鉴管理</h2>
          <p class="sub">上传新甜品图片，选择或新建分类。会进入图鉴库并通过 /api/collection 提供。</p>
        </div></div>
        <form id="collectionUploadForm" class="collection-upload">
          <div class="collection-upload-row">
            <input class="input" name="name" placeholder="甜品名字（中文）" required>
            <input class="input" name="name_en" placeholder="英文名（可选）">
          </div>
          <div class="collection-upload-row">
            <select class="select" data-collection-cat-select>
              <option value="" selected>选择分类…</option>
              ${categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
              <option value="__new__">＋ 输入新分类…</option>
            </select>
            <input class="input" id="collectionCatNew" name="category" placeholder="新分类名称" hidden>
            <datalist id="collectionCats">${categories.map((c) => `<option value="${escapeHtml(c)}"></option>`).join("")}</datalist>
            <input class="input" type="file" name="image" accept="image/*" required>
          </div>
          <button class="button" type="submit" id="collectionUploadBtn">上传到图鉴</button>
        </form>
        <div class="collection-grid">
          ${groups.map((g) => `
            <div class="collection-cat-block">
              <div class="collection-cat-title">${escapeHtml(g.group)} · ${g.items.length}</div>
              <div class="collection-cat-items">
                ${g.items.map((it) => {
                  if (it.db_id && Number(it.db_id) === Number(state.editingCollectionId)) {
                    return `
                      <div class="collection-card collection-card--editing">
                        <form class="collection-edit-form" data-collection-edit-form="${escapeHtml(it.db_id)}">
                          <input class="input" name="name" value="${escapeHtml(it.zh)}" placeholder="名字（中文）" required>
                          <input class="input" name="name_en" value="${escapeHtml(it.en)}" placeholder="英文名">
                          <input class="input" name="category" list="collectionCats" value="${escapeHtml(g.group)}" placeholder="分类">
                          <label class="collection-edit-file">换图片（不选=不变）<input type="file" name="image" accept="image/*"></label>
                          <div class="collection-edit-actions">
                            <button type="submit" class="button-secondary" style="font-size:12px;">保存</button>
                            <button type="button" class="button-secondary" data-collection-edit-cancel style="font-size:12px;">取消</button>
                          </div>
                        </form>
                      </div>
                    `;
                  }
                  return `
                    <div class="collection-card">
                      ${it.image_url ? `<img class="collection-card-img" src="${escapeHtml(it.image_url)}" alt="" loading="lazy">` : `<div class="collection-card-img"></div>`}
                      <div class="collection-card-name">${escapeHtml(it.zh)}</div>
                      ${it.db_id ? `
                        <button type="button" class="collection-card-edit" data-collection-edit="${escapeHtml(it.db_id)}">编辑</button>
                        <button type="button" class="collection-card-del" data-collection-del="${escapeHtml(it.db_id)}">删除</button>
                      ` : ""}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function findCollectionPreset(id) {
    for (const group of getCollectionLibrary()) {
      const found = group.items.find((item) => item.id === id);
      if (found) return { ...found, group: group.group };
    }
    return null;
  }

  function renderWeeklyOrderEditor() {
    const weeklyOrder = state.weeklyOrder || {};
    const currentProducts = getCurrentWeeklyProducts();
    const assignableProducts = getAssignableProducts();
    const defaultTitle = makeDefaultGroupTitle();
    const currentTitle = weeklyOrder.title && weeklyOrder.title !== "本周预定" ? weeklyOrder.title : defaultTitle;
    const currentStartAt = toDatetimeInputValue(weeklyOrder.start_at);
    const currentDeadlineAt = toDatetimeInputValue(weeklyOrder.order_deadline_at);
    const extraUntilMs = Date.parse(weeklyOrder.extra_order_until || "");
    const extraWindowActive = Number.isFinite(extraUntilMs) && extraUntilMs > Date.now();

    // 「开始后 N 小时」相对标签：截单 - 开始 的整点小时数
    const startDate = weeklyOrder.start_at ? new Date(weeklyOrder.start_at) : null;
    const deadlineDate = weeklyOrder.order_deadline_at ? new Date(weeklyOrder.order_deadline_at) : null;
    let relHoursLabel = "";
    if (startDate && deadlineDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(deadlineDate.getTime())) {
      const relHours = Math.round((deadlineDate.getTime() - startDate.getTime()) / 3600000);
      if (relHours > 0) relHoursLabel = `<span class="weekly-rel">开始后 ${relHours} 小时</span>`;
    }
    // 「下一期」编号：当前开始时间 +7 天（无开始时间则以今天为基准）
    const nextBase = startDate && !Number.isNaN(startDate.getTime()) ? new Date(startDate) : new Date();
    nextBase.setDate(nextBase.getDate() + 7);
    const nextTitle = makeDefaultGroupTitle(nextBase);
    const lastSavedLabel = weeklyLastSavedAt ? `上次保存于 ${weeklyLastSavedAt}` : "本次会话尚未保存";
    const visuallyOpen = Boolean(weeklyOrder.is_open || extraWindowActive);

    return `
      <section class="weekly-current-group-card">
      <section class="weekly-overview-card">
        <div class="weekly-overview-copy">
          <p class="eyebrow">Weekly Group · 当前团购</p>
          <div class="weekly-overview-title-row">
            <h2 class="section-heading">编辑本次团购</h2>
            <span class="weekly-title-chip">${escapeHtml(currentTitle)}</span>
          </div>
        </div>
        ${renderWeeklyCountdownBoxes(currentStartAt, currentDeadlineAt)}
        <div class="weekly-open-control">
          <span>开放状态</span>
          <button class="weekly-open-button ${visuallyOpen ? "is-open" : ""}" type="button" data-weekly-open-toggle aria-pressed="${visuallyOpen ? "true" : "false"}">
            <span class="weekly-status-dot"></span>
            <strong>${extraWindowActive ? "加单中" : (weeklyOrder.is_open ? "开放中" : "已关闭")}</strong>
            <small>${visuallyOpen ? "点击关闭" : "点击开启"}</small>
          </button>
        </div>
      </section>

      <div class="weekly-current-group-tabs">
      <details class="collapsible-section weekly-manage-tab weekly-products-section" data-weekly-products-section ${state.weeklyProductsOpen ? "open" : ""}>
        <summary class="collapsible-summary weekly-products-head">
          <span class="weekly-tab-title">本周产品</span>
          <small>${escapeHtml(currentProducts.length)} 款</small>
        </summary>
        <div class="weekly-products-body">
          <div class="weekly-products-toolbar">
            <button class="button-secondary weekly-add-products-button" type="button" data-weekly-products-toggle aria-expanded="${state.weeklyProductCreatorOpen ? "true" : "false"}">
              <i class="ph ph-plus" aria-hidden="true"></i> 添加产品
            </button>
          </div>

        <div class="current-product-list">
          ${currentProducts.length ? currentProducts.map((product) => {
            const isActive = Number(product.is_active) === 1;
            const isZeroStock = Number(product.stock || 0) === 0;
            return `
            <form class="current-product-card ${isActive ? "" : "is-inactive"}" data-current-product-form="${escapeHtml(product.id)}">
              <div class="current-product-head">
                <div class="current-product-image-wrap ${product.image_url ? "" : "missing"}">
                  ${product.image_url
                    ? `<img class="current-product-image" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name || "")}" loading="lazy">`
                    : `<div class="current-product-image-missing">IMG</div>`
                  }
                </div>
                <div class="current-product-title-block">
                  <div class="row-line row-main">
                    <strong>${escapeHtml(product.name)}</strong>
                    <span>ID ${escapeHtml(product.id)}</span>
                  </div>
                  <div class="row-line row-sub">
                    <span>${escapeHtml(product.category || "Dessert")}</span>
                    <span class="current-product-sync">${product.image_url ? "图片已同步" : "必须上传图片"}</span>
                  </div>
                </div>
              </div>
              <div class="inline-form-grid">
                <label class="field">
                  <span>价格</span>
                  <input class="input" type="number" name="price" step="0.01" min="0" value="${escapeHtml(product.price || 0)}" required>
                </label>
                <label class="field">
                  <span>库存</span>
                  <input class="input ${isZeroStock ? "is-zero" : ""}" type="number" name="stock" min="0" value="${escapeHtml(product.stock || 0)}" required>
                </label>
                <label class="field">
                  <span>限购</span>
                  <input class="input" type="number" name="limit_per_order" min="0" value="${escapeHtml(product.limit_per_order == null ? "" : product.limit_per_order)}">
                </label>
                <label class="field">
                  <span>状态</span>
                  <select class="select" name="is_active">
                    <option value="1" ${isActive ? "selected" : ""}>上架中</option>
                    <option value="0" ${isActive ? "" : "selected"}>已下架</option>
                  </select>
                </label>
              </div>
              <div class="current-product-file-row">
                <span>${product.image_url ? "更新图片（会同步图鉴）" : "上传图片（必填，会同步图鉴）"}</span>
                <div class="current-product-file-actions">
                  <label class="current-product-file-button">
                    选择文件…
                    <input type="file" name="image" accept="image/*" ${product.image_url ? "" : "required"}>
                  </label>
                  <button class="current-product-remove" type="button" data-product-unassign="${escapeHtml(product.id)}">移出本周</button>
                </div>
              </div>
              <button type="submit" hidden>保存本周设置</button>
            </form>`;
          }).join("") : `<div class="empty">本周还没有选甜品，点击“添加产品”开始配置。</div>`}
        </div>

        ${state.weeklyProductCreatorOpen ? `
          <div class="weekly-product-creators">
            <div class="expandable-actions-grid">
              <details class="collapsible-section inner-section">
                <summary class="collapsible-summary"><span>从现有产品加入</span><small>${escapeHtml(assignableProducts.length)} 款可选</small></summary>
                <form class="form-stack" id="productAssignForm">
                  <label class="field"><span>选择产品</span><select class="select" name="product_id" required><option value="">请选择产品</option>${assignableProducts.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} · ID ${escapeHtml(product.id)}</option>`).join("")}</select></label>
                  <div class="actions-row"><button class="button-secondary" type="submit">加入本周</button></div>
                </form>
              </details>
              <details class="collapsible-section inner-section">
                <summary class="collapsible-summary"><span>从图鉴创建</span><small>选择旧图鉴甜品</small></summary>
                <form class="form-stack" id="collectionCreateForm">
                  <label class="field"><span>图鉴甜品</span><select class="select" name="preset_id" required><option value="">请选择图鉴甜品</option>${renderCollectionOptions()}</select></label>
                  <div class="inline-form-grid inline-form-grid--three">
                    <label class="field"><span>价格</span><input class="input" type="number" name="price" step="0.01" min="0" required></label>
                    <label class="field"><span>库存</span><input class="input" type="number" name="stock" min="0" required></label>
                    <label class="field"><span>限购</span><input class="input" type="number" name="limit_per_order" min="0" placeholder="留空表示不限购"></label>
                  </div>
                  <div class="actions-row"><button class="button" type="submit">创建到本周</button></div>
                </form>
              </details>
              <details class="collapsible-section inner-section">
                <summary class="collapsible-summary"><span>上传图片创建</span><small>新甜品</small></summary>
                <form class="form-stack" id="customCreateForm">
                  <div class="inline-form-grid">
                    <label class="field"><span>商品名</span><input class="input" type="text" name="name" required></label>
                    <label class="field"><span>价格</span><input class="input" type="number" name="price" step="0.01" min="0" required></label>
                    <label class="field"><span>库存</span><input class="input" type="number" name="stock" min="0" required></label>
                    <label class="field"><span>限购</span><input class="input" type="number" name="limit_per_order" min="0" placeholder="留空表示不限购"></label>
                  </div>
                  <label class="field"><span>描述</span><textarea class="textarea textarea-compact" name="description"></textarea></label>
                  <label class="field"><span>商品图片</span><input class="input" type="file" name="image" accept="image/*" required></label>
                  <div class="actions-row"><button class="button" type="submit">上传并创建到本周</button></div>
                </form>
              </details>
            </div>
          </div>` : ""}
        </div>
      </details>

      <details class="collapsible-section weekly-manage-tab weekly-base-settings">
        <summary class="collapsible-summary">
          <span class="weekly-tab-title">团购基础设置</span>
        </summary>
        <form class="weekly-editor-form" id="weeklyOrderForm">
          <input type="hidden" name="is_open" value="${weeklyOrder.is_open ? "1" : "0"}">
          <div class="weekly-fields-grid">
            <label class="field">
              <span>团购标题</span>
              <input class="input" type="text" name="title" value="${escapeHtml(currentTitle)}" required>
              <small class="field-hint">编号自动生成，可手动修改。</small>
            </label>
            ${renderDateTimeWheelField("weekly-order-start", "start_at", "开始时间", currentStartAt, null, "团购开放接单的时间。")}
            ${renderDateTimeWheelField("weekly-order-deadline", "order_deadline_at", "截单时间", currentDeadlineAt, "weekly-order-start", null, relHoursLabel)}
          </div>
          <div class="weekly-editor-foot">
            <div class="weekly-foot-left">
              <span class="weekly-lastsaved">${escapeHtml(lastSavedLabel)}</span>
            </div>
            <div class="weekly-editor-actions">
              <button class="button-secondary extra-window-button ${extraWindowActive ? "is-active" : ""}" type="button" data-extra-order-window>
                ${extraWindowActive ? "重新开放 10 分钟" : "开放加单 10 分钟"}
              </button>
              <button class="button" type="submit">保存本次团购</button>
            </div>
          </div>
          <div class="extra-window-note ${extraWindowActive ? "is-active" : ""}">
            ${extraWindowActive
              ? `加单开放至 ${escapeHtml(formatDate(weeklyOrder.extra_order_until))}。使用现有剩余库存，不改变原开始/截单时间。`
              : "临时加单只开放 10 分钟，使用现有剩余库存，不改变原开始/截单时间。"}
          </div>
        </form>
      </details>
      ${renderPickupSettings()}
      </div>
      </section>
      <details class="weekly-create-card weekly-create-card--bottom">
        <summary class="weekly-create-summary">
          <span class="weekly-create-icon"><i class="ph ph-plus" aria-hidden="true"></i></span>
          <div class="weekly-create-text">
            <div class="weekly-create-title">创建新一期团购</div>
          </div>
          <span class="weekly-create-next">创建下一期 · ${escapeHtml(nextTitle)}</span>
        </summary>
        <form class="form-stack" id="weeklyOrderCreateForm" data-next-title="${escapeHtml(nextTitle)}">
          <div class="weekly-fields-grid">
            <label class="field"><span>团购标题</span><input class="input" type="text" name="title" value="${escapeHtml(nextTitle)}" required></label>
            <label class="field"><span>开放状态</span><select class="select" name="is_open"><option value="0" selected>暂不开放</option><option value="1">开放预定</option></select></label>
            ${renderDateTimeWheelField("weekly-order-create-start", "start_at", "开始时间", "")}
            ${renderDateTimeWheelField("weekly-order-create-deadline", "order_deadline_at", "截单时间", "", "weekly-order-create-start")}
          </div>
          <div class="actions-row"><button class="button" type="submit">确认创建并切换</button></div>
        </form>
      </details>
    `;
  }

  function renderProductDetail() {
    const product = getSelectedProduct();
    if (!product) return `<div class="empty">选择左边甜品后，这里会显示历史订单。</div>`;
    const metrics = getProductMetrics(product.id);
    const orders = getProductOrders(product.id);

    return `
      <div class="detail-head">
        <div>
          <p class="eyebrow">Product History</p>
          <h2 class="title detail-title">${escapeHtml(product.name || "未命名甜品")}</h2>
          <p class="sub">Product ID ${escapeHtml(product.id)} · ${escapeHtml(product.category || "Dessert")}</p>
        </div>
        <span class="pill">${escapeHtml(formatMoney(product.price || 0))}</span>
      </div>

      <div class="detail-grid">
        <div class="detail-meta">
          <span>总销量</span>
          <strong>${escapeHtml(metrics.quantity)}</strong>
        </div>
        <div class="detail-meta">
          <span>历史收入</span>
          <strong>${escapeHtml(formatMoney(metrics.revenue))}</strong>
        </div>
        <div class="detail-meta">
          <span>当前库存</span>
          <strong>${escapeHtml(product.stock || 0)}</strong>
        </div>
        <div class="detail-meta">
          <span>当前限购</span>
          <strong>${escapeHtml(product.limit_per_order == null ? "不限" : product.limit_per_order)}</strong>
        </div>
      </div>

      <div class="section-block">
        <p class="section-title">历史订单</p>
        <div class="item-list">
          ${orders.length ? orders.map((order) => `
            <button class="mini-order-row" type="button" data-view-tab="history_orders" data-order-jump="${escapeHtml(order.id)}">
              <span>${escapeHtml(order.groupOrderNumberText || order.orderNumber || order.id)} · ${escapeHtml(order.userNickname || "")}</span>
              <span>${escapeHtml(formatDate(order.created_at))}</span>
            </button>
          `).join("") : `<div class="empty compact">这个甜品还没有历史订单。</div>`}
        </div>
      </div>
    `;
  }

  function renderOptions(values, current) {
    return values.map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(value)}</option>
    `).join("");
  }

  function renderStatusOptions(current) {
    return ORDER_STATUS_VALUES.map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(statusLabel(value))}</option>
    `).join("");
  }

  function renderPaymentStatusOptions(current) {
    return ["non_paid", "paid", "refunded"].map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(paymentStatusLabel(value))}</option>
    `).join("");
  }

  function renderCombinedOrderFilterOptions() {
    const current = state.filters.status
      ? `status:${state.filters.status}`
      : (state.filters.payment_status ? `payment:${state.filters.payment_status}` : "");
    const option = (value, label) =>
      `<option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>`;
    return `
      ${option("", "全部订单 / 付款状态")}
      <optgroup label="订单状态">
        ${ORDER_STATUS_VALUES
          .map((value) => option(`status:${value}`, statusLabel(value))).join("")}
      </optgroup>
      <optgroup label="付款状态">
        ${["non_paid", "paid", "refunded"]
          .map((value) => option(`payment:${value}`, paymentStatusLabel(value))).join("")}
      </optgroup>`;
  }

  function renderPaymentMethodOptions(current) {
    const values = [
      ["", "未记录"],
      ["cash", "cash"],
      ["venmo", "venmo"],
      ["zelle", "zelle"],
      ["alipay", "alipay"],
      ["deposit", "账户余额"]
    ];
    return values.map(([value, label]) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function getManualCollectionItems() {
    return getCollectionLibrary().flatMap((group) => (group.items || [])
      .filter((item) => Number(item.db_id) > 0)
      .map((item) => {
        const matchedProduct = state.products.find((product) =>
          String(product.name || "").trim().toLowerCase() === String(item.zh || "").trim().toLowerCase());
        return {
          id: Number(item.db_id),
          name: item.zh || "未命名甜品",
          name_en: item.en || "",
          category: group.group || "未分类",
          price: matchedProduct ? Number(matchedProduct.price) || 0 : 0
        };
      }));
  }

  function getManualCatalogItems() {
    const collectionItems = getManualCollectionItems().map((item) => ({
      ...item,
      key: `collection:${item.id}`,
      source_type: "collection",
      collection_item_id: item.id,
      option_group: `甜品图鉴 · ${item.category}`
    }));
    const cakeItems = (state.cakeCatalog || []).flatMap((cake) => {
      const flavors = Array.isArray(cake.flavors) ? cake.flavors : [];
      const variants = flavors.length ? flavors : [""];
      return variants.map((flavor) => ({
        key: `cake:${cake.id}:${flavor}`,
        source_type: "cake",
        cake_id: cake.id,
        flavor,
        name: flavor ? `${cake.name} · ${flavor}` : cake.name,
        name_en: "",
        category: "蛋糕图鉴",
        option_group: `蛋糕图鉴 · ${cake.name}`,
        price: Number(cake.price) || 0
      }));
    });
    return collectionItems.concat(cakeItems);
  }

  function manualCatalogOptions(currentKey) {
    const items = getManualCatalogItems();
    const categories = Array.from(new Set(items.map((item) => item.option_group)));
    return `<option value="" ${currentKey ? "" : "selected"} disabled>请选择图鉴商品</option>` + categories.map((category) => `
      <optgroup label="${escapeHtml(category)}">
        ${items.filter((item) => item.option_group === category).map((item) => `
          <option value="${escapeHtml(item.key)}" data-price="${escapeHtml(item.price)}" data-source-type="${escapeHtml(item.source_type)}" data-collection-item-id="${escapeHtml(item.collection_item_id || "")}" data-cake-id="${escapeHtml(item.cake_id || "")}" data-flavor="${escapeHtml(item.flavor || "")}" ${item.key === currentKey ? "selected" : ""}>
            ${escapeHtml(item.name)}${item.name_en && item.name_en !== item.name ? ` / ${escapeHtml(item.name_en)}` : ""}
          </option>
        `).join("")}
      </optgroup>
    `).join("");
  }

  function manualOrderItemRow(index, catalogKey = "", quantity = 1, unitPrice) {
    const items = getManualCatalogItems();
    const selectedItem = items.find((item) => item.key === catalogKey) || null;
    const price = unitPrice == null
      ? (selectedItem ? Number(selectedItem.price) || 0 : 0)
      : Number(unitPrice) || 0;
    return `
      <div class="manual-order-item" data-manual-order-item>
        <label class="field manual-order-item-product"><span>甜品 / 蛋糕图鉴商品</span>
          <select class="select" data-manual-product required>${manualCatalogOptions(selectedItem && selectedItem.key)}</select>
        </label>
        <label class="field"><span>数量</span><input class="input" data-manual-quantity type="number" min="1" max="999" step="1" value="${escapeHtml(quantity)}" required></label>
        <label class="field"><span>成交单价</span><input class="input" data-manual-price type="number" min="0" step="0.01" value="${escapeHtml(price.toFixed(2))}" required></label>
        <div class="manual-order-item-total"><span>小计</span><strong data-manual-subtotal>${formatMoney(selectedItem ? price * quantity : 0)}</strong></div>
        <button class="manual-order-remove" type="button" data-manual-item-remove aria-label="移除第 ${escapeHtml(index + 1)} 项">×</button>
      </div>`;
  }

  function closeManualOrderDialog() {
    const overlay = document.querySelector("[data-manual-order-overlay]");
    if (overlay) overlay.remove();
  }

  function closeManualGroupDialog() {
    const overlay = document.querySelector("[data-manual-group-overlay]");
    if (overlay) overlay.remove();
  }

  function openManualGroupDialog(groupId) {
    const group = getManualOrderGroup(groupId);
    if (!group) return;
    closeManualGroupDialog();
    const overlay = document.createElement("div");
    overlay.className = "manual-order-overlay";
    overlay.dataset.manualGroupOverlay = "";
    overlay.innerHTML = `
      <section class="manual-order-panel manual-group-panel" role="dialog" aria-modal="true" aria-labelledby="manualGroupTitle">
        <header class="manual-order-header">
          <div><p class="eyebrow">Manual Group</p><h2 id="manualGroupTitle">编辑历史团购</h2></div>
          <button class="manual-order-close" type="button" data-manual-group-close aria-label="关闭">×</button>
        </header>
        <form class="manual-order-form" data-manual-group-form>
          <div class="manual-order-note">修改后，历史订单与数据分析会同步使用新的团购标题和商品成交日期；自提日期单独显示。订单内容、金额和库存不会改变。</div>
          <section class="manual-order-section">
            <div class="manual-order-fields manual-order-fields--group">
              <label class="field"><span>团购标题 *</span><input class="input" name="title" maxlength="120" value="${escapeHtml(group.title || formatGroupNo(group.group_id))}" required></label>
              <label class="field"><span>商品成交日期 *</span><input class="input" name="order_date" type="date" value="${escapeHtml(group.order_date || "")}" required></label>
              <label class="field"><span>自提日期</span><input class="input" name="pickup_date" type="date" value="${escapeHtml(group.pickup_date || "")}"></label>
            </div>
            <p class="field-hint">内部编号：${escapeHtml(group.group_id)}</p>
          </section>
          <footer class="manual-order-actions">
            <button class="button-secondary" type="button" data-manual-group-close>取消</button>
            <button class="button" type="submit" data-manual-group-submit>保存修改</button>
          </footer>
        </form>
      </section>`;
    document.body.appendChild(overlay);
    const form = overlay.querySelector("[data-manual-group-form]");
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target.closest("[data-manual-group-close]")) closeManualGroupDialog();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("[data-manual-group-submit]");
      const data = new FormData(form);
      submit.disabled = true;
      submit.textContent = "保存中…";
      try {
        const result = await api("/api/admin/manual-order-groups", { method: "PATCH", body: {
          group_id: group.group_id,
          title: data.get("title"),
          order_date: data.get("order_date"),
          pickup_date: data.get("pickup_date")
        }});
        const index = state.manualOrderGroups.findIndex((item) => String(item.group_id) === String(group.group_id));
        if (index >= 0) state.manualOrderGroups[index] = result.group;
        else state.manualOrderGroups.push(result.group);
        closeManualGroupDialog();
        setFlash("success", "团购标题和日期已同步到历史订单与数据分析。");
      } catch (error) {
        submit.disabled = false;
        submit.textContent = "保存修改";
        alert(error.message || "保存失败");
      }
    });
    form.elements.title.focus();
  }

  function updateManualOrderTotals(overlay) {
    let total = 0;
    overlay.querySelectorAll("[data-manual-order-item]").forEach((row) => {
      const quantity = Math.max(0, Number(row.querySelector("[data-manual-quantity]").value) || 0);
      const price = Math.max(0, Number(row.querySelector("[data-manual-price]").value) || 0);
      const subtotal = Math.round(quantity * price * 100) / 100;
      total += subtotal;
      row.querySelector("[data-manual-subtotal]").textContent = formatMoney(subtotal);
    });
    const totalNode = overlay.querySelector("[data-manual-order-total]");
    if (totalNode) totalNode.textContent = formatMoney(total);
  }

  function openManualOrderDialog() {
    const manualCatalogItems = getManualCatalogItems();
    if (!manualCatalogItems.length || !state.pickups.length) {
      setFlash("error", "请先保留至少一项甜品或蛋糕图鉴商品，以及一个自提地点。");
      return;
    }
    closeManualOrderDialog();
    const historyGroupIds = Array.from(new Set(
      state.orders.map((order) => getOrderGroupId(order)).filter((groupId) => groupId && !isCurrentGroup(groupId))
    ));
    const overlay = document.createElement("div");
    overlay.className = "manual-order-overlay";
    overlay.dataset.manualOrderOverlay = "";
    overlay.innerHTML = `
      <section class="manual-order-panel" role="dialog" aria-modal="true" aria-labelledby="manualOrderTitle">
        <header class="manual-order-header">
          <div><p class="eyebrow">Historical Order</p><h2 id="manualOrderTitle">手动添加历史订单</h2></div>
          <button class="manual-order-close" type="button" data-manual-order-close aria-label="关闭">×</button>
        </header>
        <form id="manualOrderForm" class="manual-order-form">
          <div class="manual-order-note">从甜品或蛋糕图鉴补录历史订单，不检查、不扣减、也不恢复本周库存；普通订单计入订单和营收，活动单不计营收。</div>
          <section class="manual-order-section">
            <h3>客户资料</h3>
            <div class="manual-order-fields manual-order-fields--customer">
              <label class="field"><span>客户姓名 *</span><input class="input" name="customer_name" maxlength="120" required placeholder="输入姓名"></label>
              <label class="field"><span>联系电话</span><input class="input" name="customer_phone" maxlength="80" placeholder="选填"></label>
            </div>
            <label class="field"><span>关联已有客户（选填）</span>
              <input class="input" type="search" data-manual-user-search placeholder="搜索昵称 / 用户编号 / 微信号 / 邮箱">
              <input type="hidden" name="user_id" data-manual-user-id>
            </label>
            <div class="manual-user-results" data-manual-user-results hidden></div>
            <p class="field-hint" data-manual-user-hint>不关联时会自动建立一个普通客户账号，以后仍可在用户页合并。</p>
          </section>
          <section class="manual-order-section">
            <h3>订单资料</h3>
            <div class="manual-order-fields">
              <label class="field"><span>历史团购编号</span><input class="input" name="group_id" list="manualHistoryGroupIds" maxlength="48" placeholder="留空则按日期自动归档"><datalist id="manualHistoryGroupIds">
                ${historyGroupIds.map((groupId) => `<option value="${escapeHtml(groupId)}">${escapeHtml(formatGroupNo(groupId))}</option>`).join("")}
              </datalist></label>
              <label class="field"><span>团购标题</span><input class="input" name="group_title" maxlength="120" placeholder="例如：八月甜品团购"></label>
              <label class="field"><span>商品成交日期 *</span><input class="input" type="date" name="group_date" value="${escapeHtml(toDatetimeInputValue(new Date()).slice(0, 10))}" required></label>
              <label class="field"><span>自提日期</span><input class="input" type="date" name="pickup_date" value="${escapeHtml(toDateValue(getThisSaturday()))}"></label>
              <label class="field"><span>订单编号</span><input class="input" type="number" name="group_order_number" min="1" max="999999" step="1" placeholder="留空则自动编号"></label>
              <label class="field"><span>下单时间 *</span><input class="input" type="datetime-local" name="created_at" value="${escapeHtml(toDatetimeInputValue(new Date()))}" required></label>
              <label class="field"><span>自提地点 *</span><select class="select" name="pickup_location_id" required>
                ${state.pickups.map((pickup) => `<option value="${escapeHtml(pickup.id)}">${escapeHtml(pickup.name)}${Number(pickup.is_active) === 1 ? "" : "（已停用）"}</option>`).join("")}
              </select></label>
              <label class="field"><span>自提时间</span><input class="input" name="pickup_time" maxlength="160" value="${escapeHtml(getDefaultPickupTime(state.pickups[0]))}" placeholder="例如：周六 12:30 - 13:00"></label>
              <label class="field"><span>订单状态</span><select class="select" name="status">
                ${["completed", "pending", "paid", "making", "ready", "activity"].map((value) => `<option value="${value}">${escapeHtml(statusLabel(value))}</option>`).join("")}
              </select></label>
              <label class="field"><span>付款状态</span><select class="select" name="payment_status">${renderPaymentStatusOptions("paid")}</select></label>
              <label class="field"><span>付款方式</span><select class="select" name="payment_method">${renderPaymentMethodOptions("cash")}</select></label>
            </div>
          </section>
          <section class="manual-order-section">
            <div class="manual-order-section-head"><h3>商品与金额</h3><button class="button-secondary" type="button" data-manual-item-add>＋ 添加商品</button></div>
            <div class="manual-order-items" data-manual-order-items></div>
            <div class="manual-order-empty-hint" data-manual-order-empty>尚未添加商品，请点击“＋ 添加商品”。</div>
            <div class="manual-order-grand-total"><span>订单总额</span><strong data-manual-order-total>${formatMoney(0)}</strong></div>
          </section>
          <section class="manual-order-section">
            <div class="manual-order-fields">
              <label class="field"><span>客户备注</span><textarea class="textarea" name="notes" maxlength="1000" placeholder="口味、包装等"></textarea></label>
              <label class="field"><span>管理员备注</span><textarea class="textarea" name="admin_comment" maxlength="1000" placeholder="默认标记为后台手动补录"></textarea></label>
            </div>
          </section>
          <footer class="manual-order-actions">
            <button class="button-secondary" type="button" data-manual-order-close>暂不添加</button>
            <button class="button" type="submit" data-manual-order-submit>确认添加订单</button>
          </footer>
        </form>
      </section>`;
    document.body.appendChild(overlay);

    const form = overlay.querySelector("#manualOrderForm");
    const search = overlay.querySelector("[data-manual-user-search]");
    const results = overlay.querySelector("[data-manual-user-results]");
    const renderUserMatches = () => {
      const query = String(search.value || "").trim().toLowerCase();
      const users = state.members.filter((user) => !user.is_linked_secondary && query && [
        user.nickname, user.name, user.uuid, user.userUuid, user.wechat_id, user.email
      ].some((value) => String(value || "").toLowerCase().includes(query))).slice(0, 12);
      results.hidden = !query;
      results.innerHTML = users.length ? users.map((user) => `
        <button type="button" data-manual-user-pick="${escapeHtml(user.id)}" data-manual-user-name="${escapeHtml(user.nickname || user.name || "微信用户")}">
          <strong>${escapeHtml(user.nickname || user.name || "微信用户")}</strong><span>${escapeHtml(user.uuid || user.userUuid || `M${String(user.id).padStart(6, "0")}`)}${user.wechat_id ? ` · 微信 ${escapeHtml(user.wechat_id)}` : ""}</span>
        </button>`).join("") : `<p>没有找到匹配客户；留空即可建立普通客户账号。</p>`;
    };
    search.addEventListener("input", renderUserMatches);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target.closest("[data-manual-order-close]")) {
        closeManualOrderDialog();
        return;
      }
      const pick = event.target.closest("[data-manual-user-pick]");
      if (pick) {
        form.querySelector("[data-manual-user-id]").value = pick.dataset.manualUserPick;
        search.value = pick.dataset.manualUserName;
        if (!form.elements.customer_name.value) form.elements.customer_name.value = pick.dataset.manualUserName;
        results.hidden = true;
        overlay.querySelector("[data-manual-user-hint]").textContent = `已关联：${pick.dataset.manualUserName}`;
        return;
      }
      if (event.target.closest("[data-manual-item-add]")) {
        const items = overlay.querySelector("[data-manual-order-items]");
        items.insertAdjacentHTML("beforeend", manualOrderItemRow(items.children.length));
        const emptyHint = overlay.querySelector("[data-manual-order-empty]");
        if (emptyHint) emptyHint.hidden = true;
        updateManualOrderTotals(overlay);
        return;
      }
      const remove = event.target.closest("[data-manual-item-remove]");
      if (remove) {
        remove.closest("[data-manual-order-item]").remove();
        const emptyHint = overlay.querySelector("[data-manual-order-empty]");
        if (emptyHint) emptyHint.hidden = Boolean(overlay.querySelector("[data-manual-order-item]"));
        updateManualOrderTotals(overlay);
      }
    });
    overlay.addEventListener("change", (event) => {
      if (event.target.matches("[data-manual-product]")) {
        const option = event.target.selectedOptions[0];
        event.target.closest("[data-manual-order-item]").querySelector("[data-manual-price]").value = Number(option.dataset.price || 0).toFixed(2);
      }
      if (event.target.name === "pickup_location_id") {
        const pickup = state.pickups.find((item) => Number(item.id) === Number(event.target.value));
        form.elements.pickup_time.value = getDefaultPickupTime(pickup || {});
      }
      if (event.target.name === "pickup_date") {
        const pickup = state.pickups.find((item) => Number(item.id) === Number(form.elements.pickup_location_id.value));
        form.elements.pickup_time.value = event.target.value
          ? `${event.target.value} ${getPickupWindow(pickup || {})}`
          : getPickupWindow(pickup || {});
      }
      if (event.target.name === "payment_status" && event.target.value !== "paid") form.elements.payment_method.value = "";
      updateManualOrderTotals(overlay);
    });
    overlay.addEventListener("input", (event) => {
      if (event.target.matches("[data-manual-quantity], [data-manual-price]")) updateManualOrderTotals(overlay);
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("[data-manual-order-submit]");
      const data = new FormData(form);
      const items = Array.from(form.querySelectorAll("[data-manual-order-item]")).map((row) => {
        const option = row.querySelector("[data-manual-product]").selectedOptions[0];
        return {
          source_type: option.dataset.sourceType,
          collection_item_id: option.dataset.collectionItemId || null,
          cake_id: option.dataset.cakeId || null,
          flavor: option.dataset.flavor || "",
          quantity: Number(row.querySelector("[data-manual-quantity]").value),
          unit_price: Number(row.querySelector("[data-manual-price]").value)
        };
      });
      if (!items.length) {
        alert("请至少添加一项甜品或蛋糕商品。");
        return;
      }
      if (!confirm("确认添加这张历史订单？本周商品库存不会改变。")) return;
      submit.disabled = true;
      submit.textContent = "正在添加…";
      try {
        const result = await api("/api/admin/orders/manual", { method: "POST", body: {
          user_id: data.get("user_id") || null,
          customer_name: data.get("customer_name"), customer_phone: data.get("customer_phone"),
          group_id: data.get("group_id"), group_order_number: data.get("group_order_number") || null, created_at: data.get("created_at"),
          group_title: data.get("group_title"), group_date: data.get("group_date"), pickup_date: data.get("pickup_date"),
          pickup_location_id: data.get("pickup_location_id"), pickup_time: data.get("pickup_time"),
          status: data.get("status"), payment_status: data.get("payment_status"), payment_method: data.get("payment_method"),
          notes: data.get("notes"), admin_comment: data.get("admin_comment"), items
        }});
        closeManualOrderDialog();
        await loadDashboard();
        state.activeView = "history_orders";
        state.selectedOrderId = result.order && result.order.id;
        if (result.order && getOrderGroupId(result.order)) state.expandedHistoryGroups[getOrderGroupId(result.order)] = true;
        setFlash("success", "历史订单已添加，本周库存未改变。");
      } catch (error) {
        submit.disabled = false;
        submit.textContent = "确认添加订单";
        alert(error.message || "添加失败");
      }
    });
    form.elements.customer_name.focus();
  }

  function renderSidebarContent() {
    if (state.activeView === "cake_orders") {
      return `
        <section class="admin-sidebar-card">
          <p class="eyebrow">Cake Inquiries</p>
          <p class="field-hint">蛋糕询单与每周团购订单独立显示。</p>
          <div class="filter-grid cake-filter-grid">
            <input class="input" id="cakeSearchInput" placeholder="搜索昵称 / 询单号 / 蛋糕名" value="${escapeHtml(state.filters.cake_q)}">
            <select class="select" id="cakeStatusFilter" aria-label="筛选蛋糕询单状态">
              <option value="" ${state.filters.cake_status === "" ? "selected" : ""}>全部询单状态</option>
              ${["pending", "confirmed", "making", "ready", "completed", "cancelled"].map((value) => `
                <option value="${escapeHtml(value)}" ${state.filters.cake_status === value ? "selected" : ""}>${escapeHtml(cakeStatusLabel(value))}</option>
              `).join("")}
            </select>
            <label class="cake-date-filter">
              <span>自提日期</span>
              <input class="input" id="cakePickupDateFilter" type="date" value="${escapeHtml(state.filters.cake_pickup_date)}">
            </label>
            <select class="select" id="cakeSortSelect" aria-label="蛋糕询单排序">
              <option value="newest" ${state.filters.cake_sort === "newest" ? "selected" : ""}>排序：最新提交</option>
              <option value="pickup" ${state.filters.cake_sort === "pickup" ? "selected" : ""}>排序：自提日期（近→远）</option>
              <option value="amount" ${state.filters.cake_sort === "amount" ? "selected" : ""}>排序：金额（高→低）</option>
            </select>
          </div>
          <div class="order-list">${renderCakeOrderList()}</div>
        </section>
      `;
    }
    if (state.activeView === "users") {
      return `
        <section class="admin-sidebar-card">
          <p class="eyebrow">Users</p>
          <div class="filter-grid">
            <input class="input" id="userSearchInput" placeholder="搜索用户名 / UUID" value="${escapeHtml(state.filters.user_q)}">
            <select class="select" id="userTagFilter">
              <option value="" ${state.filters.user_tag === "" ? "selected" : ""}>全部身份</option>
              <option value="user" ${state.filters.user_tag === "user" ? "selected" : ""}>普通客户</option>
              <option value="tester" ${state.filters.user_tag === "tester" ? "selected" : ""}>测试人员</option>
            </select>
            <select class="select" id="userSortSelect">
              <option value="recent" ${state.userSort === "recent" ? "selected" : ""}>排序：最近购买</option>
              <option value="count" ${state.userSort === "count" ? "selected" : ""}>排序：购买次数（多→少）</option>
              <option value="spend" ${state.userSort === "spend" ? "selected" : ""}>排序：购买金额（高→低）</option>
            </select>
          </div>
          <div class="order-list order-list--grid">${renderUserList()}</div>
        </section>
      `;
    }

    if (state.activeView === "products") {
      return `
        <section class="admin-sidebar-card">
          <p class="eyebrow">Products</p>
          <div class="filter-grid">
            <input class="input" id="productSearchInput" placeholder="搜索产品名 / Product ID" value="${escapeHtml(state.filters.product_q)}">
            <button class="button-secondary" type="button" id="productFilterButton">搜索产品</button>
          </div>
          <div class="order-list">${renderProductList()}</div>
        </section>
      `;
    }

    return `
      <section class="admin-sidebar-card">
        <p class="eyebrow">${state.activeView === "history_orders" ? "Order History" : "Current Week Orders"}</p>
        ${state.activeView === "history_orders" ? `<button class="button manual-order-open" type="button" data-manual-order-open>＋ 手动添加订单</button>` : ""}
        <div class="filter-grid">
          <input class="input" id="searchInput" placeholder="搜索昵称 / 订单号" value="${escapeHtml(state.filters.q)}">
          <select class="select" id="orderFilter" aria-label="筛选订单状态或付款状态">
            ${renderCombinedOrderFilterOptions()}
          </select>
          <select class="select" id="pickupLocationFilter" aria-label="筛选取货地点">
            ${renderPickupFilterOptions()}
          </select>
          ${state.activeView === "current_orders" ? `
          <label class="toggle-slider ${state.orderGroupBy === "user" ? "is-on" : ""}" for="groupByUser">
            <span class="toggle-slider-text">按用户分组</span>
            <input type="checkbox" id="groupByUser" ${state.orderGroupBy === "user" ? "checked" : ""}>
            <span class="toggle-slider-track"><span class="toggle-slider-thumb"></span></span>
          </label>` : ""}
        </div>
        ${renderBatchBar()}
        <div class="order-list ${state.activeView === "current_orders" && state.orderGroupBy !== "user" ? "order-list--grid" : ""}">
          ${state.activeView === "history_orders"
            ? renderHistoryOrderGroups()
            : (state.orderGroupBy === "user"
                ? renderOrdersGroupedByUser(getVisibleOrders())
                : renderOrderList(getVisibleOrders(), "本周还没有订单。", true))
          }
        </div>
      </section>
    `;
  }

  // —— 批量标记 ——（仅本周订单视图）：勾选多单一次性改状态，复用单单的 status PATCH 接口
  function batchSelectedIds() {
    return Object.keys(state.batchSelected).filter((id) => state.batchSelected[id]);
  }

  function renderBatchBar() {
    if (state.activeView !== "current_orders") return "";
    if (!state.batchMode) {
      return `<div class="batch-bar"><button class="button-secondary" type="button" data-batch-toggle>批量标记</button></div>`;
    }
    const count = batchSelectedIds().length;
    return `
      <div class="batch-bar batch-bar--active">
        <div class="batch-bar-row">
          <button class="button-secondary" type="button" data-batch-toggle>退出批量</button>
          <button class="button-secondary" type="button" data-batch-all>全选</button>
          <button class="button-secondary" type="button" data-batch-clear>清空</button>
          <span class="batch-count">已选 ${count} 单</span>
        </div>
        <div class="batch-bar-row">
          <select class="select" data-batch-status>${renderStatusOptions(state.batchStatus)}</select>
          <button class="button" type="button" data-batch-apply ${count ? "" : "disabled"}>标记为「${escapeHtml(statusLabel(state.batchStatus))}」</button>
        </div>
      </div>`;
  }

  async function applyBatchStatus() {
    const ids = batchSelectedIds();
    if (!ids.length) return;
    const status = state.batchStatus;
    if (!window.confirm(`确定把选中的 ${ids.length} 单标记为「${statusLabel(status)}」吗？`)) return;
    let ok = 0;
    let fail = 0;
    for (const id of ids) {
      try {
        await api(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status } });
        ok += 1;
      } catch (error) {
        fail += 1;
      }
    }
    state.batchSelected = {};
    setFlash(fail ? "error" : "success", `已标记 ${ok} 单${fail ? `，${fail} 单失败` : ""}。`);
    await loadDashboard();
    render();
  }

  function renderOrdersGroupedByUser(orders) {
    if (!orders.length) return `<div class="empty">本周还没有订单。</div>`;
    const groups = new Map();
    orders.forEach((order) => {
      const key = String(order.user_id || order.userId || order.userNickname || "unknown");
      if (!groups.has(key)) {
        groups.set(key, { name: order.userNickname || order.nickname || "微信用户", orders: [] });
      }
      groups.get(key).orders.push(order);
    });
    return Array.from(groups.values())
      .sort((a, b) => b.orders.length - a.orders.length)
      .map((group) => `
        <div class="user-order-group">
          <div class="user-order-group-head">${escapeHtml(group.name)} · ${group.orders.length} 单</div>
          ${renderOrderList(group.orders, "", true)}
        </div>
      `).join("");
  }

  function renderProductionSummary() {
    const orders = getCurrentOrders();
    const active = orders.filter((order) => String(order.status || "") !== "cancelled");
    const productMap = new Map();
    active.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.title || item.name || `#${item.product_id}`;
        productMap.set(key, (productMap.get(key) || 0) + (Number(item.quantity) || 0));
      });
    });
    const rows = Array.from(productMap.entries()).sort((a, b) => b[1] - a[1]);
    const totalPieces = rows.reduce((sum, [, qty]) => sum + qty, 0);
    // 金额只算已完成订单（要做的甜品数量仍按未取消订单，用于备货）。
    const totalRevenue = orders.reduce((sum, order) => sum + (isCompletedOrder(order) ? (Number(order.total_amount) || 0) : 0), 0);

    const statusCounts = {};
    orders.forEach((order) => {
      const key = String(order.status || "pending");
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });
    const statusChips = Object.keys(statusCounts).map((key) => `
      <span class="prod-status-chip status-tag status-${escapeHtml(key)}">${escapeHtml(statusLabel(key))} ${escapeHtml(statusCounts[key])}</span>
    `).join("");

    return `
      <section class="admin-detail-card">
        <div class="detail-head">
          <div>
            <p class="eyebrow">Production Summary</p>
            <h2 class="section-heading">本周要做什么</h2>
          </div>
          <span class="pill">${escapeHtml(orders.length)} 单 · ${escapeHtml(formatMoney(totalRevenue))}</span>
        </div>
        ${statusChips ? `<div class="prod-status-row">${statusChips}</div>` : ""}
        <div class="section-block">
          <p class="section-title">按甜品汇总（共 ${escapeHtml(totalPieces)} 件）</p>
          ${rows.length ? `
            <div class="prod-summary-list">
              ${rows.map(([name, qty]) => `
                <div class="prod-summary-row">
                  <span class="prod-summary-name">${escapeHtml(name)}</span>
                  <span class="prod-summary-qty">×${escapeHtml(qty)}</span>
                </div>
              `).join("")}
            </div>
          ` : `<div class="empty">本周还没有订单。</div>`}
        </div>
      </section>
    `;
  }

  function renderHistoryRevenueChart() {
    const groups = getHistoryOrderGroups();
    const data = groups
      .map((group) => ({ label: getHistoryGroupLabel(group.groupId), value: getGroupCompletedRevenue(group.groupId) }))
      .filter((row) => row.value > 0);
    if (!data.length) {
      return `
        <section class="admin-detail-card">
          <div class="detail-head"><div><p class="eyebrow">Revenue by Group</p><h2 class="section-heading">各团购已完成营收</h2></div></div>
          <div class="empty">还没有已完成的订单营收。</div>
        </section>
      `;
    }
    const max = Math.max.apply(null, data.map((row) => row.value));
    return `
      <section class="admin-detail-card">
        <div class="detail-head"><div><p class="eyebrow">Revenue by Group</p><h2 class="section-heading">各团购已完成营收</h2></div></div>
        <div class="bar-chart">
          ${data.map((row) => `
            <div class="bar-row">
              <span class="bar-label">${escapeHtml(row.label)}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, Math.round((row.value / max) * 100))}%"></div></div>
              <span class="bar-value">${escapeHtml(formatMoney(row.value))}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  // 每个团购的营收/单量序列（按团购编号 YYYYMMDD 时间排序），排除已取消。
  function getGroupSalesSeries() {
    const map = new Map();
    (state.orders || []).forEach((order) => {
      if (["cancelled", "activity"].includes(String(order.status || ""))) return;
      const gid = getOrderGroupId(order);
      if (!/^\d{8}$/.test(gid)) return;
      if (!map.has(gid)) map.set(gid, { gid, revenue: 0, orders: 0 });
      const g = map.get(gid);
      g.revenue += Number(order.total_amount) || 0;
      g.orders += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.gid.localeCompare(b.gid));
  }

  function shortGroupDate(gid) {
    const m = String(gid || "").match(/^(\d{4})(\d{2})(\d{2})$/);
    return m ? `${Number(m[2])}/${Number(m[3])}` : String(gid || "");
  }

  function analyticsDateValue(value) {
    const raw = String(value || "").trim();
    const dateOnly = raw.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (dateOnly) return dateOnly[1];
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function normalizeAnalyticsProductName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/makkie\s*曲奇/g, "胖曲奇")
      .replace(/[\s·•・_\-—–（）()]/g, "")
      .replace(/生日蛋糕/g, "");
  }

  // 同一款蛋糕在旧 Excel 与手动订单中使用过不同名称；排行榜统一为图鉴名称。
  // 只合并明确的别名，不把“稻香米麻薯四重奏戚风三明治”等其他四重奏商品误归入。
  function getAnalyticsCanonicalProductName(value) {
    const raw = String(value || "").trim();
    const compact = raw.toLowerCase().replace(/[\s·•・_\-—–（）()]/g, "");
    if (["四重奏生日蛋糕", "稻香米奶油四重奏", "ricecreamquartet"].includes(compact)) {
      return "稻香米奶油四重奏";
    }
    return raw;
  }

  function getAnalyticsCategories() {
    const categories = getCollectionLibrary().map((group) => String(group.group || "").trim()).filter(Boolean);
    if (!categories.includes("生日蛋糕")) {
      const basqueIndex = categories.indexOf("巴斯克蛋糕");
      categories.splice(basqueIndex >= 0 ? basqueIndex + 1 : categories.length, 0, "生日蛋糕");
    }
    return categories;
  }

  function isAnalyticsBirthdayCake(name) {
    const compactName = String(name || "")
      .toLowerCase()
      .replace(/[\s·•・_\-—–（）()]/g, "");
    return compactName.includes("生日蛋糕")
      || compactName === "稻香米奶油四重奏"
      || compactName === "巴斯克蛋糕"
      || compactName === "ricecreamquartet"
      || compactName === "basquecake";
  }

  function getAnalyticsCategoryByName(name) {
    if (isAnalyticsBirthdayCake(name)) return "生日蛋糕";
    const normalizedName = normalizeAnalyticsProductName(name);
    const groups = getCollectionLibrary();
    let partialMatch = "";
    let partialLength = 0;

    groups.forEach((group) => {
      (group.items || []).forEach((item) => {
        [item.zh, item.en].forEach((candidate) => {
          const normalizedCandidate = normalizeAnalyticsProductName(candidate);
          if (!normalizedName || !normalizedCandidate) return;
          if (normalizedName === normalizedCandidate) {
            partialMatch = group.group;
            partialLength = Number.MAX_SAFE_INTEGER;
            return;
          }
          if (partialLength !== Number.MAX_SAFE_INTEGER &&
              (normalizedName.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedName)) &&
              Math.min(normalizedName.length, normalizedCandidate.length) > partialLength) {
            partialMatch = group.group;
            partialLength = Math.min(normalizedName.length, normalizedCandidate.length);
          }
        });
      });
    });
    if (partialMatch) return partialMatch;

    const categoryKeywords = [
      ["巴斯克", "巴斯克蛋糕"],
      ["米布丁", "米布丁"],
      ["胖曲奇", "Makkie 胖曲奇"],
      ["戚风", "戚风夹心"],
      ["挞", "酥皮与挞挞"],
      ["拿破仑", "酥皮与挞挞"],
      ["布丁奶糕", "布丁奶糕"],
      ["四重奏", "戚风夹心"]
    ];
    const keywordMatch = categoryKeywords.find(([keyword]) => normalizedName.includes(normalizeAnalyticsProductName(keyword)));
    if (keywordMatch && groups.some((group) => group.group === keywordMatch[1])) return keywordMatch[1];
    return groups.some((group) => group.group === "创意甜品") ? "创意甜品" : (groups[0] ? groups[0].group : "其他");
  }

  function getAnalyticsCategory(item) {
    if (item && item.analytics_category) return item.analytics_category;
    if (item && item.item_source === "cake") return "生日蛋糕";
    const product = (state.products || []).find((entry) => Number(entry.id) === Number(item.product_id));
    const productName = (item && (item.title || item.name || item.product_name)) || (product && product.name) || "";
    return getAnalyticsCategoryByName(productName) || String((product && product.category) || "其他").trim() || "其他";
  }

  function getAnalyticsBounds() {
    const range = state.filters.analytics_range || "all";
    if (range === "custom") {
      return {
        start: state.filters.analytics_start || "",
        end: state.filters.analytics_end || ""
      };
    }
    if (range === "all") return { start: "", end: "" };
    const days = Number(range) || 0;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - Math.max(0, days - 1));
    return { start: analyticsDateValue(start), end: analyticsDateValue(end) };
  }

  function getAnalyticsGroupDate(order) {
    const groupId = getOrderGroupId(order);
    const manualGroup = getManualOrderGroup(groupId);
    // 手动订单的商品成交日期只认团购元数据，不使用订单录入时间。
    if (manualGroup && manualGroup.order_date) return analyticsDateValue(manualGroup.order_date);
    const cakeDate = String(groupId || "").match(/^cake-(\d{4})(\d{2})(\d{2})$/);
    if (cakeDate) return `${cakeDate[1]}-${cakeDate[2]}-${cakeDate[3]}`;
    const compactDate = String(groupId || "").match(/^(\d{4})(\d{2})(\d{2})$/);
    if (compactDate) return `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`;
    const dateGroup = String(groupId || "").match(/^(\d{4}-\d{2}-\d{2})$/);
    if (dateGroup) return dateGroup[1];
    const weeklyOrder = getWeeklyOrderForGroup(groupId);
    return analyticsDateValue(
      (weeklyOrder && (weeklyOrder.start_at || weeklyOrder.created_at)) || order.created_at
    );
  }

  function getAnalyticsRows() {
    const bounds = getAnalyticsBounds();
    const selectedCategories = new Set(Array.isArray(state.filters.analytics_categories) ? state.filters.analytics_categories : []);
    const inDateRange = (date) => !((bounds.start && date < bounds.start) || (bounds.end && date > bounds.end));
    // 营收来源显式合并普通/手动订单和已完成蛋糕询单。蛋糕询单只在 completed 后计入，
    // 避免“已确认/制作中”的询单提前成为营收。
    const revenueOrders = (state.orders || []).concat(getCompletedCakeHistoryOrders(false));
    const webRows = revenueOrders
      .filter((order) => !["cancelled", "activity"].includes(String(order.status || "")))
      .filter((order) => String(order.payment_status || "") === "paid")
      .map((order) => {
        const date = getAnalyticsGroupDate(order);
        if (!inDateRange(date)) return null;
        const allItems = order.items || [];
        const items = selectedCategories.size
          ? allItems.filter((item) => selectedCategories.has(getAnalyticsCategory(item)))
          : allItems;
        if (!items.length && selectedCategories.size) return null;
        const itemRevenue = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
        return {
          order,
          date,
          items,
          revenue: selectedCategories.size ? itemRevenue : (Number(order.total_amount) || itemRevenue),
          group_label: getHistoryGroupLabel(getOrderGroupId(order)),
          source: order.history_entry_type === "cake"
            ? "cake"
            : (getManualOrderGroup(getOrderGroupId(order)) ? "manual" : "web")
        };
      })
      .filter(Boolean);

    const historicalRows = (state.historicalSales || []).map((sale) => {
      const date = analyticsDateValue(sale.sale_date);
      const category = getAnalyticsCategoryByName(sale.product_name);
      if (!inDateRange(date) || (selectedCategories.size && !selectedCategories.has(category))) return null;
      const revenue = Number(sale.total_amount) || 0;
      return {
        order: { payment_method: "historical", payment_status: "paid", source: "historical" },
        date,
        items: [{
          product_id: null,
          title: sale.product_name || "历史销售",
          name: sale.product_name || "历史销售",
          quantity: Number(sale.quantity) || 0,
          subtotal: revenue,
          analytics_category: category
        }],
        revenue,
        group_label: "历史销售",
        source: "historical"
      };
    }).filter(Boolean);

    return webRows.concat(historicalRows);
  }

  function getAnalyticsGroupSalesSeries(rows) {
    const groups = new Map();
    rows.forEach((row) => {
      if (!row.date) return;
      if (!groups.has(row.date)) groups.set(row.date, { date: row.date, revenue: 0, orders: 0, labels: new Set() });
      const point = groups.get(row.date);
      point.revenue += row.revenue;
      point.orders += 1;
      if (row.group_label) point.labels.add(row.group_label);
    });
    return Array.from(groups.values())
      .map((point) => ({ ...point, label: Array.from(point.labels).join(" / ") }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function shortAnalyticsDate(value) {
    const parts = String(value || "").split("-");
    return parts.length === 3 ? `${Number(parts[1])}/${Number(parts[2])}` : value;
  }

  function formatAnalyticsTrend(value, suffix) {
    if (!Number.isFinite(value)) return `<span class="analytics-trend is-neutral">暂无可比数据</span>`;
    const tone = value > 0 ? "is-up" : value < 0 ? "is-down" : "is-neutral";
    const prefix = value > 0 ? "+" : "";
    return `<span class="analytics-trend ${tone}">${prefix}${escapeHtml(value.toFixed(1))}% <small>${escapeHtml(suffix || "")}</small></span>`;
  }

  function setDonutCenterFromSegment(segment) {
    const panel = segment && segment.closest(".analytics-category-panel");
    const center = panel && panel.querySelector("[data-donut-center]");
    if (!center) return;
    const value = center.querySelector("[data-donut-center-value]");
    const label = center.querySelector("[data-donut-center-label]");
    const meta = center.querySelector("[data-donut-center-meta]");
    if (value) value.textContent = segment.dataset.donutValue || "$0.00";
    if (label) label.textContent = segment.dataset.donutName || "分类销售";
    if (meta) meta.textContent = `${segment.dataset.donutQuantity || 0} 件 · ${segment.dataset.donutPercent || 0}%`;
  }

  function resetDonutCenter(segment) {
    const panel = segment && segment.closest(".analytics-category-panel");
    const center = panel && panel.querySelector("[data-donut-center]");
    if (!center) return;
    const value = center.querySelector("[data-donut-center-value]");
    const label = center.querySelector("[data-donut-center-label]");
    const meta = center.querySelector("[data-donut-center-meta]");
    if (value) value.textContent = center.dataset.totalValue || "$0.00";
    if (label) label.textContent = "总销售额";
    if (meta) meta.textContent = "悬停查看明细";
  }

  function showAnalyticsChartTooltip(point, clientX, clientY) {
    const wrap = point && point.closest(".sales-chart-wrap");
    const tooltip = wrap && wrap.querySelector("[data-chart-tooltip]");
    if (!tooltip) return;
    tooltip.textContent = `${point.dataset.chartDate || ""} · ${point.dataset.chartValue || "$0.00"}`;
    const pointRect = point.getBoundingClientRect();
    const x = Number.isFinite(clientX) ? clientX : pointRect.left + pointRect.width / 2;
    const y = Number.isFinite(clientY) ? clientY : pointRect.top;
    tooltip.hidden = false;
    const maxLeft = Math.max(8, window.innerWidth - tooltip.offsetWidth - 8);
    tooltip.style.left = `${Math.min(maxLeft, Math.max(8, x + 12))}px`;
    tooltip.style.top = `${Math.max(8, y - 42)}px`;
  }

  function hideAnalyticsChartTooltip(point) {
    const wrap = point && point.closest(".sales-chart-wrap");
    const tooltip = wrap && wrap.querySelector("[data-chart-tooltip]");
    if (tooltip) tooltip.hidden = true;
  }

  // 数据驱动的 SVG 折线图：按团购日期汇总，随筛选器实时变化。
  function renderSalesLineChart(series) {
    if (!series.length) return `<div class="empty">当前筛选条件下还没有营收数据。</div>`;
    const W = 900, H = 340, padL = 58, padR = 24, padT = 28, padB = 48;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const n = series.length;
    const max = Math.max.apply(null, series.map((s) => s.revenue)) || 1;
    const niceMax = Math.ceil(max / 50) * 50 || 50;
    const xAt = (i) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yAt = (v) => padT + innerH - (v / niceMax) * innerH;
    const line = series.map((s, i) => `${xAt(i).toFixed(1)},${yAt(s.revenue).toFixed(1)}`).join(" ");
    const areaPts = `${padL},${padT + innerH} ${line} ${xAt(n - 1)},${padT + innerH}`;
    const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));
    const grid = gridVals.map((v) => {
      const y = yAt(v);
      return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" class="chart-grid"></line>
        <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" class="chart-ytick" text-anchor="end">$${v}</text>`;
    }).join("");
    const average = series.reduce((sum, point) => sum + point.revenue, 0) / n;
    const averageY = yAt(average);
    const averageLine = `<line x1="${padL}" y1="${averageY.toFixed(1)}" x2="${W - padR}" y2="${averageY.toFixed(1)}" class="chart-average"><title>平均 ${escapeHtml(formatMoney(average))}</title></line>`;
    const dots = series.map((s, i) => {
      const displayLabel = s.label ? `${s.label} · ${s.date}` : s.date;
      return `
      <g class="analytics-chart-point" tabindex="0" role="img" aria-label="${escapeHtml(displayLabel)}，销售额 ${escapeHtml(formatMoney(s.revenue))}" data-chart-date="${escapeHtml(displayLabel)}" data-chart-value="${escapeHtml(formatMoney(s.revenue))}">
        <circle cx="${xAt(i).toFixed(1)}" cy="${yAt(s.revenue).toFixed(1)}" r="13" class="chart-hit-dot"></circle>
        <circle cx="${xAt(i).toFixed(1)}" cy="${yAt(s.revenue).toFixed(1)}" r="4" class="chart-dot"></circle>
      </g>
    `;
    }).join("");
    // x 轴最多展示 ~10 个标签，避免拥挤
    const step = Math.max(1, Math.ceil(n / 10));
    const xlabels = series.map((s, i) => (i % step === 0 || i === n - 1)
      ? `<text x="${xAt(i).toFixed(1)}" y="${H - 16}" class="chart-xtick" text-anchor="middle">${escapeHtml(shortAnalyticsDate(s.date))}</text>`
      : "").join("");
    return `
      <div class="sales-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" class="sales-chart" preserveAspectRatio="xMidYMid meet" role="img" aria-label="按日期显示的销售额趋势图">
          ${grid}
          ${averageLine}
          <polygon points="${areaPts}" class="chart-area"></polygon>
          <polyline points="${line}" class="chart-line" fill="none"></polyline>
          ${dots}
          ${xlabels}
        </svg>
        <div class="analytics-chart-tooltip" data-chart-tooltip hidden></div>
      </div>
    `;
  }

  function renderCategoryDonut(categoryRows, totalRevenue) {
    if (!categoryRows.length || totalRevenue <= 0) return `<div class="empty compact">还没有分类销售数据。</div>`;
    const colors = ["#e85d7f", "#f49a45", "#efc65a", "#8fb683", "#c9a07a", "#8ba9cf", "#b58bc8"];
    let offset = 0;
    const circles = categoryRows.map((row, index) => {
      const percent = Math.max(0, (row.revenue / totalRevenue) * 100);
      const circle = `<circle class="analytics-donut-segment" tabindex="0" cx="70" cy="70" r="48" pathLength="100" fill="none" stroke="${colors[index % colors.length]}" stroke-width="22" stroke-dasharray="${percent.toFixed(3)} ${(100 - percent).toFixed(3)}" stroke-dashoffset="${(-offset).toFixed(3)}" data-donut-name="${escapeHtml(row.name)}" data-donut-value="${escapeHtml(formatMoney(row.revenue))}" data-donut-quantity="${escapeHtml(row.quantity)}" data-donut-percent="${escapeHtml(percent.toFixed(1))}"><title>${escapeHtml(row.name)} · ${escapeHtml(formatMoney(row.revenue))} · ${escapeHtml(row.quantity)} 件 · ${escapeHtml(percent.toFixed(1))}%</title></circle>`;
      offset += percent;
      return circle;
    }).join("");
    return `
      <div class="analytics-donut-wrap">
        <svg class="analytics-donut" viewBox="0 0 140 140" role="img" aria-label="销售额分类占比">
          <circle cx="70" cy="70" r="48" fill="none" stroke="#f1e7d7" stroke-width="22"></circle>
          ${circles}
        </svg>
        <div class="analytics-donut-center" data-donut-center data-total-value="${escapeHtml(formatMoney(totalRevenue))}"><strong data-donut-center-value>${escapeHtml(formatMoney(totalRevenue))}</strong><span data-donut-center-label>总销售额</span><small data-donut-center-meta>悬停查看明细</small></div>
      </div>
      <div class="analytics-legend">
        ${categoryRows.map((row, index) => `
          <div class="analytics-legend-row">
            <span class="analytics-legend-name"><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(row.name)}</span>
            <strong>${escapeHtml(formatMoney(row.revenue))} · ${escapeHtml(Math.round((row.revenue / totalRevenue) * 100))}%</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderAnalyticsView() {
    const rows = getAnalyticsRows();
    const series = getAnalyticsGroupSalesSeries(rows);
    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const totalOrders = rows.length;
    const latest = series[series.length - 1];
    const prev = series[series.length - 2];
    const avg = totalOrders ? totalRevenue / totalOrders : 0;
    const delta = latest && prev ? latest.revenue - prev.revenue : NaN;
    const deltaPercent = latest && prev && prev.revenue ? (delta / prev.revenue) * 100 : NaN;

    const categoryMap = new Map();
    rows.forEach((row) => {
      row.items.forEach((item) => {
        const category = getAnalyticsCategory(item);
        if (!categoryMap.has(category)) categoryMap.set(category, { revenue: 0, quantity: 0 });
        const value = categoryMap.get(category);
        value.revenue += Number(item.subtotal) || 0;
        value.quantity += Number(item.quantity) || 0;
      });
    });
    const categoryRows = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, revenue: value.revenue, quantity: value.quantity }))
      .sort((a, b) => b.revenue - a.revenue);
    const categoryTotal = categoryRows.reduce((sum, row) => sum + row.revenue, 0);

    const productMap = new Map();
    rows.forEach((row) => {
      row.items.forEach((item) => {
        const rawName = item.title || item.name || `#${item.product_id}`;
        const key = getAnalyticsCanonicalProductName(rawName);
        if (!productMap.has(key)) productMap.set(key, { name: key, quantity: 0, revenue: 0 });
        const p = productMap.get(key);
        p.quantity += Number(item.quantity) || 0;
        p.revenue += Number(item.subtotal) || 0;
      });
    });
    const productRows = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
    const prodMax = productRows.length ? Math.max.apply(null, productRows.map((p) => p.revenue)) : 1;

    const paymentLabels = { venmo: "Venmo", zelle: "Zelle", cash: "现金 Cash", alipay: "支付宝", historical: "LA Excel 历史销售", "": "未记录" };
    const paymentColors = { venmo: "#3f9bd2", zelle: "#8b58d4", cash: "#47a765", alipay: "#299be6", historical: "#c49b6c", "": "#b9a58e" };
    const paymentMap = new Map();
    rows.forEach((row) => {
      const key = String(row.order.payment_method || "").toLowerCase();
      if (!paymentMap.has(key)) paymentMap.set(key, { key, orders: 0, revenue: 0 });
      const value = paymentMap.get(key);
      value.orders += 1;
      value.revenue += row.revenue;
    });
    const paymentRows = Array.from(paymentMap.values()).sort((a, b) => b.revenue - a.revenue);
    const paymentMax = paymentRows.length ? Math.max.apply(null, paymentRows.map((payment) => payment.revenue)) : 1;
    const categories = getAnalyticsCategories();
    const selectedCategories = Array.isArray(state.filters.analytics_categories) ? state.filters.analytics_categories : [];
    const bounds = getAnalyticsBounds();

    return `
      <div class="analytics-dashboard">
        <div class="analytics-header">
          <div>
            <p class="eyebrow">Analytics</p>
            <h2 class="title analytics-title">营收分析</h2>
            <p class="sub">当前订单与历史销售合并统计；不含已取消订单。</p>
          </div>
        </div>

        <div class="analytics-filter-card">
          <div class="analytics-filter-grid">
            <label class="field"><span>时间段</span><select class="select" id="analyticsRange">
              <option value="all" ${state.filters.analytics_range === "all" ? "selected" : ""}>全部时间</option>
              <option value="30" ${state.filters.analytics_range === "30" ? "selected" : ""}>近 30 天</option>
              <option value="90" ${state.filters.analytics_range === "90" ? "selected" : ""}>近 90 天</option>
              <option value="365" ${state.filters.analytics_range === "365" ? "selected" : ""}>近 1 年</option>
              <option value="custom" ${state.filters.analytics_range === "custom" ? "selected" : ""}>自定义</option>
            </select></label>
            <label class="field"><span>开始日期</span><input class="input" id="analyticsStart" type="date" value="${escapeHtml(bounds.start)}"></label>
            <label class="field"><span>结束日期</span><input class="input" id="analyticsEnd" type="date" value="${escapeHtml(bounds.end)}"></label>
          </div>
          <div class="analytics-category-row">
            <span class="analytics-category-label">甜品主分类</span>
            <div class="analytics-pills">
              <button class="analytics-pill ${selectedCategories.length === 0 ? "is-active" : ""}" type="button" data-analytics-category="all" aria-pressed="${selectedCategories.length === 0}">全部 ${escapeHtml(categories.length)} 类</button>
              ${categories.map((category) => `<button class="analytics-pill ${selectedCategories.includes(category) ? "is-active" : ""}" type="button" data-analytics-category="${escapeHtml(category)}" aria-pressed="${selectedCategories.includes(category)}">${escapeHtml(category)}</button>`).join("")}
            </div>
            <small>可多选；分类来自图鉴，全部指标同步变化</small>
          </div>
        </div>

        <div class="analytics-kpi-grid">
          <div class="analytics-kpi analytics-kpi--rose"><span>时间段销售额</span><strong>${escapeHtml(formatMoney(totalRevenue))}</strong>${formatAnalyticsTrend(deltaPercent, "较前一团购")}</div>
          <div class="analytics-kpi analytics-kpi--gold"><span>最新团购销售额</span><strong>${escapeHtml(formatMoney(latest ? latest.revenue : 0))}</strong><small>${latest ? escapeHtml(latest.label ? `${latest.label} · ${latest.date}` : latest.date) : "暂无团购日期"}</small></div>
          <div class="analytics-kpi analytics-kpi--green"><span>较前一团购</span><strong>${Number.isFinite(delta) && delta >= 0 ? "+" : ""}${escapeHtml(formatMoney(Number.isFinite(delta) ? delta : 0))}</strong>${formatAnalyticsTrend(deltaPercent, "团购环比")}</div>
          <div class="analytics-kpi analytics-kpi--pink"><span>平均每单</span><strong>${escapeHtml(formatMoney(avg))}</strong><small>${escapeHtml(totalOrders)} 笔有效订单</small></div>
        </div>

        <div class="analytics-primary-grid">
          <div class="analytics-panel analytics-trend-panel">
            <div class="analytics-panel-head"><div><h3>销售额趋势</h3><p>按团购日期 · 单位 USD</p></div><div class="chart-key"><i></i>销售额 <span></span>均线</div></div>
            ${renderSalesLineChart(series)}
          </div>
          <div class="analytics-panel analytics-category-panel">
            <div class="analytics-panel-head"><div><h3>分类销售占比</h3><p>按甜品主分类</p></div></div>
            ${renderCategoryDonut(categoryRows, categoryTotal)}
          </div>
        </div>

        <div class="analytics-secondary-grid">
          <div class="analytics-panel analytics-ranking-panel">
            <div class="analytics-panel-head"><div><h3>甜品销量排行</h3><p>按销售额排序 · 向下滑动查看全部</p></div><small>共 ${escapeHtml(productRows.reduce((sum, product) => sum + product.quantity, 0))} 件</small></div>
          ${productRows.length ? `
            <div class="analytics-ranking-list" tabindex="0" aria-label="全部甜品销量排行，可上下滑动查看">
              ${productRows.map((product, index) => `
                <div class="analytics-ranking-row">
                  <span class="analytics-rank">${index + 1}</span>
                  <div><div class="analytics-ranking-meta"><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(formatMoney(product.revenue))} · ${escapeHtml(product.quantity)} 件</span></div><div class="analytics-progress"><i style="width:${Math.max(5, Math.round((product.revenue / prodMax) * 100))}%"></i></div></div>
                </div>
              `).join("")}
            </div>
          ` : `<div class="empty">还没有销售数据。</div>`}
          </div>
          <div class="analytics-panel">
            <div class="analytics-panel-head"><div><h3>付款方式排行</h3><p>按收款金额排序</p></div><small>${escapeHtml(totalOrders)} 笔订单</small></div>
            ${paymentRows.length ? `<div class="analytics-payment-list">${paymentRows.map((payment) => `
              <div class="analytics-payment-row">
                <span class="analytics-payment-badge" style="--payment-color:${paymentColors[payment.key] || paymentColors[""]}">${escapeHtml((paymentLabels[payment.key] || payment.key || "未记录").slice(0, 1).toUpperCase())}</span>
                <div><div class="analytics-ranking-meta"><strong>${escapeHtml(paymentLabels[payment.key] || payment.key || "未记录")}</strong><span>${escapeHtml(payment.orders)} 笔 · ${escapeHtml(Math.round((payment.revenue / Math.max(totalRevenue, 1)) * 100))}%</span></div><div class="analytics-progress is-payment"><i style="width:${Math.max(5, Math.round((payment.revenue / paymentMax) * 100))}%;background:${paymentColors[payment.key] || paymentColors[""]}"></i></div></div>
                <strong>${escapeHtml(formatMoney(payment.revenue))}</strong>
              </div>
            `).join("")}</div>` : `<div class="empty">还没有付款方式数据。</div>`}
          </div>
        </div>
      </div>
    `;
  }

  function renderMainContent() {
    if (state.activeView === "cake_orders") {
      return `<section class="admin-detail-card">${renderCakeOrderDetail()}</section>`;
    }
    if (state.activeView === "analytics") {
      return renderAnalyticsView();
    }
    if (state.activeView === "collection") {
      return renderCollectionManager();
    }
    if (state.activeView === "weekly_manage") {
      return `<div class="weekly-manage-page">${renderWeeklyOrderEditor()}</div>`;
    }
    if (state.activeView === "current_orders") {
      return renderProductionSummary();
    }
    if (state.activeView === "users") {
      return `<section class="admin-detail-card">${renderUserDetail()}</section>`;
    }
    if (state.activeView === "products") {
      return `<section class="admin-detail-card">${renderProductDetail()}</section>`;
    }
    if (state.activeView === "history_orders") {
      const historyDetail = state.historyDetailType === "cake" ? renderCakeOrderDetail() : renderOrderDetail();
      return `<div class="admin-main-stack">${renderHistoryRevenueChart()}<section class="admin-detail-card">${historyDetail}</section></div>`;
    }
    return `<section class="admin-detail-card">${renderOrderDetail()}</section>`;
  }

  function renderDashboard() {
    if (typeof magicRingsCleanup === "function") magicRingsCleanup();
    magicRingsCleanup = null;
    root.classList.remove("is-login-mode");
    const pageScrollPosition = getPageScrollPosition();
    const isFullWidth = state.activeView === "weekly_manage" || state.activeView === "collection" || state.activeView === "analytics";
    root.innerHTML = `
      <div class="admin-shell">
        <section class="admin-topbar">
          <div>
            <p class="eyebrow">Makkie Web Admin</p>
            <h1 class="title" style="font-size:38px;">网页后台</h1>
            <p class="sub">管理本周团购、历史订单、用户历史和产品历史。</p>
          </div>
          <div class="admin-topbar-actions">
            <label class="sound-switch ${state.soundEnabled ? "is-on" : ""}" title="新订单声音开关">
              <input type="checkbox" id="soundToggle" ${state.soundEnabled ? "checked" : ""}>
              <span class="sound-switch-track"><span class="sound-switch-thumb"></span></span>
              <span class="sound-switch-text">${state.soundEnabled ? "🔔 新订单声音" : "🔕 新订单声音"}</span>
            </label>
            <button class="button-secondary" type="button" id="refreshButton">刷新</button>
            <button class="button-secondary" type="button" id="logoutButton">退出登录</button>
          </div>
        </section>
        ${state.activeView === "analytics" ? "" : renderStats()}
        ${renderFlash()}
        ${renderViewTabs()}
        ${isFullWidth
          ? `<div class="admin-layout admin-layout--single">${renderMainContent()}</div>`
          : `<div class="admin-layout"${adminSidebarStyleAttr()}>
              ${renderSidebarContent()}
              <div class="admin-resize-handle" data-resize-handle role="separator" aria-orientation="vertical" title="拖动调整宽度"></div>
              ${renderMainContent()}
            </div>`
        }
      </div>
    `;
    restorePageScrollPosition(pageScrollPosition);
  }

  function adminSidebarStyleAttr() {
    const w = localStorage.getItem("makkie.admin.sidebarW");
    return w ? ` style="--admin-sidebar-w:${w}"` : "";
  }

  function ensureSelections() {
    const visibleOrders = getVisibleOrders();
    if (!visibleOrders.some((order) => Number(order.id) === Number(state.selectedOrderId))) {
      state.selectedOrderId = state.activeView === "current_orders" && visibleOrders[0]
        ? visibleOrders[0].id
        : null;
    }
    if (state.activeView === "history_orders") {
      const selectedCake = (state.cakeOrders || []).find((order) =>
        Number(order.id) === Number(state.selectedCakeOrderId) && String(order.status || "") === "completed");
      if (state.historyDetailType === "cake" && !selectedCake) state.historyDetailType = "order";
      const selectedOrder = visibleOrders.find((order) => Number(order.id) === Number(state.selectedOrderId));
      const selectedGroupId = getOrderGroupId(selectedOrder);
      const firstGroup = getHistoryOrderGroups()[0];
      const groupId = selectedGroupId || (firstGroup && firstGroup.groupId);
      if (groupId && Object.keys(state.expandedHistoryGroups).length === 0) {
        state.expandedHistoryGroups[groupId] = true;
      }
    }
    const visibleMembers = getFilteredMembers();
    if (!visibleMembers.some((member) => Number(member.id) === Number(state.selectedUserId))) {
      state.selectedUserId = visibleMembers[0] ? visibleMembers[0].id : null;
    }
    if (!state.products.some((product) => Number(product.id) === Number(state.selectedProductId))) {
      state.selectedProductId = state.products[0] ? state.products[0].id : null;
    }
    const visibleCakeOrders = getFilteredCakeOrders();
    if (!visibleCakeOrders.some((order) => Number(order.id) === Number(state.selectedCakeOrderId))) {
      state.selectedCakeOrderId = null;
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

  // 后台使用一次性重绘来更新各个视图。保留页面滚动位置，避免点击任意控件后
  // 因为 root.innerHTML 被替换而跳回页面顶部。
  function getPageScrollPosition() {
    const scrollingElement = document.scrollingElement || document.documentElement;
    return {
      left: window.scrollX || scrollingElement.scrollLeft || 0,
      top: window.scrollY || scrollingElement.scrollTop || 0
    };
  }

  function restorePageScrollPosition(position) {
    window.requestAnimationFrame(() => {
      window.scrollTo(position.left, position.top);
    });
  }

  async function loadDashboard() {
    try {
      const [statsData, ordersData, cakeOrdersData, pickupsData, weeklyOrderData, weeklyOrdersData, manualGroupsData, productsData, collectionData, usersData, historicalData] = await Promise.all([
        api("/api/admin/stats"),
        api("/api/admin/orders"),
        api("/api/admin/cake-orders").catch(() => ({ orders: [] })),
        api("/api/admin/pickup-locations"),
        api("/api/admin/weekly-order"),
        api("/api/admin/weekly-orders"),
        api("/api/admin/manual-order-groups").catch(() => ({ groups: [] })),
        api("/api/admin/products"),
        api("/api/admin/collection"),
        api("/api/admin/users"),
        api("/api/admin/analytics/historical-sales").catch(() => ({ historical_sales: [] }))
      ]);

      state.stats = statsData.stats || null;
      state.orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
      state.cakeOrders = Array.isArray(cakeOrdersData.orders) ? cakeOrdersData.orders : [];
      state.cakeCatalog = Array.isArray(cakeOrdersData.catalog) ? cakeOrdersData.catalog : [];
      state.pickups = Array.isArray(pickupsData.pickup_locations) ? pickupsData.pickup_locations : [];
      state.weeklyOrder = weeklyOrderData.weekly_order || null;
      state.weeklyOrders = Array.isArray(weeklyOrdersData.weekly_orders) ? weeklyOrdersData.weekly_orders : [];
      state.manualOrderGroups = Array.isArray(manualGroupsData.groups) ? manualGroupsData.groups : [];
      state.products = Array.isArray(productsData.products) ? productsData.products : [];
      state.collectionGroups = Array.isArray(collectionData.groups) ? collectionData.groups : [];
      state.members = Array.isArray(usersData.users) ? usersData.users : [];
      state.historicalSales = Array.isArray(historicalData.historical_sales) ? historicalData.historical_sales : [];

      ensureSelections();
      render();
      await refreshUnseenCount({ silent: true });
      startUnseenPolling();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        saveToken("");
        state.orders = [];
        state.cakeOrders = [];
        state.cakeCatalog = [];
        state.pickups = [];
        state.products = [];
        state.members = [];
        state.historicalSales = [];
        state.stats = null;
        state.weeklyOrder = null;
        state.manualOrderGroups = [];
        state.selectedOrderId = null;
        state.selectedCakeOrderId = null;
        state.selectedUserId = null;
        state.selectedProductId = null;
        stopUnseenPolling();
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

  async function saveWeeklyOrder(form) {
    const data = new FormData(form);
    const result = await api("/api/admin/weekly-order", {
      method: "PATCH",
      body: {
        title: data.get("title") || "",
        start_at: readOptionalDateTime(data.get("start_at")),
        order_deadline_at: readOptionalDateTime(data.get("order_deadline_at")),
        is_open: String(data.get("is_open")) === "1"
      }
    });
    // 保存团购资料不会改变产品归属。直接采用接口返回的团购资料，避免不必要的
    // 全量刷新导致本周甜品列表被重新加载或短暂清空。
    if (result.weekly_order) {
      state.weeklyOrder = result.weekly_order;
      const savedIndex = state.weeklyOrders.findIndex((item) =>
        Number(item.id) === Number(result.weekly_order.id));
      if (savedIndex >= 0) state.weeklyOrders[savedIndex] = result.weekly_order;
    }
    const now = new Date();
    weeklyLastSavedAt = `${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    setFlash("success", "本次团购已保存。");
  }

  async function toggleWeeklyOrderOpen(button) {
    const current = state.weeklyOrder || {};
    const extraUntilMs = Date.parse(current.extra_order_until || "");
    const extraWindowActive = Number.isFinite(extraUntilMs) && extraUntilMs > Date.now();
    const nextOpen = !(current.is_open || extraWindowActive);
    if (button) button.disabled = true;
    const result = await api("/api/admin/weekly-order", {
      method: "PATCH",
      body: {
        title: current.title || makeDefaultGroupTitle(),
        start_at: current.start_at || "",
        order_deadline_at: current.order_deadline_at || current.end_at || "",
        is_open: nextOpen,
        extra_order_until: nextOpen ? (current.extra_order_until || "") : ""
      }
    });
    if (result.weekly_order) state.weeklyOrder = result.weekly_order;
    setFlash("success", nextOpen ? "本次团购已开放。" : "本次团购已关闭。");
  }

  async function openExtraOrderWindow() {
    const result = await api("/api/admin/weekly-order/extra-window", { method: "POST" });
    if (result.weekly_order) {
      state.weeklyOrder = result.weekly_order;
      const savedIndex = state.weeklyOrders.findIndex((item) =>
        Number(item.id) === Number(result.weekly_order.id));
      if (savedIndex >= 0) state.weeklyOrders[savedIndex] = result.weekly_order;
    }
    setFlash("success", "已用现有剩余库存开放加单 10 分钟；原开始和截单时间未改变。");
    render();
  }

  function applyUserFilter() {
    const input = document.getElementById("userSearchInput");
    state.filters.user_q = input ? input.value.trim() : "";
    const visibleMembers = getFilteredMembers();
    state.selectedUserId = visibleMembers[0] ? visibleMembers[0].id : null;
    render();
  }

  // 实时搜索：render() 会重建 DOM 导致输入框失焦，这里渲染后把焦点/光标位置还原到同 id 的新输入框。
  function renderKeepingFocus(inputId) {
    const prev = document.getElementById(inputId);
    const pos = prev && prev.selectionStart != null ? prev.selectionStart : null;
    render();
    const next = document.getElementById(inputId);
    if (next) {
      next.focus();
      if (pos != null && next.setSelectionRange) {
        try { next.setSelectionRange(pos, pos); } catch (e) {}
      }
    }
  }

  // 选中列表项后 render() 会重建 DOM 把侧栏列表滚动条弹回顶部；这里渲染后还原滚动位置。
  function renderKeepingScroll(selector) {
    const before = document.querySelector(selector);
    const top = before ? before.scrollTop : 0;
    render();
    const after = document.querySelector(selector);
    if (after) after.scrollTop = top;
  }

  let linkedUserLongPress = null;

  function clearLinkedUserLongPress(pointerId) {
    if (!linkedUserLongPress) return;
    if (pointerId !== undefined && pointerId !== linkedUserLongPress.pointerId) return;
    clearTimeout(linkedUserLongPress.timer);
    linkedUserLongPress.chip.classList.remove("is-pressing");
    linkedUserLongPress = null;
  }

  async function requestUserUnlink(chip) {
    const primaryUserId = Number(chip && chip.dataset.linkedUserPrimary);
    const secondaryUserId = Number(chip && chip.dataset.linkedUserRemove);
    const label = (chip && chip.dataset.linkedUserLabel) || `用户 ${secondaryUserId}`;
    if (!primaryUserId || !secondaryUserId || primaryUserId === secondaryUserId) return;
    const message = `确认解除“${label}”与主账号的关联吗？\n\n解除后该账号的购买次数和消费会独立显示；历史订单保持原样。之前已经合并的余额继续保留在主账号，不会自动拆分。`;
    if (!confirm(message)) return;
    chip.disabled = true;
    chip.classList.add("is-removing");
    try {
      await api(`/api/admin/users/${primaryUserId}/links/${secondaryUserId}`, { method: "DELETE" });
      state.selectedUserId = primaryUserId;
      setFlash("success", `已解除“${label}”的账号关联。`);
      await loadDashboard();
    } catch (error) {
      chip.disabled = false;
      chip.classList.remove("is-removing");
      setFlash("error", error.message || "解除账号关联失败");
    }
  }

  document.addEventListener("pointerdown", (event) => {
    const chip = event.target.closest && event.target.closest("[data-linked-user-remove]");
    if (!chip) return;
    if (event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
    clearLinkedUserLongPress();
    chip.classList.add("is-pressing");
    const timer = setTimeout(() => {
      if (!linkedUserLongPress || linkedUserLongPress.chip !== chip) return;
      chip.classList.remove("is-pressing");
      linkedUserLongPress = null;
      if (navigator.vibrate) navigator.vibrate(24);
      requestUserUnlink(chip);
    }, 650);
    linkedUserLongPress = {
      chip,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      timer
    };
  });

  document.addEventListener("pointermove", (event) => {
    if (!linkedUserLongPress || event.pointerId !== linkedUserLongPress.pointerId) return;
    const movedX = Math.abs(event.clientX - linkedUserLongPress.startX);
    const movedY = Math.abs(event.clientY - linkedUserLongPress.startY);
    if (movedX > 12 || movedY > 12) clearLinkedUserLongPress(event.pointerId);
  });
  document.addEventListener("pointerup", (event) => clearLinkedUserLongPress(event.pointerId));
  document.addEventListener("pointercancel", (event) => clearLinkedUserLongPress(event.pointerId));
  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest && event.target.closest("[data-linked-user-remove]")) event.preventDefault();
  });

  document.addEventListener("input", (event) => {
    const t = event.target;
    if (!t || !t.id) return;
    if (t.id === "searchInput") {
      state.filters.q = t.value.trim();
      renderKeepingFocus("searchInput");
    } else if (t.id === "userLinkSearchInput") {
      const form = t.closest("#userLinkForm");
      const query = t.value.trim().toLowerCase();
      const candidates = form ? Array.from(form.querySelectorAll("[data-user-link-candidate]")) : [];
      let visibleCount = 0;
      candidates.forEach((candidate) => {
        const matches = !query || String(candidate.dataset.userLinkSearch || "").includes(query);
        candidate.hidden = !matches;
        candidate.style.display = matches ? "" : "none";
        candidate.classList.remove("is-selected");
        if (matches) visibleCount += 1;
      });
      const hiddenInput = form && form.querySelector('input[name="secondary_user_id"]');
      if (hiddenInput) hiddenInput.value = "";
      const results = form && form.querySelector("[data-user-link-results]");
      if (results) results.classList.remove("has-selection");
      const hint = form && form.querySelector("[data-user-link-hint]");
      if (hint) hint.textContent = visibleCount
        ? `找到 ${visibleCount} 个账号，请点选要合并的账号。`
        : "没有匹配的账号，请换昵称、编号、微信号或邮箱搜索。";
    } else if (t.id === "cakeSearchInput") {
      state.filters.cake_q = t.value.trim();
      clearSelectedCakeOrder();
      renderKeepingFocus("cakeSearchInput");
    } else if (t.id === "userSearchInput") {
      state.filters.user_q = t.value.trim();
      renderKeepingFocus("userSearchInput");
    } else if (t.id === "productSearchInput") {
      state.filters.product_q = t.value.trim();
      renderKeepingFocus("productSearchInput");
    }
  });

  async function createWeeklyOrder(form) {
    const data = new FormData(form);
    await api("/api/admin/weekly-orders", {
      method: "POST",
      body: {
        title: data.get("title") || "",
        start_at: readOptionalDateTime(data.get("start_at")),
        order_deadline_at: readOptionalDateTime(data.get("order_deadline_at")),
        is_open: String(data.get("is_open")) === "1"
      }
    });
    setFlash("success", "新团购已创建，并切换为当前档期。");
    await loadDashboard();
  }

  async function assignProductToCurrentWeek(form) {
    const data = new FormData(form);
    const productId = Number(data.get("product_id"));
    const product = state.products.find((item) => Number(item.id) === productId);
    if (!productId || !state.weeklyOrder || !state.weeklyOrder.id) {
      setFlash("error", "请先选择一个产品。");
      return;
    }
    if (!product || !product.image_url) {
      setFlash("error", "这个产品还没有图片，先上传图片后再加入本周。");
      return;
    }
    await api(`/api/admin/products/${productId}`, {
      method: "PATCH",
      body: {
        weekly_order_id: Number(state.weeklyOrder.id),
        is_active: 1
      }
    });
    setFlash("success", "甜品已加入本周。");
    await loadDashboard();
    state.selectedProductId = productId;
  }

  async function saveCurrentProduct(form) {
    const productId = Number(form.dataset.currentProductForm);
    const product = state.products.find((item) => Number(item.id) === productId);
    const data = new FormData(form);
    const file = data.get("image");
    const hasFile = file && typeof file === "object" && file.name;
    if (!product || (!product.image_url && !hasFile)) {
      setFlash("error", "本周甜品必须有图片，请先上传图片。");
      return;
    }
    await api(`/api/admin/products/${productId}`, {
      method: "PATCH",
      body: {
        weekly_order_id: state.weeklyOrder && state.weeklyOrder.id ? Number(state.weeklyOrder.id) : null,
        price: data.get("price") || 0,
        stock: data.get("stock") || 0,
        limit_per_order: readOptionalNumber(data.get("limit_per_order")),
        is_active: Number(data.get("is_active") || 0)
      }
    });
    if (hasFile) {
      await uploadProductImage(productId, file);
    }
    setFlash("success", "本周甜品设置已保存。");
    await loadDashboard();
  }

  async function unassignProductFromCurrentWeek(productId) {
    await api(`/api/admin/products/${productId}`, {
      method: "PATCH",
      body: {
        weekly_order_id: null
      }
    });
    setFlash("success", "甜品已移出本周。");
    await loadDashboard();
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
    const file = data.get("image");
    if (!file || typeof file !== "object" || !file.name) {
      setFlash("error", "新甜品必须上传图片。");
      return;
    }
    const productData = await api("/api/admin/products", {
      method: "POST",
      body: {
        weekly_order_id: state.weeklyOrder && state.weeklyOrder.id ? Number(state.weeklyOrder.id) : null,
        category: "创意甜品",
        name: data.get("name") || "",
        description: data.get("description") || "",
        price: data.get("price") || 0,
        stock: data.get("stock") || 0,
        limit_per_order: readOptionalNumber(data.get("limit_per_order")),
        is_active: 1
      }
    });

    const product = productData.product;
    if (product && file && typeof file === "object" && file.name) {
      await uploadProductImage(product.id, file);
    }

    setFlash("success", "新甜品已创建，并同步到图鉴。");
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

  function resolveCancelReason(status) {
    if (status !== "cancelled") return Promise.resolve("");
    return promptCancelReason();
  }

  function promptCancelReason() {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "cancel-reason-overlay";
      overlay.innerHTML = `
        <div class="cancel-reason-backdrop" data-cr-close></div>
        <div class="cancel-reason-panel" role="dialog" aria-modal="true" aria-labelledby="cancelReasonTitle">
          <h3 class="cancel-reason-title" id="cancelReasonTitle">取消订单</h3>
          <p class="cancel-reason-sub">请选择取消理由，会同步显示给顾客。</p>
          <label class="cancel-reason-opt"><input type="radio" name="cr" value="测试单" checked> 测试单</label>
          <label class="cancel-reason-opt"><input type="radio" name="cr" value="库存不足"> 库存不足</label>
          <label class="cancel-reason-opt"><input type="radio" name="cr" value="其他"> 其他</label>
          <input class="input cancel-reason-other" data-cr-other placeholder="请输入取消理由" hidden>
          <div class="cancel-reason-actions">
            <button type="button" class="button-secondary" data-cr-close>返回</button>
            <button type="button" class="button" data-cr-confirm>确认取消</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      const otherInput = overlay.querySelector("[data-cr-other]");
      const cleanup = (value) => {
        overlay.remove();
        document.body.style.overflow = "";
        resolve(value);
      };
      overlay.addEventListener("change", (event) => {
        if (event.target && event.target.name === "cr") {
          const isOther = event.target.value === "其他";
          otherInput.hidden = !isOther;
          if (isOther) otherInput.focus();
        }
      });
      overlay.addEventListener("click", (event) => {
        if (event.target.closest("[data-cr-close]")) return cleanup(null);
        if (event.target.closest("[data-cr-confirm]")) {
          const selected = overlay.querySelector("input[name='cr']:checked");
          let reason = selected ? selected.value : "";
          if (reason === "其他") reason = otherInput.value.trim() || "其他";
          cleanup(reason);
        }
      });
    });
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

  // 一个「保存」按钮保存所有：状态 + 付款方式 + 管理员备注。
  // 付款状态由付款方式推断：选了付款方式=已付款，未记录=未付款。
  async function saveOrderAll(orderId, { status, payment_method, admin_comment, cancel_reason = "" }) {
    try {
      const payment_status = payment_method ? "paid" : "non_paid";
      await api(`/api/admin/orders/${orderId}/status`, { method: "PATCH", body: { status, cancel_reason } });
      await api(`/api/admin/orders/${orderId}/payment`, { method: "PATCH", body: { payment_status, payment_method } });
      await api(`/api/admin/orders/${orderId}/comment`, { method: "PATCH", body: { admin_comment } });
      setFlash("success", "已保存。");
      await loadDashboard();
      state.selectedOrderId = Number(orderId);
      render();
    } catch (error) {
      setFlash("error", error.message || "保存失败");
    }
  }

  // 拖拽 Current Week Orders / Production Summary 之间的分隔条调整宽度。
  // 使用 Pointer Events，让鼠标、Apple Pencil 和 iPad 触摸共享同一套逻辑。
  let sidebarResize = null;

  function getSidebarResizeBounds(layout) {
    const min = 280;
    // 给右侧详情至少保留 370px；桌面端仍沿用原来的 980px 上限。
    const max = Math.max(min, Math.min(980, layout.getBoundingClientRect().width - 370));
    return { min, max };
  }

  function finishSidebarResize(event) {
    if (!sidebarResize) return;
    if (event && event.pointerId !== sidebarResize.pointerId) return;
    const { layout, handle, pointerId } = sidebarResize;
    const w = layout.style.getPropertyValue("--admin-sidebar-w");
    if (w) localStorage.setItem("makkie.admin.sidebarW", w.trim());
    handle.classList.remove("is-active");
    if (typeof handle.releasePointerCapture === "function" && handle.hasPointerCapture(pointerId)) {
      handle.releasePointerCapture(pointerId);
    }
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    sidebarResize = null;
  }

  document.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest("[data-resize-handle]");
    if (!handle) return;
    if (event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    const layout = handle.closest(".admin-layout");
    const sidebar = layout && layout.querySelector(".admin-sidebar-card");
    if (!sidebar) return;
    handle.classList.add("is-active");
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    if (typeof handle.setPointerCapture === "function") handle.setPointerCapture(event.pointerId);
    sidebarResize = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startW: sidebar.getBoundingClientRect().width,
      layout,
      handle
    };
  });
  document.addEventListener("pointermove", (event) => {
    if (!sidebarResize || event.pointerId !== sidebarResize.pointerId) return;
    event.preventDefault();
    const { min, max } = getSidebarResizeBounds(sidebarResize.layout);
    const next = Math.max(min, Math.min(max, sidebarResize.startW + (event.clientX - sidebarResize.startX)));
    sidebarResize.layout.style.setProperty("--admin-sidebar-w", next + "px");
  }, { passive: false });
  document.addEventListener("pointerup", finishSidebarResize);
  document.addEventListener("pointercancel", finishSidebarResize);

  document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (details && details.matches && details.matches("[data-weekly-products-section]")) {
      state.weeklyProductsOpen = details.open;
    }
  }, true);

  document.addEventListener("change", async (event) => {
    if (event.target && event.target.id === "soundToggle") {
      setSoundEnabled(event.target.checked);
      return;
    }
    const currentProductForm = event.target && event.target.closest
      ? event.target.closest("[data-current-product-form]")
      : null;
    if (currentProductForm && event.target.matches('input[name="price"], input[name="stock"], input[name="limit_per_order"], input[name="image"], select[name="is_active"]')) {
      if (event.target.name === "stock") {
        event.target.classList.toggle("is-zero", Number(event.target.value || 0) === 0);
      }
      saveCurrentProduct(currentProductForm).catch((error) => setFlash("error", error.message || "保存失败"));
      return;
    }
    if (event.target && event.target.matches("[data-pickup-active-input]")) {
      const toggle = event.target.closest(".toggle-slider");
      if (toggle) {
        toggle.classList.toggle("is-on", event.target.checked);
        const label = toggle.querySelector("[data-pickup-active-label]");
        if (label) label.textContent = event.target.checked
          ? "本周开放（前端可选）"
          : "本周关闭（前端隐藏）";
      }
      return;
    }
    if (event.target && event.target.id === "analyticsRange") {
      state.filters.analytics_range = event.target.value || "all";
      if (state.filters.analytics_range !== "custom") {
        state.filters.analytics_start = "";
        state.filters.analytics_end = "";
      }
      render();
      return;
    }
    if (event.target && (event.target.id === "analyticsStart" || event.target.id === "analyticsEnd")) {
      state.filters.analytics_range = "custom";
      const startInput = document.getElementById("analyticsStart");
      const endInput = document.getElementById("analyticsEnd");
      state.filters.analytics_start = startInput ? startInput.value : "";
      state.filters.analytics_end = endInput ? endInput.value : "";
      render();
      return;
    }
    if (event.target && event.target.id === "groupByUser") {
      state.orderGroupBy = event.target.checked ? "user" : "none";
      render();
      return;
    }
    // 订单状态与付款状态合并为一个筛选器；每次只应用其中一种条件。
    if (event.target && event.target.id === "orderFilter") {
      const [kind, value] = String(event.target.value || "").split(":", 2);
      state.filters.status = kind === "status" ? value : "";
      state.filters.payment_status = kind === "payment" ? value : "";
      render();
      return;
    }
    if (event.target && event.target.id === "pickupLocationFilter") {
      state.filters.pickup_location = event.target.value;
      render();
      return;
    }
    if (event.target && event.target.id === "cakeStatusFilter") {
      state.filters.cake_status = event.target.value;
      clearSelectedCakeOrder();
      render();
      return;
    }
    if (event.target && event.target.id === "cakePickupDateFilter") {
      state.filters.cake_pickup_date = event.target.value;
      clearSelectedCakeOrder();
      render();
      return;
    }
    if (event.target && event.target.id === "cakeSortSelect") {
      state.filters.cake_sort = event.target.value;
      clearSelectedCakeOrder();
      render();
      return;
    }
    if (event.target && event.target.id === "userTagFilter") {
      state.filters.user_tag = event.target.value;
      render();
      return;
    }
    if (event.target && event.target.id === "userSortSelect") {
      state.userSort = event.target.value;
      render();
      return;
    }
    if (event.target && event.target.matches("[data-batch-status]")) {
      state.batchStatus = event.target.value;
      render();
      return;
    }
    // 图鉴上传分类：下拉选现有分类，选「＋ 输入新分类」则显示输入框自己打字。
    if (event.target && event.target.matches("[data-collection-cat-select]")) {
      const input = document.getElementById("collectionCatNew");
      if (!input) return;
      if (event.target.value === "__new__") {
        input.hidden = false;
        input.value = "";
        input.focus();
      } else {
        input.value = event.target.value;
        input.hidden = true;
      }
      return;
    }
    const tagSelect = event.target.closest("[data-user-tag]");
    if (!tagSelect) return;
    const userId = Number(tagSelect.dataset.userTag);
    const tag = tagSelect.value;
    try {
      await api(`/api/admin/users/${userId}/tag`, { method: "PATCH", body: { tag } });
      const member = state.members.find((m) => Number(m.id) === userId);
      if (member) member.tag = tag;
      setFlash("success", `已标记为「${userTagLabel(tag)}」`);
      render();
    } catch (error) {
      setFlash("error", error.message || "标签更新失败");
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.matches("[data-collection-edit-form]")) {
      event.preventDefault();
      api(`/api/admin/collection/${form.dataset.collectionEditForm}`, { method: "PATCH", body: new FormData(form) })
        .then(() => { state.editingCollectionId = null; setFlash("success", "已更新"); return loadDashboard(); })
        .then(() => render())
        .catch((error) => setFlash("error", error.message || "更新失败"));
      return;
    }

    if (form.id === "collectionUploadForm") {
      event.preventDefault();
      const catInput = document.getElementById("collectionCatNew");
      if (!catInput || !String(catInput.value || "").trim()) {
        setFlash("error", "请选择或输入分类。");
        render();
        return;
      }
      const btn = form.querySelector("#collectionUploadBtn");
      if (btn) { btn.disabled = true; btn.textContent = "上传中..."; }
      api("/api/admin/collection", { method: "POST", body: new FormData(form) })
        .then(() => { setFlash("success", "已加入图鉴"); return loadDashboard(); })
        .then(() => render())
        .catch((error) => {
          setFlash("error", error.message || "上传失败");
          if (btn) { btn.disabled = false; btn.textContent = "上传到图鉴"; }
        });
      return;
    }

    if (form.matches("[data-inline-form]")) {
      event.preventDefault();
      const formType = form.dataset.inlineForm;
      const orderId = form.dataset.orderId;
      const data = new FormData(form);
      if (formType === "all") {
        const status = data.get("status") || "pending";
        (async () => {
          const cancel_reason = await resolveCancelReason(status);
          if (cancel_reason === null) return;
          saveOrderAll(orderId, {
            status,
            payment_method: data.get("payment_method") || "",
            admin_comment: data.get("admin_comment") || "",
            cancel_reason
          });
        })();
      } else if (formType === "payment") {
        saveOrderPatch(
          orderId,
          `/api/admin/orders/${orderId}/payment`,
          {
            payment_status: data.get("payment_status") || "non_paid",
            payment_method: data.get("payment_method") || "",
            payment_note: data.get("payment_note") || ""
          },
          "付款信息已保存。"
        );
      } else if (formType === "comment") {
        saveOrderPatch(
          orderId,
          `/api/admin/orders/${orderId}/comment`,
          { admin_comment: data.get("admin_comment") || "" },
          "管理员备注已保存。"
        );
      } else if (formType === "status") {
        const status = data.get("status") || "pending";
        (async () => {
          const cancel_reason = await resolveCancelReason(status);
          if (cancel_reason === null) return;
          saveOrderPatch(
            orderId,
            `/api/admin/orders/${orderId}/status`,
            { status, cancel_reason },
            "订单状态已保存。"
          );
        })();
      }
      return;
    }

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
      const status = data.get("status") || "pending";
      (async () => {
        const cancel_reason = await resolveCancelReason(status);
        if (cancel_reason === null) return;
        saveOrderPatch(
          form.dataset.orderId,
          `/api/admin/orders/${form.dataset.orderId}/status`,
          { status, cancel_reason },
          "订单状态已保存。"
        );
      })();
      return;
    }

    if (form.id === "cakeStatusForm") {
      event.preventDefault();
      const data = new FormData(form);
      const status = data.get("status") || "pending";
      (async () => {
        const cancel_reason = await resolveCancelReason(status);
        if (cancel_reason === null) return;
        try {
          await api(`/api/admin/cake-orders/${form.dataset.cakeOrderId}/status`, {
            method: "PATCH",
            body: { status, cancel_reason }
          });
          setFlash("success", status === "completed"
            ? "蛋糕询单已完成，并已按下单日期加入历史订单和营收分析。"
            : "蛋糕询单状态已保存。");
          await loadDashboard();
        } catch (error) {
          setFlash("error", error.message || "保存蛋糕询单失败");
        }
      })();
      return;
    }

    if (form.id === "cakePickupDateForm") {
      event.preventDefault();
      const data = new FormData(form);
      const pickup_date = data.get("pickup_date") || "";
      (async () => {
        try {
          await api(`/api/admin/cake-orders/${form.dataset.cakeOrderId}/pickup-date`, {
            method: "PATCH",
            body: { pickup_date }
          });
          setFlash("success", "蛋糕询单自提日期已保存，用户前端会同步显示。");
          await loadDashboard();
        } catch (error) {
          setFlash("error", error.message || "保存自提日期失败");
        }
      })();
      return;
    }

    if (form.id === "userProfileForm") {
      event.preventDefault();
      const data = new FormData(form);
      const userId = Number(form.dataset.userId);
      const body = {
        note: data.get("note") || "",
        wechat_id: data.get("wechat_id") || "",
        deposit_balance: Math.max(0, Number(data.get("deposit_balance")) || 0)
      };
      api(`/api/admin/users/${userId}/profile`, { method: "PATCH", body })
        .then((result) => {
          const member = state.members.find((m) => Number(m.id) === userId);
          if (member) Object.assign(member, result.user || body, { wechat_id: String(body.wechat_id).trim() });
          setFlash("success", "已保存用户资料与余额。");
          render();
        })
        .catch((error) => setFlash("error", error.message || "保存失败"));
      return;
    }

    if (form.id === "userLinkForm") {
      event.preventDefault();
      const data = new FormData(form);
      const primaryUserId = Number(form.dataset.userId);
      const secondaryUserId = Number(data.get("secondary_user_id"));
      const primary = state.members.find((member) => Number(member.id) === primaryUserId);
      const secondary = state.members.find((member) => Number(member.id) === secondaryUserId);
      if (!secondaryUserId || !secondary) {
        setFlash("error", "请选择要关联的重复账号。");
        return;
      }
      const message = `确认把“${secondary.nickname || secondary.uuid}”关联到“${(primary && primary.nickname) || primaryUserId}”吗？\n\n余额会汇总到主账号；所有现有订单的用户 ID、金额、商品、状态、时间和编号都不会改变。`;
      if (!confirm(message)) return;
      api(`/api/admin/users/${primaryUserId}/link`, {
        method: "POST",
        body: { secondary_user_id: secondaryUserId }
      })
        .then(async () => {
          setFlash("success", "用户账号已关联，历史订单保持原样。");
          state.selectedUserId = primaryUserId;
          await loadDashboard();
        })
        .catch((error) => setFlash("error", error.message || "关联用户失败"));
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
          is_active: data.get("is_active") === "1" ? 1 : 0,
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

    if (form.id === "weeklyOrderForm") {
      event.preventDefault();
      saveWeeklyOrder(form).catch((error) => setFlash("error", error.message || "保存失败"));
      return;
    }

    if (form.id === "weeklyOrderCreateForm") {
      event.preventDefault();
      const nextTitle = form.dataset.nextTitle || "下一期团购";
      if (!confirm(`确认创建“${nextTitle}”并切换为当前团购吗？\n\n现有订单会保留在历史团购，本周产品归属不会被改写。`)) return;
      createWeeklyOrder(form).catch((error) => setFlash("error", error.message || "创建失败"));
      return;
    }

    if (form.id === "productAssignForm") {
      event.preventDefault();
      assignProductToCurrentWeek(form).catch((error) => setFlash("error", error.message || "加入失败"));
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
      return;
    }

    if (form.matches("[data-current-product-form]")) {
      event.preventDefault();
      saveCurrentProduct(form).catch((error) => setFlash("error", error.message || "保存失败"));
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-manual-order-open]")) {
      openManualOrderDialog();
      return;
    }
    const userLinkCandidate = event.target.closest("[data-user-link-candidate]");
    if (userLinkCandidate) {
      const form = userLinkCandidate.closest("#userLinkForm");
      const searchInput = form && form.querySelector("#userLinkSearchInput");
      const hiddenInput = form && form.querySelector('input[name="secondary_user_id"]');
      const results = form && form.querySelector("[data-user-link-results]");
      const hint = form && form.querySelector("[data-user-link-hint]");
      if (searchInput) searchInput.value = userLinkCandidate.dataset.userLinkLabel || "";
      if (hiddenInput) hiddenInput.value = userLinkCandidate.dataset.userLinkCandidate || "";
      if (results) {
        results.querySelectorAll("[data-user-link-candidate]").forEach((candidate) => {
          candidate.hidden = false;
          candidate.style.display = "";
          candidate.classList.toggle("is-selected", candidate === userLinkCandidate);
        });
        results.classList.add("has-selection");
      }
      if (hint) hint.textContent = "已选择该账号；确认无误后点击下方合并按钮。";
      return;
    }
    const weeklyOpenToggle = event.target.closest("[data-weekly-open-toggle]");
    if (weeklyOpenToggle) {
      toggleWeeklyOrderOpen(weeklyOpenToggle).catch((error) => {
        weeklyOpenToggle.disabled = false;
        setFlash("error", error.message || "更新团购开放状态失败");
      });
      return;
    }
    const weeklyProductsToggle = event.target.closest("[data-weekly-products-toggle]");
    if (weeklyProductsToggle) {
      state.weeklyProductCreatorOpen = !state.weeklyProductCreatorOpen;
      render();
      return;
    }
    const extraOrderWindow = event.target.closest("[data-extra-order-window]");
    if (extraOrderWindow) {
      extraOrderWindow.disabled = true;
      openExtraOrderWindow().catch((error) => {
        extraOrderWindow.disabled = false;
        setFlash("error", error.message || "开放加单窗口失败");
      });
      return;
    }
    const collEdit = event.target.closest("[data-collection-edit]");
    if (collEdit) {
      state.editingCollectionId = Number(collEdit.dataset.collectionEdit);
      render();
      return;
    }
    const collEditCancel = event.target.closest("[data-collection-edit-cancel]");
    if (collEditCancel) {
      state.editingCollectionId = null;
      render();
      return;
    }
    const collDel = event.target.closest("[data-collection-del]");
    if (collDel) {
      if (!confirm("确定删除这张图鉴？")) return;
      api(`/api/admin/collection/${collDel.dataset.collectionDel}`, { method: "DELETE" })
        .then(() => { setFlash("success", "已删除"); return loadDashboard(); })
        .then(() => render())
        .catch((error) => setFlash("error", error.message || "删除失败"));
      return;
    }
    const dateTimeOpen = event.target.closest("[data-datetime-open]");
    const dateTimeClose = event.target.closest("[data-datetime-close]");
    const dateTimeConfirm = event.target.closest("[data-datetime-confirm]");
    const dateTimeClear = event.target.closest("[data-datetime-clear]");
    const wheelOption = event.target.closest("[data-wheel-option]");
    const expandButton = event.target.closest("[data-order-expand]");
    const orderButton = event.target.closest("[data-order-select]");
    const userButton = event.target.closest("[data-user-select]");
    const cakeOrderButton = event.target.closest("[data-cake-order-select]");
    const historyCakeOrderButton = event.target.closest("[data-history-cake-select]");
    const productButton = event.target.closest("[data-product-select]");
    const tabButton = event.target.closest("[data-view-tab]");
    const jumpButton = event.target.closest("[data-order-jump]");
    const deleteButton = event.target.closest("[data-product-delete]");
    const unassignButton = event.target.closest("[data-product-unassign]");
    const historyGroupToggle = event.target.closest("[data-history-group-toggle]");
    const manualGroupEditButton = event.target.closest("[data-manual-group-edit]");
    const analyticsCategoryButton = event.target.closest("[data-analytics-category]");

    const quickCompleteButton = event.target.closest("[data-order-quick-complete]");
    if (quickCompleteButton) {
      const orderId = quickCompleteButton.dataset.orderQuickComplete;
      quickCompleteButton.disabled = true;
      quickCompleteButton.textContent = "处理中…";
      saveOrderPatch(
        orderId,
        `/api/admin/orders/${orderId}/status`,
        { status: "completed" },
        "订单已标记为已完成。"
      );
      return;
    }

    if (analyticsCategoryButton) {
      const category = analyticsCategoryButton.dataset.analyticsCategory || "all";
      const selected = new Set(Array.isArray(state.filters.analytics_categories) ? state.filters.analytics_categories : []);
      if (category === "all") {
        selected.clear();
      } else if (selected.has(category)) {
        selected.delete(category);
      } else {
        selected.add(category);
      }
      state.filters.analytics_categories = Array.from(selected);
      render();
      return;
    }

    if (event.target.closest("[data-batch-toggle]")) {
      state.batchMode = !state.batchMode;
      state.batchSelected = {};
      render();
      return;
    }
    if (event.target.closest("[data-batch-all]")) {
      getVisibleOrders().forEach((order) => { state.batchSelected[order.id] = true; });
      render();
      return;
    }
    if (event.target.closest("[data-batch-clear]")) {
      state.batchSelected = {};
      render();
      return;
    }
    if (event.target.closest("[data-batch-apply]")) {
      applyBatchStatus();
      return;
    }

    const deadlineQuick = event.target.closest("[data-deadline-quick]");
    if (deadlineQuick) {
      event.preventDefault();
      const hours = Number(deadlineQuick.dataset.deadlineQuick) || 0;
      const startHidden = document.querySelector(`[data-datetime-hidden="${escapeSelector(deadlineQuick.dataset.quickStart)}"]`);
      let base = startHidden && startHidden.value ? new Date(startHidden.value) : new Date();
      if (Number.isNaN(base.getTime())) base = new Date();
      const value = toDatetimeInputValue(new Date(base.getTime() + hours * 3600 * 1000));
      const targetHidden = document.querySelector(`[data-datetime-hidden="${escapeSelector(deadlineQuick.dataset.quickTarget)}"]`);
      const targetDisplay = document.querySelector(`[data-datetime-display="${escapeSelector(deadlineQuick.dataset.quickTarget)}"]`);
      if (targetHidden) targetHidden.value = value;
      if (targetDisplay) targetDisplay.textContent = formatDateTimeDisplay(value);
      const row = deadlineQuick.closest(".datetime-quick-row");
      if (row) row.querySelectorAll(".datetime-quick-btn").forEach((b) => b.classList.toggle("is-active", b === deadlineQuick));
      return;
    }

    if (dateTimeOpen) {
      event.preventDefault();
      openDateTimePicker(dateTimeOpen);
      return;
    }

    if (wheelOption) {
      const wheelColumn = wheelOption.closest(".datetime-wheel-column");
      if (wheelColumn && wheelColumn.dataset.suppressClick === "1") return;
      event.preventDefault();
      setWheelValue(wheelOption.dataset.wheelOption, wheelOption.dataset.wheelValue);
      return;
    }

    if (dateTimeConfirm) {
      event.preventDefault();
      confirmDateTimePicker();
      return;
    }

    if (dateTimeClear) {
      event.preventDefault();
      clearDateTimePicker();
      return;
    }

    if (dateTimeClose || event.target.matches("[data-datetime-overlay]")) {
      event.preventDefault();
      closeDateTimePicker();
      return;
    }

    if (expandButton) {
      const orderId = expandButton.dataset.orderExpand;
      if (state.batchMode) {
        state.batchSelected[orderId] = !state.batchSelected[orderId];
        render();
        return;
      }
      state.expandedCurrentOrders[orderId] = !state.expandedCurrentOrders[orderId];
      state.selectedOrderId = Number(orderId);
      renderKeepingScroll(".admin-sidebar-card .order-list");
      return;
    }

    if (orderButton) {
      state.selectedOrderId = Number(orderButton.dataset.orderSelect);
      if (state.activeView === "history_orders") state.historyDetailType = "order";
      markOrderSeenInBackground(state.selectedOrderId);
      const selectedOrder = state.orders.find((order) => Number(order.id) === Number(state.selectedOrderId));
      const selectedGroupId = getOrderGroupId(selectedOrder);
      if (state.activeView === "history_orders" && selectedGroupId) {
        state.expandedHistoryGroups[selectedGroupId] = true;
      }
      render();
      return;
    }

    if (userButton) {
      state.selectedUserId = Number(userButton.dataset.userSelect);
      renderKeepingScroll(".admin-sidebar-card .order-list");
      return;
    }

    if (historyCakeOrderButton) {
      state.selectedCakeOrderId = Number(historyCakeOrderButton.dataset.historyCakeSelect);
      state.historyDetailType = "cake";
      render();
      return;
    }

    if (cakeOrderButton) {
      state.selectedCakeOrderId = Number(cakeOrderButton.dataset.cakeOrderSelect);
      renderKeepingScroll(".admin-sidebar-card .order-list");
      return;
    }

    if (productButton) {
      state.selectedProductId = Number(productButton.dataset.productSelect);
      renderKeepingScroll(".admin-sidebar-card .order-list");
      return;
    }

    if (tabButton && !jumpButton) {
      const nextView = String(tabButton.dataset.viewTab || "");
      state.activeView = nextView || "current_orders";
      state.batchMode = false;
      state.batchSelected = {};
      if (state.activeView === "cake_orders") {
        state.selectedCakeOrderId = null;
      } else if (state.activeView === "history_orders") {
        state.selectedOrderId = null;
        state.selectedCakeOrderId = null;
        state.historyDetailType = "order";
      }
      ensureSelections();
      render();
      if (state.activeView === "current_orders") {
        markAllOrdersSeenInBackground();
      }
      return;
    }

    if (jumpButton) {
      const nextOrderId = Number(jumpButton.dataset.orderJump);
      const targetOrder = state.orders.find((order) => Number(order.id) === nextOrderId);
      const targetGroupId = getOrderGroupId(targetOrder);
      state.activeView = targetOrder && targetGroupId === currentGroupId()
        ? "current_orders"
        : "history_orders";
      state.selectedOrderId = nextOrderId;
      markOrderSeenInBackground(nextOrderId);
      if (state.activeView === "history_orders" && targetGroupId) {
        state.expandedHistoryGroups[targetGroupId] = true;
      }
      if (state.activeView === "current_orders") {
        state.expandedCurrentOrders[nextOrderId] = true;
      }
      render();
      return;
    }

    if (manualGroupEditButton) {
      openManualGroupDialog(String(manualGroupEditButton.dataset.manualGroupEdit || ""));
      return;
    }

    if (historyGroupToggle) {
      const groupId = String(historyGroupToggle.dataset.historyGroupToggle || "");
      state.expandedHistoryGroups[groupId] = !state.expandedHistoryGroups[groupId];
      renderKeepingScroll(".admin-sidebar-card .order-list");
      return;
    }

    if (deleteButton) {
      deleteProduct(Number(deleteButton.dataset.productDelete));
      return;
    }

    if (unassignButton) {
      unassignProductFromCurrentWeek(Number(unassignButton.dataset.productUnassign)).catch((error) => {
        setFlash("error", error.message || "移出失败");
      });
      return;
    }

    if (event.target.id === "refreshButton") {
      loadDashboard();
      return;
    }

    if (event.target.id === "logoutButton") {
      saveToken("");
      state.orders = [];
      state.cakeOrders = [];
      state.cakeCatalog = [];
      state.pickups = [];
      state.products = [];
      state.members = [];
      state.historicalSales = [];
      state.manualOrderGroups = [];
      state.stats = null;
      state.weeklyOrder = null;
      state.selectedOrderId = null;
      state.selectedCakeOrderId = null;
      state.selectedUserId = null;
      state.selectedProductId = null;
      stopUnseenPolling();
      setFlash("success", "已退出登录。");
      return;
    }

    if (event.target.id === "productFilterButton") {
      const input = document.getElementById("productSearchInput");
      state.filters.product_q = input ? input.value.trim() : "";
      render();
    }
  });

  document.addEventListener("scroll", (event) => {
    if (!activeDateTimePicker) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const column = target.closest(".datetime-wheel-column");
    if (!column || !column.dataset.wheelColumn) return;
    clearTimeout(column._wheelTimer);
    column._wheelTimer = setTimeout(() => selectClosestWheelOption(column), 90);
  }, true);

  document.addEventListener("pointerover", (event) => {
    const segment = event.target.closest && event.target.closest(".analytics-donut-segment");
    if (segment) setDonutCenterFromSegment(segment);
    const point = event.target.closest && event.target.closest(".analytics-chart-point");
    if (point) showAnalyticsChartTooltip(point, event.clientX, event.clientY);
  });

  document.addEventListener("pointermove", (event) => {
    const point = event.target.closest && event.target.closest(".analytics-chart-point");
    if (point) showAnalyticsChartTooltip(point, event.clientX, event.clientY);
  });

  document.addEventListener("pointerout", (event) => {
    const segment = event.target.closest && event.target.closest(".analytics-donut-segment");
    if (segment) resetDonutCenter(segment);
    const point = event.target.closest && event.target.closest(".analytics-chart-point");
    if (point && !(event.relatedTarget && point.contains(event.relatedTarget))) hideAnalyticsChartTooltip(point);
  });

  document.addEventListener("focusin", (event) => {
    const segment = event.target.closest && event.target.closest(".analytics-donut-segment");
    if (segment) setDonutCenterFromSegment(segment);
    const point = event.target.closest && event.target.closest(".analytics-chart-point");
    if (point) showAnalyticsChartTooltip(point);
  });

  document.addEventListener("focusout", (event) => {
    const segment = event.target.closest && event.target.closest(".analytics-donut-segment");
    if (segment) resetDonutCenter(segment);
    const point = event.target.closest && event.target.closest(".analytics-chart-point");
    if (point) hideAnalyticsChartTooltip(point);
  });

  document.addEventListener("keydown", (event) => {
    const linkedUserChip = event.target.closest && event.target.closest("[data-linked-user-remove]");
    if (linkedUserChip && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      clearLinkedUserLongPress();
      requestUserUnlink(linkedUserChip);
      return;
    }
    if (event.key === "Escape" && activeDateTimePicker) {
      closeDateTimePicker();
      return;
    }
    if (event.key === "Enter" && event.target && event.target.id === "userSearchInput") {
      event.preventDefault();
      applyUserFilter();
    }
  });

  render();
  updateDocumentTitle();
  setInterval(tickWeeklyCountdown, 1000);
  if (state.token) {
    loadDashboard();
  }
})();
