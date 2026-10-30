window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.news = (function () {

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { decorateNews, sortedNews } = Logi.core.selectors;
  const { empty, media, pageHeader } = Logi.views.partials;

  function newsPage() {
    const posts = sortedNews().map(decorateNews);

    const root = tpl.clone('news');
    const [eyebrowEl, titleEl] = pageHeader('FEED', t('newsTitle'));
    tpl.place(root, 'eyebrow', eyebrowEl);
    tpl.place(root, 'title', titleEl);

    if (posts.length) {
      const stack = tpl.clone('news-stack');
      tpl.each(tpl.slot(stack, 'list'), posts, article);
      tpl.place(root, 'body', stack);
    } else {
      tpl.place(root, 'body', empty(t('newsEmpty')));
    }

    return root;
  }

  function article(post) {
    const root = tpl.clone('news-article');
    const { dateP, textP, moreBtn } = tpl.refs(root);
    tpl.place(root, 'media', post.img
      ? media({ src: post.img, alt: post.title, className: 'news-item__media' })
      : null);
    tpl.toggle(dateP, !!post.date);
    tpl.bind(root, { date: post.date, title: post.title, body: post.body });
    tpl.bindAttr(root, { date: post.date });

    // Whether the text is cut off is only known once the card is laid out,
    // and changes with the window width.
    const sync = () => {
      const open = root.classList.contains('is-open');
      const clipped = !open && textP.scrollHeight > textP.clientHeight + 1;
      root.classList.toggle('is-clipped', clipped);
      moreBtn.hidden = !open && !clipped;
      moreBtn.textContent = t(open ? 'newsShowLess' : 'newsReadMore');
    };
    moreBtn.addEventListener('click', () => {
      root.classList.toggle('is-open');
      sync();
    });
    new ResizeObserver(sync).observe(textP);

    return root;
  }

  return { newsPage };
})();
