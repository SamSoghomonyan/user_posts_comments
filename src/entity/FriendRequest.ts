// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
// } from 'typeorm';
// import { User } from './User.js';
//
// export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';
//
// @Entity()
// export class FriendRequest {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//
//   @ManyToOne(() => User, (user) => user.sentRequests, { onDelete: 'CASCADE' })
//   sender: User;
//
//   @ManyToOne(() => User, (user) => user.receivedRequests, { onDelete: 'CASCADE' })
//   receiver: User;
//
//   @Column({ type: 'enum', enum: ['pending', 'accepted', 'declined'], default: 'pending' })
//   status: FriendRequestStatus;
//
//   @CreateDateColumn()
//   createdAt: Date;
//
//   @UpdateDateColumn()
//   updatedAt: Date;
// }

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import type { User } from './User.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
      () => require('./User.js').User,
      (user: User) => user.sentRequests,
      { onDelete: 'CASCADE' }
  )
  sender: User;

  @ManyToOne(
      () => require('./User.js').User,
      (user: User) => user.receivedRequests,
      { onDelete: 'CASCADE' }
  )
  receiver: User;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  })
  status: FriendRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
