import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({
    description: 'Full name of the agent',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'Email address of the agent',
    example: 'john.doe@realestate.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
