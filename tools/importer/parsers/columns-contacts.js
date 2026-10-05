/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contacts. Base: columns. Source: https://www.lupin.com/US/contact-us
 *
 * Block content model (blocks/columns-contacts/columns-contacts.js):
 *   1 row, one cell per column (Careers | Media | Enquiries). Each cell: h2 heading, then contacts
 *   (p > strong name, p job title, p mailto link). Multiple contacts in a cell are separated by <hr>.
 *
 * Source (validated against migration-work/block-context/columns-contacts/source.html):
 *   div.media_contact_container > div.media_contact_Links (x3)
 *     div.subtitle_40 | h2.subtitle_40          heading
 *     div.subtitle_34                           contact name
 *     div.media_detail                          job title
 *     span.contact_mail > a[href^=mailto] | a.contact_links[href^=mailto]
 */

const clean = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

function para(document, child) {
  const p = document.createElement('p');
  p.append(child);
  return p;
}

function mailLink(document, a) {
  const link = document.createElement('a');
  const href = (a.getAttribute('href') || '').trim();
  link.setAttribute('href', href);
  link.textContent = clean(a.textContent) || href.replace(/^mailto:/i, '');
  return link;
}

function buildColumn(document, col) {
  const cell = [];
  const heading = col.querySelector('h2, h3, .subtitle_40');
  if (clean(heading && heading.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent);
    cell.push(h2);
  }

  let contacts = 0;
  // walk content nodes in document order (skip the heading)
  const nodes = [...col.querySelectorAll('.subtitle_34, .media_detail, a[href]')]
    .filter((n) => n !== heading && !(heading && heading.contains(n)));
  nodes.forEach((node) => {
    if (node.matches('.subtitle_34')) {
      if (contacts > 0) cell.push(document.createElement('hr'));
      contacts += 1;
      const strong = document.createElement('strong');
      strong.textContent = clean(node.textContent);
      cell.push(para(document, strong));
    } else if (node.matches('.media_detail')) {
      cell.push(para(document, clean(node.textContent)));
    } else if (node.tagName === 'A') {
      cell.push(para(document, mailLink(document, node)));
    }
  });
  return cell;
}

export default function parse(element, { document }) {
  let cols = [...element.querySelectorAll(':scope > .media_contact_Links')];
  if (!cols.length) cols = [...element.querySelectorAll(':scope > div')];

  const row = cols.map((col) => buildColumn(document, col)).filter((cell) => cell.length);
  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contacts', cells });
  element.replaceWith(block);
}
