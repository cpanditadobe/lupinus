import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero green panel: mid-page section-title banner. A full-bleed photo with the title in a
 * green panel (rounded right edge) laid over its left side.
 *
 * Content model: 1 row, 1 cell (or picture and heading in separate cells/rows):
 *   picture (background photo) + h2 title (any other text stays with the title).
 */

function isSameOrigin(img) {
  try {
    return new URL(img.src, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const panel = document.createElement('div');
  panel.className = 'hero-green-panel-panel';

  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'PICTURE') return;
        if (picture && node.contains(picture) && !node.textContent.trim()) return;
      }
      panel.append(node);
    });
  });

  const children = [];
  if (picture) {
    const media = document.createElement('div');
    media.className = 'hero-green-panel-media';
    const img = picture.querySelector('img');
    // createOptimizedPicture drops the query string (breaks /_next/image?url=...)
    if (img && isSameOrigin(img)) {
      media.append(createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]));
    } else {
      if (img) img.loading = 'lazy';
      media.append(picture);
    }
    media.querySelectorAll('img').forEach((i) => { if (!i.alt) i.alt = ''; });
    children.push(media);
  } else {
    block.classList.add('no-image');
  }
  children.push(panel);
  block.replaceChildren(...children);

  // the source steps long titles down one size (subtitle_58 instead of subtitle_60)
  const title = panel.querySelector('h1, h2, h3');
  if (title && title.textContent.trim().length > 60) block.classList.add('long-title');
}
