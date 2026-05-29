import { Inject, Injectable } from '@nestjs/common';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import type { INotificationGateway } from '../../gateways/notification.gateway';
import type { ITicketAuditLogsRepository } from '../../repositories/ITicketAuditLogsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';
import { JustificationRequiredException } from '../../../domain/exceptions/justification-required.exception';

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
    @Inject('INotificationGateway') private readonly notificationGateway: INotificationGateway,
    @Inject('ITicketAuditLogsRepository') private readonly auditLogsRepository: ITicketAuditLogsRepository,
  ) {}

  async execute(id: string, status: TicketStatus, userId: string, justification?: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new TicketNotFoundException(id);
    }

    if (status === TicketStatus.INCONSISTENT && (!justification || justification.trim() === '')) {
      throw new JustificationRequiredException();
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date();

    const updatedTicket = await this.ticketsRepository.save(ticket);

    // Record audit log
    await this.auditLogsRepository.create({
      id: Math.random().toString(36).substring(2, 15),
      ticketId: id,
      userId,
      oldStatus,
      newStatus: status,
      justification,
      createdAt: new Date(),
    });

    // Notify involved parties
    const recipientId = userId === ticket.clientId ? ticket.agentId : ticket.clientId;
    if (recipientId) {
      await this.notificationGateway.sendToUser(recipientId, {
        title: `Status do chamado alterado para ${status}`,
        body: justification || `O status do chamado foi atualizado para ${status}`,
      });
    }

    return updatedTicket;
  }
}
