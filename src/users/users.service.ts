import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async createUser(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async getMe(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
