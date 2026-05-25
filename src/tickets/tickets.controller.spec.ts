import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService, TicketStatus, Ticket } from './tickets.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

interface MockRequestUser {
  id: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  departmentId?: string;
}

describe('TicketsController (Senior Unit Tests)', () => {
  let controller: TicketsController;
  let service: jest.Mocked<TicketsService>;

  // Factory pattern for robust, type-safe entity construction
  const createMockTicket = (
    id: string,
    status: TicketStatus,
    targetDepartmentId = 'IT-DEPT',
  ): Ticket => ({
    id,
    title: 'Monitor flickering',
    description: 'My secondary screen does not turn on.',
    targetDepartmentId,
    status,
    attachmentUrl: 'http://aws.s3.com/attachments/mon.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: {
            create: jest.fn(),
            updateStatus: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get(TicketsService) as jest.Mocked<TicketsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (POST /tickets)', () => {
    const validDto = {
      title: 'Monitor flickering',
      description: 'My secondary screen does not turn on.',
      targetDepartmentId: 'IT-DEPT',
    };

    it('should successfully create a ticket when called by a user with CLIENT role', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const expectedTicket = createMockTicket('t-1', TicketStatus.OPEN);
      service.create.mockResolvedValue(expectedTicket);

      const result = await controller.create(validDto, user);

      expect(service.create).toHaveBeenCalledWith(validDto, user.id);
      expect(result).toEqual(expectedTicket);
    });

    it('should support ticket creation with optional attachment file from multipart/form-data', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const file: Express.Multer.File = {
        fieldname: 'photo',
        originalname: 'screen.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const expectedTicket = createMockTicket('t-1', TicketStatus.OPEN);
      service.create.mockResolvedValue(expectedTicket);

      // Overloaded create accepts optional file details
      const result = await controller.create(
        {
          ...validDto,
          file: {
            buffer: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
          },
        },
        user,
      );

      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(expectedTicket);
    });

    it('should throw ForbiddenException if user role is not CLIENT (e.g. AGENT)', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT' };

      await expect(controller.create(validDto, user)).rejects.toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll (GET /tickets)', () => {
    it('should isolate and return only client-specific tickets when user is CLIENT', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const expectedTickets = [createMockTicket('t-1', TicketStatus.OPEN)];
      service.findAll.mockResolvedValue(expectedTickets);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedTickets);
    });

    it('should filter queue and return department-specific tickets when user is AGENT', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT', departmentId: 'IT-DEPT' };
      const expectedTickets = [createMockTicket('t-1', TicketStatus.IN_PROGRESS, 'IT-DEPT')];
      service.findAll.mockResolvedValue(expectedTickets);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedTickets);
    });

    it('should return all tickets globally without filtration when user is ADMIN', async () => {
      const user: MockRequestUser = { id: 'admin-1', role: 'ADMIN' };
      const expectedTickets = [
        createMockTicket('t-1', TicketStatus.OPEN, 'IT-DEPT'),
        createMockTicket('t-2', TicketStatus.OPEN, 'HR-DEPT'),
      ];
      service.findAll.mockResolvedValue(expectedTickets);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedTickets);
    });
  });

  describe('findOne (GET /tickets/:id)', () => {
    it('should successfully return ticket details if authorized', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const expectedTicket = createMockTicket('t-1', TicketStatus.OPEN);
      service.findOne.mockResolvedValue(expectedTicket);

      const result = await controller.findOne('t-1', user);

      expect(service.findOne).toHaveBeenCalledWith('t-1', user);
      expect(result).toEqual(expectedTicket);
    });

    it('should propagate NotFoundException if the ticket is not found in database', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      service.findOne.mockRejectedValue(new NotFoundException('Ticket not found'));

      await expect(controller.findOne('non-existent', user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign (PATCH /tickets/:id/assign)', () => {
    it('should successfully update ticket status to IN_PROGRESS when assigned by AGENT', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT', departmentId: 'IT-DEPT' };
      const expectedTicket = createMockTicket('t-1', TicketStatus.IN_PROGRESS, 'IT-DEPT');
      service.updateStatus.mockResolvedValue(expectedTicket);

      const result = await controller.assign('t-1', user);

      expect(service.updateStatus).toHaveBeenCalledWith('t-1', TicketStatus.IN_PROGRESS, user.id);
      expect(result).toEqual(expectedTicket);
    });

    it('should throw ForbiddenException if assign is attempted by a non-AGENT role', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };

      await expect(controller.assign('t-1', user)).rejects.toThrow(ForbiddenException);
      expect(service.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('resolve (PATCH /tickets/:id/resolve)', () => {
    const validBody = { solution: 'Reconnected loose HDMI cable.' };

    it('should successfully mark ticket as RESOLVED when resolved by an AGENT with solution', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT', departmentId: 'IT-DEPT' };
      const expectedTicket = createMockTicket('t-1', TicketStatus.RESOLVED, 'IT-DEPT');
      service.updateStatus.mockResolvedValue(expectedTicket);

      const result = await controller.resolve('t-1', validBody, user);

      expect(service.updateStatus).toHaveBeenCalledWith(
        't-1',
        TicketStatus.RESOLVED,
        user.id,
        validBody.solution,
      );
      expect(result).toEqual(expectedTicket);
    });

    it('should throw BadRequestException if solution description is empty or whitespace only', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT' };
      const invalidBody = { solution: '    ' };

      await expect(controller.resolve('t-1', invalidBody, user)).rejects.toThrow(BadRequestException);
      expect(service.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus (PATCH /tickets/:id/status)', () => {
    it('should allow CLIENT to close their resolved ticket', async () => {
      const user: MockRequestUser = { id: 'client-1', role: 'CLIENT' };
      const body = { status: TicketStatus.CLOSED };
      const expectedTicket = createMockTicket('t-1', TicketStatus.CLOSED);
      service.updateStatus.mockResolvedValue(expectedTicket);

      const result = await controller.updateStatus('t-1', body, user);

      expect(service.updateStatus).toHaveBeenCalledWith('t-1', TicketStatus.CLOSED, user.id, undefined);
      expect(result).toEqual(expectedTicket);
    });

    it('should transition status to INCONSISTENT if justification is provided by AGENT', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT', departmentId: 'IT-DEPT' };
      const body = { status: TicketStatus.INCONSISTENT, justification: 'Duplicate ticket' };
      const expectedTicket = createMockTicket('t-1', TicketStatus.INCONSISTENT);
      service.updateStatus.mockResolvedValue(expectedTicket);

      const result = await controller.updateStatus('t-1', body, user);

      expect(service.updateStatus).toHaveBeenCalledWith(
        't-1',
        TicketStatus.INCONSISTENT,
        user.id,
        body.justification,
      );
      expect(result).toEqual(expectedTicket);
    });

    it('should throw BadRequestException when transitioning to INCONSISTENT without justification', async () => {
      const user: MockRequestUser = { id: 'agent-1', role: 'AGENT', departmentId: 'IT-DEPT' };
      const body = { status: TicketStatus.INCONSISTENT, justification: '' };

      await expect(controller.updateStatus('t-1', body, user)).rejects.toThrow(BadRequestException);
      expect(service.updateStatus).not.toHaveBeenCalled();
    });
  });
});
