import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStage } from '../schemas/transaction.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStageDto {
  @ApiProperty({
    enum: TransactionStage,
    description: 'The next sequential stage in the transaction workflow',
    example: TransactionStage.EARNEST_MONEY,
  })
  @IsEnum(TransactionStage, {
    message:
      'Invalid stage. Allowed stages are: agreement, earnest_money, title_deed, completed',
  })
  @IsNotEmpty()
  newStage!: TransactionStage;
}
