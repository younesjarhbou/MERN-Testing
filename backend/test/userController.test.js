// userController.test.js

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

// Import controller functions directly to test them
import { loginUser, registerUser, getUser } from '../controllers/userController.js';

// Setup the Express app for testing
const app = express();
app.use(express.json());

// Setup middleware for auth
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Setup routes
app.post('/api/login', loginUser);
app.post('/api/register', registerUser);
app.get('/api/user', requireAuth, getUser);

describe('User Authentication Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Set up MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    // Set JWT_SECRET for testing if not present
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await userModel.deleteMany({});
  });

  describe('User Controller Functions', () => {
    // Direct unit tests for controller functions
    test('registerUser should create a new user', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'StrongP@ssw0rd!'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await registerUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
          token: expect.any(String)
        })
      );
    });
    
    test('loginUser should login an existing user', async () => {
      // Create a user first
      const password = 'StrongP@ssw0rd!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await userModel.create({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: hashedPassword
      });
      
      const req = {
        body: {
          email: 'johndoe@example.com',
          password: 'StrongP@ssw0rd!'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
          token: expect.any(String)
        })
      );
    });
  });

  describe('API Routes Integration Tests', () => {
    describe('POST /api/register', () => {
      it('should register a new user', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'StrongP@ssw0rd!'
          });
          
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('name', 'John Doe');
        expect(response.body.user).toHaveProperty('email', 'johndoe@example.com');
      });

      it('should not register a user with an existing email', async () => {
        // Create a user first
        await request(app)
          .post('/api/register')
          .send({
            name: 'Jane Doe',
            email: 'janedoe@example.com',
            password: 'StrongP@ssw0rd!'
          });

        const response = await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'janedoe@example.com',
            password: 'AnotherP@ssw0rd!'
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User already exists');
      });

      it('should not register a user with empty fields', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            name: '',
            email: '',
            password: ''
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Please enter all fields');
      });

      it('should not register a user with invalid email', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'notanemail',
            password: 'StrongP@ssw0rd!'
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Please enter a valid email');
      });

      it('should not register a user with weak password', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123'
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Please enter a strong password');
      });
    });

    describe('POST /api/login', () => {
      it('should login an existing user', async () => {
        // Create a user first
        await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'StrongP@ssw0rd!'
          });

        const response = await request(app)
          .post('/api/login')
          .send({
            email: 'johndoe@example.com',
            password: 'StrongP@ssw0rd!'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
      });

      it('should not login with invalid credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User does not exist');
      });

      it('should not login with empty fields', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: '',
            password: ''
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Please enter all fields');
      });

      it('should not login with incorrect password', async () => {
        // Create a user first
        await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'StrongP@ssw0rd!'
          });

        const response = await request(app)
          .post('/api/login')
          .send({
            email: 'johndoe@example.com',
            password: 'WrongPassword'
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
      });
    });

    describe('GET /api/user', () => {
      it('should get user info with valid token', async () => {
        // Create a user first
        const registerResponse = await request(app)
          .post('/api/register')
          .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'StrongP@ssw0rd!'
          });

        const token = registerResponse.body.token;

        const response = await request(app)
          .get('/api/user')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('name', 'John Doe');
        expect(response.body.user).toHaveProperty('email', 'johndoe@example.com');
      });

      it('should return 401 if no token is provided', async () => {
        const response = await request(app)
          .get('/api/user');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should return 401 if invalid token is provided', async () => {
        const response = await request(app)
          .get('/api/user')
          .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
      });
    });
  });
});