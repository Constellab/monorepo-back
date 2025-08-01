import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnCloudProvider } from './cn-cloud-provider.entity';
import { CnCloudProviderSecurity } from './cn-cloud-provider.security';
import { CnCloudProviderAggregateService } from './cn-cloud-provider-aggregate.service';
import { CnCloudProviderRegion } from './cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnCloudProviderRegionService } from './cn-cloud-provider-regions/cn-cloud-provider-regions.service';
import { CnCloudProvidersController } from './cn-cloud-providers.controller';
import { CnCloudProvidersService } from './cn-cloud-providers.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnCloudProvider, CnCloudProviderRegion]), CnCoreModule],
  providers: [
    CnCloudProvidersService,
    CnCloudProviderRegionService,
    CnCloudProviderAggregateService,
    CnCloudProviderSecurity,
  ],
  exports: [CnCloudProviderAggregateService],
  controllers: [CnCloudProvidersController],
})
export class CnCloudProvidersModule {}
