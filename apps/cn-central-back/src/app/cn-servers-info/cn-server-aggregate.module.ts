import {Module} from '@nestjs/common';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnServerController} from './cn-server.controller';
import {CnServerPriceModule} from './server-price/cn-server-price.module';
import {CnServerCloudModule} from './server-cloud/cn-server-cloud.module';
import {CnServerAggregateService} from './cn-server-aggregate.service';
import {CnCloudProvidersModule} from '../cn-cloud-providers/cn-cloud-providers.module';
import {CnServerStandardModule} from './server-standard/cn-server-standard.module';
import {CnStoragePriceModule} from './storage-price/cn-storage-price.module';

@Module({
  imports: [
    CnCoreModule,

    CnServerCloudModule,
    CnServerPriceModule,
    CnServerStandardModule,
    CnStoragePriceModule,

    CnCloudProvidersModule,
  ],
  providers: [CnServerAggregateService],
  controllers: [CnServerController]
})
export class CnServerAggregateModule {
}
