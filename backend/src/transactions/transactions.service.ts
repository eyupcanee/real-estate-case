import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Transaction, TransactionStage } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AgentsService } from '../agents/agents.service';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class TransactionsService {
  private readonly STAGE_TRANSITIONS = {
    [TransactionStage.AGREEMENT]: TransactionStage.EARNEST_MONEY,
    [TransactionStage.EARNEST_MONEY]: TransactionStage.TITLE_DEED,
    [TransactionStage.TITLE_DEED]: TransactionStage.COMPLETED,
  };

  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,

    private readonly auditLogsService: AuditLogsService,
    private readonly agentsService: AgentsService,
    private readonly propertiesService: PropertiesService,
  ) {}

  async create(createDto: CreateTransactionDto): Promise<Transaction> {
    const property = await this.propertiesService.findById(
      createDto.propertyId,
    );
    if (!property) {
      throw new BadRequestException('The specified property does not exist.');
    }

    const activeTransaction = await this.transactionModel.findOne({
      propertyId: createDto.propertyId,
      stage: {
        $nin: [TransactionStage.COMPLETED, TransactionStage.CANCELLED],
      },
    });

    if (activeTransaction) {
      throw new BadRequestException(
        'This property already has an active transaction in progress.',
      );
    }

    const listingAgent = await this.agentsService.findById(
      createDto.listingAgentId,
    );
    const sellingAgent = await this.agentsService.findById(
      createDto.sellingAgentId,
    );

    if (!listingAgent || !sellingAgent) {
      throw new BadRequestException(
        'Invalid agent IDs provided. Please ensure both listing and selling agents exist.',
      );
    }
    const transaction = new this.transactionModel({
      ...createDto,
      stage: TransactionStage.AGREEMENT,
    });

    const savedTransaction = await transaction.save();

    await this.auditLogsService.logAction(
      'TRANSACTION',
      savedTransaction._id.toString(),
      'CREATED',
      savedTransaction.toObject(),
    );

    return savedTransaction;
  }

  async updateStage(
    id: string,
    updateStageDto: UpdateStageDto,
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) throw new NotFoundException('Transaction not found');

    const { newStage } = updateStageDto;

    if (transaction.stage === TransactionStage.COMPLETED) {
      throw new BadRequestException('Cannot update a completed transaction.');
    }

    const allowedNextStage = this.STAGE_TRANSITIONS[transaction.stage];
    if (newStage !== allowedNextStage) {
      throw new BadRequestException(
        `Invalid transition. You can only move from ${transaction.stage} to ${allowedNextStage}.`,
      );
    }

    if (newStage === TransactionStage.COMPLETED) {
      transaction.financialBreakdown = this.calculateCommission(transaction);
    }

    transaction.stage = newStage;
    const updatedTransaction = await transaction.save();

    await this.auditLogsService.logAction(
      'TRANSACTION',
      updatedTransaction._id.toString(),
      `STAGE_MOVED_TO_${newStage.toUpperCase()}`,
      updatedTransaction.toObject(),
    );

    return updatedTransaction;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.transactionModel
        .find()
        .populate('propertyId', 'title location price type')
        .populate('listingAgentId', 'fullName')
        .populate('sellingAgentId', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancel(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) throw new NotFoundException('Transaction not found');

    if (transaction.stage === TransactionStage.COMPLETED) {
      throw new BadRequestException(
        'Cannot cancel a transaction that is already completed.',
      );
    }

    if (transaction.stage === TransactionStage.CANCELLED) {
      throw new BadRequestException('Transaction is already cancelled.');
    }

    transaction.stage = TransactionStage.CANCELLED;

    const updatedTransaction = await transaction.save();

    await this.auditLogsService.logAction(
      'TRANSACTION',
      updatedTransaction._id.toString(),
      'CANCELLED',
      updatedTransaction.toObject(),
    );

    return updatedTransaction;
  }

  private calculateCommission(transaction: Transaction) {
    const totalFee = transaction.totalServiceFee;
    const agencyCut = totalFee * 0.5;

    let listingAgentCut = 0;
    let sellingAgentCut = 0;

    if (transaction.listingAgentId === transaction.sellingAgentId) {
      listingAgentCut = totalFee * 0.5;
      sellingAgentCut = 0;
    } else {
      listingAgentCut = totalFee * 0.25;
      sellingAgentCut = totalFee * 0.25;
    }

    return { agencyCut, listingAgentCut, sellingAgentCut };
  }
}
