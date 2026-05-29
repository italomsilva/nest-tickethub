import { Inject, Injectable } from '@nestjs/common';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import type { IStorageGateway } from '../../gateways/storage.gateway';
import type { INotificationGateway } from '../../gateways/notification.gateway';
import type { ITicketAuditLogsRepository } from '../../repositories/ITicketAuditLogsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
    @Inject('IStorageGateway') private readonly storageGateway: IStorageGateway,
    @Inject('INotificationGateway') private readonly notificationGateway: INotificationGateway,
    @Inject('ITicketAuditLogsRepository') private readonly auditLogsRepository: ITicketAuditLogsRepository,
  ) {}

  async execute(dto: any, clientId: string): Promise<Ticket> {
    let attachmentUrl: string | undefined;

    if (dto.file) {
      attachmentUrl = await this.storageGateway.upload({
        buffer: dto.file.buffer,
        filename: dto.file.filename,
        mimeType: dto.file.mimeType,
      });
    }

    const ticket: Ticket = {
      id: Math.random().toString(36).substring(2, 15),
      title: dto.title,
      description: dto.description,
      status: TicketStatus.OPEN,
      clientId,
      targetDepartmentId: dto.departmentId,
      attachmentUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdTicket = await this.ticketsRepository.create(ticket);

    // Record audit log
    await this.auditLogsRepository.create({
      id: Math.random().toString(36).substring(2, 15),
      ticketId: createdTicket.id,
      userId: clientId,
      newStatus: TicketStatus.OPEN,
      createdAt: new Date(),
    });

    // Notify target department
    await this.notificationGateway.sendToDepartment(dto.departmentId, {
      title: 'Novo chamado aberto',
      body: `Um novo chamado foi aberto: "${dto.title}"`,
    });

    return createdTicket;
  }
}
