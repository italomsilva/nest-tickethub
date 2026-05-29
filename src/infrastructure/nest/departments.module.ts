import { Module } from '@nestjs/common';
import { DepartmentsController } from '../../interface/controllers/departments.controller';
import { CreateDepartmentUseCase } from '../../application/use-cases/departments/create-department.use-case';
import { FindAllDepartmentsUseCase } from '../../application/use-cases/departments/find-all-departments.use-case';
import { InMemoryDepartmentsRepository } from '../database/in-memory/in-memory-departments.repository';

@Module({
  controllers: [DepartmentsController],
  providers: [
    CreateDepartmentUseCase,
    FindAllDepartmentsUseCase,
    {
      provide: 'IDepartmentsRepository',
      useClass: InMemoryDepartmentsRepository,
    },
  ],
  exports: [CreateDepartmentUseCase, FindAllDepartmentsUseCase],
})
export class DepartmentsModule {}
