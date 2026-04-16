import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStage } from '../schemas/transaction.schema';

export class UpdateStageDto {
  @IsEnum(TransactionStage, {
    message:
      'Invalid stage. Allowed stages are: agreement, earnest_money, title_deed, completed',
  })
  @IsNotEmpty()
  newStage!: TransactionStage;
}
