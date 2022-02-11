import {DynamicModule, Global, Module} from '@nestjs/common';
import {BlObjectStorageService} from './bl-object-storage.service';
import {BL_OBJECT_STORAGE_CONFIG_PROVIDER, BlObjectStorageModuleAsyncOptions} from './bl-object-storage.class';

@Global()
@Module({})
export class BlObjectStorageModule {

  public static forRootAsync(asyncOptions: BlObjectStorageModuleAsyncOptions): DynamicModule {
    return {
      module: BlObjectStorageModule,
      imports: [...asyncOptions.imports],
      providers: [
        {
          provide: BL_OBJECT_STORAGE_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject
        },
        BlObjectStorageService,
      ],
      exports: [BlObjectStorageService]
    };
  }
}
