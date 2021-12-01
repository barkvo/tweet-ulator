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

export interface ExternalPostData {
  childrenCount: number;
  authorName: string;
}

export type BaseExternalPost = BasePost & ExternalPostData;

export type ExternalPost = Post & ExternalPostData;

export const isExternalPost = (input: BaseExternalPost): input is ExternalPost =>
  isInitialPostData(input) || isReplyPostData(input);

export type PostToCreate = Omit<Post, 'id' | 'createdAt'>;

export const POSTS_TABLE = 'posts';
