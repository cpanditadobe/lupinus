/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-green-panel. Base: hero.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selectors: #take (patient), #dosing (HCP)
 * Validated against migration-work/block-context/hero-green-panel/source.html (+ instances/01.html):
 *   <section class="tolvaptan_bg ..." id="take|dosing">
 *     <p><picture><source><img class="tolvaptan_bg_img"></picture></p>
 *     <div class="tolvaptan_bg_container"><h2 class="subtitle_60|subtitle_58">Title</h2></div>
 * Output (blocks/hero-green-panel): 1 row, 1 cell: picture + h2.
 */
export default function parse(element, { document }) {
  const srcImg = element.querySelector('img.tolvaptan_bg_img') || element.querySelector('picture img, img');
  const heading = element.querySelector('.tolvaptan_bg_container h2, .tolvaptan_bg_container h1, .tolvaptan_bg_container h3')
    || element.querySelector('h2, h1, h3, [class*="subtitle"]');

  if (!srcImg && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (srcImg) {
    // Clean <img> (the source <picture> holds an empty <source>); src kept as-is
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    contentCell.push(img);
  }
  if (heading) {
    const h2 = document.createElement('h2');
    [...heading.childNodes].forEach((n) => h2.append(n.cloneNode(true)));
    contentCell.push(h2);
  }

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-green-panel', cells });
  element.replaceWith(block);
}
