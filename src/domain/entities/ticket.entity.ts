import { TicketStatus } from '../enums/ticket-status.enum';

export class Ticket {
  id: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  status: TicketStatus;
  clientId: string;
  agentId?: string;
  targetDepartmentId: string;
  createdAt: Date;
  updatedAt: Date;
}
