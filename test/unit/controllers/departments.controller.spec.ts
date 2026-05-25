import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { DepartmentsController } from '../../../src/interface/controllers/departments.controller';
import { CreateDepartmentUseCase } from '../../../src/application/use-cases/departments/create-department.use-case';
import { FindAllDepartmentsUseCase } from '../../../src/application/use-cases/departments/find-all-departments.use-case';
import { Department } from '../../../src/domain/entities/department.entity';

describe('DepartmentsController (Clean Architecture Unit Tests)', () => {
  let controller: DepartmentsController;
  
  let createDepartmentUseCaseMock: jest.Mocked<CreateDepartmentUseCase>;
  let findAllDepartmentsUseCaseMock: jest.Mocked<FindAllDepartmentsUseCase>;

  const createMockDepartment = (overrides?: Partial<Department>): Department => ({
    id: 'dept-uuid-1',
    name: 'RH',
    details: 'Recursos Humanos corporativo.',
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    createDepartmentUseCaseMock = { execute: jest.fn() } as any;
    findAllDepartmentsUseCaseMock = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        { provide: CreateDepartmentUseCase, useValue: createDepartmentUseCaseMock },
        { provide: FindAllDepartmentsUseCase, useValue: findAllDepartmentsUseCaseMock },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll (GET /departments)', () => {
    it('should successfully return catalog list of corporate departments', async () => {
      const user = { id: 'client-1', role: 'CLIENT' };
      const list = [createMockDepartment(), createMockDepartment({ id: 'dept-uuid-2', name: 'TI' })];
      findAllDepartmentsUseCaseMock.execute.mockResolvedValue(list);

      const result = await controller.findAll(user);

      expect(result).toEqual(list);
      expect(findAllDepartmentsUseCaseMock.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('create (POST /departments)', () => {
    const validPayload = { name: 'Infraestrutura', details: 'Área responsável por telefonia e instalações físicas.' };

    it('should allow ADMIN to register organizational sectors', async () => {
      const user = { id: 'admin-1', role: 'ADMIN' };
      const expectedDept = createMockDepartment({ ...validPayload });
      createDepartmentUseCaseMock.execute.mockResolvedValue(expectedDept);

      const result = await controller.create(validPayload, user);

      expect(result).toEqual(expectedDept);
      expect(createDepartmentUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(createDepartmentUseCaseMock.execute).toHaveBeenCalledWith(validPayload);
    });

    it('should throw ForbiddenException if request comes from user other than ADMIN (e.g. AGENT)', async () => {
      const user = { id: 'agent-1', role: 'AGENT' };

      await expect(controller.create(validPayload, user)).rejects.toThrow(ForbiddenException);
      expect(createDepartmentUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });
});
