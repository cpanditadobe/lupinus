/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-anchor-nav. Base: columns.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selector: section.tolvaptan_support.gp_patient > div.tolvaptan_support_container (patient + HCP)
 * Validated against migration-work/block-context/columns-anchor-nav/source.html (+ instances/01.html):
 *   div.tolvaptan_support_container
 *     > div.section_nav_container > a[href] (in-page hashes + co-pay PDF link)
 *     > div.support_para_container
 *         > div.support_container > div.subtitle_30 (heading), p.para > span.strong, ul.unOrder_list
 *         > div.para_container > div.subtitle_30 (heading), p.para...
 *     > div.flower_bg_container (decorative - skipped)
 * Output (blocks/columns-anchor-nav): 1 row, 2 cells:
 *   [one <p><a></p> per nav link, hrefs verbatim] | [h3, <p><strong></p>, ul, h3, p...]
 */

// Copy child nodes (text, <sup>, <br>, inline markup) so text stays verbatim
function copyChildren(from, to) {
  [...from.childNodes].forEach((n) => to.append(n.cloneNode(true)));
  return to;
}

function convertBlock(node, document, out) {
  if (node.nodeType !== 1) return;
  const cls = node.classList;
  if (cls.contains('flower_bg_container') || cls.contains('flower_bg')) return;
  const tag = node.tagName;

  if (cls.contains('subtitle_30') || /^H[1-6]$/.test(tag)) {
    out.push(copyChildren(node, document.createElement('h3')));
    return;
  }
  if (tag === 'P') {
    const p = document.createElement('p');
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'SPAN' && n.classList.contains('strong')) {
        p.append(copyChildren(n, document.createElement('strong')));
      } else {
        p.append(n.cloneNode(true));
      }
    });
    if (p.textContent.trim()) out.push(p);
    return;
  }
  if (tag === 'UL' || tag === 'OL') {
    const list = document.createElement(tag.toLowerCase());
    node.querySelectorAll(':scope > li').forEach((li) => {
      list.append(copyChildren(li, document.createElement('li')));
    });
    out.push(list);
    return;
  }
  if (tag === 'DIV' || tag === 'SECTION') {
    [...node.children].forEach((child) => convertBlock(child, document, out));
    return;
  }
  if (node.textContent.trim()) out.push(node.cloneNode(true));
}

export default function parse(element, { document }) {
  // Nav cell: one paragraph per link
  const navContainer = element.querySelector('.section_nav_container');
  const navCell = [];
  if (navContainer) {
    navContainer.querySelectorAll('a[href]').forEach((src) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', src.getAttribute('href'));
      a.textContent = src.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      navCell.push(p);
    });
  }

  // Intro cell: everything else (decorative flower excluded)
  const textCell = [];
  const intro = element.querySelector('.support_para_container');
  if (intro) {
    convertBlock(intro, document, textCell);
  } else {
    [...element.children]
      .filter((c) => c !== navContainer)
      .forEach((c) => convertBlock(c, document, textCell));
  }

  if (!navCell.length && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[navCell.length ? navCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-anchor-nav', cells });
  element.replaceWith(block);
}
