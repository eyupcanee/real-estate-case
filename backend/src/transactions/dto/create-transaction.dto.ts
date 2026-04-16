import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId!: string;

  @IsNumber()
  @Min(0, { message: 'Total service fee cannot be negative' })
  totalServiceFee!: number;

  @IsMongoId({ message: 'Listing agent ID must be a valid MongoDB ID' })
  @IsNotEmpty()
  listingAgentId!: string;

  @IsMongoId({ message: 'Selling agent ID must be a valid MongoDB ID' })
  @IsNotEmpty()
  sellingAgentId!: string;
}
