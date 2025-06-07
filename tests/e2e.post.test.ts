import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';

describe('Post', () => {
  let token = '';
  let createdPostID = '';

  const generateRandomString = () => Math.random().toString(36).substring(2, 10);

  const userinfo = {
    username: `user_${generateRandomString()}`,
    email: `${generateRandomString()}@example.com`,
    password: '123456',
  };

  beforeAll(async () => {
    await AppDataSource.initialize();

    await request(app).post('/auth/signup').send(userinfo);

    const loginRes = await request(app).post('/auth/login').send({
      email: userinfo.email,
      password: userinfo.password,
    });

    token = loginRes.body.token;

    for (let i = 0; i < 20; i++) {
      const postPayload = {
        post: `Post ${i + 1} - ${generateRandomString()}`,
        imageUrl: `https://images.example.com/${generateRandomString()}.jpg`,
      };

      const res = await request(app)
        .post('/post')
        .set('Authorization', `Bearer ${token}`)
        .send(postPayload);

    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should create a post', async () => {
    const newPost = {
      post: 'This is the test post',
      imageUrl: 'https://images.example.com/test.jpg',
    };

    const res = await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.post).toBe('This is the test post');
    createdPostID = res.body.id;
  });
  it('should fetch all posts with pagination', async () => {
    const limit = 10;
    let page = 1;
    let allPosts: any[] = [];

    while (true) {
      const res = await request(app)
        .get('/post/all')
        .query({ limit, page })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      allPosts.push(...res.body);

      if (res.body.length < limit) break; // No more pages
      page++;
    }

    const expectedPageCount = Math.ceil(allPosts.length / limit);
    expect(page).toBe(expectedPageCount);

  });


  it('should update the  post', async () => {
    const updatedPost = {
      post: 'Updated test post',
      imageUrl: 'https://images.example.com/updated.jpg',
    };

    const res = await request(app)
      .put(`/post/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedPost);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Post updated successfully' });
  });

  it('should delete the  post', async () => {
    const res = await request(app)
      .delete(`/post/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Post deleted');
  });
});
