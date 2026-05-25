import { Controller, Post, Get, Body, Req, ForbiddenException } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { GetMeUseCase } from '../../application/use-cases/users/get-me.use-case';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post()
  async create(@Body() body: any, @Req() user: any): Promise<any> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can create users');
    }
    return this.createUserUseCase.execute(body);
  }

  @Get('me')
  async getMe(@Req() user: any): Promise<any> {
    return this.getMeUseCase.execute(user.id);
  }
}
