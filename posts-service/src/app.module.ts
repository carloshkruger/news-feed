import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemas/post.schema';
import { PubSubService } from './services/pub-sub.service';
import { CacheService } from './services/cache.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DB_URI),
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PubSubService, CacheService],
})
export class AppModule {}
