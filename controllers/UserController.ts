import {
  JsonController,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  BadRequestError,
  CurrentUser,
  HttpError,
  HttpCode,
  NotFoundError
} from "routing-controllers";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import * as bcrypt from "bcrypt";

@JsonController('/users')
export class UserController {
  private userRepo = AppDataSource.getRepository(User);

  @Get('/')
  async me(@CurrentUser() user: User) {
   return this.userRepo.findOne({
      where: { id: user.id },
      relations: [
        'posts',
        'posts.comments',
        'receivedRequests',
        'receivedRequests.sender',
        'sentRequests',
        'sentRequests.receiver',
        'receivedRequests.receiver',
      ],
    });

  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { username?: string; email?: string; password?: string },
    @CurrentUser() user: User
  ) {
    if (user.id !== id) {
      throw new HttpError(403, 'Unauthorized');
    }

    const existingUser = await this.userRepo.findOneBy({ id });

    if (body.password) {
      const isSame = await bcrypt.compare(body.password, existingUser.password);
      if (isSame) {
        throw new BadRequestError('New password must be different from the current password.');
      }
      existingUser.password = await bcrypt.hash(body.password, 10);
    }

    if (body.username) existingUser.username = body.username;
    if (body.email) existingUser.email = body.email;

    await this.userRepo.save(existingUser);

    return { message: 'User updated', user: existingUser };
  }

  @Delete('/:id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const targetUser = await this.userRepo.findOneBy({id});
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    await this.userRepo.delete(id);
    return null
  }
}
