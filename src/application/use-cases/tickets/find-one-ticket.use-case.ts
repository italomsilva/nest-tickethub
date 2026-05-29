import { Inject, Injectable } from '@nestjs/common';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';
import { UnauthorizedActionException } from '../../../domain/exceptions/unauthorized-action.exception';

@Injectable()
export class FindOneTicketUseCase {
  constructor(
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
  ) {}

  async execute(id: string, user: any): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new TicketNotFoundException(id);
    }

    const reqUser = user.user || user;

    if (reqUser.role === 'CLIENT' && ticket.clientId !== reqUser.id) {
      throw new UnauthorizedActionException('You are not authorized to view this ticket.');
    }

    if (reqUser.role === 'AGENT' && ticket.targetDepartmentId !== reqUser.departmentId) {
      throw new UnauthorizedActionException('You are not authorized to view this ticket.');
    }

    return ticket;
  }
}
