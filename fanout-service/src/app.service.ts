import {
  DeleteMessageBatchCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { setTimeout as sleep } from 'timers/promises';
import { UsersService as UsersRpcService } from './types/src/users';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CacheService } from './services/cache.service';

@Injectable()
export class AppService implements OnModuleInit {
  private usersRpcService: UsersRpcService;
  private readonly sqsClient: SQSClient;

  constructor(
    @Inject('USERS_PACKAGE') private usersClient: ClientGrpc,
    private cacheService: CacheService,
  ) {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.SQS_ENDPOINT,
    });
  }

  onModuleInit() {
    this.usersRpcService =
      this.usersClient.getService<UsersRpcService>('UsersService');

    this.startProcessingQueue();
  }

  private async startProcessingQueue() {
    while (true) {
      const { Messages } = await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: process.env.QUEUE_NAME,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 10,
        }),
      );

      if (!Messages || !Messages.length) {
        await sleep(5000);
        continue;
      }

      const promisesResults = await Promise.allSettled(
        Messages.map((message) =>
          this.generateFeed(JSON.parse(message.Body).Message),
        ),
      );

      // If a message is successfully processed, it can be removed from the queue
      const messagesToDelete: Message[] = [];
      for (let i = 0; i < promisesResults.length; i++) {
        const result = promisesResults[i];

        if (result.status === 'fulfilled') {
          messagesToDelete.push(Messages[i]);
        }
      }

      if (messagesToDelete.length) {
        await this.sqsClient.send(
          new DeleteMessageBatchCommand({
            QueueUrl: process.env.QUEUE_NAME,
            Entries: messagesToDelete.map((message) => ({
              Id: message.MessageId,
              ReceiptHandle: message.ReceiptHandle,
            })),
          }),
        );
      }
    }
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
