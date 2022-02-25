import {DynamicModule, Global, Module} from '@nestjs/common';
import {
  BL_CLIENT_PROXY_NAME,
  blGetRabbitMQUrl,
  BlTransportModuleAsyncOptions,
  BlTransportModuleConfig
} from './bl-transport-config.class';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {ClientProviderOptions} from '@nestjs/microservices/module/interfaces/clients-module.interface';
import {BlTransportService} from './bl-transport.service';

function configClientsModule(config: BlTransportModuleConfig): ClientProviderOptions {
  return {
    name: BL_CLIENT_PROXY_NAME,
    transport: Transport.RMQ,
    options: {
      urls: [blGetRabbitMQUrl(config.username, config.password, config.url, config.port)],
      queue: config.queue,
      queueOptions: {
        durable: false
      },
    },
  };
}

/**
 * Transport module to send message to RabbitMQ queue
 */
@Global()
@Module({})
export class BlTransportModule {

  public static forRootAsync(asyncOptions: BlTransportModuleAsyncOptions): DynamicModule {
    return {
      module: BlTransportModule,
      imports: [
        ...asyncOptions.imports,
        ClientsModule.registerAsync([
          {
            useFactory: (...args: any[]) => configClientsModule(asyncOptions.useFactory(...args)),
            name: BL_CLIENT_PROXY_NAME,
            inject: asyncOptions.inject,
            imports: asyncOptions.imports,
          }]
        ),
      ],
      providers: [BlTransportService],
      exports: [BlTransportService]
    };
  }
}
