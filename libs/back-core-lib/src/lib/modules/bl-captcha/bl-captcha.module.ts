import {DynamicModule, Global, Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {BlCaptchaService} from './bl-captcha.service';
import {BL_CAPTCHA_CONFIG_PROVIDER, BlCaptchaModuleConfigAsyncConfig} from './bl-captcha.class';
import {BlExternalApiModule} from '../bl-external-api/bl-external-api.module';

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
          inject: config.inject
        },
        BlCaptchaService
      ],
      exports: [BlCaptchaService]
    };
  }
}
