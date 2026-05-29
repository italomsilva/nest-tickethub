import { Inject, Injectable } from '@nestjs/common';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import type { INotificationGateway } from '../../gateways/notification.gateway';
import type { ITicketAuditLogsRepository } from '../../repositories/ITicketAuditLogsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';
import { SolutionRequiredException } from '../../../domain/exceptions/solution-required.exception';

@Injectable()
export class ResolveTicketUseCase {
  constructor(
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
    @Inject('INotificationGateway') private readonly notificationGateway: INotificationGateway,
    @Inject('ITicketAuditLogsRepository') private readonly auditLogsRepository: ITicketAuditLogsRepository,
  ) {}

  async execute(id: string, agentId: string, solution: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new TicketNotFoundException(id);
    }

    if (!solution || solution.trim() === '') {
      throw new SolutionRequiredException();
    }

    const oldStatus = ticket.status;
    ticket.status = TicketStatus.RESOLVED;
    ticket.updatedAt = new Date();

    const updatedTicket = await this.ticketsRepository.save(ticket);

    // Record audit log
    await this.auditLogsRepository.create({
      id: Math.random().toString(36).substring(2, 15),
      ticketId: id,
      userId: agentId,
      oldStatus,
      newStatus: TicketStatus.RESOLVED,
      createdAt: new Date(),
    });

    // Notify client
    await this.notificationGateway.sendToUser(ticket.clientId, {
      title: 'Chamado resolvido',
      body: `Seu chamado foi resolvido pelo técnico. Solução: ${solution}`,
    });

    return updatedTicket;
  }
}
