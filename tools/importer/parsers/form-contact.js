/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-contact. Base: form (custom). Source: https://www.lupin.com/US/contact-us
 *
 * Block content model (blocks/form-contact/form-contact.js) - LAYOUT ONLY:
 *   one row per field: [Label] | [Type] | [Name] | [Required yes/no] | [Options or placeholder]
 *   select options: one per paragraph (first = default); checkbox: rich-text label (links kept).
 *   No "Action" row and no endpoint URL is emitted (the block then never sends data).
 *
 * Source (validated against migration-work/block-context/form-contact/source.html + live DOM):
 *   form.form_detail
 *     div.form_container > label.form_label > input|select|textarea  (name/type/placeholder attrs on live page)
 *     div.contact_terms > label > input[type=checkbox] + span (rich text with 2 links)
 *     button.green_cta > .cta_container > span "Submit"
 *
 * Rows are driven by a fixed source-order spec, NOT by iterating labels/controls: html2md's
 * preprocessing (DOMUtils.reviewInlineElement) removes every <label> whose textContent is empty,
 * which deletes the text/email/number inputs before parsers run. Each spec entry is enriched
 * from the live control (matched by name) when it survives.
 */

const SUBJECT_OPTIONS = [
  'Product | Quality',
  'Product | Adverse events',
  'Product | Customer service',
  'Product | Patient assistance',
  'Product | Clinical trials',
  'Partner with Lupin in the U.S. | Business development',
  'Media Contact',
  'Other Enquiry',
];

// positional spec, in source order
const SPEC = [
  { label: 'Name', name: 'name', type: 'text', placeholder: 'NAME' },
  { label: 'Organization', name: 'organization', type: 'text', placeholder: 'ORGANIZATION' },
  { label: 'Email', name: 'email', type: 'email', placeholder: 'EMAIL' },
  { label: 'Contact Number', name: 'number', type: 'tel', placeholder: 'CONTACT' },
  { label: 'Subject', name: 'subject', type: 'select', options: SUBJECT_OPTIONS },
  { label: 'Query', name: 'query', type: 'textarea', placeholder: 'POST YOUR QUERY' },
];
const CHECKBOX_SPEC = { label: 'Agree', name: 'agree', type: 'checkbox' };

const clean = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

function controlType(control, spec) {
  if (!control) return spec.type || 'text';
  const tag = control.tagName.toLowerCase();
  if (tag === 'select') return 'select';
  if (tag === 'textarea') return 'textarea';
  const attr = (control.getAttribute('type') || '').toLowerCase();
  if (attr === 'number') return 'tel'; // source phone field uses type=number
  return attr || spec.type || 'text';
}

/** rich-text paragraph from the checkbox label: text + links, controls dropped */
function richLabel(document, source) {
  const p = document.createElement('p');
  const walk = (parent) => {
    parent.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        p.append(node.textContent.replace(/\s+/g, ' '));
      } else if (node.nodeType === 1) {
        if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'IMG'].includes(node.tagName)) return;
        if (node.tagName === 'A') {
          if (p.lastChild && p.lastChild.nodeType === 3 && !/\s$/.test(p.lastChild.textContent)) p.append(' ');
          const a = document.createElement('a');
          a.setAttribute('href', node.getAttribute('href') || '');
          a.textContent = clean(node.textContent);
          p.append(a);
        } else {
          walk(node);
        }
      }
    });
  };
  walk(source);
  p.normalize();
  if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
  if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, '');
  return p;
}

function paragraphs(document, lines) {
  return lines.map((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    return p;
  });
}

export default function parse(element, { document }) {
  const isForm = element.matches('form, .form_detail') || element.querySelector('.form_container, .contact_terms');
  if (!isForm) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const findControl = (name) => element.querySelector(`[name="${name}"]`);
  const cells = [];

  // Field rows: always the full source-order spec, enriched from the live control when present.
  SPEC.forEach((spec) => {
    let control = findControl(spec.name);
    if (!control && spec.type === 'select') control = element.querySelector('select');
    if (!control && spec.type === 'textarea') control = element.querySelector('textarea');

    const type = controlType(control, spec);
    const placeholder = clean(control && control.getAttribute('placeholder')) || spec.placeholder || '';

    let extra = placeholder;
    if (type === 'select') {
      let options = control
        ? [...control.querySelectorAll('option')].map((o) => clean(o.textContent)).filter(Boolean)
        : [];
      if (!options.length) options = spec.options || SUBJECT_OPTIONS;
      extra = paragraphs(document, options);
    }
    cells.push([spec.label, type, spec.name, 'yes', extra]);
  });

  // Consent checkbox: rich-text label with the Privacy Statement / Terms of Use links.
  const termsLabel = element.querySelector('.contact_terms label') || element.querySelector('.contact_terms');
  const checkbox = findControl(CHECKBOX_SPEC.name) || element.querySelector('input[type="checkbox"]');
  // read the whole label: html2md preprocessing unwraps the text <span> and leaves
  // whitespace-only <span> fragments, so a span lookup would return an empty label
  const labelSource = termsLabel || (checkbox && checkbox.closest('label'));
  const rich = labelSource ? richLabel(document, labelSource) : null;
  cells.push([CHECKBOX_SPEC.label, 'checkbox', CHECKBOX_SPEC.name, 'yes', rich && rich.textContent.trim() ? rich : '']);

  const button = element.querySelector('button, input[type="submit"]');
  const submitText = (button && (clean(button.textContent) || clean(button.getAttribute('value')))) || 'Submit';
  cells.push([submitText, 'submit', 'submit', 'yes', '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form-contact', cells });
  element.replaceWith(block);
}
