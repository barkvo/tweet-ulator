import { IsString } from 'class-validator';

export class LoginDTO {
  @IsString()
  public name!: string;
}
