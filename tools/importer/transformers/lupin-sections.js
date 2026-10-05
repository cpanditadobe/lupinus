/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: lupin.com (US) section breaks + Section Metadata.
 * Uses payload.template.sections from tools/importer/page-templates.json.
 * Section selectors (section.product_listing_banner, section.product_filter,
 * #product_listing, #patient-education) verified in the product cleaned.html;
 * contact-us selectors (section.contact_banner, section.contact_address,
 * section.contact_location, section.contact_form [style: light-green],
 * section.media_contact) verified in the contact-us cleaned.html;
 * product-detail selectors (section.product_detail_section, #HCP, #info-1 / #info-2
 * children, #about, #take, #specialtypharmacy, #faq, #card, #dosing, #admin,
 * #specialty, #faq-1, #card-1, div.product_popup) verified in the product-detail cleaned.html.
 *
 * Section Metadata rows: `style` (emitted verbatim, may contain commas, e.g.
 * "light-green, flower") plus any extra rows from `section.metadata`
 * (e.g. { "Tab": "patient", "Id": "about" } - merged by the import script from
 * tools/importer/section-metadata-<template>.json). Key names are kept as given.
 *
 * Breaks are inserted in beforeTransform (before parsers replace section elements);
 * Section Metadata is inserted in afterTransform, anchored to a marker <hr>.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

// Ordered Section Metadata cells: style first, then section.metadata entries as given.
function sectionMetadataCells(section) {
  const cells = {};
  if (isPresent(section.style)) cells.style = String(section.style);
  const meta = section.metadata;
  if (meta && typeof meta === 'object') {
    Object.keys(meta).forEach((key) => {
      if (!isPresent(meta[key])) return;
      if (key === 'style' && cells.style) return; // never override the template style
      cells[key] = String(meta[key]);
    });
  }
  return cells;
}

function needsMetadata(section) {
  return Object.keys(sectionMetadataCells(section)).length > 0;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const withMetadata = needsMetadata(section);
      if (i === 0 && !withMetadata) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (withMetadata) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const cells = sectionMetadataCells(section);
      if (!Object.keys(cells).length) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells,
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
