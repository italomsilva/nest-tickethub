import { Module } from '@nestjs/common';
import { TicketsController } from '../../interface/controllers/tickets.controller';
import { CreateTicketUseCase } from '../../application/use-cases/tickets/create-ticket.use-case';
import { FindAllTicketsUseCase } from '../../application/use-cases/tickets/find-all-tickets.use-case';
import { FindOneTicketUseCase } from '../../application/use-cases/tickets/find-one-ticket.use-case';
import { AssignTicketUseCase } from '../../application/use-cases/tickets/assign-ticket.use-case';
import { ResolveTicketUseCase } from '../../application/use-cases/tickets/resolve-ticket.use-case';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/tickets/update-ticket-status.use-case';

@Module({
  controllers: [TicketsController],
  providers: [
    CreateTicketUseCase,
    FindAllTicketsUseCase,
    FindOneTicketUseCase,
    AssignTicketUseCase,
    ResolveTicketUseCase,
    UpdateTicketStatusUseCase,
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
