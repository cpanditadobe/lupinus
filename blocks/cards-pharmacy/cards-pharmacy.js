import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Pharmacy cards: logo on top (white), pharmacy details below (green band).
 *
 * Content model: one row per pharmacy, 2 cells:
 *   [logo picture with alt text] | [pharmacy name paragraph;
 *                                   paragraph with a bold website link (absolute URL);
 *                                   phone number paragraph, as a tel: link]
 * Authors may omit the logo. A phone link with no digits in its href (e.g. "tel:+") is
 * rebuilt from its visible number; a plain-text phone number paragraph is linked.
 */

const PHONE = /^\+?[\d\s().-]{7,}$/;

function isSameOrigin(img) {
  try {
    return new URL(img.src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/* createOptimizedPicture drops the query string (breaks /_next/image?url=...): same-origin only */
function optimize(picture, alt) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  if (isSameOrigin(img)) return createOptimizedPicture(img.src, img.alt || alt, false, [{ width: '500' }]);
  if (!img.alt) img.alt = alt;
  img.loading = 'lazy';
  return picture;
}

function telHref(text) {
  const digits = text.replace(/[^\d+]/g, '');
  if (!digits.replace('+', '')) return '';
  if (digits.startsWith('+')) return `tel:${digits}`;
  // US numbers: 10 digits, or 11 starting with the country code 1
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return `tel:${digits}`;
}

function fixPhones(body) {
  body.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    if (!/\d/.test(a.getAttribute('href'))) {
      const href = telHref(a.textContent);
      if (href) a.href = href;
    }
  });
  body.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    if (p.querySelector('a') || !PHONE.test(text)) return;
    const href = telHref(text);
    if (!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    p.replaceChildren(a);
  });
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
    const bodyCells = cells.filter((c) => c !== imageCell);

    const li = document.createElement('li');
    li.className = 'cards-pharmacy-card';

    const body = document.createElement('div');
    body.className = 'cards-pharmacy-card-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));
    body.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
    // decorateButtons turned the bold website link into a pill: restore it as a bold link
    body.querySelectorAll('a.button').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });
    fixPhones(body);

    const name = body.querySelector('h1, h2, h3, h4, h5, h6, p')?.textContent.trim() || '';
    const picture = (imageCell || body).querySelector('picture');
    if (picture) {
      const image = document.createElement('div');
      image.className = 'cards-pharmacy-card-image';
      image.append(optimize(picture, name));
      li.append(image);
    } else {
      li.classList.add('no-image');
    }
    body.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('img')) p.remove();
    });
    li.append(body);
    list.append(li);
  });
  block.replaceChildren(list);
}
