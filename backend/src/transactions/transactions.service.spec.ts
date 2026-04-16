import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionStage } from './schemas/transaction.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AgentsService } from '../agents/agents.service';

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
  };
  const mockAuditLogsService = {
    logAction: jest.fn(),
  };

  const mockAgentsService = {
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
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      // ÇÖZÜM: any kullanarak TypeScript'i susturuyoruz ve save'i objeye atıyoruz
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
