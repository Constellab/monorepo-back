import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CnUsersModule } from './app/cn-users/cn-users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnAuthModule } from './app/cn-auth/cn-auth.module';
import { ConfigModule } from '@nestjs/config';
import { CnCoreModule } from './app/cn-core/cn-core.module';
import { CnProjectsModule } from './app/cn-projects-aggregate/cn-projects/cn-projects.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CnCoreConfigService } from './app/cn-core/modules/cn-core-config/cn-core-config.service';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { CnCoreConfigModule } from './app/cn-core/modules/cn-core-config/cn-core-config.module';
import { AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { CnLabConfigsModule } from './app/cn-lab-configs/cn-lab-configs.module';
import { CnExperimentsModule } from './app/cn-projects-aggregate/cn-experiments/cn-experiments.module';
import { CnBricksModule } from './app/cn-bricks/cn-bricks.module';
import { CnGroupsModule } from './app/cn-groups/cn-groups.module';
import { CnSpacesModule } from './app/cn-spaces/cn-spaces.module';
import { CnLabInstancesModule } from './app/cn-lab-instances/cn-lab-instances.module';
import { CnJwtAuthGuard } from './app/cn-core/guards/cn-jwt-auth.guard';
import { CnUserCategoryGuard } from './app/cn-core/guards/cn-user-category-guard.service';
import { CnExternalLabsModule } from './app/cn-external-labs/cn-external-labs.module';
import { CnCoreExceptionHandlerFilter } from './app/cn-core/filters/cn-core-exception-handler.filter';
import { CnReportsModule } from './app/cn-projects-aggregate/cn-reports/cn-reports.module';
import { clDefaultLang } from '@monorepo/core-lib';
import { CnFrontErrorsModule } from './app/cn-front-errors/cn-front-errors.module';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import {
  BlCaptchaModule,
  BlCaptchaModuleConfig,
  blConfigureLogger,
  BlCookieHelper,
  BlDbBackupModule,
  BlJwtConfig,
  BlJwtModule,
  BlLoggerConfig,
  BlMailModule,
  BlMailModuleConfig,
  BlObjectStorageModule,
  BlPersistenceEventModule,
  BlPersistenceEventService,
  BlRequestContextMiddleware,
  BlTransportModule,
  BlTransportModuleConfig
} from '@monorepo/back-core-lib';
import { cnJwtConfig } from './app/cn-auth/cn-jwt.config';
import { Request } from 'express';
import { CnUsersService } from './app/cn-users/cn-users.service';
import { CnDatabaseConfig } from './app/cn-core/model/config/cn-config.class';
import { SnSmartDbModule } from './app/sn-smart-db/sn-smart-db.module';
import { CnProjectsAggregateModule } from './app/cn-projects-aggregate/cn-project-aggregate.module';
import { CnStatsModule } from './app/cn-stats/cn-stats.module';
import { CnCountryModule } from './app/cn-country/cn-country.module';
import { CnCityModule } from './app/cn-city/cn-city.module';
import { AppService } from './app.service';
import { CnSpaceMiddleware } from './app/cn-core/middleware/cn-space-middleware.service';
import { CnNotificationModule } from './app/cn-notification/cn-notification.module';
import { CnProjectCommentModule } from './app/cn-project-comment/cn-project-comment.module';
import { CnCloudProvidersModule } from './app/cn-cloud-providers/cn-cloud-providers.module';
import { I18nAbstractLoaderOptions } from 'nestjs-i18n/dist/loaders/i18n.abstract.loader';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CnActivityModule } from './app/cn-activity/cn-activity.module';
import { CnUserAccountModule } from './app/cn-users/cn-user-accounts/cn-user-account.module';
import { CnServerAggregateModule } from './app/cn-servers-info/cn-server-aggregate.module';
import { CnSettingsModule } from './app/cn-settings/cn-settings.module';

function typeOrmConfig(configService: CnCoreConfigService, persistenceEventService: BlPersistenceEventService): TypeOrmModuleOptions {
  const dbConfig: CnDatabaseConfig = configService.getDatabaseConfig();
  return {
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    // TODO TO see
    synchronize: configService.isDev() && false, // only activate synchronization in local
    autoLoadEntities: true,
    maxQueryExecutionTime: 1000, // log query longer than 1s,
    logger: persistenceEventService,
    bigNumberStrings: false,
    charset: 'utf8mb4',
    // logging: true // use to enable query logging, the logger must be disabled
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
      BlCookieHelper.getCookieFromHeader(
        request.headers.cookie,
        cnJwtConfig.authorizationCookie
      ),
    usersService: userService,
    tokenDurationInSeconds: cnJwtConfig.tokenDurationInSeconds,
  };
}

function configureMailModule(configService: CnCoreConfigService): BlMailModuleConfig {
  return {
    mailConfig: configService.getMailConfig(),
    templateFolder: join(__dirname, 'assets/templates/'),
    defaultLayout: 'main-',
    defaultData: {contactMail: configService.getCustomerSuccessMail()}
  };
}

function configureTransportModule(configService: CnCoreConfigService): BlTransportModuleConfig {
  return configService.getTransportModuleConfig();
}

function configureCaptchaModule(configService: CnCoreConfigService): BlCaptchaModuleConfig {
  return {
    secretKey: configService.getCaptchaSecretKey(),
    localEnv: configService.isLocal(),
  };
}

@Module({
  imports: [
    // let the config module on top of the imports
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, 'environments', 'dev.env'),
    }),

    CnCoreConfigModule.forRoot({distFolder: join(__dirname)}),

    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [CnCoreConfigService],
      imports: [BlPersistenceEventModule],
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
        {use: CookieResolver, options: 'lang'},
        AcceptLanguageResolver
      ],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    BlPersistenceEventModule,

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

    BlMailModule.forRootAsync({
      imports: [CnCoreModule],
      useFactory: configureMailModule,
      inject: [CnCoreConfigService],
    }),


    BlTransportModule.forRootAsync({
      useFactory: configureTransportModule,
      imports: [CnCoreModule],
      inject: [CnCoreConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    BlCaptchaModule.forRootAsync({
      useFactory: configureCaptchaModule,
      imports: [CnCoreModule],
      inject: [CnCoreConfigService],
    }),

    // Entities module
    CnUsersModule,
    CnAuthModule,
    CnUserAccountModule,
    CnLabConfigsModule,
    CnProjectsAggregateModule,
    CnExperimentsModule,
    CnProjectsModule,
    CnReportsModule,
    CnBricksModule,
    CnGroupsModule,
    CnSpacesModule,
    CnLabInstancesModule,
    CnExternalLabsModule,
    CnServerAggregateModule,
    CnFrontErrorsModule,
    SnSmartDbModule,
    CnStatsModule,
    CnCountryModule,
    CnCityModule,
    CnNotificationModule,
    CnProjectCommentModule,
    CnCloudProvidersModule,
    CnActivityModule,
    CnSettingsModule,
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
    }
  ],
})
export class CnAppModule implements NestModule {

  configure(consumer: MiddlewareConsumer): any {
    consumer
      // register the RequestContextMiddleware to be able to access the request anywhere
      .apply(BlRequestContextMiddleware, CnSpaceMiddleware)
      .forRoutes({path: '*', method: RequestMethod.ALL});
  }
}
