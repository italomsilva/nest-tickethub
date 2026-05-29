import { Injectable } from '@nestjs/common';
import { ITicketAuditLogsRepository } from '../../../application/repositories/ITicketAuditLogsRepository';
import { TicketAuditLog } from '../../../domain/entities/ticket-audit-log.entity';
import { InMemoryDatabase } from './in-memory-db';

@Injectable()
export class InMemoryTicketAuditLogsRepository implements ITicketAuditLogsRepository {
  async findByTicketId(ticketId: string): Promise<TicketAuditLog[]> {
    return InMemoryDatabase.auditLogs.filter(l => l.ticketId === ticketId);
  }

  async create(log: TicketAuditLog): Promise<TicketAuditLog> {
    InMemoryDatabase.auditLogs.push(log);
    return log;
  }
}
