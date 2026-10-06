/**
 * true for an AEM Assets delivery player link, e.g.
 * https://delivery-p123-e456.adobeaemcloud.com/adobe/assets/urn:aaid:aem:.../play
 * (an HTML player page, not a video file)
 */
function isAssetsPlayer(url) {
  return /^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(url.hostname)
    && /^\/adobe\/assets\/[^/]+\/play\/?$/.test(url.pathname);
}

export default function decorate(block) {
  const anchor = block.querySelector('a');
  if (!anchor) return;

  const url = anchor.href;

  // AEM Assets player links embed Adobe's player
  if (isAssetsPlayer(new URL(url))) {
    const text = anchor.textContent.trim();
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = text && text !== url ? text : 'Video';
    iframe.loading = 'lazy';
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    anchor.replaceWith(iframe);
    return;
  }

  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.autoplay = false;
  video.style.width = '100%';

  anchor.replaceWith(video);
}
