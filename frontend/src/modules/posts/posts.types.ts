import { UserId } from "../../core/auth/auth.types";

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

export interface Post {
  id: PostId;
  createdAt: number;
  type: PostType;
  value: number;
  authorId: UserId;
  operation?: PostOperation;
  parentPostId?: PostId;
  childrenCount: number;
  children?: ReadonlyArray<Post>;
}

export interface PostsStore {
  posts?: ReadonlyArray<Post>;
  totalPosts?: number;
  setPosts: (i: { parentPostId?: PostId, posts: ReadonlyArray<Post>; totalPosts: number }) => void;
}

export type PostsComponent = () => JSX.Element;

export interface PostsModule {
  Posts: PostsComponent;
}