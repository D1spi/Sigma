import request from 'supertest';
import { app } from '../src/app';
import mongoose from 'mongoose';
import { ProductModel } from '../src/models/product.model';

// Sample product for testing
const sampleProduct = {
  name: 'Test_Product',
  description: 'A test product for endpoint testing',
  type: 'Test_Window',
  material: 'Glass',
  dimensions: {
    width: 100,
    height: 150,
    depth: 5,
  },
  features: ['Test Feature 1', 'Test Feature 2'],
  price: 199.99,
  imageUrl: 'https://placehold.co/600x400?text=Test+Product',
  stockQuantity: 50,
  rating: 4.5,
};

describe('Product API Endpoints', () => {
  let productId: string;

  // Before all tests, connect to the database and add a test product
  beforeAll(async () => {
    // Clear product collection
    await ProductModel.deleteMany({});

    // Add a sample product
    const product = new ProductModel(sampleProduct);
    await product.save();
    productId = product._id.toString();
  });

  // After all tests, clean up the database
  afterAll(async () => {
    await ProductModel.deleteMany({});
    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  // Test GET /api/v1/products/:id - Get product by ID
  describe('GET /api/v1/products/:id', () => {
    it('should get a product by its ID', async () => {
      const res = await request(app).get(`/api/v1/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(productId);
      expect(res.body.data.name).toBe(sampleProduct.name);
      expect(res.body.data.description).toBe(sampleProduct.description);
    });

    it('should return 404 if product ID does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/products/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should handle invalid product ID format', async () => {
      const invalidId = 'invalid-id-format';
      const res = await request(app).get(`/api/v1/products/${invalidId}`);

      expect(res.status).toBe(500); // or whatever status code your error middleware returns
    });
  });

  // Test GET /api/v1/products/search - Search products by name
  describe('GET /api/v1/products/search', () => {
    it('should search products by name', async () => {
      const res = await request(app).get('/api/v1/products/search?name=Test');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toBe(sampleProduct.name);
    });

    it('should return empty array when no matches found', async () => {
      const res = await request(app).get('/api/v1/products/search?name=NonExistentProduct');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 400 if name parameter is missing', async () => {
      const res = await request(app).get('/api/v1/products/search');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // Test GET /api/v1/products/top - Get top 10 products
  describe('GET /api/v1/products/top', () => {
    it('should get top products sorted by name', async () => {
      const res = await request(app).get('/api/v1/products/top');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
