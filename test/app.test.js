import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';

import { handle } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createServer(handle);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('shows the greeting page', async () => {
  const response = await fetch(`${base}/?name=Ada`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<h1>Bonjour, Ada !<\/h1>/);
});

test('shows the navigation bar and page layout with links to separate pages and green login button', async () => {
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<nav class="navbar">/);
  assert.match(html, /class="menu-toggle"/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/about"/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /href="\/login"/);
  assert.match(html, /Se connecter/);
  assert.match(html, /\.btn-login\s*\{[^}]*background-color:\s*#10b981;/s);
});

test('serves the about page', async () => {
  const response = await fetch(`${base}/about`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1>À propos<\/h1>/);
  assert.match(html, /Cette application démontre/);
});

test('serves the contact page', async () => {
  const response = await fetch(`${base}/contact`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1>Contact<\/h1>/);
  assert.match(html, /Pour toute question/);
});

test('never lets a name inject markup', async () => {
  const response = await fetch(`${base}/?name=${encodeURIComponent('<script>x</script>')}`);
  const html = await response.text();
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
});

test('answers the greeting as JSON', async () => {
  const response = await fetch(`${base}/api/greeting?name=Grace`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { greeting: 'Bonjour, Grace !' });
});

test('says it is up', async () => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ok');
});

test('answers 404 to an unknown path and 405 to another method', async () => {
  assert.equal((await fetch(`${base}/nowhere`)).status, 404);
  const posted = await fetch(`${base}/`, { method: 'POST' });
  assert.equal(posted.status, 405);
  assert.equal(posted.headers.get('allow'), 'GET');
});
