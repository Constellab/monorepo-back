import {Module} from '@nestjs/common';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnProjectsModule} from '../cn-projects/cn-projects.module';
import {CnProjectDocument} from './cn-project-document.entity';
import {CnProjectDocumentService} from './cn-project-document.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectDocument]),

    CnCoreModule,
    CnProjectsModule,
  ],
  providers: [CnProjectDocumentService],
  exports: [CnProjectDocumentService]
})
export class CnProjectDocumentModule {
}
