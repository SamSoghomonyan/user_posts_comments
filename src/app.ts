import path from 'path';
import express from 'express';
import { createExpressServer } from 'routing-controllers';
import { AuthController } from "../controllers/AuthController";
import { MeController } from "../controllers/MeController";
import { PostController } from "../controllers/PostController";
import { CommentController } from "../controllers/CommentController";
import { FriendRequestController } from "../controllers/FriendRequest"

export const app = createExpressServer({
  cors: true,
  controllers: [AuthController, MeController, PostController, CommentController,FriendRequestController],
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
