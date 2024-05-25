import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { FollowSchema } from './schemas/follow.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/users'),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Follow', schema: FollowSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
