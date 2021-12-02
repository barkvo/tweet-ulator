import { Comment, Avatar, Button } from "antd";
import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import { isNumber } from "lodash";
import React, { FC, useState, useEffect } from "react";
import { Subject } from "rxjs";
import {
  ReplyPost,
  PostWithChildren,
  LoadReplyPosts,
  PostId,
  CreateReplyPost,
  PostOperation,
  isReplyPost,
} from "./posts.types";
import { AddReplyPost } from "./AddReplyPost.view";

const getPostValueCalculationResult = ({
  previousValue,
  value,
  operation,
}: {
  previousValue: number;
  value: number;
  operation: PostOperation;
}): number => {
  switch (operation) {
    case PostOperation.Division:
      return previousValue / value;
    case PostOperation.Multiplication:
      return previousValue * value;
    case PostOperation.Subtraction:
      return previousValue - value;
    case PostOperation.Sum:
      return previousValue + value;
    default:
      return value;
  }
};

const calculatePreviousValueResultForThread = ({
  previousValue,
  threadPosts,
  currentItemId,
}: {
  previousValue: number;
  threadPosts: ReadonlyArray<ReplyPost>;
  currentItemId: PostId;
}): number => {
  const currentItemIndex = threadPosts.findIndex((p) => p.id === currentItemId);
  const previousPostsFromThread = threadPosts.filter((value, index) => index < currentItemIndex);
  return previousPostsFromThread.reduce((result, post) => {
    return getPostValueCalculationResult({
      previousValue: result,
      value: post.value,
      operation: post.operation,
    });
  }, previousValue);
}

interface ResolvePostValueInput {
  post: PostWithChildren | ReplyPost;
  previousValue?: number;
  parentPost?: PostWithChildren;
}

interface ResolvePostValueInputForReplyPost {
  post: ReplyPost;
  previousValue: number;
  parentPost: PostWithChildren & { children: ReadonlyArray<ReplyPost> };
}

const isResolvePostValueInputForReplyPost = (i: ResolvePostValueInput): i is ResolvePostValueInputForReplyPost => {
  return isReplyPost(i.post) && isNumber(i.previousValue) && !!i.parentPost;
} 

// TODO: improve types, post children should have ReplyPost type
const resolvePostValue = (input: {
  post: PostWithChildren;
  previousValue?: number;
  parentPost?: PostWithChildren;
}): { previousValue?: number; currentValue: number } => {
  if (isResolvePostValueInputForReplyPost(input)) {
    const { post, previousValue, parentPost } = input;
    const previousValueFromThread = calculatePreviousValueResultForThread({
      previousValue,
      threadPosts: parentPost.children,
      currentItemId: post.id,
    });
    const currentValue = getPostValueCalculationResult({
      previousValue: previousValueFromThread,
      value: post.value,
      operation: post.operation,
    });
    return { previousValue: previousValueFromThread, currentValue };
  }
  return { currentValue: input.post.value };
}

export const PostItem: FC<{
  key: PostId;
  post: PostWithChildren;
  loadReplyPosts: LoadReplyPosts;
  createReplyPost: CreateReplyPost;
  hideReplyFormSubject: Subject<PostId>;
  previousValue?: number;
  parentPost?: PostWithChildren;
}> = ({ post, loadReplyPosts, createReplyPost, hideReplyFormSubject, previousValue, parentPost }) => {
  const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
  useEffect(() => {
    hideReplyFormSubject.asObservable().subscribe((postId) => {
      if (postId === post.id) {
        return;
      }
      setIsReplyFormVisible(false);
    });
  }, []);
  const resolvePostValueResult = resolvePostValue({
    post,
    previousValue,
    parentPost,
  })
  const children = post.children.map((p) =>
    <PostItem
      key={p.id}
      post={p}
      loadReplyPosts={loadReplyPosts}
      createReplyPost={createReplyPost}
      hideReplyFormSubject={hideReplyFormSubject}
      previousValue={resolvePostValueResult.currentValue}
      parentPost={post}
    />
  );
  const canLoadMorePosts = post.children.length !== post.childrenCount;
  const remainingPostsToLoad = post.childrenCount - post.children.length;
  const loadReplyPostsForCurrentPost = () => {
    pipe(
      loadReplyPosts({ parentPostId: post.id }),
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
  const loadMorePostsContent = canLoadMorePosts && (
    <Button type="link" onClick={loadReplyPostsForCurrentPost}>Load all posts({remainingPostsToLoad})</Button>
  );
  const replyContent = isReplyFormVisible && (
    <AddReplyPost key={post.id} createReplyPost={createReplyPost} parentPostId={post.id} />
  );
  const toggleReplyForm = () => {
    if (!isReplyFormVisible) {
      hideReplyFormSubject.next(post.id);
    }
    setIsReplyFormVisible(!isReplyFormVisible);
  };
  const operationContent = !!post.parentPostId && (
    <p>
      Operation: {post.operation}
      <br/>
    </p>
  );
  return (
    <Comment
      actions={[<span key="comment-nested-reply-to" onClick={toggleReplyForm}>Reply to</span>]}
      author={<a>{post.authorName}</a>}
      avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt={post.authorName} />}
      content={
        <p>
          {operationContent}
          Value: {post.value}
          <br/>
          Result: {resolvePostValueResult.currentValue}
        </p>
      }
    >
      {replyContent}
      {children}
      {loadMorePostsContent}
    </Comment>
  );
}
