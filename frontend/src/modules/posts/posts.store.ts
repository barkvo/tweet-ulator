import { pipe } from "fp-ts/pipeable";
import { makeAutoObservable } from "mobx";
import { PostsStore as PostsStoreInterface, Post, PostWithChildren } from "./posts.types";
import { PostType } from ".";

const buildPostsTree = (posts: ReadonlyArray<Post>): ReadonlyArray<PostWithChildren> => {
  const hashTable = Object.create(null);
  posts.forEach((post) => hashTable[post.id] = {...post, children: []});
  const resultTree: PostWithChildren[] = [];
  posts.forEach((post) => {
    if (post.parentPostId) {
      hashTable[post.parentPostId].children.push(hashTable[post.id]);
    }
    else resultTree.push(hashTable[post.id])
  });
  return resultTree;
};

export class PostsStore implements PostsStoreInterface {
  constructor() {
    makeAutoObservable(this);
  }

  public posts: Post[] = [];

  public setPosts = ({ posts }: { posts: ReadonlyArray<Post> }) => {
    // TODO: replace this quick workaround
    this.posts = pipe(
      this.posts.map((existingPost) => {
        const updatedPost = posts.find((p) => p.id === existingPost.id);
        return updatedPost || existingPost;
      }),
      (existingPostsWithUpdatesApplied) => {
        const newPosts = posts.filter((newPost) => {
          const alreadyUpdatedPost = existingPostsWithUpdatesApplied.find((p) => p.id === newPost.id);
          return !alreadyUpdatedPost;
        });
        return [
          ...existingPostsWithUpdatesApplied,
          ...newPosts,
        ];
      },  
    );
  };

  get postsTree () {
    return buildPostsTree(this.posts);
  }

  public totalMainPosts: number = 0;

  public setTotalMainPosts = ({ totalPosts }: { totalPosts: number }) => {
    this.totalMainPosts = totalPosts;
  };

  public reset = () => {
    this.posts = [];
    this.totalMainPosts = 0;
  };

  get mainPostsLoadedAmount () {
    return this.posts.filter((p) => p.type === PostType.Initial).length;
  }

  get remainingMainPostsToLoadAmount () {
    return this.totalMainPosts - this.mainPostsLoadedAmount;
  }

  get canLoadMoreMainPosts () {
    return this.remainingMainPostsToLoadAmount > 0;
  }

}
