import {ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {CnUsersModule} from './app/cn-users/cn-users.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnAuthModule} from './app/cn-auth/cn-auth.module';
import {ConfigModule} from '@nestjs/config';
import {CnCoreModule} from './app/cn-core/cn-core.module';
import {CnProjectsModule} from './app/cn-projects/cn-projects.module';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {CnCoreConfigService} from './app/cn-core/modules/cn-core-config/cn-core-config.service';
import {TypeOrmModuleOptions} from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import {CnCoreConfigModule} from './app/cn-core/modules/cn-core-config/cn-core-config.module';
import {I18nJsonParser, I18nModule} from 'nestjs-i18n';
import {join} from 'path';
import {CnLabsModule} from './app/cn-labs/cn-labs.module';
import {CnExperimentsModule} from './app/cn-experiments/cn-experiments.module';
import {CnBricksModule} from './app/cn-bricks/cn-bricks.module';
import {CnGroupsModule} from './app/cn-groups/cn-groups.module';
import {CnOrganizationsModule} from './app/cn-organizations/cn-organizations.module';
import {CnLabInstancesModule} from './app/cn-lab-instances/cn-lab-instances.module';
import {CnJwtAuthGuard} from './app/cn-core/guards/cn-jwt-auth.guard';
import {CnUserCategoryGuard} from './app/cn-core/guards/cn-user-category-guard.service';
import {CnExternalLabsModule} from './app/cn-external-labs/cn-external-labs.module';
import {CnServersInfoModule} from './app/cn-servers-info/cn-servers-info.module';
import {CnCoreExceptionHandlerFilter} from './app/cn-core/filters/cn-core-exception-handler.filter';
import {CnReportsModule} from './app/cn-reports/cn-reports.module';
import {clDefaultLang} from '@monorepo/core-lib';
import {CnFrontErrorsModule} from './app/cn-front-errors/cn-front-errors.module';
import {WinstonModule, WinstonModuleOptions} from 'nest-winston';
import {
  blConfigureLogger,
  BlCookieHelper,
  BlJwtConfig,
  BlJwtModule,
  BlLoggerConfig,
  BlMailModule,
  BlMailModuleConfig,
  BlPersistenceLogger,
  BlRequestContextMiddleware
} from '@monorepo/back-core-lib';
import {cnJwtConfig} from './app/cn-auth/cn-jwt.config';
import {Request} from 'express';
import {CnUsersService} from './app/cn-users/cn-users.service';
import {CnDatabaseConfig} from './app/cn-core/model/config/cn-config.class';
import {SnSmartDbModule} from './app/sn-smart-db/sn-smart-db.module';

function typeOrmConfig(configService: CnCoreConfigService): TypeOrmModuleOptions {
  const dbConfig: CnDatabaseConfig = configService.getDatabaseConfig();
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
    logger: BlPersistenceLogger.getInstance(),
    // logging: true // use to enable query logging, the logger must be disabled
  };
}

function configureLogger(configService: CnCoreConfigService): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? null : configService.getLogPath()
  };
  return blConfigureLogger(logConfig);
}

function configureJwtModule(configService: CnCoreConfigService, userService: CnUsersService): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) => BlCookieHelper.getCookieFromHeader(request.headers.cookie, cnJwtConfig.authorizationCookie),
    usersService: userService,
    tokenDurationInSeconds: cnJwtConfig.tokenDurationInSeconds
  };
}

function configureMailModule(configService: CnCoreConfigService): BlMailModuleConfig {
  return {
    mailConfig: configService.getMailConfig(),
    templateFolder: join(__dirname, 'assets/templates/')
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
      inject: [CnCoreConfigService],
      imports: [CnCoreConfigModule]
    }),

    I18nModule.forRoot({
      fallbackLanguage: clDefaultLang,
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, 'assets/i18n/'),
        watch: true //    // enable live translation
      },
    }),

    // Custom module
    CnCoreModule,

    // setup the logging module
    WinstonModule.forRootAsync({
      imports: [CnCoreModule],
      useFactory: configureLogger,
      inject: [CnCoreConfigService],
    }),

    // JwtModule.register({
    //   secret: 'jhkjh',
    // }),

    BlJwtModule.forRootAsync({
      imports: [CnCoreModule, CnUsersModule],
      useFactory: configureJwtModule,
      inject: [CnCoreConfigService, CnUsersService]
    }),

    BlMailModule.forRootAsync({
      imports: [CnCoreModule],
      useFactory: configureMailModule,
      inject: [CnCoreConfigService]
    }),


    // Entities module
    CnUsersModule,
    CnAuthModule,
    CnProjectsModule,
    CnLabsModule,
    CnExperimentsModule,
    CnBricksModule,
    CnGroupsModule,
    CnOrganizationsModule,
    CnLabInstancesModule,
    CnExternalLabsModule,
    CnServersInfoModule,
    CnReportsModule,
    CnFrontErrorsModule,
    SnSmartDbModule,
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
      .apply(BlRequestContextMiddleware)
      .forRoutes({path: '*', method: RequestMethod.ALL});
  }
}
