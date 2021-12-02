import * as TE from "fp-ts/TaskEither";
import { FC } from "react";
import { UserId } from "../../core/auth/auth.types";
import { HttpStatusCode } from "../../core/http";

export enum PostOperation {
  Sum = 'Sum',
  Multiplication = 'Multiplication',
  Subtraction = 'Subtraction',
  Division = 'Division',
}

export const POST_OPERATIONS = Object.values(PostOperation).filter(value => typeof value === 'string') as string[];

export enum PostType {
  Initial = 'Initial',
  Reply = 'Reply',
}

export type PostId = string & { readonly type: unique symbol };

export interface BasePost {
  id: PostId;
  createdAt: number;
  type: PostType;
  value: number;
  authorId: UserId;
  operation?: PostOperation;
  parentPostId?: PostId;
}

export interface InitialPost extends BasePost {
  type: PostType.Initial;
}

export interface ReplyPost extends BasePost {
  type: PostType.Reply;
  operation: PostOperation;
  parentPostId: PostId;
}

export const isReplyPost = (i: BasePost): i is ReplyPost =>
  i.type === PostType.Reply && !!i.operation && !!i.parentPostId;

export interface Post extends BasePost {
  childrenCount: number;
  authorName: string;
}

export interface PostWithChildren extends Post {
  children: ReadonlyArray<PostWithChildren>;
}

export interface PostsStore {
  posts: ReadonlyArray<Post>;
  setPosts: (i: { posts: ReadonlyArray<Post> }) => void;
  reset: () => void;
  totalMainPosts: number;
  setTotalMainPosts: (i: { totalPosts: number }) => void;
  postsTree: ReadonlyArray<PostWithChildren>;
  remainingMainPostsToLoadAmount: number;
  mainPostsLoadedAmount: number;
  canLoadMoreMainPosts: boolean;
}

export type PostsComponentInterface = FC<{
  postsTree: ReadonlyArray<PostWithChildren>;
  loadPostsInitial: LoadPostsInitial;
  loadMorePosts: LoadMorePosts;
  loadReplyPosts: LoadReplyPosts;
  canLoadMoreMainPosts: boolean;
  remainingMainPostsToLoadAmount: number;
  createPost: CreatePost;
  createReplyPost: CreateReplyPost;
}>;

export type LoadPostsInitial = () => TE.TaskEither<Error, void>;

export type LoadMorePosts = () => TE.TaskEither<Error, void>;

export type LoadReplyPosts = (i: { parentPostId: PostId }) => TE.TaskEither<Error, void>;

export type CreateReplyPost = (i: { parentPostId: PostId; operation: PostOperation; value: number }) => TE.TaskEither<Error, void>;

export type CreatePost = (i: { value: number }) => TE.TaskEither<Error, void>;

export interface PostsModule {
  Posts: PostsComponentInterface;
  loadPostsInitial: LoadPostsInitial;
  loadMorePosts: LoadMorePosts;
  loadReplyPosts: LoadReplyPosts;
  createPost: CreatePost;
  createReplyPost: CreateReplyPost;
  postsStore: PostsStore;
}

export interface GetPostsRequest {
  limit?: number;
  offset?: number;
}

export interface GetPostsResponse {
  code: HttpStatusCode;
  limit: number;
  offset: number;
  totalPosts: number;
  posts: ReadonlyArray<Post>;
  childPosts: ReadonlyArray<Post>;
}

export interface GetReplyPostsRequest {
  limit?: number;
  offset?: number;
  parentPostId: PostId;
}

export interface GetReplyPostsResponse {
  code: HttpStatusCode;
  limit: number;
  offset: number;
  parentPostId: PostId;
  parentPost: Post;
  posts: ReadonlyArray<Post>;
}

export interface CreatePostRequest {
  type: PostType;
  value: number;
  operation?: PostOperation;
  parentPostId?: PostId;
}

export interface CreatePostResponse {
  code: HttpStatusCode;
  post: BasePost;
}
