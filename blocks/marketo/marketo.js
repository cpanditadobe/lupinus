import { decorateMarketoForm, getMarketoConfig } from '../../scripts/marketo.js';

/*
 * Marketo: embeds a Marketo form.
 *
 * Content model (1 row, 1 cell): a link carrying the form settings, e.g.
 *   https://pages.marketolive.com/?munchkinId=185-NGX-811&formId=2813
 * Any other content in the block (e.g. a heading or intro text) is kept above the form.
 */

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const link = [...block.querySelectorAll('a[href]')].find((a) => getMarketoConfig(a));
  if (!link) return;

  const content = document.createElement('div');
  content.className = 'marketo-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => content.append(...cell.childNodes));

  const target = link.closest('p') && content.contains(link.closest('p')) ? link.closest('p') : link;
  block.replaceChildren(content);
  decorateMarketoForm(target, getMarketoConfig(link));
}
