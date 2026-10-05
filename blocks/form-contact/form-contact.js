import { toClassName } from '../../scripts/aem.js';

/*
 * Contact form (layout + client-side validation).
 *
 * Content model: one row per field, cells
 *   [Label] | [Type] | [Name] | [Required: yes/no] | [Options or placeholder]
 * Type: text | email | tel | select | textarea | checkbox | submit
 *       (unknown types fall back to text).
 * Options cell: for select, one option per paragraph/line (the first is the default);
 *               for checkbox, the rich-text label (links kept); otherwise the placeholder.
 *
 * Optional config rows (2 cells, anywhere in the block):
 *   Action  | <url>   endpoint the form posts to. Without it the form NEVER sends data:
 *                     submit validates on the client and shows a neutral inline message.
 *   Message | <text>  overrides the inline message shown after a valid submit.
 *
 * An optional header row (Label | Type | ...) is ignored.
 */

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'url', 'date', 'select', 'textarea', 'checkbox', 'submit'];
const CONFIG_KEYS = ['action', 'message'];
const TRUTHY = ['yes', 'y', 'true', 'required', 'x', '1'];
const DEFAULT_MESSAGE = 'Thank you. This form is not accepting online submissions yet, '
  + 'so your details have not been sent.';
const TEL_PATTERN = '[0-9 +.\\(\\)\\-]{6,20}';

let formCount = 0;

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/** split a cell into lines: one per paragraph / list item, or per <br>-separated line */
function cellLines(cell) {
  if (!cell) return [];
  const blocks = cell.querySelectorAll('p, li');
  const sources = blocks.length ? [...blocks] : [cell];
  return sources
    .flatMap((el) => {
      const lines = [''];
      el.childNodes.forEach((node) => {
        if (node.nodeName === 'BR') lines.push('');
        else lines[lines.length - 1] += node.textContent;
      });
      return lines;
    })
    .map((line) => line.trim())
    .filter(Boolean);
}

/** only allow http(s) or site-relative endpoints */
function safeAction(cell) {
  const href = cell?.querySelector('a[href]')?.getAttribute('href') || cellText(cell);
  if (!href) return '';
  try {
    const url = new URL(href, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (e) {
    return '';
  }
}

function parseRows(block) {
  const config = {};
  const fields = [];
  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    const key = cellText(cells[0]).toLowerCase();
    if (!key && !cellText(cells[1])) return;

    // config row: "Action | url" / "Message | text" with no further cells filled in
    const isConfig = CONFIG_KEYS.includes(key)
      && !FIELD_TYPES.includes(toClassName(cellText(cells[1])))
      && cells.slice(2).every((c) => !cellText(c));
    if (isConfig) {
      config[key] = key === 'action' ? safeAction(cells[1]) : cellText(cells[1]);
      return;
    }
    // header row
    if (index === 0 && key === 'label' && cellText(cells[1]).toLowerCase() === 'type') return;

    const rawType = toClassName(cellText(cells[1])) || 'text';
    const type = FIELD_TYPES.includes(rawType) ? rawType : 'text';
    const label = cellText(cells[0]);
    fields.push({
      type,
      label,
      labelCell: cells[0],
      name: toClassName(cellText(cells[2])) || toClassName(label) || `field-${fields.length + 1}`,
      required: TRUTHY.includes(cellText(cells[3]).toLowerCase()),
      extraCell: cells[4],
    });
  });
  return { config, fields };
}

function buildControl(field, id) {
  const { type, name, required } = field;
  let control;
  if (type === 'select') {
    control = document.createElement('select');
    cellLines(field.extraCell).forEach((text, i) => {
      const option = document.createElement('option');
      option.value = text;
      option.textContent = text;
      if (i === 0) option.selected = true;
      control.append(option);
    });
  } else if (type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 5;
  } else {
    control = document.createElement('input');
    control.type = type;
    if (type === 'tel') {
      control.inputMode = 'tel';
      control.pattern = TEL_PATTERN;
      control.autocomplete = 'tel';
    }
    if (type === 'email') control.autocomplete = 'email';
  }
  if (type !== 'select' && type !== 'checkbox') {
    // the label doubles as the in-box placeholder unless one was authored
    control.placeholder = cellText(field.extraCell) || field.label;
  }
  control.id = id;
  control.name = name;
  if (required) {
    control.required = true;
    control.setAttribute('aria-required', 'true');
  }
  return control;
}

