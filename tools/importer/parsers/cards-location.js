/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-location. Base: cards. Source: https://www.lupin.com/US/contact-us
 *
 * Block content model (blocks/cards-location/cards-location.js):
 *   one row per location, 1 cell: h3 city; p > strong label; p description;
 *   p address lines separated by <br> (last line "Phone: ...").
 *
 * Source (validated against migration-work/block-context/cards-location/source.html):
 *   div.contact_location_container > div.location_box (x4)
 *     h3.subtitle_30 | div.subtitle_15 | p.para | div.location_address > div.address_content > p
 */

const isBlank = (node) => node.nodeType === 3 && !node.textContent.replace(/ /g, ' ').trim();

/** rebuild the address paragraph: trimmed lines joined by <br>, empty lines dropped */
function buildAddress(document, source) {
  if (!source) return null;
  const lines = [''];
  source.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') lines.push('');
    else lines[lines.length - 1] += node.textContent;
  });
  const clean = lines.map((l) => l.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (!clean.length) return null;
  const p = document.createElement('p');
  clean.forEach((line, i) => {
    if (i) p.append(document.createElement('br'));
    p.append(line);
  });
  return p;
}

const text = (el) => (el ? el.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : '');

export default function parse(element, { document }) {
  let boxes = [...element.querySelectorAll(':scope > .location_box')];
  if (!boxes.length) boxes = [...element.querySelectorAll('.location_box')];

  const cells = [];
  boxes.forEach((box) => {
    const cell = [];
    const title = box.querySelector('h3, h2, h4, .subtitle_30');
    const label = box.querySelector('.subtitle_15');
    const desc = box.querySelector(':scope > p.para') || box.querySelector(':scope > p');
    const addressSrc = box.querySelector('.address_content p')
      || box.querySelector('.location_address p')
      || box.querySelector('.location_address');

    if (text(title)) {
      const h3 = document.createElement('h3');
      h3.textContent = text(title);
      cell.push(h3);
    }
    if (text(label)) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = text(label);
      p.append(strong);
      cell.push(p);
    }
    if (text(desc)) {
      const p = document.createElement('p');
      p.textContent = text(desc);
      cell.push(p);
    }
    const address = buildAddress(document, addressSrc);
    if (address) cell.push(address);

    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-location', cells });
  element.replaceWith(block);
}
