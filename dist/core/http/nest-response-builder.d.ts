import { NestResponse } from "./nest-response";
export declare class NestResponseBuilder {
    private resposta;
    comStatus(status: number): this;
    comHeaders(headers: Object): this;
    comBody(body: Object): this;
    build(): NestResponse;
}
