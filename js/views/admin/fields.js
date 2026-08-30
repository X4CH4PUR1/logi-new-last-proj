window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.fields = (function () {
  /**
   * Form controls and edit helpers shared by every admin tab.
   *
   * ---------------------------------------------------------------------------
   * Why there are two ways to write
   *
   * store.subscribe() re-renders the whole page, which is exactly what you want
   * when a record is added or deleted, and exactly what you do not want while
   * someone is typing — the input would be replaced mid-word and lose focus and
   * the caret.
   *
   * So text editing goes through `patch()`, which saves without notifying, and
   * structural changes go through `commit()`, which saves and re-renders. Typing
   * is additionally debounced so a long paragraph is not re-serialised to
   * localStorage on every keystroke.
   * ---------------------------------------------------------------------------
   */

  const { h, when } = Logi.core.dom;
  const store = Logi.core.store;
  const toast = Logi.core.toast;
  const { LANGUAGES } = Logi.data.config;
  const { processImage } = Logi.util.image;
  /* --------------------------------------------------------------------------
     Which language the editor is typing in
     -------------------------------------------------------------------------- */

  let editLang = 'en';

  function getEditLang() {
    return editLang;
  }

  /**
   * The three-way ქარ / ENG / РУС switch shown in the admin toolbar.
   *
   * `onChange` is passed in rather than being a subscription, deliberately: the
   * admin shell is rebuilt on every route change, and a module-level listener
   * set would accumulate one dead callback per rebuild, each holding a closure
   * over a detached DOM node.
   *
   * @param {(code: string) => void} onChange
   */
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

  /* --------------------------------------------------------------------------
     Writing
     -------------------------------------------------------------------------- */

  let saveTimer = 0;
  let pendingToast = false;

  /**
   * Saves without re-rendering. For text typed into an input.
   * @param {(draft: object) => void} mutator
   */
  function patch(mutator) {
    const result = store.update(mutator, { silent: true });
    reportSaveFailure(result);
    refreshDirtyBadges();
  }

  /** Debounced `patch`, for `input` events. */
  function patchDebounced(mutator, delay = 350) {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => patch(mutator), delay);
  }

  /**
   * Saves and re-renders. For adding, deleting, reordering — anything that
   * changes which controls should exist.
   * @param {(draft: object) => void} mutator
   * @param {string} [message] confirmation toast
   */
  function commit(mutator, message) {
    window.clearTimeout(saveTimer);
    const result = store.update(mutator);
    if (!reportSaveFailure(result) && message) toast.show(message);
  }

  /** @returns {boolean} true when the save failed */
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

  /** Keeps the "unpublished changes" pill honest after a silent save. */
  function refreshDirtyBadges() {
    for (const badge of document.querySelectorAll('.admin__status')) {
      badge.dataset.dirty = String(store.isDirty());
      const label = badge.querySelector('[data-role="status-label"]');
      if (label) {
        label.textContent = store.isDirty() ? 'UNPUBLISHED CHANGES' : 'PUBLISHED';
      }
    }
  }

  /* --------------------------------------------------------------------------
     Controls
     -------------------------------------------------------------------------- */

  /** Wraps a control in a labelled column. */
  function field(label, control, { hint } = {}) {
    return h(
      'label.field',
      {},
      h('span.field__label', { text: label }),
      control,
      when(hint, () => h('span.hint', { text: hint }))
    );
  }

  /**
   * A single-line text input.
   * @param {{label: string, value: any, onInput: (value: string) => void,
   *          type?: string, placeholder?: string, hint?: string, small?: boolean}} options
   */
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

  /**
   * A multi-line text input.
   * @param {{label: string, value: any, onInput: (value: string) => void,
   *          rows?: number, hint?: string}} options
   */
  function textArea({ label, value, onInput, rows = 3, hint }) {
    const area = h('textarea.textarea.textarea--sm', {
      rows: String(rows),
      on: {
        input: (event) => onInput(event.currentTarget.value),
        change: (event) => onInput(event.currentTarget.value),
      },
    });
    // textContent rather than an attribute, so quotes and newlines survive.
    area.value = value ?? '';
    return field(label, area, { hint });
  }

  /**
   * A checkbox with its label alongside it, rather than above it.
   * @param {{label: string, checked: boolean, onChange: (checked: boolean) => void,
   *          hint?: string}} options
   */
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

  /**
   * A dropdown.
   * @param {{label: string, value: any, options: Array<{value: string, label: string}>,
   *          onInput: (value: string) => void, hint?: string}} config
   */
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

  /**
   * Photo picker with a live preview and a remove button.
   *
   * @param {{label: string, value: string, onChange: (dataUrl: string) => void,
   *          hint?: string}} options
   */
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
            // Let the same file be chosen again after a removal.
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

  /* --------------------------------------------------------------------------
     Translatable values
     -------------------------------------------------------------------------- */

  /**
   * Edits one language of a { ka, en, ru } value, labelled with which one.
   *
   * @param {{label: string, value: object, onInput: (lang: string, value: string) => void,
   *          multiline?: boolean, rows?: number, hint?: string}} options
   */
  function localisedInput({ label, value, onInput, multiline = false, rows = 3, hint }) {
    const lang = getEditLang();
    const current = (value && typeof value === 'object' ? value[lang] : value) ?? '';
    const fullLabel = `${label} · ${lang.toUpperCase()}`;
    const handler = (next) => onInput(lang, next);

    return multiline
      ? textArea({ label: fullLabel, value: current, onInput: handler, rows, hint })
      : textInput({ label: fullLabel, value: current, onInput: handler, hint });
  }

  /** Ensures `object[key]` is a translatable map before writing into it. */
  function setTranslation(object, key, lang, value) {
    if (!object[key] || typeof object[key] !== 'object') object[key] = {};
    object[key][lang] = value;
  }

  /* --------------------------------------------------------------------------
     Layout helpers
     -------------------------------------------------------------------------- */

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

  /** Confirms before running a destructive action. */
  function confirmThen(message, action) {
    return () => {
      if (window.confirm(message)) action();
    };
  }

  return { getEditLang, editLangSwitch, patch, patchDebounced, commit, field, textInput, textArea, select, checkboxInput, imageInput, localisedInput, setTranslation, editorPanel, editorGrid, editorActions, primaryButton, ghostButton, confirmThen };
})();
