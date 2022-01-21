import {Module} from '@nestjs/common';

import {SnAppController} from './app/sn-app.controller';
import {SnDocService} from './app/sn-doc.service';
import {ElasticsearchModule} from '@nestjs/elasticsearch';
import {ConfigModule} from '@nestjs/config';
import {join} from 'path';
import {SnCoreConfigService} from './app/core/sn-core-config.service';
import {SnDatabaseConfig} from './app/model/sn-config.class';
import {ElasticsearchModuleOptions} from '@nestjs/elasticsearch/dist/interfaces/elasticsearch-module-options.interface';
import {SnCoreModule} from './app/core/sn-core.module';
import {SnDataImporterService} from './app/sn-data-importer.service';
import {WinstonModuleOptions} from 'nest-winston';
import {blConfigureLogger, BlLoggerConfig} from '@monorepo/back-core-lib';
import {SnDocElasticsearchService} from './app/sn-doc-elasticsearch.service';

function elasticSearchConfig(configService: SnCoreConfigService): ElasticsearchModuleOptions {
  const dbConfig: SnDatabaseConfig = configService.getDatabaseConfig();
  return {
    node: dbConfig.node,
    auth: {
      username: dbConfig.username,
      password: dbConfig.password,
    }
  };
}

function configureLogger(configService: SnCoreConfigService): WinstonModuleOptions {
  const logConfig: BlLoggerConfig = {
    logLevel: configService.getLogLevel(),
    logFilePath: configService.isLocal() ? null : configService.getLogPath()
  };
  return blConfigureLogger(logConfig);
}


@Module({
  imports: [
    // let the config module on top of the imports
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, 'environments', 'dev.env'),
    }),

    SnCoreModule,

    ElasticsearchModule.registerAsync({
      useFactory: elasticSearchConfig,
      inject: [SnCoreConfigService],
      imports: [SnCoreModule]
    }),

    // set up the logging module
    // WinstonModule.forRootAsync({
    //   imports: [SnCoreModule],
    //   useFactory: configureLogger,
    //   inject: [SnCoreConfigService],
    // }),
  ],
  controllers: [SnAppController],
  providers: [
    SnDocService,
    SnDataImporterService,
    SnDocElasticsearchService,
  ],
})
export class SnAppModule {
}
