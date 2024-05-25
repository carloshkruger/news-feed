import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FollowUserDto {
  @ApiProperty({
    description:
      'User id (this is the authenticated user. In a real app, this would come from the auth token and not from here)',
    example: '8a43f7be-711f-4ec0-a5e9-61fa099f7223',
  })
  @IsString()
  @IsNotEmpty()
  followerId: string;

  @ApiProperty({
    description: 'User id',
    example: '6bf8c8c4-6c58-45fa-bfb4-61f325ea8777',
  })
  @IsString()
  @IsNotEmpty()
  followeeId: string;
}
