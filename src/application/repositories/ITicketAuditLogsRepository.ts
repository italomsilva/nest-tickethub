import { TicketAuditLog } from '../../domain/entities/ticket-audit-log.entity';

export interface ITicketAuditLogsRepository {
  findByTicketId(ticketId: string): Promise<TicketAuditLog[]>;
  create(log: TicketAuditLog): Promise<TicketAuditLog>;
}
