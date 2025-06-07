import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';

describe('CommentController', () => {
  let token: string;
  let secondToken: string;
  let postId: string;
  let commentId: string;

  const random1 = Math.random().toString(36).substring(2, 10);
  const user1 = {
    username: `user_${random1}`,
    email: `${random1}@example.com`,
    password: '123456',
  };

  const random2 = Math.random().toString(36).substring(2, 10);
  const user2 = {
    username: `user_${random2}`,
    email: `${random2}@example.com`,
    password: '23432',
  };

  beforeAll(async () => {
    await AppDataSource.initialize();

    await request(app).post('/auth/signup').send(user1);
    const userResponse = await request(app)
      .post('/auth/login')
      .send({ email: user1.email, password: user1.password });
    token = userResponse.body.token;

    await request(app).post('/auth/signup').send(user2);
    const secondUserRes = await request(app)
      .post('/auth/login')
      .send({ email: user2.email, password: user2.password });
    secondToken = secondUserRes.body.token;

    const postResponse = await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${token}`)
      .send({ post: 'Test Post', imageUrl: 'Test Content' });

    postId = postResponse.body.id;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should create a comment', async () => {
    const res = await request(app)
      .post(`/comments/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Test Post' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.comment).toBe('Test Post');
    commentId = res.body.id;
  });

  it('should update the comment', async () => {
    const res = await request(app)
      .put(`/comments/update/${commentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Updated comment' });

    expect(res.status).toBe(200);
    expect(res.body.comment).toBe('Updated comment');
    expect(res.body.isLiked).toBe(false);
  });
  it('should forbid updating a comment by another user', async () => {
    const commentRes = await request(app)
      .post(`/comments/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Comment to be protected' });

    const protectedCommentId = commentRes.body.id;

    const res = await request(app)
      .put(`/comments/update/${protectedCommentId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ comment: 'Hacked comment' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You are not allowed to update this comment');
  });
  it('should delete the comment', async () => {
    const res = await request(app)
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted');
  });
});
