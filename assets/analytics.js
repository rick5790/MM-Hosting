(function () {
  'use strict';

  const MEASUREMENT_ID = 'G-TTK9YKP3GT';
  const CURRENCY = 'USD';
  const viewedLists = new Set();

  if (window.MakkieAnalytics) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)) {
    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    googleTag.dataset.makkieAnalytics = 'true';
    document.head.appendChild(googleTag);
  }

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  function money(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
  }

  function itemPrice(item) {
    if (!item) return 0;
    if (Number.isFinite(Number(item.unitPrice))) return money(item.unitPrice);
    if (Number.isFinite(Number(item.unit_price))) return money(item.unit_price);
    if (Number.isFinite(Number(item.price))) return money(item.price);
    const match = String(item.price || item.price_text || '').match(/[\d.]+/);
    return match ? money(match[0]) : 0;
  }

  function normalizeItem(item, quantityOverride) {
    const quantity = Math.max(1, Number(quantityOverride ?? (item && item.quantity)) || 1);
    const itemId = item && (item.productId || item.product_id || item.id || item.cake_id || item.slug);
    const itemName = item && (item.title || item.product_name || item.name);
    const normalized = {
      item_id: String(itemId || itemName || 'unknown-item'),
      item_name: String(itemName || itemId || 'Unknown item'),
      price: itemPrice(item),
      quantity
    };
    const category = item && (item.category || item.category_name);
    const variant = item && (item.variant || item.flavor);
    if (category) normalized.item_category = String(category);
    if (variant) normalized.item_variant = String(variant);
    return normalized;
  }

  function normalizeItems(items) {
    return (Array.isArray(items) ? items : []).map((item) => normalizeItem(item));
  }

  function itemsValue(items) {
    return normalizeItems(items).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function send(name, parameters) {
    window.gtag('event', name, parameters || {});
  }

  function cartChange(product, delta) {
    const quantity = Math.abs(Number(delta) || 0);
    if (!product || !quantity) return;
    const item = normalizeItem(product, quantity);
    send(delta > 0 ? 'add_to_cart' : 'remove_from_cart', {
      currency: CURRENCY,
      value: money(item.price * item.quantity),
      items: [item]
    });
  }

  function viewItemList(items, listId) {
    const normalized = normalizeItems(items);
    if (!normalized.length) return;
    const itemListId = String(listId || 'weekly_menu');
    const signature = `${itemListId}:${normalized.map((item) => item.item_id).join(',')}`;
    if (viewedLists.has(signature)) return;
    viewedLists.add(signature);
    send('view_item_list', {
      item_list_id: itemListId,
      item_list_name: 'Weekly menu',
      items: normalized.map((item, index) => ({ ...item, index }))
    });
  }

  function beginCheckout(items, pickupLocation) {
    const normalized = normalizeItems(items);
    if (!normalized.length) return;
    const parameters = {
      currency: CURRENCY,
      value: money(itemsValue(items)),
      items: normalized
    };
    if (pickupLocation) parameters.pickup_location = String(pickupLocation);
    send('begin_checkout', parameters);
  }

  function purchase(order, items, pickupLocation) {
    const source = order || {};
    const transactionId = source.transaction_id || source.order_number || source.order_no
      || source.orderNumber || source.orderId || source.order_id || source.uuid || source.id;
    if (!transactionId) {
      console.warn('[Makkie Analytics] purchase skipped: missing transaction id');
      return;
    }

    const storageKey = `makkie.ga.purchase.${transactionId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
    } catch (error) {}

    const normalized = normalizeItems(items);
    const backendTotal = Number(source.total_amount ?? source.totalAmount);
    const parameters = {
      transaction_id: String(transactionId),
      currency: CURRENCY,
      value: money(Number.isFinite(backendTotal) ? backendTotal : itemsValue(items)),
      items: normalized
    };
    if (pickupLocation) parameters.pickup_location = String(pickupLocation);
    send('purchase', parameters);
  }

  function cakeInquiry(cake, value) {
    if (!cake) return;
    send('generate_lead', {
      currency: CURRENCY,
      value: money(value ?? cake.price),
      lead_source: 'cake_inquiry',
      cake_id: String(cake.id || cake.name || 'cake')
    });
  }

  window.MakkieAnalytics = Object.freeze({
    send,
    viewItemList,
    cartChange,
    beginCheckout,
    purchase,
    cakeInquiry
  });
})();
