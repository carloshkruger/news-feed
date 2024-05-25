import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PubSubService {
  private readonly snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.SNS_ENDPOINT,
    });
  }

  async publish(topic: string, message: any) {
    await this.snsClient.send(
      new PublishCommand({
        Message: JSON.stringify(message),
        TopicArn: topic,
      }),
    );
  }
}
