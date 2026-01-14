import {
  blConfigureLogger,
  BlCookieHelper,
  BlDbBackupModule,
  BlJwtConfig,
  BlJwtModule,
  BlLoggerConfig,
  BlMailModule,
  BlObjectStorageModule,
  BlRequestContextMiddleware,
  BlTranslateModule,
  BlTransportModuleConfig,
  blTransportRedisForRoot,
} from '@monorepo/back-core-lib';
import { clDefaultLang } from '@monorepo/core-lib';
import { TeRichTextModifications } from '@monorepo/te-text-editor';
import { BullModule } from '@nestjs/bullmq';
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { Request } from 'express';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { I18nAbstractLoaderOptions } from 'nestjs-i18n/dist/loaders/i18n.abstract.loader';
import { join } from 'path';

import { AppService } from './app.service';
import { CnActivityModule } from './app/cn-activity/cn-activity.module';
import { CnAuthModule } from './app/cn-auth/cn-auth.module';
import { cnJwtConfig } from './app/cn-auth/cn-jwt.config';
import { CnBricksModule } from './app/cn-bricks/cn-bricks.module';
import { CnCityModule } from './app/cn-city/cn-city.module';
import { CnCloudProvidersModule } from './app/cn-cloud-providers/cn-cloud-providers.module';
import { CnCommunityModule } from './app/cn-community/cn-community.module';
import { CnCoreModule } from './app/cn-core/cn-core.module';
import { CnCoreExceptionHandlerFilter } from './app/cn-core/filters/cn-core-exception-handler.filter';
import { CnJwtAuthGuard } from './app/cn-core/guards/cn-jwt-auth.guard';
import { CnUserCategoryGuard } from './app/cn-core/guards/cn-user-category-guard.service';
import { CnLogRequestMiddleware } from './app/cn-core/middleware/cn-log-request-middleware.service';
import { CnDatabaseConfig } from './app/cn-core/model/config/cn-config.class';
import { CnMailConfig } from './app/cn-core/model/config/cn-mail.config';
import { CnCoreConfigModule } from './app/cn-core/modules/cn-core-config/cn-core-config.module';
import { CnCoreConfigService } from './app/cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from './app/cn-core/utils/cn-current-user.helper';
import { CnCountryModule } from './app/cn-country/cn-country.module';
import { CnExternalLabsModule } from './app/cn-external-labs/cn-external-labs.module';
import { CnFoldersAggregateModule } from './app/cn-folders-aggregate/cn-folders-aggregate.module';
import { CnHierarchyObjectTokenModule } from './app/cn-folders-aggregate/cn-hierarchy-object-token/cn-hierarchy-object-token.module';
import { CnNotesModule } from './app/cn-folders-aggregate/cn-notes/cn-notes.module';
import { CnScenariosModule } from './app/cn-folders-aggregate/cn-scenarios/cn-scenarios.module';
import { CnFrontErrorsModule } from './app/cn-front-errors/cn-front-errors.module';
import { CnGroupsModule } from './app/cn-groups/cn-groups.module';
import { CnLabConfigsModule } from './app/cn-lab-configs/cn-lab-configs.module';
import { CnLabsModule } from './app/cn-labs/cn-labs.module';
import { CnNotificationModule } from './app/cn-notification/cn-notification.module';
import { CnServerAggregateModule } from './app/cn-servers-info/cn-server-aggregate.module';
import { CnSettingsModule } from './app/cn-settings/cn-settings.module';
import { CnSpacesModule } from './app/cn-spaces/cn-spaces.module';
import { CnStatsModule } from './app/cn-stats/cn-stats.module';
import { CnUserDeletionAggregateModule } from './app/cn-user-deletion-aggregate/cn-user-deletion-aggregate.module';
import { CnUserAccountModule } from './app/cn-users/cn-user-accounts/cn-user-account.module';
import { CnUsersModule } from './app/cn-users/cn-users.module';
import { CnUsersService } from './app/cn-users/cn-users.service';

