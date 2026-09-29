import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      this.logger.error(`${request.method} ${request.url} - ${status} - ${exception.message}`);

      response.status(status).json({
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message:
          typeof errorResponse === 'object' && 'message' in errorResponse
            ? (errorResponse as { message: string }).message
            : errorResponse,
      });
    } else {
      this.logger.error(
        `${request.method} ${request.url} - 500 - ${exception.message}`,
        exception.stack,
      );

      response.status(500).json({
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Internal server error',
      });
    }
  }
}
