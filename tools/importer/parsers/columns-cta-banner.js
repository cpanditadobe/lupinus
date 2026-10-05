/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta-banner. Base: columns.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selectors: #card > div.gp_saving_wrapper (patient), #card-1 > div.gp_saving_wrapper (HCP)
 * Validated against migration-work/block-context/columns-cta-banner/source.html (+ instances/01.html):
 *   div.gp_saving_wrapper
 *     > div.gp_saving_container
 *         > div.subtitle_5217 (statement)
 *         > div.cta_container > a.black_cta[href] > span (label) + img (decorative arrow - skipped)
 *     > img.rectangle_img (savings card - HCP instance only)
 *   Patient instance: the card is the section's sibling <p><picture><img class="tolvaptan_bg_img">.
 * Output (blocks/columns-cta-banner): 1 row, 2 cells:
 *   [<p>statement</p>; <p><strong><a href=source>CTA label</a></strong></p>] | [card img]
 * The cell is left empty when no card image is found.
 */
export default function parse(element, { document }) {
  const container = element.querySelector('.gp_saving_container') || element;

  const textCell = [];
  const statement = container.querySelector('[class*="subtitle"], h2, h3, p');
  if (statement && statement.textContent.trim()) {
    const p = document.createElement('p');
    [...statement.childNodes].forEach((n) => p.append(n.cloneNode(true)));
    textCell.push(p);
  }

  const cta = container.querySelector('.cta_container a[href], a.black_cta, a[href]');
  if (cta) {
    const label = (cta.querySelector('span') || cta).textContent.replace(/\s+/g, ' ').trim();
    if (label) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      textCell.push(p);
    }
  }

  // Savings card image: outside the text container, never the CTA arrow icon.
  //   HCP (#card-1): <img class="rectangle_img"> inside the wrapper.
  //   Patient (#card): the card is a sibling of the wrapper in the same section:
  //     <section id="card"><div class="gp_saving_wrapper">..</div><p><picture><img class="tolvaptan_bg_img"></picture></p>
  //   It is moved into the block (removed from the section so it isn't duplicated as default content).
  const section = element.parentElement;
  let cardImg = element.querySelector('img.rectangle_img')
    || [...element.querySelectorAll('img')].find((img) => !img.closest('a') && !container.contains(img));
  if (!cardImg && section) {
    const sibling = [...section.children].find((c) => c !== element && c.querySelector('picture img, img.tolvaptan_bg_img'));
    if (sibling) {
      cardImg = sibling.querySelector('picture img, img.tolvaptan_bg_img');
      sibling.remove();
    }
  }
  // Decorative green shape behind the HCP card: <img class="hcp_saving_img" alt=""> (styled by CSS)
  if (section) section.querySelectorAll(':scope > img.hcp_saving_img').forEach((img) => img.remove());
  const imageCell = [];
  if (cardImg) {
    const img = document.createElement('img');
    img.src = cardImg.getAttribute('src');
    img.alt = cardImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  if (!textCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', imageCell.length ? imageCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta-banner', cells });
  element.replaceWith(block);
}
