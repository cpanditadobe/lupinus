import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero banner: full-bleed background image with a page title overlaid at lower left.
 * Content model: 1 row (or more), cells containing a picture and a heading.
 * Authors may put the picture and heading in the same cell or in separate cells/rows.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      if (node.nodeType === Node.ELEMENT_NODE) {
        // drop the picture (or a paragraph that only wraps it); it is handled separately
        if (node.tagName === 'PICTURE') return;
        if (picture && node.contains(picture) && !node.textContent.trim()) return;
      }
      content.append(node);
    });
  });

  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  if (picture) {
    const img = picture.querySelector('img');
    // createOptimizedPicture rewrites the query string, which breaks external image
    // services (e.g. /_next/image?url=...), so only optimize same-origin images.
    const sameOrigin = img
      && new URL(img.src, window.location.href).origin === window.location.origin;
    if (img && sameOrigin) {
      media.append(createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]));
    } else {
      if (img) {
        // banner is the LCP image: load it eagerly
        img.loading = 'eager';
        img.fetchPriority = 'high';
      }
      media.append(picture);
    }
  } else {
    block.classList.add('no-image');
  }

  block.replaceChildren(...(picture ? [media] : []), content);
}
