import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JustificationRequiredException } from '../../../domain/exceptions/justification-required.exception';
import { TicketNotFoundException } from '../../../domain/exceptions/ticket-not-found.exception';
import { SolutionRequiredException } from '../../../domain/exceptions/solution-required.exception';
import { UnauthorizedActionException } from '../../../domain/exceptions/unauthorized-action.exception';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' && 'message' in res ? (res as any).message : exception.message;
    } else if (exception instanceof JustificationRequiredException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof TicketNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof SolutionRequiredException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof UnauthorizedActionException) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
    } else if (exception instanceof Error) {
      // Outros erros gerais de domínio ou inesperados
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
