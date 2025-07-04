// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
//   JoinColumn,
//   OneToMany,
// } from 'typeorm';
//
// import type { User } from './User.js';
// import type { CommentPost } from './Comment.js';
//
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
//
// @Entity()
// export class UserPosts {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//
//   @Column()
//   post: string;
//
//   @Column({ nullable: true })
//   imageUrl: string;
//
//   @Column({ default: 0 })
//   likes: number;
//
//   @CreateDateColumn()
//   createdAt: Date;
//
//   @UpdateDateColumn()
//   updatedAt: Date;
//
//   @Column({ default: false })
//   isLiked: boolean;
//
//   @Column({ default: 0 })
//   likedCount: number;
//
//   @Column({ nullable: true })
//   userId: string;
//
//   @ManyToOne(
//       () => require('./User.js').User,
//       (user: User) => user.posts,
//       {
//         onDelete: 'CASCADE',
//       }
//   )
//   @JoinColumn({ name: 'userId' })
//   user: User;
//
//   @OneToMany(
//       () => require('./Comment.js').CommentPost,
//       (comment: CommentPost) => comment.post,
//       {
//         cascade: true,
//         onDelete: 'CASCADE',
//       }
//   )
//   comments: CommentPost[];
// }


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import type { User } from './User.js';
import type { CommentPost } from './Comment.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

@Entity()
export class UserPosts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isLiked: boolean;

  @Column({ default: 0 })
  likedCount: number;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(
      () => require('./User.js').User,
      (user: User) => user.posts,
      {
        onDelete: 'CASCADE',
      }
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
      () => require('./Comment.js').CommentPost,
      (comment: CommentPost) => comment.post,
      {
        cascade: true,
        onDelete: 'CASCADE',
      }
  )
  comments: CommentPost[];
}
