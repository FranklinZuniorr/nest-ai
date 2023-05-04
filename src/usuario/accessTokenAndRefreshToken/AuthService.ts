import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { refreshDto } from './refreshAndAccessDto';
import { response } from 'src/responseDto/response';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  protected async generateAccessToken(payload: object): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  }

  protected async generateRefreshToken(payload: object): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  }

  protected async verifyToken(token: string, type: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: type == "refresh"? process.env.REFRESH_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET
      });
      return payload;
    } catch (err) {
      return err
    }
  }

  public async verifyRefreshTokenAndGenerateTokens(refreshToken: refreshDto): Promise<response>{

    console.log(refreshToken.refreshToken)

    if(refreshToken.refreshToken != undefined){

      const verify = await this.verifyToken(refreshToken.refreshToken, "refresh");
  
      if(verify.name === 'TokenExpiredError') {
          return {
              r: false, 
              data: {...verify, name: "RefreshTokenExpiredError"},
              status: HttpStatus.BAD_REQUEST
          }
      }

      if(verify.name === "JsonWebTokenError"){
        return {
            r: false, 
            data: verify.toString().split(":")[1].trim(),
            status: HttpStatus.BAD_REQUEST
        }
      }
  
      return {
          r: true, 
          data: {
              msg: "RefreshTokenOk",
              token: await this.generateAccessToken({user: verify.user.email, type: "acces"}), 
              refreshToken: await this.generateRefreshToken({user: verify.user.email, type: "refresh"})
          }, 
          status: HttpStatus.ACCEPTED
      };
    }

    return {
      r: false, 
      data: "Nenhum refreshToken encontrado",
      status: HttpStatus.BAD_REQUEST
  }

  }

  public async verifyAccessTokenPass(accessToken: string): Promise<response>{

    if(accessToken != ""){
      const verify = await this.verifyToken(accessToken, "access");
      console.log(verify)
          

      if(verify.name === 'TokenExpiredError') {
          return {
              r: false, 
              data: "AccessTokenExpiredError",
              status: HttpStatus.BAD_REQUEST
          }
      }

      if(verify.name === "JsonWebTokenError"){
          return {
              r: false, 
              data: verify.toString().split(":")[1].trim(),
              status: HttpStatus.BAD_REQUEST
          }
      }
      
      return {
          r: true, 
          data: "AccessTokenOk", 
          status: HttpStatus.ACCEPTED
      };
    }

    return {
        r: false, 
        data: "Nenhum accessToken encontrado",
        status: HttpStatus.BAD_REQUEST
    }

  }
}
