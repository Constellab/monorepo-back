import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnFileDocumentation } from './hn-file-documentation.entity';
import { HnFileDocumentationService } from './hn-file-documentation.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnFileDocumentation]), HnCoreModule],
  exports: [TypeOrmModule, HnFileDocumentationService],
  providers: [HnFileDocumentationService],
})
export class HnFileDocumentationModule {}
