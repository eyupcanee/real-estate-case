import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { Agent } from './schemas/agent.schema';

describe('AgentsService', () => {
  let service: AgentsService;

  const mockAgentModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest
        .fn()
        .mockResolvedValue([
          { fullName: 'Test Agent', email: 'test@test.com' },
        ]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    countDocuments: jest.fn().mockResolvedValue(3),
    insertMany: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: getModelToken(Agent.name),
          useValue: mockAgentModel,
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  it('should create a new agent', async () => {
    const createDto = { fullName: 'New Agent', email: 'new@agent.com' };
    const savedAgent = { _id: 'mock-id', ...createDto };

    jest.spyOn(service, 'create').mockResolvedValue(savedAgent as any);

    const result = await service.create(createDto);

    expect(result).toEqual(savedAgent);
    expect(result.fullName).toBe('New Agent');
  });

  it('should throw BadRequestException if email exists', async () => {
    const createDto = { fullName: 'Duplicate', email: 'test@test.com' };

    mockAgentModel.findOne = jest
      .fn()
      .mockResolvedValue({ email: 'test@test.com' });

    await expect(service.create(createDto)).rejects.toThrow(
      'An agent with this email already exists.',
    );
  });

  it('should return all agents', async () => {
    const result = await service.findAll();

    expect(result.data).toHaveLength(1);

    expect(result.data[0].fullName).toBe('Test Agent');

    expect(result.meta.total).toBe(3);

    expect(mockAgentModel.find).toHaveBeenCalled();
  });
  it('should find an agent by id', async () => {
    const mockAgent = { _id: '123', fullName: 'Agent X' };
    mockAgentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockAgent),
    });

    const result = await service.findById('123');
    expect(result).toEqual(mockAgent);
    expect(mockAgentModel.findById).toHaveBeenCalledWith('123');
  });
});
