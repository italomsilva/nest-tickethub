import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginUseCase {
  async execute(email: string, passwordHash: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'jwt-access-token',
    };
  }
}
