import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import { HttpService } from "../../core/http";
import {
  PostsStore as PostsStoreInterface,
  LoadPostsInitial,
  LoadMorePosts,
  LoadReplyPosts,
  CreateReplyPost,
  CreatePost,
  GetPostsRequest,
  GetPostsResponse,
  GetReplyPostsRequest,
  GetReplyPostsResponse,
  CreatePostRequest,
  CreatePostResponse,
  PostType,
  Post,
  PostId,
} from "./posts.types";

const DEFAULT_POSTS_LIMIT = 20;

const loadPosts = ({ httpService, offset = 0 }: { httpService: HttpService; offset?: number }): TE.TaskEither<
  Error,
  { posts: ReadonlyArray<Post>; childPosts: ReadonlyArray<Post>; totalPosts: number }
> => {
  return pipe(
    TE.right<never, GetPostsRequest>({ limit: DEFAULT_POSTS_LIMIT, offset }),
    TE.chain((params) => httpService.post<GetPostsResponse>("/posts/get-posts", params)),
    TE.map((result) => {
      const { posts, childPosts, totalPosts } = result.data;
      return { posts, childPosts, totalPosts };
    })
  );
}

const loadReplyPosts = ({
  httpService, offset = 0, parentPostId,
}: {
  httpService: HttpService; offset?: number; parentPostId: PostId;
}): TE.TaskEither<
  Error,
  { posts: ReadonlyArray<Post>; parentPost: Post }
> => {
  return pipe(
    TE.right<never, GetReplyPostsRequest>({ limit: DEFAULT_POSTS_LIMIT, offset, parentPostId }),
    TE.chain((params) => httpService.post<GetReplyPostsResponse>("/posts/get-reply-posts", params)),
    TE.map((result) => {
      const { posts, parentPost } = result.data;
      return { posts, parentPost };
    })
  );
}

export const getLoadPostsInitial = ({ httpService, postsStore }: { httpService: HttpService, postsStore: PostsStoreInterface }): LoadPostsInitial => () => {
  return pipe(
    loadPosts({ httpService }),
    TE.chain(({ posts, childPosts, totalPosts }) => {
      postsStore.setPosts({ posts: [...posts, ...childPosts] });
      postsStore.setTotalMainPosts({ totalPosts });
      return TE.right(void 0);
    }),
  );
};

export const getLoadMorePosts = ({ httpService, postsStore }: { httpService: HttpService, postsStore: PostsStoreInterface }): LoadMorePosts => () => {
  return pipe(
    loadPosts({ httpService, offset: postsStore.mainPostsLoadedAmount }),
    TE.chain(({ posts, childPosts, totalPosts }) => {
      postsStore.setPosts({ posts: [...posts, ...childPosts] });
      postsStore.setTotalMainPosts({ totalPosts });
      return TE.right(void 0);
    }),
  );
};

export const getLoadReplyPosts = ({ httpService, postsStore }: { httpService: HttpService, postsStore: PostsStoreInterface }): LoadReplyPosts => ({ parentPostId }) => {
  return pipe(
    loadReplyPosts({ httpService, parentPostId }),
    TE.chain(({ posts, parentPost }) => {
      postsStore.setPosts({ posts: [...posts, parentPost] });
      return TE.right(void 0);
    }),
  );
};

export const getCreateReplyPost = ({ httpService, postsStore }: { httpService: HttpService, postsStore: PostsStoreInterface }): CreateReplyPost => ({ operation, value, parentPostId }) => {
  return pipe(
    TE.right<never, CreatePostRequest>({ operation, value, parentPostId, type: PostType.Reply }),
    TE.chain((params) => httpService.post<CreatePostResponse>("/posts/create-post", params)),
    TE.chain(() => loadReplyPosts({ httpService, parentPostId })),
    TE.chain(({ posts, parentPost }) => {
      postsStore.setPosts({ posts: [...posts, parentPost] });
      return TE.right(void 0);
    }),
    TE.map(() => void 0)
  );
};

export const getCreatePost = ({ httpService, postsStore }: { httpService: HttpService, postsStore: PostsStoreInterface }): CreatePost => ({ value }) => {
  return pipe(
    TE.right<never, CreatePostRequest>({ value, type: PostType.Initial }),
    TE.chain((params) => httpService.post<CreatePostResponse>("/posts/create-post", params)),
    TE.chain(() => loadPosts({ httpService })),
    TE.chain(({ posts, childPosts, totalPosts }) => {
      postsStore.reset();
      postsStore.setPosts({ posts: [...posts, ...childPosts] });
      postsStore.setTotalMainPosts({ totalPosts });
      return TE.right(void 0);
    }),
    TE.map(() => void 0)
  );
};
