/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selectors: #faq > div.faq_wrapper (patient), #faq-1 > div.faq_wrapper (HCP)
 * Validated against migration-work/block-context/accordion-faq/source.html (+ instances/01.html):
 *   div.faq_wrapper > div.faq_accordion
 *     > div.faq_header > h3.subtitle_30 (question) + img.faq_arrow (decorative - skipped)
 *     > div.faq_container > div.para_container > p.para / ul / ol (answer, may hold inline links)
 * Output (blocks/accordion-faq): one row per question, 2 cells: [question] | [answer rich text]
 */

// Flatten layout divs; keep paragraphs, lists, headings, tables with their inline markup
function answerNodes(node) {
  if (node.nodeType === 3) {
    if (!node.textContent.trim()) return [];
    const p = node.ownerDocument.createElement('p');
    p.textContent = node.textContent.trim();
    return [p];
  }
  if (node.nodeType !== 1) return [];
  if (node.tagName === 'IMG' && node.classList.contains('faq_arrow')) return [];
  if (node.tagName === 'DIV') return [...node.childNodes].flatMap(answerNodes);
  return [node];
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .faq_accordion')];
  if (!items.length) items = [...element.querySelectorAll('.faq_accordion')];

  const cells = [];
  items.forEach((item) => {
    const header = item.querySelector('.faq_header') || item;
    const q = header.querySelector('h3, h2, h4, [class*="subtitle"]') || header;
    const question = q.textContent.replace(/\s+/g, ' ').trim();
    const body = item.querySelector('.faq_container');
    const answer = body ? [...body.childNodes].flatMap(answerNodes) : [];
    if (!question && !answer.length) return;
    cells.push([question, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
