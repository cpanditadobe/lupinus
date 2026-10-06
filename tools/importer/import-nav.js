/* eslint-disable */
/* global WebImporter */

/**
 * Nav import: builds the site nav fragment (/nav) from the lupin.com US header.
 *
 * Sections (read by blocks/header/header.js as [brand] [sections]):
 *   brand    - the Lupin logo from the source header, linking to the site home page
 *   sections - one top-level link, "Contact Your Representative" -> /us/contact-us
 * The rest of the source header (menus, language selector) is intentionally not mirrored.
 *
 * The logo uses the public lupin.com image URL: DA-hosted media is not readable by the
 * delivery pipeline for this site.
 */
const ORIGIN = 'https://www.lupin.com';
const HOME = '/';
const NAV_LINKS = [
  { text: 'Contact Your Representative', href: '/us/contact-us' },
];

/** _next/image?url=/US/images/... -> the original public image URL */
function publicImageUrl(img) {
  const src = new URL(img.getAttribute('src'), `${ORIGIN}/US/`);
  const original = src.searchParams.get('url');
  return original ? new URL(original, ORIGIN).href : src.href;
}

export default {
  transform: ({ document }) => {
    const main = document.createElement('div');

    // brand: the source header logo
    const logo = document.querySelector('header a[href="/US"] img, header img[alt*="Logo" i]');
    if (logo) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = HOME;
      const img = document.createElement('img');
      img.src = publicImageUrl(logo);
      img.alt = logo.getAttribute('alt') || 'Lupin';
      a.append(img);
      p.append(a);
      main.append(p, document.createElement('hr'));
    }

    // sections: one top-level link, no dropdown
    const ul = document.createElement('ul');
    NAV_LINKS.forEach(({ text, href }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      li.append(a);
      ul.append(li);
    });
    main.append(ul);

    return [{
      element: main,
      path: '/nav',
      report: {
        template: 'nav',
        logo: logo ? publicImageUrl(logo) : null,
        links: NAV_LINKS.map((l) => l.text),
      },
    }];
  },
};
