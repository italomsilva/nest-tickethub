import { Inject, Injectable } from '@nestjs/common';
import type { ITicketCommentsRepository } from '../../repositories/ITicketCommentsRepository';
import type { ITicketsRepository } from '../../repositories/ITicketsRepository';
import type { INotificationGateway } from '../../gateways/notification.gateway';
import { Comment } from '../../../domain/entities/comment.entity';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject('ITicketCommentsRepository') private readonly commentsRepository: ITicketCommentsRepository,
    @Inject('ITicketsRepository') private readonly ticketsRepository: ITicketsRepository,
    @Inject('INotificationGateway') private readonly notificationGateway: INotificationGateway,
  ) {}

  async execute(ticketId: string, message: string, userId: string): Promise<Comment> {
    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException(ticketId);
    }

    const comment: Comment = {
      id: Math.random().toString(36).substring(2, 15),
      ticketId,
      userId,
      message,
      createdAt: new Date(),
    };

    const createdComment = await this.commentsRepository.create(comment);

    // Send notifications to involved parties
    if (userId === ticket.clientId && ticket.agentId) {
      await this.notificationGateway.sendToUser(ticket.agentId, {
        title: 'Novo comentário do cliente',
        body: message,
      });
    } else if (ticket.agentId && userId === ticket.agentId) {
      await this.notificationGateway.sendToUser(ticket.clientId, {
        title: 'Nova resposta do suporte',
        body: message,
      });
    }

    return createdComment;
  }
}
