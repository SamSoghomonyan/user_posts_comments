import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { FriendRequest } from '../src/entity/FriendRequest';
describe('FriendRequestController', () => {
  let token: string;
  let secondToken: string;
  let user2Id: string;
  let user1Id: string;
  let friendRequestId: string;
  let thirdToken: string;
  let user3Id: string;
  let friendRequestIdThird: string;
  let secondFriendRequest: string;

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
  };

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
    thirdToken = user3Login.body.token;

    const savedUser2 = await AppDataSource.getRepository(User).findOneBy({
      email: user2.email,
    });
    const savedUser1 = await AppDataSource.getRepository(User).findOneBy({
      email: user1.email,
    });
    const savedUser3 = await AppDataSource.getRepository(User).findOneBy({
      email: user3.email,
    });
    user1Id = savedUser1.id;
    user2Id = savedUser2.id;
    user3Id = savedUser3.id
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should send a friend request successfully', async () => {
    const friendSecond = await request(app)
      .post('/friend-requests')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ receiverId: user3Id });
    const friend = await request(app)
      .post('/friend-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverId: user2Id });
    const friendRepo = AppDataSource.getRepository(FriendRequest);
    const friendInfo = await friendRepo.findOne({where: {id:friend.body.id}})
    expect(friend.status).toBe(201);
    expect(friend.body.message).toEqual('Friend request sent successfully');
    expect(friend.body.status).toEqual('pending');
    expect(friend.body.sender.username).toEqual(user1.username);
    expect(friend.body.receiver.username).toEqual(user2.username);
    expect(friend.body.id).toEqual(friendInfo.id)
    friendRequestId = friend.body.id;
    secondFriendRequest = friendSecond.body.id
  });
  it('You cannot send a request to yourself', async () => {
    const res = await request(app)
      .post('/friend-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverId: user1Id });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('You cannot send a request to yourself');
  });
  it('You cannot send a request to yourself', async () => {
    const res = await request(app)
      .post('/friend-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverId: user1Id });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('You cannot send a request to yourself');
  });
  it('should return 400 if friend request already exists', async () => {
    const res = await request(app)
      .post('/friend-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverId: user2Id });

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual('Friend request already exists');
  });
  it('should return 401 if unauthorized user tries to respond', async () => {
    const res = await request(app)
      .patch(`/friend-requests/${friendRequestId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'declined' });

    expect(res.status).toBe(401);
    expect(res.body.message).toEqual('You are not authorized to respond to this friend request.');
  });

  it('should accept a friend request successfully', async () => {
    const res = await request(app)
      .patch(`/friend-requests/${friendRequestId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ status: 'accepted' });
    const acceptedRequest = await request(app)
      .patch(`/friend-requests/${secondFriendRequest}`)
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({ status: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Friend request accepted');
    expect(acceptedRequest.status).toBe(200);
    expect(acceptedRequest.body.message).toEqual('Friend request accepted');
  });
  it('should get friend list of user', async () => {
    const res = await request(app)
      .get(`/friend-requests/friends/${user2Id}`)
      .set('Authorization', `Bearer ${secondToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].id).toEqual(user1Id)
    expect(res.body[1].id).toEqual(user3Id)
  });

  it('You are not allowed to delete this request', async () => {
    const sendRes = await request(app)
      .delete(`/friend-requests/${friendRequestId}`)
      .set('Authorization', `Bearer ${thirdToken}`)
    expect(sendRes.status).toBe(403);
    expect(sendRes.body.message).toEqual('You are not allowed to delete this request');
  });

  it('should decline a friend request successfully', async () => {
    const sendRes = await request(app)
      .delete(`/friend-requests/${friendRequestId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(sendRes.status).toBe(200);
  });
});
