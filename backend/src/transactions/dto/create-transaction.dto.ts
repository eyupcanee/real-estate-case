import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../schemas/transaction.schema';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the property for the transaction',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId!: string;

  @ApiProperty({
    description: 'Total service fee for the deal',
    example: 150000,
  })
  @IsNumber()
  @Min(0, { message: 'Total service fee cannot be negative' })
  totalServiceFee!: number;

  @ApiProperty({
    description: 'The ID of the listing agent',
    example: '645a1f77bcf86cd799439a12',
  })
  @IsMongoId({ message: 'Listing agent ID must be a valid MongoDB ID' })
  @IsNotEmpty()
  listingAgentId!: string;

  @ApiProperty({
    description: 'The ID of the selling agent',
    example: '645a1f77bcf86cd799439b13',
  })
  @IsMongoId({ message: 'Selling agent ID must be a valid MongoDB ID' })
  @IsNotEmpty()
  sellingAgentId!: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the transaction',
    example: TransactionType.SALE,
    enum: TransactionType,
  })
  transactionType!: TransactionType;
}
