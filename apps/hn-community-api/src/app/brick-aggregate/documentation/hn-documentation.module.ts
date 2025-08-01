import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnDocumentation } from './hn-documentation.entity';
import { HnDocumentationService } from './hn-documentation.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnDocumentation]), HnCoreModule],
  exports: [TypeOrmModule, HnDocumentationService],
  providers: [HnDocumentationService],
})
export class HnDocumentationModule {}
