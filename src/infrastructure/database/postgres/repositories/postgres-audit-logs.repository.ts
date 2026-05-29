import { Injectable } from '@nestjs/common';
import { ITicketAuditLogsRepository } from '../../../../application/repositories/ITicketAuditLogsRepository';
import { TicketAuditLog } from '../../../../domain/entities/ticket-audit-log.entity';
import { PostgresService } from '../postgres.service';
import { TicketStatus } from '../../../../domain/enums/ticket-status.enum';

@Injectable()
export class PostgresTicketAuditLogsRepository implements ITicketAuditLogsRepository {
  constructor(private readonly postgresService: PostgresService) {}

  private mapRowToAuditLog(row: any): TicketAuditLog {
    return {
      id: row.id,
      ticketId: row.ticket_id,
      userId: row.user_id,
      oldStatus: (row.old_status as TicketStatus) || undefined,
      newStatus: row.new_status as TicketStatus,
      justification: row.justification || undefined,
      createdAt: row.created_at,
    };
  }

  async findByTicketId(ticketId: string): Promise<TicketAuditLog[]> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM ticket_audit_logs WHERE ticket_id = $1 ORDER BY created_at ASC', [ticketId]);
    return res.rows.map(row => this.mapRowToAuditLog(row));
  }

  async create(log: TicketAuditLog): Promise<TicketAuditLog> {
    const pool = this.postgresService.getPool();
    await pool.query(
      `INSERT INTO ticket_audit_logs (id, ticket_id, user_id, old_status, new_status, justification, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        log.id,
        log.ticketId,
        log.userId,
        log.oldStatus || null,
        log.newStatus,
        log.justification || null,
        log.createdAt,
      ],
    );
    return log;
  }
}
