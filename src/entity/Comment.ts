import {
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import { UserPosts } from "./Post";
import { User } from "./User";

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

  @ManyToOne(() => UserPosts, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: UserPosts;

  @Column({ default: false })
  isLiked: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
