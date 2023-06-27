import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  img?: string;

  @Prop()
  coins: number;

  @Prop()
  validToken: string;

  @Prop()
  lastRequestForgotPassword?: string;

  @Prop()
  shopping?: []

  @Prop()
  queries?: []
}

export const UserSchema = SchemaFactory.createForClass(User);