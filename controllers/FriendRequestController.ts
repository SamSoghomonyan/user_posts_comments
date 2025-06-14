import {
  JsonController,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Get,
  BadRequestError,
  UnauthorizedError,
  CurrentUser,
  HttpError,
  HttpCode
} from "routing-controllers";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { FriendRequest } from "../src/entity/FriendRequest";

@JsonController('/friend-requests')
export class FriendRequestController {
  private userRepo = AppDataSource.getRepository(User);
  private friendRequestRepo = AppDataSource.getRepository(FriendRequest);

  @Post('/')
  @HttpCode(201)
  async sendFriendRequest(
    @Body() body: { receiverId: string },
    @CurrentUser() user: User
  ) {
    const sender = user;

    if (sender.id === body.receiverId) {
      throw new BadRequestError("You cannot send a request to yourself");
    }

    const receiver = await this.userRepo.findOneBy({ id: body.receiverId });
    const existing = await this.friendRequestRepo.findOne({
      where: [
        { sender: { id: sender.id }, receiver: { id: receiver.id } },
        { sender: { id: receiver.id }, receiver: { id: sender.id } }
      ]
    });

    if (existing) {
      throw new BadRequestError("Friend request already exists");
    }

    const request = new FriendRequest();
    request.sender = sender;
    request.receiver = receiver;
    request.status = "pending";

    await this.friendRequestRepo.save(request);

    return {
      message: "Friend request sent successfully",
      id: request.id,
      sender: {
        id: sender.id,
        username: sender.username,
        email: sender.email
      },
      receiver: {
        id: receiver.id,
        username: receiver.username
      },
      status: request.status
    };
  }

  @Patch('/:id')
  async respondToRequest(
    @Param('id') id: string,
    @Body() body: { status: 'accepted'},
    @CurrentUser() user: User
  ) {
    const friendRequest = await this.friendRequestRepo.findOne({
      where: { id },
      relations: ['receiver', 'sender']
    });

    if (user.id !== friendRequest.receiver.id) {
      throw new UnauthorizedError("You are not authorized to respond to this friend request.");
    }

    if (body.status === 'accepted') {
      await this.friendRequestRepo.update(id, { status: 'accepted' });
      return { message: 'Friend request accepted' };
    }
  }

  @Get('/friends/:userId')
  async getFriends(@Param('userId') userId: string) {
    const friendList = []
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: [
        'receivedRequests',
        'receivedRequests.sender',
        'sentRequests',
        'sentRequests.receiver'
      ],
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

  @Delete('/:id')
  async deleteRequest(@Param('id') id: string,@CurrentUser() user: User) {
    const FriendRequest = await this.friendRequestRepo.findOne({
      where: { id },
      relations: ['sender', 'receiver']
    });

    if (FriendRequest.sender.id !== user.id && FriendRequest.receiver.id !== user.id) {
      throw new HttpError(403,"You are not allowed to delete this request");
    }

    await this.friendRequestRepo.delete(id);
    return { message: "Friend request deleted" };
  }
}

