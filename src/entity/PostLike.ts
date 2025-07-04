import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { UserPosts } from './Post';

@Entity()
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User )
  user: User;

  @ManyToOne(() => UserPosts, (post) => post.likes)
  post: UserPosts;
}
