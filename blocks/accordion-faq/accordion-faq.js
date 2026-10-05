/*
 * FAQ accordion: collapsible question / answer rows, all collapsed by default.
 *
 * Content model: one row per question, 2 cells:
 *   [question text (plain paragraph or heading)] | [answer paragraphs, lists, inline links]
 * A row with a single cell becomes a question with no answer body. Uses native
 * <details>/<summary>, so it works without JS state and in-page find can open answers.
 * A question authored as a heading keeps its heading element (for the page outline).
 */

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture'));
    if (!cells.length) return;
    const [label, ...rest] = cells;

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const blocks = [...label.children];
    if (blocks.length === 1 && blocks[0].tagName === 'P') summary.append(...blocks[0].childNodes);
    else summary.append(...label.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary);
    if (body.childNodes.length) details.append(body);
    else details.classList.add('no-answer');
    items.push(details);
  });
  block.replaceChildren(...items);
}
