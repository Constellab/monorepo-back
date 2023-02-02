import {Module} from '@nestjs/common';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnObjectStoragesModule} from '../../cn-object-storages/cn-object-storages.module';
import {CnDocumentsService} from './cn-documents.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnDocument} from './cn-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnDocument]),

    CnCoreModule,
    CnObjectStoragesModule,
  ],
  providers: [CnDocumentsService],
  exports: [CnDocumentsService]
})
export class CnDocumentsModule {
}
