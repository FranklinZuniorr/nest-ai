import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost, AbstractHttpAdapter } from "@nestjs/core";

@Catch()
export class FilterOfExceptionHttp implements ExceptionFilter {

    private httpAdapter: AbstractHttpAdapter;

    constructor(adapterHost: HttpAdapterHost) {
        this.httpAdapter = adapterHost.httpAdapter;
    }

    catch(exception: Error, host: ArgumentsHost) {
        const contexto = host.switchToHttp();
        const requisicao = contexto.getRequest();
        const resposta = contexto.getResponse();

        const { status, body } = exception instanceof HttpException 
            ? {
                status: exception.getStatus(),
                body: {
                    r: false, 
                    data: {
                        error: exception.getResponse(), 
                        msg: JSON.parse(JSON.stringify(exception.getResponse())).message.join('\n')
                    }, 
                    status: exception.getStatus()
                }
            }
            : {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                body: {
                    r: false,
                    data: {
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        timestamp: new Date().toISOString(),
                        message: exception.message,
                        path: requisicao.path,
                        msg: exception.message
                    },
                    status: HttpStatus.INTERNAL_SERVER_ERROR
                }
            };
        
        this.httpAdapter.reply(resposta, body, status);
    }

}