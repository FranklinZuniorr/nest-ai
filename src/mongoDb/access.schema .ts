import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccessDocument = Access & Document;

@Schema({ collection: 'access' })
export class Access {

  @Prop()
  date: string;

  @Prop()
  access: [];

}

export const AccessSchema = SchemaFactory.createForClass(Access);