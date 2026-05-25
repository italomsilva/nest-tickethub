import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any): Promise<{ accessToken: string }> {
    throw new Error('Method not implemented.');
  }

  @Post('oauth')
  async oauthLogin(@Body() body: any): Promise<{ accessToken: string }> {
    throw new Error('Method not implemented.');
  }
}
