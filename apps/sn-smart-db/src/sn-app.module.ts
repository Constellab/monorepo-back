import {Module} from '@nestjs/common';

import {SnAppController} from './app/sn-app.controller';
import {SnAppService} from './app/sn-app.service';
import {ElasticsearchModule} from '@nestjs/elasticsearch';
import {ConfigModule} from '@nestjs/config';
import {join} from 'path';
import {SnCoreConfigService} from './app/core/sn-core-config.service';
import {SnDatabaseConfig} from './app/model/sn-config.class';
import {ElasticsearchModuleOptions} from '@nestjs/elasticsearch/dist/interfaces/elasticsearch-module-options.interface';
import {SnCoreModule} from './app/core/sn-core.module';
import {SnDataImporterService} from './app/sn-data-importer.service';

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
  ],
  controllers: [SnAppController],
  providers: [
    SnAppService,
    SnDataImporterService,
  ],
})
export class SnAppModule {
}
