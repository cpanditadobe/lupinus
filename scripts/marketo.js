/*
 * Marketo forms embed, authored as a link carrying the form settings:
 *   https://pages.marketolive.com/?munchkinId=185-NGX-811&formId=2813
 * The link is replaced with the form, loaded from the link's host once it scrolls near view.
 */

const scripts = new Map();

function loadScript(src) {
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    }));
  }
  return scripts.get(src);
}

/**
 * Reads Marketo form settings from an authored link.
 * @param {HTMLAnchorElement} link
 * @returns {{ baseUrl: string, munchkinId: string, formId: string } | null}
 */
export function getMarketoConfig(link) {
  try {
    const url = new URL(link.href);
    const munchkinId = url.searchParams.get('munchkinId');
    const formId = url.searchParams.get('formId');
    if (!munchkinId || !/^\d+$/.test(formId || '')) return null;
    return { baseUrl: `https://${url.host}`, munchkinId, formId };
  } catch (e) {
    return null;
  }
}

/**
 * Replaces an element (typically the link's paragraph) with a lazily loaded Marketo form.
 * @param {Element} target element to replace
 * @param {{ baseUrl: string, munchkinId: string, formId: string }} config
 */
export function decorateMarketoForm(target, { baseUrl, munchkinId, formId }) {
  const container = document.createElement('div');
  container.className = 'marketo-form';
  const form = document.createElement('form');
  form.id = `mktoForm_${formId}`;
  container.append(form);
  target.replaceWith(container);

  const load = async () => {
    try {
      await loadScript(`${baseUrl}/js/forms2/js/forms2.min.js`);
      window.MktoForms2.loadForm(baseUrl, munchkinId, Number(formId));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Marketo form failed to load', e);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px' });
  observer.observe(container);
}
