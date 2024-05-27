import { SQSClient } from '@aws-sdk/client-sqs';
import { Consumer } from 'sqs-consumer';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService as UsersRpcService } from './types/src/users';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CacheService } from './services/cache.service';

@Injectable()
export class AppService implements OnModuleInit {
  private usersRpcService: UsersRpcService;
  private readonly sqsConsumer: Consumer;

  constructor(
    @Inject('USERS_PACKAGE') private usersClient: ClientGrpc,
    private cacheService: CacheService,
  ) {
    this.sqsConsumer = Consumer.create({
      queueUrl: process.env.QUEUE_NAME,
      handleMessage: async (message) => {
        await this.generateFeed(JSON.parse(message.Body).Message);
      },
      sqs: new SQSClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        endpoint: process.env.SQS_ENDPOINT,
      }),
    });
  }

  onModuleInit() {
    this.usersRpcService =
      this.usersClient.getService<UsersRpcService>('UsersService');

    this.sqsConsumer.start();
  }

  private async generateFeed(message: string): Promise<void> {
    try {
      const post: Post = JSON.parse(message);

      const { data: followers } = await lastValueFrom(
        this.usersRpcService.findUserFollowers({
          userId: post.authorId,
        }),
      );

      await Promise.all(
        followers.map((followerId) =>
          this.cacheService.addOnList(`feed:${followerId}`, post.id),
        ),
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

type Post = {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
};
