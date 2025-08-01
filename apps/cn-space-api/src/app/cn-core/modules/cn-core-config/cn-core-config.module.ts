import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CnCoreConfigController } from './cn-core-config.controller';
import { CnCoreConfigService } from './cn-core-config.service';
import { CN_CORE_MODULE_CONFIG, CnCoreConfigModuleConfig } from './cn-core-module-config.class';

@Module({})
export class CnCoreConfigModule {
  public static forRoot(config: CnCoreConfigModuleConfig): DynamicModule {
    return {
      global: true,
      module: CnCoreConfigModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: CN_CORE_MODULE_CONFIG,
          useValue: config,
        },
        CnCoreConfigService,
      ],
      exports: [CnCoreConfigService],
      controllers: [CnCoreConfigController],
    };
  }
}
