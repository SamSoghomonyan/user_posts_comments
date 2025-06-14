import {
  JsonController,
  Body,
  Param,
  Delete,
  Post,
  Patch,
  ForbiddenError,
  CurrentUser,
  HttpCode, HttpError
} from "routing-controllers";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { UserPosts } from "../src/entity/Post";
import { CommentPost } from "../src/entity/Comment";

@JsonController('/comments')
export class CommentController {
  private userRepo = AppDataSource.getRepository(User);
  private postRepo = AppDataSource.getRepository(UserPosts);
  private commentRepo = AppDataSource.getRepository(CommentPost)

  @Post('/')
  @HttpCode(201)
  async createComment(
    @CurrentUser() user: User,
    @Body() body: { postId: string; comment: string },
  ) {
    const userComment = await this.userRepo.findOne({ where: { id: user.id } });
    const post = await this.postRepo.findOne({ where: { id: body.postId } });
    const comment = new CommentPost();
    comment.comment = body.comment;
    comment.isLiked = false;
    comment.post = post;
    comment.user = userComment;
    return await this.commentRepo.save(comment);
  }

  @Delete('/:comment_id')
  @HttpCode(204)
  async deleteComment(
    @CurrentUser() user: User,
    @Param('comment_id') comment_id: string
  ) {
    const comment = await this.commentRepo.findOne({
      where: { id: comment_id },
      relations: ['user'],
    });

    if (!comment) throw new HttpError(404,'Comment not found');

    if (comment.user.id !== user.id)
      throw new ForbiddenError('You are not allowed to delete this comment');

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }

  @Patch('/:comment_id')
  async updateComment(
    @CurrentUser() user: User,
    @Param('comment_id') comment_id: string,
    @Body() body: { comment?: string; isLiked?: boolean },
  ) {
    const comment = await this.commentRepo.findOne({
      where: { id: comment_id },
      relations: ['user'],
    });

    if (comment.user.id !== user.id) throw new ForbiddenError('You are not allowed to update this comment');

    if (body.comment !== undefined) {
      comment.comment = body.comment;
    }
    return await this.commentRepo.save(comment);
  }
}
