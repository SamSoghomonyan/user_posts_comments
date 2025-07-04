import path from 'path';
import express from 'express';
import { createExpressServer } from 'routing-controllers';
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { PostController } from "../controllers/PostController";
import { CommentController } from "../controllers/CommentController";
import { FriendRequestController } from "../controllers/FriendRequestController";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import * as jwt from 'jsonwebtoken';

export const app = createExpressServer({
  cors: true,
  controllers: [
    AuthController,
    UserController,
    PostController,
    CommentController,
    FriendRequestController,
  ],
  currentUserChecker: async (action) => {
    const authHeader = action.request.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if (!token) return null;

    try {
      const payload: any = jwt.verify(token, 'my_secret_key');
      const userRepo = AppDataSource.getRepository(User);
      return userRepo.findOne({ where: { id: payload.id } });
    } catch (err) {
      return 'invalid token';
    }
  }
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
