import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { JwtModule } from '@nestjs/jwt';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { PassportModule } from '@nestjs/passport';

import { BL_JWT_CONFIG_PROVIDER, BlJwtConfig } from './bl-jwt.class';
import { BlJwtService } from './bl-jwt.service';
import { BlJwtStrategy } from './bl-jwt.strategy';

export interface BlJwtModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => BlJwtConfig;
  inject?: any[];
}

// use to configure the JWTModule from the config of the BlJwtModule
async function configureJwtModule(blJwtConfig: BlJwtConfig): Promise<JwtModuleOptions> {
  return {
    secret: blJwtConfig.jwtSecret,
    signOptions: { expiresIn: blJwtConfig.tokenDurationInSeconds },
  };
}

@Global()
@Module({
  imports: [],
})
export class BlJwtModule {
  public static forRootAsync(asyncOptions: BlJwtModuleAsyncOptions): DynamicModule {
    return {
      module: BlJwtModule,
      imports: [
        ...asyncOptions.imports,

        // Retrieve the BlJwtConfig by calling the factory method and configure the JwtModule
        JwtModule.registerAsync({
          useFactory: (...args: any[]) => configureJwtModule(asyncOptions.useFactory(...args)),
          inject: asyncOptions.inject,
          imports: asyncOptions.imports,
        }),
        PassportModule,
      ],
      providers: [
        {
          provide: BL_JWT_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        BlJwtService,
        BlJwtStrategy,
      ],
      exports: [BlJwtService, BlJwtStrategy],
    };
  }
}
