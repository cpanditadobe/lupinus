/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import columnsProductDetailParser from './parsers/columns-product-detail.js';
import tabsAudienceParser from './parsers/tabs-audience.js';
import columnsAnchorNavParser from './parsers/columns-anchor-nav.js';
import heroGreenPanelParser from './parsers/hero-green-panel.js';
import columnsIconTipsParser from './parsers/columns-icon-tips.js';
import cardsPharmacyParser from './parsers/cards-pharmacy.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import columnsCtaBannerParser from './parsers/columns-cta-banner.js';

// TRANSFORMER IMPORTS
import lupinCleanupTransformer from './transformers/lupin-cleanup.js';
import lupinSectionsTransformer from './transformers/lupin-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'columns-product-detail': columnsProductDetailParser,
  'tabs-audience': tabsAudienceParser,
  'columns-anchor-nav': columnsAnchorNavParser,
  'hero-green-panel': heroGreenPanelParser,
  'columns-icon-tips': columnsIconTipsParser,
  'cards-pharmacy': cardsPharmacyParser,
  'accordion-faq': accordionFaqParser,
  'columns-cta-banner': columnsCtaBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json;
// sections[].metadata merged from section-metadata-product-detail.json (Tab / Id)
const PAGE_TEMPLATE = {
  "name": "product-detail",
  "description": "Lupin US product detail page: banner, product info + PDFs, Patients/HCPs audience tabs (no HCP gate) with intro, banners, tips, pharmacies, FAQs, savings card, ISI; co-pay terms as a hidden dialog section",
  "urls": [
    "https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        "section.product_listing_banner"
      ]
    },
    {
      "name": "columns-product-detail",
      "instances": [
        "section.product_detail_section > div.product_detail_wrapper"
      ]
    },
    {
      "name": "tabs-audience",
      "instances": [
        "#HCP"
      ]
    },
    {
      "name": "columns-anchor-nav",
      "instances": [
        "section.tolvaptan_support.gp_patient > div.tolvaptan_support_container"
      ]
    },
    {
      "name": "hero-green-panel",
      "instances": [
        "#take",
        "#dosing"
      ]
    },
    {
      "name": "columns-icon-tips",
      "instances": [
        "#info-1 > section.inhaler_tips div.support_inhaler_wrapper"
      ]
    },
    {
      "name": "cards-pharmacy",
      "instances": [
        "#specialtypharmacy > div.pharma_logo_container",
        "#specialty > div.pharma_logo_container"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "#faq > div.faq_wrapper",
        "#faq-1 > div.faq_wrapper"
      ]
    },
    {
      "name": "columns-cta-banner",
      "instances": [
        "#card > div.gp_saving_wrapper",
        "#card-1 > div.gp_saving_wrapper"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Products page banner",
      "selector": [
        "section.product_listing_banner"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "3",
      "name": "Product detail",
      "selector": [
        "section.product_detail_section"
      ],
      "style": null,
      "blocks": [
        "columns-product-detail"
      ],
      "defaultContent": [
        "section.product_detail_section > p.product_para"
      ]
    },
    {
      "id": "4",
      "name": "Audience tabs (#HCP)",
      "selector": [
        "#HCP"
      ],
      "style": null,
      "blocks": [
        "tabs-audience"
      ],
      "defaultContent": [],
      "metadata": {
        "Id": "HCP"
      }
    },
    {
      "id": "5",
      "name": "PATIENT - intro",
      "selector": [
        "#info-1 > section.tolvaptan_support"
      ],
      "style": "light-green",
      "blocks": [
        "columns-anchor-nav"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient"
      }
    },
    {
      "id": "6",
      "name": "Patient - About",
      "selector": [
        "#about"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient",
        "Id": "about"
      }
    },
    {
      "id": "7",
      "name": "PATIENT - take banner",
      "selector": [
        "#take"
      ],
      "style": null,
      "blocks": [
        "hero-green-panel"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient",
        "Id": "take"
      }
    },
    {
      "id": "8",
      "name": "Patient - Tips",
      "selector": [
        "#info-1 > section.inhaler_tips"
      ],
      "style": "flower",
      "blocks": [
        "columns-icon-tips"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient"
      }
    },
    {
      "id": "9",
      "name": "PATIENT - specialty pharmacies",
      "selector": [
        "#specialtypharmacy"
      ],
      "style": null,
      "blocks": [
        "cards-pharmacy"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient",
        "Id": "specialtypharmacy"
      }
    },
    {
      "id": "10",
      "name": "PATIENT - FAQ",
      "selector": [
        "#faq"
      ],
      "style": null,
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient",
        "Id": "faq"
      }
    },
    {
      "id": "11",
      "name": "PATIENT - savings card CTA",
      "selector": [
        "#card"
      ],
      "style": null,
      "blocks": [
        "columns-cta-banner"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient",
        "Id": "card"
      }
    },
    {
      "id": "12",
      "name": "PATIENT - ISI",
      "selector": [
        "#info-1 > section.patient_main_container"
      ],
      "style": "isi",
      "blocks": [],
      "defaultContent": [],
      "metadata": {
        "Tab": "patient"
      }
    },
    {
      "id": "13",
      "name": "HCP - intro",
      "selector": [
        "#info-2 > section.tolvaptan_support"
      ],
      "style": "light-green",
      "blocks": [
        "columns-anchor-nav"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp"
      }
    },
    {
      "id": "14",
      "name": "HCP - dosing banner",
      "selector": [
        "#dosing"
      ],
      "style": null,
      "blocks": [
        "hero-green-panel"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp",
        "Id": "dosing"
      }
    },
    {
      "id": "15",
      "name": "HCP - Dosing details",
      "selector": [
        "#info-2 > section.pharma_special.gp_support_tips:not([id])"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp"
      }
    },
    {
      "id": "16",
      "name": "HCP - Administration",
      "selector": [
        "#admin"
      ],
      "style": "light-green, flower",
      "blocks": [],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp",
        "Id": "admin"
      }
    },
    {
      "id": "17",
      "name": "HCP - specialty pharmacies",
      "selector": [
        "#specialty"
      ],
      "style": null,
      "blocks": [
        "cards-pharmacy"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp",
        "Id": "specialty"
      }
    },
    {
      "id": "18",
      "name": "HCP - FAQ",
      "selector": [
        "#faq-1"
      ],
      "style": null,
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp",
        "Id": "faq-1"
      }
    },
    {
      "id": "19",
      "name": "HCP - savings card CTA",
      "selector": [
        "#card-1"
      ],
      "style": null,
      "blocks": [
        "columns-cta-banner"
      ],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp",
        "Id": "card-1"
      }
    },
    {
      "id": "20",
      "name": "HCP - ISI",
      "selector": [
        "#info-2 > section.hcp_main_container"
      ],
      "style": "isi",
      "blocks": [],
      "defaultContent": [],
      "metadata": {
        "Tab": "hcp"
      }
    },
    {
      "id": "21",
      "name": "Co-pay General Terms & Conditions (modal content)",
      "selector": [
        "div.product_popup"
      ],
      "style": "modal",
      "blocks": [],
      "defaultContent": [],
      "metadata": {
        "Id": "copay-terms"
      }
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks
const transformers = [
  lupinCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [lupinSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
