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
      <style>
       body {
         background-color: green;
         font-family: Arial, sans-serif;
         margin: 0;
         padding: 0;
       }
       header {
         background-color: #333;
         color: white;
         padding: 1rem;
         display: flex;
         justify-content: space-between;
         align-items: center;
         flex-wrap: wrap;
       }
       nav {
         display: flex;
         gap: 1.5rem;
       }
       nav a {
         color: white;
         text-decoration: none;
         font-weight: bold;
         transition: color 0.3s;
       }
       nav a:hover {
         color: #ccc;
       }
       .menu-toggle {
         display: none;
         cursor: pointer;
         font-size: 1.5rem;
       }
       @media (max-width: 768px) {
         nav {
           flex-direction: column;
           gap: 0.5rem;
           position: absolute;
           top: 100%;
           left: 0;
           right: 0;
           background-color: #222;
           padding: 1rem;
           clip-path: circle(0px at 90% 0%);
           transition: clip-path 0.5s ease-out;
         }
         nav.active {
           clip-path: circle(1000px at 90% 0%);
         }
         .menu-toggle {
           display: block;
         }
       }
      </style>
    </head>
    <body>
      <header>
        <h1>${escapeHtml(greeting(name))}</h1>
        <nav id="main-nav">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
        <button class="menu-toggle" aria-label="Menu">☰</button>
      </header>
      <script>
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('#main-nav');
        
        menuToggle.addEventListener('click', () => {
          nav.classList.toggle('active');
        });
      </script>
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
