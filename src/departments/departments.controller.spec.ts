import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

describe('DepartmentsController (Senior Unit Tests)', () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<DepartmentsService>;

  const createMockDepartment = (id: string, name: string, details: string) => ({
    id,
    name,
    details,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get(DepartmentsService) as jest.Mocked<DepartmentsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll (GET /departments)', () => {
    it('should list all organizational departments to any authenticated session context', async () => {
      const user = { id: 'user-123', role: 'CLIENT' as const };
      const expectedDepartments = [
        createMockDepartment('dept-1', 'TI', 'Technology and Support Services'),
        createMockDepartment('dept-2', 'RH', 'Human Resources Department'),
      ];
      service.findAll.mockResolvedValue(expectedDepartments);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedDepartments);
    });
  });

  describe('create (POST /departments)', () => {
    const validBody = { name: 'Financeiro', details: 'Setor financeiro e contabilidade' };

    it('should successfully register organizational sector when called by an ADMIN', async () => {
      const user = { id: 'admin-123', role: 'ADMIN' as const };
      const expectedResponse = createMockDepartment('dept-3', validBody.name, validBody.details);
      service.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(validBody, user);

      expect(service.create).toHaveBeenCalledWith(validBody);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw ForbiddenException if requested by an unauthorized role (e.g. CLIENT or AGENT)', async () => {
      const user = { id: 'agent-123', role: 'AGENT' as const };

      await expect(controller.create(validBody, user)).rejects.toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should propagate BadRequestException if department properties are invalid', async () => {
      const user = { id: 'admin-123', role: 'ADMIN' as const };
      service.create.mockRejectedValue(new BadRequestException('Department name is required'));

      await expect(controller.create({ name: '', details: '' }, user)).rejects.toThrow(BadRequestException);
    });
  });
});
