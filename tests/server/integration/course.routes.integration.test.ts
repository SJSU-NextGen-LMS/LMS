import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import request from 'supertest'
import express, { Application } from 'express'
import courseRoutes from '../../../server/src/routes/courseRoutes'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock Clerk authentication
jest.mock('@clerk/express', () => ({
  requireAuth: () => (req: any, res: any, next: any) => next(),

  getAuth: () => ({ userId: 'test-teacher-id' })
}))

// Mock multer
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req: any, res: any, next: any) => next(),
  })
  multer.memoryStorage = () => ({
    _handleFile: (req: any, file: any, cb: any) => {
      cb(null, { buffer: Buffer.from('test') })
    },
    _removeFile: (req: any, file: any, cb: any) => {
      cb(null)
    }
  })
  return multer
})

describe('Course Routes', () => {
  let app: Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/courses', courseRoutes as any)
  })

  describe('GET /api/courses', () => {
    it('should return list of courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const newCourse = {
        teacherId: 'test-teacher-id',
        teacherName: 'Test Teacher',
      }

      const response = await request(app)
        .post('/api/courses')
        .send(newCourse)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('courseId')
      expect(response.body.data.title).toBe("Untitled Course")
      expect(response.body.data.teacherId).toBe(newCourse.teacherId)
    })

    it('should return 400 if teacherId and teacherName are missing', async () => {
      const invalidCourse = {
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming'
      }

      const response = await request(app)
        .post('/api/courses')
        .send(invalidCourse)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Teacher Id and name are required')
    })
  })

  describe('GET /api/courses/:courseId', () => {
    let testCourseId: string;

    beforeEach(async () => {
      // Create a test course first
      const newCourse = {
        teacherId: 'test-teacher-id',
        teacherName: 'Test Teacher'
      }

      const response = await request(app)
        .post('/api/courses')
        .send(newCourse)

      testCourseId = response.body.data.courseId
    })

    it('should return course by id', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('courseId')
      expect(response.body.data.courseId).toBe(testCourseId)
      expect(response.body.data.teacherId).toBe('test-teacher-id')
    })

    it('should return 404 for non-existent course', async () => {
      const nonExistentId = 'non-existent-id'
      const response = await request(app)
        .get(`/api/courses/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Course not found')
    })
  })

  describe('PUT /api/courses/:courseId', () => {
    let testCourseId: string;

    beforeEach(async () => {
      // Create a test course first
      const newCourse = {
        teacherId: 'test-teacher-id',
        teacherName: 'Test Teacher'
      }

      const response = await request(app)
        .post('/api/courses')
        .send(newCourse)

      testCourseId = response.body.data.courseId
    })

    it('should update course', async () => {
      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated Description',
        category: 'Programming',
        image: 'https://example.com/image.jpg'

      }

      const response = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.title).toBe(updateData.title)
      expect(response.body.data.description).toBe(updateData.description)
    })

    it('should return 404 for non-existent course', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = {
        title: 'Updated Course Title'
      }

      const response = await request(app)
        .put(`/api/courses/${nonExistentId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Course not found')
    })

    it('should return 403 if not authorized', async () => {
      // Mock getAuth to return a different userId
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' })

      const updateData = {
        title: 'Updated Course Title'
      }

      const response = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(403)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Not authorized to update this course ')
    })
  })

  describe('DELETE /api/courses/:courseId', () => {
    let testCourseId: string;

    beforeEach(async () => {
      // Create a test course first
      const newCourse = {
        teacherId: 'test-teacher-id',
        teacherName: 'Test Teacher'
      }

      const response = await request(app)
        .post('/api/courses')
        .send(newCourse)

      testCourseId = response.body.data.courseId
    })

    it('should delete course', async () => {
      const response = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.message).toBe('Course deleted successfully')
    })

    it('should return 404 for non-existent course', async () => {
      const nonExistentId = 'non-existent-id'
      const response = await request(app)
        .delete(`/api/courses/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Course not found')
    })

    it('should return 403 if not authorized', async () => {
      // Mock getAuth to return a different userId
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' })

      const response = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .expect('Content-Type', /json/)
        .expect(403)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Not authorized to delete this course ')
    })
  })

  describe('GET /api/courses/teacher-courses/:userId', () => {
    it('should return teacher courses', async () => {
      const userId = 'test-teacher-id'
      const response = await request(app)
        .get(`/api/courses/teacher-courses/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.message).toBe('Own courses retrieved successfully')
    })

    it('should return 403 if not authorized', async () => {
      // Mock getAuth to return a different userId
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' })

      const userId = 'test-teacher-id'
      const response = await request(app)
        .get(`/api/courses/teacher-courses/${userId}`)
        .expect('Content-Type', /json/)
        .expect(403)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('get teacher courses Access denied')
    })
  })
})