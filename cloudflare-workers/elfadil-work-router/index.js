export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = new URL('https://brainsait.org/appstore');
    target.pathname = url.pathname === '/' ? '/appstore' : '/appstore';
    target.search = url.search;
    return Response.redirect(target.toString(), 302);
  },
};
