import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CommentsController } from '../../../src/interface/controllers/comments.controller';
import { CreateCommentUseCase } from '../../../src/application/use-cases/comments/create-comment.use-case';
import { GetCommentsUseCase } from '../../../src/application/use-cases/comments/get-comments.use-case';
import { Comment } from '../../../src/domain/entities/comment.entity';

describe('CommentsController (Clean Architecture Unit Tests)', () => {
  let controller: CommentsController;
  
  let createCommentUseCaseMock: jest.Mocked<CreateCommentUseCase>;
  let getCommentsUseCaseMock: jest.Mocked<GetCommentsUseCase>;

  const createMockComment = (overrides?: Partial<Comment>): Comment => ({
    id: 'comment-uuid-1',
    ticketId: 'ticket-uuid-123',
    userId: 'user-uuid-123',
    message: 'Este é um comentário explicativo de suporte.',
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    createCommentUseCaseMock = { execute: jest.fn() } as any;
    getCommentsUseCaseMock = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CreateCommentUseCase, useValue: createCommentUseCaseMock },
        { provide: GetCommentsUseCase, useValue: getCommentsUseCaseMock },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment (POST /tickets/:ticketId/comments)', () => {
    it('should successfully append text comments to a ticket timeline when requester is authorized', async () => {
      const user = { id: 'client-1', role: 'CLIENT' };
      const expectedComment = createMockComment({ userId: user.id, message: 'Preciso de retorno urgente, por favor.' });
      createCommentUseCaseMock.execute.mockResolvedValue(expectedComment);

      const result = await controller.createComment(
        'ticket-uuid-123',
        { message: 'Preciso de retorno urgente, por favor.' },
        user,
      );

      expect(result).toEqual(expectedComment);
      expect(createCommentUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(createCommentUseCaseMock.execute).toHaveBeenCalledWith(
        'ticket-uuid-123',
        'Preciso de retorno urgente, por favor.',
        user.id,
      );
    });

    it('should fail validation checks and throw BadRequestException if message field is blank or empty', async () => {
      const user = { id: 'client-1', role: 'CLIENT' };

      await expect(
        controller.createComment('ticket-uuid-123', { message: '   ' }, user),
      ).rejects.toThrow(BadRequestException);
      expect(createCommentUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('getComments (GET /tickets/:ticketId/comments)', () => {
    it('should return chronological timeline lists of comments for a given ticket ID', async () => {
      const user = { id: 'tech-1', role: 'AGENT' };
      const commentsList = [
        createMockComment({ id: 'comment-1', message: 'Primeira resposta' }),
        createMockComment({ id: 'comment-2', message: 'Segunda resposta' }),
      ];
      getCommentsUseCaseMock.execute.mockResolvedValue(commentsList);

      const result = await controller.getComments('ticket-uuid-123', user);

      expect(result).toEqual(commentsList);
      expect(getCommentsUseCaseMock.execute).toHaveBeenCalledWith('ticket-uuid-123', user);
    });
  });
});
