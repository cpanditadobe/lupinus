/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-link-tile. Base: cards.
 * Source: https://www.lupin.com/US/product
 * Selector: #patient-education .brand_container (2 instances on the page: 4 tiles, then 2 tiles).
 * Each matched .brand_container becomes its own block.
 * Validated against migration-work/block-context/cards-link-tile/source.html + instances/01.html:
 *   div.brand_container > a.brand_box[href] > img.brand_arrow (decorative) + span.subtitle_20 (label)
 * Output (blocks/cards-link-tile): one row per tile, 1 cell containing a link.
 * Iteration is keyed on the label span (not the sibling <a> wrappers, which html2md
 * preprocessing can merge); the href is read from the enclosing anchor.
 */
export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('a.brand_box span.subtitle_20, a.brand_box span')]
    .filter((span, i, arr) => arr.indexOf(span) === i)
    .map((span) => ({ text: span.textContent.trim(), anchor: span.closest('a') }));
  if (!tiles.length) {
    // Fallback: iterate the anchors directly
    tiles = [...element.querySelectorAll('a[href]')]
      .map((a) => ({ text: a.textContent.trim(), anchor: a }));
  }

  const cells = [];
  tiles.forEach(({ text, anchor }) => {
    if (!text) return;
    let href = anchor ? anchor.getAttribute('href') : '';
    // Source has document-relative hrefs (e.g. "product/tiotropium-..."), which resolve
    // against /US/product on the source page; make them root-relative so they survive the move.
    if (href && !/^(\/|#|[a-z][a-z0-9+.-]*:)/i.test(href)) {
      href = `/US/${href}`;
    }
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      cells.push([a]);
    } else {
      cells.push([text]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-link-tile', cells });
  element.replaceWith(block);
}
