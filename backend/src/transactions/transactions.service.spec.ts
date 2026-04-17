import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionStage } from './schemas/transaction.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AgentsService } from '../agents/agents.service';
import { PropertiesService } from '../properties/properties.service';

interface MockTransaction {
  _id: string;
  stage: TransactionStage;
  totalServiceFee: number;
  listingAgentId: string;
  sellingAgentId: string;
  financialBreakdown?: {
    agencyCut: number;
    listingAgentCut: number;
    sellingAgentCut: number;
  };
  save: jest.Mock;
  toObject: jest.Mock;
}

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockTransactionModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };
  const mockAuditLogsService = {
    logAction: jest.fn(),
  };

  const mockAgentsService = {
    findById: jest.fn(),
  };

  const mockPropertiesService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: AgentsService, useValue: mockAgentsService },
        { provide: PropertiesService, useValue: mockPropertiesService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Creation & Double-Selling Protection', () => {
    it('should throw BadRequestException if property does not exist', async () => {
      mockPropertiesService.findById.mockResolvedValue(null);

      await expect(
        service.create({
          propertyId: 'invalid',
          totalServiceFee: 1000,
          listingAgentId: '1',
          sellingAgentId: '2',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if property has an ACTIVE transaction (Double-Selling)', async () => {
      mockPropertiesService.findById.mockResolvedValue({ _id: 'prop-1' });
      mockTransactionModel.findOne.mockResolvedValue({
        _id: 'existing-tx',
        stage: TransactionStage.AGREEMENT,
      });

      await expect(
        service.create({
          propertyId: 'prop-1',
          totalServiceFee: 1000,
          listingAgentId: '1',
          sellingAgentId: '2',
        }),
      ).rejects.toThrow(
        'This property already has an active transaction in progress.',
      );
    });
  });

  describe('Cancellation Logic', () => {
    it('should throw BadRequestException if transaction is already COMPLETED', async () => {
      const mockTx = { stage: TransactionStage.COMPLETED } as MockTransaction;
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      await expect(service.cancel('some-id')).rejects.toThrow(
        'Cannot cancel a transaction that is already completed.',
      );
    });

    it('should throw BadRequestException if transaction is already CANCELLED', async () => {
      const mockTx = { stage: TransactionStage.CANCELLED } as MockTransaction;
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      await expect(service.cancel('some-id')).rejects.toThrow(
        'Transaction is already cancelled.',
      );
    });

    it('should update stage to CANCELLED and log the action', async () => {
      const mockTx = {
        _id: 'some-id',
        stage: TransactionStage.EARNEST_MONEY,
        save: jest.fn().mockReturnThis(),
        toObject: jest.fn().mockReturnValue({}),
      } as unknown as MockTransaction;

      mockTx.save.mockResolvedValue(mockTx);
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      const result = await service.cancel('some-id');

      expect(result.stage).toEqual(TransactionStage.CANCELLED);
      expect(mockTx.save).toHaveBeenCalled();
      expect(mockAuditLogsService.logAction).toHaveBeenCalledWith(
        'TRANSACTION',
        'some-id',
        'CANCELLED',
        expect.any(Object),
      );
    });
  });

  describe('Stage Transitions & Business Rules', () => {
    it('should throw BadRequestException if transition is invalid (e.g. AGREEMENT to TITLE_DEED)', async () => {
      const mockTx = {
        stage: TransactionStage.AGREEMENT,
        save: jest.fn(),
      } as unknown as MockTransaction;
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      await expect(
        service.updateStage('some-id', {
          newStage: TransactionStage.TITLE_DEED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition (AGREEMENT to EARNEST_MONEY)', async () => {
      const mockTx = {
        _id: 'some-id',
        stage: TransactionStage.AGREEMENT,
        toObject: jest.fn().mockReturnValue({}),
      } as unknown as MockTransaction;
      mockTx.save = jest.fn().mockResolvedValue(mockTx);
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      const result = await service.updateStage('some-id', {
        newStage: TransactionStage.EARNEST_MONEY,
      });

      expect(result.stage).toEqual(TransactionStage.EARNEST_MONEY);
      expect(mockTx.save).toHaveBeenCalled();
      expect(mockAuditLogsService.logAction).toHaveBeenCalled();
    });
  });

  describe('Commission Rules (Financial Breakdown)', () => {
    it('Scenario 1: Listing and Selling agent are the SAME person (100% of the 50% cut)', async () => {
      const mockTx = {
        _id: 'some-id',
        stage: TransactionStage.TITLE_DEED,
        totalServiceFee: 1000,
        listingAgentId: 'agent-1',
        sellingAgentId: 'agent-1',
        financialBreakdown: undefined,
        toObject: jest.fn().mockReturnValue({}),
      } as unknown as MockTransaction;
      mockTx.save = jest.fn().mockResolvedValue(mockTx);
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      await service.updateStage('some-id', {
        newStage: TransactionStage.COMPLETED,
      });

      expect(mockTx.financialBreakdown).toBeDefined();
      expect(mockTx.financialBreakdown?.agencyCut).toBe(500);
      expect(mockTx.financialBreakdown?.listingAgentCut).toBe(500);
      expect(mockTx.financialBreakdown?.sellingAgentCut).toBe(0);
    });

    it('Scenario 2: Listing and Selling agent are DIFFERENT (50% of the 50% cut each)', async () => {
      const mockTx = {
        _id: 'some-id',
        stage: TransactionStage.TITLE_DEED,
        totalServiceFee: 1000,
        listingAgentId: 'agent-1',
        sellingAgentId: 'agent-2',
        financialBreakdown: undefined,
        toObject: jest.fn().mockReturnValue({}),
      } as unknown as MockTransaction;
      mockTx.save = jest.fn().mockResolvedValue(mockTx);
      mockTransactionModel.findById.mockResolvedValue(mockTx);

      await service.updateStage('some-id', {
        newStage: TransactionStage.COMPLETED,
      });

      expect(mockTx.financialBreakdown).toBeDefined();
      expect(mockTx.financialBreakdown?.agencyCut).toBe(500);
      expect(mockTx.financialBreakdown?.listingAgentCut).toBe(250);
      expect(mockTx.financialBreakdown?.sellingAgentCut).toBe(250);
    });
  });
});
