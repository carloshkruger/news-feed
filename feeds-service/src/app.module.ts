import { Module } from '@nestjs/common';
import { FeedsController } from './feeds.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { FeedsService } from './feeds.service';
import { CacheService } from './services/cache.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'POSTS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'posts',
          protoPath: join(__dirname, 'posts.proto'),
        },
      },
      {
        name: 'USERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5002',
          package: 'users',
          protoPath: join(__dirname, 'users.proto'),
        },
      },
    ]),
  ],
  controllers: [FeedsController],
  providers: [FeedsService, CacheService],
})
export class AppModule {}
