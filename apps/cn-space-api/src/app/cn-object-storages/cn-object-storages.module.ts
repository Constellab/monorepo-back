import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnAuthModule } from '../cn-auth/cn-auth.module';
import { CnCloudProvidersModule } from '../cn-cloud-providers/cn-cloud-providers.module';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnBucketCredentials } from './cn-bucket-credential/cn-bucket-credential.entity';
import { CnBucketCredentialsService } from './cn-bucket-credential/cn-bucket-credentials.service';
import { CnBucket } from './cn-buckets/cn-bucket.entity';
import { CnBucketsService } from './cn-buckets/cn-buckets.service';
import { CnObjectStoragesController } from './cn-object-storages.controller';
import { CnObjectStoragesSecurity } from './cn-object-storages.security';
import { CnObjectStoragesAggregateService } from './cn-object-storages-aggregate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnBucketCredentials, CnBucket]),

    CnCoreModule,
    CnCloudProvidersModule,
    CnAuthModule,
  ],
  providers: [
    CnObjectStoragesAggregateService,
    CnObjectStoragesSecurity,
    CnBucketCredentialsService,
    CnBucketsService,
  ],
  controllers: [CnObjectStoragesController],
  exports: [CnObjectStoragesAggregateService, CnBucketsService],
})
export class CnObjectStoragesModule {}
