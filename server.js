/**
 * Starts the app on the port `PORT` names, 3000 by default, on every network interface so that a
 * preview container can reach it. `npm start` runs it.
 */

import { createServer } from 'node:http';

import { handle } from './src/app.js';

const port = Number(process.env.PORT ?? 3000);

createServer(handle).listen(port, '0.0.0.0', () => {
  console.log(`Listening on http://localhost:${port}`);
});
