import { Injectable } from '@nestjs/common';
import { Department } from '../../../domain/entities/department.entity';

@Injectable()
export class CreateDepartmentUseCase {
  async execute(dto: any): Promise<Department> {
    return {
      id: 'dept-1',
      name: dto.name,
      details: dto.details,
      createdAt: new Date(),
    };
  }
}
