import { Inject, Injectable } from '@nestjs/common';
import type { IUsersRepository } from '../../repositories/IUsersRepository';
import type { IHashGateway } from '../../gateways/hash.gateway';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUsersRepository') private readonly usersRepository: IUsersRepository,
    @Inject('IHashGateway') private readonly hashGateway: IHashGateway,
  ) {}

  async execute(dto: any): Promise<User> {
    const password = dto.password || 'Mudar@123';
    const passwordHash = await this.hashGateway.hash(password);

    const user: User = {
      id: Math.random().toString(36).substring(2, 15),
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      departmentId: dto.departmentId,
      phone: dto.phone,
      profileImage: dto.profileImage,
      createdAt: new Date(),
    };

    return this.usersRepository.create(user);
  }
}
