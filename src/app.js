/**
 * The app's HTTP routes, with no dependency but Node itself:
 * - `GET /` shows the greeting page; `?name=Ada` greets Ada;
 * - `GET /api/greeting?name=Ada` answers the greeting as JSON;
 * - `GET /health` answers `ok`, so that a preview knows the app is up.
 * Any other path answers 404.
 */

import { greeting } from './greeting.js';

/** Escapes the five characters HTML gives a meaning to, so a name can never inject markup. */
function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Returns the greeting page for `name`. */
function page(name) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Application de test</title>
  </head>
  <body>
    <h1>${escapeHtml(greeting(name))}</h1>
  </body>
</html>
`;
}

/** Answers one request: `request` and `response` are Node's `http` objects. */
export function handle(request, response) {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const name = url.searchParams.get('name');

  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET', 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Method not allowed');
  } else if (url.pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(page(name));
  } else if (url.pathname === '/api/greeting') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ greeting: greeting(name) }));
  } else if (url.pathname === '/health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('ok');
  } else {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}
