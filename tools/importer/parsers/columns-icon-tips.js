/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-icon-tips. Base: columns.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selector: #info-1 > section.inhaler_tips div.support_inhaler_wrapper
 * Validated against migration-work/block-context/columns-icon-tips/source.html:
 *   div.support_inhaler_wrapper
 *     > h3.subtitle_30 "Tips for Taking ..."                         -> default content (before block)
 *     > div.tips_container > div.tips_flex_container
 *         > img.tips_img + div.tips_content > div.subtitle_4538 "Do"/"Don't" + ul.lupin_points
 *                                                                    -> block rows
 *     > div.tips_container > h3 + p / ol / ul (Step-by-step, Use the..., Additional Information x2)
 *                                                                    -> default content (after block)
 * Output (blocks/columns-icon-tips): one row per Do/Don't group, 2 cells:
 *   [icon picture] | [h3 Do/Don't + list]
 * Only the icon tip groups become the block; every other child stays in place, in source order,
 * as default content around it.
 */

// A tip group = a tips_container with an icon image and a heading + list
function isTipGroup(node) {
  if (node.nodeType !== 1) return false;
  return !!(node.querySelector('img.tips_img, .tips_flex_container img')
    && node.querySelector('.tips_content ul, .tips_content ol'));
}

// Unwrap layout divs so default content is plain headings/paragraphs/lists
function defaultContent(node) {
  if (node.nodeType === 3) return node.textContent.trim() ? [node] : [];
  if (node.nodeType !== 1) return [];
  if (node.tagName === 'DIV') return [...node.childNodes].flatMap(defaultContent);
  return [node];
}

export default function parse(element, { document }) {
  const before = [];
  const after = [];
  const cells = [];

  [...element.childNodes].forEach((child) => {
    if (isTipGroup(child)) {
      const srcImg = child.querySelector('img.tips_img, .tips_flex_container img');
      const content = child.querySelector('.tips_content') || child;
      const headingEl = content.querySelector('[class*="subtitle"], h2, h3, h4');
      const list = content.querySelector('ul, ol');

      const iconCell = [];
      if (srcImg) {
        const img = document.createElement('img');
        img.src = srcImg.getAttribute('src');
        img.alt = srcImg.getAttribute('alt') || '';
        iconCell.push(img);
      }
      const textCell = [];
      if (headingEl) {
        const h3 = document.createElement('h3');
        h3.textContent = headingEl.textContent.trim();
        textCell.push(h3);
      }
      if (list) textCell.push(list);
      cells.push([iconCell.length ? iconCell : '', textCell.length ? textCell : '']);
    } else {
      (cells.length ? after : before).push(...defaultContent(child));
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-icon-tips', cells });
  if (before.length) element.before(...before);
  if (after.length) element.after(...after);
  element.replaceWith(block);
}