function typeOrmConfig(configService: CnCoreConfigService): TypeOrmModuleOptions {
  const dbConfig: CnDatabaseConfig = configService.getDatabaseConfig();
  return {
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    // disable for start speed, can be enabled to synchronize the database
    synchronize: configService.isDev() && false, // only activate synchronization in local
    autoLoadEntities: true,
    maxQueryExecutionTime: 1000, // log query longer than 1s,
    bigNumberStrings: false,
    charset: 'utf8mb4',
    logging: false, // use to enable query logging, the logger must be disabled
  };
}

function configureLogger(configService: CnCoreConfigService): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? null : configService.getLogPath(),
  };
  return blConfigureLogger(logConfig);
}

function configureJwtModule(configService: CnCoreConfigService, userService: CnUsersService): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) =>
      BlCookieHelper.getCookieFromHeader(request.headers.cookie, cnJwtConfig.authorizationCookie),
    usersService: userService,
    tokenDurationInSeconds: cnJwtConfig.tokenDurationInSeconds,
  };
}

function configureTransportModule(configService: CnCoreConfigService): BlTransportModuleConfig {
  return configService.getTransportModuleConfig();
}

// configure the text editor
TeRichTextModifications.setBackTimeDifference();

@Module({
  imports: [
    // let the config module on top of the imports
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, 'environments', 'cn-dev.env'),
    }),

    CnCoreConfigModule.forRoot({ distFolder: join(__dirname) }),

    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [CnCoreConfigService],
    }),

    I18nModule.forRoot({
      fallbackLanguage: clDefaultLang,
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(__dirname, 'assets/i18n/'),
        watch: true, //    // enable live translation
      } as I18nAbstractLoaderOptions,
      resolvers: [
        // retrieve the language from the cookie (define to avoid error but not really used)
        { use: CookieResolver, options: 'lang' },
        AcceptLanguageResolver,
      ],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Custom module
    CnCoreModule,
    BlObjectStorageModule,
    BlDbBackupModule,

    // set up the logging module
    WinstonModule.forRootAsync({
      imports: [CnCoreModule],
      useFactory: configureLogger,
      inject: [CnCoreConfigService],
    }),

    BlJwtModule.forRootAsync({
      imports: [CnCoreModule, CnUsersModule],
      useFactory: configureJwtModule,
      inject: [CnCoreConfigService, CnUsersService],
    }),

    BullModule.forRootAsync(
      blTransportRedisForRoot({
        useFactory: configureTransportModule,
        imports: [CnCoreModule],
        inject: [CnCoreConfigService],
      })
    ),

    BlTranslateModule.forRoot({
      getCurrentUserLang: () => CnCurrentUserHelper.getCurrentUser()?.lang ?? null,
    }),

    BlMailModule.forRootAsync(
      CnMailConfig.configureMailModule(),
      CnMailConfig.queueName,
      CnMailConfig.mailServiceType,
      CnMailConfig.processorType,
      CnMailConfig.currentUserIsAdmin
    ),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),

    // Entities module
    CnUsersModule,
    CnAuthModule,
    CnUserAccountModule,
    CnUserDeletionAggregateModule,
    CnLabConfigsModule,
    CnFoldersAggregateModule,
    CnScenariosModule,
    CnNotesModule,
    CnBricksModule,
    CnGroupsModule,
    CnSpacesModule,
    CnLabsModule,
    CnExternalLabsModule,
    CnServerAggregateModule,
    CnFrontErrorsModule,
    CnStatsModule,
    CnCountryModule,
    CnCityModule,
    CnNotificationModule,
    CnCloudProvidersModule,
    CnActivityModule,
    CnSettingsModule,
    CnCommunityModule,
    // TODO to see if we can remove this
    CnHierarchyObjectTokenModule,
  ],
  controllers: [],
  providers: [
    AppService,
    // set global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // set global exception handler
    {
      provide: APP_FILTER,
      useClass: CnCoreExceptionHandlerFilter,
    },

    // set global guards
    {
      provide: APP_GUARD,
      useClass: CnJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CnUserCategoryGuard,
    },
  ],
})
export class CnAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      // register the RequestContextMiddleware to be able to access the request anywhere
      .apply(BlRequestContextMiddleware, CnLogRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
