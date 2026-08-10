import {
  blConfigureLogger,
  BlCookieHelper,
  BlDbBackupModule,
  BlJwtAsymmetricConfig,
  BlJwtAsymmetricModule,
  BlJwtConfig,
  BlJwtModule,
  BlLoggerConfig,
  BlMailModule,
  BlNamingStrategy,
  BlOAuthServerConfig,
  BlOAuthServerModule,
  BlObjectStorageModule,
  BlRedisConfig,
  BlRedisModule,
  BlRequestContextMiddleware,
  BlResourceServerConfig,
  BlResourceServerModule,
  blStripTrailingSlashes,
  BlTimeoutInterceptor,
  BlTranslateModule,
  BlTransportModuleConfig,
  blTransportRedisForRoot,
} from '@monorepo/back-core-lib';
import { CL_DEFAULT_LANG } from '@monorepo/core-lib';
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
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { Request } from 'express';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { I18nAbstractLoaderOptions } from 'nestjs-i18n/dist/loaders/i18n.abstract.loader';
import { join } from 'path';

import { CnAppService } from './app.service';
import { CnActivityModule } from './app/cn-activity/cn-activity.module';
import { CnAuthModule } from './app/cn-auth/cn-auth.module';
import { CN_JWT_CONFIG } from './app/cn-auth/cn-jwt.config';
import { CnBricksModule } from './app/cn-bricks/cn-bricks.module';
import { CnCityModule } from './app/cn-city/cn-city.module';
import { CnCloudProvidersModule } from './app/cn-cloud-providers/cn-cloud-providers.module';
import { CnCommunityModule } from './app/cn-community/cn-community.module';
import { CnCoreModule } from './app/cn-core/cn-core.module';
import { CnHealthController } from './app/cn-core/cn-health.controller';
import { CnCoreExceptionHandlerFilter } from './app/cn-core/filters/cn-core-exception-handler.filter';
import { CnJwtAuthGuard } from './app/cn-core/guards/cn-jwt-auth.guard';
import { CnUserCategoryGuard } from './app/cn-core/guards/cn-user-category-guard.service';
import { CnLogRequestMiddleware } from './app/cn-core/middleware/cn-log-request-middleware.service';
import { CN_ENVIRONMENT_PROFILE_KEY, CnDatabaseConfig } from './app/cn-core/model/config/cn-config.class';
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
import { CnOAuthModule } from './app/cn-oauth/cn-oauth.module';
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
    namingStrategy: new BlNamingStrategy(),
    // typeorm 1.0 throws on undefined values in where conditions
    // by default; restore pre-1.0 behavior of skipping them
    invalidWhereValuesBehavior: { undefined: 'ignore' },
    // keep pooled connections alive so MySQL/proxy don't close them
    // while idle, which caused "Connection lost: The server closed the
    // connection" on the first request after an idle period
    extra: {
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      // recycle connections before MySQL's wait_timeout can kill them
      idleTimeout: 60000,
      // fail fast instead of hanging if the pool is exhausted
      connectTimeout: 10000,
    },
  };
}

function configureLogger(configService: CnCoreConfigService): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? '' : configService.getLogPath(),
  };
  return blConfigureLogger(logConfig);
}

function configureJwtModule(configService: CnCoreConfigService, userService: CnUsersService): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) =>
      BlCookieHelper.getCookieFromHeader(request.headers.cookie ?? '', CN_JWT_CONFIG.authorizationCookie),
    usersService: userService,
    // Module-wide fallback, for a caller that mints a token without stating a lifetime.
    // Login, 2FA and refresh all state their own, so this only ever applies to a future
    // one — and it is the short access token lifetime, not something longer.
    tokenDurationInSeconds: configService.getAccessTokenDurationInSeconds(),
  };
}

/**
 * Key material for MCP access tokens, which are the only tokens here signed
 * asymmetrically — they are the only ones another application has to verify.
 *
 * Reading `MCP_JWT_PRIVATE_KEY_BASE64` throws when it is absent, and `BlJwtKeyStore`
 * throws when it is present but unusable. Both happen while Nest builds the injector, so
 * a bad key stops the process rather than turning into every MCP call being rejected.
 */
function configureJwtAsymmetricModule(configService: CnCoreConfigService): BlJwtAsymmetricConfig {
  return {
    privateKeyBase64: configService.getMcpJwtPrivateKeyBase64(),
    previousPrivateKeyBase64: configService.getMcpJwtPreviousPrivateKeyBase64(),
  };
}

/**
 * What this application protects as a Resource Server, and where a client is sent to get
 * a token for it.
 *
 * One Resource, the empty path, which names the API's own base URL: this application is a
 * Resource Server for its own endpoints, and that is the Resource the CLI asks a token
 * for. An MCP endpoint here is a Resource of its own and registers its own path — see
 * `HN_MCP_COMMUNITY_DOC_RESOURCE_PATH` in the Community for the shape.
 *
 * `authorizationServerUrl` is this host because this application is now the Authorization
 * Server (ADR-0001). It is still named separately from `baseUrl`: the two answer different
 * questions, and the Community sets the same field to this host without being it.
 */
