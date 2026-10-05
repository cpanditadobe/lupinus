/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: lupin.com (US) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.lupin.com/US/product).
 * Product-detail selectors verified in the product-detail cleaned.html
 * (https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid).
 * Product-detail-only logic is guarded by isProductDetail() so the product and
 * contact-us imports are unaffected.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Authored content sections per template (verified in each template's cleaned.html).
const CONTENT_SECTIONS = [
  // product
  'section.product_listing_banner', '#product_listing', '#patient-education',
  // contact-us
  'section.contact_banner', 'section.contact_address', 'section.contact_location',
  'section.contact_form', 'section.media_contact',
  // product-detail
  'section.product_detail_section', '#HCP', '#info-1', '#info-2', 'div.product_popup',
].join(', ');

const PDF_ORIGIN = 'https://www.lupin.com';

function removeAll(root, selector) {
  root.querySelectorAll(selector).forEach((el) => el.remove());
}

// product-detail: template name from the import script; without a template name
// (fallback) the product-detail-only <section class="product_detail_section">.
function isProductDetail(element, payload) {
  const name = payload && payload.template && payload.template.name;
  if (name) return name === 'product-detail';
  return !!element.querySelector('section.product_detail_section');
}

export default function transform(hookName, element, payload) {
  const productDetail = isProductDetail(element, payload);

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
      // Never remove the #wrapper div that holds the page content
      // (product: section.product_listing_banner/#product_listing/#patient-education;
      //  contact-us: section.contact_banner/.contact_address/.contact_location/.contact_form/.media_contact;
      //  product-detail: section.product_detail_section/#HCP/#info-1/#info-2/div.product_popup)
      if (wrapperDiv && !wrapperDiv.querySelector(CONTENT_SECTIONS)) {
        wrapperDiv.remove();
      } else {
        marker.remove();
      }
    });

    if (productDetail) {
      // HCP gate popup (user decision: no gate). It shares id="product_popup" with the
      // co-pay modal, so match by class only:
      //   <div id="product_popup" class="guide_popup disclaimer_popup  active">
      removeAll(element, 'div.guide_popup.disclaimer_popup');
      // ISI "Show More" toggle: <div class="isi_section"><div class="show_button">Show More</div>
      // (all ISI text is kept verbatim - it is shown inline)
      removeAll(element, 'div.isi_section > div.show_button');
      // Decorative flower images: <div class="flower_bg_container"><div class="flower_bg"><img>
      removeAll(element, 'div.flower_bg_container');
      // Empty decorative spacers before each ISI:
      //   <div class="patient_active">&nbsp;</div>, <div class="hcp_active">&nbsp;</div>
      removeAll(element, 'div.patient_active, div.hcp_active');

      // Co-pay modal: <div id="product_popup" class="product_popup ">
      element.querySelectorAll('div.product_popup').forEach((popup) => {
        // Close button: <a class="close_btn" href=""><img alt="Close"> <span>Close</span></a>
        removeAll(popup, 'a.close_btn');
        // "Eligibility Requirements:" is authored as <pre><code> in the CMS; keep the text as a paragraph.
        popup.querySelectorAll('pre').forEach((pre) => {
          const p = document.createElement('p');
          p.textContent = pre.textContent.trim();
          pre.replaceWith(p);
        });
        // <div class="contact_terms"><label><input id="check_term">I am over the age of 18 ...</label>
        //   <a class="pdf_link" href="https://accessactivation.apollocare.com/...">Download Co-pay Savings Card</a>
        // Drop the checkbox; keep the agreement sentence as text and the download link.
        popup.querySelectorAll('div.contact_terms').forEach((terms) => {
          const nodes = [];
          terms.querySelectorAll('label').forEach((label) => {
            label.querySelectorAll('input').forEach((input) => input.remove());
            const text = label.textContent.trim();
            if (text) {
              const p = document.createElement('p');
              p.textContent = text;
              nodes.push(p);
            }
          });
          terms.querySelectorAll('a').forEach((a) => {
            const p = document.createElement('p');
            p.append(a);
            nodes.push(p);
          });
          if (nodes.length) terms.replaceChildren(...nodes);
        });
      });
    }

    // --- Product catalog controls rebuilt client-side by cards-product ---
    // <section class="product_filter">: search form, category tabs, A-Z letter buttons.
    // Product listing: keep only the authored "Download Product Catalog" PDF link
    //   <a class="tab_link" href="/US/cms/uploads/Lupin_Product_Catalog_9-1-2026.pdf">
    // The section element itself is kept so the section transformer can still anchor on it.
    // Product detail: the whole search/filter is removed (user decision: leave out).
    element.querySelectorAll('section.product_filter').forEach((filter) => {
      if (productDetail) {
        filter.remove();
        return;
      }
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

    // --- Contact details: one paragraph per "Label : <a>" line ---
    // Source: <div class="lupin_contact"><span>Phone :<a>&nbsp;+1 866…</a></span><span>Email :<a>…</a></span></div>
    // The importer's preprocessing has already unwrapped those spans by now, leaving
    // "Phone :", whitespace <span>/<p> fragments and the <a>, which would collapse into one line.
    element.querySelectorAll('section.contact_address .lupin_contact').forEach((contact) => {
      const lines = [];
      let label = '';
      contact.childNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === 'A') {
          const p = document.createElement('p');
          if (label) p.append(`${label} `);
          p.append(node.cloneNode(true));
          lines.push(p);
          label = '';
        } else if (node.textContent.trim()) {
          label = node.textContent.trim();
        }
      });
      if (lines.length) contact.replaceChildren(...lines);
    });
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

    if (productDetail) {
      // PDF links must stay absolute (lupinuscms.azurewebsites.net / www.lupin.com).
      // Absolute hrefs are left untouched; a site-relative PDF href ("/US/...") is made absolute.
      element.querySelectorAll('a[href*=".pdf"]').forEach((a) => {
        const href = a.getAttribute('href') || '';
        if (href.charAt(0) === '/' && href.charAt(1) !== '/') {
          a.setAttribute('href', PDF_ORIGIN + href);
        }
      });
    }
  }
}
