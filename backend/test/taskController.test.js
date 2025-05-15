// taskController.test.js

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import taskModel from '../models/taskModel.js';
import userModel from '../models/userModel.js';
import { addTask, getTask, removeTask } from '../controllers/taskController.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Middleware to simulate authentication
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Setup routes
app.post('/api/task', requireAuth, addTask);
app.get('/api/task', requireAuth, getTask);
app.delete('/api/task', requireAuth, removeTask);

describe('Task Controller Tests', () => {
  let mongoServer;
  let token;
  let userId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create a test user and generate a token
    const testUser = await userModel.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongP@ssw0rd!',
    });
    
    // Store the user ID for later use
    userId = testUser._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_secret');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await taskModel.deleteMany({});
  });

  describe('POST /api/task', () => {
    it('should add a new task', async () => {
      const response = await request(app)
        .post('/api/task')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Task',
          description: 'This is a test task.',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task added successfully');

      const task = await taskModel.findOne({ title: 'New Task' });
      expect(task).toBeTruthy();
      expect(task.description).toBe('This is a test task.');
      expect(task.completed).toBe(false);
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app).post('/api/task').send({
        title: 'New Task',
        description: 'This is a test task.',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /api/task', () => {
    it('should retrieve tasks for the authenticated user', async () => {
      // Create a task with the correct userId
      await taskModel.create({
        title: 'Test Task',
        description: 'This is a test task.',
        completed: false,
        userId: userId, // Use the actual user ID, not token.userId
      });

      const response = await request(app)
        .get('/api/task')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Test Task');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/task');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/task', () => {
    it('should delete a task', async () => {
      // Create a task with the correct userId
      const task = await taskModel.create({
        title: 'Task to delete',
        description: 'This task will be deleted.',
        completed: false,
        userId: userId, // Use the actual user ID, not token.userId
      });

      const response = await request(app)
        .delete('/api/task')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: task._id });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');

      const deletedTask = await taskModel.findById(task._id);
      expect(deletedTask).toBeNull(); // Ensure the task has been deleted
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app).delete('/api/task').send({ id: 'someId' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should handle errors while deleting', async () => {
      const response = await request(app)
        .delete('/api/task')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: 'invalidtaskid' });

      expect(response.status).toBe(501); 
      expect(response.body.message).toContain('Cast to ObjectId failed for value');
    });
  });
});