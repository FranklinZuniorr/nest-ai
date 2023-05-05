export class utils{
    static errorExternalServicesTreatment(error: any): object{
        return {serviceErrorName: error.name, typeError: error.toString().split(":")[1].trim()}
    }
};