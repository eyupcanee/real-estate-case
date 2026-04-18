import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionStage {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  SALE = 'SALE',
  RENTAL = 'RENTAL',
}

class FinancialBreakdown {
  agencyCut!: number;
  listingAgentCut!: number;
  sellingAgentCut!: number;
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: TransactionStage,
    default: TransactionStage.AGREEMENT,
  })
  stage!: TransactionStage;

  @Prop({ required: true })
  totalServiceFee!: number;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  listingAgentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  sellingAgentId!: Types.ObjectId;

  @Prop({ type: Object })
  financialBreakdown?: FinancialBreakdown;

  @Prop({ required: true, enum: TransactionType })
  transactionType!: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
