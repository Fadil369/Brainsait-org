export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetByHost = {
      'www.brainsait.org': 'https://brainsait.org',
      'docs.brainsait.org': 'https://fadil369.github.io/brainsait-docs',
      'portal.brainsait.org': 'https://portal.elfadil.com',
      'dashboard.brainsait.org': 'https://portal.elfadil.com',
      'careers.brainsait.org': 'https://brainsait.org/staff',
      'incubator.brainsait.org': 'https://brainsait-frontend-3kv.pages.dev',
      'app.brainsait.org': 'https://brainsait-frontend-3kv.pages.dev',
      'platform.brainsait.org': 'https://brainsait.org/platform',
      'training.brainsait.org': 'https://brainsait.org/training/courses/',
      'spark.brainsait.org': 'https://brainsait-spark.pages.dev',
      'api.brainsait.org': 'https://api.brainsait.org',
      'notifications.brainsait.org': 'https://notifications.brainsait.org',
      'tg-bot.brainsait.org': 'https://tg-bot.brainsait.org',
      'gchat.brainsait.org': 'https://gchat.brainsait.org',
      'calls.brainsait.org': 'https://calls.brainsait.org',
      'agent.brainsait.org': 'https://agent.brainsait.org',
    };

    const targetOrigin = targetByHost[url.hostname];
    if (!targetOrigin) {
      return new Response('Not found', { status: 404 });
    }

    const target = new URL(targetOrigin);
    target.pathname = url.pathname;
    target.search = url.search;
    return Response.redirect(target.toString(), 301);
  },
};
