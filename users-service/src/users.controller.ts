import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dtos/create-user.dto';
import { FollowUserDto } from './dtos/follow.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  FindUserFollowersParams,
  FindUserFollowersResponse,
  FindManyByIdsResponse,
  FindManyByIdsParams,
} from './types/src/users';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an user' })
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Post('/follow')
  @ApiOperation({ summary: 'Follow an user' })
  follow(@Body() data: FollowUserDto) {
    return this.usersService.follow(data);
  }

  @GrpcMethod('UsersService', 'FindManyByIds')
  async getUsersByIds(
    data: FindManyByIdsParams,
  ): Promise<FindManyByIdsResponse> {
    try {
      return {
        data: await this.usersService.getUsersByIds(data.ids),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @GrpcMethod('UsersService', 'FindUserFollowers')
  async getUserFollowers(
    data: FindUserFollowersParams,
  ): Promise<FindUserFollowersResponse> {
    try {
      return {
        data: await this.usersService.getUserFollowers(data.userId),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
