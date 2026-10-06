/*
 * Registration dialog. Any link to "#register" or ".../register" opens a dialog asking for
 * first name, last name and email; "Register Now" validates the fields and stores them in
 * the lupin_registration cookie (JSON, URI-encoded, one year, site-wide).
 * Existing values pre-fill the form. A successful registration fires REGISTRATION_EVENT on window.
 * Links to "#sign-out" or ".../sign-out" delete the cookie; they are shown only while registered.
 */

const COOKIE_NAME = 'lupin_registration';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
// authored as paths (e.g. /us/register): the content sync rewrites "#…" links to "/"
const REGISTER = 'register';
const SIGN_OUT = 'sign-out';

/** true for a link to "#{name}" or a path ending in "/{name}" */
function linksTo(a, name) {
  const href = a.getAttribute('href') || '';
  if (href.endsWith(`#${name}`)) return true;
  try {
    return new URL(href, window.location.href).pathname.replace(/\/$/, '').endsWith(`/${name}`);
  } catch (e) {
    return false;
  }
}

/** fired on window after a registration is saved (detail = the registration) or cleared (null) */
export const REGISTRATION_EVENT = 'registration:update';

/** @returns {{ firstName: string, lastName: string, email: string } | null} */
export function getRegistration() {
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  try {
    return JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)));
  } catch (e) {
    return null;
  }
}

function saveRegistration(data) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const value = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function clearRegistration() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}

function buildField(name, label, type, autocomplete) {
  const id = `register-${name}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'register-field';
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  const input = document.createElement('input');
  Object.assign(input, {
    id, name, type, autocomplete, required: true,
  });
  wrapper.append(labelEl, input);
  return wrapper;
}

function buildDialog(title) {
  const dialog = document.createElement('dialog');
  dialog.className = 'register-dialog';
  dialog.setAttribute('aria-labelledby', 'register-title');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'register-close';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => dialog.close());

  const heading = document.createElement('h2');
  heading.id = 'register-title';
  heading.textContent = title;

  const form = document.createElement('form');
  form.className = 'register-form';
  form.method = 'dialog';
  form.append(
    buildField('firstName', 'First Name', 'text', 'given-name'),
    buildField('lastName', 'Last Name', 'text', 'family-name'),
    buildField('email', 'Email', 'email', 'email'),
  );
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button primary';
  submit.textContent = 'Register Now';
  form.append(submit);

  const status = document.createElement('p');
  status.className = 'register-status';
  status.setAttribute('role', 'status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(
      ['firstName', 'lastName', 'email'].map((k) => [k, form.elements[k].value.trim()]),
    );
    saveRegistration(data);
    window.dispatchEvent(new CustomEvent(REGISTRATION_EVENT, { detail: data }));
    status.textContent = `Thank you, ${data.firstName}. You are registered.`;
    form.hidden = true;
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close(); // backdrop click
  });

  dialog.append(close, heading, form, status);
  return dialog;
}

function openDialog(dialog) {
  const form = dialog.querySelector('form');
  const saved = getRegistration();
  form.hidden = false;
  dialog.querySelector('.register-status').textContent = '';
  if (saved) {
    Object.entries(saved).forEach(([k, v]) => {
      if (form.elements[k]) form.elements[k].value = v;
    });
  }
  dialog.showModal();
  form.elements.firstName.focus();
}

/**
 * Turns links to #register or .../register inside a container into triggers for the
 * registration dialog.
 * @param {Element} container element holding the links; the dialog is appended to it
 */
export function decorateRegisterLinks(container) {
  const links = [...container.querySelectorAll('a[href]')].filter((a) => linksTo(a, REGISTER));
  if (!links.length) return;
  const dialog = buildDialog(links[0].textContent.trim() || 'Register');
  container.append(dialog);
  links.forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openDialog(dialog);
      dialog.addEventListener('close', () => link.focus(), { once: true });
    });
  });
}

/**
 * Turns links to #sign-out or .../sign-out inside a container into sign-out buttons that delete
 * the registration cookie. Each link (its list item, if any) is hidden while nobody is registered.
 * @param {Element} container element holding the links
 */
export function decorateSignOutLinks(container) {
  const links = [...container.querySelectorAll('a[href]')].filter((a) => linksTo(a, SIGN_OUT));
  if (!links.length) return;
  const show = (registration) => links.forEach((link) => {
    (link.closest('li') || link).hidden = !registration;
  });
  show(getRegistration());
  window.addEventListener(REGISTRATION_EVENT, (e) => show(e.detail));
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      clearRegistration();
      window.dispatchEvent(new CustomEvent(REGISTRATION_EVENT, { detail: null }));
      // the link is now hidden; keep focus in the nav
      container.querySelector('a[aria-haspopup="dialog"]')?.focus();
    });
  });
}