function configureResourceServerModule(configService: CnCoreConfigService): BlResourceServerConfig {
  return {
    baseUrl: configService.getApiUrl(),
    authorizationServerUrl: configService.getApiUrl(),
    resourcePaths: [''],
  };
}

/**
 * What this application states as the Authorization Server it hosts.
 *
 * Configuration is the whole of it, plus the current-user resolver `CnOAuthModule`
 * supplies: the endpoints, the stores and the grant logic are `bl-oauth-server`'s.
 *
 * The issuer is the API's own base URL because RFC 8414 requires it to equal the URL
 * serving the discovery document — and because a client records it at registration, so it
 * cannot be changed without invalidating what every client holds.
 *
 * `frontLoginUrl` is the shared login page, without a Space subdomain: a machine client
 * approving a Grant is not in a Space, and per ADR-0003 the Grant spans all of them.
 */
function configureOAuthServerModule(configService: CnCoreConfigService): BlOAuthServerConfig {
  return {
    issuer: configService.getApiUrl(),
    frontLoginUrl: `${blStripTrailingSlashes(configService.getFrontBaseUrl())}/login`,
    allowedRedirectUris: configService.getOAuthAllowedRedirectUris(),
    mcpAccessTokenDurationInSeconds: configService.getMcpAccessTokenDurationInSeconds(),
  };
}

function configureTransportModule(configService: CnCoreConfigService): BlTransportModuleConfig {
  return configService.getTransportModuleConfig();
}

/**
 * Reuses the queue connection details (BullMQ already needs a Redis instance) and
 * namespaces the keys, so sharing one server with the Community stays safe.
 */
function configureRedisModule(configService: CnCoreConfigService): BlRedisConfig {
  return { ...configService.getTransportModuleConfig(), keyPrefix: 'cn:' };
}

// configure the text editor
TeRichTextModifications.setBackTimeDifference();

@Module({
  imports: [
    // let the config module on top of the imports
    ConfigModule.forRoot({
      isGlobal: true,
      // pick the env file matching the current profile (cn-test.env for e2e tests,
      // which points at a throwaway database that gets dropped/recreated)
      envFilePath: join(
        __dirname,
        'environments',
        process.env[CN_ENVIRONMENT_PROFILE_KEY] === 'test' ? 'cn-test.env' : 'cn-dev.env'
      ),
    }),

    CnCoreConfigModule.forRoot({ distFolder: join(__dirname) }),

    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [CnCoreConfigService],
    }),

    I18nModule.forRoot({
      fallbackLanguage: CL_DEFAULT_LANG,
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

    // The asymmetric path, alongside the symmetric one rather than inside it: Session
    // tokens and MCP access tokens deliberately do not share a key.
    BlJwtAsymmetricModule.forRootAsync({
      useFactory: configureJwtAsymmetricModule,
      inject: [CnCoreConfigService],
    }),

    // The Resource Server half of OAuth: the Resources this application serves and their
    // discovery documents. Registered here rather than inside a feature module because it
    // is global — the Authorization Server reads the same registry, so the audience
    // written into a token and the audience checked against it come from one list.
    BlResourceServerModule.forRootAsync({
      useFactory: configureResourceServerModule,
      inject: [CnCoreConfigService],
    }),

    // The Authorization Server half: registration, /authorize, /token, /revoke and the
    // authorization server discovery document. There is exactly one of these across the
    // two applications and it is this one (ADR-0001). `CnOAuthModule` is imported for the
    // two tokens the library cannot resolve itself — the current-user resolver and this
    // application's refresh token service.
    BlOAuthServerModule.forRootAsync({
      imports: [CnOAuthModule],
      useFactory: configureOAuthServerModule,
      inject: [CnCoreConfigService],
    }),

    // The client and code stores are Redis-backed, so a registration made against one
    // replica resolves from every other.
    BlRedisModule.forRootAsync({
      useFactory: configureRedisModule,
      inject: [CnCoreConfigService],
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

    // Global ceiling for every route carrying @BlPublicSecure().
    // `ttl` is in MILLISECONDS since throttler v5.
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 60,
        },
      ],
    }),

    // configure the multer module to accept field up to 25MB
    // to prevent error "Field value too long"
    // configure the multer module to accept files up to 100MB
    MulterModule.register({
      limits: { fieldSize: 25 * 1024 * 1024, fileSize: 100 * 1024 * 1024 },
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
  controllers: [CnHealthController],
  providers: [
    CnAppService,
    // set global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // set global timeout interceptor (30 seconds default)
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => new BlTimeoutInterceptor(reflector, 30000),
      inject: [Reflector],
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
      .forRoutes({ path: '*splat', method: RequestMethod.ALL });
  }
}
