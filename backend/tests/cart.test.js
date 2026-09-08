const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

describe('Cart Endpoints (/api/cart)', () => {
  let userAgent;
  let user;
  let sampleProduct1;
  let sampleProduct2;

  beforeEach(async () => {
    // 1. Create and authenticate a test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'Password123!'
      });
    user = signupRes.body.user;

    userAgent = request.agent(app);
    await userAgent
      .post('/api/auth/login')
      .send({
        email: 'bob@example.com',
        password: 'Password123!'
      });

    // 2. Create sample products
    sampleProduct1 = await Product.create({
      name: 'Organic Apples',
      description: 'Fresh crisp apples',
      category: 'Fruits',
      price: 4.99,
      stock: 50
    });

    sampleProduct2 = await Product.create({
      name: 'Whole Milk',
      description: 'Gallon whole milk',
      category: 'Dairy',
      price: 3.49,
      stock: 30
    });
  });

  describe('POST /api/cart (addToCart)', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString() });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('User not authenticated');
    });

    it('should return 400 if productId is missing in request body', async () => {
      const res = await userAgent
        .post('/api/cart')
        .send({ quantity: 2 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Product ID is required');
    });

    it('should add a new item to cart with default quantity of 1 when no cart exists', async () => {
      const res = await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Product added to cart successfully');
      expect(res.body.cart).toBeDefined();
      expect(res.body.cart.items).toHaveLength(1);
      expect(res.body.cart.items[0].product.toString()).toBe(sampleProduct1._id.toString());
      expect(res.body.cart.items[0].quantity).toBe(1);

      // Verify in DB
      const dbCart = await Cart.findOne({ user: user._id });
      expect(dbCart).not.toBeNull();
      expect(dbCart.items).toHaveLength(1);
      expect(dbCart.items[0].quantity).toBe(1);
    });

    it('should add a new item to cart with specified custom quantity', async () => {
      const res = await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.cart.items[0].quantity).toBe(3);
    });

    it('should increment quantity when the item already exists in the cart', async () => {
      // First addition: quantity = 2
      await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 2 });

      // Second addition of the same product: quantity = 3
      const res = await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.cart.items).toHaveLength(1);
      // Existing quantity (2) + new quantity (3) = 5
      expect(res.body.cart.items[0].quantity).toBe(5);

      const dbCart = await Cart.findOne({ user: user._id });
      expect(dbCart.items).toHaveLength(1);
      expect(dbCart.items[0].quantity).toBe(5);
    });

    it('should add a second distinct product as a new item in an existing cart', async () => {
      // Add first product
      await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 1 });

      // Add second product
      const res = await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct2._id.toString(), quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.cart.items).toHaveLength(2);
      expect(res.body.cart.items.some(i => i.product.toString() === sampleProduct1._id.toString())).toBe(true);
      expect(res.body.cart.items.some(i => i.product.toString() === sampleProduct2._id.toString())).toBe(true);
    });
  });

  describe('PUT /api/cart/:productId (updateCartItem)', () => {
    beforeEach(async () => {
      // Seed cart with sampleProduct1 (quantity: 3)
      await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 3 });
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .put(`/api/cart/${sampleProduct1._id}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('User not authenticated');
    });

    it('should return 404 if item is not found in the cart', async () => {
      const res = await userAgent
        .put(`/api/cart/${sampleProduct2._id}`) // sampleProduct2 was not added
        .send({ quantity: 5 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Item not found in cart');
    });

    it('should successfully update quantity of existing item to positive number', async () => {
      const res = await userAgent
        .put(`/api/cart/${sampleProduct1._id}`)
        .send({ quantity: 8 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cart updated successfully');
      expect(res.body.cart.items[0].quantity).toBe(8);

      const dbCart = await Cart.findOne({ user: user._id });
      expect(dbCart.items[0].quantity).toBe(8);
    });

    it('should remove item when quantity <= 0 (quantity = 0 branch)', async () => {
      const res = await userAgent
        .put(`/api/cart/${sampleProduct1._id}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cart updated successfully');
      expect(res.body.cart.items).toHaveLength(0);

      const dbCart = await Cart.findOne({ user: user._id });
      expect(dbCart.items).toHaveLength(0);
    });

    it('should remove item when quantity is negative (quantity < 0 branch)', async () => {
      const res = await userAgent
        .put(`/api/cart/${sampleProduct1._id}`)
        .send({ quantity: -2 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cart updated successfully');
      expect(res.body.cart.items).toHaveLength(0);

      const dbCart = await Cart.findOne({ user: user._id });
      expect(dbCart.items).toHaveLength(0);
    });
  });

  describe('GET /api/cart and DELETE /api/cart/:productId', () => {
    it('should return 401 when fetching cart without authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('User not authenticated');
    });

    it('should return empty array if user has no cart', async () => {
      const res = await userAgent.get('/api/cart');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should retrieve populated cart items for authenticated user', async () => {
      await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 2 });

      const res = await userAgent.get('/api/cart');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].quantity).toBe(2);
      expect(res.body[0].product.name).toBe('Organic Apples');
    });

    it('should delete item from cart via DELETE endpoint', async () => {
      await userAgent
        .post('/api/cart')
        .send({ productId: sampleProduct1._id.toString(), quantity: 2 });

      const res = await userAgent.delete(`/api/cart/${sampleProduct1._id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Item removed from cart successfully');
      expect(res.body.cart.items).toHaveLength(0);
    });
  });
});
