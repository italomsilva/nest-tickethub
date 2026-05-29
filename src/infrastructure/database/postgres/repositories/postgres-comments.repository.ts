import { Injectable } from '@nestjs/common';
import { ITicketCommentsRepository } from '../../../../application/repositories/ITicketCommentsRepository';
import { Comment } from '../../../../domain/entities/comment.entity';
import { PostgresService } from '../postgres.service';

@Injectable()
export class PostgresCommentsRepository implements ITicketCommentsRepository {
  constructor(private readonly postgresService: PostgresService) {}

  private mapRowToComment(row: any): Comment {
    return {
      id: row.id,
      ticketId: row.ticket_id,
      userId: row.user_id,
      message: row.message,
      createdAt: row.created_at,
    };
  }

  async findByTicketId(ticketId: string): Promise<Comment[]> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at ASC', [ticketId]);
    return res.rows.map(row => this.mapRowToComment(row));
  }

  async create(comment: Comment): Promise<Comment> {
    const pool = this.postgresService.getPool();
    await pool.query(
      `INSERT INTO comments (id, ticket_id, user_id, message, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        comment.id,
        comment.ticketId,
        comment.userId,
        comment.message,
        comment.createdAt,
      ],
    );
    return comment;
  }
}
