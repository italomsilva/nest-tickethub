import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';

@Injectable()
export class ResolveTicketUseCase {
  async execute(id: string, agentId: string, solution: string): Promise<Ticket> {
    return {
      id,
      title: 'Resolved Ticket',
      description: 'Description',
      status: TicketStatus.RESOLVED,
      clientId: 'client-1',
      agentId,
      targetDepartmentId: 'dept-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
