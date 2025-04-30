import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnDocumentationFileService } from './hn-documentation-file.service';
import { HnDocumentationFile } from './hn-documentation-file.entity';
import { HnCoreModule } from '../../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnDocumentationFile]), HnCoreModule],
  exports: [TypeOrmModule],
  providers: [HnDocumentationFileService],
})
export class HnDocumentationFileModule {}
