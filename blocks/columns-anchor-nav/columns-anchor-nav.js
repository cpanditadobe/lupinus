/*
 * Anchor nav: a stacked list of in-page links beside intro text.
 *
 * Content model (1 row, 2 cells):
 *   [one paragraph link per nav item, hrefs kept exactly (#about, #take, #faq, a PDF, ...)]
 *   | [h3 subheading, paragraphs, bullet list, h3 subheading, paragraphs]
 * The nav cell is the cell made only of links (normally the first). Links are rendered as a
 * <nav> list of pills. Hash links are left to the page (tabs-audience selects the right panel
 * and scrolls). The decorative flower is CSS, not authored.
 */

function isLinkOnly(cell) {
  const links = cell.querySelectorAll('a[href]');
  if (!links.length) return false;
  const linkText = [...links].map((a) => a.textContent).join('').replace(/\s+/g, '');
  return linkText === cell.textContent.replace(/\s+/g, '');
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const navCell = cells.find(isLinkOnly);
  const textCells = cells.filter((c) => c !== navCell && (c.textContent.trim() || c.querySelector('picture')));

  const children = [];
  if (navCell) {
    const nav = document.createElement('nav');
    nav.className = 'columns-anchor-nav-nav';
    nav.setAttribute('aria-label', 'On this page');
    const list = document.createElement('ul');
    navCell.querySelectorAll('a[href]').forEach((a) => {
      // drop global button styling; the block renders its own pills
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      a.classList.add('columns-anchor-nav-link');
      const li = document.createElement('li');
      li.append(a);
      list.append(li);
    });
    nav.append(list);
    children.push(nav);
  } else {
    block.classList.add('no-nav');
  }

  const text = document.createElement('div');
  text.className = 'columns-anchor-nav-text';
  textCells.forEach((cell) => {
    cell.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
    text.append(...cell.childNodes);
  });
  if (text.childNodes.length) children.push(text);

  block.replaceChildren(...children);
}
