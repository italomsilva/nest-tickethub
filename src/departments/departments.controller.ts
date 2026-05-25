import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async findAll(@Req() user: any): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  @Post()
  async create(@Body() body: any, @Req() user: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
