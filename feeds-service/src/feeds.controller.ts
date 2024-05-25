import { Controller, Get } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Feeds')
@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get()
  @ApiOperation({ summary: 'Get feed' })
  async getFeed(): Promise<any> {
    // This is the user id of the user who is logged in
    const userId = '8a43f7be-711f-4ec0-a5e9-61fa099f7223';
    return this.feedsService.getFeed(userId);
  }
}
