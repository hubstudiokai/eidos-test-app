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

/** Returns the layout with common header/footer and navigation. */
function layout(content, currentPath = '/') {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application de test</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }
      header {
        background-color: #1e293b;
        color: #fff;
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1100px;
        margin: 0 auto;
        padding: 1rem 2rem;
      }
      .brand {
        font-size: 1.25rem;
        font-weight: bold;
        color: #fff;
        text-decoration: none;
      }
      .nav-links {
        display: flex;
        list-style: none;
        gap: 1.5rem;
      }
      .nav-links a {
        color: #e2e8f0;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
      }
      .nav-links a:hover, .nav-links a.active {
        color: #38bdf8;
      }
      main {
        max-width: 1100px;
        margin: 2rem auto;
        padding: 0 2rem;
      }
      .hero, .card {
        background: #fff;
        border-radius: 8px;
        padding: 3rem 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .hero h1, .card h1 {
        font-size: 2.25rem;
        color: #0f172a;
        margin-bottom: 1rem;
      }
      .card p {
        color: #475569;
      }
      footer {
        text-align: center;
        padding: 2rem;
        color: #64748b;
        font-size: 0.875rem;
      }
      @media (max-width: 600px) {
        .navbar {
          flex-direction: column;
          gap: 1rem;
        }
        .nav-links {
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <nav class="navbar">
        <a href="/" class="brand">Mon Application</a>
        <ul class="nav-links">
          <li><a href="/" ${currentPath === '/' ? 'class="active"' : ''}>Accueil</a></li>
          <li><a href="/about" ${currentPath === '/about' ? 'class="active"' : ''}>À propos</a></li>
          <li><a href="/contact" ${currentPath === '/contact' ? 'class="active"' : ''}>Contact</a></li>
        </ul>
      </nav>
    </header>
    <main>
      ${content}
    </main>
    <footer>
      <p>&copy; 2026 Application de test. Tous droits réservés.</p>
    </footer>
  </body>
</html>
`;
}

/** Returns the greeting page for `name`. */
function page(name) {
  const content = `
      <section class="hero">
        <h1>${escapeHtml(greeting(name))}</h1>
        <p>Bienvenue sur notre application de test interactive.</p>
      </section>
  `;
  return layout(content, '/');
}

/** Returns the about page. */
function aboutPage() {
  const content = `
      <section class="card">
        <h1>À propos</h1>
        <p>Cette application démontre une interface simple, responsive et divisée en pages multiples, développée avec Node.js sans dépendances externes.</p>
      </section>
  `;
  return layout(content, '/about');
}

/** Returns the contact page. */
function contactPage() {
  const content = `
      <section class="card">
        <h1>Contact</h1>
        <p>Pour toute question ou information complémentaire, n&#39;hésitez pas à nous contacter.</p>
      </section>
  `;
  return layout(content, '/contact');
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
  } else if (url.pathname === '/about') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(aboutPage());
  } else if (url.pathname === '/contact') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(contactPage());
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
