import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  entityType!: string;

  @Prop({ required: true })
  entityId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ type: Object })
  payload!: Record<string, any>;

  @Prop({ required: true })
  previousHash!: string;

  @Prop({ required: true })
  currentHash!: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
