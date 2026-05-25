import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from '../../../src/interface/controllers/users.controller';
import { CreateUserUseCase } from '../../../src/application/use-cases/users/create-user.use-case';
import { GetMeUseCase } from '../../../src/application/use-cases/users/get-me.use-case';
import { User } from '../../../src/domain/entities/user.entity';
import { UserRole } from '../../../src/domain/enums/user-role.enum';

describe('UsersController (Clean Architecture Unit Tests)', () => {
  let controller: UsersController;
  
  let createUserUseCaseMock: jest.Mocked<CreateUserUseCase>;
  let getMeUseCaseMock: jest.Mocked<GetMeUseCase>;

  const createMockUser = (overrides?: Partial<User>): User => ({
    id: 'user-uuid-1',
    name: 'Carlos Admin',
    email: 'carlos.admin@empresa.com',
    passwordHash: 'hashedpasswordhash',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    createUserUseCaseMock = { execute: jest.fn() } as any;
    getMeUseCaseMock = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserUseCase, useValue: createUserUseCaseMock },
        { provide: GetMeUseCase, useValue: getMeUseCaseMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (POST /users)', () => {
    const newUserDto = {
      name: 'Novo Colaborador',
      email: 'colaborador@empresa.com',
      role: UserRole.CLIENT,
      departmentId: 'infra-dept-id',
    };

    it('should successfully registers users when requested by administrative users with ADMIN role', async () => {
      const user = { id: 'admin-1', role: 'ADMIN' };
      const expectedUser = createMockUser({ ...newUserDto });
      createUserUseCaseMock.execute.mockResolvedValue(expectedUser);

      const result = await controller.create(newUserDto, user);

      expect(result).toEqual(expectedUser);
      expect(createUserUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(createUserUseCaseMock.execute).toHaveBeenCalledWith(newUserDto);
    });

    it('should reject registration requests with ForbiddenException when requester is not an ADMIN role', async () => {
      const user = { id: 'agent-1', role: 'AGENT' };

      await expect(controller.create(newUserDto, user)).rejects.toThrow(ForbiddenException);
      expect(createUserUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('getMe (GET /users/me)', () => {
    it('should successfully retrieve current logged in user context details', async () => {
      const user = { id: 'client-123', role: 'CLIENT' };
      const expectedUser = createMockUser({ id: user.id, role: UserRole.CLIENT, name: 'Client User' });
      getMeUseCaseMock.execute.mockResolvedValue(expectedUser);

      const result = await controller.getMe(user);

      expect(result).toEqual(expectedUser);
      expect(getMeUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(getMeUseCaseMock.execute).toHaveBeenCalledWith(user.id);
    });
  });
});
