import { Module } from '@nestjs/common';
import { AuthController } from '../../interface/controllers/auth.controller';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { OAuthLoginUseCase } from '../../application/use-cases/auth/oauth-login.use-case';

@Module({
  controllers: [AuthController],
  providers: [LoginUseCase, OAuthLoginUseCase],
  exports: [LoginUseCase, OAuthLoginUseCase],
})
export class AuthModule {}
