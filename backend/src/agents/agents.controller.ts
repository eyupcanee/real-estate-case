import { Controller, Get, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agents for selection' })
  async findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent details by ID' })
  async findOne(@Param('id') id: string) {
    return this.agentsService.findById(id);
  }
}
