/* eslint-disable */
/* global WebImporter */

/**
 * Nav import: builds the site nav fragment (/nav) with a single top-level link.
 * Source header (https://www.lupin.com/US/*) is not mirrored; the nav is
 * intentionally reduced to one "Contact your Representative" link pointing at
 * the source site's Contact Us page.
 */
const NAV_LINKS = [
  { text: 'Contact your Representative', href: '/US/contact-us' },
];

export default {
  transform: (payload) => {
    const { document } = payload;
    const main = document.createElement('div');

    // single section: one top-level link, no dropdown. No brand section is
    // emitted; blocks/header/header.js treats a lone link list as nav-sections.
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
        links: NAV_LINKS.map((l) => l.text),
      },
    }];
  },
};
