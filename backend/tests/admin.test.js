const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/userModel');
const Product = require('../models/productModel');

describe('Admin Route Protection (/api/admin/*)', () => {
  let nonAdminAgent;
  let adminAgent;

  beforeEach(async () => {
    // 1. Create a regular (non-admin) user
    const userPasswordHash = await bcrypt.hash('UserPassword123!', 10);
    await User.create({
      name: 'Regular Customer',
      email: 'customer@example.com',
      password: userPasswordHash,
      isAdmin: false
    });

    nonAdminAgent = request.agent(app);
    await nonAdminAgent
      .post('/api/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'UserPassword123!'
      });

    // 2. Create an admin user
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
    await User.create({
      name: 'Admin Boss',
      email: 'admin@example.com',
      password: adminPasswordHash,
      isAdmin: true
    });

    adminAgent = request.agent(app);
    await adminAgent
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword123!'
      });
  });

  describe('Unauthenticated access (no active session)', () => {
    it('should return 401 Authentication required for GET /api/admin/users', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication required');
    });

    it('should return 401 Authentication required for GET /api/admin/products', async () => {
      const res = await request(app).get('/api/admin/products');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication required');
    });

    it('should return 401 Authentication required for GET /api/admin/orders', async () => {
      const res = await request(app).get('/api/admin/orders');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication required');
    });
  });

  describe('Non-admin authenticated access', () => {
    it('should return 403 Admin access required for GET /api/admin/users', async () => {
      const res = await nonAdminAgent.get('/api/admin/users');
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });

    it('should return 403 Admin access required for GET /api/admin/products', async () => {
      const res = await nonAdminAgent.get('/api/admin/products');
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });

    it('should return 403 Admin access required for GET /api/admin/orders', async () => {
      const res = await nonAdminAgent.get('/api/admin/orders');
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });
  });

  describe('Admin authenticated access', () => {
    it('should allow access with status 200 for GET /api/admin/users', async () => {
      const res = await adminAgent.get('/api/admin/users');
      expect(res.status).toBe(200);
      expect(res.body.users).toBeDefined();
      expect(Array.isArray(res.body.users)).toBe(true);
      // Passwords should be excluded by select('-password')
      const adminInList = res.body.users.find(u => u.email === 'admin@example.com');
      expect(adminInList).toBeDefined();
      expect(adminInList.password).toBeUndefined();
    });

    it('should allow access with status 200 for GET /api/admin/products', async () => {
      await Product.create({
        name: 'Avocado',
        category: 'Produce',
        price: 1.99,
        stock: 25
      });

      const res = await adminAgent.get('/api/admin/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow access with status 200 for GET /api/admin/orders', async () => {
      const res = await adminAgent.get('/api/admin/orders');
      expect(res.status).toBe(200);
      expect(res.body.orders).toBeDefined();
      expect(Array.isArray(res.body.orders)).toBe(true);
    });
  });
});
