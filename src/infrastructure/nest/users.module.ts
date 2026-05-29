import { Module } from '@nestjs/common';
import { UsersController } from '../../interface/controllers/users.controller';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { GetMeUseCase } from '../../application/use-cases/users/get-me.use-case';
import { InMemoryUsersRepository } from '../database/in-memory/in-memory-users.repository';
import { BcryptHashGateway } from '../gateways/bcrypt-hash.gateway';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetMeUseCase,
    {
      provide: 'IUsersRepository',
      useClass: InMemoryUsersRepository,
    },
    {
      provide: 'IHashGateway',
      useClass: BcryptHashGateway,
    },
  ],
  exports: [CreateUserUseCase, GetMeUseCase],
})
export class UsersModule {}
