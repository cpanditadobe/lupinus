/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-audience. Base: tabs.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selector: #HCP
 * Validated against migration-work/block-context/tabs-audience/source.html:
 *   <div class="tolvaptan_tab_container" id="HCP">
 *     <a class="tolvaptan_tab tabActive" href="#">Information for Patients</a>
 *     <a class="tolvaptan_tab" href="#">Information for HCPs</a>
 * Output (blocks/tabs-audience): one row per tab, 2 cells: [label] | [panel key]
 *   (Information for Patients | patient, Information for HCPs | hcp). No HCP gate rows.
 *
 * The tab anchors share href="#", so the importer's inline-merge preprocessing could fold
 * adjacent anchors into one; labels are therefore recovered from the text as a fallback.
 */
function keyFor(label) {
  if (/hcp|healthcare|professional/i.test(label)) return 'hcp';
  if (/patient/i.test(label)) return 'patient';
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function parse(element, { document }) {
  let labels = [...element.querySelectorAll('.tolvaptan_tab, :scope > a, :scope > button')]
    .filter((el, i, arr) => arr.indexOf(el) === i)
    .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // Fallback: merged anchors -> split "Information for X" phrases out of the combined text
  if (labels.length < 2) {
    const text = element.textContent.replace(/\s+/g, ' ').trim();
    const phrases = text.match(/Information for .+?(?=\s*Information for |$)/g);
    if (phrases && phrases.length > labels.length) labels = phrases.map((p) => p.trim());
  }

  if (!labels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = labels.map((label) => [label, keyFor(label)]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-audience', cells });
  element.replaceWith(block);
}
