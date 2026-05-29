import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../../../application/repositories/IUsersRepository';
import { User } from '../../../../domain/entities/user.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { PostgresService } from '../postgres.service';

@Injectable()
export class PostgresUsersRepository implements IUsersRepository {
  constructor(private readonly postgresService: PostgresService) {}
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      departmentId: row.department_id || undefined,
      phone: row.phone || undefined,
      profileImage: row.profile_image || undefined,
      createdAt: row.created_at,
    };
  }
  async findById(id: string): Promise<User | null> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapRowToUser(res.rows[0]);
  }
  async findByEmail(email: string): Promise<User | null> {
    const pool = this.postgresService.getPool();
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return null;
    return this.mapRowToUser(res.rows[0]);
  }
  async create(user: User): Promise<User> {
    const pool = this.postgresService.getPool();
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, department_id, phone, profile_image, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user.id,
        user.name,
        user.email,
        user.passwordHash,
        user.role,
        user.departmentId || null,
        user.phone || null,
        user.profileImage || null,
        user.createdAt,
      ],
    );
    return user;
  }
  async save(user: User): Promise<User> {
    const pool = this.postgresService.getPool();
    const checkRes = await pool.query('SELECT 1 FROM users WHERE id = $1', [user.id]);
    if (checkRes.rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET name = $2, email = $3, password_hash = $4, role = $5, department_id = $6, phone = $7, profile_image = $8
         WHERE id = $1`,
        [
          user.id,
          user.name,
          user.email,
          user.passwordHash,
          user.role,
          user.departmentId || null,
          user.phone || null,
          user.profileImage || null,
        ],
      );
    } else {
      await this.create(user);
    }
    return user;
  }
}
