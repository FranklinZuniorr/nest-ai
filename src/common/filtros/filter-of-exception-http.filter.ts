import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class FilterOfExceptionHttp implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const resposta = contexto.getResponse<Response>();

    // Configurações do cabeçalho CORS
    resposta.header('Access-Control-Allow-Origin', '*');
    resposta.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    resposta.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? {
            r: false,
            data: {
              error: exception.getResponse(),
              msg: JSON.parse(JSON.stringify(exception.getResponse())).message,
            },
            status: exception.getStatus(),
          }
        : {
            r: false,
            data: {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              timestamp: new Date().toISOString(),
              message: exception.message,
              path: contexto.getRequest().path,
              msg: exception.message,
            },
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          };

    resposta.status(status).json(body);
  }
}
