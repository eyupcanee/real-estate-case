import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Bosphorus View Villa',
    description: 'Title of the property',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Sariyer, Istanbul',
    description: 'Location details',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    example: 2500000,
    description: 'Market price of the property',
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    enum: ['RESIDENTIAL', 'COMMERCIAL', 'LAND'],
    example: 'RESIDENTIAL',
  })
  @IsEnum(['RESIDENTIAL', 'COMMERCIAL', 'LAND'])
  type!: string;
}
