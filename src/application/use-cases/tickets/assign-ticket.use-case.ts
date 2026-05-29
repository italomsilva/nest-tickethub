import { Inject, Injectable } from '@nestjs/common';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import type { INotificationGateway } from '../../gateways/notification.gateway';
import type { ITicketAuditLogsRepository } from '../../repositories/ITicketAuditLogsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';
import { UnauthorizedActionException } from '../../../domain/exceptions/unauthorized-action.exception';

@Injectable()
export class AssignTicketUseCase {
  constructor(
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
    @Inject('INotificationGateway') private readonly notificationGateway: INotificationGateway,
    @Inject('ITicketAuditLogsRepository') private readonly auditLogsRepository: ITicketAuditLogsRepository,
  ) {}

  async execute(id: string, agentId: string, agentDepartmentId?: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new TicketNotFoundException(id);
    }

    // Support technicians can only assume tickets directed to their own department
    // Note: If agentDepartmentId is "IT-DEPT" and targetDepartmentId is "IT-DEPT", they are compatible.
    if (agentDepartmentId && ticket.targetDepartmentId !== agentDepartmentId) {
      throw new UnauthorizedActionException(
        'Technicians can only assume tickets directed to their own department.'
      );
    }

    const oldStatus = ticket.status;
    ticket.status = TicketStatus.IN_PROGRESS;
    ticket.agentId = agentId;
    ticket.updatedAt = new Date();

    const updatedTicket = await this.ticketsRepository.save(ticket);

    // Record audit log
    await this.auditLogsRepository.create({
      id: Math.random().toString(36).substring(2, 15),
      ticketId: id,
      userId: agentId,
      oldStatus,
      newStatus: TicketStatus.IN_PROGRESS,
      createdAt: new Date(),
    });

    // Notify client
    await this.notificationGateway.sendToUser(ticket.clientId, {
      title: 'Chamado em andamento',
      body: `Seu chamado foi assumido pelo técnico responsável.`,
    });

    return updatedTicket;
  }
}
