import { observer } from "mobx-react";
import React, { FC } from "react";
import { PostsStore, PostsComponent, Post } from "./posts.types";

import { Comment, Avatar } from "antd";

const Post = ({ post }: { post: Post }) => (
  <Comment
    actions={[<span key="comment-nested-reply-to">Reply to</span>]}
    author={<a>${post.}</a>}
    avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
    content={
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure).
      </p>
    }
  >
    {children}
  </Comment>
);

export const getPostsComponent = ({ postsStore }: { postsStore: PostsStore }): PostsComponent => observer(() => {
  return (
    <div>
      <h1>POSTS HEHEHHE</h1>
      {postsStore.posts?.length}
    </div>
  );
});
