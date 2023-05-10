import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { NestResponse } from './nest-response';
import { NestResponseBuilder } from './nest-response-builder';
import { utils } from 'src/utils/utils';

@Injectable()
export class JwtMiddleware extends AuthService implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {

    const token = "accesstoken" in req? req.headers.accesstoken.toString():"";
      
    if(utils.verifyCond(token)){
        const verify = await this.verifyToken(token, "access");
        console.log(verify)
            
  
        if(verify.name === 'TokenExpiredError') {
            res.status(HttpStatus.ACCEPTED).send({
                r: false, 
                data: {msg: "AccessTokenExpiredError!"},
                status: HttpStatus.BAD_REQUEST
            });
        };
  
        if(verify.name === "JsonWebTokenError"){
            res.status(HttpStatus.ACCEPTED).send( {
              r: false, 
              data: {info: utils.errorExternalServicesTreatment(verify), msg: "JsonWebAccessTokenError!"},
              status: HttpStatus.BAD_REQUEST
          });
        };
        
        /* res.status(HttpStatus.ACCEPTED).send({
            r: true, 
            data: {msg: "AccessTokenOk!"}, 
            status: HttpStatus.ACCEPTED
        }); */
        next();
      }
  
      res.status(HttpStatus.ACCEPTED).send({
          r: false, 
          data: {msg: "Nenhum accessToken encontrado!"},
          status: HttpStatus.BAD_REQUEST
      });
    };

};


