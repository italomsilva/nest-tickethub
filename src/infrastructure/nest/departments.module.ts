import { Module } from '@nestjs/common';
import { DepartmentsController } from '../../interface/controllers/departments.controller';
import { CreateDepartmentUseCase } from '../../application/use-cases/departments/create-department.use-case';
import { FindAllDepartmentsUseCase } from '../../application/use-cases/departments/find-all-departments.use-case';

@Module({
  controllers: [DepartmentsController],
  providers: [CreateDepartmentUseCase, FindAllDepartmentsUseCase],
  exports: [CreateDepartmentUseCase, FindAllDepartmentsUseCase],
})
export class DepartmentsModule {}
