import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;

  @IsString()
  @IsOptional()
  justification?: string;
}
