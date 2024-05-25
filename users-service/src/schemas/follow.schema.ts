import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
  @Prop()
  id: string;

  @Prop()
  followerId: string;

  @Prop()
  followeeId: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
