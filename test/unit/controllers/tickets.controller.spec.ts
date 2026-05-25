import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { TicketsController } from '../../../src/interface/controllers/tickets.controller';
import { CreateTicketUseCase } from '../../../src/application/use-cases/tickets/create-ticket.use-case';
import { FindAllTicketsUseCase } from '../../../src/application/use-cases/tickets/find-all-tickets.use-case';
import { FindOneTicketUseCase } from '../../../src/application/use-cases/tickets/find-one-ticket.use-case';
import { AssignTicketUseCase } from '../../../src/application/use-cases/tickets/assign-ticket.use-case';
import { ResolveTicketUseCase } from '../../../src/application/use-cases/tickets/resolve-ticket.use-case';
import { UpdateTicketStatusUseCase } from '../../../src/application/use-cases/tickets/update-ticket-status.use-case';
import { TicketStatus } from '../../../src/domain/enums/ticket-status.enum';
import { Ticket } from '../../../src/domain/entities/ticket.entity';

interface MockRequestUser {
  id: string;
  role: string;
}

describe('TicketsController (Clean Architecture Unit Tests)', () => {
  let controller: TicketsController;
  
  // Strongly-typed mocks for each individual Use Case
  let createTicketUseCaseMock: jest.Mocked<CreateTicketUseCase>;
  let findAllTicketsUseCaseMock: jest.Mocked<FindAllTicketsUseCase>;
  let findOneTicketUseCaseMock: jest.Mocked<FindOneTicketUseCase>;
  let assignTicketUseCaseMock: jest.Mocked<AssignTicketUseCase>;
  let resolveTicketUseCaseMock: jest.Mocked<ResolveTicketUseCase>;
  let updateTicketStatusUseCaseMock: jest.Mocked<UpdateTicketStatusUseCase>;

  const createMockTicket = (overrides?: Partial<Ticket>): Ticket => ({
    id: 'ticket-uuid-1',
    title: 'Suporte de TI - Email fora do ar',
    description: 'Não consigo conectar ao Outlook corporativo.',
    status: TicketStatus.OPEN,
    clientId: 'client-uuid-123',
    targetDepartmentId: 'it-department-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    // Instantiate senior-level jest.fn() mocks
    createTicketUseCaseMock = { execute: jest.fn() } as any;
    findAllTicketsUseCaseMock = { execute: jest.fn() } as any;
    findOneTicketUseCaseMock = { execute: jest.fn() } as any;
    assignTicketUseCaseMock = { execute: jest.fn() } as any;
    resolveTicketUseCaseMock = { execute: jest.fn() } as any;
    updateTicketStatusUseCaseMock = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        { provide: CreateTicketUseCase, useValue: createTicketUseCaseMock },
        { provide: FindAllTicketsUseCase, useValue: findAllTicketsUseCaseMock },
        { provide: FindOneTicketUseCase, useValue: findOneTicketUseCaseMock },
        { provide: AssignTicketUseCase, useValue: assignTicketUseCaseMock },
        { provide: ResolveTicketUseCase, useValue: resolveTicketUseCaseMock },
        { provide: UpdateTicketStatusUseCase, useValue: updateTicketStatusUseCaseMock },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (POST /tickets)', () => {
    const validDto = {
      title: 'Problema no WiFi',
      description: 'Quedas de conexão constantes no andar 3.',
      departmentId: 'dept-123',
    };

    it('should successfully create a ticket when called by a user with CLIENT role', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const expectedResult = createMockTicket({ clientId: user.id });
      createTicketUseCaseMock.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(validDto, user);

      expect(result).toEqual(expectedResult);
      expect(createTicketUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(createTicketUseCaseMock.execute).toHaveBeenCalledWith(validDto, user.id);
    });

    it('should support ticket creation with optional attachment file from multipart/form-data', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const mockFile = {
        buffer: Buffer.from('image-binary'),
        originalname: 'screenshot.png',
        mimetype: 'image/png',
      };
      
      const expectedResult = createMockTicket({ 
        clientId: user.id,
        attachmentUrl: 'http://aws-s3-bucket/file-uuid.png' 
      });
      createTicketUseCaseMock.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(validDto, user, mockFile);

      expect(result).toEqual(expectedResult);
      expect(createTicketUseCaseMock.execute).toHaveBeenCalledWith({
        ...validDto,
        file: {
          buffer: mockFile.buffer,
          filename: mockFile.originalname,
          mimeType: mockFile.mimetype,
        }
      }, user.id);
    });

    it('should throw ForbiddenException if user role is not CLIENT (e.g. AGENT)', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT' };
      
      await expect(controller.create(validDto, user)).rejects.toThrow(ForbiddenException);
      expect(createTicketUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('findAll (GET /tickets)', () => {
    it('should return a list of tickets matching the query filters', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT' };
      const ticketsList = [createMockTicket(), createMockTicket({ id: 'ticket-uuid-2' })];
      findAllTicketsUseCaseMock.execute.mockResolvedValue(ticketsList);

      const result = await controller.findAll(user);

      expect(result).toEqual(ticketsList);
      expect(findAllTicketsUseCaseMock.execute).toHaveBeenCalledWith(user);
    });
  });

  describe('findOne (GET /tickets/:id)', () => {
    it('should return the ticket details if it exists', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT' };
      const expectedTicket = createMockTicket({ id: 'ticket-1' });
      findOneTicketUseCaseMock.execute.mockResolvedValue(expectedTicket);

      const result = await controller.findOne('ticket-1', user);

      expect(result).toEqual(expectedTicket);
      expect(findOneTicketUseCaseMock.execute).toHaveBeenCalledWith('ticket-1', user);
    });
  });

  describe('assign (PATCH /tickets/:id/assign)', () => {
    it('should successfully assign a technician user with AGENT role', async () => {
      const user: MockRequestUser = { id: 'tech-1', role: 'AGENT' };
      const assignedTicket = createMockTicket({ status: TicketStatus.IN_PROGRESS, agentId: user.id });
      assignTicketUseCaseMock.execute.mockResolvedValue(assignedTicket);

      const result = await controller.assign('ticket-1', user);

      expect(result).toEqual(assignedTicket);
      expect(assignTicketUseCaseMock.execute).toHaveBeenCalledWith('ticket-1', user.id);
    });

    it('should throw ForbiddenException if requester is not an AGENT', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };

      await expect(controller.assign('ticket-1', user)).rejects.toThrow(ForbiddenException);
      expect(assignTicketUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('resolve (PATCH /tickets/:id/resolve)', () => {
    const resolvePayload = { solution: 'Reiniciamos os servidores do Active Directory.' };

    it('should allow AGENT to transition state to RESOLVED with valid explanation description', async () => {
      const user: MockRequestUser = { id: 'tech-1', role: 'AGENT' };
      const resolvedTicket = createMockTicket({ status: TicketStatus.RESOLVED });
      resolveTicketUseCaseMock.execute.mockResolvedValue(resolvedTicket);

      const result = await controller.resolve('ticket-1', resolvePayload, user);

      expect(result).toEqual(resolvedTicket);
      expect(resolveTicketUseCaseMock.execute).toHaveBeenCalledWith('ticket-1', user.id, resolvePayload.solution);
    });

    it('should throw BadRequestException if solution description body is blank or empty', async () => {
      const user: MockRequestUser = { id: 'tech-1', role: 'AGENT' };

      await expect(controller.resolve('ticket-1', { solution: '   ' }, user)).rejects.toThrow(BadRequestException);
      expect(resolveTicketUseCaseMock.execute).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not an AGENT role', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };

      await expect(controller.resolve('ticket-1', resolvePayload, user)).rejects.toThrow(ForbiddenException);
      expect(resolveTicketUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus (PATCH /tickets/:id/status)', () => {
    it('should successfully update status to CLOSED or REOPENED without requiring justification', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const closedTicket = createMockTicket({ status: TicketStatus.CLOSED });
      updateTicketStatusUseCaseMock.execute.mockResolvedValue(closedTicket);

      const result = await controller.updateStatus('ticket-1', { status: TicketStatus.CLOSED }, user);

      expect(result).toEqual(closedTicket);
      expect(updateTicketStatusUseCaseMock.execute).toHaveBeenCalledWith('ticket-1', TicketStatus.CLOSED, user.id, undefined);
    });

    it('should require text justification justification and throw BadRequestException when transition target is INCONSISTENT and justification is blank', async () => {
      const user: MockRequestUser = { id: 'tech-1', role: 'AGENT' };

      await expect(
        controller.updateStatus('ticket-1', { status: TicketStatus.INCONSISTENT, justification: '' }, user),
      ).rejects.toThrow(BadRequestException);
      expect(updateTicketStatusUseCaseMock.execute).not.toHaveBeenCalled();
    });

    it('should allow transitioning status to INCONSISTENT if justification text justification parameter is filled in', async () => {
      const user: MockRequestUser = { id: 'tech-1', role: 'AGENT' };
      const inconsistentTicket = createMockTicket({ status: TicketStatus.INCONSISTENT });
      updateTicketStatusUseCaseMock.execute.mockResolvedValue(inconsistentTicket);

      const result = await controller.updateStatus(
        'ticket-1',
        { status: TicketStatus.INCONSISTENT, justification: 'Erro de duplicidade comprovado.' },
        user,
      );

      expect(result).toEqual(inconsistentTicket);
      expect(updateTicketStatusUseCaseMock.execute).toHaveBeenCalledWith(
        'ticket-1',
        TicketStatus.INCONSISTENT,
        user.id,
        'Erro de duplicidade comprovado.',
      );
    });
  });
});
