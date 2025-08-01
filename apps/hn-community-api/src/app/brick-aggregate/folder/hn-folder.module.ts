import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnDocumentationModule } from '../documentation/hn-documentation.module';
import { HnFolder } from './hn-folder.entity';
import { HnFolderService } from './hn-folder.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnFolder]), HnDocumentationModule, HnCoreModule],
  exports: [TypeOrmModule, HnFolderService],
  providers: [HnFolderService],
})
export class HnFolderModule {}
