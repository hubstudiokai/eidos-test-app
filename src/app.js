/**
 * The app's HTTP routes, with no dependency but Node itself:
 * - `GET /` shows the greeting page; `?name=Ada` greets Ada;
 * - `GET /api/greeting?name=Ada` answers the greeting as JSON;
 * - `GET /health` answers `ok`, so that a preview knows the app is up.
 * Any other path answers 404.
 */

import { greeting } from './greeting.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        color: #2b2b2b;
        background-color: #faf9f6;
      }
      header {
        background-color: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(8px);
        color: #f7f4ef;
        border-bottom: 2px solid #d4af37;
        position: sticky;
        top: 0;
        z-index: 1000;
      }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1100px;
        margin: 0 auto;
        padding: 1.25rem 2rem;
        position: relative;
      }
      .brand {
        font-size: 1.4rem;
        font-weight: 700;
        color: #f7f4ef;
        text-decoration: none;
        letter-spacing: 0.05em;
      }
      .menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
      }
      .menu-toggle span {
        display: block;
        width: 25px;
        height: 3px;
        background-color: #d4af37;
        border-radius: 2px;
        transition: 0.3s;
      }
      .nav-links {
        display: flex;
        list-style: none;
        gap: 2rem;
        align-items: center;
      }
      .nav-links a {
        color: #e6e2d8;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
      }
      .nav-links a:hover, .nav-links a.active {
        color: #d4af37;
      }
      .btn-login {
        background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
        color: #1a1a1a !important;
        padding: 0.5rem 1.25rem;
        border-radius: 4px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
        transition: opacity 0.2s;
      }
      .btn-login:hover {
        opacity: 0.9;
      }
      main {
        max-width: 1100px;
        margin: 3rem auto;
        padding: 0 2rem;
      }
      .hero, .card {
        background: #ffffff;
        border-radius: 12px;
        padding: 4rem 3rem;
        margin-bottom: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        border: 1px solid #eee8df;
        position: relative;
        overflow: hidden;
      }
      .hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #d4af37, #f3e5ab, #d4af37);
      }
      .hero-content {
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
      }
      .hero-title {
        font-size: 3rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .hero-description {
        font-size: 1.25rem;
        color: #666055;
        margin-bottom: 2.5rem;
        line-height: 1.5;
      }
      .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
      .btn-secondary {
        padding: 0.75rem 2rem;
        text-decoration: none;
        border: 1px solid #d4af37;
        color: #1a1a1a;
        border-radius: 4px;
        font-weight: 600;
        transition: background-color 0.2s;
      }
      .btn-secondary:hover {
        background-color: #fcfbf8;
      }
      .hero h1, .card h1 {
        font-size: 2.5rem;
        color: #1a1a1a;
        margin-bottom: 1rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .hero p {
        font-size: 1.15rem;
        color: #666055;
        margin-bottom: 2rem;
      }
      .card p {
        color: #666055;
      }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }
      .feature-card {
        background: #fcfbfa;
        padding: 2rem;
        border-radius: 8px;
        border: 1px solid #f0ece1;
      }
      .feature-card h3 {
        font-size: 1.25rem;
        color: #1a1a1a;
        margin-bottom: 0.75rem;
      }
      .feature-card p {
        font-size: 0.95rem;
        color: #777065;
        margin-bottom: 0;
      }
      footer {
        text-align: center;
        padding: 3rem 2rem;
        color: #8c8578;
        font-size: 0.875rem;
        border-top: 1px solid #eae5db;
        background: #f5f2eb;
      }
      @media (max-width: 600px) {
        .menu-toggle {
          display: flex;
        }
        .nav-links {
          display: none;
          flex-direction: column;
          width: 100%;
          position: absolute;
          top: 100%;
          left: 0;
          background-color: #1a1a1a;
          padding: 1rem 2rem 1.5rem 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          gap: 1rem;
          align-items: stretch;
          border-bottom: 2px solid #d4af37;
        }
        .nav-links.active {
          display: flex;
        }
        .nav-links a {
          padding: 0.5rem 0;
          text-align: center;
        }
        .btn-login {
          text-align: center;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <nav class="navbar">
        <a href="/" class="brand">Mon Application</a>
        <button class="menu-toggle" aria-label="Menu" onclick="document.querySelector('.nav-links').classList.toggle('active')">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav-links">
          <li><a href="/" ${currentPath === '/' ? 'class="active"' : ''}>Accueil</a></li>
          <li><a href="/catalogue" ${currentPath === '/catalogue' ? 'class="active"' : ''}>Services</a></li>
          <li><a href="/about" ${currentPath === '/about' ? 'class="active"' : ''}>À propos</a></li>
          <li><a href="/contact" ${currentPath === '/contact' ? 'class="active"' : ''}>Contact</a></li>
          <li><a href="/notes" ${currentPath === '/notes' ? 'class="active"' : ''}>Notes</a></li>
          <li><a href="/login" class="btn-login">Se connecter</a></li>
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
        <div class="hero-content">
          <h1 class="hero-title">${escapeHtml(greeting(name))}</h1>
          <p class="hero-description">L'excellence digitale à votre service. Propulsez votre activité vers de nouveaux sommets grâce à notre solution haut de gamme.</p>
          <div class="hero-actions">
            <a href="/catalogue" class="btn-login">Découvrir nos services</a>
            <a href="/contact" class="btn-secondary">Nous contacter</a>
          </div>
        </div>
      </section>
      <section class="card">
        <h2>Pourquoi choisir notre solution ?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>Design Sur-Mesure</h3>
            <p>Une esthétique soignée et intemporelle qui valorise votre image de marque.</p>
          </div>
          <div class="feature-card">
            <h3>Performance Optimisée</h3>
            <p>Une architecture légère et rapide, sans aucune dépendance superflue.</p>
          </div>
          <div class="feature-card">
            <h3>Accompagnement Dédié</h3>
            <p>Une équipe d'experts à vos côtés pour garantir votre succès au quotidien.</p>
          </div>
        </div>
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

/** Returns the catalogue page. */
function cataloguePage() {
  const content = `
      <section class="card">
        <h1>Nos Services</h1>
        <div class="features-grid">
          <div class="feature-card">
            <h3>Conseil Premium</h3>
            <p>Un accompagnement personnalisé pour vos projets les plus ambitieux.</p>
          </div>
          <div class="feature-card">
            <h3>Développement Sur-mesure</h3>
            <p>Des solutions techniques robustes et adaptées à vos besoins.</p>
          </div>
          <div class="feature-card">
            <h3>Maintenance & Support</h3>
            <p>Une disponibilité totale pour assurer la pérennité de vos outils.</p>
          </div>
        </div>
      </section>
  `;
  return layout(content, '/catalogue');
}

/** Returns the notes page. */
async function notesPage(count, error = null) {
  const content = `
      <section class="card">
        <h1>Notes</h1>
        <p>Nombre total de notes : <strong>${count}</strong></p>
        ${error ? `<p style="color: red; margin-top: 1rem;">${escapeHtml(error)}</p>` : ''}
        <form method="POST" action="/notes" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
          <input type="text" name="content" placeholder="Contenu de la note..." required style="padding: 0.5rem; flex: 1; border: 1px solid #cbd5e1; border-radius: 4px;" />
          <button type="submit" style="background-color: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Ajouter une note</button>
        </form>
      </section>
  `;
  return layout(content, '/notes');
}

/** Answers one request: `request` and `response` are Node's `http` objects. */
export async function handle(request, response) {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const name = url.searchParams.get('name');

  if (url.pathname === '/notes') {
    if (request.method === 'GET') {
      const count = await prisma.note.count();
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(await notesPage(count));
    } else if (request.method === 'POST') {
      let body = '';
      for await (const chunk of request) {
        body += chunk;
      }
      const params = new URLSearchParams(body);
      const content = params.get('content');
      if (content) {
        await prisma.note.create({ data: { content } });
      }
      response.writeHead(303, { Location: '/notes' });
      response.end();
    } else {
      response.writeHead(405, { Allow: 'GET, POST', 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed');
    }
  } else if (request.method !== 'GET') {
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
  } else if (url.pathname === '/catalogue') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(cataloguePage());
  } else if (url.pathname === '/login') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(layout('<section class="card"><h1>Connexion</h1><p>Page de connexion en cours de développement.</p></section>', '/login'));
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
