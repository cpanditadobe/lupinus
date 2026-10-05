/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-product.js
  var import_product_exports = {};
  __export(import_product_exports, {
    default: () => import_product_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector("img.banner_img") || element.querySelector("picture img, img");
    const heading = element.querySelector("h1") || element.querySelector('h2, h3, [class*="title"]');
    if (!image && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const img = document2.createElement("img");
      img.src = image.getAttribute("src");
      img.alt = image.getAttribute("alt") || (heading ? heading.textContent.trim() : "");
      cells.push([img]);
    }
    if (heading) {
      let title = heading;
      if (!/^H[1-6]$/.test(heading.tagName)) {
        title = document2.createElement("h2");
        title.textContent = heading.textContent.trim();
      }
      cells.push([title]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".product_item")].filter((item) => !item.closest(".product_table_container"));
    if (!items.length) {
      items = [...element.querySelectorAll(".product_detail")].filter((d) => !d.closest(".product_table_container")).map((d) => d.parentElement);
    }
    const cells = [];
    items.forEach((item) => {
      const detail = item.querySelector(".product_detail") || item;
      const headingSrc = detail.querySelector('h2, h3, h4, [class*="subtitle"]');
      const imageLink = item.querySelector("a.product_box");
      const headingLink = headingSrc && headingSrc.closest("a") || headingSrc && headingSrc.querySelector("a") || imageLink;
      const href = headingLink ? headingLink.getAttribute("href") : "";
      const name = headingSrc ? headingSrc.textContent.trim() : "";
      const srcImg = imageLink && imageLink.querySelector("img") || item.querySelector("img");
      let imageCell = "";
      if (srcImg) {
        const img = document2.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || name;
        imageCell = img;
      }
      const body = [];
      if (name) {
        const h2 = document2.createElement("h2");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = name;
          h2.append(a);
        } else {
          h2.textContent = name;
        }
        body.push(h2);
      }
      const pdfLinks = [...detail.querySelectorAll(".product_pdf a[href], a.pdf_link")].filter((a, i, arr) => arr.indexOf(a) === i);
      pdfLinks.forEach((link) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-link-tile.js
  function parse3(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll("a.brand_box span.subtitle_20, a.brand_box span")].filter((span, i, arr) => arr.indexOf(span) === i).map((span) => ({ text: span.textContent.trim(), anchor: span.closest("a") }));
    if (!tiles.length) {
      tiles = [...element.querySelectorAll("a[href]")].map((a) => ({ text: a.textContent.trim(), anchor: a }));
    }
    const cells = [];
    tiles.forEach(({ text, anchor }) => {
      if (!text) return;
      let href = anchor ? anchor.getAttribute("href") : "";
      if (href && !/^(\/|#|[a-z][a-z0-9+.-]*:)/i.test(href)) {
        href = `/US/${href}`;
      }
      if (href) {
        const a = document2.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-link-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lupin-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var CONTENT_SECTIONS = [
    // product
    "section.product_listing_banner",
    "#product_listing",
    "#patient-education",
    // contact-us
    "section.contact_banner",
    "section.contact_address",
    "section.contact_location",
    "section.contact_form",
    "section.media_contact",
    // product-detail
    "section.product_detail_section",
    "#HCP",
    "#info-1",
    "#info-2",
    "div.product_popup"
  ].join(", ");
  var PDF_ORIGIN = "https://www.lupin.com";
  function removeAll(root, selector) {
    root.querySelectorAll(selector).forEach((el) => el.remove());
  }
  function isProductDetail(element, payload) {
    const name = payload && payload.template && payload.template.name;
    if (name) return name === "product-detail";
    return !!element.querySelector("section.product_detail_section");
  }
  function transform(hookName, element, payload) {
    const productDetail = isProductDetail(element, payload);
    if (hookName === TransformHook.beforeTransform) {
      const overlayMarkers = ["a.sticky_guide", "#popup", "#cookies_popup", "#gpcBanner", "#privacyPopup"];
      overlayMarkers.forEach((sel) => {
        const marker = element.querySelector(sel);
        if (!marker) return;
        const wrapperDiv = marker.closest("#wrapper > div");
        if (wrapperDiv && !wrapperDiv.querySelector(CONTENT_SECTIONS)) {
          wrapperDiv.remove();
        } else {
          marker.remove();
        }
      });
      if (productDetail) {
        removeAll(element, "div.guide_popup.disclaimer_popup");
        removeAll(element, "div.isi_section > div.show_button");
        removeAll(element, "div.flower_bg_container");
        removeAll(element, "div.patient_active, div.hcp_active");
        element.querySelectorAll("div.product_popup").forEach((popup) => {
          removeAll(popup, "a.close_btn");
          popup.querySelectorAll("pre").forEach((pre) => {
            const p = document.createElement("p");
            p.textContent = pre.textContent.trim();
            pre.replaceWith(p);
          });
          popup.querySelectorAll("div.contact_terms").forEach((terms) => {
            const nodes = [];
            terms.querySelectorAll("label").forEach((label) => {
              label.querySelectorAll("input").forEach((input) => input.remove());
              const text = label.textContent.trim();
              if (text) {
                const p = document.createElement("p");
                p.textContent = text;
                nodes.push(p);
              }
            });
            terms.querySelectorAll("a").forEach((a) => {
              const p = document.createElement("p");
              p.append(a);
              nodes.push(p);
            });
            if (nodes.length) terms.replaceChildren(...nodes);
          });
        });
      }
      element.querySelectorAll("section.product_filter").forEach((filter) => {
        if (productDetail) {
          filter.remove();
          return;
        }
        const pdfLink = filter.querySelector('a.tab_link[href$=".pdf"]');
        if (pdfLink) {
          const p = document.createElement("p");
          p.append(pdfLink);
          filter.replaceChildren(p);
        } else {
          filter.remove();
        }
      });
      removeAll(element, "#product_listing > div.product_nav");
      removeAll(element, "#product_listing > div.product_pagination");
      removeAll(element, "#product_listing div.product_table_container");
      element.querySelectorAll("section.contact_address .lupin_contact").forEach((contact) => {
        const lines = [];
        let label = "";
        contact.childNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName === "A") {
            const p = document.createElement("p");
            if (label) p.append(`${label} `);
            p.append(node.cloneNode(true));
            lines.push(p);
            label = "";
          } else if (node.textContent.trim()) {
            label = node.textContent.trim();
          }
        });
        if (lines.length) contact.replaceChildren(...lines);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      const header = element.querySelector("header.header_bg");
      if (header) {
        const headerDiv = header.parentElement;
        if (headerDiv && headerDiv.tagName === "DIV" && !headerDiv.querySelector("#wrapper, main")) {
          headerDiv.remove();
        } else {
          header.remove();
        }
      }
      WebImporter.DOMUtils.remove(element, [
        "header.header_bg",
        "a.menu",
        "div.inner_menu",
        // Global footer
        "footer",
        // Non-content elements
        "link",
        "noscript",
        "iframe",
        "script",
        "style"
      ]);
      if (productDetail) {
        element.querySelectorAll('a[href*=".pdf"]').forEach((a) => {
          const href = a.getAttribute("href") || "";
          if (href.charAt(0) === "/" && href.charAt(1) !== "/") {
            a.setAttribute("href", PDF_ORIGIN + href);
          }
        });
      }
    }
  }

  // tools/importer/transformers/lupin-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function isPresent(value) {
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function sectionMetadataCells(section) {
    const cells = {};
    if (isPresent(section.style)) cells.style = String(section.style);
    const meta = section.metadata;
    if (meta && typeof meta === "object") {
      Object.keys(meta).forEach((key) => {
        if (!isPresent(meta[key])) return;
        if (key === "style" && cells.style) return;
        cells[key] = String(meta[key]);
      });
    }
    return cells;
  }
  function needsMetadata(section) {
    return Object.keys(sectionMetadataCells(section)).length > 0;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const withMetadata = needsMetadata(section);
        if (i === 0 && !withMetadata) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (withMetadata) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const cells = sectionMetadataCells(section);
        if (!Object.keys(cells).length) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-product.js
  var parsers = {
    "hero-banner": parse,
    "cards-product": parse2,
    "cards-link-tile": parse3
  };
  var PAGE_TEMPLATE = {
    name: "product",
    description: "Lupin US product listing page: hero banner, product catalog cards with client-side search/filter/pagination, and patient-education/HCP link tiles",
    urls: [
      "https://www.lupin.com/US/product"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: ["section.product_listing_banner"]
      },
      {
        name: "cards-product",
        instances: ["#product_listing .product_main_container"]
      },
      {
        name: "cards-link-tile",
        instances: ["#patient-education .brand_container"]
      }
    ],
    sections: [
      {
        id: "1",
        name: "Page banner",
        selector: ["section.product_listing_banner"],
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Product catalog",
        selector: ["section.product_filter", "#product_listing"],
        style: null,
        blocks: ["cards-product"],
        defaultContent: ["#product_listing > p.product_para"]
      },
      {
        id: "3",
        name: "Explore patient education / HCP information",
        selector: ["#patient-education"],
        style: null,
        blocks: ["cards-link-tile"],
        defaultContent: ["#patient-education > div > div.subtitle_30"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_product_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const PATH_OVERRIDES = { "/us/product": "/us/hcpportal" };
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const sanitized = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      const path = PATH_OVERRIDES[sanitized] || sanitized;
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_product_exports);
})();
