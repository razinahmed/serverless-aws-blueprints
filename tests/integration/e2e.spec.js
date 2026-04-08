const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev';

describe('Serverless AWS Blueprints - E2E Integration Tests', () => {
  let createdItemId;

  describe('POST /items', () => {
    it('creates a new item and returns 201', async () => {
      const res = await axios.post(`${API_BASE}/items`, {
        name: 'Test Widget',
        price: 29.99,
        category: 'electronics',
      });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.name).toBe('Test Widget');
      createdItemId = res.data.id;
    });

    it('returns 400 for missing required fields', async () => {
      try {
        await axios.post(`${API_BASE}/items`, { price: 10 });
      } catch (err) {
        expect(err.response.status).toBe(400);
        expect(err.response.data.error).toMatch(/name.*required/i);
      }
    });
  });

  describe('GET /items/:id', () => {
    it('retrieves the created item by ID', async () => {
      const res = await axios.get(`${API_BASE}/items/${createdItemId}`);
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(createdItemId);
      expect(res.data.name).toBe('Test Widget');
    });

    it('returns 404 for non-existent ID', async () => {
      try {
        await axios.get(`${API_BASE}/items/nonexistent-id-12345`);
      } catch (err) {
        expect(err.response.status).toBe(404);
      }
    });
  });

  describe('GET /items', () => {
    it('returns a paginated list of items', async () => {
      const res = await axios.get(`${API_BASE}/items?limit=10`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.items)).toBe(true);
      expect(res.data).toHaveProperty('nextToken');
    });
  });

  describe('PUT /items/:id', () => {
    it('updates an existing item', async () => {
      const res = await axios.put(`${API_BASE}/items/${createdItemId}`, {
        name: 'Updated Widget',
        price: 39.99,
        category: 'electronics',
      });
      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Widget');
    });
  });

  describe('DELETE /items/:id', () => {
    it('deletes the item and returns 204', async () => {
      const res = await axios.delete(`${API_BASE}/items/${createdItemId}`);
      expect(res.status).toBe(204);
    });

    it('confirms item no longer exists', async () => {
      try {
        await axios.get(`${API_BASE}/items/${createdItemId}`);
      } catch (err) {
        expect(err.response.status).toBe(404);
      }
    });
  });

  describe('POST /auth/login', () => {
    it('returns JWT token for valid credentials', async () => {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'Test1234!',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data.token.split('.')).toHaveLength(3);
    });
  });
});
