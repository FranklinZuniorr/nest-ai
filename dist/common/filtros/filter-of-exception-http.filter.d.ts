import { ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
export declare class FilterOfExceptionHttp implements ExceptionFilter {
    private httpAdapter;
    constructor(adapterHost: HttpAdapterHost);
    catch(exception: Error, host: ArgumentsHost): void;
}
