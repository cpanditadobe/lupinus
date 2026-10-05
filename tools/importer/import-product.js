/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsLinkTileParser from './parsers/cards-link-tile.js';

// TRANSFORMER IMPORTS
import lupinCleanupTransformer from './transformers/lupin-cleanup.js';
import lupinSectionsTransformer from './transformers/lupin-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-product': cardsProductParser,
  'cards-link-tile': cardsLinkTileParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'product',
  description: 'Lupin US product listing page: hero banner, product catalog cards with client-side search/filter/pagination, and patient-education/HCP link tiles',
  urls: [
    'https://www.lupin.com/US/product',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['section.product_listing_banner'],
    },
    {
      name: 'cards-product',
      instances: ['#product_listing .product_main_container'],
    },
    {
      name: 'cards-link-tile',
      instances: ['#patient-education .brand_container'],
    },
  ],
  sections: [
    {
      id: '1',
      name: 'Page banner',
      selector: ['section.product_listing_banner'],
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'Product catalog',
      selector: ['section.product_filter', '#product_listing'],
      style: null,
      blocks: ['cards-product'],
      defaultContent: ['#product_listing > p.product_para'],
    },
    {
      id: '3',
      name: 'Explore patient education / HCP information',
      selector: ['#patient-education'],
      style: null,
      blocks: ['cards-link-tile'],
      defaultContent: ['#patient-education > div > div.subtitle_30'],
    },
  ],
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
