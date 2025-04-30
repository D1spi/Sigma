import request from 'supertest';
import { app } from '../src/app'; // tu servidor express, por ejemplo

describe('GET /ping', () => {
  it('responde pong', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.text).toBe('pong');
  });
});
