import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnObjectStoragesController} from './cn-object-storages.controller';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnBucket} from './cn-buckets/cn-bucket.entity';
import {CnBucketCredentialsService} from './cn-bucket-credential/cn-bucket-credentials.service';
import {CnBucketsService} from './cn-buckets/cn-buckets.service';
import {CnObjectStoragesAggregateService} from './cn-object-storages-aggregate.service';
import {CnObjectStoragesSecurity} from './cn-object-storages.security';
import {CnCloudProvidersModule} from '../cn-cloud-providers/cn-cloud-providers.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnBucketCredentials,
      CnCloudProviderRegion,
      CnBucket
    ]),

    CnCoreModule,
    CnCloudProvidersModule,
  ],
  providers: [
    CnObjectStoragesAggregateService,
    CnObjectStoragesSecurity,
    CnBucketCredentialsService,
    CnBucketsService,
  ],
  controllers: [
    CnObjectStoragesController
  ],
  exports: [
    CnObjectStoragesAggregateService,
    CnBucketsService,
  ]
})
export class CnObjectStoragesModule {

}
