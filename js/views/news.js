window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views.news = (function () {
  /**
   * News page: every post, newest first.
   */

  const { h, when } = Logi.core.dom;
  const { t } = Logi.core.i18n;
  const { decorateNews, sortedNews } = Logi.core.selectors;
  const { empty, media, pageHeader } = Logi.views.partials;
  function newsPage() {
    const posts = sortedNews().map(decorateNews);

    return h(
      'div.page.container.container--narrow',
      { 'data-page': 'news' },
      pageHeader('FEED', t('newsTitle')),
      posts.length
        ? h('div.stack', {}, posts.map(article))
        : empty(t('newsEmpty'))
    );
  }

  function article(post) {
    return h(
      'article.card.card--hover.news-item.notch',
      {},
      when(post.img, () =>
        media({ src: post.img, alt: post.title, className: 'news-item__media' })
      ),
      h(
        'div.news-item__body',
        {},
        when(post.date, () => h('p.news-item__date', {}, h('time', {
          datetime: post.date,
          text: post.date,
        }))),
        h('h2.news-item__title', { text: post.title }),
        h('p.news-item__text', { text: post.body })
      )
    );
  }

  return { newsPage };
})();
