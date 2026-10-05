import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/*
 * Hero map: page-title banner over an illustrated world map with positioned affiliate markers.
 *
 * Content model:
 *   Row 1 (1 cell): h1 (any other text is kept with the heading); an optional map picture
 *   replaces the bundled world-map.svg.
 *   Rows 2..n (3 cells): [country code, e.g. CA] | [company logo picture + flag picture] | [link].
 *
 * Marker positions are keyed on the country code in hero-map.css (.marker-<code>), so authors
 * never enter coordinates. Codes without a CSS position are listed below the map instead of
 * being dropped. The red pin graphic is a block asset (pin.webp), not authored.
 */

// country codes that have a position in hero-map.css
const PLACED_CODES = ['ca', 'us', 'mx', 'br', 'uk', 'nl', 'ge', 'ch', 'fr', 'sa', 'in', 'ph', 'au'];

const CODE_PATTERN = /^[a-z]{2,3}$/i;

function isSameOrigin(img) {
  try {
    return new URL(img.src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * createOptimizedPicture rewrites the query string, which breaks external image services
 * (e.g. /_next/image?url=...), so only optimize same-origin images.
 */
function optimize(picture, eager, breakpoints) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  if (isSameOrigin(img)) {
    return createOptimizedPicture(img.src, img.alt || '', eager, breakpoints);
  }
  if (eager) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  } else {
    img.loading = 'lazy';
  }
  return picture;
}

function buildMarker(row) {
  const cells = [...row.children];
  const codeCell = cells.find((c) => CODE_PATTERN.test(c.textContent.trim()) && !c.querySelector('picture, a'));
  const code = codeCell ? toClassName(codeCell.textContent.trim()) : '';
  const pictures = [...row.querySelectorAll('picture')];
  const link = row.querySelector('a[href]');
  const href = link?.getAttribute('href') || '';
  const isLink = href && href !== '#';

  const li = document.createElement('li');
  li.className = 'hero-map-marker';
  if (code) {
    li.classList.add(`marker-${code}`);
    li.dataset.code = code.toUpperCase();
  }

  const target = document.createElement(isLink ? 'a' : 'span');
  target.className = 'hero-map-marker-link';
  if (isLink) {
    target.href = href;
    if (link.title) target.title = link.title;
    if (link.target) target.target = link.target;
  }
  if (!isLink) target.setAttribute('aria-current', 'page');

  const [logoPic, flagPic] = pictures;
  const logoAlt = logoPic?.querySelector('img')?.alt || '';
  const linkText = link?.textContent.trim() || '';
  const label = (linkText && linkText !== href && !/^https?:/i.test(linkText))
    ? linkText : (logoAlt || code.toUpperCase());

  const name = document.createElement('span');
  name.className = 'hero-map-marker-name';
  name.textContent = label;

  const pin = document.createElement('span');
  pin.className = 'hero-map-pin';
  pin.setAttribute('aria-hidden', 'true');
  if (flagPic) {
    const flag = document.createElement('span');
    flag.className = 'hero-map-flag';
    flag.append(optimize(flagPic, false, [{ width: '96' }]));
    flag.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    pin.append(flag);
  }

  // logo pill precedes the pin (as on the source); per-marker flex-direction in CSS lays them out
  if (logoPic) {
    const logo = document.createElement('span');
    logo.className = 'hero-map-logo';
    logo.setAttribute('aria-hidden', 'true');
    logo.append(optimize(logoPic, false, [{ width: '384' }]));
    target.append(logo);
  }
  target.append(pin, name);
  li.append(target);
  return { li, placed: PLACED_CODES.includes(code) };
}

const CYCLE_MS = 2000;

/**
 * Highlights one marker's country at a time (source behaviour: every 2s, in marker order;
 * hovering/focusing a marker jumps to it). Paused while the block is off screen.
 */
function startCycle(block, svg) {
  const markers = [...block.querySelectorAll('.hero-map-markers .hero-map-marker[data-code]')]
    .map((li) => ({ li, path: svg.querySelector(`.hero-map-country[data-code="${li.dataset.code}"]`) }))
    .filter(({ path }) => path);
  if (!markers.length) return;

  let index = -1;
  let timer = null;
  let visible = true;
  const activate = (i) => {
    markers.forEach(({ li, path }, n) => {
      li.classList.toggle('active', n === i);
      path.classList.toggle('active', n === i);
    });
    index = i;
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (visible) timer = setInterval(() => activate((index + 1) % markers.length), CYCLE_MS);
  };

  markers.forEach(({ li }, i) => {
    const jump = () => { activate(i); start(); };
    li.addEventListener('mouseenter', jump);
    li.addEventListener('focusin', jump);
  });

  activate(0);
  start();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }).observe(block);
  }
}

/**
 * Swaps the bundled map <img> for inline SVG so country shapes can be highlighted.
 * The <img> renders first (it carries its own styles); on any failure it simply stays.
 */
async function inlineMap(block, img) {
  try {
    const resp = await fetch(img.src);
    if (!resp.ok) return;
    const doc = new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg || doc.querySelector('parsererror')) return;
    // styles live in hero-map.css once inline; drop ids so they cannot clash with page ids
    svg.querySelectorAll('style, script').forEach((el) => el.remove());
    svg.removeAttribute('id');
    svg.querySelectorAll('[id]').forEach((el) => {
      if (el.classList.contains('country_map')) {
        el.classList.add('hero-map-country');
        el.dataset.code = el.id.toUpperCase();
      }
      el.removeAttribute('id');
    });
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const inline = document.importNode(svg, true);
    img.replaceWith(inline);
    startCycle(block, inline);
  } catch (e) {
    // keep the static <img> map
  }
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const content = document.createElement('div');
  content.className = 'hero-map-content';
  let mapPicture = null;

  const placedList = document.createElement('ul');
  placedList.className = 'hero-map-markers';
  const unplacedList = document.createElement('ul');
  unplacedList.className = 'hero-map-markers-unplaced';

  rows.forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const cells = [...row.children];
    const firstText = cells[0]?.textContent.trim() || '';
    const looksLikeMarker = cells.length >= 2 && CODE_PATTERN.test(firstText)
      && !cells[0].querySelector('picture, h1, h2, h3');

    if (looksLikeMarker) {
      const { li, placed } = buildMarker(row);
      (placed ? placedList : unplacedList).append(li);
      return;
    }

    // intro row: first picture is the map, everything else is title content
    cells.forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE) {
          const pic = node.tagName === 'PICTURE' ? node : node.querySelector('picture');
          if (pic && !mapPicture) {
            mapPicture = pic;
            if (node !== pic && !node.textContent.trim()) return;
            if (node === pic) return;
            pic.remove();
          }
        }
        content.append(node);
      });
    });
  });

  const stage = document.createElement('div');
  stage.className = 'hero-map-stage';
  const map = document.createElement('div');
  map.className = 'hero-map-map';
  if (mapPicture) {
    map.append(optimize(mapPicture, true, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]));
  } else {
    // default to the bundled world map; marker positions in hero-map.css are keyed to it
    const img = document.createElement('img');
    img.src = `${window.hlx.codeBasePath}/blocks/hero-map/world-map.svg`;
    img.alt = '';
    img.width = 1920;
    img.height = 1080;
    img.loading = 'eager';
    img.fetchPriority = 'high';
    map.append(img);
    inlineMap(block, img);
  }
  stage.append(map);
  if (placedList.children.length) stage.append(placedList);

  const children = [stage];
  if (unplacedList.children.length) children.push(unplacedList);
  if (content.childNodes.length) children.push(content);
  block.replaceChildren(...children);
}
