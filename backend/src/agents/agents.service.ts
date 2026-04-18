import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService implements OnModuleInit {
  private readonly logger = new Logger(AgentsService.name);

  constructor(@InjectModel(Agent.name) private agentModel: Model<Agent>) {}

  async onModuleInit() {
    await this.seedAgents();
  }

  private async seedAgents() {
    const count = await this.agentModel.countDocuments();
    if (count === 0) {
      this.logger.log('Seeding agents...');
      await this.agentModel.insertMany([
        { fullName: 'Ahmet Yılmaz', email: 'ahmet@realestate.com' },
        { fullName: 'Ayşe Kaya', email: 'ayse@realestate.com' },
        { fullName: 'Mehmet Demir', email: 'mehmet@realestate.com' },
        { fullName: 'Eyüp Can Esen', email: 'eyupcanesen@realestate.com' },
      ]);
      this.logger.log('Agents seeded successfully.');
    } else {
      this.logger.log('Agents already exist. Skipping seed operation.');
    }
  }

  async findAll(page: number = 1, limit: number = 10, search: string = '') {
    const query: Record<string, unknown> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.agentModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.agentModel.countDocuments(query),
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

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const existingAgent = await this.agentModel.findOne({
      email: createAgentDto.email,
    });
    if (existingAgent) {
      throw new BadRequestException('An agent with this email already exists.');
    }

    const newAgent = new this.agentModel(createAgentDto);
    return await newAgent.save();
  }

  async findById(id: string) {
    return this.agentModel.findById(id).exec();
  }
}
