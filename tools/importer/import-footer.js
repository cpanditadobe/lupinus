/* eslint-disable */
/* global WebImporter */

/**
 * Footer import: builds the site footer fragment (/footer) from the lupin.com US footer.
 *
 * Output is a flat fragment (one top-level <div> per column, no classes/ids) read by
 * blocks/footer/footer.js:
 *   [contact column] [nav column] [nav column] [nav column] [copyright]
 * Decorative graphics (flower background, back-to-top chevron) are block assets, not content.
 *
 * Links: migrated pages point to their new paths, everything else to absolute lupin.com URLs.
 * Links that open in a new tab on the source get a "#_blank" suffix (applied by footer.js).
 */
const ORIGIN = 'https://www.lupin.com';
const PATH_OVERRIDES = {
  '/US/product': '/us/hcpportal',
  '/US/contact-us': '/us/contact-us',
  // the source link is broken (doubled /US/): use the working PDF
  '/US/US/images/terms-of-use-lupin-us-website.pdf': `${ORIGIN}/US/images/terms-of-use-lupin-us-website.pdf`,
};

function mapHref(a) {
  const raw = a.getAttribute('href') || '';
  if (/^(tel|mailto):/i.test(raw)) return raw;
  const url = new URL(raw, `${ORIGIN}/US/`);
  let href = url.origin === ORIGIN && PATH_OVERRIDES[url.pathname]
    ? `${PATH_OVERRIDES[url.pathname]}${url.hash}`
    : url.href;
  if (a.getAttribute('target') === '_blank') href += '#_blank';
  return href;
}

function link(document, a, text) {
  const out = document.createElement('a');
  out.href = mapHref(a);
  if (text !== undefined) out.textContent = text;
  return out;
}

/** Bold heading paragraph (<p><strong>...</strong></p>): headings get no generated ids. */
function headingParagraph(document, ...content) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.append(...content);
  p.append(strong);
  return p;
}

/** Text with <br> line breaks preserved, whitespace collapsed. */
function linesOf(document, el) {
  const nodes = [];
  el.childNodes.forEach((n) => {
    if (n.nodeName === 'BR') {
      nodes.push(document.createElement('br'));
    } else if (n.textContent.trim()) {
      const text = n.textContent.replace(/\s+/g, ' ').trim();
      // merge text split by unwrapped inline elements (e.g. "Address" + ":")
      if (typeof nodes.at(-1) === 'string') nodes[nodes.length - 1] += text;
      else nodes.push(text);
    }
  });
  return nodes;
}

/*
 * Contact column. The importer has already unwrapped the source <span>s, so a group reads
 *   <div><div>Heading<br>…</div>Phone :<span> </span><a>…</a>Email :<span> </span><a>…</a></div>
 * and is rebuilt as a heading paragraph plus one "Label : <a>" paragraph per link.
 */
function contactColumn(document, address) {
  const col = document.createElement('div');
  const addr = address.querySelector('address');
  if (addr) {
    const p = document.createElement('p');
    linesOf(document, addr).forEach((n, i) => {
      const m = i === 0 && typeof n === 'string' && n.match(/^([^:]+):(.*)$/);
      if (m) {
        const strong = document.createElement('strong');
        strong.textContent = m[1].trim();
        p.append(strong, `:${m[2]}`);
      } else {
        p.append(n);
      }
    });
    col.append(p);
  }
  address.querySelectorAll(':scope > div').forEach((group) => {
    let label = '';
    group.childNodes.forEach((n) => {
      if (n.nodeName === 'DIV') {
        col.append(headingParagraph(document, ...linesOf(document, n)));
      } else if (n.nodeName === 'A') {
        const p = document.createElement('p');
        if (label) p.append(`${label} `);
        p.append(link(document, n, n.textContent.replace(/\u00a0/g, ' ').trim()));
        col.append(p);
        label = '';
      } else if (n.textContent.trim()) {
        label = n.textContent.trim();
      }
    });
  });
  address.querySelectorAll(':scope > a').forEach((a) => {
    const img = a.querySelector('img');
    const p = document.createElement('p');
    const out = link(document, a);
    if (img) {
      // _next/image?url=/US/images/... -> the original public image URL
      const src = new URL(img.getAttribute('src'), `${ORIGIN}/US/`);
      const original = src.searchParams.get('url');
      const image = document.createElement('img');
      image.src = original ? new URL(original, ORIGIN).href : src.href;
      image.alt = img.getAttribute('alt') || '';
      out.append(image);
    } else {
      out.textContent = a.textContent.trim();
    }
    p.append(out);
    col.append(p);
  });
  return col;
}

/*
 * Nav column: each group is a heading (a link, or plain text such as "PRIVACY") optionally
 * followed by a list of links (the source heading <span> is already unwrapped by the importer).
 */
function navColumn(document, column) {
  const col = document.createElement('div');
  column.querySelectorAll(':scope > div').forEach((group) => {
    group.childNodes.forEach((n) => {
      if (n.nodeName === 'A') {
        col.append(headingParagraph(document, link(document, n, n.textContent.trim())));
      } else if (n.nodeName === 'UL') {
        const ul = document.createElement('ul');
        n.querySelectorAll(':scope > li > a').forEach((a) => {
          const li = document.createElement('li');
          li.append(link(document, a, a.textContent.trim()));
          ul.append(li);
        });
        col.append(ul);
      } else if (n.nodeType === 3 && n.textContent.trim()) {
        col.append(headingParagraph(document, n.textContent.trim()));
      }
    });
  });
  return col;
}

export default {
  transform: ({ document }) => {
    const footer = document.querySelector('footer');
    const main = document.createElement('div');
    const sections = [];

    const address = footer.querySelector('.lupin_address');
    if (address) sections.push(contactColumn(document, address));
    footer.querySelectorAll('.nav_footer_container').forEach((c) => sections.push(navColumn(document, c)));
    const copyright = footer.querySelector('.copyright');
    if (copyright) {
      const col = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = copyright.textContent.trim();
      col.append(p);
      sections.push(col);
    }

    // sections are separated by <hr> (one fragment section per column)
    sections.forEach((s, i) => {
      if (i) main.append(document.createElement('hr'));
      main.append(...s.childNodes);
    });

    return [{
      element: main,
      path: '/footer',
      report: { template: 'footer', sections: sections.length },
    }];
  },
};
