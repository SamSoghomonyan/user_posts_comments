import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';

describe('User login', () => {
  let token = '';
  let userId = '';
  const random = Math.random().toString(36).substring(2, 10);

  const userInfo = {
    username: `user_${random}`,
    email: `${random}@example.com`,
    password: '123456',
  };

  beforeAll(async () => {
    await AppDataSource.initialize();

    await request(app).post('/auth/signup').send(userInfo);

    const loginRes = await request(app).post('/auth/login').send({
      email: userInfo.email,
      password: userInfo.password,
    });

    token = loginRes.body.token;

    const meRes = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`);

    userId = meRes.body.id;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('Login successful', () => {
    it('should return a token when credentials are valid', async () => {
      expect(token).toBeDefined();
    });
  });

  describe('Incorrect credentials', () => {
    it('should return 401 for invalid password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: userInfo.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid password');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: userInfo.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email');
    });
  });

  describe('Access protected route /user/me', () => {
    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          username: userInfo.username,
          email: userInfo.email,
          password: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });
  });

  describe('Delete user', () => {
    it('should delete the user with valid token and correct ID', async () => {
      const res = await request(app)
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted');
    });
  });
});
