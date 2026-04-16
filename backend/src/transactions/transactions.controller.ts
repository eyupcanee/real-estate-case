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

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Patch(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    return this.transactionsService.updateStage(id, updateStageDto);
  }

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.transactionsService.findAll(+page || 1, +limit || 10);
  }
}
