import { Injectable } from '@nestjs/common';
import { Comment } from '../../../domain/entities/comment.entity';

@Injectable()
export class CreateCommentUseCase {
  async execute(ticketId: string, message: string, userId: string): Promise<Comment> {
    return {
      id: 'comment-1',
      ticketId,
      userId,
      message,
      createdAt: new Date(),
    };
  }
}
