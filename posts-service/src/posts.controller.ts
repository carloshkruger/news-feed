import { Body, Controller, Post } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindManyByIdsParams, FindManyByIdsResponse } from './types/src/posts';

@ApiTags('Posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  async create(@Body() data: CreatePostDto) {
    await this.postsService.create(data, data.authorId);
  }

  @GrpcMethod('PostsService', 'FindManyByIds')
  async findManyByIds(
    data: FindManyByIdsParams,
  ): Promise<FindManyByIdsResponse> {
    try {
      return {
        data: await this.postsService.findManyByIds(data.ids),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
