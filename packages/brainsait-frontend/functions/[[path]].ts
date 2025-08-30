// Cloudflare Pages Functions for server-side rendering and API routes

interface Env {
  API_BASE_URL?: string;
  ASSETS: any;
}

export const onRequest = async (context: { request: Request; env: Env; params: any }) => {
  const { request, env, params } = context;
  
  // Handle API proxy requests
  if (request.url.includes('/api/')) {
    const apiUrl = env.API_BASE_URL || 'https://api.brainsait.com';
    const proxyUrl = request.url.replace(new URL(request.url).origin, apiUrl);
    
    const proxyRequest = new Request(proxyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const response = await fetch(proxyRequest);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
  
  // Let Cloudflare Pages handle static files and Next.js routes
  return env.ASSETS.fetch(request);
};