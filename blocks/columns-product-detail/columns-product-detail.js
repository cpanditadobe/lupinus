import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Product detail: product photo beside the product name, a label/value spec list,
 * document links and the co-pay actions.
 *
 * Content model (1 row, 2 cells; cells may be in either order):
 *   [picture: product photo]
 *   | [h1 product name;
 *      bullet list, one item per spec: "<strong>Label</strong>: value";
 *      paragraphs with bold links (green pills) to the PDFs;
 *      paragraph with an italic link "Download Co-pay Savings Card" (#copay-terms);
 *      paragraph with a plain link "General Terms & Conditions" (#copay-terms)]
 *
 * Bold-link paragraphs (button primary) go to the documents group; any other paragraph
 * after the spec list goes to the co-pay group beside it. A link whose hash points at a
 * same-page section with class "modal" (e.g. #copay-terms) opens that section's content
 * in a <dialog>; if the section is missing, the link behaves normally.
 */

function isSameOrigin(img) {
  try {
    return new URL(img.src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/* createOptimizedPicture drops the query string (breaks /_next/image?url=...): same-origin only */
function optimize(picture, eager) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  if (isSameOrigin(img)) {
    return createOptimizedPicture(img.src, img.alt || '', eager, [{ width: '750' }]);
  }
  img.loading = eager ? 'eager' : 'lazy';
  return picture;
}

/* ---------- same-page section dialog (shared contract with columns-cta-banner) ---------- */

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
  if (target?.closest('dialog.section-dialog')) return id;
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

/* ---------- spec list ---------- */

/** Splits an authored "<strong>Label</strong>: value" (or "Label: value") item. */
function splitSpec(li) {
  const nodes = [...li.childNodes];
  const first = nodes.find((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim());
  const label = document.createElement('dt');
  const value = document.createElement('dd');

  if (first?.nodeType === Node.ELEMENT_NODE && (first.tagName === 'STRONG' || first.tagName === 'B')) {
    label.textContent = first.textContent.replace(/\s*:\s*$/, '').trim();
    nodes.slice(nodes.indexOf(first) + 1).forEach((n) => value.append(n));
  } else {
    const textIndex = nodes.findIndex((n) => n.nodeType === Node.TEXT_NODE && n.textContent.includes(':'));
    if (textIndex < 0) return null;
    const text = nodes[textIndex].textContent;
    const at = text.indexOf(':');
    nodes.slice(0, textIndex).forEach((n) => label.append(n));
    label.append(text.slice(0, at).trim());
    value.append(text.slice(at + 1));
    nodes.slice(textIndex + 1).forEach((n) => value.append(n));
  }
  // strip the leading separator from the value
  const lead = value.firstChild;
  if (lead?.nodeType === Node.TEXT_NODE) lead.textContent = lead.textContent.replace(/^\s*:?\s*/, '');
  if (!label.textContent.trim()) return null;
  return [label, value];
}

function buildSpecs(list) {
  const dl = document.createElement('dl');
  dl.className = 'columns-product-detail-specs';
  [...list.children].forEach((li) => {
    const pair = splitSpec(li);
    if (pair) {
      const row = document.createElement('div');
      row.className = 'columns-product-detail-spec';
      row.append(...pair);
      dl.append(row);
    }
  });
  return dl.children.length ? dl : list;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const mediaCell = cells.find((c) => c.querySelector('picture') && !c.querySelector('h1, h2, h3, ul, a'));
  const infoCells = cells.filter((c) => c !== mediaCell);

  const media = document.createElement('div');
  media.className = 'columns-product-detail-media';
  const picture = (mediaCell || block).querySelector('picture');
  if (picture) media.append(optimize(picture, true));
  else block.classList.add('no-image');

  const info = document.createElement('div');
  info.className = 'columns-product-detail-info';
  const docs = document.createElement('div');
  docs.className = 'columns-product-detail-docs';
  const copay = document.createElement('div');
  copay.className = 'columns-product-detail-copay';
  let specsSeen = false;

  infoCells.forEach((cell) => {
    [...cell.children].forEach((node) => {
      if (node.querySelector('picture') && !node.textContent.trim()) return; // stray picture
      if ((node.tagName === 'UL' || node.tagName === 'OL') && !specsSeen) {
        specsSeen = true;
        info.append(buildSpecs(node));
        return;
      }
      const link = node.tagName === 'P' ? node.querySelector('a[href]') : null;
      if (link) {
        if (link.classList.contains('primary') || node.querySelector('strong a, a strong')) {
          docs.append(node);
        } else {
          copay.append(node);
        }
        return;
      }
      info.append(node);
    });
  });

  if (docs.children.length || copay.children.length) {
    const actions = document.createElement('div');
    actions.className = 'columns-product-detail-actions';
    if (docs.children.length) actions.append(docs);
    if (copay.children.length) actions.append(copay);
    info.append(actions);
  }

  info.querySelectorAll('a[href*="#"]').forEach((a) => bindDialogLink(a));

  block.replaceChildren(...(picture ? [media] : []), info);
}
