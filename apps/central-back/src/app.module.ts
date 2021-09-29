import {ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {UsersModule} from './app/users/users.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from './app/auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import {CoreModule} from './app/core/core.module';
import {ProjectsModule} from './app/projects/projects.module';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {CoreConfigService} from './app/core/modules/core-config/core-config.service';
import {TypeOrmModuleOptions} from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import {DatabaseConfig} from './app/core/model/config/database-config.class';
import {CoreConfigModule} from './app/core/modules/core-config/core-config.module';
import {I18nJsonParser, I18nModule} from 'nestjs-i18n';
import {join} from 'path';
import {LabsModule} from './app/labs/labs.module';
import {ExperimentsModule} from './app/experiments/experiments.module';
import {BricksModule} from './app/bricks/bricks.module';
import {GroupsModule} from './app/groups/groups.module';
import {OrganizationsModule} from './app/organizations/organizations.module';
import {LabInstancesModule} from './app/lab-instances/lab-instances.module';
import {JwtAuthGuard} from './app/core/guards/jwt-auth.gaurd';
import {UserCategoryGuard} from './app/core/guards/user-category.guard';
import {ExternalLabsModule} from './app/external-labs/external-labs.module';
import {ServersInfoModule} from './app/servers-info/servers-info.module';
import {CustomExceptionHandlerFilter} from './app/core/filters/core-exception-handler.filter';
import {StudiesModule} from './app/studies/studies.module';
import {ReportsModule} from './app/reports/reports.module';
import {clDefaultLang} from '@monorepo/core-lib';
import {FrontErrorsModule} from './app/front-errors/front-errors.module';
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
import {jwtConfig} from './app/auth/jwt.config';
import {Request} from 'express';
import {UsersService} from './app/users/users.service';

function typeOrmConfig(configService: CoreConfigService): TypeOrmModuleOptions {
  const dbConfig: DatabaseConfig = configService.getDatabaseConfig();
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
    logger: BlPersistenceLogger.getInstance()
  };
}

function configureLogger(configService: CoreConfigService): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? null : configService.getLogPath()
  };
  return blConfigureLogger(logConfig);
}

function configureJwtModule(configService: CoreConfigService, userService: UsersService): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) => BlCookieHelper.getCookieFromHeader(request.headers.cookie, jwtConfig.authorizationCookie),
    usersService: userService
  };
}

function configureMailModule(configService: CoreConfigService): BlMailModuleConfig {
  return configService.getMailConfig();
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
      inject: [CoreConfigService],
      imports: [CoreConfigModule]
    }),

    I18nModule.forRoot({
      fallbackLanguage: clDefaultLang,
      parser: I18nJsonParser,
      parserOptions: {
        watch: true //    // enable live translation
      },
    }),

    // Custom module
    CoreModule,

    // setup the logging module
    WinstonModule.forRootAsync({
      imports: [CoreModule],
      useFactory: configureLogger,
      inject: [CoreConfigService],
    }),

    BlJwtModule.forRootAsync({
      imports: [CoreModule, UsersModule],
      useFactory: configureJwtModule,
      inject: [CoreConfigService, UsersService]
    }),
    BlMailModule.forRootAsync({
      imports: [CoreModule],
      useFactory: configureMailModule,
      inject: [CoreConfigService]
    }),


    // Entities module
    UsersModule,
    AuthModule,
    ProjectsModule,
    LabsModule,
    ExperimentsModule,
    BricksModule,
    GroupsModule,
    OrganizationsModule,
    LabInstancesModule,
    ExternalLabsModule,
    ServersInfoModule,
    StudiesModule,
    ReportsModule,
    FrontErrorsModule,
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
      useClass: CustomExceptionHandlerFilter,
    },

    // set global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserCategoryGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      // register the RequestContextMiddleware to be able to access the request anywhere
      .apply(BlRequestContextMiddleware)
      .forRoutes({path: '*', method: RequestMethod.ALL});
  }
}
