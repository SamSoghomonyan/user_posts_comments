import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import jwt from 'jsonwebtoken';
import {User} from "../src/entity/User";

describe('Users API with auth', () => {
  let token = '';
  let token2 = '';
  let userId = '';
  const random = Math.random().toString(36).substring(2, 10);
  const user = {
    username: `user_${random}`,
    email: `${random}@example.com`,
    password: '123456',
  };
  const random2 = Math.random().toString(36).substring(2, 10);

  const user2 = {
    username: `user_${random2}`,
    email: `${random2}@example.com`,
    password: '123456',
  };
  beforeAll(async () => {
    await AppDataSource.initialize();

    await request(app).post('/auth/signup').send(user);
    await request(app).post('/auth/signup').send(user2);
    const loginRes = await request(app).post('/auth/login').send({
      email: user.email,
      password: user.password,
    });
    token = loginRes.body.token;
    const loginRes2 = await request(app).post('/auth/login').send({
      email: user2.email,
      password: user2.password,
    });
    token2 = loginRes2.body.token;
    const decoded: any = jwt.verify(token, 'my_secret_key');
    userId = decoded.id;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });
    it('should give the user info', async () => {
      const user = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      const userRepo = AppDataSource.getRepository(User);
      const userInfo = await userRepo.findOne({ where: { id: userId } });
      expect(user.status).toBe(200);
      expect(user.body.id).toEqual(userInfo.id);
      expect(user.body.email).toEqual(userInfo.email);
      expect(user.body.username).toEqual(userInfo.username);
    });
  describe("should update user info", () =>{
    const random = Math.random().toString(36).substring(2, 10);
    it('should update user info', async () => {
      const user = await request(app)
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: `user_${random}`,
          email: `${random}@example.com`,
          password: random,
        })
      const userRepo = AppDataSource.getRepository(User);
      const userInfo = await userRepo.findOne({ where: { id: userId } });
      expect(user.status).toBe(200);
      expect(user.body.message).toEqual('User updated');
      expect(user.body.user.id).toEqual(userInfo.id);
      expect(user.body.user.email).toEqual(userInfo.email);
      expect(user.body.user.username).toEqual(userInfo.username);
    })
    it('should give 400 if new password is same as current password', async () => {
      const res = await request(app)
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: random,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('New password must be different from the current password.');
    });
  })
    it('should cant update user info with auth token' , async () => {
      const user = await request(app)
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          username: `user_${random}`,
          email: `${random}@example.com`,
        })
      expect(user.status).toBe(403);
      expect(user.body.message).toEqual('Unauthorized');
    })
    it("should delete user info" , async () => {
      const user = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
      expect(user.status).toBe(204);
    })
    it("user not found" , async () => {
      const user = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
      expect(user.status).toBe(404);
      expect(user.body.message).toEqual('User not found');
    })
});
