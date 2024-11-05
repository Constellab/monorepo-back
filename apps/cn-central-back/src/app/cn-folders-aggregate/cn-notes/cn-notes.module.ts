import { Module } from '@nestjs/common';
import { CnNotesService } from './cn-notes.service';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnNote } from './cn-note.entity';
import { CnExternalLabApiModule } from '../../cn-external-lab-api/cn-external-lab-api.module';
import { CnLabConfigsModule } from '../../cn-lab-configs/cn-lab-configs.module';
import { CnUsersModule } from '../../cn-users/cn-users.module';
import { CnDocumentModule } from '../cn-documents/cn-document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnNote]),

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
