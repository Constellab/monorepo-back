import { Module } from '@nestjs/common';
import { CnNotesService } from './cn-notes.service';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnNoteEntity } from './cn-note.entity';
import { CnExternalLabApiModule } from '../../cn-external-lab-api/cn-external-lab-api.module';
import { CnLabConfigsModule } from '../../cn-lab-configs/cn-lab-configs.module';
import { CnUsersModule } from '../../cn-users/cn-users.module';
import { CnDocumentModule } from '../cn-documents/cn-document.module';
import { CnHierarchyObjectModule } from '../cn_hierarchy_objects/cn-hierarchy-object.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnNoteEntity]),

    CnCoreModule,
    CnExternalLabApiModule,
    CnLabConfigsModule,
    CnUsersModule,
    CnDocumentModule,
    CnHierarchyObjectModule,
  ],
  providers: [CnNotesService],
  exports: [CnNotesService],
})
export class CnNotesModule {}
