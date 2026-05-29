import { Inject, Injectable } from '@nestjs/common';
import type { IDepartmentsRepository } from '../../repositories/IDepartmentsRepository';
import { Department } from '../../../domain/entities/department.entity';

@Injectable()
export class FindAllDepartmentsUseCase {
  constructor(
    @Inject('IDepartmentsRepository') private readonly departmentsRepository: IDepartmentsRepository,
  ) {}

  async execute(): Promise<Department[]> {
    return this.departmentsRepository.findAll();
  }
}
