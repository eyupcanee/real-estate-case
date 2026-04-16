import { Controller, Get, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.agentsService.findById(id);
  }
}
