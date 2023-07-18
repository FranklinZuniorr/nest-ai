import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThemesDocument = Themes & Document;

@Schema({ collection: 'themes' })
export class Themes {

  @Prop()
  theme: string;

  @Prop()
  total: number;

}

export const ThemesSchema = SchemaFactory.createForClass(Themes);