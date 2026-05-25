import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';

@Injectable()
export class UpdateTicketStatusUseCase {
  async execute(id: string, status: TicketStatus, userId: string, justification?: string): Promise<Ticket> {
    return {
      id,
      title: 'Status Updated Ticket',
      description: 'Description',
      status,
      clientId: 'client-1',
      targetDepartmentId: 'dept-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
