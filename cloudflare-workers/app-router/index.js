// Cloudflare Worker router for path-hosted app integrations on brainsait.org.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── Enhanced RCM routing → portal.elfadil.com ─────────────────────────
    // Preserves any sub-path and all query parameters.
    if (path === '/rcm' || path.startsWith('/rcm/')) {
      const subPath = path.slice(4) || '/'; // strip '/rcm', keep remainder
      const dest = new URL('https://portal.elfadil.com');
      dest.pathname = subPath;
      dest.search = url.search; // preserve query string
      return Response.redirect(dest.toString(), 302);
    }

// Redirect /incubator/courses* → /incubator/training/courses
    // Canonical training URL is /incubator/training/courses.
    if (path === '/incubator/courses' || path.startsWith('/incubator/courses/')) {
      const subPath = path.slice('/incubator/courses'.length) || '';
      const dest = new URL(request.url);
      dest.pathname = '/incubator/training/courses' + subPath;
      return Response.redirect(dest.toString(), 301);
    }

    // Redirect /incubator/training/courses* → /training/courses (static Vite SPA)
    // Only redirect when there's NO sub-path (no course slug). When there's a course
    // slug (like /healthcare-ai-launchpad), let it pass through to Next.js.
    if (path === '/incubator/training/courses' || path === '/incubator/training/courses/') {
      const dest = new URL(request.url);
      dest.pathname = '/training/courses/';
      return Response.redirect(dest.toString(), 301);
    }

    // ── Redirect /incubator/courses* → /incubator/training/courses ───────────
    // Canonical training URL is /incubator/training/courses.
    if (path === '/incubator/courses' || path.startsWith('/incubator/courses/')) {
      const subPath = path.slice('/incubator/courses'.length) || '';
      const dest = new URL(request.url);
      dest.pathname = '/incubator/training/courses' + subPath;
      return Response.redirect(dest.toString(), 301);
    }

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

        const resp = await fetch(forwardReq);

        // Rewrite relative Location headers emitted by Next.js so they include
        // the /incubator prefix before reaching the browser.  Without this fix,
        // a Next.js 308 such as "Location: /training/courses/" bypasses the
        // Worker and hits brainsait.org/_redirects, which redirects back to
        // /incubator/training/courses — creating an infinite redirect loop.
        if (resp.status >= 300 && resp.status < 400) {
          const location = resp.headers.get('location');
          if (location && !location.startsWith('http') && !location.startsWith('/incubator')) {
            const newHeaders = new Headers(resp.headers);
            newHeaders.set('location', r.prefix + location);
            return new Response(resp.body, {
              status: resp.status,
              statusText: resp.statusText,
              headers: newHeaders,
            });
          }
        }

        return resp;
      }
    }

    return new Response('Not found', { status: 404 });
  }
}
