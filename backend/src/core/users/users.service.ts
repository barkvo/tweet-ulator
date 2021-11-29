import { Injectable } from '@nestjs/common';
import { transformAndValidateAsTE } from '@/core/fp-ts/validation';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import { UserDTO } from './users.dto';
import { User, USERS_TABLE } from './users.types';

@Injectable()
export class UsersService {
  constructor(@InjectKnex() private readonly knex: Knex) {
    //
  }

  public findUserByName = (name: string): TE.TaskEither<Error, O.Option<User>> => {
    return pipe(
      TE.tryCatch<Error, O.Option<Record<string, unknown>>>(
        () => {
          return this.knex
            .table(USERS_TABLE)
            .where('name', name)
            .first()
            .then((result) => O.fromNullable(result));
        },
        (e) => new Error(`Failed to find user (knex): ${e}`),
      ),
      TE.chain((userOption) => {
        return pipe(
          userOption,
          O.fold(
            () => TE.right(O.zero()),
            (rawUser) => {
              return pipe(
                transformAndValidateAsTE(UserDTO, rawUser),
                TE.map((userDto) => O.some(userDto as User)),
              );
            },
          ),
        );
      }),
    );
  };

  public createUser = (name: string): TE.TaskEither<Error, User> => {
    return pipe(
      TE.tryCatch<Error, Record<string, unknown>>(
        () => {
          return this.knex
            .table(USERS_TABLE)
            .insert({ name }, ['id', 'name', 'createdAt'])
            .then((results) => results[0]);
        },
        (e) => new Error(`Failed to create user (knex): ${e}`),
      ),
      TE.chain((rawUser) => {
        return pipe(
          transformAndValidateAsTE(UserDTO, rawUser),
          TE.map((userDto) => userDto as User),
        );
      }),
    );
  };
}
