import { Injectable } from '@nestjs/common';
import { transformAndValidateAsTE } from '@/core/fp-ts/validation';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as Apply from 'fp-ts/Apply';
import * as Arr from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import { BasePostDTO, BasePostWithChildCountDTO } from './posts.dto';
import {
  ALL_POST_FIELDS,
  Post,
  PostType,
  POSTS_TABLE,
  isInputPost,
  isPost,
  InputPostData,
  PostId,
  isPostWithChildrenCount,
  PostWithChildrenCount,
  PostWithChildren,
} from './posts.types';

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
      posts: ReadonlyArray<PostWithChildren>;
    }
  > => {
    return pipe(
      Apply.sequenceS(TE.taskEither)({
        posts: pipe(
          TE.tryCatch<Error, ReadonlyArray<Record<string, unknown>>>(
            () => {
              return this.knex
                .raw(
                  `
                    select
                      "id", "type", "value", "authorId", "createdAt",
                      "operation", posts."parentPostId", C.count as "childrenCount" from posts
                    join (
                      select posts."parentPostId", count(*) from posts
                      group by posts."parentPostId"
                    ) as C on posts."id" = C."parentPostId"
                    where posts."type" = '${PostType.Initial}'
                    limit ${limit} offset ${offset}
                  `,
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
                  transformAndValidateAsTE(BasePostWithChildCountDTO, rawPost),
                  TE.filterOrElse(isPostWithChildrenCount, () => new Error('Is not a valid post type')),
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
          TE.tryCatch<Error, ReadonlyArray<Record<string, unknown>>>(
            () => {
              return this.knex
                .raw(
                  `with replies_num as (
                    SELECT id, row_number() OVER (PARTITION BY posts."parentPostId" ORDER BY id) AS rnum
                    FROM posts where "type" = '${PostType.Reply}' and posts."parentPostId" in (${posts
                    .map((p) => `'${p.id}'`)
                    .join(',')}) ORDER BY id
                  )
                  select * from posts where id in (
                    select id from replies_num where replies_num.rnum <= ${DEFAULT_CHILD_POSTS_TO_LOAD}
                  )`,
                )
                .then((results) => results.rows);
            },
            (e) => new Error(`Failed to get posts (knex): ${e}`),
          ),
          TE.chain((rawPosts) => {
            return Arr.sequence(TE.taskEither)(
              rawPosts.map((rawPost) => {
                return pipe(
                  transformAndValidateAsTE(BasePostDTO, rawPost),
                  TE.filterOrElse(isPost, () => new Error('Is not a valid post type')),
                );
              }),
            );
          }),
          TE.map((childPosts) => {
            return {
              limit,
              offset,
              totalPosts,
              posts: posts.map((post) => {
                return {
                  ...post,
                  children: childPosts.filter((cp) => cp.parentPostId === post.id),
                } as PostWithChildren;
              }),
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
      totalPosts: number;
      posts: ReadonlyArray<PostWithChildrenCount>;
    }
  > => {
    return pipe(
      Apply.sequenceS(TE.taskEither)({
        posts: pipe(
          TE.tryCatch<Error, ReadonlyArray<Record<string, unknown>>>(
            () => {
              return this.knex
                .raw(
                  `
                    select
                      "id", "type", "value", "authorId", "createdAt",
                      "operation", posts."parentPostId", C.count as "childrenCount" from posts
                    join (
                      select posts."parentPostId", count(*) from posts
                      group by posts."parentPostId"
                    ) as C on posts."id" = C."parentPostId"
                    where posts."parentPostId" = '${parentPostId}'
                    limit ${limit} offset ${offset}
                  `,
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
                  transformAndValidateAsTE(BasePostWithChildCountDTO, rawPost),
                  TE.filterOrElse(isPostWithChildrenCount, () => new Error('Is not a valid post type')),
                );
              }),
            );
          }),
        ),
        totalPosts: TE.tryCatch<Error, number>(
          () => {
            return this.knex
              .table(POSTS_TABLE)
              .where('parentPostId', parentPostId)
              .count()
              .then((results) => results[0].count && parseInt(results[0].count as string, 10));
          },
          (e) => new Error(`Failed to count posts (knex): ${e}`),
        ),
      }),
      TE.map(({ posts, totalPosts }) => ({ limit, offset, parentPostId, posts, totalPosts })),
    );
  };
}