import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AgentsModule } from '../agents/agents.module';
import { PropertiesModule } from '../properties/properties.module';
import { Property, PropertySchema } from '../properties/schema/property.schema';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    AuditLogsModule,
    AgentsModule,
    PropertiesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
