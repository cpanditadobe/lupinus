/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-footer.js
  var import_footer_exports = {};
  __export(import_footer_exports, {
    default: () => import_footer_default
  });
  var ORIGIN = "https://www.lupin.com";
  var PATH_OVERRIDES = {
    "/US/product": "/us/hcpportal",
    "/US/contact-us": "/us/contact-us",
    // the source link is broken (doubled /US/): use the working PDF
    "/US/US/images/terms-of-use-lupin-us-website.pdf": `${ORIGIN}/US/images/terms-of-use-lupin-us-website.pdf`
  };
  function mapHref(a) {
    const raw = a.getAttribute("href") || "";
    if (/^(tel|mailto):/i.test(raw)) return raw;
    const url = new URL(raw, `${ORIGIN}/US/`);
    let href = url.origin === ORIGIN && PATH_OVERRIDES[url.pathname] ? `${PATH_OVERRIDES[url.pathname]}${url.hash}` : url.href;
    if (a.getAttribute("target") === "_blank") href += "#_blank";
    return href;
  }
  function link(document, a, text) {
    const out = document.createElement("a");
    out.href = mapHref(a);
    if (text !== void 0) out.textContent = text;
    return out;
  }
  function headingParagraph(document, ...content) {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.append(...content);
    p.append(strong);
    return p;
  }
  function linesOf(document, el) {
    const nodes = [];
    el.childNodes.forEach((n) => {
      if (n.nodeName === "BR") {
        nodes.push(document.createElement("br"));
      } else if (n.textContent.trim()) {
        const text = n.textContent.replace(/\s+/g, " ").trim();
        if (typeof nodes.at(-1) === "string") nodes[nodes.length - 1] += text;
        else nodes.push(text);
      }
    });
    return nodes;
  }
  function contactColumn(document, address) {
    const col = document.createElement("div");
    const addr = address.querySelector("address");
    if (addr) {
      const p = document.createElement("p");
      linesOf(document, addr).forEach((n, i) => {
        const m = i === 0 && typeof n === "string" && n.match(/^([^:]+):(.*)$/);
        if (m) {
          const strong = document.createElement("strong");
          strong.textContent = m[1].trim();
          p.append(strong, `:${m[2]}`);
        } else {
          p.append(n);
        }
      });
      col.append(p);
    }
    address.querySelectorAll(":scope > div").forEach((group) => {
      let label = "";
      group.childNodes.forEach((n) => {
        if (n.nodeName === "DIV") {
          col.append(headingParagraph(document, ...linesOf(document, n)));
        } else if (n.nodeName === "A") {
          const p = document.createElement("p");
          if (label) p.append(`${label} `);
          p.append(link(document, n, n.textContent.replace(/\u00a0/g, " ").trim()));
          col.append(p);
          label = "";
        } else if (n.textContent.trim()) {
          label = n.textContent.trim();
        }
      });
    });
    address.querySelectorAll(":scope > a").forEach((a) => {
      const img = a.querySelector("img");
      const p = document.createElement("p");
      const out = link(document, a);
      if (img) {
        const src = new URL(img.getAttribute("src"), `${ORIGIN}/US/`);
        const original = src.searchParams.get("url");
        const image = document.createElement("img");
        image.src = original ? new URL(original, ORIGIN).href : src.href;
        image.alt = img.getAttribute("alt") || "";
        out.append(image);
      } else {
        out.textContent = a.textContent.trim();
      }
      p.append(out);
      col.append(p);
    });
    return col;
  }
  function navColumn(document, column) {
    const col = document.createElement("div");
    column.querySelectorAll(":scope > div").forEach((group) => {
      group.childNodes.forEach((n) => {
        if (n.nodeName === "A") {
          col.append(headingParagraph(document, link(document, n, n.textContent.trim())));
        } else if (n.nodeName === "UL") {
          const ul = document.createElement("ul");
          n.querySelectorAll(":scope > li > a").forEach((a) => {
            const li = document.createElement("li");
            li.append(link(document, a, a.textContent.trim()));
            ul.append(li);
          });
          col.append(ul);
        } else if (n.nodeType === 3 && n.textContent.trim()) {
          col.append(headingParagraph(document, n.textContent.trim()));
        }
      });
    });
    return col;
  }
  var import_footer_default = {
    transform: ({ document }) => {
      const footer = document.querySelector("footer");
      const main = document.createElement("div");
      const sections = [];
      const address = footer.querySelector(".lupin_address");
      if (address) sections.push(contactColumn(document, address));
      footer.querySelectorAll(".nav_footer_container").forEach((c) => sections.push(navColumn(document, c)));
      const copyright = footer.querySelector(".copyright");
      if (copyright) {
        const col = document.createElement("div");
        const p = document.createElement("p");
        p.textContent = copyright.textContent.trim();
        col.append(p);
        sections.push(col);
      }
      sections.forEach((s, i) => {
        if (i) main.append(document.createElement("hr"));
        main.append(...s.childNodes);
      });
      return [{
        element: main,
        path: "/footer",
        report: { template: "footer", sections: sections.length }
      }];
    }
  };
  return __toCommonJS(import_footer_exports);
})();
