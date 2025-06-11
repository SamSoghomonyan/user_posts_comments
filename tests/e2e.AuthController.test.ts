import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import jwt from 'jsonwebtoken';
import { User } from "../src/entity/User";

describe('Auth Controller', () => {
  let password = ''
  let email = ''
  let newUser:{
    username: string,
    password: string,
    email: string,
  }
  beforeAll(async () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    newUser = {
      username: `user_${randomString}`,
      email: `${randomString}@example.com`,
      password: '123456',
    };
    email = newUser.email
    password = newUser.password;
  })
  beforeAll(async () => {
    await AppDataSource.initialize();
  });
  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('Sign up' , () =>{
    describe('Successful Registration', () => {
      it('should return 201 OK and user data', async () => {
        const user = await request(app).post('/auth/signup').send(newUser);

        expect(user.status).toBe(201);
        expect(user.body).toHaveProperty('message', 'successfully');
        expect(user.body.user).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            username: newUser.username,
            email: newUser.email,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        );
      });
    });

    describe('Registration with Existing Email', () => {
      it('should return 400 for existing email', async () => {
        const existingUser = {
          username: 'user_nuespgy3',
          email: email,
          password: '123456',
        };
        const user = await request(app).post('/auth/signup').send(existingUser);

        expect(user.status).toBe(400);
        expect(user.body.message).toEqual( 'Email already exists');
      });
    });
  })
  describe('Auth Login', () => {
    describe('Successful login', () => {
      const userRepo = AppDataSource.getRepository(User);
      it('should return 200 OK and a valid token', async () => {
        const user = await request(app).post('/auth/login').send({
          email: email,
          password: password
        });
        const token = user.body.token;
        const decoded: any = jwt.verify(token, 'my_secret_key');
        const userInfo = await userRepo.findOneBy({ email: email });
        expect(decoded).toHaveProperty('id');
        expect(decoded.email).toEqual(email);
        expect(decoded.id).toEqual(userInfo.id);
      });
    });
    describe('Invalid credentials' , () => {
      it('should return 401 for invalid password', async () =>{
        const user = await request(app).post('/auth/login').send({
          email: email,
          password: '123456256513',
        })
        expect(user.status).toBe(401);
        expect(user.body.message).toEqual('Invalid credentials');
      })
      it('should return 401 for invalid email', async () =>{
        const user = await request(app).post('/auth/login').send({
          email: "email",
          password: password
        });
        expect(user.status).toBe(401);
        expect(user.body.message).toEqual('Invalid credentials');
      })
    })
  });
});

