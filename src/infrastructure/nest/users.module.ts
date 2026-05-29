import { Module } from '@nestjs/common';
import { UsersController } from '../../interface/controllers/users.controller';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { GetMeUseCase } from '../../application/use-cases/users/get-me.use-case';
import { PostgresUsersRepository } from '../database/postgres/repositories/postgres-users.repository';
import { BcryptHashGateway } from '../gateways/bcrypt-hash.gateway';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetMeUseCase,
    {
      provide: 'IUsersRepository',
      useClass: PostgresUsersRepository,
    },
    {
      provide: 'IHashGateway',
      useClass: BcryptHashGateway,
    },
  ],
  exports: [CreateUserUseCase, GetMeUseCase],
})
export class UsersModule {}
