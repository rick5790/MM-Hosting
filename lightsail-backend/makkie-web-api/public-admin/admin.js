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
    weeklyOrders: [],
    collectionGroups: [],
    weeklyOrder: null,
    stats: null,
    selectedOrderId: null,
    selectedUserId: null,
    selectedProductId: null,
    expandedHistoryGroups: {},
    expandedCurrentOrders: {},
    unseenCount: 0,
    previousUnseenCount: null,
    soundEnabled: false,
    flash: null,
    filters: {
      q: "",
      status: "",
      payment_status: "",
      user_q: "",
      product_q: ""
    }
  };
  let activeDateTimePicker = null;
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

  const STATUS_LABELS = {
    pending: "待处理",
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

  function statusLabel(value) {
    const key = String(value || "pending");
    return STATUS_LABELS[key] || key;
  }

  function paymentStatusLabel(value) {
    const key = String(value || "non_paid");
    return PAYMENT_STATUS_LABELS[key] || key;
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

  // Revenue counts only completed orders.
  function getCompletedRevenueTotal() {
    return (state.orders || []).reduce((sum, order) =>
      sum + (isCompletedOrder(order) ? (Number(order.total_amount) || 0) : 0), 0);
  }

  function getUserCompletedRevenue(userId) {
    return (state.orders || []).reduce((sum, order) =>
      sum + (isCompletedOrder(order) && Number(order.user_id) === Number(userId)
        ? (Number(order.total_amount) || 0) : 0), 0);
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
    return (state.orders || []).reduce((sum, order) =>
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

  function renderDateTimeWheelField(id, name, label, value) {
    const normalizedValue = toDatetimeInputValue(value);
    return `
      <label class="field datetime-wheel-field">
        <span>${escapeHtml(label)}</span>
        <input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(normalizedValue)}" data-datetime-hidden="${escapeHtml(id)}">
        <button class="datetime-wheel-trigger" type="button" data-datetime-open="${escapeHtml(id)}" data-picker-title="${escapeHtml(label)}">
          <span class="datetime-wheel-trigger-value" data-datetime-display="${escapeHtml(id)}">${escapeHtml(formatDateTimeDisplay(normalizedValue))}</span>
        </button>
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

  function getHistoryGroupLabel(groupId) {
    if (!groupId || groupId === "ungrouped") return "未归档团购";
    const weeklyOrder = getWeeklyOrderForGroup(groupId);
    if (weeklyOrder) {
      return weeklyOrder.title || weeklyOrder.group_no || weeklyOrder.active_group_id || `团购 #${groupId}`;
    }
    return `团购 #${groupId}`;
  }

  function getHistoryGroupMeta(groupId, orders) {
    const weeklyOrder = getWeeklyOrderForGroup(groupId);
    if (weeklyOrder && weeklyOrder.created_at) return formatDate(weeklyOrder.created_at);
    const newest = orders[0] && orders[0].created_at;
    return newest ? formatDate(newest) : "未记录";
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
    return state.orders.filter((order) => getOrderGroupId(order) !== groupId && matchesFilters(order));
  }

  function getHistoryOrderGroups() {
    const groups = new Map();
    getHistoryOrders().forEach((order) => {
      const groupId = getOrderGroupId(order) || "ungrouped";
      if (!groups.has(groupId)) groups.set(groupId, []);
      groups.get(groupId).push(order);
    });

    return Array.from(groups.entries()).map(([groupId, orders]) => ({
      groupId,
      orders,
      label: getHistoryGroupLabel(groupId),
      meta: getHistoryGroupMeta(groupId, orders),
      total: orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0)
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
    return orders.find((order) => Number(order.id) === Number(state.selectedOrderId)) || orders[0] || null;
  }

  function getFilteredMembers() {
    const query = String(state.filters.user_q || "").trim().toLowerCase();
    return state.members.filter((member) => {
      if (!query) return true;
      return JSON.stringify([member.nickname, member.uuid, member.client_id, member.id]).toLowerCase().includes(query);
    });
  }

  function getSelectedUser() {
    const members = getFilteredMembers();
    return members.find((member) => Number(member.id) === Number(state.selectedUserId)) || members[0] || null;
  }

  function getSelectedProduct() {
    return state.products.find((product) => Number(product.id) === Number(state.selectedProductId)) || state.products[0] || null;
  }

  function getUserOrders(userId) {
    return getHistoryOrders().filter((order) => Number(order.user_id) === Number(userId));
  }

  function getProductOrders(productId) {
    return getHistoryOrders().filter((order) =>
      (order.items || []).some((item) => Number(item.product_id) === Number(productId))
    );
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

  async function enableNewOrderSound() {
    const audio = getNewOrderAudio();
    try {
      if (audio) {
        audio.volume = 0.6;
        const promise = audio.play();
        if (promise && typeof promise.then === "function") await promise;
        audio.pause();
        audio.currentTime = 0;
      }
      state.soundEnabled = true;
      setFlash("success", "新订单声音已开启。");
      render();
    } catch (error) {
      console.error("[admin] Failed to enable new order sound:", error);
      setFlash("error", "声音开启失败，请再点一次试试。");
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
          <span>总收入（已完成）</span>
          <strong>${escapeHtml(formatMoney(getCompletedRevenueTotal()))}</strong>
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
      ["weekly_manage", "本周团购管理"],
      ["current_orders", "本周订单"],
      ["history_orders", "历史团购"],
      ["users", "用户"],
      ["products", "产品"]
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
        <details class="collapsible-section pickup-settings-card">
          <summary class="collapsible-summary">
            <span>自提时间设置</span>
            <small>还没有自提点数据</small>
          </summary>
        </details>
      `;
    }

    return `
      <details class="collapsible-section pickup-settings-card">
        <summary class="collapsible-summary">
          <span>自提时间设置</span>
          <small>默认本周六，少改动时先收起</small>
        </summary>
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
      const isSelected = Number(order.id) === Number(state.selectedOrderId);
      const statusClass = `status-tag status-${escapeHtml(order.status || "pending")}`;
      if (!expandable) {
        return `
          <button class="order-row ${isSelected ? "active" : ""}" type="button" data-order-select="${escapeHtml(order.id)}">
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
          </button>
        `;
      }
      const isExpanded = Boolean(state.expandedCurrentOrders[order.id]);
      return `
        <div class="order-accordion-wrap ${isExpanded ? "is-open" : ""}">
          <button class="order-row ${isSelected ? "active" : ""}" type="button" data-order-expand="${escapeHtml(order.id)}">
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
            <div class="order-expand-toggle">${isExpanded ? "收起 ▲" : "展开 ▼"}</div>
          </button>
          ${isExpanded ? renderInlineOrderExpanded(order) : ""}
        </div>
      `;
    }).join("");
  }

  function renderHistoryOrderGroups() {
    const groups = getHistoryOrderGroups();
    if (!groups.length) return `<div class="empty">还没有历史订单。</div>`;

    return groups.map((group) => {
      const hasSelectedOrder = group.orders.some((order) => Number(order.id) === Number(state.selectedOrderId));
      const isOpen = Boolean(state.expandedHistoryGroups[group.groupId] || hasSelectedOrder);
      return `
        <div class="history-group ${isOpen ? "open" : ""}">
          <button class="history-group-toggle" type="button" data-history-group-toggle="${escapeHtml(group.groupId)}">
            <span class="history-group-title">${escapeHtml(group.label)}</span>
            <span class="history-group-meta">${escapeHtml(group.orders.length)} 单 · 已完成 ${escapeHtml(formatMoney(getGroupCompletedRevenue(group.groupId)))}</span>
            <span class="history-group-date">${escapeHtml(group.meta)}</span>
          </button>
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
          <span>${escapeHtml(member.nickname || "微信用户")}${String(member.tag) === "tester" ? ` <span class="user-tag-chip">${escapeHtml(userTagLabel(member.tag))}</span>` : ""}</span>
          <span>${escapeHtml(formatMoney(getUserCompletedRevenue(member.id)))}</span>
        </div>
        <div class="row-line row-sub">
          <span>${escapeHtml(member.uuid || member.client_id || `ID ${member.id}`)}</span>
          <span>买 ${escapeHtml(member.order_count || 0)} 次 · ${escapeHtml(formatDate(member.last_order_at))}</span>
        </div>
      </button>
    `).join("");
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
        </div>
        ${order.notes ? `
          <div class="order-inline-section">
            <span class="order-inline-label">顾客备注</span>
            <div class="order-inline-note">${escapeHtml(order.notes)}</div>
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

    return `
      <div class="detail-head">
        <div>
          <p class="eyebrow">Order Detail</p>
          <h2 class="title detail-title">${escapeHtml(orderNumberLabel(order))} · ${escapeHtml(order.userNickname || "微信用户")}</h2>
          <p class="sub">${escapeHtml(order.orderNumber && order.orderNumber !== orderNumberLabel(order) ? order.orderNumber : "")}</p>
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
        <span class="pill">${escapeHtml(user.total_spent_text || "$0")}</span>
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
          <span>购买次数</span>
          <strong>${escapeHtml(user.order_count || 0)} 次</strong>
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
          <span>累计消费</span>
          <strong>${escapeHtml(user.total_spent_text || "$0")}</strong>
        </div>
        <div class="detail-meta">
          <span>最近下单时间</span>
          <strong>${escapeHtml(formatDate(user.last_order_at))}</strong>
        </div>
      </div>

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
    const dynamicGroups = (state.collectionGroups || []).map((group) => ({
      group: (group.title && group.title.zh) || group.category || "后台新增甜品",
      items: (group.items || []).map((item) => {
        const title = item.title || {};
        return {
          id: `dynamic-${item.id}`,
          zh: title.zh || item.title_zh || item.name || "未命名甜品",
          en: title.en || item.title_en || title.zh || item.title_zh || item.name || "Makkie Dessert",
          file: "",
          image_url: item.image || item.image_url || "",
          is_dynamic: true
        };
      })
    })).filter((group) => group.items.length);
    return [...COLLECTION_LIBRARY, ...dynamicGroups];
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

    return `
      <section class="section-block">
        <div class="detail-head">
          <div>
            <p class="eyebrow">Weekly Group</p>
            <h2 class="section-heading">编辑本周团购</h2>
          </div>
          <span class="pill">${weeklyOrder.is_open ? "开放中" : "未开放"}</span>
        </div>
        <form class="form-stack compact-form" id="weeklyOrderForm">
          <div class="inline-form-grid inline-form-grid--weekly">
            <label class="field">
              <span>标题</span>
              <input class="input" type="text" name="title" value="${escapeHtml(currentTitle)}" required>
            </label>
            ${renderDateTimeWheelField("weekly-order-start", "start_at", "开始时间", currentStartAt)}
            ${renderDateTimeWheelField("weekly-order-deadline", "order_deadline_at", "截单时间", currentDeadlineAt)}
            <label class="field">
              <span>开放状态</span>
              <select class="select" name="is_open">
                <option value="1" ${weeklyOrder.is_open ? "selected" : ""}>开放预定</option>
                <option value="0" ${weeklyOrder.is_open ? "" : "selected"}>暂不开放</option>
              </select>
            </label>
          </div>
          <div class="actions-row">
            <button class="button-secondary" type="submit">保存本周团购</button>
          </div>
        </form>
        <details class="collapsible-section compact-details">
          <summary class="collapsible-summary">
            <span>创建新团购</span>
            <small>${escapeHtml(defaultTitle)}</small>
          </summary>
          <form class="form-stack" id="weeklyOrderCreateForm">
            <div class="inline-form-grid inline-form-grid--weekly">
              <label class="field">
                <span>标题</span>
                <input class="input" type="text" name="title" value="${escapeHtml(defaultTitle)}" required>
              </label>
              ${renderDateTimeWheelField("weekly-order-create-start", "start_at", "开始时间", "")}
              ${renderDateTimeWheelField("weekly-order-create-deadline", "order_deadline_at", "截单时间", "")}
              <label class="field">
                <span>开放状态</span>
                <select class="select" name="is_open">
                  <option value="0" selected>暂不开放</option>
                  <option value="1">开放预定</option>
                </select>
              </label>
            </div>
            <div class="actions-row">
              <button class="button" type="submit">创建并切换</button>
            </div>
          </form>
        </details>
      </section>
      ${renderPickupSettings()}
      <section class="section-block">
        <div class="detail-head">
          <div>
            <p class="eyebrow">Weekly Products</p>
            <h2 class="section-heading">本周产品</h2>
          </div>
          <span class="pill">${escapeHtml(currentProducts.length)} 款</span>
        </div>

        <div class="current-product-list">
          ${currentProducts.length ? currentProducts.map((product) => `
            <form class="current-product-card" data-current-product-form="${escapeHtml(product.id)}">
              <div class="current-product-head">
                <div class="current-product-image-wrap ${product.image_url ? "" : "missing"}">
                  ${product.image_url
                    ? `<img class="current-product-image" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name || "")}" loading="lazy">`
                    : `<div class="current-product-image-missing">缺少图片</div>`
                  }
                </div>
                <div class="current-product-title-block">
                  <div class="row-line row-main">
                    <span>${escapeHtml(product.name)}</span>
                    <span>ID ${escapeHtml(product.id)}</span>
                  </div>
                  <div class="row-line row-sub">
                    <span>${escapeHtml(product.category || "Dessert")}</span>
                    <span>${product.image_url ? "图片已同步" : "必须上传图片"}</span>
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
              <label class="field">
                <span>${product.image_url ? "更新图片（会同步图鉴）" : "上传图片（必填，会同步图鉴）"}</span>
                <input class="input" type="file" name="image" accept="image/*" ${product.image_url ? "" : "required"}>
              </label>
              <div class="actions-row">
                <button class="button-secondary" type="submit">保存本周设置</button>
                <button class="button-secondary" type="button" data-product-unassign="${escapeHtml(product.id)}">移出本周</button>
              </div>
            </form>
          `).join("") : `<div class="empty">本周还没有选甜品。</div>`}
        </div>

        <div class="expandable-actions-grid">
          <details class="collapsible-section inner-section">
            <summary class="collapsible-summary">
              <span>从现有产品加入</span>
              <small>${escapeHtml(assignableProducts.length)} 款可选</small>
            </summary>
            <form class="form-stack" id="productAssignForm">
              <label class="field">
                <span>选择产品</span>
                <select class="select" name="product_id" required>
                  <option value="">请选择产品</option>
                  ${assignableProducts.map((product) => `
                    <option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} · ID ${escapeHtml(product.id)}</option>
                  `).join("")}
                </select>
              </label>
              <div class="actions-row">
                <button class="button-secondary" type="submit">加入本周</button>
              </div>
            </form>
          </details>

          <details class="collapsible-section inner-section">
            <summary class="collapsible-summary">
              <span>从图鉴创建</span>
              <small>选择旧图鉴甜品</small>
            </summary>
            <form class="form-stack" id="collectionCreateForm">
              <label class="field">
                <span>图鉴甜品</span>
                <select class="select" name="preset_id" required>
                  <option value="">请选择图鉴甜品</option>
                  ${renderCollectionOptions()}
                </select>
              </label>
              <div class="inline-form-grid inline-form-grid--three">
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
              </div>
              <div class="actions-row">
                <button class="button" type="submit">创建到本周</button>
              </div>
            </form>
          </details>

          <details class="collapsible-section inner-section">
            <summary class="collapsible-summary">
              <span>上传图片创建</span>
              <small>新甜品</small>
            </summary>
            <form class="form-stack" id="customCreateForm">
            <div class="inline-form-grid">
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
            </div>
            <label class="field">
              <span>描述</span>
              <textarea class="textarea textarea-compact" name="description"></textarea>
            </label>
            <label class="field">
              <span>商品图片</span>
              <input class="input" type="file" name="image" accept="image/*" required>
            </label>
            <div class="actions-row">
              <button class="button" type="submit">上传并创建到本周</button>
            </div>
            </form>
          </details>
        </div>
      </section>
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
    return ["pending", "paid", "making", "ready", "completed", "cancelled"].map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(statusLabel(value))}</option>
    `).join("");
  }

  function renderPaymentStatusOptions(current) {
    return ["non_paid", "paid", "refunded"].map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(paymentStatusLabel(value))}</option>
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
          <div class="filter-grid">
            <input class="input" id="userSearchInput" placeholder="搜索用户名 / UUID" value="${escapeHtml(state.filters.user_q)}">
            <button class="button-secondary" type="button" id="userFilterButton">搜索用户</button>
          </div>
          <div class="order-list">${renderUserList()}</div>
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
        <p class="eyebrow">${state.activeView === "history_orders" ? "History Groups" : "Current Week Orders"}</p>
        <div class="filter-grid">
          <input class="input" id="searchInput" placeholder="搜索昵称 / 订单号" value="${escapeHtml(state.filters.q)}">
          <select class="select" id="statusFilter">
            <option value="">全部订单状态</option>
            ${renderStatusOptions(state.filters.status)}
          </select>
          <select class="select" id="paymentFilter">
            <option value="">全部付款状态</option>
            ${renderPaymentStatusOptions(state.filters.payment_status)}
          </select>
          <button class="button-secondary" type="button" id="filterButton">应用筛选</button>
        </div>
        <div class="order-list">
          ${state.activeView === "history_orders"
            ? renderHistoryOrderGroups()
            : renderOrderList(getVisibleOrders(), "本周还没有订单。", true)
          }
        </div>
      </section>
    `;
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
    const totalRevenue = active.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

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

  function renderMainContent() {
    if (state.activeView === "weekly_manage") {
      return `<section class="admin-detail-card">${renderWeeklyOrderEditor()}</section>`;
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
      return `<div class="admin-main-stack">${renderHistoryRevenueChart()}<section class="admin-detail-card">${renderOrderDetail()}</section></div>`;
    }
    return `<section class="admin-detail-card">${renderOrderDetail()}</section>`;
  }

  function renderDashboard() {
    const isFullWidth = state.activeView === "weekly_manage";
    root.innerHTML = `
      <div class="admin-shell">
        <section class="admin-topbar">
          <div>
            <p class="eyebrow">Makkie Web Admin</p>
            <h1 class="title" style="font-size:38px;">网页后台</h1>
            <p class="sub">管理本周团购、历史订单、用户历史和产品历史。</p>
          </div>
          <div class="admin-topbar-actions">
            <button class="button-secondary sound-toggle ${state.soundEnabled ? "is-enabled" : ""}" type="button" id="enableSoundButton" ${state.soundEnabled ? "disabled" : ""}>
              ${state.soundEnabled ? "新订单声音已开启" : "开启新订单声音"}
            </button>
            <button class="button-secondary" type="button" id="refreshButton">刷新</button>
            <button class="button-secondary" type="button" id="logoutButton">退出登录</button>
          </div>
        </section>
        ${renderStats()}
        ${renderFlash()}
        ${renderViewTabs()}
        ${isFullWidth
          ? `<div class="admin-layout admin-layout--single">${renderMainContent()}</div>`
          : `<div class="admin-layout">
              ${renderSidebarContent()}
              ${renderMainContent()}
            </div>`
        }
      </div>
    `;
  }

  function ensureSelections() {
    const visibleOrders = getVisibleOrders();
    if (!visibleOrders.some((order) => Number(order.id) === Number(state.selectedOrderId))) {
      state.selectedOrderId = visibleOrders[0] ? visibleOrders[0].id : null;
    }
    if (state.activeView === "history_orders") {
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
      const [statsData, ordersData, pickupsData, weeklyOrderData, weeklyOrdersData, productsData, collectionData, usersData] = await Promise.all([
        api("/api/admin/stats"),
        api("/api/admin/orders"),
        api("/api/admin/pickup-locations"),
        api("/api/admin/weekly-order"),
        api("/api/admin/weekly-orders"),
        api("/api/admin/products"),
        api("/api/admin/collection"),
        api("/api/admin/users")
      ]);

      state.stats = statsData.stats || null;
      state.orders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
      state.pickups = Array.isArray(pickupsData.pickup_locations) ? pickupsData.pickup_locations : [];
      state.weeklyOrder = weeklyOrderData.weekly_order || null;
      state.weeklyOrders = Array.isArray(weeklyOrdersData.weekly_orders) ? weeklyOrdersData.weekly_orders : [];
      state.products = Array.isArray(productsData.products) ? productsData.products : [];
      state.collectionGroups = Array.isArray(collectionData.groups) ? collectionData.groups : [];
      state.members = Array.isArray(usersData.users) ? usersData.users : [];

      ensureSelections();
      render();
      await refreshUnseenCount({ silent: true });
      startUnseenPolling();
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
    await api("/api/admin/weekly-order", {
      method: "PATCH",
      body: {
        title: data.get("title") || "",
        start_at: readOptionalDateTime(data.get("start_at")),
        order_deadline_at: readOptionalDateTime(data.get("order_deadline_at")),
        is_open: String(data.get("is_open")) === "1"
      }
    });
    setFlash("success", "本周团购已保存。");
    await loadDashboard();
  }

  function applyUserFilter() {
    const input = document.getElementById("userSearchInput");
    state.filters.user_q = input ? input.value.trim() : "";
    const visibleMembers = getFilteredMembers();
    state.selectedUserId = visibleMembers[0] ? visibleMembers[0].id : null;
    render();
  }

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
  async function saveOrderAll(orderId, { status, payment_method, admin_comment }) {
    try {
      const payment_status = payment_method ? "paid" : "non_paid";
      await api(`/api/admin/orders/${orderId}/status`, { method: "PATCH", body: { status } });
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

  document.addEventListener("change", async (event) => {
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

    if (form.matches("[data-inline-form]")) {
      event.preventDefault();
      const formType = form.dataset.inlineForm;
      const orderId = form.dataset.orderId;
      const data = new FormData(form);
      if (formType === "all") {
        saveOrderAll(orderId, {
          status: data.get("status") || "pending",
          payment_method: data.get("payment_method") || "",
          admin_comment: data.get("admin_comment") || ""
        });
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
        saveOrderPatch(
          orderId,
          `/api/admin/orders/${orderId}/status`,
          { status: data.get("status") || "pending" },
          "订单状态已保存。"
        );
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

    if (form.id === "weeklyOrderForm") {
      event.preventDefault();
      saveWeeklyOrder(form).catch((error) => setFlash("error", error.message || "保存失败"));
      return;
    }

    if (form.id === "weeklyOrderCreateForm") {
      event.preventDefault();
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
    const dateTimeOpen = event.target.closest("[data-datetime-open]");
    const dateTimeClose = event.target.closest("[data-datetime-close]");
    const dateTimeConfirm = event.target.closest("[data-datetime-confirm]");
    const dateTimeClear = event.target.closest("[data-datetime-clear]");
    const wheelOption = event.target.closest("[data-wheel-option]");
    const expandButton = event.target.closest("[data-order-expand]");
    const orderButton = event.target.closest("[data-order-select]");
    const userButton = event.target.closest("[data-user-select]");
    const productButton = event.target.closest("[data-product-select]");
    const tabButton = event.target.closest("[data-view-tab]");
    const jumpButton = event.target.closest("[data-order-jump]");
    const deleteButton = event.target.closest("[data-product-delete]");
    const unassignButton = event.target.closest("[data-product-unassign]");
    const historyGroupToggle = event.target.closest("[data-history-group-toggle]");

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
      state.expandedCurrentOrders[orderId] = !state.expandedCurrentOrders[orderId];
      state.selectedOrderId = Number(orderId);
      render();
      return;
    }

    if (orderButton) {
      state.selectedOrderId = Number(orderButton.dataset.orderSelect);
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

    if (historyGroupToggle) {
      const groupId = String(historyGroupToggle.dataset.historyGroupToggle || "");
      state.expandedHistoryGroups[groupId] = !state.expandedHistoryGroups[groupId];
      render();
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

    if (event.target.id === "enableSoundButton") {
      enableNewOrderSound();
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
      stopUnseenPolling();
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
      return;
    }

    if (event.target.id === "userFilterButton") {
      applyUserFilter();
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

  document.addEventListener("keydown", (event) => {
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
  if (state.token) {
    loadDashboard();
  }
})();
