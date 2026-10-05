/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.lupin.com/US/product
 * Selector: section.product_listing_banner
 * Validated against migration-work/block-context/hero-banner/source.html:
 *   <section class="product_listing_banner ..."><picture><source><img class="banner_img"></picture><h1 class="subtitle_66">
 * Output (blocks/hero-banner): 1 column; row 1 = background image, row 2 = heading.
 */
export default function parse(element, { document }) {
  // Background image (img.banner_img inside picture); fallback to any img in the banner
  const image = element.querySelector('img.banner_img') || element.querySelector('picture img, img');

  // Page title: h1.subtitle_66; fallback to first heading
  const heading = element.querySelector('h1') || element.querySelector('h2, h3, [class*="title"]');

  if (!image && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) {
    // Use a clean <img> (the source <picture> has an unclosed empty <source>)
    const img = document.createElement('img');
    img.src = image.getAttribute('src');
    img.alt = image.getAttribute('alt') || (heading ? heading.textContent.trim() : '');
    cells.push([img]);
  }
  if (heading) {
    // Keep the source's heading level: the product listing title is an h1, but on product
    // detail pages it is a non-heading div (the product name is the page's h1), so emit h2.
    let title = heading;
    if (!/^H[1-6]$/.test(heading.tagName)) {
      title = document.createElement('h2');
      title.textContent = heading.textContent.trim();
    }
    cells.push([title]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
