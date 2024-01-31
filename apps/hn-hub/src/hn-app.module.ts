import {ClassSerializerInterceptor, MiddlewareConsumer, Module, RequestMethod,} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {TypeOrmModule, TypeOrmModuleOptions} from '@nestjs/typeorm';
import {join} from 'path';
import {HnCoreConfigModule} from './app/core/modules/core-config/hn-core-config.module';
import {HnCoreConfigService} from './app/core/modules/core-config/hn-core-config.service';
import {HnDocumentationModule} from './app/brick-aggregate/documentation/hn-documentation.module';
import {HnUserModule} from './app/users/hn-user.module';
import {HnAuthModule} from './app/auth/hn-auth.module';
import {
  blConfigureLogger,
  BlCookieHelper,
  BlDbBackupModule,
  BlExternalApiModule,
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
  BlTransportModuleConfig,
} from '@monorepo/back-core-lib';
import {HnCoreModule} from './app/core/hn-core.module';
import {HnUserService} from './app/users/hn-user.service';
import {Request} from 'express';
import {hnJwtConfig} from './app/auth/hn-jwt.config';
import {HnJwtAuthGuard} from './app/core/guards/hn-jwt-auth.guard';
import {HnFolderModule} from './app/brick-aggregate/folder/hn-folder.module';
import {WinstonModule, WinstonModuleOptions} from 'nest-winston';
import {AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule} from 'nestjs-i18n';
import {clDefaultLang} from '@monorepo/core-lib';
import {HnBrickModule} from './app/brick-aggregate/brick/hn-brick.module';
import {HnBrickVersionModule} from './app/brick-aggregate/brick-version/hn-brick-version.module';
import {HnBrickMajorVersionModule} from './app/brick-aggregate/brick-major-version/hn-brick-major-version.module';
import {HnCoreExceptionHandlerFilter} from './app/core/filters/hn-core-exception-handler.filter';
import {HnTechnicalFolderModule} from './app/technical-folder/hn-technical-folder.module';
import {HnResourceModule} from './app/resource/hn-resource.module';
import {HnTaskModule} from './app/task/hn-task.module';
import {HnProtocolModule} from './app/protocol/hn-protocol.module';
import {HnBrickVersionReferenceModule} from './app/brick-version-reference/hn-brick-version-reference.module';
import {HnDatabaseConfig} from './app/core/model/config/hn-database-config.class';
import {HnStoryModule} from './app/story/hn-story.module';
import {HnTopicModule} from './app/topic/hn-topic.module';
import {HnStoryAuthorModule} from './app/story-author/hn-story-author.module';
import {HnStoryAuthorInviteModule} from './app/story-author-invite/hn-story-author-invite.module';
import {HnIsAdminGuard} from './app/core/guards/hn-is-admin.guard';
import {HnBrickUserModule} from './app/brick-aggregate/brick-user/hn-brick-user.module';
import {HnBrickUserInviteModule} from './app/brick-aggregate/brick-user-invite/hn-brick-user-invite.module';
import {HnBrickAggregateModule} from './app/brick-aggregate/hn-brick-aggregate.module';
import {ThrottlerModule} from '@nestjs/throttler';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {HnSpaceAggregateModule} from './app/space-aggregate/hn-space-aggregate.module';
import {HnSpaceModule} from './app/space-aggregate/space/hn-space.module';
import {HnSpaceUserModule} from './app/space-aggregate/space-user/hn-space-user.module';
import {HnLiveTaskModule} from './app/live-task-aggregate/live-task/hn-live-task.module';
import {HnLiveTaskVersionModule} from './app/live-task-aggregate/live-task-version/hn-live-task-version.module';
import {HnLiveTaskAggregateModule} from './app/live-task-aggregate/hn-live-task-aggregate.module';
import {
  HnLiveTaskVersionBrickDependenciesModule
} from './app/live-task-aggregate/live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.module';

function typeOrmConfig(
  configService: HnCoreConfigService,
  persistenceEventService: BlPersistenceEventService
): TypeOrmModuleOptions {
  const dbConfig: HnDatabaseConfig = configService.getDatabaseConfig();
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
    logger: persistenceEventService,
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
    jwtFromRequest: (request: Request) =>{
      return request.headers.authorization ?? BlCookieHelper.getCookieFromHeader(
        request.headers.cookie,
        hnJwtConfig.authorizationCookie
      )
    },
    usersService: userService,
    tokenDurationInSeconds: hnJwtConfig.tokenDurationInSeconds,
  };
}

function configureTransportModule(
  configService: HnCoreConfigService
): BlTransportModuleConfig {
  return configService.getTransportModuleConfig();
}

function configureMailModule(
  configService: HnCoreConfigService
): BlMailModuleConfig {
  return {
    mailConfig: configService.getMailConfig(),
    templateFolder: join(__dirname, 'assets/templates/'),
    defaultLayout: 'main-',
    defaultData: {contactMail: configService.getGencoveryContactMail()}
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
      inject: [HnCoreConfigService],
      imports: [HnCoreConfigModule, BlObjectStorageModule],
    }),

    I18nModule.forRoot({
      fallbackLanguage: clDefaultLang,
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(__dirname, 'assets/i18n/'),
        watch: true, //    // enable live translation
      },
      resolvers: [
        // retrieve the language from the cookie (define to avoid error but not really used)
        {use: CookieResolver, options: 'lang'},
        AcceptLanguageResolver
      ],
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

    BlMailModule.forRootAsync({
      imports: [HnCoreModule],
      useFactory: configureMailModule,
      inject: [HnCoreConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    EventEmitterModule.forRoot(),

    HnCoreModule,
    BlPersistenceEventModule,
    BlObjectStorageModule,
    BlDbBackupModule,

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
    HnProtocolModule,
    HnBrickVersionReferenceModule,
    HnStoryModule,
    HnTopicModule,
    HnStoryAuthorModule,
    HnStoryAuthorInviteModule,
    HnBrickUserModule,
    HnBrickUserInviteModule,
    HnBrickAggregateModule,

    HnSpaceModule,
    HnSpaceUserModule,
    HnSpaceAggregateModule,

    HnLiveTaskModule,
    HnLiveTaskVersionModule,
    HnLiveTaskVersionBrickDependenciesModule,
    HnLiveTaskAggregateModule
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
    {
      provide: APP_GUARD,
      useClass: HnIsAdminGuard,
    }
  ],
})
export class HnAppModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      // register the RequestContextMiddleware to be able to access the request anywhere
      .apply(BlRequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
