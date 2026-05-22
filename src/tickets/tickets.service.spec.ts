import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  TicketsService,
  TicketStatus,
  Ticket,
  User,
  TicketRepository,
  AuditLogService,
  UsersService,
} from './tickets.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository: jest.Mocked<TicketRepository>;
  let auditLogService: jest.Mocked<AuditLogService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TicketRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            logStatusChange: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepository = module.get(TicketRepository);
    auditLogService = module.get(AuditLogService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockTicket = (status: TicketStatus, targetDept = 'IT-DEPT'): Ticket => ({
    id: 'ticket-123',
    title: 'Hardware issue',
    description: 'My laptop screen is flickering.',
    targetDepartmentId: targetDept,
    status,
    attachmentUrl: 'http://example.com/img.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockUser = (id: string, role: 'AGENT' | 'CUSTOMER', departmentId?: string): User => ({
    id,
    role,
    departmentId,
  });

  describe('create', () => {
    it('should successfully create a ticket and initialize status to OPEN', async () => {
      const dto = {
        title: 'Hardware issue',
        description: 'My laptop screen is flickering.',
        targetDepartmentId: 'IT-DEPT',
        attachmentUrl: 'http://example.com/img.png',
      };
      const userId = 'user-123';
      const expectedTicket = mockTicket(TicketStatus.OPEN);

      ticketRepository.create.mockReturnValue(expectedTicket);
      ticketRepository.save.mockResolvedValue(expectedTicket);
      auditLogService.logStatusChange.mockResolvedValue(undefined);

      const result = await service.create(dto, userId);

      expect(ticketRepository.create).toHaveBeenCalledWith({
        ...dto,
        status: TicketStatus.OPEN,
      });
      expect(ticketRepository.save).toHaveBeenCalledWith(expectedTicket);
      expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
        userId,
        null,
        TicketStatus.OPEN,
        expect.any(Date),
      );
      expect(result).toEqual(expectedTicket);
    });

    it('should create a ticket without an optional attachmentUrl', async () => {
      const dto = {
        title: 'Hardware issue',
        description: 'My laptop screen is flickering.',
        targetDepartmentId: 'IT-DEPT',
      };
      const userId = 'user-123';
      const expectedTicket: Ticket = {
        ...mockTicket(TicketStatus.OPEN),
        attachmentUrl: undefined,
      };

      ticketRepository.create.mockReturnValue(expectedTicket);
      ticketRepository.save.mockResolvedValue(expectedTicket);

      const result = await service.create(dto, userId);

      expect(ticketRepository.create).toHaveBeenCalledWith({
        ...dto,
        status: TicketStatus.OPEN,
      });
      expect(result.attachmentUrl).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    describe('Common Validations', () => {
      it('should throw NotFoundException if ticket does not exist', async () => {
        ticketRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateStatus('invalid-id', TicketStatus.IN_PROGRESS, 'user-1'),
        ).rejects.toThrow(NotFoundException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException if user does not exist', async () => {
        const ticket = mockTicket(TicketStatus.OPEN);
        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(null);

        await expect(
          service.updateStatus(ticket.id, TicketStatus.IN_PROGRESS, 'invalid-user'),
        ).rejects.toThrow(NotFoundException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });
    });

    describe('Allowed Transitions', () => {
      it('should transition from OPEN to IN_PROGRESS when assigned by an agent', async () => {
        const ticket = mockTicket(TicketStatus.OPEN);
        const agent = mockUser('agent-1', 'AGENT', 'IT-DEPT');
        const updatedTicket = { ...ticket, status: TicketStatus.IN_PROGRESS };

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);
        ticketRepository.save.mockResolvedValue(updatedTicket);

        const result = await service.updateStatus(ticket.id, TicketStatus.IN_PROGRESS, agent.id);

        expect(ticketRepository.save).toHaveBeenCalledWith(updatedTicket);
        expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
          agent.id,
          TicketStatus.OPEN,
          TicketStatus.IN_PROGRESS,
          expect.any(Date),
        );
        expect(result.status).toBe(TicketStatus.IN_PROGRESS);
      });

      it('should transition from IN_PROGRESS to RESOLVED when updated by an agent', async () => {
        const ticket = mockTicket(TicketStatus.IN_PROGRESS);
        const agent = mockUser('agent-1', 'AGENT', 'IT-DEPT');
        const updatedTicket = { ...ticket, status: TicketStatus.RESOLVED };

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);
        ticketRepository.save.mockResolvedValue(updatedTicket);

        const result = await service.updateStatus(ticket.id, TicketStatus.RESOLVED, agent.id);

        expect(ticketRepository.save).toHaveBeenCalledWith(updatedTicket);
        expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
          agent.id,
          TicketStatus.IN_PROGRESS,
          TicketStatus.RESOLVED,
          expect.any(Date),
        );
        expect(result.status).toBe(TicketStatus.RESOLVED);
      });

      it('should transition from RESOLVED to CLOSED', async () => {
        const ticket = mockTicket(TicketStatus.RESOLVED);
        const customer = mockUser('customer-1', 'CUSTOMER');
        const updatedTicket = { ...ticket, status: TicketStatus.CLOSED };

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(customer);
        ticketRepository.save.mockResolvedValue(updatedTicket);

        const result = await service.updateStatus(ticket.id, TicketStatus.CLOSED, customer.id);

        expect(ticketRepository.save).toHaveBeenCalledWith(updatedTicket);
        expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
          customer.id,
          TicketStatus.RESOLVED,
          TicketStatus.CLOSED,
          expect.any(Date),
        );
        expect(result.status).toBe(TicketStatus.CLOSED);
      });

      it('should transition from RESOLVED to REOPENED', async () => {
        const ticket = mockTicket(TicketStatus.RESOLVED);
        const customer = mockUser('customer-1', 'CUSTOMER');
        const updatedTicket = { ...ticket, status: TicketStatus.REOPENED };

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(customer);
        ticketRepository.save.mockResolvedValue(updatedTicket);

        const result = await service.updateStatus(ticket.id, TicketStatus.REOPENED, customer.id);

        expect(ticketRepository.save).toHaveBeenCalledWith(updatedTicket);
        expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
          customer.id,
          TicketStatus.RESOLVED,
          TicketStatus.REOPENED,
          expect.any(Date),
        );
        expect(result.status).toBe(TicketStatus.REOPENED);
      });
    });

    describe('Invalid Transitions', () => {
      const invalidTransitions = [
        { from: TicketStatus.OPEN, to: TicketStatus.RESOLVED },
        { from: TicketStatus.OPEN, to: TicketStatus.CLOSED },
        { from: TicketStatus.OPEN, to: TicketStatus.REOPENED },
        { from: TicketStatus.IN_PROGRESS, to: TicketStatus.CLOSED },
        { from: TicketStatus.IN_PROGRESS, to: TicketStatus.REOPENED },
        { from: TicketStatus.RESOLVED, to: TicketStatus.IN_PROGRESS },
        { from: TicketStatus.CLOSED, to: TicketStatus.OPEN },
        { from: TicketStatus.CLOSED, to: TicketStatus.IN_PROGRESS },
        { from: TicketStatus.CLOSED, to: TicketStatus.RESOLVED },
        { from: TicketStatus.CLOSED, to: TicketStatus.REOPENED },
        { from: TicketStatus.CLOSED, to: TicketStatus.INCONSISTENT },
      ];

      invalidTransitions.forEach(({ from, to }) => {
        it(`should throw BadRequestException when transitioning from ${from} to ${to}`, async () => {
          const ticket = mockTicket(from);
          const user = mockUser('user-1', 'AGENT', 'IT-DEPT');

          ticketRepository.findOne.mockResolvedValue(ticket);
          usersService.findOne.mockResolvedValue(user);

          await expect(
            service.updateStatus(ticket.id, to, user.id, 'Justification test'),
          ).rejects.toThrow(BadRequestException);

          expect(ticketRepository.save).not.toHaveBeenCalled();
          expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
        });
      });

      it('should throw ForbiddenException if a customer tries to transition OPEN to IN_PROGRESS', async () => {
        const ticket = mockTicket(TicketStatus.OPEN);
        const customer = mockUser('customer-1', 'CUSTOMER');

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(customer);

        await expect(
          service.updateStatus(ticket.id, TicketStatus.IN_PROGRESS, customer.id),
        ).rejects.toThrow(ForbiddenException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });
    });

    describe('INCONSISTENT Business Rule (CRITICAL)', () => {
      it('should transition from OPEN to INCONSISTENT with justification by target department agent', async () => {
        const ticket = mockTicket(TicketStatus.OPEN, 'IT-DEPT');
        const agent = mockUser('agent-1', 'AGENT', 'IT-DEPT');
        const updatedTicket = { ...ticket, status: TicketStatus.INCONSISTENT };

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);
        ticketRepository.save.mockResolvedValue(updatedTicket);

        const justification = 'Ticket has invalid logs provided.';
        const result = await service.updateStatus(
          ticket.id,
          TicketStatus.INCONSISTENT,
          agent.id,
          justification,
        );

        expect(ticketRepository.save).toHaveBeenCalledWith(updatedTicket);
        expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
          agent.id,
          TicketStatus.OPEN,
          TicketStatus.INCONSISTENT,
          expect.any(Date),
        );
        expect(result.status).toBe(TicketStatus.INCONSISTENT);
      });

      it('should transition from IN_PROGRESS to INCONSISTENT with justification by target department agent', async () => {
        const ticket = mockTicket(TicketStatus.IN_PROGRESS, 'IT-DEPT');
        const agent = mockUser('agent-1', 'AGENT', 'IT-DEPT');
        const updatedTicket = { ...ticket, status: TicketStatus.INCONSISTENT };

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);
        ticketRepository.save.mockResolvedValue(updatedTicket);

        const justification = 'Logs do not match reported behavior.';
        const result = await service.updateStatus(
          ticket.id,
          TicketStatus.INCONSISTENT,
          agent.id,
          justification,
        );

        expect(ticketRepository.save).toHaveBeenCalledWith(updatedTicket);
        expect(auditLogService.logStatusChange).toHaveBeenCalledWith(
          agent.id,
          TicketStatus.IN_PROGRESS,
          TicketStatus.INCONSISTENT,
          expect.any(Date),
        );
        expect(result.status).toBe(TicketStatus.INCONSISTENT);
      });

      it('should throw BadRequestException if transitioning to INCONSISTENT without justification', async () => {
        const ticket = mockTicket(TicketStatus.OPEN, 'IT-DEPT');
        const agent = mockUser('agent-1', 'AGENT', 'IT-DEPT');

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);

        await expect(
          service.updateStatus(ticket.id, TicketStatus.INCONSISTENT, agent.id),
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.updateStatus(ticket.id, TicketStatus.INCONSISTENT, agent.id, ''),
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.updateStatus(ticket.id, TicketStatus.INCONSISTENT, agent.id, '   '),
        ).rejects.toThrow(BadRequestException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });

      it('should throw ForbiddenException if agent is not from the target department', async () => {
        const ticket = mockTicket(TicketStatus.OPEN, 'IT-DEPT');
        const agent = mockUser('agent-2', 'AGENT', 'HR-DEPT'); // Different department

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);

        await expect(
          service.updateStatus(
            ticket.id,
            TicketStatus.INCONSISTENT,
            agent.id,
            'Wrong department test',
          ),
        ).rejects.toThrow(ForbiddenException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });

      it('should throw ForbiddenException if user is a CUSTOMER', async () => {
        const ticket = mockTicket(TicketStatus.OPEN, 'IT-DEPT');
        const customer = mockUser('customer-1', 'CUSTOMER');

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(customer);

        await expect(
          service.updateStatus(ticket.id, TicketStatus.INCONSISTENT, customer.id, 'Customer test'),
        ).rejects.toThrow(ForbiddenException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException if trying to transition to INCONSISTENT after it is resolved', async () => {
        const ticket = mockTicket(TicketStatus.RESOLVED, 'IT-DEPT');
        const agent = mockUser('agent-1', 'AGENT', 'IT-DEPT');

        ticketRepository.findOne.mockResolvedValue(ticket);
        usersService.findOne.mockResolvedValue(agent);

        await expect(
          service.updateStatus(
            ticket.id,
            TicketStatus.INCONSISTENT,
            agent.id,
            'Already resolved test',
          ),
        ).rejects.toThrow(BadRequestException);

        expect(ticketRepository.save).not.toHaveBeenCalled();
        expect(auditLogService.logStatusChange).not.toHaveBeenCalled();
      });
    });
  });
});
