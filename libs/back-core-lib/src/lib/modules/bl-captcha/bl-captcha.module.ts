import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { BlExternalApiModule } from '../bl-external-api/bl-external-api.module';
import { BL_CAPTCHA_CONFIG_PROVIDER, BlCaptchaModuleConfigAsyncConfig } from './bl-captcha.class';
import { BlCaptchaService } from './bl-captcha.service';

@Global()
@Module({})
export class BlCaptchaModule {
  public static forRootAsync(config: BlCaptchaModuleConfigAsyncConfig): DynamicModule {
    return {
      module: BlCaptchaModule,
      imports: [...config.imports, BlExternalApiModule],
      providers: [
        {
          provide: BL_CAPTCHA_CONFIG_PROVIDER,
          useFactory: config.useFactory,
          inject: config.inject,
        },
        BlCaptchaService,
      ],
      exports: [BlCaptchaService],
    };
  }
}
