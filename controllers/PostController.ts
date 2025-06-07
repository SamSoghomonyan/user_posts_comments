import {
  JsonController,
  Body,
  Param,
  Get,
  Delete,
  Put,
  Post,
  Req,
  Res,
  UploadedFile,
  QueryParam
} from "routing-controllers";
import { CurrentUser } from "../middleware/CurrentUser";
import { AppDataSource } from "../src/data-source";
import { UseBefore } from "routing-controllers";
import { User } from "../src/entity/User";
import { UserPosts } from "../src/entity/Post";
import { fileUploadOptions } from "../utils/fileUploadOptions";
import { PostLike } from "../src/entity/PostLike";

@JsonController('/post')
@UseBefore(CurrentUser)
export class PostController {
  private userRepo = AppDataSource.getRepository(User);
  private postRepo = AppDataSource.getRepository(UserPosts);
  private likeRepo = AppDataSource.getRepository(PostLike);

  @Get('/all')
  async allPosts(
    @QueryParam("limit") limit:number ,
    @QueryParam("page") page: number
  ) {
    return await this.postRepo.find({
      relations: ['user', 'comments','comments.user'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  @Post('/')
  async createPost(
    @Req() req: any,
    @Body() body: any,
    @Res() res: any,
    @UploadedFile("file", { options: fileUploadOptions() }) file: any,
  ) {
    const user = req.user;
    if (!user) return { message: 'Unauthorized' };
    const post = new UserPosts();
    post.post = body.post;
    post.imageUrl = file?.path || null;
    post.user = user;

    const savedPost = await this.postRepo.save(post);
    const fullPost = await this.postRepo.findOne({
      where: { id: savedPost.id },
      relations: ['comments', 'comments.user', 'user'],
    });

    return res.status(201).json(fullPost);
  }

  @Delete('/:id')
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user) return { message: 'Unauthorized' };

    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      return { message: 'Post not found' };
    }

    if (post.user.id !== user.id) {
      return { message: 'You are not allowed to delete this post' };
    }

    await this.postRepo.delete(id);
    return { message: 'Post deleted' };
  }


  @Put('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: { post?: string; },
    @Req() req: any
  ) {
    const user = req.user;
    if (!user) return { message: 'Unauthorized' };

    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      return { message: 'Post not found' };
    }

    if (post.user.id !== user.id) {
      return { message: 'You are not allowed to edit this post' };
    }
    if(body.post){
      post.post = body.post;
    }
    await this.postRepo.update(id, body);
    return { message: 'Post updated successfully' };
  }

  @Post('/:id/like')
  async likePost(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const post = await this.postRepo.findOneBy({ id });
    const existingLike = await this.likeRepo.findOne({ where: { user: { id: user.id }, post: { id } } });

    if (existingLike) {
      return { message: 'Already liked' };
    }

    const like = this.likeRepo.create({ user, post });
    await this.likeRepo.save(like);

    post.likedCount += 1;
    await this.postRepo.save(post);

    return { message: 'Post liked', likedCount: post.likedCount };
  }



  @Delete('/:id/like')
  async unlikePost(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const post = await this.postRepo.findOneBy({ id });
    const existingLike = await this.likeRepo.findOne({ where: { user: { id: user.id }, post: { id } } });

    if (!existingLike) {
      return { message: 'Not liked yet' };
    }

    await this.likeRepo.remove(existingLike);

    post.likedCount -= 1;
    await this.postRepo.save(post);

    return { message: 'Post unliked', likedCount: post.likedCount };
  }



}
