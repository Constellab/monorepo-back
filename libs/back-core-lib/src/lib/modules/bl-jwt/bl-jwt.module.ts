import {DynamicModule, Global, Module} from '@nestjs/common';
import {BL_JWT_CONFIG_PROVIDER, BlJwtConfig} from './bl-jwt.class';
import {BlJwtService} from './bl-jwt.service';
import {BlJwtStrategy} from './bl-jwt.strategy';
import {ModuleMetadata} from '@nestjs/common/interfaces';

export interface BlJwtModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<BlJwtConfig> | BlJwtConfig;
  inject?: any[];
}

@Global()
@Module({})
export class BlJwtModule {


  public static forRootAsync(asyncOptions: BlJwtModuleAsyncOptions): DynamicModule {
    return {
      module: BlJwtModule,
      imports: asyncOptions.imports,
      providers: [
        {
          provide: BL_JWT_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject
        },
        BlJwtService,
        BlJwtStrategy
      ],
      exports: [
        BlJwtService,
        BlJwtStrategy,
      ],
    };
  }
}
