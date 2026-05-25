import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersController (Senior Unit Tests)', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const createMockUserResponse = (
    id: string,
    name: string,
    email: string,
    role: 'CLIENT' | 'AGENT' | 'ADMIN',
    departmentId: string | null = null,
  ) => ({
    id,
    name,
    email,
    role,
    departmentId,
    profileImage: 'http://aws.s3.com/profiles/avatar.png',
    phone: '11999999999',
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            getMe: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (POST /users)', () => {
    const validDto = {
      name: 'Jane Support',
      email: 'jane@tickethub.com',
      password: 'TemporaryPassword123',
      role: 'AGENT' as const,
      departmentId: 'IT-DEPT',
      phone: '11999999999',
      profileImage: 'http://aws.s3.com/profiles/avatar.png',
    };

    it('should successfully create a new user when called by a user with ADMIN role', async () => {
      const adminUser = { id: 'admin-123', role: 'ADMIN' as const };
      const expectedResponse = createMockUserResponse(
        'user-abc',
        validDto.name,
        validDto.email,
        validDto.role,
        validDto.departmentId,
      );
      service.createUser.mockResolvedValue(expectedResponse);

      const result = await controller.create(validDto, adminUser);

      expect(service.createUser).toHaveBeenCalledWith(validDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw ForbiddenException if create user is attempted by a non-ADMIN role (e.g. AGENT)', async () => {
      const agentUser = { id: 'agent-123', role: 'AGENT' as const };

      await expect(controller.create(validDto, agentUser)).rejects.toThrow(ForbiddenException);
      expect(service.createUser).not.toHaveBeenCalled();
    });

    it('should propagate BadRequestException if the email format is invalid', async () => {
      const adminUser = { id: 'admin-123', role: 'ADMIN' as const };
      service.createUser.mockRejectedValue(new BadRequestException('Invalid email format'));

      await expect(
        controller.create({ ...validDto, email: 'invalid-email' }, adminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMe (GET /users/me)', () => {
    it('should return profile information of the currently authenticated user context', async () => {
      const loggedUser = { id: 'user-789', role: 'CLIENT' as const };
      const expectedProfile = createMockUserResponse('user-789', 'John Doe', 'john@gmail.com', 'CLIENT');
      service.getMe.mockResolvedValue(expectedProfile);

      const result = await controller.getMe(loggedUser);

      expect(service.getMe).toHaveBeenCalledWith(loggedUser.id);
      expect(result).toEqual(expectedProfile);
    });

    it('should throw NotFoundException if current user session profile does not exist in store', async () => {
      const loggedUser = { id: 'missing-user', role: 'CLIENT' as const };
      service.getMe.mockRejectedValue(new NotFoundException('User profile not found'));

      await expect(controller.getMe(loggedUser)).rejects.toThrow(NotFoundException);
    });
  });
});
