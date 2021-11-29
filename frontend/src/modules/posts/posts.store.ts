import { action, computed, observable } from "mobx";
import { PostsStore as PostsStoreInterface, Post, PostId } from "./posts.types";

export class PostsStore implements PostsStoreInterface {
  @observable
  public posts?: ReadonlyArray<Post>;

  @observable
  public totalPosts?: number;

  @action
  public setPosts = ({ parentPostId, posts, totalPosts }: { parentPostId?: PostId; posts: ReadonlyArray<Post>; totalPosts: number }) => {
    this.posts = posts;
    this.totalPosts = totalPosts;
  };
}
