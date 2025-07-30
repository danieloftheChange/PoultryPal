import request from 'supertest';
import app from '../../app.js';

describe('Stock API', () => {
  it('should return 404 if user has no farmId', async () => {
    const res = await request(app)
      .get('/api/stock')
      .set('Authorization', 'Bearer fake.jwt.token');

    expect(res.statusCode).toBe(404);
  });
});