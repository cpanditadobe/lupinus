/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMapParser from './parsers/hero-map.js';
import cardsLocationParser from './parsers/cards-location.js';
import formContactParser from './parsers/form-contact.js';
import columnsContactsParser from './parsers/columns-contacts.js';

// TRANSFORMER IMPORTS
import lupinCleanupTransformer from './transformers/lupin-cleanup.js';
import lupinSectionsTransformer from './transformers/lupin-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-map': heroMapParser,
  'cards-location': cardsLocationParser,
  'form-contact': formContactParser,
  'columns-contacts': columnsContactsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "contact-us",
  "description": "Lupin US contact page: world-map banner with affiliate markers, contact details, US location cards, contact form (layout only), media/careers contact columns",
  "urls": [
    "https://www.lupin.com/US/contact-us"
  ],
  "blocks": [
    {
      "name": "hero-map",
      "instances": [
        "section.contact_banner"
      ]
    },
    {
      "name": "cards-location",
      "instances": [
        "section.contact_location .contact_location_container"
      ]
    },
    {
      "name": "form-contact",
      "instances": [
        "section.contact_form form.form_detail"
      ]
    },
    {
      "name": "columns-contacts",
      "instances": [
        "section.media_contact .media_contact_container"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "World map banner",
      "selector": [
        "section.contact_banner"
      ],
      "style": null,
      "blocks": [
        "hero-map"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "Customer service and product quality contacts",
      "selector": [
        "section.contact_address"
      ],
      "style": "contact-details",
      "blocks": [],
      "defaultContent": [
        "section.contact_address .address_content"
      ]
    },
    {
      "id": "3",
      "name": "Lupin U.S. Locations",
      "selector": [
        "section.contact_location"
      ],
      "style": null,
      "blocks": [
        "cards-location"
      ],
      "defaultContent": [
        "section.contact_location > h2"
      ]
    },
    {
      "id": "4",
      "name": "Contact form",
      "selector": [
        "section.contact_form"
      ],
      "style": "light-green",
      "blocks": [
        "form-contact"
      ],
      "defaultContent": [
        "section.contact_form > h2"
      ]
    },
    {
      "id": "5",
      "name": "Careers / Media / Enquiries contacts",
      "selector": [
        "section.media_contact"
      ],
      "style": null,
      "blocks": [
        "columns-contacts"
      ],
      "defaultContent": []
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
