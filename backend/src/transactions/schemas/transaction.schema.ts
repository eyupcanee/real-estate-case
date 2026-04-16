import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TransactionStage {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
}

class FinancialBreakdown {
  agencyCut!: number;
  listingAgentCut!: number;
  sellingAgentCut!: number;
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  propertyId!: string;

  @Prop({
    required: true,
    enum: TransactionStage,
    default: TransactionStage.AGREEMENT,
  })
  stage!: TransactionStage;

  @Prop({ required: true })
  totalServiceFee!: number;

  @Prop({ required: true })
  listingAgentId!: string;

  @Prop({ required: true })
  sellingAgentId!: string;

  @Prop({ type: Object })
  financialBreakdown?: FinancialBreakdown;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
