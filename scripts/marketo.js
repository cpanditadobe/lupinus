/*
 * Marketo forms embed, authored as a link carrying the form settings:
 *   https://pages.marketolive.com/?munchkinId=185-NGX-811&formId=2813
 * The link is replaced with the form, loaded from the link's host once it scrolls near view.
 * Name fields are pre-filled from the visitor's registration (scripts/register.js).
 */

import { getRegistration, REGISTRATION_EVENT } from './register.js';

/** Marketo field name -> registration property */
const PREFILL_FIELDS = { FirstName: 'firstName', LastName: 'lastName' };

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
 * Fills the form's name fields from a registration, or clears the filled values on sign-out
 * (registration null). A field the visitor has edited is kept.
 * @param {Object} form MktoForms2 form
 * @param {Object|null} registration stored registration
 * @param {Object} filled values this function set last time, by field name
 */
function prefillForm(form, registration, filled) {
  const current = form.vals();
  if (!registration) {
    const cleared = Object.fromEntries(Object.keys(filled)
      .filter((field) => current[field] === filled[field])
      .map((field) => [field, '']));
    Object.keys(filled).forEach((field) => delete filled[field]);
    if (Object.keys(cleared).length) form.vals(cleared);
    return;
  }
  const values = {};
  Object.entries(PREFILL_FIELDS).forEach(([field, key]) => {
    const value = typeof registration[key] === 'string' ? registration[key].trim() : '';
    if (!value || !(field in current)) return;
    if (current[field] && current[field] !== filled[field]) return;
    values[field] = value;
  });
  if (!Object.keys(values).length) return;
  form.vals(values);
  Object.assign(filled, values);
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
      window.MktoForms2.loadForm(baseUrl, munchkinId, Number(formId), (mktoForm) => {
        const filled = {};
        prefillForm(mktoForm, getRegistration(), filled);
        window.addEventListener(REGISTRATION_EVENT, (e) => prefillForm(mktoForm, e.detail, filled));
      });
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
