import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
        secret: type == "refresh"? process.env.REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
      });
      return payload;
    } catch (err) {
      return err;
    }
  }
}
