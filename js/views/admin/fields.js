window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.fields = (function () {

  const { h, when } = Logi.core.dom;
  const store = Logi.core.store;
  const toast = Logi.core.toast;
  const { LANGUAGES } = Logi.data.config;
  const { processImage } = Logi.util.image;

  let editLang = 'en';

  function getEditLang() {
    return editLang;
  }

  function editLangSwitch(onChange) {
    const group = h('div.segmented', { role: 'group', 'aria-label': 'Editing language' });

    const paint = () => {
      group.replaceChildren(
        ...LANGUAGES.map((lang) =>
          h('button.segmented__btn', {
            type: 'button',
            text: lang.label,
            lang: lang.htmlLang,
            title: `Edit ${lang.name}`,
            'aria-pressed': String(editLang === lang.code),
            on: {
              click: () => {
                if (editLang === lang.code) return;
                editLang = lang.code;
                paint();
                onChange?.(lang.code);
              },
            },
          })
        )
      );
    };

    paint();
    return group;
  }


  let saveTimer = 0;
  let pendingToast = false;

  function patch(mutator) {
    const result = store.update(mutator, { silent: true });
    reportSaveFailure(result);
    refreshDirtyBadges();
  }

  function patchDebounced(mutator, delay = 350) {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => patch(mutator), delay);
  }

  function commit(mutator, message) {
    window.clearTimeout(saveTimer);
    const result = store.update(mutator);
    if (!reportSaveFailure(result) && message) toast.show(message);
  }

  function reportSaveFailure(result) {
    if (result?.ok) return false;
    if (pendingToast) return true;
    pendingToast = true;
    window.setTimeout(() => {
      pendingToast = false;
    }, 4000);

    toast.error(
      result?.reason === 'quota'
        ? 'Browser storage is full. Publish your changes, or remove some gallery photos.'
        : 'Could not save to this browser. Your changes will be lost when you close the tab.'
    );
    return true;
  }

  function refreshDirtyBadges() {
    for (const badge of document.querySelectorAll('.admin__status')) {
      badge.dataset.dirty = String(store.isDirty());
      const label = badge.querySelector('[data-role="status-label"]');
      if (label) {
        label.textContent = store.isDirty() ? 'UNPUBLISHED CHANGES' : 'PUBLISHED';
      }
    }
  }


  function field(label, control, { hint } = {}) {
    return h(
      'label.field',
      {},
      h('span.field__label', { text: label }),
      control,
      when(hint, () => h('span.hint', { text: hint }))
    );
  }

  function textInput({
    label,
    value,
    onInput,
    type = 'text',
    placeholder = '',
    hint,
    small = true,
  }) {
    const input = h('input.input', {
      class: small ? 'input--sm' : null,
      type,
      value: value ?? '',
      placeholder,
      on: {
        input: (event) => onInput(event.currentTarget.value),
        change: (event) => onInput(event.currentTarget.value),
      },
    });
    return field(label, input, { hint });
  }

  function textArea({ label, value, onInput, rows = 3, hint }) {
    const area = h('textarea.textarea.textarea--sm', {
      rows: String(rows),
      on: {
        input: (event) => onInput(event.currentTarget.value),
        change: (event) => onInput(event.currentTarget.value),
      },
    });
    area.value = value ?? '';
    return field(label, area, { hint });
  }

  function checkboxInput({ label, checked, onChange, hint }) {
    const input = h('input.checkbox', {
      type: 'checkbox',
      checked: !!checked,
      on: { change: (event) => onChange(event.currentTarget.checked) },
    });
    return h(
      'label.field.field--checkbox',
      {},
      h('span', {}, input, h('span', { text: ` ${label}` })),
      when(hint, () => h('span.hint', { text: hint }))
    );
  }

  function select({ label, value, options, onInput, hint }) {
    const el = h(
      'select.select.select--sm',
      { on: { change: (event) => onInput(event.currentTarget.value) } },
      options.map((option) =>
        h('option', {
          value: option.value,
          text: option.label,
          selected: String(option.value) === String(value ?? ''),
        })
      )
    );
    return field(label, el, { hint });
  }

  function imageInput({ label, value, onChange, hint }) {
    const preview = h('img.admin-editor__preview', {
      src: value || '',
      alt: '',
      hidden: !value,
    });

    const input = h('input.input.input--sm.input--file', {
      type: 'file',
      accept: 'image/*',
      on: {
        change: async (event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          try {
            const dataUrl = await processImage(file);
            preview.src = dataUrl;
            preview.hidden = false;
            onChange(dataUrl);
          } catch (err) {
            toast.error(err.message || 'Could not read that image.');
          } finally {
            event.currentTarget.value = '';
          }
        },
      },
    });

    const remove = h('button.btn-plain.btn-plain--danger', {
      type: 'button',
      text: 'Remove photo',
      hidden: !value,
      on: {
        click: () => {
          preview.src = '';
          preview.hidden = true;
          remove.hidden = true;
          onChange('');
        },
      },
    });

    return h(
      'div',
      {},
      field(label, input, { hint }),
      preview,
      remove
    );
  }


  function localisedInput({ label, value, onInput, multiline = false, rows = 3, hint }) {
    const lang = getEditLang();
    const current = (value && typeof value === 'object' ? value[lang] : value) ?? '';
    const fullLabel = `${label} · ${lang.toUpperCase()}`;
    const handler = (next) => onInput(lang, next);

    return multiline
      ? textArea({ label: fullLabel, value: current, onInput: handler, rows, hint })
      : textInput({ label: fullLabel, value: current, onInput: handler, hint });
  }

  function setTranslation(object, key, lang, value) {
    if (!object[key] || typeof object[key] !== 'object') object[key] = {};
    object[key][lang] = value;
  }


  function editorPanel(title, ...children) {
    return h('div.admin-editor', {}, h('h3.admin-editor__title', { text: title }), ...children);
  }

  function editorGrid(...children) {
    return h('div.admin-editor__grid', {}, ...children);
  }

  function editorActions(...children) {
    return h('div.admin-editor__actions', {}, ...children);
  }

  function primaryButton(label, onClick, { type = 'button' } = {}) {
    return h('button.btn.btn--primary.btn--sm', { type, text: label, on: { click: onClick } });
  }

  function ghostButton(label, onClick) {
    return h('button.btn.btn--ghost.btn--sm', { type: 'button', text: label, on: { click: onClick } });
  }

  function confirmThen(message, action) {
    return () => {
      if (window.confirm(message)) action();
    };
  }

  return { getEditLang, editLangSwitch, patch, patchDebounced, commit, field, textInput, textArea, select, checkboxInput, imageInput, localisedInput, setTranslation, editorPanel, editorGrid, editorActions, primaryButton, ghostButton, confirmThen };
})();
