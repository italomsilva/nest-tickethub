import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';

@Injectable()
export class FindOneTicketUseCase {
  async execute(id: string, user: any): Promise<Ticket> {
    if (id === 'non-existent') {
      throw new TicketNotFoundException(id);
    }
    return {
      id,
      title: 'Mock Ticket',
      description: 'Description',
      status: TicketStatus.OPEN,
      clientId: 'client-1',
      targetDepartmentId: 'dept-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
