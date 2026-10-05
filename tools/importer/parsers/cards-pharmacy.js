/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pharmacy. Base: cards.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selectors: #specialtypharmacy > div.pharma_logo_container, #specialty > div.pharma_logo_container
 * Validated against migration-work/block-context/cards-pharmacy/source.html (+ instances/01.html):
 *   div.pharma_logo_container > div.pharma_logo_box
 *     > div.pharma_logo_img > img[alt]
 *     > div.pharma_logo_content
 *         > div.para (name)
 *         > div.subtitle_22 > a[href] (website)
 *         > div.para > a[href="tel:+"] (visible phone number; href is empty)
 * Output (blocks/cards-pharmacy): one row per pharmacy, 2 cells:
 *   [logo img with alt] | [<p>name</p>; <p><strong><a>website</a></strong></p>; <p>phone</p>]
 * The source tel: hrefs carry no number, so the phone is emitted as its visible text
 * (the block links plain-text phone paragraphs).
 */
export default function parse(element, { document }) {
  let boxes = [...element.querySelectorAll(':scope > .pharma_logo_box')];
  if (!boxes.length) boxes = [...element.querySelectorAll('.pharma_logo_box')];

  const cells = [];
  boxes.forEach((box) => {
    const srcImg = box.querySelector('.pharma_logo_img img') || box.querySelector('img');
    const content = box.querySelector('.pharma_logo_content') || box;

    const logoCell = [];
    if (srcImg) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || '';
      logoCell.push(img);
    }

    const textCell = [];
    [...content.children].forEach((child) => {
      const text = child.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const link = child.querySelector('a[href]') || (child.tagName === 'A' ? child : null);
      const href = link ? (link.getAttribute('href') || '') : '';
      const p = document.createElement('p');
      if (link && href && !/^tel:/i.test(href)) {
        // Website link (absolute URL kept as-is), bold
        const strong = document.createElement('strong');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = link.textContent.trim();
        strong.append(a);
        p.append(strong);
      } else {
        // Name, or phone number (visible text only; empty tel: href dropped)
        p.textContent = text;
      }
      textCell.push(p);
    });

    if (!logoCell.length && !textCell.length) return;
    cells.push([logoCell.length ? logoCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-pharmacy', cells });
  element.replaceWith(block);
}