function buildCheckboxLabel(field, id) {
  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'form-contact-checkbox-label';
  const source = field.extraCell && cellText(field.extraCell) ? field.extraCell : field.labelCell;
  const paragraphs = source.querySelectorAll('p');
  if (paragraphs.length) {
    paragraphs.forEach((p, i) => {
      if (i) label.append(' ');
      label.append(...p.childNodes);
    });
  } else {
    label.append(...source.childNodes);
  }
  return label;
}

function buildField(field, formId) {
  const id = `${formId}-${field.name}`;
  const wrapper = document.createElement('div');
  wrapper.className = `form-contact-field form-contact-field-${field.type}`;
  if (field.required) wrapper.classList.add('required');

  const control = buildControl(field, id);
  if (field.type === 'checkbox') {
    control.value = 'yes';
    wrapper.append(control, buildCheckboxLabel(field, id));
  } else {
    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'form-contact-label';
    label.textContent = field.label || field.name;
    wrapper.append(label, control);
  }

  const error = document.createElement('p');
  error.className = 'form-contact-error';
  error.id = `${id}-error`;
  error.hidden = true;
  wrapper.append(error);
  control.setAttribute('aria-describedby', error.id);
  return wrapper;
}

function buildSubmit(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-contact-field form-contact-field-submit';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button primary form-contact-submit';
  const text = document.createElement('span');
  text.textContent = field?.label || 'Submit';
  const icon = document.createElement('span');
  icon.className = 'form-contact-submit-icon';
  icon.setAttribute('aria-hidden', 'true');
  button.append(text, icon);
  wrapper.append(button);
  return wrapper;
}

function setError(control, message) {
  const error = control.closest('.form-contact-field')?.querySelector('.form-contact-error');
  if (message) {
    control.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  } else {
    control.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  }
}

function validate(form) {
  const controls = Array.from(form.querySelectorAll('input, select, textarea'));
  let firstInvalid = null;
  controls.forEach((control) => {
    if (control.checkValidity()) {
      setError(control, '');
    } else {
      setError(control, control.validationMessage);
      if (!firstInvalid) firstInvalid = control;
    }
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function showStatus(status, message, state) {
  status.textContent = message;
  status.dataset.state = state;
  status.hidden = false;
}

async function send(form, action) {
  const data = Object.fromEntries(new FormData(form).entries());
  const response = await fetch(action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  formCount += 1;
  const formId = `form-contact-${formCount}`;
  const { config, fields } = parseRows(block);

  const form = document.createElement('form');
  form.noValidate = true;
  form.id = formId;

  const grid = document.createElement('div');
  grid.className = 'form-contact-fields';
  let submitField = null;
  fields.forEach((field) => {
    if (field.type === 'submit') {
      submitField = field;
      return;
    }
    grid.append(buildField(field, formId));
  });
  form.append(grid, buildSubmit(submitField));

  const status = document.createElement('p');
  status.className = 'form-contact-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.hidden = true;
  form.append(status);

  // clear a field's error as soon as it becomes valid
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') && e.target.checkValidity()) setError(e.target, '');
  });
  form.addEventListener('change', (e) => {
    if (e.target.getAttribute('aria-invalid') && e.target.checkValidity()) setError(e.target, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.hidden = true;
    if (!validate(form)) return;

    const message = config.message || DEFAULT_MESSAGE;
    // no Action row authored: never send data anywhere
    if (!config.action) {
      showStatus(status, message, 'info');
      return;
    }

    const button = form.querySelector('.form-contact-submit');
    button.disabled = true;
    try {
      await send(form, config.action);
      form.reset();
      showStatus(status, config.message || 'Thank you. Your message has been sent.', 'success');
    } catch (err) {
      showStatus(status, 'Sorry, your message could not be sent. Please try again later.', 'error');
    } finally {
      button.disabled = false;
    }
  });

  block.replaceChildren(form);
}
