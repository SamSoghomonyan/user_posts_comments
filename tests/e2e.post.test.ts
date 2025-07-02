import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { UserPosts } from "../src/entity/Post";

describe('Post', () => {
  let token = '';
  let token2 = '';
  let createdPostID = '';

  const random1 = () => Math.random().toString(36).substring(2, 10);
  const random2 = () => Math.random().toString(36).substring(2, 10);
  const userinfo = {
    username: `user_${random1()}`,
    email: `${random1()}@example.com`,
    password: '123456',
  };

  const user2info = {
    username: `user_${random2()}`,
    email: `${random2()}@example.com`,
    password: '123456',
  }
  beforeAll(async () => {
    await AppDataSource.initialize();

    await request(app).post('/auth/signup').send(userinfo);
    await request(app).post('/auth/signup').send(user2info);
    const loginRes = await request(app).post('/auth/login').send({
      email: userinfo.email,
      password: userinfo.password,
    });
    const login2Res = await request(app).post('/auth/login').send({
      email: user2info.email,
      password: user2info.password,
    });
    token = loginRes.body.token;
    token2 = login2Res.body.token;
    for (let i = 0; i < 20; i++) {
      const postPayload = {
        post: `Post ${i + 1} - ${random1()}`,
        imageUrl: `https://images.example.com/${random1()}.jpg`,
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
    expect(post.body.message).toEqual('Post updated successfully' );
  });
  it('post not found', async () => {
    const post = await request(app)
      .patch(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({
        post: 'Updated test post',
      });
    expect(post.status).toBe(403);
    expect(post.body.message).toEqual('You are not allowed to edit this post' );
  });
  it('you dont allowed to delete this post ', async () => {
    const post = await request(app)
      .delete(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(post.status).toBe(403);
    expect(post.body.message).toEqual('You are not allowed to delete this post' );
  });
  it('should delete the  post', async () => {
    const post = await request(app)
      .delete(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`);
    expect(post.status).toBe(204);
  });
  it('post not found', async () => {
    const post = await request(app)
      .patch(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        post: 'Updated test post',
    })
    expect(post.status).toBe(400);
    expect(post.body.message).toEqual('Post not found' );
  });
  it('post not found', async () => {
    const post = await request(app)
      .delete(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer ${token}`)
    expect(post.status).toBe(400);
    expect(post.body.message).toEqual('Post not found' );
  });
  it('incorect token when deleted the post', async () => {
    const post = await request(app)
      .delete(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer '343725465326svdgfshgd'`)
    expect(post.status).toBe(400);
  });  it('incorect token when update the post', async () => {
    const post = await request(app)
      .patch(`/posts/${createdPostID}`)
      .set('Authorization', `Bearer '343725465326svdgfshgd'`)
    expect(post.status).toBe(400);
  });
});
