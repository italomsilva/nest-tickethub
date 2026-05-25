import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  async execute(dto: any): Promise<User> {
    return {
      id: 'user-1',
      name: dto.name,
      email: dto.email,
      passwordHash: 'hashed-password',
      role: dto.role,
      departmentId: dto.departmentId,
      createdAt: new Date(),
    };
  }
}
