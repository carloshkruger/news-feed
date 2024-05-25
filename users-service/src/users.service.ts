import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User as MongoUser } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomUUID } from 'crypto';
import { FollowUserDto } from './dtos/follow.dto';
import { Follow } from './schemas/follow.schema';

export type User = {
  id: string;
  name: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<MongoUser>,
    @InjectModel('Follow') private followModel: Model<Follow>,
  ) {}

  async create(data: CreateUserDto) {
    await this.userModel.create({ ...data, id: randomUUID() });
  }

  async follow({ followerId, followeeId }: FollowUserDto) {
    await this.followModel.create({
      followerId,
      followeeId,
      id: randomUUID(),
    });
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.userModel.find({ id: { $in: ids } }).exec();
  }

  async getUserFollowers(userId: string): Promise<string[]> {
    const followers = await this.followModel
      .find({ followeeId: userId }, { followerId: true })
      .exec();

    return followers.map((follower) => follower.followerId);
  }
}
