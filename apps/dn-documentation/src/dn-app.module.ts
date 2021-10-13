import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DnDatabaseConfig } from './app/core/model/dn-database-config.class';
import { DnCoreConfigModule } from './app/core/modules/core-config/dn-core-config.module';
import { DnCoreConfigService } from './app/core/modules/core-config/dn-core-config.service';
import { DnDocumentationModule } from './app/documentation/dn-documentation.module';
import { DnVersionModule } from './app/version/dn-version.module';
import {DnUserModule} from './app/users/dn-user.module';
import {DnAuthModule} from './app/auth/dn-auth.module';
import {BlCookieHelper, BlExternalApiModule, BlJwtConfig, BlJwtModule} from '@monorepo/back-core-lib';
import {DnCoreModule} from './app/core/dn-core.module';
import {DnUserService} from './app/users/dn-user.service';
import {Request} from 'express';
import {jwtConfig} from './app/auth/jwt.config';
import {DnJwtAuthGuard} from './app/core/guards/dn-jwt-auth.guard';

function typeOrmConfig(configService: DnCoreConfigService): TypeOrmModuleOptions {
  const dbConfig: DnDatabaseConfig = configService.getDatabaseConfig();
  return {
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: configService.isLocal(), // only activate synchronization in local
    autoLoadEntities: true,
    maxQueryExecutionTime: 1000, // log query longer than 1s,
  };
}

function configureJwtModule(configService: DnCoreConfigService, userService: DnUserService): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) => BlCookieHelper.getCookieFromHeader(request.headers.cookie, jwtConfig.authorizationCookie),
    usersService: userService,
    tokenDurationInSeconds: jwtConfig.tokenDurationInSeconds
  };
}

@Module({
  imports: [
    // let the config module on top of the imports
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, 'environments', 'dev.env'),
    }),

    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [DnCoreConfigService],
      imports: [DnCoreConfigModule]
    }),

    BlJwtModule.forRootAsync({
      imports: [DnCoreModule, DnUserModule],
      useFactory: configureJwtModule,
      inject: [DnCoreConfigService, DnUserService]
    }),

    BlExternalApiModule,

    DnDocumentationModule,
    DnVersionModule,
    DnUserModule,
    DnAuthModule
  ],
  controllers: [],
  providers: [
    // set global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // set global guards
    {
      provide: APP_GUARD,
      useClass: DnJwtAuthGuard,
    }
  ]
})
export class AppModule {
}
