// Sets up the Express server, middleware, routes, and error handling.

import express from 'express';
import cors from 'cors';
import { CLIENT_URL } from './config/config';
import { createConnection } from './config/db';
// For PostgreSQL with Prisma uncomment the following line and comment the previous one
// import { createConnection } from './config/db.prisma';
import { baseRouter } from './routes/base.routes';

// Initialize express
export const app = express();
app.disable('x-powered-by');

// Allow cors for all connexions (development)
app.use(cors());
// Allow cors for especific client url (production)
app.use(cors({ origin: CLIENT_URL }));

// Connect to the database
(async () => await createConnection())();

app.get('/ping', (req, res) => res.send('pong'));

app.use('/api/v1', baseRouter);
