import { Module } from '@nestjs/common';
import { UsersController } from '../../interface/controllers/users.controller';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { GetMeUseCase } from '../../application/use-cases/users/get-me.use-case';

@Module({
  controllers: [UsersController],
  providers: [CreateUserUseCase, GetMeUseCase],
  exports: [CreateUserUseCase, GetMeUseCase],
})
export class UsersModule {}
