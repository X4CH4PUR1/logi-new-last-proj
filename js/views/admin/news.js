window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.admin = Logi.views.admin || {};
Logi.views.admin.news = (function () {

  const { h, mount } = Logi.core.dom;
  const { clone } = Logi.core.store;
  const { sortedNews } = Logi.core.selectors;
  const { makeId, pick, today } = Logi.util.format;
  const {
    commit,
    confirmThen,
    editorActions,
    editorPanel,
    getEditLang,
    ghostButton,
    imageInput,
    localisedInput,
    primaryButton,
    textInput,
  } = Logi.views.admin.fields;
  const EMPTY_POST = {
    id: null,
    date: '',
    img: '',
    title: { ka: '', en: '', ru: '' },
    body: { ka: '', en: '', ru: '' },
  };

  function newsTab() {
    const panel = h('div.admin__panel');
    let draft = null;

    const render = () => mount(panel, draft ? editor() : list());

    function list() {
      const posts = sortedNews();

      return h(
        'div',
        {},
        h('p.admin__panel-intro', {
          text: 'Posts are ordered by date, newest first. The two most recent also appear on the home page.',
        }),
        primaryButton('+ Add news post', () => {
          draft = { ...clone(EMPTY_POST), date: today() };
          render();
        }),
        posts.length
          ? h('div.admin-list', { style: { marginTop: '20px' } }, posts.map(row))
          : h('p.hint', { style: { marginTop: '20px' }, text: 'No posts yet.' })
      );
    }

    function row(post) {
      const label = pick(post.title, getEditLang()) || '(untitled)';

      return h(
        'div.admin-row',
        {},
        post.img
          ? h('img.admin-row__thumb', { src: post.img, alt: '' })
          : h('span.admin-row__thumb.admin-row__thumb--empty', { 'aria-hidden': 'true' }),
        h('span.admin-row__meta', { text: post.date }),
        h('span.admin-row__label', { text: label }),
        h(
          'div.admin-row__actions',
          {},
          h('button.btn-plain', {
            type: 'button',
            text: 'Edit',
            on: {
              click: () => {
                draft = clone(post);
                render();
              },
            },
          }),
          h('button.btn-plain.btn-plain--danger', {
            type: 'button',
            text: 'Delete',
            on: {
              click: confirmThen(`Delete "${label}"?`, () =>
                commit((content) => {
                  content.news = content.news.filter((n) => n.id !== post.id);
                }, 'Post deleted')
              ),
            },
          })
        )
      );
    }

    function editor() {
      const isNew = !draft.id;

      const save = () => {
        const record = clone(draft);
        commit((content) => {
          if (!record.id) {
            record.id = makeId('n');
            content.news.push(record);
          } else {
            const index = content.news.findIndex((n) => n.id === record.id);
            if (index >= 0) content.news[index] = record;
            else content.news.push(record);
          }
        }, isNew ? 'Post added' : 'Post saved');
        draft = null;
        render();
      };

      return editorPanel(
        isNew ? 'New news post' : 'Edit news post',
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' } },
          h('div', { style: { maxWidth: '220px' } },
            textInput({
              label: 'Date',
              type: 'date',
              value: draft.date,
              onInput: (value) => {
                draft.date = value;
              },
            })
          ),
          localisedInput({
            label: 'Title',
            value: draft.title,
            onInput: (lang, value) => {
              if (!draft.title || typeof draft.title !== 'object') draft.title = {};
              draft.title[lang] = value;
            },
          }),
          localisedInput({
            label: 'Body',
            multiline: true,
            rows: 6,
            value: draft.body,
            onInput: (lang, value) => {
              if (!draft.body || typeof draft.body !== 'object') draft.body = {};
              draft.body[lang] = value;
            },
          }),
          imageInput({
            label: 'Photo',
            value: draft.img,
            onChange: (dataUrl) => {
              draft.img = dataUrl;
            },
          })
        ),
        editorActions(
          primaryButton('Save', save),
          ghostButton('Cancel', () => {
            draft = null;
            render();
          })
        )
      );
    }

    render();
    return panel;
  }

  return { newsTab };
})();
