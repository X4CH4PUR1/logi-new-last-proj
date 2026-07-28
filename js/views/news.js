/**
 * News page: every post, newest first.
 */

import { h, when } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { decorateNews, sortedNews } from '../core/selectors.js';
import { empty, media, pageHeader } from './partials.js';

export function newsPage() {
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
