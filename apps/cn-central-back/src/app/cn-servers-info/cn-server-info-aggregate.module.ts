import {Module} from '@nestjs/common';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnServersInfoController} from './cn-servers-info.controller';
import {CnServerInfoPriceModule} from './price/cn-server-info-price.module';
import {CnServersInfoModule} from './server-info/cn-servers-info.module';
import {CnServerInfoAggregateService} from './cn-server-info-aggregate.service';
import {CnCloudProvidersModule} from '../cn-cloud-providers/cn-cloud-providers.module';

@Module({
  imports: [
    CnCoreModule,

    CnServersInfoModule,
    CnServerInfoPriceModule,

    CnCloudProvidersModule,
  ],
  providers: [CnServerInfoAggregateService],
  controllers: [CnServersInfoController]
})
export class CnServerInfoAggregateModule {
}
