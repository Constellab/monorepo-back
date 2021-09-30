import { Module } from '@nestjs/common';
import { DnDocumentationService } from './dn-documentation.service';
import { DnDocumentationController } from './dn-documentation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnDocumentation } from './dn-documentation.entity';
import { DnVersionModule } from '../version/dn-version.module';
import { DnVersionService } from '../version/dn-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([DnDocumentation]), DnVersionModule],
  exports: [TypeOrmModule],
  controllers: [DnDocumentationController],
  providers: [DnDocumentationService, DnVersionService]
})
export class DocumentationModule {}
