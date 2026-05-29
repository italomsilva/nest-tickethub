import { Module } from '@nestjs/common';
import { AuthController } from '../../interface/controllers/auth.controller';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { OAuthLoginUseCase } from '../../application/use-cases/auth/oauth-login.use-case';
import { PostgresUsersRepository } from '../database/postgres/repositories/postgres-users.repository';
import { BcryptHashGateway } from '../gateways/bcrypt-hash.gateway';
import { JwtTokenGateway } from '../gateways/jwt-token.gateway';
import { MockOAuthGateway } from '../gateways/mock-oauth.gateway';

@Module({
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    OAuthLoginUseCase,
    {
      provide: 'IUsersRepository',
      useClass: PostgresUsersRepository,
    },
    {
      provide: 'IHashGateway',
      useClass: BcryptHashGateway,
    },
    {
      provide: 'ITokenGateway',
      useClass: JwtTokenGateway,
    },
    {
      provide: 'IOAuthGateway',
      useClass: MockOAuthGateway,
    },
  ],
  exports: [LoginUseCase, OAuthLoginUseCase],
})
export class AuthModule {}
