import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  async createComment(ticketId: string, message: string, userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async getCommentsForTicket(ticketId: string, user: any): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}
