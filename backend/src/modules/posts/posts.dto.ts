import { UserId } from '@/core/users/users.types';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePost, PostId, PostOperation, PostType, BasePostData, BaseExternalPost } from './posts.types';

export class BasePostDTO implements BasePost {
  @IsString()
  public id!: PostId;

  @IsEnum(PostType)
  public type!: PostType;

  @IsNumber()
  public value!: number;

  @IsString()
  public authorId!: UserId;

  @IsDate()
  public createdAt!: number;

  @IsOptional()
  @IsEnum(PostOperation)
  public operation?: PostOperation;

  @IsOptional()
  @IsString()
  public parentPostId?: PostId;
}

export class CreatePostDTO implements Omit<BasePostData, 'authorId'> {
  @IsEnum(PostType)
  public type!: PostType;

  @IsNumber()
  public value!: number;

  @IsOptional()
  @IsEnum(PostOperation)
  public operation?: PostOperation;

  @IsOptional()
  @IsString()
  public parentPostId?: PostId;
}

export class BaseExternalPostDTO extends BasePostDTO implements BaseExternalPost {
  @IsNumber()
  public childrenCount!: number;

  @IsString()
  public authorName!: string;
}

export class GetReplyPostsDTO {
  @IsOptional()
  @IsNumber()
  public limit?: number;

  @IsOptional()
  @IsNumber()
  public offset?: number;

  @IsString()
  public parentPostId!: PostId;
}

export class GetPostsDTO {
  @IsOptional()
  @IsNumber()
  public limit?: number;

  @IsOptional()
  @IsNumber()
  public offset?: number;
}
