import { HttpService } from "../../core/http";
import {
  getLoadPostsInitial,
  getLoadMorePosts,
  getLoadReplyPosts,
  getCreateReplyPost,
  getCreatePost,
} from "./posts.service";
import { PostsStore } from "./posts.store";
import { PostsModule } from "./posts.types";
import { Posts } from "./Posts.view";

export const buildModule = ({ httpService }: { httpService: HttpService }): PostsModule => {
  const postsStore = new PostsStore();
  const loadPostsInitial = getLoadPostsInitial({ httpService, postsStore });
  const loadMorePosts = getLoadMorePosts({ httpService, postsStore });
  const loadReplyPosts = getLoadReplyPosts({ httpService, postsStore });
  const createReplyPost = getCreateReplyPost({ httpService, postsStore });
  const createPost = getCreatePost({ httpService, postsStore });
  return {
    Posts,
    loadPostsInitial,
    loadMorePosts,
    loadReplyPosts,
    createPost,
    createReplyPost,
    postsStore,
  };
};

export * from "./posts.types";
