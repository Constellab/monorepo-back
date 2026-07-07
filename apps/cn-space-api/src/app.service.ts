import { Injectable } from '@nestjs/common';

@Injectable()
export class CnAppService {
  getData(): { message: string } {
    return { message: 'Welcome to nest-app-test!' };
  }
}
