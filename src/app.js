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
         background-color: red;
         font-family: Arial, sans-serif;
         margin: 0;
         padding: 0;
       }
       .navbar {
         background-color: rgba(255, 255, 255, 0.8);
         padding: 1rem;
         display: flex;
         justify-content: space-between;
         align-items: center;
         box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
       }
       .logo {
         font-size: 1.5rem;
         font-weight: bold;
       }
       .nav-links {
         display: flex;
         list-style: none;
         gap: 1.5rem;
       }
       .nav-links li a {
         text-decoration: none;
         color: #333;
         font-weight: 500;
       }
       .hamburger {
         display: none;
         cursor: pointer;
       }
       @media (max-width: 768px) {
         .nav-links {
           display: none;
           flex-direction: column;
           width: 100%;
           position: absolute;
           top: 70px;
           left: 0;
           background-color: rgba(255, 255, 255, 0.95);
           padding: 1rem;
         }
         .nav-links.active {
           display: flex;
         }
         .nav-links li {
           padding: 0.5rem 1rem;
         }
         .hamburger {
           display: block;
         }
       }
      </style>
  </head>
<body>
      <nav class="navbar">
        <div class="logo">Accueil</div>
        <div class="hamburger">☰</div>
        <ul class="nav-links" id="navLinks">
          <li><a href="/">Accueil</a></li>
          <li><a href="/salutations">Salutations</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
       <div class="content">
         <h1>${escapeHtml(greeting(name))}  !</h1>
         <p>Bienvenue sur notre application de test. Voici un peu de contenu pour illustrer la page d'accueil.</p>
       </div>
      <script>
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        hamburger.addEventListener('click', () => {
          navLinks.classList.toggle('active');
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
