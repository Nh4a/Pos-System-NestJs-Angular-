import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BycryptProvider implements HashingProvider {
  public comparePassword(
    rawPassword: string,
    encryptedPassword: string,
  ): Promise<boolean> {
    // return bycrpt.com
    return bcrypt.compare(rawPassword.toString(), encryptedPassword);
  }
  public async hashPassword(rawPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(rawPassword, salt);
  }
}
