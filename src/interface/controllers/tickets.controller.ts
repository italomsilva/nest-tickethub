import { Controller, Post, Get, Patch, Body, Param, Req, UploadedFile, ForbiddenException, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTicketUseCase } from '../../application/use-cases/tickets/create-ticket.use-case';
import { FindAllTicketsUseCase } from '../../application/use-cases/tickets/find-all-tickets.use-case';
import { FindOneTicketUseCase } from '../../application/use-cases/tickets/find-one-ticket.use-case';
import { AssignTicketUseCase } from '../../application/use-cases/tickets/assign-ticket.use-case';
import { ResolveTicketUseCase } from '../../application/use-cases/tickets/resolve-ticket.use-case';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/tickets/update-ticket-status.use-case';
import { Ticket } from '../../domain/entities/ticket.entity';
import { TicketStatus } from '../../domain/enums/ticket-status.enum';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly findAllTicketsUseCase: FindAllTicketsUseCase,
    private readonly findOneTicketUseCase: FindOneTicketUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly resolveTicketUseCase: ResolveTicketUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() dto: any,
    @Req() req: any,
    @UploadedFile() file?: any,
  ): Promise<Ticket> {
    const reqUser = req.user || req;
    if (reqUser.role !== 'CLIENT') {
      throw new ForbiddenException('Only CLIENT can create tickets');
    }
    const payload = file ? { ...dto, file: { buffer: file.buffer, filename: file.originalname, mimeType: file.mimetype } } : dto;
    return this.createTicketUseCase.execute(payload, reqUser.id);
  }

  @Get()
  async findAll(@Req() req: any): Promise<Ticket[]> {
    const reqUser = req.user || req;
    return this.findAllTicketsUseCase.execute(reqUser);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<Ticket> {
    const reqUser = req.user || req;
    return this.findOneTicketUseCase.execute(id, reqUser);
  }

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Req() req: any): Promise<Ticket> {
    const reqUser = req.user || req;
    if (reqUser.role !== 'AGENT') {
      throw new ForbiddenException('Only AGENT can assign tickets');
    }
    return this.assignTicketUseCase.execute(id, reqUser.id, reqUser.departmentId);
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() body: { solution: string },
    @Req() req: any,
  ): Promise<Ticket> {
    const reqUser = req.user || req;
    if (reqUser.role !== 'AGENT') {
      throw new ForbiddenException('Only AGENT can resolve tickets');
    }
    if (!body.solution || body.solution.trim() === '') {
      throw new BadRequestException('Solution is required');
    }
    return this.resolveTicketUseCase.execute(id, reqUser.id, body.solution);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TicketStatus; justification?: string },
    @Req() req: any,
  ): Promise<Ticket> {
    const reqUser = req.user || req;
    if (body.status === TicketStatus.INCONSISTENT && (!body.justification || body.justification.trim() === '')) {
      throw new BadRequestException('Justification is required');
    }
    return this.updateTicketStatusUseCase.execute(id, body.status, reqUser.id, body.justification);
  }
}
