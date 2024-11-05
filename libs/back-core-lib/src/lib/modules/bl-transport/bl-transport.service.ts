import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { BL_CLIENT_PROXY_NAME } from './bl-transport-config.class';

@Injectable()
export class BlTransportService {
  constructor(@Inject(BL_CLIENT_PROXY_NAME) private client: ClientProxy) {}

  public send<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult> {
    return this.client.send(pattern, data);
  }

  public emit<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult> {
    return this.client.emit(pattern, data);
  }

  public connect(): Promise<any> {
    return this.client.connect();
  }

  public close(): any {
    return this.client.close();
  }
}
