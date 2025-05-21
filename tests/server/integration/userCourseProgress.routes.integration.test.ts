import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import request from 'supertest'
import express from 'express'
import userCourseProgressRoutes from '../../../server/src/routes/userCourseProgressRoutes'
import { requireAuth, getAuth } from '@clerk/express'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'


// Mock Clerk authentication
jest.mock('@clerk/express', () => ({
  requireAuth: () => (req: any, res: any, next: any) => next(),
  getAuth: () => ({ userId: 'test-user-id' })
}))


describe('User Course Progress Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/progress', userCourseProgressRoutes as any)
  })

  describe('GET /api/progress/all-progress', () => {
    it('should return all students progress', async () => {
      // Mock getAuth to return a manager user
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'manager-id' })

      const response = await request(app)
        .get('/api/progress/all-progress')
        .set('x-user-type', 'manager')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.message).toBe('Student progress data retrieved successfully')
    })

    it('should return 403 if not manager or admin', async () => {
      const response = await request(app)
        .get('/api/progress/all-progress')
        .set('x-user-type', 'student')
        .expect('Content-Type', /json/)
        .expect(403)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Access denied. Manager or admin role required.')
    })
  })

  describe('GET /api/progress/:userId/enrolled-courses', () => {
    it('should return user enrolled courses', async () => {
      const userId = 'test-user-id'
      const response = await request(app)
        .get(`/api/progress/${userId}/enrolled-courses`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.message).toBe('Enrolled courses retrieved successfully')
    })

    it('should return 403 if not authorized', async () => {
      // Mock getAuth to return a different userId
      jest.spyOn(require('@clerk/express'), 'getAuth').mockReturnValueOnce({ userId: 'different-user-id' })

      const userId = 'test-user-id'
      const response = await request(app)
        .get(`/api/progress/${userId}/enrolled-courses`)
        .expect('Content-Type', /json/)
        .expect(403)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('get user enrolled courses Access denied')
    })
  })

  describe('GET /api/progress/:userId/courses/:courseId', () => {
    it('should return user course progress', async () => {
      const userId = 'test-user-id'
      const courseId = 'test-course-id'
      const response = await request(app)
        .get(`/api/progress/${userId}/courses/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('userId')
      expect(response.body.data).toHaveProperty('courseId')
      expect(response.body.data).toHaveProperty('overallProgress')
      expect(response.body.message).toBe('Course progress retrieved successfully')
    })

    it('should return 404 if progress not found', async () => {
      const userId = 'test-user-id'
      const courseId = 'non-existent-course'
      const response = await request(app)
        .get(`/api/progress/${userId}/courses/${courseId}`)
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Course progress not found for this user')
    })
  })

  describe('PUT /api/progress/:userId/courses/:courseId', () => {
    it('should update user course progress', async () => {
      const userId = 'test-user-id'
      const courseId = 'test-course-id'
      const progressData = {
        sections: [
          {
            sectionId: 'section1',
            chapters: [
              {
                chapterId: 'chapter1',
                completed: true
              }
            ]
          }
        ]
      }

      const response = await request(app)
        .put(`/api/progress/${userId}/courses/${courseId}`)
        .send(progressData)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('userId')
      expect(response.body.data).toHaveProperty('courseId')
      expect(response.body.data).toHaveProperty('overallProgress')
      expect(response.body.data).toHaveProperty('status')
      expect(response.body.data.status).toBe('completed')
    })

    it('should create new progress if not exists', async () => {
      const userId = 'test-user-id'
      const courseId = 'new-course-id'
      const progressData = {
        sections: [
          {
            sectionId: 'section1',
            chapters: [
              {
                chapterId: 'chapter1',
                completed: true
              }
            ]
          }
        ]
      }

      const response = await request(app)
        .put(`/api/progress/${userId}/courses/${courseId}`)
        .send(progressData)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('userId')
      expect(response.body.data).toHaveProperty('courseId')
      expect(response.body.data).toHaveProperty('enrollmentDate')
      expect(response.body.data).toHaveProperty('overallProgress')
      expect(response.body.data).toHaveProperty('status')
      expect(response.body.data.status).toBe('completed')
    })
  })
})