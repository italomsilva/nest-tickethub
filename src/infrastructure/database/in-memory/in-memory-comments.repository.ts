import { Injectable } from '@nestjs/common';
import { ITicketCommentsRepository } from '../../../application/repositories/ITicketCommentsRepository';
import { Comment } from '../../../domain/entities/comment.entity';
import { InMemoryDatabase } from './in-memory-db';

@Injectable()
export class InMemoryTicketCommentsRepository implements ITicketCommentsRepository {
  async findByTicketId(ticketId: string): Promise<Comment[]> {
    return InMemoryDatabase.comments.filter(c => c.ticketId === ticketId);
  }

  async create(comment: Comment): Promise<Comment> {
    InMemoryDatabase.comments.push(comment);
    return comment;
  }
}
