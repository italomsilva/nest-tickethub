import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { IHashGateway } from '../../application/gateways/hash.gateway';

@Injectable()
export class BcryptHashGateway implements IHashGateway {
  private readonly rounds = 10;

  async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, this.rounds);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
