import { Controller, Post, Get, Patch, Body, Param, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TicketsService, TicketStatus, Ticket } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(
    @Body() dto: any,
    @Req() user: any,
    @UploadedFile() file?: any,
  ): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }

  @Get()
  async findAll(@Req() user: any): Promise<Ticket[]> {
    throw new Error('Method not implemented.');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() user: any): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Req() user: any): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() body: { solution: string },
    @Req() user: any,
  ): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TicketStatus; justification?: string },
    @Req() user: any,
  ): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
}
