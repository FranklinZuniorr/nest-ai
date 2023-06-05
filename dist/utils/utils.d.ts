import { response } from "src/core/http/responseDto/response";
export declare class utils {
    static errorExternalServicesTreatment(error: any): object;
    static verifyCond: (data: any) => boolean;
    static sendEmail: (text: any, subject: any, to: any) => Promise<response>;
}
