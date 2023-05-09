export class utils{
    static errorExternalServicesTreatment(error: any): object{
        return {serviceErrorName: error.name, typeError: error.toString().split(":")[1].trim()}
    };

    static verifyCond = (data) => {
        if(data != undefined && data != "" && data != null){
            return true
        };

        return false
    };
};