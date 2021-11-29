import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { pipe } from 'fp-ts/pipeable';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { eitherToPromise } from '../fp-ts/eitherToPromise';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';
import { LoginDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { AccessToken } from './auth.types';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public resolveUser(@Body() loginData: LoginDTO): Promise<{ code: HttpStatus; user: User; token: AccessToken }> {
    return eitherToPromise(
      pipe(
        this.authService.validateUser(loginData.name),
        TE.chain((userOption) => {
          return pipe(
            userOption,
            O.fold(
              () => this.usersService.createUser(loginData.name),
              (existingUser) => TE.right(existingUser),
            ),
          );
        }),
        TE.map((user) => {
          const { access_token } = this.authService.login(user);
          return { code: HttpStatus.OK, user, token: access_token };
        }),
      ),
    );
  }
}
