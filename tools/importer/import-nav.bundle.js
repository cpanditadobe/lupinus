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

  // tools/importer/import-nav.js
  var import_nav_exports = {};
  __export(import_nav_exports, {
    default: () => import_nav_default
  });
  var ORIGIN = "https://www.lupin.com";
  var HOME = "/";
  var NAV_LINKS = [
    { text: "Contact Your Representative", href: "/us/contact-us" },
    // opens the registration dialog (scripts/register.js)
    { text: "Register", href: "/us/register" }
  ];
  function publicImageUrl(img) {
    const src = new URL(img.getAttribute("src"), `${ORIGIN}/US/`);
    const original = src.searchParams.get("url");
    return original ? new URL(original, ORIGIN).href : src.href;
  }
  var import_nav_default = {
    transform: ({ document }) => {
      const main = document.createElement("div");
      const logo = document.querySelector('header a[href="/US"] img, header img[alt*="Logo" i]');
      if (logo) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = HOME;
        const img = document.createElement("img");
        img.src = publicImageUrl(logo);
        img.alt = logo.getAttribute("alt") || "Lupin";
        a.append(img);
        p.append(a);
        main.append(p, document.createElement("hr"));
      }
      const ul = document.createElement("ul");
      NAV_LINKS.forEach(({ text, href }) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        li.append(a);
        ul.append(li);
      });
      main.append(ul);
      return [{
        element: main,
        path: "/nav",
        report: {
          template: "nav",
          logo: logo ? publicImageUrl(logo) : null,
          links: NAV_LINKS.map((l) => l.text)
        }
      }];
    }
  };
  return __toCommonJS(import_nav_exports);
})();
