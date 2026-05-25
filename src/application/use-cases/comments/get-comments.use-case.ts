import { Injectable } from '@nestjs/common';
import { Comment } from '../../../domain/entities/comment.entity';

@Injectable()
export class GetCommentsUseCase {
  async execute(ticketId: string, user: any): Promise<Comment[]> {
    return [
      {
        id: 'comment-1',
        ticketId,
        userId: 'user-1',
        message: 'Mock Message',
        createdAt: new Date(),
      },
    ];
  }
}
