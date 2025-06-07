import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';

describe('User Register', () => {

  beforeAll(async () => {
    await AppDataSource.initialize();

    for (let i = 0; i < 10; i++) {
      const randomString = Math.random().toString(36).substring(2, 10);
      const user = {
        username: `user_${randomString}`,
        email: `${randomString}@example.com`,
        password: '123456',
      };
      await request(app).post('/auth/signup').send(user);
    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('✅ Successful Registration', () => {
    it('should return 200 OK and user data', async () => {
      const randomString = Math.random().toString(36).substring(2, 10);
      const newUser = {
        username: `user_${randomString}`,
        email: `${randomString}@example.com`,
        password: '123456',
      };

      const res = await request(app).post('/auth/signup').send(newUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'successfully');
      expect(res.body.user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          username: newUser.username,
          email: newUser.email,
          password: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });
  });

  describe('Registration with Existing Email', () => {
    const existingUser = {
      username: 'user_nuespgy3',
      email: 'nuespgy3@example.com',
      password: '123456',
    };

    beforeAll(async () => {
      await request(app).post('/auth/signup').send(existingUser);
    });

    it('should return 400 for existing email', async () => {
      const res = await request(app).post('/auth/signup').send(existingUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email already exists');
    });
  });
});
