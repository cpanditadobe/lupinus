/*
 * Location cards: a grid of text-only cards (no images).
 *
 * Content model: one row per location, 1 cell containing
 *   h3 city; p label (bold); p description;
 *   p address lines separated by <br> (last line "Phone: ...").
 *
 * Roles are inferred defensively: the heading is the title, a bold-only paragraph (or the
 * paragraph directly after the heading when there are 3+ paragraphs) is the label; the last
 * paragraph is the address when it has line breaks / a phone line or follows a description.
 * Extra cells in a row are merged into the card body; empty rows are dropped.
 */

const PHONE_PATTERN = /(phone|tel)\s*[:.]/i;

function isBoldOnly(p) {
  const text = p.textContent.trim();
  if (!text) return false;
  const strong = p.querySelector('strong, b');
  return !!strong && strong.textContent.trim() === text;
}

/** remove trailing <br>s and whitespace-only text (e.g. "&nbsp;") from the end of an address */
function trimTrailingBreaks(p) {
  let last = p.lastChild;
  while (last && ((last.nodeType === Node.TEXT_NODE && !last.textContent.trim())
    || (last.nodeType === Node.ELEMENT_NODE && last.tagName === 'BR'))) {
    last.remove();
    last = p.lastChild;
  }
}

function decorateBody(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-location-title');

  const paragraphs = [...body.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim());
  if (!paragraphs.length) return;

  let rest = paragraphs;
  const [first] = paragraphs;
  const afterHeading = heading && heading.nextElementSibling === first;
  if (isBoldOnly(first) || (afterHeading && paragraphs.length >= 3)) {
    first.classList.add('cards-location-label');
    rest = paragraphs.slice(1);
  }

  const last = rest[rest.length - 1];
  if (last && (last.querySelector('br') || PHONE_PATTERN.test(last.textContent) || rest.length >= 2)) {
    last.classList.add('cards-location-address');
    trimTrailingBreaks(last);
    rest = rest.slice(0, -1);
  }

  rest.forEach((p) => p.classList.add('cards-location-description'));
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-location-card';
    const body = document.createElement('div');
    body.className = 'cards-location-card-body';
    [...row.children].forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });
    decorateBody(body);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
