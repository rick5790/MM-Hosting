const fs = require("fs");
const path = require("path");

const adminDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "..", "public-admin");
const jsPath = path.join(adminDir, "admin.js");
const cssPath = path.join(adminDir, "admin.css");
const indexPath = path.join(adminDir, "index.html");

for (const filePath of [jsPath, cssPath, indexPath]) {
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL missing file: ${filePath}`);
    process.exit(1);
  }
}

const js = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const index = fs.readFileSync(indexPath, "utf8");
const checks = [
  ["订单搜索", js, ["id=\"searchInput\"", "state.filters.q", "renderKeepingFocus(\"searchInput\")"]],
  ["订单/付款状态筛选", js, ["id=\"orderFilter\"", "state.filters.payment_status", "ORDER_STATUS_VALUES"]],
  ["动态取货地点筛选", js, ["pickup_location", "getPickupFilterOptions", "id=\"pickupLocationFilter\"", "getOrderPickupFilterValue(order)"]],
  ["按用户分组", js, ["id=\"groupByUser\"", "state.orderGroupBy", "renderOrdersGroupedByUser"]],
  ["批量标记", js, ["data-batch-toggle", "data-batch-apply", "applyBatchStatus"]],
  ["一键完成", js, ["data-order-quick-complete", "订单已标记为已完成"]],
  ["订单栏触摸调宽", js, ["data-resize-handle", "pointerdown", "pointermove", "pointercancel", "setPointerCapture", "getSidebarResizeBounds"]],
  ["活动单状态", js, ["activity: \"活动单\"", "ORDER_STATUS_VALUES"]],
  ["自提点开放开关", js, ["data-pickup-active-input", "is_active: data.get(\"is_active\")"]],
  ["关联用户订单", js, ["linked_user_ids", "orderBelongsToMember"]],
  ["用户合并入口", js, ["id=\"userLinkForm\"", "secondary_user_id", "/link", "确认关联并合并余额"]],
  ["用户合并搜索", js, ["id=\"userLinkSearchInput\"", "data-user-link-candidate", "data-user-link-search", "candidate.style.display", "找到 ${visibleCount} 个账号"]],
  ["用户默认普通客户", js, ["user_tag: \"user\"", "id=\"userTagFilter\"", ">普通客户</option>", "tagFilter === \"user\""]],
  ["用户关联长按移除", js, ["data-linked-user-remove", "linkedUserLongPress", "requestUserUnlink", "pointercancel", "method: \"DELETE\""]],
  ["账户余额付款", js, ["[\"deposit\", \"账户余额\"]", "deposit_applied", "amount_due"]],
  ["蛋糕询单数据", js, ["cakeOrders: []", "/api/admin/cake-orders", "selectedCakeOrderId"]],
  ["蛋糕询单标签页", js, ["[\"cake_orders\", \"蛋糕询单\"]", "renderCakeOrderList", "renderCakeOrderDetail"]],
  ["蛋糕询单筛选", js, ["id=\"cakeSearchInput\"", "id=\"cakeStatusFilter\"", "id=\"cakePickupDateFilter\"", "id=\"cakeSortSelect\""]],
  ["询单与历史订单默认空白", js, ["function clearSelectedCakeOrder()", "state.activeView === \"current_orders\" ? (orders[0] || null) : null", "state.selectedOrderId = null", "state.selectedCakeOrderId = null", "state.historyDetailType = \"order\""]],
  ["蛋糕询单保存", js, ["id=\"cakeStatusForm\"", "id=\"cakePickupDateForm\"", "/pickup-date"]],
  ["取消原因", js, ["resolveCancelReason", "cancel_reason", "cancel-reason-overlay"]],
  ["分析多选分类", js, ["analytics_categories", "data-analytics-category", "selectedCategories"]],
  ["Donut 明细", js, ["analytics-donut-segment", "data-donut-value", "setDonutCenterFromSegment"]],
  ["完整甜品排行滚动", js, ["analytics-ranking-list", "全部甜品销量排行，可上下滑动查看"]],
  ["四重奏销量别名合并", js, ["getAnalyticsCanonicalProductName", "四重奏生日蛋糕", "稻香米奶油四重奏", "不把“稻香米麻薯四重奏戚风三明治”"]],
  ["历史订单手动补录", js, ["data-manual-order-open", "openManualOrderDialog", "/api/admin/orders/manual", "确认添加订单", "本周商品库存不会改变"]],
  ["手动订单客户搜索", js, ["data-manual-user-search", "data-manual-user-pick", "自动建立一个普通客户账号"]],
  ["手动订单甜品蛋糕图鉴", js, ["getManualCatalogItems", "cakeCatalog: []", "蛋糕图鉴", "data-manual-product", "data-cake-id", "collection_item_id", "cake_id"]],
  ["手动订单默认空白", js, ["data-manual-order-items></div>", "data-manual-order-empty", "请至少添加一项甜品或蛋糕商品"]],
  ["手动订单编号日期", js, ["name=\"group_id\"", "name=\"group_order_number\"", "name=\"created_at\""]],
  ["手动团购标题成交自提日期", js, ["name=\"group_title\"", "name=\"group_date\"", "name=\"pickup_date\"", "商品成交日期", "自提日期", "manualOrderGroups: []", "/api/admin/manual-order-groups", "data-manual-group-edit"]],
  ["手动团购同步分析", js, ["manualGroup.order_date", "商品成交日期只认团购元数据", "group_label: getHistoryGroupLabel", "latest.label"]],
  ["已完成蛋糕归入历史营收", js, ["getCompletedCakeHistoryOrders", "getCompletedCakeHistoryOrders(false)", "history_entry_type: \"cake\"", "data-history-cake-select", "按原始下单日期自动加入历史订单和营收分析"]],
  ["历史团购铅笔编辑", js, ["aria-label=\"编辑团购标题和日期\"", ">✎</button>"]],
  ["历史团购操作图标同排", css, [".history-group-toggle::after", "top: 15px", "right: 15px", ".history-group-edit"]],
  ["活动单样式", css, [".status-tag.status-activity"]],
  ["蛋糕询单样式", css, [".cake-filter-grid", ".cake-order-safety-note"]],
  ["取消原因样式", css, [".cancel-reason-overlay", ".cancel-reason-panel"]],
  ["用户合并样式", css, [".linked-user-list", ".user-link-block"]],
  ["余额与重复账号默认折叠", js, ["<details class=\"collapsible-section user-profile-fold\">", "<details class=\"collapsible-section user-link-block\">", "当前余额"]],
  ["本次团购默认折叠摘要", js, ["weekly-editor-card collapsible-section weekly-editor-fold", "weekly-editor-fold-meta", "data-weekly-start", "weekly-status-pill"]],
  ["本次团购折叠与新一期手机布局", css, [".weekly-editor-summary", ".weekly-editor-fold-meta", ".weekly-create-summary", "grid-template-columns: 44px minmax(0, 1fr)"]],
  ["用户关联移除样式", css, [".linked-user-chip.is-removable", ".linked-user-chip.is-removable.is-pressing", "touch-action: pan-y", ".linked-user-remove-hint"]],
  ["用户搜索结果样式", css, [".user-link-search-results", ".user-link-search-result", ".user-link-search-result[hidden]", "max-height: 280px"]],
  ["排行内部滚动", css, [".analytics-ranking-list", "overflow-y: auto"]],
  ["历史订单补录样式", css, [".manual-order-overlay", ".manual-order-panel", ".manual-order-item", ".manual-order-empty-hint", ".manual-order-actions"]],
  ["手动订单手机防溢出", css, ["min-inline-size: 0", "max-inline-size: 100%", "input[type=\"datetime-local\"]", "overflow-x: clip", "grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)"]],
  ["手动团购编辑样式", css, [".history-group-head", ".history-group-edit", ".manual-group-panel"]],
  ["iPad 调宽样式", css, [".admin-resize-handle", "touch-action: none", "@media (max-width: 899px)", "calc(100% - 370px)"]],
  ["美化登录页结构", js, ["is-login-mode", "admin-login-visual", "magicRingsMount", "data-login-password-toggle"]],
  ["美化登录页样式", css, [".admin-app.is-login-mode", ".login-brand-lockup", ".login-submit", ".magic-rings-container"]],
  ["登录页资源", index, ["@phosphor-icons/web", "three.min.js", "magic-rings.js", "Makkie%20new%20order.mp3"]]
];

let failed = false;
for (const [name, source, needles] of checks) {
  const missing = needles.filter((needle) => !source.includes(needle));
  if (missing.length) {
    failed = true;
    console.error(`FAIL ${name}: ${missing.join(", ")}`);
  } else {
    console.log(`PASS ${name}`);
  }
}

const forbiddenChecks = [
  ["订单详情重复小编号", js, "order.orderNumber && order.orderNumber !== orderNumberLabel(order)"],
  ["历史团购文字编辑按钮", js, ">编辑标题 / 日期</button>"],
  ["刷新后声音再次解锁播放", js, "primeSoundOnFirstGesture"],
  ["蛋糕询单自动选第一条", js, "selectFirstVisibleCakeOrder"]
];
for (const [name, source, needle] of forbiddenChecks) {
  if (source.includes(needle)) {
    failed = true;
    console.error(`FAIL ${name}: still contains ${needle}`);
  } else {
    console.log(`PASS ${name}`);
  }
}

if (failed) process.exit(1);
console.log(`PASS all ${checks.length} admin UI contracts`);
