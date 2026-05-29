import { Ticket } from '../../../domain/entities/ticket.entity';
import { User } from '../../../domain/entities/user.entity';
import { Department } from '../../../domain/entities/department.entity';
import { Comment } from '../../../domain/entities/comment.entity';
import { TicketAuditLog } from '../../../domain/entities/ticket-audit-log.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class InMemoryDatabase {
  static tickets: Ticket[] = [];
  
  static users: User[] = [
    {
      id: 'client-1',
      name: 'Client User',
      email: 'client@corporativo.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv', // Simulado
      role: UserRole.CLIENT,
      createdAt: new Date(),
    },
    {
      id: 'agent-1',
      name: 'Agent TI',
      email: 'agent-ti@corporativo.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
      role: UserRole.AGENT,
      departmentId: 'IT-DEPT',
      createdAt: new Date(),
    },
    {
      id: 'agent-2',
      name: 'Agent RH',
      email: 'agent-rh@corporativo.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
      role: UserRole.AGENT,
      departmentId: 'RH-DEPT',
      createdAt: new Date(),
    },
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@corporativo.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
      role: UserRole.ADMIN,
      createdAt: new Date(),
    },
  ];

  static departments: Department[] = [
    {
      id: 'IT-DEPT',
      name: 'TI',
      details: 'Tecnologia da Informacao',
      createdAt: new Date(),
    },
    {
      id: 'RH-DEPT',
      name: 'RH',
      details: 'Recursos Humanos',
      createdAt: new Date(),
    },
  ];

  static comments: Comment[] = [];
  
  static auditLogs: TicketAuditLog[] = [];
}
