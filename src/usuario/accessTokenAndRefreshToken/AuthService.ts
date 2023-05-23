import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { refreshDto } from './refreshAndAccessDto';
import { utils } from 'src/utils/utils';
import { response } from 'src/core/http/responseDto/response';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {};

  public async generateAccessToken(payload: object): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  };

  public async generateRefreshToken(payload: object): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  };

  public async verifyToken(token: string, type: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: type == "refresh"? process.env.REFRESH_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET
      });
      return payload;
    } catch (err) {
      return err
    };
  };

  public async verifyRefreshTokenAndGenerateTokens(refreshToken: refreshDto): Promise<response>{

    console.log(refreshToken.refreshToken)

    if(utils.verifyCond(refreshToken.refreshToken)){

      const verify = await this.verifyToken(refreshToken.refreshToken, "refresh");
  
      if(verify.name === 'TokenExpiredError') {
          return {
              r: false, 
              data: {...verify, msg: "RefreshTokenExpiredError!"},
              status: HttpStatus.BAD_REQUEST
          };
      };

      if(verify.name === "JsonWebTokenError"){
        return {
            r: false, 
            data: {info: utils.errorExternalServicesTreatment(verify), msg: "JsonWebRefreshTokenError!"},
            status: HttpStatus.BAD_REQUEST
        };
      };
  
      return {
          r: true, 
          data: {
              msg: "RefreshTokenOk!",
              token: await this.generateAccessToken({user: {id: verify.user.id}, type: "access"}), 
              refreshToken: await this.generateRefreshToken({user: verify.user.email, type: "refresh"})
          }, 
          status: HttpStatus.ACCEPTED
      };
    }

    return {
      r: false, 
      data: {msg: "Nenhum refreshToken encontrado!"},
      status: HttpStatus.BAD_REQUEST
    };

  };

  public async verifyAccessTokenPass(accessToken: string): Promise<response>{

    if(utils.verifyCond(accessToken)){
      const verify = await this.verifyToken(accessToken, "access");
      console.log(verify)
          

      if(verify.name === 'TokenExpiredError') {
          return {
              r: false, 
              data: {msg: "AccessTokenExpiredError!"},
              status: HttpStatus.BAD_REQUEST
          };
      };

      if(verify.name === "JsonWebTokenError"){
        return {
            r: false, 
            data: {info: utils.errorExternalServicesTreatment(verify), msg: "JsonWebAccessTokenError!"},
            status: HttpStatus.BAD_REQUEST
        };
      };
      
      return {
          r: true, 
          data: {msg: "AccessTokenOk!"}, 
          status: HttpStatus.ACCEPTED
      };
    }

    return {
        r: false, 
        data: {msg: "Nenhum accessToken encontrado!"},
        status: HttpStatus.BAD_REQUEST
    };

  };
};
