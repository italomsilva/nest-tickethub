import { Inject, Injectable } from '@nestjs/common';
import type { ITicketCommentsRepository } from '../../repositories/ITicketCommentsRepository';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import { Comment } from '../../../domain/entities/comment.entity';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';

@Injectable()
export class GetCommentsUseCase {
  constructor(
    @Inject('ITicketCommentsRepository') private readonly commentsRepository: ITicketCommentsRepository,
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
  ) {}

  async execute(ticketId: string, user: any): Promise<Comment[]> {
    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException(ticketId);
    }
    return this.commentsRepository.findByTicketId(ticketId);
  }
}
