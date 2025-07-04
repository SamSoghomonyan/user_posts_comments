// import {
//   Column,
//   ManyToOne,
//   JoinColumn,
//   Entity,
//   CreateDateColumn,
//   PrimaryGeneratedColumn
// } from "typeorm";
// import  { User } from "./User.js";
// import { UserPosts } from "./Post.js";
//
// @Entity()
// export class CommentPost {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//
//   @Column()
//   comment: string;
//
//   @CreateDateColumn()
//   comment_date: Date;
//
//   @Column({ nullable: true })
//   postId: string;
//
//   @ManyToOne(() => UserPosts, (post) => post.comments, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'postId' })
//   post: UserPosts;
//
//   @Column({ default: false })
//   isLiked: boolean;
//
//   @Column({ nullable: true })
//   userId: string;
//
//   @ManyToOne(() => User, (user) => user.comments, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'userId' })
//   user: User;
// }


import {
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { User } from './User.js';
import type { UserPosts } from './Post.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

@Entity()
export class CommentPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  comment: string;

  @CreateDateColumn()
  comment_date: Date;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(
      () => require('./Post.js').UserPosts,
      (post: UserPosts) => post.comments,
      {
        onDelete: 'CASCADE',
      }
  )
  @JoinColumn({ name: 'postId' })
  post: UserPosts;

  @Column({ default: false })
  isLiked: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(
      () => require('./User.js').User,
      (user: User) => user.comments,
      {
        onDelete: 'CASCADE',
      }
  )
  @JoinColumn({ name: 'userId' })
  user: User;
}
