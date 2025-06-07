import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  Generated
} from 'typeorm';
import { User } from './User';
import { CommentPost } from './Comment';
import { PostLike } from './PostLike';

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

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CommentPost, (comment) => comment.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: CommentPost[];

  @OneToMany(() => PostLike, (like) => like.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  like: PostLike[];
}
