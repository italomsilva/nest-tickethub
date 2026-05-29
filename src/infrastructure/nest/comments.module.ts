import { Module } from '@nestjs/common';
import { CommentsController } from '../../interface/controllers/comments.controller';
import { CreateCommentUseCase } from '../../application/use-cases/comments/create-comment.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/comments/get-comments.use-case';
import { PostgresCommentsRepository } from '../database/postgres/repositories/postgres-comments.repository';
import { PostgresTicketsRepository } from '../database/postgres/repositories/postgres-tickets.repository';
import { HybridNotificationGateway } from '../gateways/hybrid-notification.gateway';

@Module({
  controllers: [CommentsController],
  providers: [
    CreateCommentUseCase,
    GetCommentsUseCase,
    {
      provide: 'ITicketCommentsRepository',
      useClass: PostgresCommentsRepository,
    },
    {
      provide: 'ITicketsRepository',
      useClass: PostgresTicketsRepository,
    },
    {
      provide: 'INotificationGateway',
      useClass: HybridNotificationGateway,
    },
  ],
  exports: [CreateCommentUseCase, GetCommentsUseCase],
})
export class CommentsModule {}
