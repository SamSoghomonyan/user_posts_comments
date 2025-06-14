import {
  JsonController,
  Body,
  Param,
  Get,
  Delete,
  Post,
  UploadedFile,
  QueryParam,
  Patch,
  CurrentUser,
  UnauthorizedError,
  BadRequestError,
  HttpError,
  HttpCode
} from "routing-controllers";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { UserPosts } from "../src/entity/Post";
import { fileUploadOptions } from "../utils/fileUploadOptions";

@JsonController('/posts')
export class PostController {
  private postRepo = AppDataSource.getRepository(UserPosts);

  @Get('/')
  async allPosts(
    @QueryParam("limit") limit: number,
    @QueryParam("page") page: number
  ) {
    return await this.postRepo.find({
      relations: ['user', 'comments', 'comments.user'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  @Post('/')
  @HttpCode(201)
  async createPost(
    @CurrentUser() user: User,
    @Body() body: any,
    @UploadedFile("file", { options: fileUploadOptions() }) file: any,
  ) {
    if (!user) throw new UnauthorizedError();

    const post = new UserPosts();
    post.post = body.post;
    post.imageUrl = file?.path || null;
    post.user = user;

    const savedPost = await this.postRepo.save(post);
    const fullPost = await this.postRepo.findOne({
      where: { id: savedPost.id },
      relations: ['comments', 'comments.user', 'user'],
    });

    return fullPost;
  }

  @Delete('/:id')
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    if (!user) throw new UnauthorizedError();

    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new BadRequestError('Post not found');
    }

    if (post.user.id !== user.id) {
      throw new HttpError(403,'You are not allowed to delete this post');
    }

    await this.postRepo.delete(id);
    throw new HttpError(204);
  }

  @Patch('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: { post?: string },
    @CurrentUser() user: User
  ) {
    if (!user) throw new UnauthorizedError();

    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new BadRequestError('Post not found');
    }

    if (post.user.id !== user.id) {
      throw new HttpError(403, 'You are not allowed to edit this post');
    }

    if (body.post) {
      post.post = body.post;
    }

    await this.postRepo.save(post);
    return { message: 'Post updated successfully' };
  }
}
