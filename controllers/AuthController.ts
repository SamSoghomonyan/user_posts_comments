import {
  JsonController,
  Post,
  Body,
  HttpError,
  BadRequestError
} from 'routing-controllers';
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@JsonController('/auth')
export class AuthController {
  private userRepo = AppDataSource.getRepository(User);

  @Post('/signup')
  async signup(
    @Body() body: { email: string; username: string; password: string }
  ) {
    const { email, username, password } = body;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      username,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    return { message: 'successfully',
      user: user,
    };
  }

  @Post('/login')
  async login(@Body() body: { email: string; password: string ,name: string }) {
    const { email, password,name } = body;

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new HttpError(401, 'Invalid email');
    }


    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new HttpError(401, 'Invalid password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'my_secret_key',
      { expiresIn: '24h' }
    );

    return { token };
  }
}
