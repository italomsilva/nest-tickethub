import { Inject, Injectable } from '@nestjs/common';
import type { IDepartmentsRepository } from '../../repositories/IDepartmentsRepository';
import { Department } from '../../../domain/entities/department.entity';

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    @Inject('IDepartmentsRepository') private readonly departmentsRepository: IDepartmentsRepository,
  ) {}

  async execute(dto: any): Promise<Department> {
    const department: Department = {
      id: Math.random().toString(36).substring(2, 15),
      name: dto.name,
      details: dto.details,
      createdAt: new Date(),
    };
    return this.departmentsRepository.create(department);
  }
}
