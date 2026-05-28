import { Comment } from '../../domain/entities/comment.entity';

export interface ITicketCommentsRepository {
  findByTicketId(ticketId: string): Promise<Comment[]>;
  create(comment: Comment): Promise<Comment>;
}
