import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let error = 'Internal Server Error';
    let message = 'Internal server error';

    if (exception.name === 'JustificationRequiredException') {
      status = 400;
      error = 'Bad Request';
      message = exception.message;
    } else if (exception.name === 'TicketNotFoundException') {
      status = 404;
      error = 'Not Found';
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
