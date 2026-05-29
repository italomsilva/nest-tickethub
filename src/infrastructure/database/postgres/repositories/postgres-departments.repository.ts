import { Injectable } from '@nestjs/common';
import { IDepartmentsRepository } from '../../../../application/repositories/IDepartmentsRepository';
import { Department } from '../../../../domain/entities/department.entity';
import { PostgresService } from '../postgres.service';

@Injectable()
export class PostgresDepartmentsRepository implements IDepartmentsRepository {
  constructor(private readonly postgresService: PostgresService) {}

  private mapRowToDepartment(row: any): Department {
    return {
      id: row.id,
      name: row.name,
      details: row.details || undefined,
      createdAt: row.created_at,
    };
  }

  async findById(id: string): Promise<Department | null> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapRowToDepartment(res.rows[0]);
  }

  async findByName(name: string): Promise<Department | null> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM departments WHERE LOWER(name) = LOWER($1)', [name]);
    if (res.rows.length === 0) return null;
    return this.mapRowToDepartment(res.rows[0]);
  }

  async findAll(): Promise<Department[]> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    return res.rows.map(row => this.mapRowToDepartment(row));
  }

  async create(department: Department): Promise<Department> {
    const pool = this.postgresService.getPool();
    await pool.query(
      `INSERT INTO departments (id, name, details, created_at)
       VALUES ($1, $2, $3, $4)`,
      [
        department.id,
        department.name,
        department.details || null,
        department.createdAt,
      ],
    );
    return department;
  }
}
