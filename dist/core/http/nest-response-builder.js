"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestResponseBuilder = void 0;
const nest_response_1 = require("./nest-response");
class NestResponseBuilder {
    constructor() {
        this.resposta = {
            status: 200,
            headers: {},
            body: {}
        };
    }
    comStatus(status) {
        this.resposta.status = status;
        return this;
    }
    comHeaders(headers) {
        this.resposta.headers = headers;
        return this;
    }
    comBody(body) {
        this.resposta.body = body;
        return this;
    }
    build() {
        return new nest_response_1.NestResponse(this.resposta);
    }
}
exports.NestResponseBuilder = NestResponseBuilder;
//# sourceMappingURL=nest-response-builder.js.map