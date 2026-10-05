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

  // tools/importer/import-product-detail.js
  var import_product_detail_exports = {};
  __export(import_product_detail_exports, {
    default: () => import_product_detail_default
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

  // tools/importer/parsers/columns-product-detail.js
  var COPAY_HREF = "#copay-terms";
  function parse2(element, { document: document2 }) {
    const container = element.querySelector(".product_detail_container") || element;
    const srcImg = element.querySelector(".product_detail_item img") || element.querySelector("img");
    const imageCell = [];
    if (srcImg) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const content = [];
    const heading = container.querySelector('h1, h2, [class*="subtitle"]');
    if (heading) {
      const h1 = document2.createElement("h1");
      h1.textContent = heading.textContent.trim();
      content.push(h1);
    }
    const items = [...container.querySelectorAll(".product_info .info_item, .info_item")].filter((item, i, arr) => arr.indexOf(item) === i);
    if (items.length) {
      const ul = document2.createElement("ul");
      items.forEach((item) => {
        const label = item.querySelector(".info_title");
        const value = item.querySelector(".info_detail");
        if (!label && !value) return;
        const li = document2.createElement("li");
        if (label) {
          const strong = document2.createElement("strong");
          strong.textContent = label.textContent.trim();
          li.append(strong);
        }
        li.append(`: ${value ? value.textContent.trim() : ""}`);
        ul.append(li);
      });
      if (ul.children.length) content.push(ul);
    }
    const pdfLinks = [...container.querySelectorAll(".product_pdf a")];
    pdfLinks.forEach((src) => {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = src.getAttribute("href");
      a.textContent = src.textContent.trim();
      strong.append(a);
      p.append(strong);
      content.push(p);
    });
    const popup = container.querySelector(".popup_pdf");
    if (popup) {
      const copayBtn = popup.querySelector("a");
      if (copayBtn) {
        const p = document2.createElement("p");
        const em = document2.createElement("em");
        const a = document2.createElement("a");
        a.href = COPAY_HREF;
        a.textContent = copayBtn.textContent.trim();
        em.append(a);
        p.append(em);
        content.push(p);
      }
      const terms = popup.querySelector(".para");
      if (terms && terms.textContent.trim()) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = COPAY_HREF;
        a.textContent = terms.textContent.trim();
        p.append(a);
        content.push(p);
      }
    }
    if (!imageCell.length && !content.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell.length ? imageCell : "", content.length ? content : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-product-detail", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-audience.js
  function keyFor(label) {
    if (/hcp|healthcare|professional/i.test(label)) return "hcp";
    if (/patient/i.test(label)) return "patient";
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function parse3(element, { document: document2 }) {
    let labels = [...element.querySelectorAll(".tolvaptan_tab, :scope > a, :scope > button")].filter((el, i, arr) => arr.indexOf(el) === i).map((el) => el.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (labels.length < 2) {
      const text = element.textContent.replace(/\s+/g, " ").trim();
      const phrases = text.match(/Information for .+?(?=\s*Information for |$)/g);
      if (phrases && phrases.length > labels.length) labels = phrases.map((p) => p.trim());
    }
    if (!labels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = labels.map((label) => [label, keyFor(label)]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-audience", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-anchor-nav.js
  function copyChildren(from, to) {
    [...from.childNodes].forEach((n) => to.append(n.cloneNode(true)));
    return to;
  }
  function convertBlock(node, document2, out) {
    if (node.nodeType !== 1) return;
    const cls = node.classList;
    if (cls.contains("flower_bg_container") || cls.contains("flower_bg")) return;
    const tag = node.tagName;
    if (cls.contains("subtitle_30") || /^H[1-6]$/.test(tag)) {
      out.push(copyChildren(node, document2.createElement("h3")));
      return;
    }
    if (tag === "P") {
      const p = document2.createElement("p");
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1 && n.tagName === "SPAN" && n.classList.contains("strong")) {
          p.append(copyChildren(n, document2.createElement("strong")));
        } else {
          p.append(n.cloneNode(true));
        }
      });
      if (p.textContent.trim()) out.push(p);
      return;
    }
    if (tag === "UL" || tag === "OL") {
      const list = document2.createElement(tag.toLowerCase());
      node.querySelectorAll(":scope > li").forEach((li) => {
        list.append(copyChildren(li, document2.createElement("li")));
      });
      out.push(list);
      return;
    }
    if (tag === "DIV" || tag === "SECTION") {
      [...node.children].forEach((child) => convertBlock(child, document2, out));
      return;
    }
    if (node.textContent.trim()) out.push(node.cloneNode(true));
  }
  function parse4(element, { document: document2 }) {
    const navContainer = element.querySelector(".section_nav_container");
    const navCell = [];
    if (navContainer) {
      navContainer.querySelectorAll("a[href]").forEach((src) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.setAttribute("href", src.getAttribute("href"));
        a.textContent = src.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        navCell.push(p);
      });
    }
    const textCell = [];
    const intro = element.querySelector(".support_para_container");
    if (intro) {
      convertBlock(intro, document2, textCell);
    } else {
      [...element.children].filter((c) => c !== navContainer).forEach((c) => convertBlock(c, document2, textCell));
    }
    if (!navCell.length && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[navCell.length ? navCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-anchor-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-green-panel.js
  function parse5(element, { document: document2 }) {
    const srcImg = element.querySelector("img.tolvaptan_bg_img") || element.querySelector("picture img, img");
    const heading = element.querySelector(".tolvaptan_bg_container h2, .tolvaptan_bg_container h1, .tolvaptan_bg_container h3") || element.querySelector('h2, h1, h3, [class*="subtitle"]');
    if (!srcImg && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (srcImg) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      contentCell.push(img);
    }
    if (heading) {
      const h2 = document2.createElement("h2");
      [...heading.childNodes].forEach((n) => h2.append(n.cloneNode(true)));
      contentCell.push(h2);
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-green-panel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-icon-tips.js
  function isTipGroup(node) {
    if (node.nodeType !== 1) return false;
    return !!(node.querySelector("img.tips_img, .tips_flex_container img") && node.querySelector(".tips_content ul, .tips_content ol"));
  }
  function defaultContent(node) {
    if (node.nodeType === 3) return node.textContent.trim() ? [node] : [];
    if (node.nodeType !== 1) return [];
    if (node.tagName === "DIV") return [...node.childNodes].flatMap(defaultContent);
    return [node];
  }
  function parse6(element, { document: document2 }) {
    const before = [];
    const after = [];
    const cells = [];
    [...element.childNodes].forEach((child) => {
      if (isTipGroup(child)) {
        const srcImg = child.querySelector("img.tips_img, .tips_flex_container img");
        const content = child.querySelector(".tips_content") || child;
        const headingEl = content.querySelector('[class*="subtitle"], h2, h3, h4');
        const list = content.querySelector("ul, ol");
        const iconCell = [];
        if (srcImg) {
          const img = document2.createElement("img");
          img.src = srcImg.getAttribute("src");
          img.alt = srcImg.getAttribute("alt") || "";
          iconCell.push(img);
        }
        const textCell = [];
        if (headingEl) {
          const h3 = document2.createElement("h3");
          h3.textContent = headingEl.textContent.trim();
          textCell.push(h3);
        }
        if (list) textCell.push(list);
        cells.push([iconCell.length ? iconCell : "", textCell.length ? textCell : ""]);
      } else {
        (cells.length ? after : before).push(...defaultContent(child));
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-icon-tips", cells });
    if (before.length) element.before(...before);
    if (after.length) element.after(...after);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-pharmacy.js
  function parse7(element, { document: document2 }) {
    let boxes = [...element.querySelectorAll(":scope > .pharma_logo_box")];
    if (!boxes.length) boxes = [...element.querySelectorAll(".pharma_logo_box")];
    const cells = [];
    boxes.forEach((box) => {
      const srcImg = box.querySelector(".pharma_logo_img img") || box.querySelector("img");
      const content = box.querySelector(".pharma_logo_content") || box;
      const logoCell = [];
      if (srcImg) {
        const img = document2.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || "";
        logoCell.push(img);
      }
      const textCell = [];
      [...content.children].forEach((child) => {
        const text = child.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const link = child.querySelector("a[href]") || (child.tagName === "A" ? child : null);
        const href = link ? link.getAttribute("href") || "" : "";
        const p = document2.createElement("p");
        if (link && href && !/^tel:/i.test(href)) {
          const strong = document2.createElement("strong");
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = link.textContent.trim();
          strong.append(a);
          p.append(strong);
        } else {
          p.textContent = text;
        }
        textCell.push(p);
      });
      if (!logoCell.length && !textCell.length) return;
      cells.push([logoCell.length ? logoCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-pharmacy", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function answerNodes(node) {
    if (node.nodeType === 3) {
      if (!node.textContent.trim()) return [];
      const p = node.ownerDocument.createElement("p");
      p.textContent = node.textContent.trim();
      return [p];
    }
    if (node.nodeType !== 1) return [];
    if (node.tagName === "IMG" && node.classList.contains("faq_arrow")) return [];
    if (node.tagName === "DIV") return [...node.childNodes].flatMap(answerNodes);
    return [node];
  }
  function parse8(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .faq_accordion")];
    if (!items.length) items = [...element.querySelectorAll(".faq_accordion")];
    const cells = [];
    items.forEach((item) => {
      const header = item.querySelector(".faq_header") || item;
      const q = header.querySelector('h3, h2, h4, [class*="subtitle"]') || header;
      const question = q.textContent.replace(/\s+/g, " ").trim();
      const body = item.querySelector(".faq_container");
      const answer = body ? [...body.childNodes].flatMap(answerNodes) : [];
      if (!question && !answer.length) return;
      cells.push([question, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta-banner.js
  function parse9(element, { document: document2 }) {
    const container = element.querySelector(".gp_saving_container") || element;
    const textCell = [];
    const statement = container.querySelector('[class*="subtitle"], h2, h3, p');
    if (statement && statement.textContent.trim()) {
      const p = document2.createElement("p");
      [...statement.childNodes].forEach((n) => p.append(n.cloneNode(true)));
      textCell.push(p);
    }
    const cta = container.querySelector(".cta_container a[href], a.black_cta, a[href]");
    if (cta) {
      const label = (cta.querySelector("span") || cta).textContent.replace(/\s+/g, " ").trim();
      if (label) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = label;
        strong.append(a);
        p.append(strong);
        textCell.push(p);
      }
    }
    const section = element.parentElement;
    let cardImg = element.querySelector("img.rectangle_img") || [...element.querySelectorAll("img")].find((img) => !img.closest("a") && !container.contains(img));
    if (!cardImg && section) {
      const sibling = [...section.children].find((c) => c !== element && c.querySelector("picture img, img.tolvaptan_bg_img"));
      if (sibling) {
        cardImg = sibling.querySelector("picture img, img.tolvaptan_bg_img");
        sibling.remove();
      }
    }
    if (section) section.querySelectorAll(":scope > img.hcp_saving_img").forEach((img) => img.remove());
    const imageCell = [];
    if (cardImg) {
      const img = document2.createElement("img");
      img.src = cardImg.getAttribute("src");
      img.alt = cardImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    if (!textCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell.length ? textCell : "", imageCell.length ? imageCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-cta-banner", cells });
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

  // tools/importer/import-product-detail.js
  var parsers = {
    "hero-banner": parse,
    "columns-product-detail": parse2,
    "tabs-audience": parse3,
    "columns-anchor-nav": parse4,
    "hero-green-panel": parse5,
    "columns-icon-tips": parse6,
    "cards-pharmacy": parse7,
    "accordion-faq": parse8,
    "columns-cta-banner": parse9
  };
  var PAGE_TEMPLATE = {
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
  var import_product_detail_default = {
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
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
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
  return __toCommonJS(import_product_detail_exports);
})();
