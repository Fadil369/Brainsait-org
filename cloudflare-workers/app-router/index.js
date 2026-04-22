// Cloudflare Worker router for path-hosted app integrations on brainsait.org.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const routes = [
      {
        prefix: '/incubator',
        origin: 'https://brainsait-frontend-3kv.pages.dev',
        preservePrefix: false,
      },
    ];

    const headers = new Headers(request.headers);
    if (!headers.has('x-request-id')) headers.set('x-request-id', crypto.randomUUID());

    for (const r of routes) {
      if (path === r.prefix || path.startsWith(r.prefix + '/')) {
        const forwardUrl = new URL(request.url);
        const originUrl = new URL(r.origin);
        forwardUrl.protocol = originUrl.protocol;
        forwardUrl.hostname = originUrl.hostname;
        forwardUrl.port = originUrl.port;
        forwardUrl.host = originUrl.host;

        if (r.preservePrefix === false) {
          const strippedPath = forwardUrl.pathname.replace(new RegExp('^' + r.prefix), '') || '/';
          forwardUrl.pathname = strippedPath;
        }

        const forwardReq = new Request(forwardUrl.toString(), {
          method: request.method,
          headers,
          body: request.body,
          redirect: 'manual',
        });

        return fetch(forwardReq);
      }
    }

    return new Response('Not found', { status: 404 });
  }
}
