import { Ticket } from '../../domain/entities/ticket.entity';

export interface ITicketsRepository {
  findById(id: string): Promise<Ticket | null>;
  findAll(filters?: { role?: string; userId?: string; departmentId?: string }): Promise<Ticket[]>;
  create(ticket: Ticket): Promise<Ticket>;
  save(ticket: Ticket): Promise<Ticket>;
}
