import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CommentsController (Senior Unit Tests)', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  const createMockComment = (id: string, ticketId: string, userId: string, message: string) => ({
    id,
    ticketId,
    userId,
    message,
    createdAt: new Date(),
    user: {
      name: 'System User',
      role: 'AGENT' as const,
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            createComment: jest.fn(),
            getCommentsForTicket: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService) as jest.Mocked<CommentsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment (POST /tickets/:ticketId/comments)', () => {
    const validBody = { message: 'Can we get an update on this issue?' };

    it('should successfully post a comment when requested by an authorized, authenticated user', async () => {
      const user = { id: 'user-123', role: 'CLIENT' as const };
      const expectedComment = createMockComment('c-1', 'ticket-123', 'user-123', validBody.message);
      service.createComment.mockResolvedValue(expectedComment);

      const result = await controller.createComment('ticket-123', validBody, user);

      expect(service.createComment).toHaveBeenCalledWith('ticket-123', validBody.message, user.id);
      expect(result).toEqual(expectedComment);
    });

    it('should throw BadRequestException if comment body consists of whitespaces or is empty', async () => {
      const user = { id: 'user-123', role: 'CLIENT' as const };

      await expect(
        controller.createComment('ticket-123', { message: '    ' }, user),
      ).rejects.toThrow(BadRequestException);
      expect(service.createComment).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException if the ticket is missing from system', async () => {
      const user = { id: 'user-123', role: 'CLIENT' as const };
      service.createComment.mockRejectedValue(new NotFoundException('Ticket not found'));

      await expect(controller.createComment('invalid-ticket', validBody, user)).rejects.toThrow(NotFoundException);
    });

    it('should propagate ForbiddenException if caller has no privileges to write comment to specified ticket', async () => {
      const user = { id: 'agent-outside', role: 'AGENT' as const, departmentId: 'HR-DEPT' };
      service.createComment.mockRejectedValue(new ForbiddenException('You do not have access to this ticket'));

      await expect(controller.createComment('ticket-123', validBody, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getComments (GET /tickets/:ticketId/comments)', () => {
    it('should return chronological list of comments for an authorized viewer', async () => {
      const user = { id: 'user-123', role: 'CLIENT' as const };
      const expectedTimeline = [
        createMockComment('c-1', 'ticket-123', 'client-1', 'Initial comment'),
        createMockComment('c-2', 'ticket-123', 'agent-1', 'Support response'),
      ];
      service.getCommentsForTicket.mockResolvedValue(expectedTimeline);

      const result = await controller.getComments('ticket-123', user);

      expect(service.getCommentsForTicket).toHaveBeenCalledWith('ticket-123', user);
      expect(result).toEqual(expectedTimeline);
    });

    it('should throw ForbiddenException if user has no privileges to inspect comment log of target ticket', async () => {
      const user = { id: 'client-other', role: 'CLIENT' as const };
      service.getCommentsForTicket.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(controller.getComments('ticket-123', user)).rejects.toThrow(ForbiddenException);
    });
  });
});
