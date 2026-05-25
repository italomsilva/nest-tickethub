import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';

@Injectable()
export class FindAllTicketsUseCase {
  async execute(user: any): Promise<Ticket[]> {
    const reqUser = user.user || user;
    if (reqUser.role === 'CLIENT') {
      return [
        {
          id: 'ticket-1',
          title: 'Mock Ticket 1',
          description: 'Description 1',
          status: TicketStatus.OPEN,
          clientId: reqUser.id,
          targetDepartmentId: 'dept-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } else if (reqUser.role === 'AGENT') {
      return [
        {
          id: 'ticket-1',
          title: 'Mock Ticket 1',
          description: 'Description 1',
          status: TicketStatus.OPEN,
          clientId: 'client-1',
          targetDepartmentId: reqUser.departmentId || 'dept-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } else {
      return [
        {
          id: 'ticket-1',
          title: 'Mock Ticket 1',
          description: 'Description 1',
          status: TicketStatus.OPEN,
          clientId: 'client-1',
          targetDepartmentId: 'dept-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
  }
}
