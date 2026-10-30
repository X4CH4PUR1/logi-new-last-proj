window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.publish = (function () {

  const { h, mount, when } = Logi.core.dom;
  const store = Logi.core.store;
  const toast = Logi.core.toast;
  const { CONTENT_URL, PUBLISH_URL, STORAGE } = Logi.data.config;
  const { formatBytes } = Logi.util.image;
  const { usageBytes, hasLocalStorage, readString, writeString, remove } = Logi.util.storage;

  // Outside publishTab: publishing re-renders the whole app, which rebuilds
  // this tab, and the outcome has to survive that.
  let busy = false;
  let outcome = null;

  function publishTab() {
    const panel = h('div.admin__panel');

    const render = () => {
      const dirty = store.isDirty();
      const json = store.toJSON();

      mount(
        panel,
        h('p.admin__panel-intro', {
          text:
            'Your edits are saved in this browser as you make them. Visitors see them only after you ' +
            'publish — that writes them straight to the live site, photos included.',
        }),

        when(!hasLocalStorage, () =>
          h('div.admin-publish__step.admin-danger', {},
            h('p.admin-publish__step-num', { text: '!' }),
            h('p.admin-publish__step-title', { text: 'This browser is not saving your edits' }),
            h('p.admin-publish__step-text', {
              text:
                'localStorage is unavailable — usually private browsing mode. You can still edit and ' +
                'download the file, but anything unsaved is lost if you close the tab.',
            })
          )
        ),

        h(
          'div.admin-publish',
          {},
          publishStep(dirty),

          step(
            '↓',
            'Keep a copy',
            'Download everything as a single file — a backup you can load again below. ' +
              `The server also keeps the last 30 published versions of ${CONTENT_URL}.`,
            [
              h('button.btn.btn--ghost.btn--sm', {
                type: 'button',
                text: `Download ${CONTENT_URL.split('/').pop()}`,
                on: { click: () => download(json) },
              }),
              h('button.btn-plain', {
                type: 'button',
                text: 'Copy to clipboard',
                style: { marginLeft: '10px' },
                on: { click: () => copy(json) },
              }),
            ]
          ),

          backupStep(),
          dangerStep()
        ),

        h('p.hint', {
          style: { marginTop: '22px' },
          text: `Content file: ${formatBytes(new Blob([json]).size)} · browser storage in use: ${formatBytes(usageBytes())} of roughly 5 MB.`,
        })
      );
    };


    function step(num, title, text, children) {
      return h(
        'div.admin-publish__step',
        {},
        h('p.admin-publish__step-num', { text: num }),
        h('p.admin-publish__step-title', { text: title }),
        h('p.admin-publish__step-text', { text }),
        ...children
      );
    }

    function publishStep(dirty) {
      const remembered = readString(STORAGE.publishKey, '');
      const keyInput = h('input.input', {
        type: 'password',
        autocomplete: 'current-password',
        placeholder: 'Publish password',
        value: remembered,
        style: { maxWidth: '320px' },
      });
      const rememberBox = h('input.checkbox', { type: 'checkbox', checked: remembered !== '' });

      return h(
        'div.admin-publish__step',
        {},
        h('p.admin-publish__step-num', { text: '01' }),
        h('p.admin-publish__step-title', { text: 'Publish to the live site' }),
        h('p.admin-publish__step-text', {
          text: dirty
            ? 'You have changes that visitors cannot see yet.'
            : 'Everything currently matches what is published.',
        }),
        h(
          'form',
          {
            style: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' },
            on: {
              submit: (event) => {
                event.preventDefault();
                publish(keyInput.value.trim(), rememberBox.checked);
              },
            },
          },
          keyInput,
          h('label.field--checkbox', {}, rememberBox, h('span', { text: ' Remember the password on this device' })),
          h('button.btn.btn--primary.btn--sm', {
            type: 'submit',
            text: busy ? 'Publishing…' : dirty ? 'Publish now' : 'Publish again',
            disabled: busy,
          })
        ),
        when(outcome, () =>
          h('p.admin-publish__step-text', {
            role: 'status',
            text: outcome.text,
            style: { marginTop: '12px', color: outcome.ok ? null : 'var(--accent)' },
          })
        )
      );
    }

    async function publish(key, rememberKey) {
      if (!key) {
        toast.error('Enter the publish password first.');
        return;
      }
      if (rememberKey) writeString(STORAGE.publishKey, key);
      else remove(STORAGE.publishKey);

      const sent = store.clone(store.getContent());
      busy = true;
      outcome = null;
      render();

      try {
        const res = await fetch(PUBLISH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, content: sent }),
          cache: 'no-store',
        });
        const reply = await res.json().catch(() => null);
        if (!reply) {
          throw new Error(
            res.status === 404 || res.status === 405
              ? 'This copy of the site cannot publish. Open the control room on the live site (logimotors.com) instead.'
              : `The server answered ${res.status} without saying why.`
          );
        }
        if (!reply.ok) {
          if (res.status === 403) remove(STORAGE.publishKey);
          throw new Error(reply.error || `The server answered ${res.status}.`);
        }

        busy = false;
        outcome = { ok: true, text: `Published at ${new Date().toLocaleTimeString()}. Visitors now see these changes.` };
        toast.show('Published — the live site is updated');
        store.markPublished(reply.content, sent);
      } catch (err) {
        busy = false;
        outcome = { ok: false, text: err.message || 'Publishing failed — check your connection.' };
        toast.error(outcome.text);
      }
      render();
    }

    function backupStep() {
      const input = h('input', {
        type: 'file',
        accept: 'application/json,.json',
        style: { display: 'none' },
        on: {
          change: async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;
            try {
              const parsed = JSON.parse(await file.text());
              if (!window.confirm('Replace all current content with this file?')) return;
              store.replaceAll(parsed);
              toast.show('Content restored from file');
            } catch (err) {
              toast.error(`That file could not be read: ${err.message}`);
            }
          },
        },
      });

      return h(
        'div.admin-publish__step',
        {},
        h('p.admin-publish__step-num', { text: '↺' }),
        h('p.admin-publish__step-title', { text: 'Restore from a file' }),
        h('p.admin-publish__step-text', {
          text: 'Load a previously downloaded content file. This replaces everything currently in the editor.',
        }),
        h('label.btn.btn--ghost.btn--sm', { style: { cursor: 'pointer' } }, 'Choose a file…', input)
      );
    }

    function dangerStep() {
      return h(
        'div.admin-publish__step.admin-danger',
        {},
        h('p.admin-publish__step-num', { text: '⚠' }),
        h('p.admin-publish__step-title', { text: 'Start over' }),
        h('p.admin-publish__step-text', {
          text:
            'Discard drops your unpublished edits and goes back to what is currently live. ' +
            'Factory reset goes all the way back to the demo content this site shipped with.',
        }),
        h(
          'div',
          { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          h('button.btn-plain.btn-plain--danger', {
            type: 'button',
            text: 'Discard unpublished edits',
            disabled: !store.isDirty(),
            on: {
              click: () => {
                if (!window.confirm('Discard every edit you have not published?')) return;
                store.revertToPublished();
                toast.show('Reverted to the published content');
              },
            },
          }),
          h('button.btn-plain.btn-plain--danger', {
            type: 'button',
            text: 'Factory reset',
            on: {
              click: () => {
                if (!window.confirm('Reset everything to the original demo content?')) return;
                store.resetToDefaults();
                toast.show('Reset to the demo content');
              },
            },
          })
        )
      );
    }


    function download(json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = h('a', { href: url, download: 'content.json' });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.show('Downloaded');
    }

    async function copy(json) {
      try {
        await navigator.clipboard.writeText(json);
        toast.show('Content file copied to the clipboard');
      } catch {
        toast.error('Your browser blocked clipboard access. Use the download button instead.');
      }
    }

    render();
    return panel;
  }

  return { publishTab };
})();
