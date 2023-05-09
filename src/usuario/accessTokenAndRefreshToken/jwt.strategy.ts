import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './AuthService';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(payload.req);
      await this.authService.verifyToken(token, 'access');
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
