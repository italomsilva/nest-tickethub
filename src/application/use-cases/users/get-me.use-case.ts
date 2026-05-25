import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

@Injectable()
export class GetMeUseCase {
  async execute(userId: string): Promise<User> {
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.CLIENT,
      createdAt: new Date(),
    };
  }
}
