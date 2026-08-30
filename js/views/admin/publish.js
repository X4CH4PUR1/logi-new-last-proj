window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.publish = (function () {

  const { h, mount, when } = Logi.core.dom;
  const store = Logi.core.store;
  const toast = Logi.core.toast;
  const { CONTENT_URL } = Logi.data.config;
  const { formatBytes } = Logi.util.image;
  const { usageBytes, hasLocalStorage } = Logi.util.storage;
  function publishTab() {
    const panel = h('div.admin__panel');

    const render = () => {
      const dirty = store.isDirty();
      const json = store.toJSON();

      mount(
        panel,
        h('p.admin__panel-intro', {
          text:
            'Your edits are saved in this browser as you make them. To put them in front of visitors, ' +
            'download the content file and commit it to the repository — that is what everyone else loads.',
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
          step(
            '01',
            'Download the content file',
            dirty
              ? 'You have changes that visitors cannot see yet.'
              : 'Everything currently matches what is published. You can still re-download the file.',
            [
              h('button.btn.btn--primary.btn--sm', {
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

          step(
            '02',
            'Put it in the repository',
            `Replace the file at ${CONTENT_URL} in your project folder with the one you just downloaded, ` +
              'then commit and push. GitHub Pages rebuilds within a minute or two.',
            [
              h('code.admin-publish__code', {
                text: `git add ${CONTENT_URL}\ngit commit -m "Update site content"\ngit push`,
                style: { whiteSpace: 'pre' },
              }),
            ]
          ),

          step(
            '03',
            'Check the live site',
            'Once the deploy finishes, reload the public site. This panel notices that your draft now ' +
              'matches what is published and clears the “unpublished changes” marker on its own.',
            []
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
      toast.show('Downloaded — now commit it to the repository');
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
