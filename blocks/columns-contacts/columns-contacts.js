/*
 * Contact columns: side-by-side, centred text columns separated by dividers.
 *
 * Content model: 1 row, one cell per column (3 on the source page). Each cell holds a heading
 * followed by contact paragraphs (bold name, job title, mailto link). A cell may hold several
 * contacts: separate them with a horizontal rule (---) or simply start each with a bold name.
 * Extra rows are kept and laid out the same way; empty cells are dropped.
 */

function isBoldOnly(el) {
  if (el.tagName !== 'P') return false;
  const text = el.textContent.trim();
  const strong = el.querySelector('strong, b');
  return !!text && !!strong && strong.textContent.trim() === text;
}

/** split a column's children into contact groups at <hr> (or before each bold name) */
const BLOCK_TAGS = /^(P|H[1-6]|HR|UL|OL|DIV|PICTURE|TABLE|BLOCKQUOTE)$/;

/** single-paragraph cells arrive unwrapped: wrap loose inline content in <p> so it is kept */
function wrapInline(col) {
  let p = null;
  [...col.childNodes].forEach((node) => {
    const inline = node.nodeType === Node.TEXT_NODE
      || (node.nodeType === Node.ELEMENT_NODE && !BLOCK_TAGS.test(node.tagName));
    if (!inline) {
      p = null;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim() && !p) {
      node.remove();
      return;
    }
    if (!p) {
      p = document.createElement('p');
      node.before(p);
    }
    p.append(node);
  });
}

function groupColumn(col) {
  wrapInline(col);
  const nodes = [...col.children];
  const hasRule = nodes.some((n) => n.tagName === 'HR');
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const groups = [];
  let current = null;
  let seenName = false;

  nodes.forEach((node) => {
    if (node === heading && !current) {
      node.classList.add('columns-contacts-heading');
      return;
    }
    if (node.tagName === 'HR') {
      current = null;
      node.remove();
      return;
    }
    if (!hasRule && isBoldOnly(node)) {
      if (seenName) current = null;
      seenName = true;
    }
    if (!current) {
      current = document.createElement('div');
      current.className = 'columns-contacts-group';
      groups.push(current);
    }
    current.append(node);
  });

  groups.forEach((group) => {
    [...group.children].forEach((el) => {
      if (isBoldOnly(el)) el.classList.add('columns-contacts-name');
      else if (el.querySelector('a[href^="mailto:"], a[href^="tel:"]')) el.classList.add('columns-contacts-link');
    });
  });

  col.replaceChildren(...[heading].filter(Boolean), ...groups);
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  let maxCols = 0;
  [...block.children].forEach((row) => {
    row.classList.add('columns-contacts-row');
    [...row.children].forEach((col) => {
      if (!col.textContent.trim()) {
        col.remove();
        return;
      }
      col.classList.add('columns-contacts-col');
      groupColumn(col);
    });
    if (!row.children.length) row.remove();
    else maxCols = Math.max(maxCols, row.children.length);
  });
  if (maxCols) block.classList.add(`columns-contacts-${maxCols}-cols`);
}
