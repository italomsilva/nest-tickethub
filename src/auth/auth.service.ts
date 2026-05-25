import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    throw new Error('Method not implemented.');
  }

  async loginOAuth(provider: string, token: string): Promise<{ accessToken: string }> {
    throw new Error('Method not implemented.');
  }
}
