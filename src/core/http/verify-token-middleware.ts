import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { NestResponse } from './nest-response';
import { NestResponseBuilder } from './nest-response-builder';

@Injectable()
export class JwtMiddleware extends AuthService implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
      
      const token = "accesstoken" in req? req.headers.accesstoken.toString():"";
   /*  console.log(token)

    const data = await this.verifyAccessTokenPass(token);

    console.log(data) */
    
    /* const response = new NestResponseBuilder()
    .comStatus(data.status)
    .comHeaders({
        'Info': data.r
    })
    .comBody(data)
    .build(); */
    
    /* if(data.r){
        next();
    }else{
        res.status(data.status).send(data);
    }; */

    try {
        const data = await this.verifyAccessTokenPass(token);

        console.log(data)
        if(!data.r) throw data
        next();
    } catch (error) {
        console.log(error)
        res.status(error.status).send(error);
    }
  }
}

