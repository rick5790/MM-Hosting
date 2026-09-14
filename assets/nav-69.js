(function initMakkieNav69() {
  const nav = document.querySelector('nav');
  const menuButton = document.getElementById('navMenuButton');
  const drawer = document.getElementById('mobileDrawer');
  const panel = drawer && drawer.querySelector('.mobile-drawer-panel');
  if (!nav || !menuButton || !drawer || !panel) return;

  nav.classList.add('nav-69');
  menuButton.setAttribute('aria-controls', 'mobileDrawer');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Makkie Mua navigation');

  const brandLabel = drawer.querySelector('.mobile-drawer-brand span');
  if (brandLabel) {
    brandLabel.id = brandLabel.id || 'mobileDrawerTitle';
    panel.setAttribute('aria-labelledby', brandLabel.id);
    panel.removeAttribute('aria-label');
  }

  const backdrop = drawer.querySelector('.mobile-drawer-backdrop');
  if (backdrop) backdrop.setAttribute('aria-hidden', 'true');

  if (!panel.querySelector('.mobile-drawer-visual')) {
    const visual = document.createElement('div');
    visual.className = 'mobile-drawer-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = `
      <img src="assets/images/cakes/quartet.jpg" alt="" loading="eager" decoding="async">
      <div class="mobile-drawer-visual-copy">
        <div class="mobile-drawer-visual-kicker">Butter off with Makkie</div>
        <div class="mobile-drawer-visual-title mobile-drawer-visual-title-zh">把甜点做成一段值得记住的风景。</div>
        <div class="mobile-drawer-visual-title mobile-drawer-visual-title-en">Desserts made to stay in your memory.</div>
      </div>`;
    panel.appendChild(visual);
  }

  let wasOpen = false;
  let opener = menuButton;
  let scrollbarGap = 0;

  function rememberOpeningState() {
    if (!drawer.classList.contains('is-open')) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : menuButton;
      scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    }
  }

  menuButton.addEventListener('pointerdown', rememberOpeningState, true);
  menuButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') rememberOpeningState();
  }, true);

  function getFocusable() {
    return Array.from(panel.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter((element) => !element.hidden && element.getClientRects().length > 0);
  }

  function syncDrawerState() {
    const isOpen = !drawer.hidden && drawer.classList.contains('is-open');
    if (isOpen === wasOpen) return;
    wasOpen = isOpen;

    if (isOpen) {
      document.body.style.setProperty('--nav-scrollbar-gap', `${scrollbarGap}px`);
      document.body.classList.add('nav-drawer-open');
      window.requestAnimationFrame(() => {
        const closeButton = panel.querySelector('.mobile-drawer-close');
        if (closeButton && !panel.contains(document.activeElement)) closeButton.focus({ preventScroll:true });
      });
    } else {
      document.body.classList.remove('nav-drawer-open');
      document.body.style.removeProperty('--nav-scrollbar-gap');
      if (opener && document.contains(opener)) opener.focus({ preventScroll:true });
    }
  }

  const observer = new MutationObserver(syncDrawerState);
  observer.observe(drawer, { attributes:true, attributeFilter:['class','hidden'] });

  drawer.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  syncDrawerState();
})();
