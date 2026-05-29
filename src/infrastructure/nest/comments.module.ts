import { Module } from '@nestjs/common';
import { CommentsController } from '../../interface/controllers/comments.controller';
import { CreateCommentUseCase } from '../../application/use-cases/comments/create-comment.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/comments/get-comments.use-case';
import { InMemoryTicketCommentsRepository } from '../database/in-memory/in-memory-comments.repository';
import { InMemoryTicketsRepository } from '../database/in-memory/in-memory-tickets.repository';
import { HybridNotificationGateway } from '../gateways/hybrid-notification.gateway';

@Module({
  controllers: [CommentsController],
  providers: [
    CreateCommentUseCase,
    GetCommentsUseCase,
    {
      provide: 'ITicketCommentsRepository',
      useClass: InMemoryTicketCommentsRepository,
    },
    {
      provide: 'ITicketsRepository',
      useClass: InMemoryTicketsRepository,
    },
    {
      provide: 'INotificationGateway',
      useClass: HybridNotificationGateway,
    },
  ],
  exports: [CreateCommentUseCase, GetCommentsUseCase],
})
export class CommentsModule {}
