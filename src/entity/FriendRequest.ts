import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentRequests, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedRequests, { onDelete: 'CASCADE' })
  receiver: User;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'declined'], default: 'pending' })
  status: FriendRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
