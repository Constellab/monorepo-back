import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DnDatabaseConfig } from './app/core/model/hn-database-config.class';
import { HnCoreConfigModule } from './app/core/modules/core-config/hn-core-config.module';
import { HnCoreConfigService } from './app/core/modules/core-config/hn-core-config.service';
import { HnDocumentationModule } from './app/documentation/hn-documentation.module';
import { HnUserModule } from './app/users/hn-user.module';
import { HnAuthModule } from './app/auth/hn-auth.module';
import {
  blConfigureLogger,
  BlCookieHelper,
  BlExternalApiModule,
  BlJwtConfig,
  BlJwtModule,
  BlLoggerConfig,
  BlObjectStorageModule,
  BlObjectStorageModuleConfig,
  BlRequestContextMiddleware,
  BlTransportModule,
  BlTransportModuleConfig,
} from '@monorepo/back-core-lib';
import { HnCoreModule } from './app/core/hn-core.module';
import { HnUserService } from './app/users/hn-user.service';
import { Request } from 'express';
import { jwtConfig } from './app/auth/jwt.config';
import { HnJwtAuthGuard } from './app/core/guards/hn-jwt-auth.guard';
import { HnFolderModule } from './app/folder/hn-folder.module';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import { clDefaultLang } from '@monorepo/core-lib';
import { HnBrickModule } from './app/brick/hn-brick.module';
import { HnBrickVersionModule } from './app/brick-version/hn-brick-version.module';
import { HnBrickMajorVersionModule } from './app/brick-major-version/hn-brick-major-version.module';
import { HnCoreExceptionHandlerFilter } from './app/core/filters/hn-core-exception-handler.filter';
import { HnTechnicalFolderModule } from './app/technical-folder/hn-technical-folder.module';
import { HnResourceModule } from './app/resource/hn-resource.module';
import { HnTaskModule } from './app/task/hn-task.module';

function typeOrmConfig(
  configService: HnCoreConfigService
): TypeOrmModuleOptions {
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

function configureLogger(
  configService: HnCoreConfigService
): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? null : configService.getLogPath(),
  };
  return blConfigureLogger(logConfig);
}

function configureJwtModule(
  configService: HnCoreConfigService,
  userService: HnUserService
): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) =>
      BlCookieHelper.getCookieFromHeader(
        request.headers.cookie,
        jwtConfig.authorizationCookie
      ),
    usersService: userService,
    tokenDurationInSeconds: jwtConfig.tokenDurationInSeconds,
  };
}

function configureTransportModule(
  configService: HnCoreConfigService
): BlTransportModuleConfig {
  return configService.getTransportModuleConfig();
}

function configureObjectStorageModule(
  configService: HnCoreConfigService
): BlObjectStorageModuleConfig {
  return configService.getObjectStorageConfig();
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
      inject: [HnCoreConfigService],
      imports: [HnCoreConfigModule],
    }),

    I18nModule.forRoot({
      fallbackLanguage: clDefaultLang,
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, 'assets/i18n/'),
        watch: true, //    // enable live translation
      },
    }),

    // setup the logging module
    WinstonModule.forRootAsync({
      imports: [HnCoreModule],
      useFactory: configureLogger,
      inject: [HnCoreConfigService],
    }),

    BlJwtModule.forRootAsync({
      imports: [HnCoreModule, HnUserModule],
      useFactory: configureJwtModule,
      inject: [HnCoreConfigService, HnUserService],
    }),

    BlTransportModule.forRootAsync({
      useFactory: configureTransportModule,
      imports: [HnCoreModule],
      inject: [HnCoreConfigService],
    }),

    HnCoreModule,

    BlObjectStorageModule.forRootAsync({
      imports: [HnCoreModule],
      useFactory: configureObjectStorageModule,
      inject: [HnCoreConfigService],
    }),

    BlExternalApiModule,

    HnDocumentationModule,
    HnBrickModule,
    HnBrickVersionModule,
    HnBrickMajorVersionModule,
    HnUserModule,
    HnAuthModule,
    HnFolderModule,
    HnTechnicalFolderModule,
    HnResourceModule,
    HnTaskModule,
  ],
  controllers: [],
  providers: [
    // set global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // set global exception handler
    {
      provide: APP_FILTER,
      useClass: HnCoreExceptionHandlerFilter,
    },
    // set global guards
    {
      provide: APP_GUARD,
      useClass: HnJwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      // register the RequestContextMiddleware to be able to access the request anywhere
      .apply(BlRequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
