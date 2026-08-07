const STATIC = new Set([
  'GET /api/v1/content/zhihu_search',
  'GET /api/v1/content/global_search',
  'GET /api/v1/content/hot_list',
  'POST /v1/chat/completions',
  'GET /api/v1/user/contents',
  'GET /api/v1/user/followees',
  'GET /api/v1/user/collections',
  'GET /api/v1/user/favlists',
  'GET /api/v1/user/favlist_contents',
  'POST /resources/v1/files',
  'POST /api/v1/pdf-parse/tasks',
  'POST /api/v1/ppt-generation/tasks'
]);

function allowedRoute(method, path) {
  if (STATIC.has(`${method} ${path}`)) return true;
  if (method === 'GET' && /^\/api\/v1\/pdf-parse\/tasks\/[^/]+$/.test(path)) return true;
  if (method === 'GET' && /^\/api\/v1\/ppt-generation\/tasks\/[^/]+$/.test(path)) return true;
  return false;
}

function allowedOrigin(origin, env) {
  const list = String(env.ALLOWED_ORIGINS || '')
    .split(',').map(x => x.trim()).filter(Boolean);
  return !origin || list.includes('*') || list.includes(origin);
}

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,X-Request-Timestamp,Content-Type,Idempotency-Key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!allowedOrigin(origin, env)) {
      return new Response('Origin not allowed', { status: 403 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    const incoming = new URL(request.url);
    const path = incoming.pathname;
    if (!allowedRoute(request.method, path)) {
      return new Response('Route not allowed', { status: 404, headers: cors(origin) });
    }

    const target = new URL(`https://developer.zhihu.com${path}`);
    target.search = incoming.search;

    const headers = new Headers();
    for (const name of ['Authorization', 'X-Request-Timestamp', 'Content-Type', 'Idempotency-Key']) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set('Accept', 'application/json');

    const init = { method: request.method, headers, redirect: 'follow' };
    if (!['GET', 'HEAD'].includes(request.method)) init.body = request.body;

    try {
      const upstream = await fetch(target, init);
      const outHeaders = new Headers(upstream.headers);
      Object.entries(cors(origin)).forEach(([k, v]) => outHeaders.set(k, v));
      outHeaders.delete('set-cookie');
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: outHeaders
      });
    } catch (error) {
      return Response.json({ error: 'UPSTREAM_FETCH_FAILED', message: String(error?.message || error) }, {
        status: 502,
        headers: cors(origin)
      });
    }
  }
};
