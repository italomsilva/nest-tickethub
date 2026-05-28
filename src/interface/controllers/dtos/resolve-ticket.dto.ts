import { IsNotEmpty, IsString } from 'class-validator';

export class ResolveTicketDto {
  @IsString()
  @IsNotEmpty()
  solution: string;
}
