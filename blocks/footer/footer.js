/*
 * Footer: lead column, link columns and a bottom bar, built from the footer fragment.
 *
 * Fragment (content/footer.plain.html locally, /footer.plain.html on the site): one top-level
 * <div> per column. The first div is the lead column (address, contacts, social links), the last
 * div is the bottom bar (copyright), every div in between is a link column. Bold paragraphs
 * (<p><strong>…</strong></p>) are column/group headings.
 *
 * Links ending in "#_blank" open in a new tab (authored marker, removed from the href).
 * The back-to-top arrow and the background flower are decorative block assets.
 */

const NEW_TAB_MARKER = '#_blank';

/** metadata-independent fetch: localhost serves content under /content, the site at the root */
async function fetchFooterFragment() {
  const local = window.location.hostname === 'localhost';
  let resp = local ? await fetch('/content/footer.plain.html') : await fetch('/footer.plain.html');
  if (!resp.ok) resp = local ? await fetch('/footer.plain.html') : await fetch('/content/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  // media in the fragment is relative to the fragment, not to the page showing the footer
  fragment.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    if (el.hasAttribute('src')) el.src = new URL(el.getAttribute('src'), resp.url).href;
    if (el.hasAttribute('srcset')) {
      el.srcset = el.getAttribute('srcset').split(',')
        .map((c) => { const [u, d] = c.trim().split(/\s+/); return `${new URL(u, resp.url).href}${d ? ` ${d}` : ''}`; })
        .join(', ');
    }
  });
  return fragment;
}

function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.endsWith(NEW_TAB_MARKER)) {
      a.setAttribute('href', href.slice(0, -NEW_TAB_MARKER.length));
      a.target = '_blank';
      a.rel = 'noopener';
    }
    if (a.querySelector('img') && !a.textContent.trim()) {
      a.classList.add('footer-icon-link');
      a.setAttribute('aria-label', a.querySelector('img').alt || a.href);
    }
  });
}

/** bold paragraphs are headings; a heading whose whole content is a link is a heading link */
function decorateHeadings(column) {
  column.querySelectorAll(':scope > p').forEach((p) => {
    const strong = p.querySelector(':scope > strong');
    if (strong && p.textContent.trim() === strong.textContent.trim()) p.classList.add('footer-heading');
  });
}

function buildBackToTop() {
  const link = document.createElement('a');
  link.className = 'footer-back-to-top';
  link.href = '#';
  link.setAttribute('aria-label', 'Back to top');
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/blocks/footer/chevron-up.webp`;
  img.alt = '';
  img.width = 28;
  img.height = 28;
  img.loading = 'lazy';
  link.append(img);
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
  return link;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const columns = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const bottom = columns.length > 1 ? columns.pop() : null;
  const lead = columns.shift();

  const main = document.createElement('div');
  main.className = 'footer-main';
  if (lead) {
    lead.className = 'footer-lead';
    main.append(lead);
  }
  if (columns.length) {
    const nav = document.createElement('nav');
    nav.className = 'footer-links';
    nav.setAttribute('aria-label', 'Footer');
    columns.forEach((col) => {
      col.className = 'footer-column';
      decorateHeadings(col);
      nav.append(col);
    });
    main.append(nav);
  }
  if (lead) decorateHeadings(lead);

  const content = [main];
  if (bottom) {
    bottom.className = 'footer-bottom';
    content.push(bottom);
  }
  content.forEach(decorateLinks);
  block.append(buildBackToTop(), ...content);
}
