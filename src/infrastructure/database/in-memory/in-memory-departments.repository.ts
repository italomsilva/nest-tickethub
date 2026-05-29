import { Injectable } from '@nestjs/common';
import { IDepartmentsRepository } from '../../../application/repositories/IDepartmentsRepository';
import { Department } from '../../../domain/entities/department.entity';
import { InMemoryDatabase } from './in-memory-db';

@Injectable()
export class InMemoryDepartmentsRepository implements IDepartmentsRepository {
  async findById(id: string): Promise<Department | null> {
    const dept = InMemoryDatabase.departments.find(d => d.id === id);
    return dept || null;
  }

  async findByName(name: string): Promise<Department | null> {
    const dept = InMemoryDatabase.departments.find(d => d.name.toLowerCase() === name.toLowerCase());
    return dept || null;
  }

  async findAll(): Promise<Department[]> {
    return InMemoryDatabase.departments;
  }

  async create(department: Department): Promise<Department> {
    InMemoryDatabase.departments.push(department);
    return department;
  }
}
