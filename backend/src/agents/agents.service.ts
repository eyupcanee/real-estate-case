import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent } from './schemas/agent.schema';

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

  async findAll() {
    return this.agentModel.find().exec();
  }

  async findById(id: string) {
    return this.agentModel.findById(id).exec();
  }
}
