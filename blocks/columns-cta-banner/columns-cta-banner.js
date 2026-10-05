import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * CTA banner: green band with a statement and a call-to-action beside an image
 * (the savings card).
 *
 * Content model (1 row, 2 cells; cells may be in either order):
 *   [statement (paragraph or h2); paragraph with the CTA link, e.g. bold
 *    'Download Copay Savings Card' -> https://accessactivation.apollocare.com/lupin/agravicti/download_pdf]
 *   | [picture: savings card image]
 *
 * The CTA opens the hidden same-page section with id "copay-terms" (Section Metadata
 * Id: copay-terms, Style: modal) in a native <dialog> with a close button. A CTA whose
 * href is itself a same-page hash to a "modal" section opens that section instead. If the
 * section is missing (or <dialog> is unsupported), the CTA behaves as a normal link.
 */

const DEFAULT_DIALOG_SECTION = 'copay-terms';

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
  if (isSameOrigin(img)) return createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
  img.loading = 'lazy';
  return picture;
}

/* ---------- same-page section dialog (shared contract with columns-product-detail) ---------- */

function modalSectionId(link) {
  const href = link.getAttribute('href') || '';
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) return null;
  try {
    const url = new URL(href, window.location.href);
    const here = window.location;
    if (url.pathname !== here.pathname || url.origin !== here.origin) return null;
  } catch (e) {
    return null;
  }
  const id = decodeURIComponent(href.slice(hashIndex + 1));
  const target = id && document.getElementById(id);
  return target?.classList.contains('modal') ? id : null;
}

function getSectionDialog(id) {
  const existing = document.getElementById(`${id}-dialog`);
  if (existing) return existing;
  const section = document.getElementById(id);
  if (!section) return null;

  const dialog = document.createElement('dialog');
  dialog.id = `${id}-dialog`;
  dialog.className = 'section-dialog';
  const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${id}-dialog-title`;
    dialog.setAttribute('aria-labelledby', heading.id);
  } else {
    dialog.setAttribute('aria-label', 'Details');
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'section-dialog-close';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => dialog.close());

  const body = document.createElement('div');
  body.className = 'section-dialog-body';
  // move the section's content, not the section: the section keeps its hidden "modal" style
  body.append(...section.children);
  dialog.append(close, body);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close(); // backdrop click
  });
  section.after(dialog);
  return dialog;
}

function bindDialogLink(link, fallbackId = null) {
  link.addEventListener('click', (e) => {
    const id = modalSectionId(link) || fallbackId;
    const dialog = id && getSectionDialog(id);
    if (!dialog || typeof dialog.showModal !== 'function') return; // normal link
    e.preventDefault();
    dialog.showModal();
    dialog.addEventListener('close', () => link.focus(), { once: true });
  });
}

/*
 * A very wide image (e.g. a full-band artwork with the card baked in) is the band's
 * backdrop: the statement overlays it. A regular image (the card itself) sits beside it.
 */
const BACKDROP_RATIO = 2.5;

function detectBackdrop(block, img) {
  if (!img) return;
  const check = () => {
    if (img.naturalWidth && img.naturalWidth / img.naturalHeight >= BACKDROP_RATIO) {
      block.classList.add('backdrop');
    }
  };
  if (img.complete) check();
  else img.addEventListener('load', check, { once: true });
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const mediaCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  const textCells = cells.filter((c) => c !== mediaCell);

  const content = document.createElement('div');
  content.className = 'columns-cta-banner-content';
  textCells.forEach((cell) => content.append(...cell.childNodes));

  const picture = (mediaCell || content).querySelector('picture');
  const media = document.createElement('div');
  media.className = 'columns-cta-banner-media';
  if (picture) {
    const holder = picture.parentElement;
    media.append(optimize(picture));
    if (holder && holder !== content && holder.tagName === 'P' && !holder.textContent.trim()) holder.remove();
  } else {
    block.classList.add('no-image');
  }

  content.querySelectorAll('a[href]').forEach((a) => {
    const p = a.closest('p');
    const isCta = p && p.textContent.trim() === a.textContent.trim();
    if (isCta) {
      p.classList.add('columns-cta-banner-action');
      a.classList.add('columns-cta-banner-cta');
    }
    // the CTA falls back to the copay-terms section; inline links only open "modal" hashes
    bindDialogLink(a, isCta ? DEFAULT_DIALOG_SECTION : null);
  });

  block.replaceChildren(content, ...(picture ? [media] : []));
  detectBackdrop(block, media.querySelector('img'));
}
