import {
  JsonController,
  Get,
  Req,
  Res,
  Delete,
  Post,
  Put,
  Body,
  Param,
  BadRequestError,
  UnauthorizedError
} from "routing-controllers";
import { UseBefore } from "routing-controllers";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { CurrentUser } from "../middleware/CurrentUser";
import { FriendRequest } from "../src/entity/FriendRequest";
import * as bcrypt from "bcrypt";

@JsonController('/user')
@UseBefore(CurrentUser)
export class MeController {
  private userRepo = AppDataSource.getRepository(User);
  private friendrepo = AppDataSource.getRepository(FriendRequest);

  @Get('/me')
  async me(@Req() req: any) {
    if (!req.user) {
      return { message: 'User not found' };
    }
    const user =  await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['posts','posts.comments','receivedRequests','receivedRequests.sender','sentRequests','sentRequests.receiver','receivedRequests.receiver',],
    });
    return user
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { username?: string; email?: string ; password?: string },
    @Req() req: any,
    @Res() res: any
  ) {
    if (req.user.id !== Number(id)) {
      return { message: 'Unauthorized' };
    }

    const user = await this.userRepo.findOneBy({ id: String(id) });
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const isSame = await bcrypt.compare(body.password, user.password);
    if (isSame) {
      throw new BadRequestError('New password must be different from the current password.');
    }
    if (body.username) user.username = body.username;
    if (body.email) user.email = body.email;
    if (hashedPassword) user.password = hashedPassword;

    await this.userRepo.save(user);
    return { message: 'User updated', user };
  }

  @Post('/acceptRequest/:id')
  async acceptRequest(@Param('id') id: string, @Res() res: any ,@Req() req:any ,   @Body() body: { status: string },) {
    const friendRequest:any = await this.friendrepo.findOne({
      where: { id },
      relations: ['receiver', 'sender']
    });
    const user = req.user;
    if(user.id !== friendRequest.receiver.id){
      throw new UnauthorizedError("You are not authorized to respond to this friend request.");
    }
    if(body.status){
      friendRequest.status = body.status;
    }
    await this.friendrepo.update(friendRequest.id, { status: body.status as any });

    return { message: 'Accepted' };
  }

  @Post('/declinedRequest/:id')
  async declinedRequest(@Param('id') id: string, @Res() res: any ,@Req() req:any ,   @Body() body: { status: string },) {
    const friendRequest:any = await this.friendrepo.findOne({
      where: { id },
      relations: ['receiver', 'sender']
    });
    const user = req.user;
    if(user.id !== friendRequest.receiver.id){
      throw new UnauthorizedError("You are not authorized to respond to this friend request.");
    }
    if(body.status){
      friendRequest.status = body.status;
    }
    await this.friendrepo.delete(id);
    return { message: 'declined' };
  }

  @Delete('/:id')
  async delete(@Param('id') id: string, @Req() req: any ) {
    if (req.user.id !== id) {
      return { message: 'Unauthorized' };
    }

    const user = await this.userRepo.findOneBy({ id });
    if (!user) return { message: 'User not found' };

    await this.userRepo.delete(id)
    return { message: 'User deleted' };
  }

  @Get('/friends/list')
  async friends(@Req() req: any ,@Res() res:any) {
    const friendList = []
    const user =  await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['posts','posts.comments','receivedRequests','receivedRequests.sender','sentRequests','sentRequests.receiver','receivedRequests.receiver',],
    });
    user.receivedRequests.map((item:any) => {
      if(item.status === 'accepted'){
        friendList.push(item.sender)
      }
    })
    user.sentRequests.map((item:any) => {
      if(item.status === 'accepted'){
        friendList.push(item.receiver)
      }
    })
    return friendList
  }
}
