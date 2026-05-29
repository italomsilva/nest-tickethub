import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { ITokenGateway } from '../../application/gateways/token.gateway';

@Injectable()
export class JwtTokenGateway implements ITokenGateway {
  private readonly secret = process.env.JWT_SECRET || 'tickethub-jwt-secret-key-12345';
  private readonly expiresIn = '1d';

  async generate(payload: any): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  async verify(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }
}
