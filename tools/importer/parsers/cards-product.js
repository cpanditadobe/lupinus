/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.lupin.com/US/product
 * Selector: #product_listing .product_main_container
 * Validated against migration-work/block-context/cards-product/source.html:
 *   .product_item_container > div.product_item (x12)
 *     a.product_box > img + span.view_cta ("VIEW MORE" - rebuilt by block JS)
 *     div.product_detail > a[href] > h2.subtitle_30
 *                        > div.product_pdf > a.pdf_link (0..n)
 * The hidden LIST-view table (.product_table_container) is removed by lupin-cleanup.js
 * and is ignored here as well.
 * Output (blocks/cards-product): one row per product; cell 1 = image,
 * cell 2 = linked h2 + one paragraph per PDF link.
 * Iteration is keyed on div.product_item (block wrapper), never the <a> wrappers.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.product_item')]
    .filter((item) => !item.closest('.product_table_container'));
  if (!items.length) {
    // Fallback: iterate detail wrappers and pair with sibling image anchor
    items = [...element.querySelectorAll('.product_detail')]
      .filter((d) => !d.closest('.product_table_container'))
      .map((d) => d.parentElement);
  }

  const cells = [];
  items.forEach((item) => {
    const detail = item.querySelector('.product_detail') || item;
    const headingSrc = detail.querySelector('h2, h3, h4, [class*="subtitle"]');
    const imageLink = item.querySelector('a.product_box');
    const headingLink = (headingSrc && headingSrc.closest('a'))
      || (headingSrc && headingSrc.querySelector('a'))
      || imageLink;
    const href = headingLink ? headingLink.getAttribute('href') : '';
    const name = headingSrc ? headingSrc.textContent.trim() : '';

    // Cell 1: product image
    const srcImg = (imageLink && imageLink.querySelector('img')) || item.querySelector('img');
    let imageCell = '';
    if (srcImg) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || name;
      imageCell = img;
    }

    // Cell 2: linked heading + PDF links
    const body = [];
    if (name) {
      const h2 = document.createElement('h2');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = name;
        h2.append(a);
      } else {
        h2.textContent = name;
      }
      body.push(h2);
    }
    const pdfLinks = [...detail.querySelectorAll('.product_pdf a[href], a.pdf_link')]
      .filter((a, i, arr) => arr.indexOf(a) === i);
    pdfLinks.forEach((link) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      p.append(a);
      body.push(p);
    });

    if (!imageCell && !body.length) return;
    cells.push([imageCell, body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
