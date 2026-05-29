import { Inject, Injectable } from '@nestjs/common';
import type { IUsersRepository } from '../../repositories/IUsersRepository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject('IUsersRepository') private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
