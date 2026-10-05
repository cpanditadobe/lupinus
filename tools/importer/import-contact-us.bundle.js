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

  // tools/importer/import-contact-us.js
  var import_contact_us_exports = {};
  __export(import_contact_us_exports, {
    default: () => import_contact_us_default
  });

  // tools/importer/parsers/hero-map.js
  var COMPANY_BY_CLASS = {
    canada: "Lupin Pharma Canada",
    pharma: "Lupin Pharmaceuticals, Inc.",
    grin: "Laboratorios Grin",
    med: "MedQu\xEDmica",
    healthcare: "Lupin Healthcare (UK)",
    nanomi: "Nanomi",
    hormosan: "Hormosan Pharma",
    lahsal: "Lupin Neurosciences",
    france: "Medisol",
    dynamic: "Pharma Dynamics",
    lupinin: "Lupin Limited",
    multicare: "Multicare Pharmaceuticals",
    generichealth: "Generic Health"
  };
  var CODE_BY_CLASS = {
    canada: "CA",
    pharma: "US",
    grin: "MX",
    med: "BR",
    healthcare: "UK",
    nanomi: "NL",
    hormosan: "GE",
    lahsal: "CH",
    france: "FR",
    dynamic: "SA",
    lupinin: "IN",
    multicare: "PH",
    generichealth: "AU"
  };
  var CODE_PATTERN = /^[A-Z]{2,3}$/;
  function markerKey(anchor) {
    if (!anchor) return "";
    const cls = [...anchor.classList].map((c) => c.toLowerCase()).find((c) => c !== "country" && c !== "active" && (COMPANY_BY_CLASS[c] || CODE_BY_CLASS[c]));
    return cls || "";
  }
  function nameFromHref(href) {
    try {
      const host = new URL(href).hostname.replace(/^www\./, "");
      return host.split(".")[0].replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    } catch (e) {
      return "";
    }
  }
  function makeImg(document2, src, alt) {
    const img = document2.createElement("img");
    img.src = src;
    img.alt = alt;
    return img;
  }
  function parse(element, { document: document2 }) {
    const heading = element.querySelector("h1, .subtitle_66, h2");
    let items = [...element.querySelectorAll(".country_company")].map((company) => {
      const logoWrap = company.nextElementSibling && company.nextElementSibling.matches(".country_logo") ? company.nextElementSibling : company.parentElement && company.parentElement.querySelector(".country_logo");
      return { company, logoWrap, anchor: company.closest("a") };
    });
    if (!items.length) {
      items = [...element.querySelectorAll("a.country")].map((anchor) => ({
        company: anchor.querySelector(".country_company"),
        logoWrap: anchor.querySelector(".country_logo"),
        anchor
      }));
    }
    if (!heading && !items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const h1 = document2.createElement("h1");
    h1.textContent = heading ? heading.textContent.trim() : "";
    cells.push([h1, "", ""]);
    items.forEach(({ company, logoWrap, anchor }) => {
      const logoImg = company && company.querySelector("img");
      const flagImg = logoWrap && (logoWrap.querySelector("img.flag_logo") || logoWrap.querySelector("img:not(.pin_logo)"));
      const key = markerKey(anchor);
      let code = (logoImg && logoImg.getAttribute("alt") || "").trim().toUpperCase();
      if (!CODE_PATTERN.test(code)) {
        code = (flagImg && flagImg.getAttribute("alt") || "").trim().split(/\s+/)[0].toUpperCase();
      }
      if (!CODE_PATTERN.test(code)) code = CODE_BY_CLASS[key] || "";
      if (!code) return;
      const rawHref = anchor ? (anchor.getAttribute("href") || "#").trim() : "#";
      const href = rawHref === "#" || !rawHref ? "#" : anchor.href || rawHref;
      const companyName = COMPANY_BY_CLASS[key] || nameFromHref(href) || code;
      const pictureCell = [];
      if (logoImg && logoImg.getAttribute("src")) {
        pictureCell.push(makeImg(document2, logoImg.src || logoImg.getAttribute("src"), companyName));
      }
      if (flagImg && flagImg.getAttribute("src")) {
        pictureCell.push(makeImg(document2, flagImg.src || flagImg.getAttribute("src"), `${code} flag`));
      }
      const link = document2.createElement("a");
      link.setAttribute("href", href);
      link.textContent = companyName;
      cells.push([code, pictureCell.length ? pictureCell : "", link]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-map", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-location.js
  function buildAddress(document2, source) {
    if (!source) return null;
    const lines = [""];
    source.childNodes.forEach((node) => {
      if (node.nodeName === "BR") lines.push("");
      else lines[lines.length - 1] += node.textContent;
    });
    const clean3 = lines.map((l) => l.replace(/ /g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
    if (!clean3.length) return null;
    const p = document2.createElement("p");
    clean3.forEach((line, i) => {
      if (i) p.append(document2.createElement("br"));
      p.append(line);
    });
    return p;
  }
  var text = (el) => el ? el.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim() : "";
  function parse2(element, { document: document2 }) {
    let boxes = [...element.querySelectorAll(":scope > .location_box")];
    if (!boxes.length) boxes = [...element.querySelectorAll(".location_box")];
    const cells = [];
    boxes.forEach((box) => {
      const cell = [];
      const title = box.querySelector("h3, h2, h4, .subtitle_30");
      const label = box.querySelector(".subtitle_15");
      const desc = box.querySelector(":scope > p.para") || box.querySelector(":scope > p");
      const addressSrc = box.querySelector(".address_content p") || box.querySelector(".location_address p") || box.querySelector(".location_address");
      if (text(title)) {
        const h3 = document2.createElement("h3");
        h3.textContent = text(title);
        cell.push(h3);
      }
      if (text(label)) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = text(label);
        p.append(strong);
        cell.push(p);
      }
      if (text(desc)) {
        const p = document2.createElement("p");
        p.textContent = text(desc);
        cell.push(p);
      }
      const address = buildAddress(document2, addressSrc);
      if (address) cell.push(address);
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-location", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-contact.js
  var SUBJECT_OPTIONS = [
    "Product | Quality",
    "Product | Adverse events",
    "Product | Customer service",
    "Product | Patient assistance",
    "Product | Clinical trials",
    "Partner with Lupin in the U.S. | Business development",
    "Media Contact",
    "Other Enquiry"
  ];
  var SPEC = [
    { label: "Name", name: "name", type: "text", placeholder: "NAME" },
    { label: "Organization", name: "organization", type: "text", placeholder: "ORGANIZATION" },
    { label: "Email", name: "email", type: "email", placeholder: "EMAIL" },
    { label: "Contact Number", name: "number", type: "tel", placeholder: "CONTACT" },
    { label: "Subject", name: "subject", type: "select", options: SUBJECT_OPTIONS },
    { label: "Query", name: "query", type: "textarea", placeholder: "POST YOUR QUERY" }
  ];
  var CHECKBOX_SPEC = { label: "Agree", name: "agree", type: "checkbox" };
  var clean = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  function controlType(control, spec) {
    if (!control) return spec.type || "text";
    const tag = control.tagName.toLowerCase();
    if (tag === "select") return "select";
    if (tag === "textarea") return "textarea";
    const attr = (control.getAttribute("type") || "").toLowerCase();
    if (attr === "number") return "tel";
    return attr || spec.type || "text";
  }
  function richLabel(document2, source) {
    const p = document2.createElement("p");
    const walk = (parent) => {
      parent.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          p.append(node.textContent.replace(/\s+/g, " "));
        } else if (node.nodeType === 1) {
          if (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "IMG"].includes(node.tagName)) return;
          if (node.tagName === "A") {
            if (p.lastChild && p.lastChild.nodeType === 3 && !/\s$/.test(p.lastChild.textContent)) p.append(" ");
            const a = document2.createElement("a");
            a.setAttribute("href", node.getAttribute("href") || "");
            a.textContent = clean(node.textContent);
            p.append(a);
          } else {
            walk(node);
          }
        }
      });
    };
    walk(source);
    p.normalize();
    if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
    if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, "");
    return p;
  }
  function paragraphs(document2, lines) {
    return lines.map((t) => {
      const p = document2.createElement("p");
      p.textContent = t;
      return p;
    });
  }
  function parse3(element, { document: document2 }) {
    const isForm = element.matches("form, .form_detail") || element.querySelector(".form_container, .contact_terms");
    if (!isForm) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const findControl = (name) => element.querySelector(`[name="${name}"]`);
    const cells = [];
    SPEC.forEach((spec) => {
      let control = findControl(spec.name);
      if (!control && spec.type === "select") control = element.querySelector("select");
      if (!control && spec.type === "textarea") control = element.querySelector("textarea");
      const type = controlType(control, spec);
      const placeholder = clean(control && control.getAttribute("placeholder")) || spec.placeholder || "";
      let extra = placeholder;
      if (type === "select") {
        let options = control ? [...control.querySelectorAll("option")].map((o) => clean(o.textContent)).filter(Boolean) : [];
        if (!options.length) options = spec.options || SUBJECT_OPTIONS;
        extra = paragraphs(document2, options);
      }
      cells.push([spec.label, type, spec.name, "yes", extra]);
    });
    const termsLabel = element.querySelector(".contact_terms label") || element.querySelector(".contact_terms");
    const checkbox = findControl(CHECKBOX_SPEC.name) || element.querySelector('input[type="checkbox"]');
    const labelSource = termsLabel || checkbox && checkbox.closest("label");
    const rich = labelSource ? richLabel(document2, labelSource) : null;
    cells.push([CHECKBOX_SPEC.label, "checkbox", CHECKBOX_SPEC.name, "yes", rich && rich.textContent.trim() ? rich : ""]);
    const button = element.querySelector('button, input[type="submit"]');
    const submitText = button && (clean(button.textContent) || clean(button.getAttribute("value"))) || "Submit";
    cells.push([submitText, "submit", "submit", "yes", ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contacts.js
  var clean2 = (s) => (s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  function para(document2, child) {
    const p = document2.createElement("p");
    p.append(child);
    return p;
  }
  function mailLink(document2, a) {
    const link = document2.createElement("a");
    const href = (a.getAttribute("href") || "").trim();
    link.setAttribute("href", href);
    link.textContent = clean2(a.textContent) || href.replace(/^mailto:/i, "");
    return link;
  }
  function buildColumn(document2, col) {
    const cell = [];
    const heading = col.querySelector("h2, h3, .subtitle_40");
    if (clean2(heading && heading.textContent)) {
      const h2 = document2.createElement("h2");
      h2.textContent = clean2(heading.textContent);
      cell.push(h2);
    }
    let contacts = 0;
    const nodes = [...col.querySelectorAll(".subtitle_34, .media_detail, a[href]")].filter((n) => n !== heading && !(heading && heading.contains(n)));
    nodes.forEach((node) => {
      if (node.matches(".subtitle_34")) {
        if (contacts > 0) cell.push(document2.createElement("hr"));
        contacts += 1;
        const strong = document2.createElement("strong");
        strong.textContent = clean2(node.textContent);
        cell.push(para(document2, strong));
      } else if (node.matches(".media_detail")) {
        cell.push(para(document2, clean2(node.textContent)));
      } else if (node.tagName === "A") {
        cell.push(para(document2, mailLink(document2, node)));
      }
    });
    return cell;
  }
  function parse4(element, { document: document2 }) {
    let cols = [...element.querySelectorAll(":scope > .media_contact_Links")];
    if (!cols.length) cols = [...element.querySelectorAll(":scope > div")];
    const row = cols.map((col) => buildColumn(document2, col)).filter((cell) => cell.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-contacts", cells });
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
    "section.media_contact"
  ].join(", ");
  function removeAll(root, selector) {
    root.querySelectorAll(selector).forEach((el) => el.remove());
  }
  function transform(hookName, element, payload) {
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
      element.querySelectorAll("section.product_filter").forEach((filter) => {
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
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-contact-us.js
  var parsers = {
    "hero-map": parse,
    "cards-location": parse2,
    "form-contact": parse3,
    "columns-contacts": parse4
  };
  var PAGE_TEMPLATE = {
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
  var import_contact_us_default = {
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
  return __toCommonJS(import_contact_us_exports);
})();
