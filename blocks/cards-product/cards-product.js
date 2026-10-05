import { createOptimizedPicture } from '../../scripts/aem.js';

const PAGE_SIZE = 12;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  return node;
}

/**
 * Turn one authored row into a product card record.
 * Cells: [image] | [linked heading + PDF links] | [optional category text]
 * Authors may omit the image cell or the category cell.
 */
function buildItem(row) {
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture') && !c.querySelector('h1, h2, h3, h4, h5, h6'));
  const bodyCell = cells.find((c) => c !== imageCell && c.textContent.trim()) || null;
  const extraCells = cells.filter((c) => c !== imageCell && c !== bodyCell && c.textContent.trim());
  const category = extraCells.map((c) => c.textContent.trim()).join(', ');

  const li = el('li', 'cards-product-item');
  const heading = bodyCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const headingLink = heading?.querySelector('a') || heading?.closest('a') || null;
  const name = (heading || bodyCell)?.textContent.trim() || '';
  const detailHref = headingLink?.getAttribute('href') || '';

  // image + "view more" CTA
  const media = el(detailHref ? 'a' : 'div', 'cards-product-image');
  if (detailHref) {
    media.href = detailHref;
    media.setAttribute('aria-label', name);
  }
  const img = imageCell?.querySelector('picture img');
  if (img) {
    // createOptimizedPicture keeps only the pathname, which breaks cross-origin
    // image URLs that carry their identity in the query string; reuse those as authored.
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    if (sameOrigin) {
      media.append(createOptimizedPicture(img.src, img.alt || name, false, [{ width: '500' }]));
    } else {
      if (!img.alt) img.alt = name;
      img.loading = 'lazy';
      media.append(img.closest('picture'));
    }
  } else {
    media.classList.add('cards-product-image-empty');
  }
  if (detailHref) media.append(el('span', 'cards-product-cta', { text: 'View more' }));
  li.append(media);

  // body: heading + pdf links
  const body = el('div', 'cards-product-body');
  if (bodyCell) {
    while (bodyCell.firstChild) body.append(bodyCell.firstChild);
    const links = [...body.querySelectorAll('a')].filter((a) => !heading || !heading.contains(a));
    if (links.length) {
      const list = el('ul', 'cards-product-links');
      links.forEach((a) => {
        const item = el('li');
        a.classList.remove('button');
        a.parentElement?.classList.remove('button-container');
        item.append(a);
        list.append(item);
      });
      // remove now-empty wrappers left behind by moved links
      body.querySelectorAll('p').forEach((p) => { if (!p.textContent.trim() && !p.querySelector('picture')) p.remove(); });
      body.append(list);
    }
  }
  li.append(body);

  return {
    li,
    name,
    letter: (name.match(/[A-Za-z]/)?.[0] || '').toUpperCase(),
    category,
    text: li.textContent.toLowerCase(),
  };
}

