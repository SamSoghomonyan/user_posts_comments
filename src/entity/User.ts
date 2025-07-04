import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { UserPosts } from './Post';
import { CommentPost } from './Comment';
import { FriendRequest } from './FriendRequest';

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

    @OneToMany(() => FriendRequest, (request) => request.sender)
    sentRequests: FriendRequest[];

    @OneToMany(() => FriendRequest, (request) => request.receiver)
    receivedRequests: FriendRequest[];

    @OneToMany(() => UserPosts, (post) => post.user)
    posts: UserPosts[];

    @OneToMany(() => CommentPost, (comment) => comment.user)
    comments: CommentPost[];
}
