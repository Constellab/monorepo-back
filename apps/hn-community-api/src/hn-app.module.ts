import {
  blConfigureLogger,
  BlCookieHelper,
  BlDbBackupModule,
  BlExternalApiModule,
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
import { ClassSerializerInterceptor, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Request } from 'express';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { join } from 'path';

import { HnAgentModule } from './app/agent-aggregate/agent/hn-agent.module';
import { HnAgentCoAuthorModule } from './app/agent-aggregate/agent-co-author/hn-agent-co-author.module';
import { HnAgentCoAuthorInviteModule } from './app/agent-aggregate/agent-co-author-invite/hn-agent-co-author-invite.module';
import { HnAgentVersionModule } from './app/agent-aggregate/agent-version/hn-agent-version.module';
import { HnAgentVersionBrickDependenciesModule } from './app/agent-aggregate/agent-version-brick-dependencies/hn-agent-version-brick-dependencies.module';
import { HnAgentAggregateModule } from './app/agent-aggregate/hn-agent-aggregate.module';
import { HnAuthModule } from './app/auth/hn-auth.module';
import { hnJwtConfig } from './app/auth/hn-jwt.config';
import { HnBrickModule } from './app/brick-aggregate/brick/hn-brick.module';
import { HnBrickMajorVersionModule } from './app/brick-aggregate/brick-major-version/hn-brick-major-version.module';
import { HnBrickUserModule } from './app/brick-aggregate/brick-user/hn-brick-user.module';
import { HnBrickUserInviteModule } from './app/brick-aggregate/brick-user-invite/hn-brick-user-invite.module';
import { HnBrickVersionModule } from './app/brick-aggregate/brick-version/hn-brick-version.module';
import { HnDocumentationModule } from './app/brick-aggregate/documentation/hn-documentation.module';
import { HnFolderModule } from './app/brick-aggregate/folder/hn-folder.module';
import { HnBrickAggregateModule } from './app/brick-aggregate/hn-brick-aggregate.module';
import { HnBrickVersionReferenceModule } from './app/brick-version-reference/hn-brick-version-reference.module';
import { HnCommentAgentModule } from './app/comment-aggregate/comment-agent/hn-comment-agent.module';
import { HnCommentAppModule } from './app/comment-aggregate/comment-app/hn-comment-app.module';
import { HnCommentPartnerModule } from './app/comment-aggregate/comment-partner/hn-comment-partner.module';
import { HnCommentStoryModule } from './app/comment-aggregate/comment-story/hn-comment-story.module';
import { HnCommentTagModule } from './app/comment-aggregate/comment-tag/hn-comment-tag.module';
import { HnCommentAggregateModule } from './app/comment-aggregate/hn-comment-aggregate.module';
import { HnCommunityAppModule } from './app/community-app-aggregate/community-app/hn-community-app.module';
import { HnCommunityAppCoAuthorModule } from './app/community-app-aggregate/community-app-co-author/hn-community-app-co-author.module';
import { HnCommunityAppCoAuthorInviteModule } from './app/community-app-aggregate/community-app-co-author-invite/hn-community-app-co-author-invite.module';
import { HnCommunityAppStatModule } from './app/community-app-aggregate/community-app-stat/hn-community-app-stat.module';
import { HnCommunityAppUserModule } from './app/community-app-aggregate/community-app-user/hn-community-app-user.module';
import { HnCommunityAppAggregateModule } from './app/community-app-aggregate/hn-community-app-aggregate.module';
import { HnCoreExceptionHandlerFilter } from './app/core/filters/hn-core-exception-handler.filter';
import { HnIsAdminGuard } from './app/core/guards/hn-is-admin.guard';
import { HnJwtAuthGuard } from './app/core/guards/hn-jwt-auth.guard';
import { HnCoreModule } from './app/core/hn-core.module';
import { HnLogRequestMiddleware } from './app/core/middleware/hn-log-request-middleware.service';
import { HnDatabaseConfig } from './app/core/model/config/hn-database-config.class';
import { HnMailConfig } from './app/core/model/config/hn-mail.config';
import { HnCoreConfigModule } from './app/core/modules/core-config/hn-core-config.module';
import { HnCoreConfigService } from './app/core/modules/core-config/hn-core-config.service';
import { HnCurrentUserHelper } from './app/core/utils/hn-current-user.helper';
import { HnDifyModule } from './app/dify/hn-dify.module';
import { HnFileAgentModule } from './app/file-aggregate/file-agent/hn-file-agent.module';
import { HnFileAppModule } from './app/file-aggregate/file-app/hn-file-app.module';
import { HnFileDocumentationModule } from './app/file-aggregate/file-documentation/hn-file-documentation.module';
import { HnFilePartnerModule } from './app/file-aggregate/file-partner/hn-file-partner.module';
import { HnFileStoryModule } from './app/file-aggregate/file-story/hn-file-story.module';
import { HnFileAggregateModule } from './app/file-aggregate/hn-file-aggregate.module';
import { HnIconModule } from './app/icon/hn-icon.module';
import { HnLikeAggregateModule } from './app/like-aggregate/hn-like-aggregate.module';
import { HnLikeAgentModule } from './app/like-aggregate/like-agent/hn-like-agent.module';
import { HnLikeAppModule } from './app/like-aggregate/like-app/hn-like-app.module';
import { HnLikeBrickModule } from './app/like-aggregate/like-brick/hn-like-brick.module';
import { HnLikePartnerModule } from './app/like-aggregate/like-partner/hn-like-partner.module';
import { HnLikeStoryModule } from './app/like-aggregate/like-story/hn-like-story.module';
import { HnLikeTagModule } from './app/like-aggregate/like-tag/hn-like-tag.module';
import { HnPartnerModule } from './app/partner/hn-partner.module';
import { HnProtocolModule } from './app/protocol/hn-protocol.module';
import { HnPublicModule } from './app/public/hn-public.module';
import { HnResourceModule } from './app/resource/hn-resource.module';
import { HnRunStatAgModule } from './app/run-stat-aggregate/hn-run-stat-ag.module';
import { HnRunStatModule } from './app/run-stat-aggregate/run-stat/hn-run-stat.module';
import { HnRunStatAggregateModule } from './app/run-stat-aggregate/run-stat-aggregate/hn-run-stat-aggregate.module';
import { HnSpaceAggregateModule } from './app/space-aggregate/hn-space-aggregate.module';
import { HnSpaceModule } from './app/space-aggregate/space/hn-space.module';
import { HnSpaceUserModule } from './app/space-aggregate/space-user/hn-space-user.module';
import { HnStoryModule } from './app/story/hn-story.module';
import { HnStoryAuthorModule } from './app/story-author/hn-story-author.module';
import { HnStoryAuthorInviteModule } from './app/story-author-invite/hn-story-author-invite.module';
import { HnTagAggregateModule } from './app/tag-aggregate/hn-tag-aggregate.module';
import { HnTagCoAuthorModule } from './app/tag-aggregate/tag-co-author/hn-tag-co-author.module';
import { HnTagCoAuthorInviteModule } from './app/tag-aggregate/tag-co-author-invite/hn-tag-co-author-invite.module';
import { HnTagKeyModule } from './app/tag-aggregate/tag-key/hn-tag-key.module';
import { HnTagValueModule } from './app/tag-aggregate/tag-value/hn-tag-value.module';
import { HnTaskModule } from './app/task/hn-task.module';
import { HnTechnicalDocOtherClassModule } from './app/technical-doc-other-class/hn-technical-doc-other-class.module';
import { HnTechnicalFolderModule } from './app/technical-folder/hn-technical-folder.module';
import { HnTopicModule } from './app/topic/hn-topic.module';
import { HnUserModule } from './app/users/hn-user.module';
import { HnUserService } from './app/users/hn-user.service';
import { HnRagflowChatbotModule } from './app/ragflow-chatbot/hn-ragflow-chatbot.module';

function typeOrmConfig(configService: HnCoreConfigService): TypeOrmModuleOptions {
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
    bigNumberStrings: false,
    charset: 'utf8mb4',
  };
}

