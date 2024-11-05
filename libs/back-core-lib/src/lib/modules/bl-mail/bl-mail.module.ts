import { DynamicModule, Global, Module } from '@nestjs/common';
import { BlMailService } from './bl-mail.service';
import { BL_MAIL_CONFIG_PROVIDER, BlMailModuleAsyncOptions } from './bl-mail.class';
import { BlTranslateModule } from '../bl-translate/bl-translate.module';

@Global()
@Module({})
export class BlMailModule {
  public static forRootAsync(asyncOptions: BlMailModuleAsyncOptions): DynamicModule {
    return {
      module: BlMailModule,
      imports: [...asyncOptions.imports, BlTranslateModule],
      providers: [
        {
          provide: BL_MAIL_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        BlMailService,
      ],
      exports: [BlMailService],
    };
  }
}
