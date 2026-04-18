import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Return the most recent audit logs' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Return the most recent N audit logs (default: 10)',
  })
  async findAll(@Query('limit') limit?: string) {
    const logLimit = limit ? parseInt(limit, 10) : 10;

    const logs = await this.auditLogsService.findAll(logLimit);

    return logs;
  }
}
