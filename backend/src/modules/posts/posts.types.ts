import { HttpStatus } from '@nestjs/common';
import { UserId } from '@/core/users/users.types';

export enum PostOperation {
  Sum = 'Sum',
  Multiplication = 'Multiplication',
  Subtraction = 'Subtraction',
  Division = 'Division',
}

export enum PostType {
  Initial = 'Initial',
  Reply = 'Reply',
}

export type PostId = string & { readonly type: unique symbol };

export interface PostEntityData {
  id: PostId;
  createdAt: number;
}

export interface BasePostData {
  type: PostType;
  value: number;
  authorId: UserId;
  operation?: PostOperation;
  parentPostId?: PostId;
}

export interface InitialPostData extends BasePostData {
  type: PostType.Initial;
}

export interface ReplyPostData extends BasePostData {
  type: PostType.Reply;
  operation: PostOperation;
  parentPostId: PostId;
}

export const ALL_POST_FIELDS = ['type', 'value', 'authorId', 'operation', 'parentPostId', 'id', 'createdAt'];

export type BasePost = BasePostData & PostEntityData;
export type InitialPost = InitialPostData & PostEntityData;
export type ReplyPost = ReplyPostData & PostEntityData;
export type Post = InitialPost | ReplyPost;

export const isInitialPostData = (input: BasePostData): input is InitialPostData => input.type === PostType.Initial;

export const isReplyPostData = (input: BasePostData): input is ReplyPostData =>
  input.type === PostType.Reply && !!input.operation && !!input.parentPostId;

export const isPost = (input: BasePost): input is Post => isInitialPostData(input) || isReplyPostData(input);

export type InputPostData = InitialPostData | ReplyPostData;

export const isInputPost = (input: BasePostData): input is InputPostData =>
  isInitialPostData(input) || isReplyPostData(input);

export interface ChildrenPostCountData {
  childrenCount: number;
}

export type BasePostWithChildrenCount = BasePost & ChildrenPostCountData;

export type PostWithChildrenCount = Post & ChildrenPostCountData;

export const isPostWithChildrenCount = (input: BasePostWithChildrenCount): input is PostWithChildrenCount =>
  isInitialPostData(input) || isReplyPostData(input);

//

export interface ChildrenPostData {
  childrenCount: number;
  children: ReadonlyArray<Post>;
}

export type PostWithChildren = Post & ChildrenPostData;

//

export type PostToCreate = Omit<Post, 'id' | 'createdAt'>;

export type AddPostRequest = PostToCreate;

export interface AddPostResponse {
  status: HttpStatus.OK;
  post: Post;
}

export interface GetPostsRequest {
  limit?: number;
  offset?: number;
}

// * возвращает сколько то вложенных постов для каждого поста
export interface GetPostsResponse {
  status: HttpStatus.OK;
  limit: number;
  offset: number;
  posts: Post[];
  totalPosts: number;
}

export interface GetReplyPostsRequest {
  limit?: number;
  offset?: number;
  parentPostId: PostId;
}

// * возвращает посты, вычисляя для каждого значение childrenCount
export interface GetReplyPostsResponse {
  status: HttpStatus.OK;
  limit: number;
  offset: number;
  parentPostId: PostId;
  posts: Post[];
  totalPosts: number;
}

export const POSTS_TABLE = 'posts';
