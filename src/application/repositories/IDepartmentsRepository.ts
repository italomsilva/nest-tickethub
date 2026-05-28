import { Department } from '../../domain/entities/department.entity';

export interface IDepartmentsRepository {
  findById(id: string): Promise<Department | null>;
  findByName(name: string): Promise<Department | null>;
  findAll(): Promise<Department[]>;
  create(department: Department): Promise<Department>;
}
