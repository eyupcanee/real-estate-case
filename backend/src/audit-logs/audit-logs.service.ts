import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { AuditLog } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async logAction(
    entityType: string,
    entityId: string,
    action: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const lastLog = await this.auditLogModel
      .findOne({ entityId, entityType })
      .sort({ createdAt: -1 })
      .exec();

    const previousHash = lastLog ? lastLog.currentHash : 'GENESIS_HASH';
    const dataToHash = `${previousHash}-${entityType}-${entityId}-${action}-${JSON.stringify(payload)}`;
    const currentHash = crypto
      .createHash('sha256')
      .update(dataToHash)
      .digest('hex');

    const newLog = new this.auditLogModel({
      entityType,
      entityId,
      action,
      payload,
      previousHash,
      currentHash,
    });

    await newLog.save();
  }
  async findAll(limit: number = 10) {
    return this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
