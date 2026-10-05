/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-map. Base: hero. Source: https://www.lupin.com/US/contact-us
 *
 * Block content model (blocks/hero-map/hero-map.js):
 *   Row 1: h1 only. The source map (a ~280KB base64 data-URI SVG in .map_container > img)
 *          is NOT emitted - the block bundles it as blocks/hero-map/world-map.svg.
 *   Rows 2..n (3 cells): [country code] | [company logo picture + flag picture] | [link, text = company name]
 *   The shared red pin image (img.pin_logo) is a block asset and is ignored.
 *
 * Source (validated against migration-work/block-context/hero-map/source.html):
 *   section.contact_banner
 *     div.map_container > img[src^="data:"] (map, skipped)
 *       a.country.<key>[href] > div.country_company > img[alt="CA"]
 *                             > div.country_logo > img.flag_logo[alt="CA flag"] + img.pin_logo
 *     h1.subtitle_66 "Contact Us"
 *
 * Iteration is keyed on the inner block wrapper div.country_company (not the <a> wrappers),
 * so html2md's inline-element merging cannot collapse markers.
 */

// company names per source marker class (the source has no company text; logos only)
const COMPANY_BY_CLASS = {
  canada: 'Lupin Pharma Canada',
  pharma: 'Lupin Pharmaceuticals, Inc.',
  grin: 'Laboratorios Grin',
  med: 'MedQuímica',
  healthcare: 'Lupin Healthcare (UK)',
  nanomi: 'Nanomi',
  hormosan: 'Hormosan Pharma',
  lahsal: 'Lupin Neurosciences',
  france: 'Medisol',
  dynamic: 'Pharma Dynamics',
  lupinin: 'Lupin Limited',
  multicare: 'Multicare Pharmaceuticals',
  generichealth: 'Generic Health',
};

// country code per source marker class (fallback when the logo/flag alt is missing)
const CODE_BY_CLASS = {
  canada: 'CA', pharma: 'US', grin: 'MX', med: 'BR', healthcare: 'UK', nanomi: 'NL',
  hormosan: 'GE', lahsal: 'CH', france: 'FR', dynamic: 'SA', lupinin: 'IN',
  multicare: 'PH', generichealth: 'AU',
};

const CODE_PATTERN = /^[A-Z]{2,3}$/;

function markerKey(anchor) {
  if (!anchor) return '';
  const cls = [...anchor.classList]
    .map((c) => c.toLowerCase())
    .find((c) => c !== 'country' && c !== 'active' && (COMPANY_BY_CLASS[c] || CODE_BY_CLASS[c]));
  return cls || '';
}

function nameFromHref(href) {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return host.split('.')[0].replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  } catch (e) {
    return '';
  }
}

function makeImg(document, src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  return img;
}

export default function parse(element, { document }) {
  const heading = element.querySelector('h1, .subtitle_66, h2');

  // Inner block wrappers (one per marker); fallback to the anchors themselves.
  let items = [...element.querySelectorAll('.country_company')].map((company) => {
    const logoWrap = company.nextElementSibling && company.nextElementSibling.matches('.country_logo')
      ? company.nextElementSibling
      : company.parentElement && company.parentElement.querySelector('.country_logo');
    return { company, logoWrap, anchor: company.closest('a') };
  });
  if (!items.length) {
    items = [...element.querySelectorAll('a.country')].map((anchor) => ({
      company: anchor.querySelector('.country_company'),
      logoWrap: anchor.querySelector('.country_logo'),
      anchor,
    }));
  }

  if (!heading && !items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: h1 only (no map image).
  const h1 = document.createElement('h1');
  h1.textContent = heading ? heading.textContent.trim() : '';
  cells.push([h1, '', '']);

  items.forEach(({ company, logoWrap, anchor }) => {
    const logoImg = company && company.querySelector('img');
    const flagImg = logoWrap && (logoWrap.querySelector('img.flag_logo') || logoWrap.querySelector('img:not(.pin_logo)'));
    const key = markerKey(anchor);

    // country code: logo alt ("CA") -> flag alt ("CA flag") -> marker class
    let code = (logoImg && logoImg.getAttribute('alt') || '').trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      code = ((flagImg && flagImg.getAttribute('alt')) || '').trim().split(/\s+/)[0].toUpperCase();
    }
    if (!CODE_PATTERN.test(code)) code = CODE_BY_CLASS[key] || '';
    if (!code) return;

    const rawHref = anchor ? (anchor.getAttribute('href') || '#').trim() : '#';
    const href = rawHref === '#' || !rawHref ? '#' : (anchor.href || rawHref);
    const companyName = COMPANY_BY_CLASS[key] || nameFromHref(href) || code;

    const pictureCell = [];
    if (logoImg && logoImg.getAttribute('src')) {
      pictureCell.push(makeImg(document, logoImg.src || logoImg.getAttribute('src'), companyName));
    }
    if (flagImg && flagImg.getAttribute('src')) {
      pictureCell.push(makeImg(document, flagImg.src || flagImg.getAttribute('src'), `${code} flag`));
    }

    // current-site markers ("#") are emitted as plain text: "#" links get rewritten to "/"
    // on upload, which would turn them into links to the home page
    let link = companyName;
    if (href !== '#') {
      link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = companyName;
    }

    cells.push([code, pictureCell.length ? pictureCell : '', link]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-map', cells });
  element.replaceWith(block);
}
