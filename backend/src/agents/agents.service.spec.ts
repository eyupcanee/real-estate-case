import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { Agent } from './schemas/agent.schema';

describe('AgentsService', () => {
  let service: AgentsService;

  const mockAgentModel = {
    find: jest.fn().mockReturnValue({
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

  it('should return all agents', async () => {
    const agents = await service.findAll();
    expect(agents).toHaveLength(1);
    expect(agents[0].fullName).toBe('Test Agent');
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
