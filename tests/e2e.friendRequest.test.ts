import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';

describe('FriendRequestController', () => {
  let token: string;
  let secondToken: string;
  let user2Id: string;
  let friendRequestId: string;
  let tirthToken: string;
  let user3Id: string;
  let friendRequestIdThird:string
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

  const random3 = Math.random().toString(36).substring(2, 10);
  const user3 = {
    username: `user_${random3}`,
    email: `${random3}@example.com`,
    password: '123456',
  }

  beforeAll(async () => {
    await AppDataSource.initialize();

    await request(app).post('/auth/signup').send(user1);
    const user1Login = await request(app)
      .post('/auth/login')
      .send({ email: user1.email, password: user1.password });
    token = user1Login.body.token;

    await request(app).post('/auth/signup').send(user2);
    const user2Login = await request(app)
      .post('/auth/login')
      .send({ email: user2.email, password: user2.password });
    secondToken = user2Login.body.token;
    await request(app).post('/auth/signup').send(user3);
    const user3Login = await request(app)
      .post('/auth/login')
    .send({ email: user3.email, password: user3.password });
    tirthToken = user3Login.body.token;
    const savedUser2 = await AppDataSource.getRepository(User).findOneBy({
      email: user2.email,
    });

    if (!savedUser2) {
      throw new Error("User2 not found in the database");
    }

    user2Id = savedUser2.id;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should send a friend request successfully', async () => {
    const res = await request(app)
      .post('/user/friend')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverId: user2Id });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Friend request sent successfully');
    expect(res.body.status).toBe('pending');
    expect(res.body.sender.username).toBe(user1.username);
    expect(res.body.receiver.username).toBe(user2.username);

    friendRequestId = res.body.id;
  });
  it('should send a 401', async () => {
    const res = await request(app)
      .post(`/user/acceptRequest/${friendRequestId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'declined' });
    expect(res.body.message).toBe('You are not authorized to respond to this friend request.');
    })
  it('should accept a friend request successfully', async () => {
    const res = await request(app)
      .post(`/user/acceptRequest/${friendRequestId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Accepted');
  });
  it('declinedRequest friend request successfully', async () => {
    const res = await request(app)
      .post('/user/friend')
      .set('Authorization', `Bearer ${tirthToken}`)
      .send({ receiverId: user2Id });
    friendRequestIdThird = res.body.id;
    const resSecondRequest = await request(app)
      .post(`/user/declinedRequest/${friendRequestIdThird}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ status: 'declined' });
    expect(resSecondRequest.status).toBe(200);
    expect(resSecondRequest.body.message).toBe('declined');
  })


});
