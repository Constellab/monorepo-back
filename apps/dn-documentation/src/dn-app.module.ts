import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DatabaseConfig } from './app/core/model/database-config.class';
import { CoreConfigModule } from './app/core/modules/core-config/core-config.module';
import { CoreConfigService } from './app/core/modules/core-config/core-config.service';
import { DocumentationModule } from './app/documentation/dn-documentation.module';
import { VersionModule } from './app/version/dn-version.module';

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
      inject: [CoreConfigService],
      imports: [CoreConfigModule]
    }),

    DocumentationModule,
    VersionModule
  ],
  controllers: [],
  providers: [
    // set global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ]
})
export class AppModule {
}
