const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');

describe('Authentication Endpoints (/api/auth)', () => {
  const validUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!'
  };

  describe('POST /api/auth/signup', () => {
    it('should successfully register a new user with status 201', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.name).toBe(validUser.name);
      // Password in database should be hashed, not plaintext
      expect(res.body.user.password).not.toBe(validUser.password);

      const dbUser = await User.findOne({ email: validUser.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(validUser.name);
    });

    it('should reject signup with duplicate email enforcing unique constraint (status 400)', async () => {
      // First registration
      const firstRes = await request(app)
        .post('/api/auth/signup')
        .send(validUser);
      expect(firstRes.status).toBe(201);

      // Duplicate registration attempt with same email
      const dupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Alice Duplicate',
          email: validUser.email,
          password: 'DifferentPassword'
        });

      expect(dupRes.status).toBe(401);
      expect(dupRes.body.message).toBe('User already exists');
      // Ensure only 1 user exists with that email in DB
      const count = await User.countDocuments({ email: validUser.email });
      expect(count).toBe(1);
    });

    it('should reject signup when required password is missing (status 400)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Incomplete User',
          email: 'incomplete@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Error creating user');
    });

    it('should reject signup when required email is missing (status 400)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'No Email User',
          password: 'SomePassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Error creating user');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create user before testing login
      await request(app)
        .post('/api/auth/signup')
        .send(validUser);
    });

    it('should successfully log in with valid credentials and establish a session', async () => {
      const agent = request.agent(app);
      const res = await agent
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login Successful');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.name).toBe(validUser.name);

      // Verify active session using the same agent
      const sessionRes = await agent.get('/api/auth/session');
      expect(sessionRes.status).toBe(200);
      expect(sessionRes.body.user.email).toBe(validUser.email);
    });

    it('should reject login with wrong password (status 401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword456'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should reject login for a nonexistent user email (status 401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/session and POST /api/auth/logout', () => {
    it('should return 401 when checking session without an active login', async () => {
      const res = await request(app).get('/api/auth/session');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No active session');
    });

    it('should successfully log out and invalidate the session', async () => {
      await request(app).post('/api/auth/signup').send(validUser);

      const agent = request.agent(app);
      await agent
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      const logoutRes = await agent.post('/api/auth/logout');
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe('Logged Out Successfully');

      const checkRes = await agent.get('/api/auth/session');
      expect(checkRes.status).toBe(401);
    });
  });
});
