/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-product-detail. Base: columns.
 * Source: https://www.lupin.com/US/product/glycerol-phenylbutyrate-oral-liquid
 * Selector: section.product_detail_section > div.product_detail_wrapper
 * Validated against migration-work/block-context/columns-product-detail/source.html:
 *   div.product_detail_wrapper
 *     > div.product_detail_item > img
 *     > div.product_detail_container
 *         > h1
 *         > div.product_info > div.info_item (div.info_title, span ":", div.info_detail)
 *         > div.btn_container > div.product_pdf > a.pdf_link (PDFs)
 *                             > div.popup_pdf > a.product_btn "Download Co-pay Savings Card" (href="#"),
 *                                               div.para "General Terms & Conditions" (no link)
 * Output (blocks/columns-product-detail): 1 row, 2 cells:
 *   [picture] | [h1; ul of "<strong>Label</strong>: value"; one <p><strong><a>PDF</a></strong></p> per PDF;
 *               <p><em><a href="#copay-terms">Download Co-pay Savings Card</a></em></p>;
 *               <p><a href="#copay-terms">General Terms & Conditions</a></p>]
 */
const COPAY_HREF = '#copay-terms';

export default function parse(element, { document }) {
  const container = element.querySelector('.product_detail_container') || element;

  // Product photo
  const srcImg = element.querySelector('.product_detail_item img') || element.querySelector('img');
  const imageCell = [];
  if (srcImg) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const content = [];

  // Product name
  const heading = container.querySelector('h1, h2, [class*="subtitle"]');
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.trim();
    content.push(h1);
  }

  // Spec list: "<strong>Label</strong>: value"
  const items = [...container.querySelectorAll('.product_info .info_item, .info_item')]
    .filter((item, i, arr) => arr.indexOf(item) === i);
  if (items.length) {
    const ul = document.createElement('ul');
    items.forEach((item) => {
      const label = item.querySelector('.info_title');
      const value = item.querySelector('.info_detail');
      if (!label && !value) return;
      const li = document.createElement('li');
      if (label) {
        const strong = document.createElement('strong');
        strong.textContent = label.textContent.trim();
        li.append(strong);
      }
      li.append(`: ${value ? value.textContent.trim() : ''}`);
      ul.append(li);
    });
    if (ul.children.length) content.push(ul);
  }

  // PDF links: one paragraph per link, bold
  const pdfLinks = [...container.querySelectorAll('.product_pdf a')];
  pdfLinks.forEach((src) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = src.getAttribute('href');
    a.textContent = src.textContent.trim();
    strong.append(a);
    p.append(strong);
    content.push(p);
  });

  // Co-pay actions: both point at the co-pay terms modal section
  const popup = container.querySelector('.popup_pdf');
  if (popup) {
    const copayBtn = popup.querySelector('a');
    if (copayBtn) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      const a = document.createElement('a');
      a.href = COPAY_HREF;
      a.textContent = copayBtn.textContent.trim();
      em.append(a);
      p.append(em);
      content.push(p);
    }
    const terms = popup.querySelector('.para');
    if (terms && terms.textContent.trim()) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = COPAY_HREF;
      a.textContent = terms.textContent.trim();
      p.append(a);
      content.push(p);
    }
  }

  if (!imageCell.length && !content.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[imageCell.length ? imageCell : '', content.length ? content : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product-detail', cells });
  element.replaceWith(block);
}
