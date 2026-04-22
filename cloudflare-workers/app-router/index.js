// Simple Cloudflare Worker app router sample
// Update origins to match your Pages or origin hostnames before deploying.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Map path prefixes to origins (replace with your actual origins)
    const routes = [
      { prefix: '/incubator', origin: 'https://brainsait-frontend-3kv.pages.dev', preservePrefix: true },
      { prefix: '/open-webui', origin: 'https://work.elfadil.com', preservePrefix: false },
      { prefix: '/store', origin: 'https://store.brainsait.io', preservePrefix: false },
      { prefix: '/rcm', origin: 'https://portal.elfadil.com', preservePrefix: false },
      { prefix: '/doctor', origin: 'https://doctor.pages.dev' },
      { prefix: '/sbs', origin: 'https://api.brainsait.org' }
    ];

    // correlation id
    const headers = new Headers(request.headers);
    if (!headers.has('x-request-id')) headers.set('x-request-id', crypto.randomUUID());

    for (const r of routes) {
      if (path === r.prefix || path.startsWith(r.prefix + '/')) {
        // rewrite to origin
        const forwardUrl = new URL(request.url);
        const originUrl = new URL(r.origin);
        // Replace host/protocol/port
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

        const resp = await fetch(forwardReq);
        return resp;
      }
    }

    // default: proxy to masterlinc shell (change origin as needed)
    const defaultOrigin = 'https://portal.elfadil.com';
    const defaultUrl = defaultOrigin + path;
    const defaultReq = new Request(defaultUrl, { method: request.method, headers, body: request.body });
    return fetch(defaultReq);
  }
}
