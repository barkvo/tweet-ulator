import { PostType, ExternalPost, PostId } from './posts.types';

export const getInitialPostsWithChildrenCountAndAuthorName = ({ limit, offset }: { limit: number; offset: number }) => {
  return `
    select
      posts."id", "type", "value", "authorId", "createdAt",
      "operation", posts."parentPostId",
      case when C.count is null then 0 else C.count END as "childrenCount",
      U.name as "authorName" from posts
    left join (
      select posts."parentPostId", count(*) from posts
      group by posts."parentPostId"
    ) as C on posts."id" = C."parentPostId"
    join (
      select "name", "id" from users
    ) as U on posts."authorId" = U."id"
    where posts."type" = '${PostType.Initial}'
    order by "createdAt" desc
    limit ${limit} offset ${offset}
  `;
};

export const getFewChildrenPostsForEachParentIdWithChildrenCountAndAuthorName = ({
  posts,
  childPostsToLoad,
}: {
  posts: ExternalPost[];
  childPostsToLoad: number;
}) => {
  return `with replies_num as (
    SELECT id, row_number() OVER (PARTITION BY posts."parentPostId" ORDER BY id) AS rnum
    FROM posts where "type" = '${PostType.Reply}' and posts."parentPostId" in (${posts
    .map((p) => `'${p.id}'`)
    .join(',')}) ORDER BY id
  )
  select
      posts."id", "type", "value", "authorId", "createdAt",
      "operation", posts."parentPostId",
      case when C.count is null then 0 else C.count END as "childrenCount",
      U.name as "authorName" from posts
  left join (
      select posts."parentPostId", count(*) from posts
      group by posts."parentPostId"
  ) as C on posts."id" = C."parentPostId"
  join (
      select "name", "id" from users
  ) as U on posts."authorId" = U."id"
  where posts."id" in (
    select id from replies_num where replies_num.rnum <= ${childPostsToLoad}
  )
  order by "createdAt" asc`;
};

export const getParentPostWithChildrenCountAndAuthorName = ({ parentPostId }: { parentPostId: PostId }) => {
  return `
    select
      posts."id", "type", "value", "authorId", "createdAt",
      "operation", posts."parentPostId",
      case when C.count is null then 0 else C.count END as "childrenCount",
      U.name as "authorName" from posts
    left join (
      select posts."parentPostId", count(*) from posts
      group by posts."parentPostId"
    ) as C on posts."id" = C."parentPostId"
    join (
      select "name", "id" from users
    ) as U on posts."authorId" = U."id"
    where posts."id" = '${parentPostId}'
    limit 1
  `;
};

export const getChildrenPostsByParentIdWithChildrenCountAndAuthorName = ({
  parentPostId,
  limit,
  offset,
}: {
  parentPostId: PostId;
  limit: number;
  offset: number;
}) => {
  return `
    select
      posts."id", "type", "value", "authorId", "createdAt",
      "operation", posts."parentPostId",
      case when C.count is null then 0 else C.count END as "childrenCount",
      U.name as "authorName" from posts
    left join (
      select posts."parentPostId", count(*) from posts
      group by posts."parentPostId"
    ) as C on posts."id" = C."parentPostId"
    join (
      select "name", "id" from users
    ) as U on posts."authorId" = U."id"
    where posts."parentPostId" = '${parentPostId}'
    order by "createdAt" asc
    limit ${limit} offset ${offset}
  `;
};