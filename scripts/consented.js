// add functionality that requires user consent here (analytics, martech, etc.)

/**
 * Marketo Munchkin tracking, on every page except the nav and footer fragments.
 */
function loadMunchkin() {
  const path = window.location.pathname.replace(/(\.plain)?\.html$/, '');
  if (['/nav', '/footer'].includes(path)) return;

  let didInit = false;
  const init = () => {
    if (didInit || !window.Munchkin) return;
    didInit = true;
    window.Munchkin.init('185-NGX-811', { wsInfo: 'iklZbMU%3D' });
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://munchkin.marketo.net/munchkin.js';
  script.onload = init;
  document.head.append(script);
}

loadMunchkin();
