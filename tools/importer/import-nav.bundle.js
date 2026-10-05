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
  var NAV_LINKS = [
    { text: "Contact your Representative", href: "/US/contact-us" }
  ];
  var import_nav_default = {
    transform: (payload) => {
      const { document } = payload;
      const main = document.createElement("div");
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
          links: NAV_LINKS.map((l) => l.text)
        }
      }];
    }
  };
  return __toCommonJS(import_nav_exports);
})();
