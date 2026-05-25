import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: any, @Req() user: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  @Get('me')
  async getMe(@Req() user: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
