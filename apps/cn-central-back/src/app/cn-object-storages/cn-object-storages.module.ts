import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnObjectStoragesController} from './cn-object-storages.controller';
import {CnBucketRegion} from './cn-bucket-regions/cn-bucker-region.entity';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnBucket} from './cn-buckets/cn-bucket.entity';
import {CnBucketRegionService} from './cn-bucket-regions/cn-bucket-regions.service';
import {CnBucketCredentialsService} from './cn-bucket-credential/cn-bucket-credentials.service';
import {CnBucketsService} from './cn-buckets/cn-buckets.service';
import {CnObjectStoragesAggregateService} from './cn-object-storages-aggregate.service';
import {CnObjectStoragesSecurity} from './cn-object-storages.security';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnBucketCredentials,
      CnBucketRegion,
      CnBucket
    ]),

    CnCoreModule,
  ],
  providers: [
    CnObjectStoragesAggregateService,
    CnObjectStoragesSecurity,
    CnBucketCredentialsService,
    CnBucketRegionService,
    CnBucketsService,
  ],
  controllers: [
    CnObjectStoragesController
  ],
  exports: [
    CnObjectStoragesAggregateService
  ]
})
export class CnObjectStoragesModule {

}
