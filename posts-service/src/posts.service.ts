import { Injectable } from '@nestjs/common';
import { Post as RpcPost } from './types/src/posts';
import { CreatePostDto } from './dtos/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { PubSubService } from './services/pub-sub.service';
import { CacheService } from './services/cache.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly pubSubService: PubSubService,
    private readonly cacheService: CacheService,
  ) {}

  async create(data: CreatePostDto, authorId: string) {
    const post = new this.postModel({ ...data, id: randomUUID(), authorId });
    await post.save();
    await this.pubSubService.publish(
      process.env.POST_CREATED_TOPIC,
      post.toObject(),
    );
  }

  async findManyByIds(ids: string[]): Promise<RpcPost[]> {
    const posts = [];

    const dataFromCache = await this.cacheService.getMany(ids);
    const postsFromCache: RpcPost[] = dataFromCache
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data));
    const idsNotInCache = ids.filter(
      (id) => !postsFromCache.find((post) => post.id === id),
    );

    if (postsFromCache.length) {
      posts.push(...postsFromCache);
    }

    if (idsNotInCache.length) {
      const postsFromDatabase = await this.postModel
        .find({ id: { $in: idsNotInCache } })
        .exec();

      const postsMapped: RpcPost[] = postsFromDatabase.map((post) => ({
        id: post.id,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt.toUTCString(),
      }));

      const postsMapForCache = postsMapped.reduce((acc, post) => {
        acc[post.id] = JSON.stringify(post);
        return acc;
      }, {});

      await this.cacheService.setMany(postsMapForCache);

      posts.push(...postsMapped);
    }

    return posts;
  }
}
