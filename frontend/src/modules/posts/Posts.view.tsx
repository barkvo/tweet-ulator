import { Spin, Space, Button, Row, Col } from "antd";
import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Subject } from "rxjs";
import { PostsComponentInterface, PostId } from "./posts.types";
import { AddMainPost } from "./AddMainPost.view";
import { PostItem } from "./PostItem.view";
import "./Posts.style.css";

export const Posts: PostsComponentInterface = observer(({
  postsTree,
  canLoadMoreMainPosts,
  loadPostsInitial,
  loadMorePosts,
  loadReplyPosts,
  createPost,
  createReplyPost,
  remainingMainPostsToLoadAmount,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hideAddReplyFormSubject] = useState(new Subject<PostId>());
  useEffect(() => {
    pipe(
      loadPostsInitial(),
      TE.fold(
        (e) => {
          alert(`Failed to load posts: ${e}`);
          return TE.right(void 0);
        },
        () => {
          setIsLoading(false);
          return TE.right(void 0);
        }
      ),
    )();
  }, []);
  const loadMoreMainPosts = () => {
    pipe(
      loadMorePosts(),
      TE.fold(
        (e) => {
          alert(`Failed to load posts: ${e}`);
          return TE.right(void 0);
        },
        () => {
          return TE.right(void 0);
        }
      ),
    )();
  };
  if (isLoading) {
    return (
      <Space size="middle">
        <Spin size="large" />
      </Space>
    );
  }
  const posts = postsTree.map((p) =>
    <PostItem
      key={p.id}
      post={p}
      loadReplyPosts={loadReplyPosts}
      createReplyPost={createReplyPost}
      hideReplyFormSubject={hideAddReplyFormSubject}
      previousValue={0}
    />
  );
  const loadMorePostsContent = canLoadMoreMainPosts && (
    <Button type="link" onClick={loadMoreMainPosts}>Load more posts ({remainingMainPostsToLoadAmount})</Button>
  );
  return (
    <Row>
      <Col span={24}><AddMainPost createPost={createPost}/></Col>
      <Col span={24}>{posts}</Col>
      <Col span={24}>{loadMorePostsContent}</Col>
    </Row>
  );
});
