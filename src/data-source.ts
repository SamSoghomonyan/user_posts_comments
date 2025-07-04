import "reflect-metadata";
import { DataSource } from "typeorm";
import {User} from "./entity/User.js";
import {UserPosts} from "./entity/Post.js";
import {CommentPost} from "./entity/Comment.js";
import { FriendRequest } from "./entity/FriendRequest.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 50432,
    username: "admin",
    password: "hajox245",
    database: "todo",
    synchronize: true,
    logging: false,
    entities: [User,UserPosts,CommentPost,FriendRequest],
    migrations: [],
    subscribers: [],
});
