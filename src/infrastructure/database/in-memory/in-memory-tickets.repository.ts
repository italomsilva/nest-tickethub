import { Injectable } from '@nestjs/common';
import { ITicketsRepository } from '../../../application/repositories/ITicketsRepository';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { InMemoryDatabase } from './in-memory-db';

@Injectable()
export class InMemoryTicketsRepository implements ITicketsRepository {
  async findById(id: string): Promise<Ticket | null> {
    const ticket = InMemoryDatabase.tickets.find(t => t.id === id);
    return ticket || null;
  }

  async findAll(filters?: { role?: string; userId?: string; departmentId?: string }): Promise<Ticket[]> {
    let tickets = InMemoryDatabase.tickets;

    if (filters) {
      if (filters.role === 'CLIENT') {
        tickets = tickets.filter(t => t.clientId === filters.userId);
      } else if (filters.role === 'AGENT') {
        tickets = tickets.filter(t => t.targetDepartmentId === filters.departmentId);
      }
    }

    return tickets;
  }

  async create(ticket: Ticket): Promise<Ticket> {
    InMemoryDatabase.tickets.push(ticket);
    return ticket;
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const idx = InMemoryDatabase.tickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      InMemoryDatabase.tickets[idx] = ticket;
    } else {
      InMemoryDatabase.tickets.push(ticket);
    }
    return ticket;
  }
}
