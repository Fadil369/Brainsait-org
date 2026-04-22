export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetByHost = {
      'www.brainsait.org': 'https://brainsait.org',
      'docs.brainsait.org': 'https://fadil369.github.io/brainsait-docs',
      'portal.brainsait.org': 'https://portal.elfadil.com',
      'dashboard.brainsait.org': 'https://portal.elfadil.com',
      'careers.brainsait.org': 'https://brainsait.org/careers',
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
