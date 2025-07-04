// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     CreateDateColumn,
//     UpdateDateColumn,
//     OneToMany,
// } from 'typeorm';
// import { UserPosts } from './Post.js';
// import { CommentPost } from './Comment.js';
// import { FriendRequest } from './FriendRequest.js';
//
// @Entity()
// export class User {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;
//
//     @Column({ unique: true })
//     email: string;
//
//     @Column()
//     username: string;
//
//     @Column()
//     password: string;
//
//     @CreateDateColumn()
//     createdAt: Date;
//
//     @UpdateDateColumn()
//     updatedAt: Date;
//
//     @OneToMany(() => FriendRequest, (request) => request.sender)
//     sentRequests: FriendRequest[];
//
//     @OneToMany(() => FriendRequest, (request) => request.receiver)
//     receivedRequests: FriendRequest[];
//
//     @OneToMany(() => UserPosts, (post) => post.user)
//     posts: UserPosts[];
//
//     @OneToMany(() => CommentPost, (comment) => comment.user)
//     comments: CommentPost[];
// }


import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import type { UserPosts } from './Post.js';
import type { CommentPost } from './Comment.js';
import type { FriendRequest } from './FriendRequest.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(
        () => require('./FriendRequest.js').FriendRequest,
        (request: FriendRequest) => request.sender
    )
    sentRequests: FriendRequest[];

    @OneToMany(
        () => require('./FriendRequest.js').FriendRequest,
        (request: FriendRequest) => request.receiver
    )
    receivedRequests: FriendRequest[];

    @OneToMany(
        () => require('./Post.js').UserPosts,
        (post: UserPosts) => post.user
    )
    posts: UserPosts[];

    @OneToMany(
        () => require('./Comment.js').CommentPost,
        (comment: CommentPost) => comment.user
    )
    comments: CommentPost[];
}
