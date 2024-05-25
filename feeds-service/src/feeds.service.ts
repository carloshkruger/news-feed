import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { PostsService as PostsRpcService } from './types/src/posts';
import { UsersService as UsersRpcService } from './types/src/users';
import { lastValueFrom } from 'rxjs';
import { CacheService } from './services/cache.service';

type Author = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
};

type Feed = {
  posts: Post[];
};

@Injectable()
export class FeedsService implements OnModuleInit {
  private postsRpcService: PostsRpcService;
  private usersRpcService: UsersRpcService;

  constructor(
    @Inject('POSTS_PACKAGE') private postsClient: ClientGrpc,
    @Inject('USERS_PACKAGE') private usersClient: ClientGrpc,
    private cacheService: CacheService,
  ) {}

  onModuleInit() {
    this.postsRpcService =
      this.postsClient.getService<PostsRpcService>('PostsService');
    this.usersRpcService =
      this.usersClient.getService<UsersRpcService>('UsersService');
  }

  async getFeed(userId: string): Promise<Feed> {
    console.time('getFeed');
    const postIds = await this.cacheService.getList(`feed:${userId}`);

    if (!postIds.length) {
      return { posts: [] };
    }

    const posts = await lastValueFrom(
      this.postsRpcService.findManyByIds({ ids: postIds }),
    );

    if (!posts.data || !posts.data.length) {
      return { posts: [] };
    }

    const authorIds = [...new Set(posts.data.map((post) => post.authorId))];

    const authors = await lastValueFrom(
      this.usersRpcService.findManyByIds({
        ids: authorIds,
      }),
    );
    const authorsMap = authors.data.reduce((acc, author) => {
      acc[author.id] = author;
      return acc;
    }, {});

    console.timeEnd('getFeed');

    return {
      posts: posts.data.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: authorsMap[post.authorId],
      })),
    };
  }
}
