import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post content',
    example: 'This is my first post',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description:
      'Author id (this is the authenticated user. In a real app, this would come from the auth token and not from here)',
    example: '6bf8c8c4-6c58-45fa-bfb4-61f325ea8777',
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
