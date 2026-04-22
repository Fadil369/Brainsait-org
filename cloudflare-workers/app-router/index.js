// Simple Cloudflare Worker app router sample
// Update origins to match your Pages or origin hostnames before deploying.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Map path prefixes to origins (replace with your actual origins)
    const routes = [
      { prefix: '/incubator', origin: 'https://incubator.pages.dev' },
      { prefix: '/open-webui', origin: 'https://open-webui.pages.dev' },
      { prefix: '/store', origin: 'https://brainsait-store.pages.dev' },
      { prefix: '/rcm', origin: 'https://brainsait-rcm.pages.dev' },
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

        // Optionally strip the prefix before forwarding (depends on upstream app)
        // forwardUrl.pathname = forwardUrl.pathname.replace(new RegExp('^' + r.prefix), '');

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
    const defaultOrigin = 'https://masterlinc.pages.dev';
    const defaultUrl = defaultOrigin + path;
    const defaultReq = new Request(defaultUrl, { method: request.method, headers, body: request.body });
    return fetch(defaultReq);
  }
}
