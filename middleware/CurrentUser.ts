import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../src/data-source.js';
import { User } from '../src/entity/User.js';

@Middleware({ type: 'before' })
export class CurrentUser implements ExpressMiddlewareInterface {
  async use(req: any, res: any, next: (err?: any) => any) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
      const payload: any = jwt.verify(token,'my_secret_key');

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: payload.id } });

      if (user) {
        req.user = user;
      }
    } catch (err) {
      res.status(401).send({ message: 'invalid token' });
      return;
    }

    next();
  }
}


