import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';
import { AccessToken, TokenPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  public validateUser = (name: string): TE.TaskEither<Error, O.Option<User>> => {
    return this.usersService.findUserByName(name);
  };

  public login = (user: User): { access_token: AccessToken } => {
    const payload: TokenPayload = { userId: user.id };
    return {
      access_token: this.jwtService.sign(payload) as AccessToken,
    };
  };
}
