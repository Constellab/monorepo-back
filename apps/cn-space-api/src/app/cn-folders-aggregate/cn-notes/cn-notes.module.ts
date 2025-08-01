import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnExternalLabApiModule } from '../../cn-external-lab-api/cn-external-lab-api.module';
import { CnLabConfigsModule } from '../../cn-lab-configs/cn-lab-configs.module';
import { CnUsersModule } from '../../cn-users/cn-users.module';
import { CnDocumentModule } from '../cn-documents/cn-document.module';
import { CnNoteEntity } from './cn-note.entity';
import { CnNotesService } from './cn-notes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnNoteEntity]),

    CnCoreModule,
    CnExternalLabApiModule,
    CnLabConfigsModule,
    CnUsersModule,
    CnDocumentModule,
  ],
  providers: [CnNotesService],
  exports: [CnNotesService],
})
export class CnNotesModule {}
