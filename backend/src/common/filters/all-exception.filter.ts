import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface HttpExceptionResponse {
  message?: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const responseObj = exceptionResponse as HttpExceptionResponse;
        const responseMessage = responseObj.message;
        message = Array.isArray(responseMessage)
          ? responseMessage[0]
          : (responseMessage ?? exception.message);
      }
    }

    response.status(status).json({
      success: false,
      data: null,
      message,
      statusCode: status,
    });
  }
}
