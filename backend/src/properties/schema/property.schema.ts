import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({
    enum: ['RESIDENTIAL', 'COMMERCIAL', 'LAND'],
    default: 'RESIDENTIAL',
  })
  type!: string;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
