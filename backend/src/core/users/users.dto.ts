import { IsDate, IsString } from 'class-validator';
import { User, UserId } from './users.types';

export class UserDTO implements User {
  @IsString()
  public id!: UserId;

  @IsString()
  public name!: string;

  @IsDate()
  public createdAt!: number;
}
