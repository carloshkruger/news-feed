import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Follow } from './schemas/follow.schema';
import { randomUUID } from 'crypto';

export async function seedDatabase(app: INestApplication) {
  const userModel: Model<User> = app.get(getModelToken(User.name));
  const followModel: Model<Follow> = app.get(getModelToken(Follow.name));

  try {
    const user1 = await userModel.create({
      id: '6bf8c8c4-6c58-45fa-bfb4-61f325ea8777',
      email: 'john@doe.com',
      name: 'John Doe',
    });
    const user2 = await userModel.create({
      id: '8a43f7be-711f-4ec0-a5e9-61fa099f7223',
      email: 'john2@doe.com',
      name: 'John Doe 2',
    });
    await userModel.create({
      id: '5a9b8ec0-0a3e-4d1f-94b0-797946eda927',
      email: 'john3@doe.com',
      name: 'John Doe 3',
    });

    await followModel.create({
      id: randomUUID(),
      followerId: user2.id,
      followeeId: user1.id,
    });
  } catch (e) {
    // Duplicate key error
    if (e.code === 11000) {
      console.log('Database already seed');
      return;
    }
    console.log(e);
  }
}
