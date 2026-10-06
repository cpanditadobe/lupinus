export default function decorate(block) {
  const anchor = block.querySelector('a');
  if (!anchor) return;

  const url = anchor.href;
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.autoplay = false;
  video.style.width = '100%';

  anchor.replaceWith(video);
}
