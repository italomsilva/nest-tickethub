import { Inject, Injectable } from '@nestjs/common';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';

@Injectable()
export class FindAllTicketsUseCase {
  constructor(
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
  ) {}

  async execute(user: any): Promise<Ticket[]> {
    const reqUser = user.user || user;
    
    return this.ticketsRepository.findAll({
      role: reqUser.role,
      userId: reqUser.id,
      departmentId: reqUser.departmentId,
    });
  }
}
