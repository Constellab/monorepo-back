import { DynamicModule, Global, Module } from '@nestjs/common';

import { BL_TRANSLATE_CONFIG_PROVIDER, BlTranslateConfig } from './bl-translate.class';
import { BlTranslateService } from './bl-translate.service';

@Global()
@Module({})
export class BlTranslateModule {
  public static forRoot(config: BlTranslateConfig): DynamicModule {
    return {
      module: BlTranslateModule,
      providers: [
        {
          provide: BL_TRANSLATE_CONFIG_PROVIDER,
          useValue: config,
        },
        BlTranslateService,
      ],
      exports: [BlTranslateService],
    };
  }
}
