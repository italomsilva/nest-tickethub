import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Param('ticketId') ticketId: string,
    @Body() body: { message: string },
    @Req() user: any,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  @Get()
  async getComments(@Param('ticketId') ticketId: string, @Req() user: any): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}
