import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { OAuthLoginUseCase } from '../../application/use-cases/auth/oauth-login.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
  ) {}

  @Post('login')
  async login(@Body() body: any): Promise<{ accessToken: string }> {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.loginUseCase.execute(body.email, body.password);
  }

  @Post('oauth')
  async oauthLogin(@Body() body: any): Promise<{ accessToken: string }> {
    return this.oauthLoginUseCase.execute(body.provider, body.token);
  }
}
