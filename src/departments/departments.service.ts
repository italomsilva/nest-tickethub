import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentsService {
  async findAll(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  async create(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
