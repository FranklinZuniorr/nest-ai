import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpendingDocument = Spending & Document;

@Schema({ collection: 'spending' })
export class Spending {

  @Prop()
  date: string;

  @Prop()
  spending: [];

  @Prop()
  totalSpending?: number;

}

export const SpendingSchema = SchemaFactory.createForClass(Spending);