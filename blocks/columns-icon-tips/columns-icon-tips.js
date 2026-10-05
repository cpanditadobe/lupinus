import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Icon tips: "Do" / "Don't" rows, each a round icon beside a coloured heading and a list.
 *
 * Content model: one row per tip group, 2 cells:
 *   [picture: icon (green check / red X)] | [h3 'Do' or 'Don't' + bullet list]
 * Each row gets a tone class: "negative" when its heading starts with "Don't"/"Do not"/
 * "Avoid"/"Never", "positive" when it starts with "Do"; otherwise rows alternate
 * positive / negative (row 1 positive, row 2 negative). A row without an icon still renders.
 */

const NEGATIVE = /^\s*(don['’]?t|do\s+not|avoid|never)\b/i;
const POSITIVE = /^\s*do\b/i;

function isSameOrigin(img) {
  try {
    return new URL(img.src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/* createOptimizedPicture drops the query string (breaks /_next/image?url=...): same-origin only */
function optimize(picture) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  if (isSameOrigin(img)) return createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]);
  img.loading = 'lazy';
  return picture;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const iconCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
    const bodyCells = cells.filter((c) => c !== iconCell);

    const item = document.createElement('div');
    item.className = 'columns-icon-tips-item';

    const icon = document.createElement('div');
    icon.className = 'columns-icon-tips-icon';
    const picture = (iconCell || row).querySelector('picture');
    if (picture) {
      const pic = optimize(picture);
      // the heading carries the meaning; the icon is decorative unless the author gave alt text
      pic.querySelectorAll('img').forEach((img) => { if (!img.alt) img.alt = ''; });
      icon.append(pic);
    } else {
      item.classList.add('no-icon');
    }

    const body = document.createElement('div');
    body.className = 'columns-icon-tips-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));
    body.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('img')) p.remove(); // picture leftovers
    });

    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const title = (heading || body.querySelector('p, strong'))?.textContent || '';
    let tone;
    if (NEGATIVE.test(title)) tone = 'negative';
    else if (POSITIVE.test(title)) tone = 'positive';
    else tone = index % 2 ? 'negative' : 'positive';
    item.classList.add(tone);
    if (heading) heading.classList.add('columns-icon-tips-heading');

    item.append(icon, body);
    items.push(item);
  });
  block.replaceChildren(...items);
}
