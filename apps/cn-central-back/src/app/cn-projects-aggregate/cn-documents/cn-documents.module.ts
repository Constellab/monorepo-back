import {Module} from '@nestjs/common';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnDocumentsService} from './cn-documents.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnDocument} from './cn-document.entity';
import {CnProjectBucketModule} from '../cn-project-bucket/cn-project-bucket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnDocument]),

    CnCoreModule,
    CnProjectBucketModule,
  ],
  providers: [CnDocumentsService],
  exports: [CnDocumentsService]
})
export class CnDocumentsModule {
}
