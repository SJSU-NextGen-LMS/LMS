import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import request from 'supertest';
import express, { Application } from 'express';
import assignCourseRoutes from '../../../server/src/routes/assignCourseRoutes';
import { requireAuth, getAuth } from '@clerk/express';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import Course from '../../../server/src/models/courseModel';
import AssignCourse from '../../../server/src/models/assignCourseModel';
import UserCourseProgress from '../../../server/src/models/userCourseProgressModel';

// Mock Clerk authentication
jest.mock('@clerk/express', () => ({
  requireAuth: () => (req: any, res: any, next: any) => next(),
  getAuth: () => ({ userId: 'test-user-id' })
}));

// Mock Dynamoose models
jest.mock('../../../server/src/models/courseModel');
jest.mock('../../../server/src/models/assignCourseModel');
jest.mock('../../../server/src/models/userCourseProgressModel');

describe('Assign Course Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/assignCourse', assignCourseRoutes as any);
    jest.clearAllMocks();
  });

  describe('POST /assignCourse', () => {
    it('should create a new course assignment', async () => {
      const newAssignment = {
        userId: 'test-user-id',
        courseId: 'test-course-id',
        managerId: 'manager-id',
        managerName: 'Test Manager',
        note: 'Test assignment',
        dueDate: '2024-12-31'
      };

      const response = await request(app)
        .post('/assignCourse')
        .send(newAssignment)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Assign Course successfully');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidAssignment = {
        userId: 'test-user-id',
        // Missing required fields
      };

      const response = await request(app)
        .post('/assignCourse')
        .send(invalidAssignment)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /assignCourse/:userId', () => {
    it('should return assigned courses for a user', async () => {
      const userId = 'test-user-id';
      const response = await request(app)
        .get(`/assignCourse/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Assigned courses retrieved successfully');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 if not authorized', async () => {
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' });

      const userId = 'test-user-id';
      const response = await request(app)
        .get(`/assignCourse/${userId}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'get user assigned courses Access denied');
    });
  });

  describe('GET /assignCourse/:userId/:courseId', () => {
    it('should return a specific course assignment', async () => {
      const userId = 'test-user-id';
      const courseId = 'test-course-id';

      const response = await request(app)
        .get(`/assignCourse/${userId}/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Assignment retrieved successfully');
    });

    it('should return 403 if not authorized', async () => {
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' });

      const userId = 'test-user-id';
      const courseId = 'test-course-id';
      const response = await request(app)
        .get(`/assignCourse/${userId}/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'get user assigned course Access denied');
    });
  });

  describe('GET /assignCourse/manager/:userId', () => {
    it('should return courses assigned by a manager', async () => {
      const userId = 'test-user-id';
      const response = await request(app)
        .get(`/assignCourse/manager/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Assigned courses with progress retrieved successfully');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 if not authorized', async () => {
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' });

      const userId = 'test-user-id';
      const response = await request(app)
        .get(`/assignCourse/manager/${userId}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'get manager assigned courses Access denied.');
    });
  });
});