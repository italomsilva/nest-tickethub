import { Injectable } from '@nestjs/common';
import { Department } from '../../../domain/entities/department.entity';

@Injectable()
export class FindAllDepartmentsUseCase {
  async execute(): Promise<Department[]> {
    return [
      {
        id: 'dept-1',
        name: 'TI',
        details: 'Tecnologia da Informação',
        createdAt: new Date(),
      },
    ];
  }
}
