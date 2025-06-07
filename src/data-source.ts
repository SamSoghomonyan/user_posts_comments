import "reflect-metadata";
import { DataSource } from "typeorm";
import {User} from "./entity/User";
import {UserPosts} from "./entity/Post";
import {CommentPost} from "./entity/Comment";
import {PostLike} from "./entity/PostLike";
import { FriendRequest } from "./entity/FriendRequest";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 50432,
    username: "admin",
    password: "hajox245",
    database: "todo",
    synchronize: true,
    logging: false,
    entities: [User,UserPosts,CommentPost,PostLike,FriendRequest],
    migrations: [],
    subscribers: [],
});
