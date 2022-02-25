import {ModuleMetadata} from '@nestjs/common/interfaces';

export interface BlTransportModuleConfig {
  queue: string;
  username: string;
  password: string;
  url: string;
  port: number | string;
}

export interface BlTransportModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => BlTransportModuleConfig;
  inject?: any[];
}

export const BL_CLIENT_PROXY_NAME = 'CLIENT_SERVICE';

/**
 * Function to build the RabbitMQ url from information
 */
export function blGetRabbitMQUrl(username: string, password: string, url: string, port: number | string): string {
  const fullUrl = `amqp://${username}:${password}@${url}:${port}`;
  console.log(fullUrl);
  return fullUrl;
}

export const blTransportQueueHub = 'hub_queue';
