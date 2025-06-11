import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { UserPosts } from "../src/entity/Post";

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

  it('should fetch all posts with pagination', async () => {
    const postRepo = AppDataSource.getRepository(UserPosts);
    const spy = jest.spyOn(postRepo, 'find');
    const limit = 10;
    let page = 1;

    while (true) {
      const posts = await request(app)
        .get('/posts')
        .query({ limit, page })
        .set('Authorization', `Bearer ${token}`);

      expect(posts.status).toBe(200);
      if (posts.body.length < limit) break;
      page++;
    }
    expect(spy).toHaveBeenCalledTimes(page);
  });
  it('should create a post', async () => {
    const newPost = {
      post: 'This is the test post',
      imageUrl: 'https://images.example.com/test.jpg',
    };

    const post = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);
    const postRepo = await AppDataSource.getRepository(UserPosts);
    const postInfo = await postRepo.findOne({ where: { id: post.body.id } });
    expect(post.status).toBe(201);
    expect(post.body).toHaveProperty('id');
    expect(post.body.post).toEqual('This is the test post');
    expect(post.body.imageUrl).toEqual(postInfo.imageUrl);
    expect(post.body.post).toEqual(postInfo.post);
    createdPostID = post.body.id;
  });
  it('should update the  post', async () => {
    const post = await request(app)
      .patch(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        post: 'Updated test post',
      });
    expect(post.status).toBe(200);
    expect(post.body).toEqual({ message: 'Post updated successfully' });
  });

  it('should delete the  post', async () => {
    const post = await request(app)
      .delete(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`);
    expect(post.status).toBe(204);
  });
});
