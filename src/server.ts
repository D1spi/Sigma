// Entry point of the application.
// Starts the server and listens for incoming requests.

import { app } from './app.js';
import { PORT } from './config/config.js';
import logger from './config/logger.js';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  logger.info(`⚡️[server]: Server is running at ${BASE_URL}`);
});
