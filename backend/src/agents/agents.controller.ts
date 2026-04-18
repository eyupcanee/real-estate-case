import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get paginated list of agents with optional page, limit, and search query parameters',
  })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.agentsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || '',
    );
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get agent details by ID' })
  async findOne(@Param('id') id: string) {
    return this.agentsService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new agent' })
  @Post()
  async create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }
}
