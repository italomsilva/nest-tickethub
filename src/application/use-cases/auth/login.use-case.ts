import { Inject, Injectable } from '@nestjs/common';
import type { IUsersRepository } from '../../repositories/IUsersRepository';
import type { IHashGateway } from '../../gateways/hash.gateway';
import type { ITokenGateway } from '../../gateways/token.gateway';
import { UnauthorizedActionException } from '../../../domain/exceptions/unauthorized-action.exception';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUsersRepository') private readonly usersRepository: IUsersRepository,
    @Inject('IHashGateway') private readonly hashGateway: IHashGateway,
    @Inject('ITokenGateway') private readonly tokenGateway: ITokenGateway,
  ) {}

  async execute(email: string, passwordPlain: string): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedActionException('Invalid credentials');
    }

    const matches = await this.hashGateway.compare(passwordPlain, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedActionException('Invalid credentials');
    }

    const accessToken = await this.tokenGateway.generate({
      id: user.id,
      role: user.role,
      departmentId: user.departmentId,
    });

    return { accessToken };
  }
}
