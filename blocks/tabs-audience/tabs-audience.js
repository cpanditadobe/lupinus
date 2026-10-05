import { toClassName } from '../../scripts/aem.js';

/*
 * Audience tabs: a tab bar whose panels are assembled from the page's following sections.
 *
 * Content model: one row per tab, 2 cells: [tab label] | [panel key], e.g.
 *   | Information for Patients | patient |
 *   | Information for HCPs     | hcp     |
 * If the key cell is omitted, the key is derived from the label. The first row whose key
 * is "patient" is the default tab (otherwise the first tab). Rows containing links (the
 * source's HCP confirmation gate) are ignored: no gate is rendered.
 *
 * Panels: every section after this block's section whose Section Metadata "Tab" (applied by
 * scripts.js as data-tab) matches a key is moved, in order, into that key's panel. Sections
 * are moved (never cloned), so blocks inside them still load normally through loadSections.
 * Collection stops at the next section containing another tabs-audience block.
 *
 * Hash handling (on load, on hashchange, and on clicks of same-page hash links):
 *   #<key> (case-insensitive, e.g. #HCP, #hcp, #patient) selects that tab and lands on the bar;
 *   #<id> of an element inside a panel selects that panel and scrolls to the element. Targets
 *   created later by blocks inside the panels are picked up once the sections finish loading.
 */

let instance = 0;

function getKey(row) {
  const cells = [...row.children];
  const label = cells[0];
  const keyText = cells[1]?.textContent.trim();
  return toClassName(keyText || label?.textContent.trim() || '');
}

/** Resolves when every section in main has loaded (or after a timeout). */
function whenSectionsLoaded(main, timeout = 15000) {
  return new Promise((resolve) => {
    const done = () => [...main.querySelectorAll('.section')]
      .every((s) => s.dataset.sectionStatus === 'loaded');
    if (done()) {
      resolve();
      return;
    }
    let timer;
    const observer = new MutationObserver(() => {
      if (!done()) return;
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    });
    observer.observe(main, { subtree: true, attributes: true, attributeFilter: ['data-section-status'] });
    timer = setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  instance += 1;
  const prefix = `tabs-audience-${instance}`;
  const section = block.closest('.section');
  const main = section?.parentElement || block.closest('main');

  // ---- tab definitions ----
  const tabs = [];
  [...block.children].forEach((row) => {
    if (row.querySelector('a[href]')) return; // gate row (dropped)
    const labelCell = row.children[0];
    const key = getKey(row);
    if (!labelCell || !key || tabs.some((t) => t.key === key)) return;
    tabs.push({ key, label: [...labelCell.childNodes] });
  });
  if (!tabs.length) {
    block.replaceChildren();
    return;
  }

  // ---- tab bar ----
  const tablist = document.createElement('div');
  tablist.className = 'tabs-audience-list';
  tablist.setAttribute('role', 'tablist');

  tabs.forEach((tab, i) => {
    tab.button = document.createElement('button');
    tab.button.type = 'button';
    tab.button.className = 'tabs-audience-tab';
    tab.button.id = `${prefix}-tab-${tab.key}`;
    tab.button.dataset.tab = tab.key;
    tab.button.setAttribute('role', 'tab');
    tab.button.setAttribute('aria-controls', `${prefix}-panel-${tab.key}`);
    // a single paragraph label: keep its inline content only
    const nodes = tab.label.filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim());
    if (nodes.length === 1 && nodes[0].tagName === 'P') tab.button.append(...nodes[0].childNodes);
    else tab.button.append(...tab.label);

    tab.panel = document.createElement('div');
    tab.panel.className = 'tabs-audience-panel';
    tab.panel.id = `${prefix}-panel-${tab.key}`;
    tab.panel.dataset.tab = tab.key;
    tab.panel.setAttribute('role', 'tabpanel');
    tab.panel.setAttribute('aria-labelledby', tab.button.id);
    tab.index = i;
    tablist.append(tab.button);
  });
  block.replaceChildren(tablist);

  // ---- move the following tagged sections into the panels ----
  const panels = tabs.map((t) => t.panel);
  if (section && main) {
    let next = section.nextElementSibling;
    while (next) {
      const current = next;
      next = next.nextElementSibling;
      if (current.classList.contains('section')) {
        if (current.querySelector('.tabs-audience')) break;
        const key = current.dataset.tab ? toClassName(current.dataset.tab) : '';
        const tab = tabs.find((t) => t.key === key);
        if (tab) tab.panel.append(current);
      }
    }
    section.after(...panels);
  } else {
    block.append(...panels);
  }

  // ---- selection ----
  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.button.setAttribute('aria-selected', on);
      t.button.tabIndex = on ? 0 : -1;
      t.panel.hidden = !on;
    });
    block.dataset.activeTab = tab.key;
    if (focus) tab.button.focus();
  };

  tabs.forEach((tab) => tab.button.addEventListener('click', () => select(tab)));

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.findIndex((t) => t.button === document.activeElement);
    if (current < 0) return;
    let target = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') target = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') target = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = tabs.length - 1;
    if (target === null) return;
    e.preventDefault();
    select(tabs[target], true);
  });

  /**
   * Maps a hash id to { tab, target, exact }: `exact` tells whether the browser can scroll to
   * the id on its own (an element with exactly that id exists).
   */
  const resolve = (id) => {
    if (!id) return null;
    const el = document.getElementById(id);
    const panelTab = el && tabs.find((t) => t.panel.contains(el));
    if (panelTab) return { tab: panelTab, target: el, exact: true };
    const keyTab = tabs.find((t) => t.key === toClassName(id));
    if (keyTab) return { tab: keyTab, target: section || block, exact: !!el };
    return null;
  };

  const currentId = () => {
    try {
      return decodeURIComponent(window.location.hash.slice(1));
    } catch (e) {
      return window.location.hash.slice(1);
    }
  };

  const applyHash = (scroll) => {
    const hit = resolve(currentId());
    if (!hit) return false;
    select(hit.tab);
    if (scroll) hit.target.scrollIntoView();
    return true;
  };

  select(tabs.find((t) => t.key === 'patient') || tabs[0]);

  // on load: select now (scripts.js scrolls to exact ids after sections load); targets that
  // do not exist yet, or key aliases like #hcp, are resolved and scrolled once loading is done
  if (window.location.hash) {
    const early = resolve(currentId());
    if (early) select(early.tab);
    if (main && (!early || !early.exact)) {
      whenSectionsLoaded(main).then(() => {
        if (applyHash(false)) {
          // let the page settle (fonts, images) before landing on the target
          const land = () => resolve(currentId())?.target.scrollIntoView();
          requestAnimationFrame(land);
          if (document.readyState !== 'complete') window.addEventListener('load', land, { once: true });
        }
      });
    }
  }

  window.addEventListener('hashchange', () => applyHash(true));

  // same-page links whose hash equals the current one fire no hashchange
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('a[href*="#"]');
    if (!link || e.defaultPrevented) return;
    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (err) {
      return;
    }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
    let id = url.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (err) { /* keep raw */ }
    const hit = resolve(id);
    if (!hit) return;
    select(hit.tab);
    if (!hit.exact || url.hash === window.location.hash) {
      e.preventDefault();
      if (url.hash !== window.location.hash) window.history.pushState(null, '', url.hash);
      hit.target.scrollIntoView();
    }
  });
}