export default function decorate(block) {
  const items = [...block.children]
    .filter((row) => row.textContent.trim() || row.querySelector('picture'))
    .map(buildItem);

  const state = {
    name: '', brand: '', ndc: '', letter: '', category: '', page: 1,
  };
  const layout = 'grid';

  /* ---------- filters ---------- */
  const filters = el('div', 'cards-product-filters');

  const searchWrap = el('div', 'cards-product-search');
  searchWrap.append(el('p', 'cards-product-filter-title', { text: 'Search Product Catalog' }));
  const form = el('form', 'cards-product-form');
  const inputs = {};
  [['name', 'Product name'], ['brand', 'Brand name'], ['ndc', 'NDC']].forEach(([key, label]) => {
    const input = el('input', `cards-product-input cards-product-input-${key}`, {
      type: 'search', name: key, placeholder: label, 'aria-label': label,
    });
    inputs[key] = input;
    form.append(input);
  });
  const submit = el('button', 'cards-product-submit', { type: 'submit', text: 'Submit' });
  const clear = el('button', 'cards-product-clear', { type: 'reset', text: 'Clear' });
  form.append(submit, clear);
  searchWrap.append(form);
  filters.append(searchWrap);

  const categories = [...new Set(items.flatMap((i) => i.category.split(',').map((c) => c.trim()).filter(Boolean)))];
  let categorySelect;
  if (categories.length) {
    const catWrap = el('div', 'cards-product-categories');
    catWrap.append(el('p', 'cards-product-filter-title', { text: 'Filter by Category' }));
    const catList = el('ul', 'cards-product-category-list');
    ['', ...categories].forEach((cat) => {
      const li = el('li');
      const btn = el('button', 'cards-product-category', { type: 'button', 'data-category': cat, text: cat || 'All products' });
      li.append(btn);
      catList.append(li);
    });
    catWrap.append(catList);
    filters.append(catWrap);

    categorySelect = el('select', 'cards-product-category-select', { 'aria-label': 'Select category' });
    ['', ...categories].forEach((cat) => {
      categorySelect.append(el('option', '', { value: cat, text: cat || 'Select category' }));
    });
  }

  const letterWrap = el('div', 'cards-product-letters');
  letterWrap.append(el('p', 'cards-product-filter-title', { text: 'Filter by Letters' }));
  const letterList = el('ul', 'cards-product-letter-list');
  const available = new Set(items.map((i) => i.letter));
  LETTERS.forEach((letter) => {
    const li = el('li');
    const btn = el('button', 'cards-product-letter', { type: 'button', 'data-letter': letter, text: letter });
    if (!available.has(letter)) btn.disabled = true;
    li.append(btn);
    letterList.append(li);
  });
  letterWrap.append(letterList);
  filters.append(letterWrap);

  /* ---------- toolbar ---------- */
  const toolbar = el('div', 'cards-product-toolbar');
  const count = el('p', 'cards-product-count', { 'aria-live': 'polite' });
  const toggle = el('div', 'cards-product-view-toggle', { role: 'group', 'aria-label': 'View' });
  const gridBtn = el('button', 'cards-product-view', { type: 'button', 'data-view': 'grid', text: 'Grid' });
  const listBtn = el('button', 'cards-product-view', { type: 'button', 'data-view': 'list', text: 'List' });
  toggle.append(gridBtn, listBtn);
  toolbar.append(count, toggle);
  if (categorySelect) toolbar.append(categorySelect);

  /* ---------- results + pagination ---------- */
  const list = el('ul', 'cards-product-list');
  const pagination = el('nav', 'cards-product-pagination', { 'aria-label': 'Pagination' });
  const empty = el('p', 'cards-product-empty', { text: 'No products found.' });

  function setView(view) {
    block.classList.toggle('cards-product-view-list', view === 'list');
    gridBtn.setAttribute('aria-pressed', view === 'grid');
    listBtn.setAttribute('aria-pressed', view === 'list');
  }

  function matches(item) {
    if (state.name && !item.name.toLowerCase().includes(state.name)) return false;
    if (state.brand && !item.text.includes(state.brand)) return false;
    if (state.ndc && !item.text.replace(/-/g, '').includes(state.ndc.replace(/-/g, ''))) return false;
    if (state.letter && item.letter !== state.letter) return false;
    if (state.category && !item.category.split(',').map((c) => c.trim()).includes(state.category)) return false;
    return true;
  }

  function renderPagination(totalPages) {
    pagination.replaceChildren();
    if (totalPages <= 1) return;
    const add = (label, page, extraClass = '', disabled = false) => {
      const btn = el('button', `cards-product-page ${extraClass}`.trim(), { type: 'button', 'data-page': page, text: label });
      if (page === state.page && !extraClass) btn.setAttribute('aria-current', 'page');
      btn.disabled = disabled;
      pagination.append(btn);
    };
    add('Previous', state.page - 1, 'cards-product-page-prev', state.page === 1);
    for (let p = 1; p <= totalPages; p += 1) {
      if (p === 1 || p === totalPages || Math.abs(p - state.page) <= 2) add(String(p), p);
      else if (Math.abs(p - state.page) === 3) pagination.append(el('span', 'cards-product-page-gap', { text: '…' }));
    }
    add('Next', state.page + 1, 'cards-product-page-next', state.page === totalPages);
  }

  function render() {
    const results = items.filter(matches);
    const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    list.replaceChildren(...results.slice(start, start + PAGE_SIZE).map((i) => i.li));
    count.replaceChildren(
      el('span', 'cards-product-count-number', { text: String(results.length) }),
      ' items found',
    );
    empty.hidden = results.length > 0;
    renderPagination(totalPages);
    block.querySelectorAll('.cards-product-letter').forEach((b) => b.setAttribute('aria-pressed', b.dataset.letter === state.letter));
    block.querySelectorAll('.cards-product-category').forEach((b) => b.setAttribute('aria-pressed', b.dataset.category === state.category));
    if (categorySelect) categorySelect.value = state.category;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Object.keys(inputs).forEach((k) => { state[k] = inputs[k].value.trim().toLowerCase(); });
    state.page = 1;
    render();
  });
  form.addEventListener('reset', () => {
    Object.assign(state, {
      name: '', brand: '', ndc: '', letter: '', category: '', page: 1,
    });
    // let the native reset clear inputs first
    setTimeout(render);
  });
  letterList.addEventListener('click', (e) => {
    const btn = e.target.closest('.cards-product-letter');
    if (!btn) return;
    state.letter = state.letter === btn.dataset.letter ? '' : btn.dataset.letter;
    state.page = 1;
    render();
  });
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.cards-product-category');
    if (!btn) return;
    state.category = btn.dataset.category;
    state.page = 1;
    render();
  });
  categorySelect?.addEventListener('change', () => {
    state.category = categorySelect.value;
    state.page = 1;
    render();
  });
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.cards-product-view');
    if (btn) setView(btn.dataset.view);
  });
  pagination.addEventListener('click', (e) => {
    const btn = e.target.closest('.cards-product-page');
    if (!btn || btn.disabled) return;
    state.page = Number(btn.dataset.page);
    render();
    toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  block.replaceChildren(filters, toolbar, list, empty, pagination);
  setView(layout);
  render();
}
