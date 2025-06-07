import {
  JsonController,
  Post,
  Body,
  Req,
  BadRequestError,
  NotFoundError
} from "routing-controllers";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { FriendRequest } from "../src/entity/FriendRequest";
import { UseBefore } from "routing-controllers";
import { CurrentUser } from "../middleware/CurrentUser";

@JsonController('/user')
@UseBefore(CurrentUser)
export class FriendRequestController {
  private userRepository = AppDataSource.getRepository(User);
  private friendRequestRepository = AppDataSource.getRepository(FriendRequest);
  @Post("/friend")
  async sendFriendRequest(
    @Body() body: { receiverId: string },
    @Req() req
  ) {
    const sender = req.user;

    if (sender.id === body.receiverId) {
      throw new BadRequestError("You cannot send a request to yourself");
    }

    const receiver = await this.userRepository.findOneBy({ id: body.receiverId });
    if (!receiver) {
      throw new NotFoundError("User not found");
    }

    const existing = await this.friendRequestRepository.findOne({
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

    await this.friendRequestRepository.save(request);

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
}
