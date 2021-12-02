import { Injectable } from '@nestjs/common';
import { transformAndValidateAsTE } from '@/core/fp-ts/validation';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as Apply from 'fp-ts/Apply';
import * as Arr from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import { BasePostDTO, BaseExternalPostDTO } from './posts.dto';
import {
  ALL_POST_FIELDS,
  Post,
  PostType,
  POSTS_TABLE,
  isInputPost,
  isPost,
  InputPostData,
  PostId,
  ExternalPost,
  isExternalPost,
} from './posts.types';
import {
  getInitialPostsWithChildrenCountAndAuthorName,
  getFewChildrenPostsForEachParentIdWithChildrenCountAndAuthorName,
  getParentPostWithChildrenCountAndAuthorName,
  getChildrenPostsByParentIdWithChildrenCountAndAuthorName,
} from './sql';

const DEFAULT_CHILD_POSTS_TO_LOAD = 2;

@Injectable()
export class PostsService {
  constructor(@InjectKnex() private readonly knex: Knex) {
    //
  }

  public createPost = (input: InputPostData): TE.TaskEither<Error, Post> => {
    return pipe(
      TE.right(input),
      TE.filterOrElse(isInputPost, () => new Error('Is not a valid post type')),
      TE.chain((postToCreate) => {
        return TE.tryCatch<Error, Record<string, unknown>>(
          () => {
            return this.knex
              .table(POSTS_TABLE)
              .insert(postToCreate, ALL_POST_FIELDS)
              .then((results) => results[0]);
          },
          (e) => new Error(`Failed to create post (knex): ${e}`),
        );
      }),
      TE.chain((rawPost) => {
        return pipe(
          transformAndValidateAsTE(BasePostDTO, rawPost),
          TE.filterOrElse(isPost, () => new Error('Is not a valid post type')),
        );
      }),
    );
  };

  public getPosts = ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): TE.TaskEither<
    Error,
    {
      limit: number;
      offset: number;
      totalPosts: number;
      posts: ReadonlyArray<ExternalPost>;
      childPosts: ReadonlyArray<ExternalPost>;
    }
  > => {
    return pipe(
      Apply.sequenceS(TE.taskEither)({
        posts: pipe(
          TE.tryCatch<Error, ReadonlyArray<Record<string, unknown>>>(
            () => {
              return this.knex.raw(getInitialPostsWithChildrenCountAndAuthorName({ limit, offset })).then((results) =>
                results.rows.map((r: Record<string, unknown>) => {
                  return { ...r, childrenCount: r.childrenCount && parseInt(r.childrenCount as string, 10) };
                }),
              );
            },
            (e) => new Error(`Failed to get posts (knex): ${e}`),
          ),
          TE.chain((rawPosts) => {
            return Arr.sequence(TE.taskEither)(
              rawPosts.map((rawPost) => {
                return pipe(
                  transformAndValidateAsTE(BaseExternalPostDTO, rawPost),
                  TE.filterOrElse(isExternalPost, () => new Error('Is not a valid post type')),
                );
              }),
            );
          }),
        ),
        totalPosts: TE.tryCatch<Error, number>(
          () => {
            return this.knex
              .table(POSTS_TABLE)
              .where('type', PostType.Initial)
              .count()
              .then((results) => results[0].count && parseInt(results[0].count as string, 10));
          },
          (e) => new Error(`Failed to count posts (knex): ${e}`),
        ),
      }),
      TE.chain(({ posts, totalPosts }) => {
        return pipe(
          posts.length,
          O.fromPredicate((l) => l > 0),
          O.fold<number, TE.TaskEither<Error, ExternalPost[]>>(
            () => TE.right([]),
            () => {
              return pipe(
                TE.tryCatch<Error, ReadonlyArray<Record<string, unknown>>>(
                  () => {
                    return this.knex
                      .raw(
                        getFewChildrenPostsForEachParentIdWithChildrenCountAndAuthorName({
                          posts,
                          childPostsToLoad: DEFAULT_CHILD_POSTS_TO_LOAD,
                        }),
                      )
                      .then((results) =>
                        results.rows.map((r: Record<string, unknown>) => {
                          return { ...r, childrenCount: r.childrenCount && parseInt(r.childrenCount as string, 10) };
                        }),
                      );
                  },
                  (e) => new Error(`Failed to get posts (knex): ${e}`),
                ),
                TE.chain((rawPosts) => {
                  return Arr.sequence(TE.taskEither)(
                    rawPosts.map((rawPost) => {
                      return pipe(
                        transformAndValidateAsTE(BaseExternalPostDTO, rawPost),
                        TE.filterOrElse(isExternalPost, () => new Error('Is not a valid post type')),
                      );
                    }),
                  );
                }),
              );
            },
          ),
          TE.map((childPosts) => {
            return {
              limit,
              offset,
              totalPosts,
              posts,
              childPosts,
            };
          }),
        );
      }),
    );
  };

  public getReplyPosts = ({
    limit,
    offset,
    parentPostId,
  }: {
    limit: number;
    offset: number;
    parentPostId: PostId;
  }): TE.TaskEither<
    Error,
    {
      limit: number;
      offset: number;
      parentPostId: PostId;
      parentPost: ExternalPost;
      posts: ReadonlyArray<ExternalPost>;
    }
  > => {
    return pipe(
      Apply.sequenceS(TE.taskEither)({
        parentPost: pipe(
          TE.tryCatch<Error, Record<string, unknown>>(
            () => {
              return this.knex.raw(getParentPostWithChildrenCountAndAuthorName({ parentPostId })).then((results) => {
                const r = results.rows[0];
                return { ...r, childrenCount: r.childrenCount && parseInt(r.childrenCount as string, 10) };
              });
            },
            (e) => new Error(`Failed to get posts (knex): ${e}`),
          ),
          TE.chain((rawPost) => {
            return pipe(
              transformAndValidateAsTE(BaseExternalPostDTO, rawPost),
              TE.filterOrElse(isExternalPost, () => new Error('Is not a valid post type')),
            );
          }),
        ),
        posts: pipe(
          TE.tryCatch<Error, ReadonlyArray<Record<string, unknown>>>(
            () => {
              return this.knex
                .raw(getChildrenPostsByParentIdWithChildrenCountAndAuthorName({ parentPostId, limit, offset }))
                .then((results) =>
                  results.rows.map((r: Record<string, unknown>) => {
                    return { ...r, childrenCount: r.childrenCount && parseInt(r.childrenCount as string, 10) };
                  }),
                );
            },
            (e) => new Error(`Failed to get posts (knex): ${e}`),
          ),
          TE.chain((rawPosts) => {
            return Arr.sequence(TE.taskEither)(
              rawPosts.map((rawPost) => {
                return pipe(
                  transformAndValidateAsTE(BaseExternalPostDTO, rawPost),
                  TE.filterOrElse(isExternalPost, () => new Error('Is not a valid post type')),
                );
              }),
            );
          }),
        ),
      }),
      TE.map(({ posts, parentPost }) => ({ limit, offset, parentPostId, posts, parentPost })),
    );
  };
}
