import { Module } from '@nestjs/common';
import { TicketsController } from '../../interface/controllers/tickets.controller';
import { CreateTicketUseCase } from '../../application/use-cases/tickets/create-ticket.use-case';
import { FindAllTicketsUseCase } from '../../application/use-cases/tickets/find-all-tickets.use-case';
import { FindOneTicketUseCase } from '../../application/use-cases/tickets/find-one-ticket.use-case';
import { AssignTicketUseCase } from '../../application/use-cases/tickets/assign-ticket.use-case';
import { ResolveTicketUseCase } from '../../application/use-cases/tickets/resolve-ticket.use-case';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/tickets/update-ticket-status.use-case';
import { PostgresTicketsRepository } from '../database/postgres/repositories/postgres-tickets.repository';
import { PostgresTicketAuditLogsRepository } from '../database/postgres/repositories/postgres-audit-logs.repository';
import { HybridNotificationGateway } from '../gateways/hybrid-notification.gateway';
import { LocalStorageGateway } from '../gateways/local-storage.gateway';
import { AmazonS3StorageGateway } from '../gateways/s3-storage.gateway';

@Module({
  controllers: [TicketsController],
  providers: [
    CreateTicketUseCase,
    FindAllTicketsUseCase,
    FindOneTicketUseCase,
    AssignTicketUseCase,
    ResolveTicketUseCase,
    UpdateTicketStatusUseCase,
    {
      provide: 'ITicketsRepository',
      useClass: PostgresTicketsRepository,
    },
    {
      provide: 'ITicketAuditLogsRepository',
      useClass: PostgresTicketAuditLogsRepository,
    },
    {
      provide: 'INotificationGateway',
      useClass: HybridNotificationGateway,
    },
    {
      provide: 'IStorageGateway',
      useFactory: () => {
        return process.env.STORAGE_PROVIDER === 's3'
          ? new AmazonS3StorageGateway()
          : new LocalStorageGateway();
      },
    },
  ],
  exports: [
    CreateTicketUseCase,
    FindAllTicketsUseCase,
    FindOneTicketUseCase,
    AssignTicketUseCase,
    ResolveTicketUseCase,
    UpdateTicketStatusUseCase,
  ],
})
export class TicketsModule {}
