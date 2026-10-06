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
  var HOME = "/";
  var LOGO = {
    src: "https://main--lupinus--cpanditadobe.aem.live/media_1fbb4975e5a28eac21c41458115f499d47b8b6bb2.png",
    alt: "Lupin Logo"
  };
  var NAV_LINKS = [
    { text: "Contact Your Representative", href: "/us/contact-us" },
    // opens the registration dialog (scripts/register.js)
    { text: "Register/Sign In", href: "/us/register" },
    // deletes the registration cookie; shown only while registered (scripts/register.js)
    { text: "Sign out", href: "/us/sign-out" }
  ];
  var import_nav_default = {
    transform: ({ document }) => {
      const main = document.createElement("div");
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = HOME;
      const img = document.createElement("img");
      img.src = LOGO.src;
      img.alt = LOGO.alt;
      a.append(img);
      p.append(a);
      main.append(p, document.createElement("hr"));
      const ul = document.createElement("ul");
      NAV_LINKS.forEach(({ text, href }) => {
        const li = document.createElement("li");
        const a2 = document.createElement("a");
        a2.href = href;
        a2.textContent = text;
        li.append(a2);
        ul.append(li);
      });
      main.append(ul);
      return [{
        element: main,
        path: "/nav",
        report: {
          template: "nav",
          logo: LOGO.src,
          links: NAV_LINKS.map((l) => l.text)
        }
      }];
    }
  };
  return __toCommonJS(import_nav_exports);
})();