function configureLogger(configService: HnCoreConfigService): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? null : configService.getLogPath(),
  };
  return blConfigureLogger(logConfig);
}

function configureJwtModule(configService: HnCoreConfigService, userService: HnUserService): BlJwtConfig {
  return {
    jwtSecret: configService.getJwtSecret(),
    jwtFromRequest: (request: Request) => {
      return (
        request.headers.authorization ??
        BlCookieHelper.getCookieFromHeader(request.headers.cookie, hnJwtConfig.authorizationCookie)
      );
    },
    usersService: userService,
    tokenDurationInSeconds: hnJwtConfig.tokenDurationInSeconds,
  };
}

function configureTransportModule(configService: HnCoreConfigService): BlTransportModuleConfig {
  return configService.getTransportModuleConfig();
}

// configure the text editor
TeRichTextModifications.setBackTimeDifference();

@Module({
  imports: [
    // let the config module on top of the imports
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, 'environments', 'hn-dev.env'),
    }),

    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [HnCoreConfigService],
      imports: [HnCoreConfigModule],
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
        { use: CookieResolver, options: 'lang' },
        AcceptLanguageResolver,
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

    BullModule.forRootAsync(
      blTransportRedisForRoot({
        useFactory: configureTransportModule,
        imports: [HnCoreModule],
        inject: [HnCoreConfigService],
      })
    ),

    BlTranslateModule.forRoot({
      getCurrentUserLang: () => HnCurrentUserHelper.getCurrentUser()?.lang ?? null,
    }),

    BlMailModule.forRootAsync(
      HnMailConfig.configureMailModule(),
      HnMailConfig.queueName,
      HnMailConfig.mailServiceType,
      HnMailConfig.processorType,
      HnMailConfig.currentUserIsAdmin
    ),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    HnCoreModule,
    BlObjectStorageModule,
    BlDbBackupModule,

    BlExternalApiModule,

    HnUserModule,
    HnSpaceModule,
    HnSpaceUserModule,
    HnSpaceAggregateModule,

    HnDocumentationModule,
    HnBrickModule,
    HnBrickVersionModule,
    HnBrickMajorVersionModule,
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
    HnTechnicalDocOtherClassModule,

    HnAgentModule,
    HnAgentVersionModule,
    HnAgentVersionBrickDependenciesModule,
    HnAgentCoAuthorInviteModule,
    HnAgentCoAuthorModule,
    HnAgentAggregateModule,

    HnIconModule,

    HnLikeAggregateModule,
    HnLikeStoryModule,
    HnLikeAgentModule,
    HnLikeBrickModule,
    HnLikeAppModule,
    HnLikeTagModule,
    HnLikePartnerModule,

    HnCommentAggregateModule,
    HnCommentStoryModule,
    HnCommentAgentModule,
    HnCommentAppModule,
    HnCommentTagModule,
    HnCommentPartnerModule,

    HnFileAggregateModule,
    HnFileStoryModule,
    HnFileDocumentationModule,
    HnFileAgentModule,
    HnFileAppModule,
    HnFilePartnerModule,

    HnRunStatAgModule,
    HnRunStatModule,
    HnRunStatAggregateModule,

    HnCommunityAppModule,
    HnCommunityAppStatModule,
    HnCommunityAppAggregateModule,
    HnCommunityAppUserModule,
    HnCommunityAppCoAuthorInviteModule,
    HnCommunityAppCoAuthorModule,

    HnTagValueModule,
    HnTagKeyModule,
    HnTagCoAuthorModule,
    HnTagCoAuthorInviteModule,
    HnTagAggregateModule,

    HnPublicModule,

    HnPartnerModule,

    HnDifyModule,

    HnRagflowChatbotModule,
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
    },
  ],
})
export class HnAppModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      // register the RequestContextMiddleware to be able to access the request anywhere
      .apply(BlRequestContextMiddleware, HnLogRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
