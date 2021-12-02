import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/jwt-auth.guard';
import { AuthenticatedRequest } from '@/core/auth/auth.types';
import { eitherToPromise } from '@/core/fp-ts/eitherToPromise';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import { CreatePostDTO, GetReplyPostsDTO, GetPostsDTO } from './posts.dto';
import { PostsService } from './posts.service';
import { Post as PostInterface, ExternalPost, PostId, InputPostData } from './posts.types';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('get-posts')
  @UseGuards(JwtAuthGuard)
  public getPosts(@Body() getPostsData: GetPostsDTO): Promise<{
    code: HttpStatus;
    limit: number;
    offset: number;
    totalPosts: number;
    posts: ReadonlyArray<ExternalPost>;
    childPosts: ReadonlyArray<ExternalPost>;
  }> {
    return eitherToPromise(
      pipe(
        this.postsService.getPosts({
          limit: DEFAULT_LIMIT,
          offset: DEFAULT_OFFSET,
          ...getPostsData,
        }),
        TE.map((results) => {
          return { code: HttpStatus.OK, ...results };
        }),
      ),
    );
  }

  @Post('get-reply-posts')
  @UseGuards(JwtAuthGuard)
  public getReplyPosts(@Body() getReplyPostsData: GetReplyPostsDTO): Promise<{
    code: HttpStatus;
    limit: number;
    offset: number;
    parentPostId: PostId;
    parentPost: ExternalPost;
    posts: ReadonlyArray<ExternalPost>;
  }> {
    return eitherToPromise(
      pipe(
        this.postsService.getReplyPosts({
          limit: 0,
          offset: DEFAULT_OFFSET,
          ...getReplyPostsData,
        }),
        TE.map((results) => {
          return { code: HttpStatus.OK, ...results };
        }),
      ),
    );
  }

  @Post('create-post')
  @UseGuards(JwtAuthGuard)
  public createPost(
    @Body() createPostData: CreatePostDTO,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ code: HttpStatus; post: PostInterface }> {
    return eitherToPromise(
      pipe(
        this.postsService.createPost({
          ...createPostData,
          authorId: req.user.userId,
        } as InputPostData),
        TE.map((post) => {
          return { code: HttpStatus.OK, post };
        }),
      ),
    );
  }
}
