import { HttpService } from "../../core/http";
import { PostsStore } from "./posts.store";
import { PostsModule } from "./posts.types";
import { getPostsComponent } from "./Posts.view";

export const buildModule = ({ httpService }: { httpService: HttpService }): PostsModule => {
  const postsStore = new PostsStore();
  return {
    Posts: getPostsComponent({ postsStore }),
  };
};
