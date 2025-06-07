import {
  JsonController,
  Body,
  Param,
  Get,
  Delete,
  Put,
  Post,
  UseBefore,
  Req,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "routing-controllers";
import { CurrentUser } from "../middleware/CurrentUser";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { UserPosts } from "../src/entity/Post";
import { CommentPost } from "../src/entity/Comment";

@JsonController('/comments')
@UseBefore(CurrentUser)
export class CommentController {
  private userRepo = AppDataSource.getRepository(User);
  private postRepo = AppDataSource.getRepository(UserPosts);
  private commentRepo = AppDataSource.getRepository(CommentPost)

  @Post('/:post_id')
  async createComment(
    @Req() req: any,
    @Body() body: any,
    @Param('post_id') post_id: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    const post = await this.postRepo.findOne({ where: { id: post_id } });
    const comment = new CommentPost();
    comment.comment = body.comment;
    comment.isLiked = false;
    comment.post = post;
    comment.user = user;
    return await this.commentRepo.save(comment);
  }

  @Delete('/:comment_id')
  async deleteComment(@Req() req: any, @Param('comment_id') comment_id: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: comment_id },
      relations: ['user'],
    });

    if (comment.user.id !== req.user.id) throw new ForbiddenError('You are not allowed to delete this comment');

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }

  @Put('/update/:comment_id')
  async updateComment(
    @Req() req: any,
    @Param('comment_id') comment_id: string,
    @Body() body: { comment?: string; isLiked?: boolean },
  ) {
    const comment = await this.commentRepo.findOne({
      where: { id: comment_id },
      relations: ['user'],
    });

    if (comment.user.id !== req.user.id) throw new ForbiddenError('You are not allowed to update this comment');

    if (body.comment !== undefined) {
      comment.comment = body.comment;
    }
    if (body.isLiked !== undefined) {
      comment.isLiked = body.isLiked;
    }

    return await this.commentRepo.save(comment);
  }
}
