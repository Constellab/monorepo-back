import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCloudProvider } from './cn-cloud-provider.entity';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnCloudProvidersService } from './cn-cloud-providers.service';
import { CnCloudProvidersController } from './cn-cloud-providers.controller';
import { CnCloudProviderRegion } from './cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnCloudProviderRegionService } from './cn-cloud-provider-regions/cn-cloud-provider-regions.service';
import { CnCloudProviderAggregateService } from './cn-cloud-provider-aggregate.service';
import { CnCloudProviderSecurity } from './cn-cloud-provider.security';

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
