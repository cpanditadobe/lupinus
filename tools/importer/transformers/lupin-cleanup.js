/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: lupin.com (US) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.lupin.com/US/product).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function removeAll(root, selector) {
  root.querySelectorAll(selector).forEach((el) => el.remove());
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Site-wide overlays (page-structure "excluded" rc3 / rc4) ---
    // #wrapper > div:nth-of-type(2): floating "Smart Guide" button + Search Product popup
    //   <a href="#" class="sticky_guide">, <div id="popup" class="guide_popup">
    // #wrapper > div:nth-of-type(3): cookie popups
    //   <div id="cookies_popup">, <div id="gpcBanner">, <div id="privacyPopup">
    // Resolve wrapper divs by content (not positional nth-of-type) so removal order is safe.
    const overlayMarkers = ['a.sticky_guide', '#popup', '#cookies_popup', '#gpcBanner', '#privacyPopup'];
    overlayMarkers.forEach((sel) => {
      const marker = element.querySelector(sel);
      if (!marker) return;
      const wrapperDiv = marker.closest('#wrapper > div');
      // Never remove the first #wrapper div (it holds the page content)
      if (wrapperDiv && !wrapperDiv.querySelector('section.product_listing_banner, #product_listing, #patient-education')) {
        wrapperDiv.remove();
      } else {
        marker.remove();
      }
    });

    // --- Product catalog controls rebuilt client-side by cards-product ---
    // <section class="product_filter">: search form, category tabs, A-Z letter buttons.
    // Keep only the authored "Download Product Catalog" PDF link
    //   <a class="tab_link" href="/US/cms/uploads/Lupin_Product_Catalog_9-1-2026.pdf">
    // The section element itself is kept so the section transformer can still anchor on it.
    element.querySelectorAll('section.product_filter').forEach((filter) => {
      const pdfLink = filter.querySelector('a.tab_link[href$=".pdf"]');
      if (pdfLink) {
        const p = document.createElement('p');
        p.append(pdfLink);
        filter.replaceChildren(p);
      } else {
        filter.remove();
      }
    });

    // Results toolbar (item count, GRID/LIST toggle, Select Category dropdown)
    removeAll(element, '#product_listing > div.product_nav');
    // Pagination (prev / page numbers / next)
    removeAll(element, '#product_listing > div.product_pagination');
    // Hidden LIST-view table inside .product_main_container (duplicates the grid items);
    // removed before parsing so the cards-product parser doesn't pick it up.
    removeAll(element, '#product_listing div.product_table_container');
  }

  if (hookName === TransformHook.afterTransform) {
    // --- Global header (page-structure "excluded" rc1: body > div:nth-of-type(2)) ---
    // Contains <header class="header_bg">, <a class="menu">, <div class="inner_menu internal_menu">
    const header = element.querySelector('header.header_bg');
    if (header) {
      const headerDiv = header.parentElement;
      if (headerDiv && headerDiv.tagName === 'DIV' && !headerDiv.querySelector('#wrapper, main')) {
        headerDiv.remove();
      } else {
        header.remove();
      }
    }
    WebImporter.DOMUtils.remove(element, [
      'header.header_bg',
      'a.menu',
      'div.inner_menu',
      // Global footer
      'footer',
      // Non-content elements
      'link',
      'noscript',
      'iframe',
      'script',
      'style',
    ]);
  }
}
