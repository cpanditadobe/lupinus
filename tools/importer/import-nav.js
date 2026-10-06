/* eslint-disable */
/* global WebImporter */

/**
 * Nav import: builds the site nav fragment (/nav) from the lupin.com US header.
 *
 * Sections (read by blocks/header/header.js as [brand] [sections]):
 *   brand    - the site's uploaded Lupin logo (LOGO), linking to the site home page
 *   sections - top-level links: "Contact Your Representative" -> /us/contact-us,
 *              "Register/Sign In" -> /us/register (opens the registration dialog) and
 *              "Sign out" -> /us/sign-out (deletes the registration cookie)
 * The rest of the source header (menus, language selector) is intentionally not mirrored.
 *
 * The logo is the one uploaded to the nav in Document Authoring, referenced by its published
 * media URL: the DA media URL itself is not publicly readable.
 */
const HOME = '/';
const LOGO = {
  src: 'https://main--lupinus--cpanditadobe.aem.live/media_1fbb4975e5a28eac21c41458115f499d47b8b6bb2.png',
  alt: 'Lupin Logo',
};
const NAV_LINKS = [
  { text: 'Contact Your Representative', href: '/us/contact-us' },
  // opens the registration dialog (scripts/register.js)
  { text: 'Register/Sign In', href: '/us/register' },
  // deletes the registration cookie; shown only while registered (scripts/register.js)
  { text: 'Sign out', href: '/us/sign-out' },
];

export default {
  transform: ({ document }) => {
    const main = document.createElement('div');

    // brand: the uploaded logo, linking home
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = HOME;
    const img = document.createElement('img');
    img.src = LOGO.src;
    img.alt = LOGO.alt;
    a.append(img);
    p.append(a);
    main.append(p, document.createElement('hr'));

    // sections: top-level links, no dropdowns
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
        logo: LOGO.src,
        links: NAV_LINKS.map((l) => l.text),
      },
    }];
  },
};
