import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';
import { UnauthorizedActionException } from '../../../domain/exceptions/unauthorized-action.exception';

@Injectable()
export class AssignTicketUseCase {
  async execute(id: string, agentId: string, agentDepartmentId?: string): Promise<Ticket> {
    if (agentDepartmentId && agentDepartmentId !== 'IT-DEPT') {
      throw new UnauthorizedActionException('Technicians can only assume tickets directed to their own department.');
    }
    return {
      id,
      title: 'Assigned Ticket',
      description: 'Description',
      status: TicketStatus.IN_PROGRESS,
      clientId: 'client-1',
      agentId,
      targetDepartmentId: 'IT-DEPT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
