import { Injectable } from '@nestjs/common';
import { ITicketsRepository } from '../../../../application/repositories/ITicketsRepository';
import { Ticket } from '../../../../domain/entities/ticket.entity';
import { PostgresService } from '../postgres.service';
import { TicketStatus } from '../../../../domain/enums/ticket-status.enum';

@Injectable()
export class PostgresTicketsRepository implements ITicketsRepository {
  constructor(private readonly postgresService: PostgresService) {}

  private mapRowToTicket(row: any): Ticket {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      attachmentUrl: row.attachment_url || undefined,
      status: row.status as TicketStatus,
      clientId: row.client_id,
      agentId: row.agent_id || undefined,
      targetDepartmentId: row.target_department_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Ticket | null> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapRowToTicket(res.rows[0]);
  }

  async findAll(filters?: { role?: string; userId?: string; departmentId?: string }): Promise<Ticket[]> {
    const pool = this.postgresService.getPool();
    let queryText = 'SELECT * FROM tickets';
    const queryParams: any[] = [];

    if (filters) {
      if (filters.role === 'CLIENT') {
        queryText += ' WHERE client_id = $1';
        queryParams.push(filters.userId);
      } else if (filters.role === 'AGENT') {
        queryText += ' WHERE target_department_id = $1';
        queryParams.push(filters.departmentId);
      }
    }

    queryText += ' ORDER BY created_at DESC';

    const res = await pool.query(queryText, queryParams);
    return res.rows.map(row => this.mapRowToTicket(row));
  }

  async create(ticket: Ticket): Promise<Ticket> {
    const pool = this.postgresService.getPool();
    await pool.query(
      `INSERT INTO tickets (id, title, description, attachment_url, status, client_id, agent_id, target_department_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.attachmentUrl || null,
        ticket.status,
        ticket.clientId,
        ticket.agentId || null,
        ticket.targetDepartmentId,
        ticket.createdAt,
        ticket.updatedAt,
      ],
    );
    return ticket;
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const pool = this.postgresService.getPool();
    const checkRes = await pool.query('SELECT 1 FROM tickets WHERE id = $1', [ticket.id]);
    if (checkRes.rows.length > 0) {
      await pool.query(
        `UPDATE tickets
         SET title = $2, description = $3, attachment_url = $4, status = $5, client_id = $6, agent_id = $7, target_department_id = $8, updated_at = $9
         WHERE id = $1`,
        [
          ticket.id,
          ticket.title,
          ticket.description,
          ticket.attachmentUrl || null,
          ticket.status,
          ticket.clientId,
          ticket.agentId || null,
          ticket.targetDepartmentId,
          ticket.updatedAt,
        ],
      );
    } else {
      await this.create(ticket);
    }
    return ticket;
  }
}
