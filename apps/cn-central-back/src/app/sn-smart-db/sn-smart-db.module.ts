import {Module} from '@nestjs/common';

import {ElasticsearchModule} from '@nestjs/elasticsearch';
import {ElasticsearchModuleOptions} from '@nestjs/elasticsearch/dist/interfaces/elasticsearch-module-options.interface';
import {SnDatabaseConfig} from './model/sn-config.class';
import {SnDocElasticsearchService} from './service/sn-doc-elasticsearch.service';
import {SnDataImporterService} from './service/sn-data-importer.service';
import {SnDocService} from './service/sn-doc.service';
import {CnCoreConfigModule} from '../cn-core/modules/cn-core-config/cn-core-config.module';
import {SnCoreConfigService} from '../cn-core/modules/cn-core-config/sn-core-config.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SnSmartDbEntity} from './model/sn-smart-db.entity';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';
import {SnSmartDbService} from './service/sn-smart-db.service';
import {SnSmartDbController} from './sn-smart-db.controller';

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
    ElasticsearchModule.registerAsync({
      useFactory: elasticSearchConfig,
      inject: [SnCoreConfigService],
      imports: [CnCoreConfigModule]
    }),
    TypeOrmModule.forFeature([SnSmartDbEntity]),
    CnGroupsModule,
  ],
  controllers: [
    SnSmartDbController
  ],
  providers: [
    SnDocService,
    SnDataImporterService,
    SnDocElasticsearchService,
    SnSmartDbService,
  ],
})
export class SnSmartDbModule {
}
