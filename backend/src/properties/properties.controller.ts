import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties for selection' })
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }
}
