import { Controller, Get, Post, Body, Req, ForbiddenException } from '@nestjs/common';
import { CreateDepartmentUseCase } from '../../application/use-cases/departments/create-department.use-case';
import { FindAllDepartmentsUseCase } from '../../application/use-cases/departments/find-all-departments.use-case';

@Controller('departments')
export class DepartmentsController {
  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly findAllDepartmentsUseCase: FindAllDepartmentsUseCase,
  ) {}

  @Get()
  async findAll(@Req() user: any): Promise<any[]> {
    return this.findAllDepartmentsUseCase.execute();
  }

  @Post()
  async create(@Body() body: any, @Req() user: any): Promise<any> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can create departments');
    }
    return this.createDepartmentUseCase.execute(body);
  }
}
