import { TicketStatus } from '../enums/ticket-status.enum';

export class TicketAuditLog {
  id: string;
  ticketId: string;
  userId: string;
  oldStatus?: TicketStatus;
  newStatus: TicketStatus;
  justification?: string;
  createdAt: Date;
}
