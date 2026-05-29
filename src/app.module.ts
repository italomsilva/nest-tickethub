import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './infrastructure/nest/tickets.module';
import { CommentsModule } from './infrastructure/nest/comments.module';
import { UsersModule } from './infrastructure/nest/users.module';
import { AuthModule } from './infrastructure/nest/auth.module';
import { DepartmentsModule } from './infrastructure/nest/departments.module';
import { AuthMiddleware } from './infrastructure/http/middleware/auth.middleware';
import { DomainExceptionFilter } from './infrastructure/http/filters/domain-exception.filter';
import { DatabaseModule } from './infrastructure/database/postgres/database.module';

@Module({
  imports: [
    DatabaseModule,
    TicketsModule,
    CommentsModule,
    UsersModule,
    AuthModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
