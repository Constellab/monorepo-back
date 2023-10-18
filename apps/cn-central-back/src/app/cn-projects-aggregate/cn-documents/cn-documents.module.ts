import {Module} from '@nestjs/common';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnDocumentsService} from './cn-documents.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnDocument} from './cn-document.entity';
import {CnProjectsModule} from '../cn-projects/cn-projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnDocument]),

    CnCoreModule,
    CnProjectsModule,
  ],
  providers: [CnDocumentsService],
  exports: [CnDocumentsService]
})
export class CnDocumentsModule {
}
