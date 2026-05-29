import { Inject, Injectable } from '@nestjs/common';
import type { IUsersRepository } from '../../repositories/IUsersRepository';
import type { IOAuthGateway } from '../../gateways/oauth.gateway';
import type { ITokenGateway } from '../../gateways/token.gateway';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    @Inject('IUsersRepository') private readonly usersRepository: IUsersRepository,
    @Inject('IOAuthGateway') private readonly oauthGateway: IOAuthGateway,
    @Inject('ITokenGateway') private readonly tokenGateway: ITokenGateway,
  ) {}

  async execute(provider: string, token: string): Promise<{ accessToken: string }> {
    const oauthUser = await this.oauthGateway.verifyToken(provider, token);

    let user = await this.usersRepository.findByEmail(oauthUser.email);
    if (!user) {
      // Auto-provision user
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        name: oauthUser.name,
        email: oauthUser.email,
        passwordHash: '', // OAuth users don't have password hashes
        role: UserRole.CLIENT,
        createdAt: new Date(),
      };
      user = await this.usersRepository.create(newUser);
    }

    const accessToken = await this.tokenGateway.generate({
      id: user.id,
      role: user.role,
      departmentId: user.departmentId,
    });

    return { accessToken };
  }
}
