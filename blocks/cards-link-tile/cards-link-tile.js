/**
 * Link tiles: a centered row of bordered, fully clickable text tiles with a decorative arrow.
 * Content model: one row per tile, 1 cell containing a link (tile text = link text).
 * Rows without a link render as non-clickable tiles; empty rows are dropped.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;

    const li = document.createElement('li');
    li.className = 'cards-link-tile-item';
    const link = row.querySelector('a[href]');

    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'cards-link-tile-tile';
    if (link) {
      tile.href = link.getAttribute('href');
      if (link.title) tile.title = link.title;
      if (link.target) tile.target = link.target;
    }

    const label = document.createElement('span');
    label.className = 'cards-link-tile-label';
    label.textContent = (link?.textContent.trim()) || text;

    const arrow = document.createElement('span');
    arrow.className = 'cards-link-tile-arrow';
    arrow.setAttribute('aria-hidden', 'true');

    tile.append(label, arrow);
    li.append(tile);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
