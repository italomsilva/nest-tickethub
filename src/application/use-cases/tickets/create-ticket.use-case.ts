import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';

@Injectable()
export class CreateTicketUseCase {
  async execute(dto: any, clientId: string): Promise<Ticket> {
    return {
      id: 'ticket-1',
      title: dto.title,
      description: dto.description,
      status: TicketStatus.OPEN,
      clientId,
      targetDepartmentId: dto.departmentId,
      attachmentUrl: dto.file ? 'http://aws-s3-bucket/file-uuid.png' : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
