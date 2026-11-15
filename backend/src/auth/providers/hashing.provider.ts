import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
    abstract comparePassword(rawPassword: string, encryptPassword: string):Promise<boolean>
    abstract hashPassword(encryptPassword: string):Promise<string>
}
