import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiQuery } from '@nestjs/swagger';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update the stage of a transaction' })
  async updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    return this.transactionsService.updateStage(id, updateStageDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get paginated list of transactions with optional page and limit query parameters',
  })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search?: string,
  ) {
    return this.transactionsService.findAll(
      +page || 1,
      +limit || 10,
      search || '',
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an active transaction' })
  cancel(@Param('id') id: string) {
    return this.transactionsService.cancel(id);
  }
}
