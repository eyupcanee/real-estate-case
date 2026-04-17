import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from './schema/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class PropertiesService implements OnModuleInit {
  private readonly logger = new Logger(PropertiesService.name);
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async onModuleInit() {
    await this.seedProperties();
  }

  async seedProperties() {
    const count = await this.propertyModel.countDocuments();
    if (count === 0) {
      await this.propertyModel.insertMany([
        {
          title: 'Luxury Penthouse',
          location: 'Levent, Istanbul',
          price: 15000000,
          type: 'RESIDENTIAL',
        },
        {
          title: 'Smart Office Tower',
          location: 'Maslak, Istanbul',
          price: 45000000,
          type: 'COMMERCIAL',
        },
        {
          title: 'Zekeriyakoy Garden House',
          location: 'Sariyer, Istanbul',
          price: 12000000,
          type: 'RESIDENTIAL',
        },
      ]);
      this.logger.log('Properties seeded successfully.');
    } else {
      this.logger.log('Properties already exist. Skipping seed operation.');
    }
  }

  async findAll(): Promise<Property[]> {
    return this.propertyModel.find().exec();
  }

  async findById(id: string): Promise<Property | null> {
    return this.propertyModel.findById(id).exec();
  }

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const newProperty = new this.propertyModel(createPropertyDto);
    return await newProperty.save();
  }
}
