import { JwtService } from '@nestjs/jwt';
import { BlTokenUser } from './bl-jwt.class';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlJwtService {
  constructor(private jwtService: JwtService) {}

  // generate a token with the userId and the userEmail
  public generateToken(userId: string, userEmail: string): string {
    // set the userId and email in the token
    const payload: BlTokenUser = { sub: userId, email: userEmail };
    return this.jwtService.sign(payload);
  }
}
