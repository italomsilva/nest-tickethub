import { Module } from '@nestjs/common';
import { CommentsController } from '../../interface/controllers/comments.controller';
import { CreateCommentUseCase } from '../../application/use-cases/comments/create-comment.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/comments/get-comments.use-case';

@Module({
  controllers: [CommentsController],
  providers: [CreateCommentUseCase, GetCommentsUseCase],
  exports: [CreateCommentUseCase, GetCommentsUseCase],
})
export class CommentsModule {}
