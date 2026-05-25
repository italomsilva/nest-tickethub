import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuthLoginUseCase {
  async execute(provider: string, token: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'jwt-oauth-access-token',
    };
  }
}
