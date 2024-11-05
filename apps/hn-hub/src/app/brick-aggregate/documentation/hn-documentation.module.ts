import { Module } from '@nestjs/common';
import { HnDocumentationService } from './hn-documentation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnDocumentation } from './hn-documentation.entity';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnDocumentationFileModule } from '../documentation-file/hn-documentation-file.module';
import { HnDocumentationFileService } from '../documentation-file/hn-documentation-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnDocumentation]), HnCoreModule, HnDocumentationFileModule],
  exports: [TypeOrmModule, HnDocumentationService],
  providers: [HnDocumentationService, HnDocumentationFileService],
})
export class HnDocumentationModule {}
