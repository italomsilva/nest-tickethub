import { Controller, Post, Get, Body, Param, Req, BadRequestException } from '@nestjs/common';
import { CreateCommentUseCase } from '../../application/use-cases/comments/create-comment.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/comments/get-comments.use-case';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
  ) {}

  @Post()
  async createComment(
    @Param('ticketId') ticketId: string,
    @Body() body: CreateCommentDto,
    @Req() user: any,
  ): Promise<any> {
    if (!body.message || body.message.trim() === '') {
      throw new BadRequestException('Message is required');
    }
    return this.createCommentUseCase.execute(ticketId, body.message, user.id);
  }

  @Get()
  async getComments(@Param('ticketId') ticketId: string, @Req() user: any): Promise<any[]> {
    return this.getCommentsUseCase.execute(ticketId, user);
  }
}
